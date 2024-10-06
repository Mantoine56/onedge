import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, Timestamp, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/app/firebase';
import { useAuth } from '@/app/hooks/useAuth';

export interface Transaction {
  id: string;
  amount: number;
  date: Date;
  customerName: string;
  notes?: string;
  userId: string;
  createdBy: string; // Add this line
  adminId: string; // Add this line
}

export interface Metrics {
  totalThisYear: number;
  totalLastYear: number;
  totalThisMonth: number;
  totalLastMonth: number;
  totalToday: number;
  totalYesterday: number;
  averageTransaction: number;
  averageTransactionLastWeek: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({
    totalThisYear: 0,
    totalLastYear: 0,
    totalThisMonth: 0,
    totalLastMonth: 0,
    totalToday: 0,
    totalYesterday: 0,
    averageTransaction: 0,
    averageTransactionLastWeek: 0,
  });
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | undefined;

    const fetchTransactions = async () => {
      let q;
      if (user.role === 'admin') {
        q = query(collection(db, 'transactions'), where('adminId', '==', user.uid));
      } else {
        q = query(collection(db, 'transactions'), where('adminId', '==', user.adminId));
      }

      unsubscribe = onSnapshot(q, (querySnapshot) => {
        const transactionsData: Transaction[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          transactionsData.push({
            id: doc.id,
            amount: data.amount,
            customerName: data.customerName,
            notes: data.notes,
            date: data.date.toDate(),
            createdBy: data.createdBy,
            userId: data.userId,
            adminId: data.adminId,
          });
        });
        setTransactions(transactionsData);
        calculateMetrics(transactionsData);
      });
    };

    fetchTransactions();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const calculateMetrics = (transactions: Transaction[]) => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();
    const today = now.getDate();

    const thisYearTransactions = transactions.filter(t => t.date.getFullYear() === thisYear);
    const lastYearTransactions = transactions.filter(t => t.date.getFullYear() === thisYear - 1);
    const thisMonthTransactions = thisYearTransactions.filter(t => t.date.getMonth() === thisMonth);
    const lastMonthTransactions = thisYearTransactions.filter(t => t.date.getMonth() === thisMonth - 1);
    const todayTransactions = thisMonthTransactions.filter(t => t.date.getDate() === today);
    const yesterdayTransactions = thisMonthTransactions.filter(t => t.date.getDate() === today - 1);

    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekTransactions = transactions.filter(t => t.date >= oneWeekAgo && t.date < now);

    const totalThisYear = thisYearTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalLastYear = lastYearTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalThisMonth = thisMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalLastMonth = lastMonthTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalToday = todayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalYesterday = yesterdayTransactions.reduce((sum, t) => sum + t.amount, 0);
    const averageTransaction = totalThisYear / thisYearTransactions.length || 0;
    const averageTransactionLastWeek = lastWeekTransactions.reduce((sum, t) => sum + t.amount, 0) / lastWeekTransactions.length || 0;

    setMetrics({
      totalThisYear,
      totalLastYear,
      totalThisMonth,
      totalLastMonth,
      totalToday,
      totalYesterday,
      averageTransaction,
      averageTransactionLastWeek,
    });
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'date' | 'createdBy' | 'userId' | 'adminId'>) => {
    if (!user) throw new Error('User not authenticated');

    const newTransaction = {
      ...transaction,
      createdBy: user.uid,
      userId: user.uid,
      date: Timestamp.now(),
      adminId: user.role === 'admin' ? user.uid : user.adminId,
    };

    await addDoc(collection(db, 'transactions'), newTransaction);
  };

  const deleteTransaction = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    if (user.role !== 'admin') throw new Error('Unauthorized');

    await deleteDoc(doc(db, 'transactions', id));
  };

  const deleteAllTransactions = async () => {
    if (!user) throw new Error('User not authenticated');

    const q = query(collection(db, 'transactions'), where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  };

  return { transactions, addTransaction, deleteTransaction, deleteAllTransactions, metrics };
}