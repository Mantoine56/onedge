'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { DollarSign, UserCircle, Menu, LogOut, User, PlusCircle, CreditCard, Activity, CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/app/hooks/useAuth'
import { useTransactions } from '@/hooks/useTransactions'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Header } from '@/components/Header'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function AnalyticsPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { logout } = useAuth()
  const { transactions, addTransaction, metrics } = useTransactions()
  const [viewModes, setViewModes] = useState({
    revenue: 'daily',
    volume: 'daily',
    avgTransaction: 'daily',
    mrrGrowth: 'daily'
  })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>(() => {
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 4); // This will give us 5 days of data including today
    return { from: fiveDaysAgo, to: today };
  });

  const [chartData, setChartData] = useState({
    revenueData: { monthly: [], daily: [] },
    transactionVolumeData: { monthly: [], daily: [] },
    avgTransactionData: { monthly: [], daily: [] },
    transactionDistributionData: [],
    mrrGrowthData: { monthly: [], daily: [] }
  })

  useEffect(() => {
    setIsLoading(true)
    setError(null)
    try {
      calculateChartData(transactions)
      setIsLoading(false)
    } catch (err) {
      console.error('Error calculating chart data:', err)
      setError('Failed to load analytics data')
      setIsLoading(false)
    }
  }, [transactions, dateRange])

  const calculateChartData = (transactions) => {
    // Filter transactions based on date range
    const filteredTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return (!dateRange.from || transactionDate >= dateRange.from) && 
             (!dateRange.to || transactionDate <= dateRange.to);
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const revenueByMonth = {}
    const revenueByDay = {}
    const volumeByMonth = {}
    const volumeByDay = {}
    const avgByMonth = {}
    const avgByDay = {}
    const distributionRanges = {'$0-$100': 0, '$101-$500': 0, '$501-$1000': 0, '$1001+': 0}
    const mrrByMonth = {}
    const mrrByDay = {}

    // Initialize data for each day in the range
    let currentDate = new Date(dateRange.from);
    const endDate = new Date(dateRange.to);
    while (currentDate <= endDate) {
      const dayKey = currentDate.toISOString().split('T')[0];
      revenueByDay[dayKey] = 0;
      volumeByDay[dayKey] = 0;
      avgByDay[dayKey] = { total: 0, count: 0 };
      mrrByDay[dayKey] = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    filteredTransactions.forEach(t => {
      const date = new Date(t.date)
      const month = monthNames[date.getMonth()]
      const year = date.getFullYear()
      const monthKey = `${month} ${year}`
      const dayKey = date.toISOString().split('T')[0]

      // Revenue Data
      revenueByMonth[monthKey] = (revenueByMonth[monthKey] || 0) + t.amount
      revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + t.amount

      // Transaction Volume Data
      volumeByMonth[monthKey] = (volumeByMonth[monthKey] || 0) + 1
      volumeByDay[dayKey] = (volumeByDay[dayKey] || 0) + 1

      // Average Transaction Data
      if (!avgByMonth[monthKey]) avgByMonth[monthKey] = { total: 0, count: 0 }
      avgByMonth[monthKey].total += t.amount
      avgByMonth[monthKey].count += 1

      if (!avgByDay[dayKey]) avgByDay[dayKey] = { total: 0, count: 0 }
      avgByDay[dayKey].total += t.amount
      avgByDay[dayKey].count += 1

      // Transaction Distribution Data
      if (t.amount <= 100) distributionRanges['$0-$100']++
      else if (t.amount <= 500) distributionRanges['$101-$500']++
      else if (t.amount <= 1000) distributionRanges['$501-$1000']++
      else distributionRanges['$1001+']++

      // MRR Growth Data (simplified, assuming each transaction contributes to MRR)
      mrrByMonth[monthKey] = (mrrByMonth[monthKey] || 0) + (t.amount / 30)  // Dividing by 30 to get a daily value
      mrrByDay[dayKey] = (mrrByDay[dayKey] || 0) + (t.amount / 30)
    })

    setChartData({
      revenueData: {
        monthly: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
        daily: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }))
      },
      transactionVolumeData: {
        monthly: Object.entries(volumeByMonth).map(([month, volume]) => ({ month, volume })),
        daily: Object.entries(volumeByDay).map(([date, volume]) => ({ date, volume }))
      },
      avgTransactionData: {
        monthly: Object.entries(avgByMonth).map(([month, data]) => ({ 
          month, 
          amount: data.count > 0 ? data.total / data.count : 0
        })),
        daily: Object.entries(avgByDay).map(([date, data]) => ({ 
          date, 
          amount: data.count > 0 ? data.total / data.count : 0
        }))
      },
      transactionDistributionData: Object.entries(distributionRanges).map(([range, value]) => ({ 
        name: range, 
        value 
      })),
      mrrGrowthData: {
        monthly: Object.entries(mrrByMonth).map(([month, mrr]) => ({ month, mrr })),
        daily: Object.entries(mrrByDay).map(([date, mrr]) => ({ date, mrr }))
      }
    })
  }

  const toggleViewMode = (chart) => {
    setViewModes(prev => ({
      ...prev,
      [chart]: prev[chart] === 'monthly' ? 'daily' : 'monthly'
    }))
  }

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
        notes,
        customerName,
      });
      setIsAddTransactionOpen(false);
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  }

  if (isLoading) {
    return <div>Loading analytics data...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
        handleAddTransaction={handleAddTransaction}
      />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        
        <div className="flex justify-between items-center mb-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                  </>
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
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalThisYear)}</div>
              <p className="text-xs text-gray-500">
                {calculatePercentageChange(metrics.totalThisYear, metrics.totalLastYear).toFixed(1)}% from last year
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
              <DollarSign className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalThisMonth)}</div>
              <p className="text-xs text-gray-500">
                {calculatePercentageChange(metrics.totalThisMonth, metrics.totalLastMonth).toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Avg. Transaction</CardTitle>
              <CreditCard className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.averageTransaction)}</div>
              <p className="text-xs text-gray-500">
                {calculatePercentageChange(metrics.averageTransaction, metrics.averageTransactionLastWeek).toFixed(1)}% from last week
              </p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-300 ease-in-out hover:shadow-lg hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <Activity className="w-4 h-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(metrics.totalToday)}</div>
              <p className="text-xs text-gray-500">
                {calculatePercentageChange(metrics.totalToday, metrics.totalYesterday).toFixed(1)}% from yesterday
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Revenue Over Time</CardTitle>
              <Button onClick={() => toggleViewMode('revenue')}>
                {viewModes.revenue === 'monthly' ? 'Switch to Daily' : 'Switch to Monthly'}
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.revenueData[viewModes.revenue]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewModes.revenue === 'monthly' ? 'month' : 'date'} 
                    allowDataOverflow={true}
                  />
                  <YAxis allowDataOverflow={true} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transaction Volume</CardTitle>
              <Button onClick={() => toggleViewMode('volume')}>
                {viewModes.volume === 'monthly' ? 'Switch to Daily' : 'Switch to Monthly'}
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData.transactionVolumeData[viewModes.volume]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewModes.volume === 'monthly' ? 'month' : 'date'} 
                    allowDataOverflow={true}
                  />
                  <YAxis allowDataOverflow={true} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="volume" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Average Transaction Amount</CardTitle>
              <Button onClick={() => toggleViewMode('avgTransaction')}>
                {viewModes.avgTransaction === 'monthly' ? 'Switch to Daily' : 'Switch to Monthly'}
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData.avgTransactionData[viewModes.avgTransaction]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey={viewModes.avgTransaction === 'monthly' ? 'month' : 'date'} 
                    allowDataOverflow={true}
                  />
                  <YAxis allowDataOverflow={true} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData.transactionDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.transactionDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>MRR Growth</CardTitle>
            <Button onClick={() => toggleViewMode('mrrGrowth')}>
              {viewModes.mrrGrowth === 'monthly' ? 'Switch to Daily' : 'Switch to Monthly'}
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData.mrrGrowthData[viewModes.mrrGrowth]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey={viewModes.mrrGrowth === 'monthly' ? 'month' : 'date'} 
                  allowDataOverflow={true}
                />
                <YAxis allowDataOverflow={true} />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="mrr" stroke="#8884d8" fill="#8884d8" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
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
        <DialogContent className="sm:max-w-[425px]">
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