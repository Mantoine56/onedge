import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  DollarSign, 
  PlusCircle,
  UserCircle,
  Menu,
  LogOut,
  User
} from 'lucide-react'

interface HeaderProps {
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (isOpen: boolean) => void;
  handleAddTransaction: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

export function Header({ isAddTransactionOpen, setIsAddTransactionOpen, handleAddTransaction }: HeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
      <div className="flex items-center flex-1">
        <Link href="/dashboard" className="flex items-center">
          <DollarSign className="h-6 w-6 mr-2" />
          <span className="text-lg font-bold">CashMe</span>
        </Link>
      </div>
      <nav className="hidden md:flex items-center space-x-4 md:space-x-6">
        <Link 
          href="/dashboard"
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            pathname === '/dashboard' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-700 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Dashboard
        </Link>
        <Link 
          href="/transactions"
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            pathname === '/transactions' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-700 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Transactions
        </Link>
        <Link 
          href="/analytics"
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
            pathname === '/analytics' 
              ? 'bg-gray-800 text-white' 
              : 'text-gray-700 hover:bg-gray-800 hover:text-white'
          }`}
        >
          Analytics
        </Link>
        <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
          <DialogTrigger asChild>
            <Button variant="default" className="bg-black text-white hover:bg-gray-800">
              <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
            </Button>
          </DialogTrigger>
          {/* ... (DialogContent remains the same) ... */}
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
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>User Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
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
              <Link 
                href="/dashboard"
                className={`text-gray-700 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${
                  pathname === '/dashboard' ? 'font-semibold' : ''
                }`}
              >
                Dashboard
              </Link>
              <Link 
                href="/transactions"
                className={`text-gray-700 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${
                  pathname === '/transactions' ? 'font-semibold' : ''
                }`}
              >
                Transactions
              </Link>
              <Link 
                href="/analytics"
                className={`text-gray-700 hover:bg-gray-800 hover:text-white transition-colors duration-200 ${
                  pathname === '/analytics' ? 'font-semibold' : ''
                }`}
              >
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
  )
}