'use client'

import { useState } from 'react'
import Link from 'next/link'
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
DollarSign, 
Calendar, 
CreditCard, 
UserCircle,
Menu,
LogOut,
User,
PlusCircle
} from 'lucide-react'
import {
Sheet,
SheetContent,
SheetTrigger,
} from "@/components/ui/sheet"
import {
DropdownMenu,
DropdownMenuContent,
DropdownMenuItem,
DropdownMenuLabel,
DropdownMenuSeparator,
DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"

export function Page() {
const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)

const handleAddTransaction = (event: React.FormEvent) => {
  event.preventDefault()
  // Here you would typically handle the form submission
  // For now, we'll just close the dialog
  setIsAddTransactionOpen(false)
}

return (
  <div className="flex flex-col min-h-screen bg-dot-pattern">
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white">
      <div className="flex items-center flex-1">
        <DollarSign className="h-6 w-6 mr-2" />
        <span className="text-lg font-bold">CashMe</span>
      </div>
      <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
        <Link className="font-semibold" href="#">
          Dashboard
        </Link>
        <Link className="text-gray-500 hover:text-gray-900" href="#">
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
              <Link className="font-semibold" href="#">
                Dashboard
              </Link>
              <Link className="text-gray-500 hover:text-gray-900" href="#">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cash This Year</CardTitle>
            <Calendar className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$245,231.89</div>
            <p className="text-xs text-gray-500">+20.1% from last year</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cash This Month</CardTitle>
            <Calendar className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$32,350.00</div>
            <p className="text-xs text-gray-500">+15.2% from last month</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Cash Today</CardTitle>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,234.00</div>
            <p className="text-xs text-gray-500">+5.1% from yesterday</p>
          </CardContent>
        </Card>
        <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Transaction</CardTitle>
            <CreditCard className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$573.00</div>
            <p className="text-xs text-gray-500">+2.5% from last week</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-4">Recent transactions from your CashMe account.</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/01.png" alt="Avatar" />
                        <AvatarFallback>LJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Liam Johnson</p>
                        <p className="text-sm text-gray-500">liam@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$250.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/02.png" alt="Avatar" />
                        <AvatarFallback>OS</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Olivia Smith</p>
                        <p className="text-sm text-gray-500">olivia@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$150.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/03.png" alt="Avatar" />
                        <AvatarFallback>NW</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Noah Williams</p>
                        <p className="text-sm text-gray-500">noah@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$350.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/04.png" alt="Avatar" />
                        <AvatarFallback>EB</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Emma Brown</p>
                        <p className="text-sm text-gray-500">emma@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$450.00</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src="/avatars/05.png" alt="Avatar" />
                        <AvatarFallback>LJ</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">Liam Johnson</p>
                        <p className="text-sm text-gray-500">liam@example.com</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">$550.00</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Button className="w-full mt-4" variant="outline">View All</Button>
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
    </Dialog>
  </div>
)
}