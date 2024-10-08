import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { useAuth } from './useAuth';

export interface Transaction {
  id: string;
  amount: number;
  customerName: string;
  notes: string;
  date: string;
  // Add any other fields that your transactions have
}

// Add this new interface for the transaction data
interface TransactionData {
  amount: number;
  customerName: string;
  notes: string;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const transactionsRef = collection(db, 'transactions');
    let q;

    if (user.role === 'admin') {
      q = query(transactionsRef, where('userId', '==', user.uid), orderBy('date', 'desc'));
    } else if (user.role === 'employee' && user.adminId) {
      // For employees, fetch transactions where adminId matches their adminId
      q = query(transactionsRef, where('adminId', '==', user.adminId), orderBy('date', 'desc'));
    } else {
      // If neither admin nor employee with adminId, don't fetch any transactions
      setTransactions([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      setTransactions(transactionsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const addTransaction = async (transactionData: TransactionData) => {
    if (!user) return;

    const newTransaction = {
      ...transactionData,
      userId: user.uid,
      adminId: user.role === 'admin' ? user.uid : user.adminId,
      date: serverTimestamp()
    };

    await addDoc(collection(db, 'transactions'), newTransaction);
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user || user.role !== 'admin') return;

    await deleteDoc(doc(db, 'transactions', transactionId));
  };

  return { transactions, loading, addTransaction, deleteTransaction };
}