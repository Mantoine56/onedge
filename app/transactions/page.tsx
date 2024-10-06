'use client'

import { useState, useEffect } from 'react'
// import { useRouter } from 'next/navigation'
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
// import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, PlusCircle, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import AddTransactionModal from '@/components/AddTransactionModal'
import { DateRange } from 'react-day-picker'
import { useAuth } from '@/app/hooks/useAuth'
import { toEasternTime, formatInTimeZone } from '@/utils/dateUtils'

export default function TransactionsPage() {
  // const router = useRouter()
  const { transactions, deleteTransaction } = useTransactions()
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()

  const handleDeleteTransaction = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTransaction(id);
      setNotification({ message: "Transaction deleted successfully", type: 'success' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      setNotification({ message: "Error deleting transaction. Please try again.", type: 'error' });
    }
  }

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
    const transactionDate = toEasternTime(new Date(transaction.date));
    return transactionDate >= dateRange.from && transactionDate <= dateRange.to;
  })

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
  })

  const handleRowClick = (transaction: Transaction) => {
    console.log('Transaction clicked:', transaction);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddModalOpen}
        setIsAddTransactionOpen={setIsAddModalOpen}
      />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Transactions</h1>
        
        {/* Date range and sort controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {formatInTimeZone(new Date(dateRange.from), "LLL dd, y")} - {formatInTimeZone(new Date(dateRange.to), "LLL dd, y")}
                    </>
                  ) : (
                    formatInTimeZone(new Date(dateRange.from), "LLL dd, y")
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
                onSelect={handleDateRangeSelect}
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

        {/* Transactions table */}
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatInTimeZone(new Date(transaction.date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>{transaction.notes}</TableCell>
                  <TableCell className="text-right">
                    {user?.role === 'admin' && (
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
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
      
      {/* Floating "+" button */}
      <Button 
        variant="default" 
        className="fixed bottom-4 right-4 bg-black text-white hover:bg-gray-800 rounded-full p-4 shadow-lg"
        onClick={() => setIsAddModalOpen(true)}
      >
        <PlusCircle className="h-6 w-6" />
        <span className="sr-only">Add Transaction</span>
      </Button>

      {/* AddTransactionModal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        transactionType="income"
      />

      {/* Notification */}
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