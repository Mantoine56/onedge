'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { useTransactions } from '@/hooks/useTransactions'
import { useAuth } from '@/app/hooks/useAuth'
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
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
import { DateRange } from 'react-day-picker'
import format from 'date-fns/format'
import startOfDay from 'date-fns/startOfDay'
import startOfMonth from 'date-fns/startOfMonth'
import startOfYear from 'date-fns/startOfYear'
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react'
import { db } from '@/app/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'
import AddTransactionModal from '@/components/AddTransactionModal'
import { toEasternTime, fromEasternTime, formatInTimeZone } from '@/utils/dateUtils'

interface UserTotals {
  userId: string;
  email: string;
  dailyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

type SortField = 'email' | 'dailyTotal' | 'monthlyTotal' | 'yearlyTotal';
type SortOrder = 'asc' | 'desc';

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const { transactions } = useTransactions()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()
  const [userTotals, setUserTotals] = useState<UserTotals[]>([])
  const [sortField, setSortField] = useState<SortField>('email')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [incomeData, setIncomeData] = useState<{ date: string; income: number }[]>([])
  const [transactionCountData, setTransactionCountData] = useState<{ date: string; count: number }[]>([])
  const [userRankingData, setUserRankingData] = useState<{ email: string; total: number }[]>([])

  useEffect(() => {
    const fetchEmployees = async () => {
      if (user && user.role === 'admin') {
        const employeesRef = collection(db, 'users')
        const q = query(employeesRef, where('adminId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        
        const totals = calculateTotals([user, ...employees])
        setUserTotals(totals)

        // Calculate chart data
        const incomeByDay = calculateIncomeByDay(transactions)
        setIncomeData(incomeByDay)

        const transactionCountByDay = calculateTransactionCountByDay(transactions)
        setTransactionCountData(transactionCountByDay)

        const userRanking = calculateUserRanking(totals)
        setUserRankingData(userRanking)
      }
    }

    fetchEmployees()
  }, [user, transactions])

  const calculateTotals = (users: any[]): UserTotals[] => {
    const today = toEasternTime(new Date())
    const startOfToday = startOfDay(today)
    const startOfThisMonth = startOfMonth(today)
    const startOfThisYear = startOfYear(today)

    return users.map(user => {
      const userTransactions = transactions.filter(t => t.userId === user.id)
      return {
        userId: user.id,
        email: user.email,
        dailyTotal: userTransactions
          .filter(t => toEasternTime(new Date(t.date)) >= startOfToday)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        monthlyTotal: userTransactions
          .filter(t => toEasternTime(new Date(t.date)) >= startOfThisMonth)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        yearlyTotal: userTransactions
          .filter(t => toEasternTime(new Date(t.date)) >= startOfThisYear)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      }
    })
  }

  const calculateIncomeByDay = (transactions: any[]) => {
    const incomeByDay: { [key: string]: number } = {}
    transactions.forEach(t => {
      const date = formatInTimeZone(new Date(t.date), 'yyyy-MM-dd')
      incomeByDay[date] = (incomeByDay[date] || 0) + t.amount
    })
    return Object.entries(incomeByDay).map(([date, income]) => ({ date, income }))
  }

  const calculateTransactionCountByDay = (transactions: any[]) => {
    const countByDay: { [key: string]: number } = {}
    transactions.forEach(t => {
      const date = formatInTimeZone(new Date(t.date), 'yyyy-MM-dd')
      countByDay[date] = (countByDay[date] || 0) + 1
    })
    return Object.entries(countByDay).map(([date, count]) => ({ date, count }))
  }

  const calculateUserRanking = (userTotals: UserTotals[]) => {
    return userTotals
      .map(user => ({ email: user.email, total: user.monthlyTotal }))
      .sort((a, b) => b.total - a.total)
  }

  const filteredTransactions = transactions.filter(transaction => {
    if (!dateRange || !dateRange.from || !dateRange.to) return true;
    return transaction.date >= dateRange.from && transaction.date <= dateRange.to;
  })

  const totalIncome = filteredTransactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = filteredTransactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netIncome = totalIncome - totalExpenses

  const sortedUserTotals = [...userTotals].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddModalOpen}
        setIsAddTransactionOpen={setIsAddModalOpen}
      />
      <main className="flex-1 p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        
        {/* Date range picker */}
        <div className="mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-start text-left font-normal">
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
        </div>

        {/* User totals table */}
        <div className="rounded-md border bg-white overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead onClick={() => handleSort('email')} className="cursor-pointer">
                  User {sortField === 'email' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('dailyTotal')} className="text-right cursor-pointer">
                  Daily Total {sortField === 'dailyTotal' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('monthlyTotal')} className="text-right cursor-pointer">
                  Monthly Total {sortField === 'monthlyTotal' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
                <TableHead onClick={() => handleSort('yearlyTotal')} className="text-right cursor-pointer">
                  Yearly Total {sortField === 'yearlyTotal' && (sortOrder === 'asc' ? <ChevronUp className="inline" /> : <ChevronDown className="inline" />)}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedUserTotals.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell className="text-right">${user.dailyTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${user.monthlyTotal.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${user.yearlyTotal.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Income Chart */}
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-semibold mb-2">Daily Income</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Count Chart */}
          <div className="bg-white p-4 rounded-md shadow">
            <h2 className="text-lg font-semibold mb-2">Daily Transaction Count</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={transactionCountData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Ranking Chart */}
          <div className="bg-white p-4 rounded-md shadow md:col-span-2">
            <h2 className="text-lg font-semibold mb-2">User Monthly Totals Ranking</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={userRankingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="email" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
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
    </div>
  )
}