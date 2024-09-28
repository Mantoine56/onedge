'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, ChevronDown, DollarSign, Trash2, UserCircle, Menu, LogOut, User, PlusCircle } from 'lucide-react'
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

type Transaction = {
id: string
customer: string
email: string
amount: number
date: Date
}

const initialTransactions: Transaction[] = [
{ id: '1', customer: 'Liam Johnson', email: 'liam@example.com', amount: 250.00, date: new Date(2023, 5, 1) },
{ id: '2', customer: 'Olivia Smith', email: 'olivia@example.com', amount: 150.00, date: new Date(2023, 5, 2) },
{ id: '3', customer: 'Noah Williams', email: 'noah@example.com', amount: 350.00, date: new Date(2023, 5, 3) },
{ id: '4', customer: 'Emma Brown', email: 'emma@example.com', amount: 450.00, date: new Date(2023, 5, 4) },
{ id: '5', customer: 'Liam Johnson', email: 'liam@example.com', amount: 550.00, date: new Date(2023, 5, 5) },
]

export function Page() {
const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
  from: undefined,
  to: undefined,
})
const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

const handleDeleteTransaction = (id: string) => {
  setTransactions(transactions.filter(transaction => transaction.id !== id))
}

const handleAddTransaction = (event: React.FormEvent) => {
  event.preventDefault()
  // Here you would typically handle the form submission
  // For now, we'll just close the dialog
  setIsAddTransactionOpen(false)
}

const filteredTransactions = transactions.filter(transaction => {
  if (!dateRange.from || !dateRange.to) return true
  return transaction.date >= dateRange.from && transaction.date <= dateRange.to
})

const sortedTransactions = [...filteredTransactions].sort((a, b) => {
  return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount
})

return (
  <div className="flex flex-col min-h-screen bg-dot-pattern">
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white">
      <div className="flex items-center flex-1">
        <DollarSign className="h-6 w-6 mr-2" />
        <span className="text-lg font-bold">CashMe</span>
      </div>
      <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
        <Link className="text-gray-500 hover:text-gray-900" href="#">
          Dashboard
        </Link>
        <Link className="font-semibold" href="#">
          Transactions
        </Link>
        <Link className="text-gray-500 hover:text-gray-900" href="#">
          Analytics
        </Link>
        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
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
                <Input id="amount" type="number" step="0.01" placeholder="0.00" required />
              </div>
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" type="text" placeholder="Enter customer name" required />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Enter any additional notes here..." />
              </div>
              <Button type="submit" className="w-full">Add Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </nav>
      <div className="flex items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>User Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="ghost" className="md:hidden ml-2">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px] sm:w-[300px]">
            <nav className="flex flex-col space-y-4">
              <Link className="text-gray-500 hover:text-gray-900" href="#">
                Dashboard
              </Link>
              <Link className="font-semibold" href="#">
                Transactions
              </Link>
              <Link className="text-gray-500 hover:text-gray-900" href="#">
                Analytics
              </Link>
              <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                <DialogTrigger asChild>
                  <Button variant="default" className="bg-black text-white hover:bg-gray-800">
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                  </Button>
                </DialogTrigger>
              </Dialog>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    <main className="flex-1 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-4">Transactions</h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 space-y-2 md:space-y-0">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
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
              defaultMonth={dateRange.from}
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarImage src={`/avatars/${transaction.id}.png`} alt="Avatar" />
                      <AvatarFallback>{transaction.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{transaction.customer}</p>
                      <p className="text-sm text-gray-500">{transaction.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{format(transaction.date, 'MMM d, yyyy')}</TableCell>
                <TableCell className="text-right">${transaction.amount.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete transaction</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the transaction
                          from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTransaction(transaction.id)}>
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
  </div>
)
}