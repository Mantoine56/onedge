'use client'

import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  DollarSign, 
  PlusCircle,
} from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { transactions, addTransaction, metrics } = useTransactions();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const formatPercentageChange = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return "No data";
    const change = calculatePercentageChange(current, previous);
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const handleAddTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = formData.get('amount') as string;
    const notes = formData.get('notes') as string;
    const customerName = formData.get('customerName') as string;

    try {
      await addTransaction({
        amount: parseFloat(amount),
        customerName,
        notes,
      });
      setIsAddTransactionOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
        handleAddTransaction={handleAddTransaction}
      />
      <main className="flex-1 p-4 md:p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Cash This Year</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalThisYear.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalLastYear === 0 
                  ? "No data for last year"
                  : `${formatPercentageChange(metrics.totalThisYear, metrics.totalLastYear)} from last year`
                }
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Cash This Month</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalThisMonth.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalLastMonth === 0 
                  ? "No data for last month"
                  : `${formatPercentageChange(metrics.totalThisMonth, metrics.totalLastMonth)} from last month`
                }
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Cash Today</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.totalToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.totalYesterday === 0 
                  ? "No data for yesterday"
                  : `${formatPercentageChange(metrics.totalToday, metrics.totalYesterday)} from yesterday`
                }
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${metrics.averageTransaction.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.averageTransactionLastWeek === 0 
                  ? "No data for last week"
                  : `${formatPercentageChange(metrics.averageTransaction, metrics.averageTransactionLastWeek)} from last week`
                }
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Recent transactions from your CashMe account.</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{transaction.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{transaction.customerName}</p>
                            <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Link href="/transactions">
                <Button className="w-full mt-4" variant="outline">View All</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="default" 
            className="fixed bottom-4 right-4 bg-black text-white hover:bg-gray-800 rounded-full p-4 shadow-lg"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="sr-only">Add Transaction</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
            <DialogDescription>Enter the details of your new transaction here.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddTransaction} className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
            </div>
            <div>
              <Label htmlFor="customerName">Customer Name</Label>
              <Input id="customerName" name="customerName" type="text" placeholder="Enter customer name" required />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Enter any additional notes here..." />
            </div>
            <Button type="submit" className="w-full">Add Transaction</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}