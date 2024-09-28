'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, DollarSign, Trash2, UserCircle, Menu, LogOut, User, PlusCircle, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
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
import { usePathname } from 'next/navigation'

export default function TransactionsPage() {
  const { user, logout } = useAuth();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined } | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the row click event from firing
    try {
      await deleteTransaction(id);
      setNotification({ message: "Transaction deleted successfully", type: 'success' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setNotification({ message: "Error deleting transaction. Please try again.", type: 'error' });
    }
  }

  const handleAddTransaction = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const amount = formData.get('amount') as string;
    const customerName = formData.get('customerName') as string;
    const notes = formData.get('notes') as string;

    try {
      await addTransaction({
        amount: parseFloat(amount),
        customerName,
        notes,
      });
      setIsAddTransactionOpen(false);
      setNotification({ message: "Transaction added successfully", type: 'success' });
    } catch (error) {
      console.error('Error adding transaction:', error);
      setNotification({ message: "Error adding transaction. Please try again.", type: 'error' });
    }
  };

  // Add this useEffect to clear the notification after 3 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const filteredTransactions = transactions.filter(transaction => {
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    return transaction.date >= dateRange.from && transaction.date <= dateRange.to;
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
  })

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const handleRowClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
  }

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
        handleAddTransaction={handleAddTransaction}
      />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Sort by Amount
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'desc'}
                onCheckedChange={() => setSortOrder('desc')}
              >
                Highest to Lowest
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOrder === 'asc'}
                onCheckedChange={() => setSortOrder('asc')}
              >
                Lowest to Highest
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransactions.map((transaction) => (
                <TableRow 
                  key={transaction.id} 
                  className="cursor-pointer hover:bg-gray-100"
                  onClick={() => handleRowClick(transaction)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback>{transaction.customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{transaction.customerName}</p>
                        {/* Remove the email line as it's not in the Transaction interface */}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{format(transaction.date, 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.notes}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={(e) => e.stopPropagation()} // Prevent row click when opening dialog
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete transaction</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent onClick={(e) => e.stopPropagation()}> {/* Prevent row click when dialog is open */}
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the transaction
                            from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={(e) => handleDeleteTransaction(transaction.id, e)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
      </Dialog>
      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              View the details of the selected transaction.
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-4">
              <div>
                <Label>Customer</Label>
                <p>{selectedTransaction.customerName}</p>
              </div>
              <div>
                <Label>Amount</Label>
                <p>${selectedTransaction.amount.toFixed(2)}</p>
              </div>
              <div>
                <Label>Date</Label>
                <p>{format(selectedTransaction.date, 'MMMM d, yyyy')}</p>
              </div>
              <div>
                <Label>Notes</Label>
                <p>{selectedTransaction.notes}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {notification.message}
        </div>
      )}
    </div>
  )
}