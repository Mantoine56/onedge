'use client'

import { useState, useEffect, useCallback, forwardRef } from 'react'
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { Header } from '@/components/Header'
import { Calendar as CalendarIcon, ChevronDown, PlusCircle, Trash2 } from 'lucide-react'
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { useAuth } from '@/app/hooks/useAuth'
import { toEasternTime, formatInTimeZone } from '@/utils/dateUtils'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { isWithinInterval } from 'date-fns'
import { format, parseISO, isValid } from 'date-fns';
import { utcToZonedTime } from 'date-fns-tz';
import { isDate } from 'date-fns';

const CustomInput = forwardRef<HTMLButtonElement, { value?: string; onClick?: () => void }>(
  ({ value, onClick }, ref) => (
    <Button
      variant="outline"
      onClick={onClick}
      ref={ref}
      className="w-full md:w-auto justify-start text-left font-normal"
    >
      <CalendarIcon className="mr-2 h-4 w-4" />
      {value || "Pick a date range"}
    </Button>
  )
);

CustomInput.displayName = 'CustomInput';

type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

export default function TransactionsPage() {
  const { transactions, deleteTransaction } = useTransactions()
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const [sortOption, setSortOption] = useState<SortOption>('newest')
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

  const filterTransactions = useCallback((transactions: Transaction[], start: Date | null, end: Date | null) => {
    if (!start || !end) return transactions;
    return transactions.filter(transaction => {
      const transactionDate = toEasternTime(new Date(transaction.date));
      return isWithinInterval(transactionDate, { start, end });
    });
  }, []);

  const filteredTransactions = filterTransactions(transactions, startDate, endDate);

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    switch (sortOption) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.amount - a.amount;
      case 'lowest':
        return a.amount - b.amount;
      default:
        return 0;
    }
  });

  const handleRowClick = (transaction: Transaction) => {
    // Implement the row click functionality here
    console.log('Transaction clicked:', transaction);
    // You can add more logic here, such as opening a modal with transaction details
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
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update: [Date | null, Date | null]) => {
              setDateRange(update);
            }}
            isClearable={true}
            customInput={<CustomInput />}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full md:w-auto">
                Sort by: {sortOption.charAt(0).toUpperCase() + sortOption.slice(1)}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={sortOption === 'newest'}
                onCheckedChange={() => setSortOption('newest')}
              >
                Newest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'oldest'}
                onCheckedChange={() => setSortOption('oldest')}
              >
                Oldest First
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'highest'}
                onCheckedChange={() => setSortOption('highest')}
              >
                Highest Amount
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortOption === 'lowest'}
                onCheckedChange={() => setSortOption('lowest')}
              >
                Lowest Amount
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
                <TableHead>Date & Time</TableHead>
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
                  <TableCell>
                    {(() => {
                      let date: Date;
                      if (typeof transaction.date === 'string') {
                        // If it's a string, try to parse it
                        date = parseISO(transaction.date);
                      } else if (transaction.date instanceof Date) {
                        // If it's already a Date object
                        date = transaction.date;
                      } else {
                        // If it's neither a string nor a Date, use current date as fallback
                        console.error('Invalid date format for transaction:', transaction);
                        date = new Date();
                      }

                      // Ensure the date is valid
                      if (!isValid(date)) {
                        console.error('Invalid date for transaction:', transaction);
                        date = new Date(); // Use current date as fallback
                      }

                      const formattedDate = format(date, 'MMMM d, yyyy h:mm a');
                      const dayOfWeek = format(date, 'EEEE');
                      return (
                        <div>
                          <p>{formattedDate}</p>
                          <p className="text-xs text-gray-500">{dayOfWeek}</p>
                        </div>
                      );
                    })()}
                  </TableCell>
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