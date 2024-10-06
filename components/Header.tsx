import Image from 'next/image'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { Button } from "@/components/ui/button"
import {
  Dialog,
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
  PlusCircle,
  UserCircle,
  Menu,
  LogOut,
  User
} from 'lucide-react'

interface HeaderProps {
  isAddTransactionOpen: boolean;
  setIsAddTransactionOpen: (isOpen: boolean) => void;
}

export function Header({ isAddTransactionOpen, setIsAddTransactionOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error);
      // Handle logout error (e.g., show an error message to the user)
    }
  }

  // Use the user object
  console.log('Current user:', user);

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6 bg-white">
      <div className="flex items-center flex-1">
        <Link href="/dashboard" className="flex items-center">
          <div className="bg-black rounded-md p-1 mr-3" style={{ width: '150px', height: '40px' }}>
            <Image
              src="/cashme-logo.png"
              alt="CashMe Logo"
              width={148}
              height={38}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-2xl font-bold">CashMe</span>
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
          {/* If handleAddTransaction is provided, you can use it here */}
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