import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTransactions } from '@/hooks/useTransactions';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: 'income' | 'expense';
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, transactionType }) => {
  const [amount, setAmount] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const { addTransaction } = useTransactions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        amount: parseFloat(amount) * (transactionType === 'expense' ? -1 : 1),
        customerName,
        notes,
      });
      onClose();
      // Reset form
      setAmount('');
      setCustomerName('');
      setNotes('');
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add {transactionType === 'income' ? 'Income' : 'Expense'}</DialogTitle>
          <DialogDescription>
            Enter the details for the new {transactionType}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            <Button type="submit">Add {transactionType === 'income' ? 'Income' : 'Expense'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTransactionModal;