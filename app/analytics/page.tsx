'use client'

import { useState, useEffect, useCallback } from 'react'
import { Header } from '@/components/Header'
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { useAuth, User as AuthUser } from '@/app/hooks/useAuth'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { startOfDay, startOfMonth, startOfYear, isWithinInterval } from 'date-fns'
import { Calendar as CalendarIcon, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react'
import { db } from '@/app/firebase/config'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, ResponsiveContainer } from 'recharts'
import AddTransactionModal from '@/components/AddTransactionModal'
import { toEasternTime, formatInTimeZone } from '@/utils/dateUtils'
import { DayPicker, DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { format } from 'date-fns';

interface User extends AuthUser {
  id: string;
}

interface UserTotals {
  userId: string;
  email: string;
  dailyTotal: number;
  monthlyTotal: number;
  yearlyTotal: number;
}

type SortField = 'email' | 'dailyTotal' | 'monthlyTotal' | 'yearlyTotal';
type SortOrder = 'asc' | 'desc';

const DateRangePickerButton = ({ onClick, dateRange }: { onClick: () => void, dateRange: [Date | null, Date | null] }) => (
  <Button
    variant="outline"
    onClick={onClick}
    className="w-full md:w-auto justify-start text-left font-normal"
  >
    <CalendarIcon className="mr-2 h-4 w-4" />
    {dateRange[0] && dateRange[1]
      ? `${format(dateRange[0], 'PP')} - ${format(dateRange[1], 'PP')}`
      : "Pick a date range"}
  </Button>
);

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [startDate, endDate] = dateRange;
  const { transactions } = useTransactions()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()
  const [userTotals, setUserTotals] = useState<UserTotals[]>([])
  const [sortField, setSortField] = useState<SortField>('email')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [incomeData, setIncomeData] = useState<{ date: string; income: number }[]>([])
  const [transactionCountData, setTransactionCountData] = useState<{ date: string; count: number }[]>([])
  const [userRankingData, setUserRankingData] = useState<{ email: string; total: number }[]>([])
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const calculateTotals = useCallback((users: User[], filteredTransactions: Transaction[]): UserTotals[] => {
    const today = toEasternTime(new Date())
    const startOfToday = startOfDay(today)
    const startOfThisMonth = startOfMonth(today)
    const startOfThisYear = startOfYear(today)

    return users.map(user => {
      const userTransactions = filteredTransactions.filter(t => t.userId === user.id)
      return {
        userId: user.id,
        email: user.email || '',
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
  }, []);

  const filterTransactions = useCallback((transactions: Transaction[], start: Date | null, end: Date | null) => {
    if (!start || !end) return transactions;
    return transactions.filter(transaction => {
      const transactionDate = toEasternTime(new Date(transaction.date));
      return isWithinInterval(transactionDate, { start, end });
    });
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      if (user && user.role === 'admin') {
        const employeesRef = collection(db, 'users')
        const q = query(employeesRef, where('adminId', '==', user.uid))
        const querySnapshot = await getDocs(q)
        const employees = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
        
        const currentUser: User = { ...user, id: user.uid }
        const filteredTransactions = filterTransactions(transactions, startDate, endDate)
        const totals = calculateTotals([currentUser, ...employees], filteredTransactions)
        setUserTotals(totals)

        // Calculate chart data
        const incomeByDay = calculateIncomeByDay(filteredTransactions)
        setIncomeData(incomeByDay)

        const transactionCountByDay = calculateTransactionCountByDay(filteredTransactions)
        setTransactionCountData(transactionCountByDay)

        const userRanking = calculateUserRanking(totals)
        setUserRankingData(userRanking)
      }
    }

    fetchEmployees()
  }, [user, transactions, calculateTotals, filterTransactions, startDate, endDate])

  const calculateIncomeByDay = (transactions: Transaction[]): { date: string; income: number }[] => {
    const incomeByDay: { [key: string]: number } = {};
    transactions.forEach(t => {
      const date = formatInTimeZone(new Date(t.date), 'yyyy-MM-dd');
      incomeByDay[date] = (incomeByDay[date] || 0) + t.amount;
    });
    return Object.entries(incomeByDay).map(([date, income]) => ({ date, income }));
  };

  const calculateTransactionCountByDay = (transactions: Transaction[]): { date: string; count: number }[] => {
    const countByDay: { [key: string]: number } = {};
    transactions.forEach(t => {
      const date = formatInTimeZone(new Date(t.date), 'yyyy-MM-dd');
      countByDay[date] = (countByDay[date] || 0) + 1;
    });
    return Object.entries(countByDay).map(([date, count]) => ({ date, count }));
  };

  const calculateUserRanking = (userTotals: UserTotals[]): { email: string; total: number }[] => {
    return userTotals
      .map(user => ({ email: user.email, total: user.monthlyTotal }))
      .sort((a, b) => b.total - a.total)
  }

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

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range) {
      setDateRange([range.from || null, range.to || null]);
      if (range.from && range.to) {
        setIsCalendarOpen(false);
      }
    } else {
      setDateRange([null, null]);
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
        <div className="mb-4 relative">
          <DateRangePickerButton
            onClick={() => setIsCalendarOpen(!isCalendarOpen)}
            dateRange={dateRange}
          />
          {isCalendarOpen && (
            <div className="absolute z-10 mt-1 bg-white border rounded-md shadow-lg">
              <DayPicker
                mode="range"
                selected={{ 
                  from: startDate || undefined, 
                  to: endDate || undefined 
                }}
                onSelect={handleDateRangeSelect}
                footer={false}
              />
            </div>
          )}
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