'use client'

import { useState, useEffect, useCallback } from 'react'
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
import { PlusCircle, CalendarIcon } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { useTransactions, Transaction } from '@/hooks/useTransactions'
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Header } from '@/components/Header'
import { DateRange } from 'react-day-picker'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

// Define the structure of chartData
interface ChartData {
  revenueData: {
    daily: Array<{ date: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
  };
  transactionVolumeData: {
    daily: Array<{ date: string; volume: number }>;
    monthly: Array<{ month: string; volume: number }>;
  };
  avgTransactionData: {
    daily: Array<{ date: string; amount: number }>;
    monthly: Array<{ month: string; amount: number }>;
  };
  transactionDistributionData: Array<{ name: string; value: number }>;
  mrrGrowthData: {
    daily: Array<{ date: string; mrr: number }>;
    monthly: Array<{ month: string; mrr: number }>;
  };
  userTransactionData: Array<{ userId: string; total: number }>;
}

export default function AnalyticsPage() {
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const { transactions, addTransaction } = useTransactions()
  const [viewModes, setViewModes] = useState({
    revenue: 'daily' as 'daily' | 'monthly',
    volume: 'daily' as 'daily' | 'monthly',
    avgTransaction: 'daily' as 'daily' | 'monthly',
    mrrGrowth: 'monthly' as 'daily' | 'monthly'
  })
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date()
  })
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [error, setError] = useState<string | null>(null)

  const calculateChartData = useCallback((transactions: Transaction[]) => {
    console.log('Calculating chart data with transactions:', transactions)
    try {
      const currentDate = new Date(dateRange?.from || new Date())
      const endDate = new Date(dateRange?.to || new Date())
      // Filter transactions based on date range
      const filteredTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= currentDate && transactionDate <= endDate;
      });

      console.log('Filtered transactions:', filteredTransactions)

      const avgByMonth: { [key: string]: { total: number; count: number } } = {};
      const avgByDay: { [key: string]: { total: number; count: number } } = {};
      const transactionDistribution: { [key: string]: number } = {
        '0-100': 0,
        '101-500': 0,
        '501-1000': 0,
        '1001+': 0
      };
      const mrrData: { [key: string]: number } = {};

      // Initialize avgByMonth and avgByDay with all dates in the range
      const currentDateIter = new Date(currentDate);
      while (currentDateIter <= endDate) {
        const monthKey = format(currentDateIter, 'MMM yyyy');
        const dayKey = format(currentDateIter, 'yyyy-MM-dd');
        
        if (!avgByMonth[monthKey]) {
          avgByMonth[monthKey] = { total: 0, count: 0 };
        }
        if (!avgByDay[dayKey]) {
          avgByDay[dayKey] = { total: 0, count: 0 };
        }
        
        currentDateIter.setDate(currentDateIter.getDate() + 1);
      }

      filteredTransactions.forEach(t => {
        const transactionDate = new Date(t.date);
        const monthKey = format(transactionDate, 'MMM yyyy');
        const dayKey = format(transactionDate, 'yyyy-MM-dd');

        avgByMonth[monthKey].total += t.amount;
        avgByMonth[monthKey].count += 1;

        avgByDay[dayKey].total += t.amount;
        avgByDay[dayKey].count += 1;

        // Transaction Distribution Data
        if (t.amount <= 100) transactionDistribution['0-100']++;
        else if (t.amount <= 500) transactionDistribution['101-500']++;
        else if (t.amount <= 1000) transactionDistribution['501-1000']++;
        else transactionDistribution['1001+']++;

        // MRR Data
        const mrrKey = format(transactionDate, 'MMM yyyy');
        mrrData[mrrKey] = (mrrData[mrrKey] || 0) + t.amount;
      });

      const revenueData = {
        daily: Object.entries(avgByDay).map(([date, data]) => ({
          date,
          revenue: data.total
        })),
        monthly: Object.entries(avgByMonth).map(([month, data]) => ({
          month,
          revenue: data.total
        }))
      };

      const transactionVolumeData = {
        daily: Object.entries(avgByDay).map(([date, data]) => ({
          date,
          volume: data.count
        })),
        monthly: Object.entries(avgByMonth).map(([month, data]) => ({
          month,
          volume: data.count
        }))
      };

      const avgTransactionData = {
        daily: Object.entries(avgByDay).map(([date, data]) => ({
          date,
          amount: data.count > 0 ? data.total / data.count : 0
        })),
        monthly: Object.entries(avgByMonth).map(([month, data]) => ({
          month,
          amount: data.count > 0 ? data.total / data.count : 0
        }))
      };

      const transactionDistributionData = Object.entries(transactionDistribution).map(([range, count]) => ({
        name: range,
        value: count
      }));

      const mrrGrowthData = {
        monthly: Object.entries(mrrData).map(([month, total]) => ({
          month,
          mrr: total
        }))
      };

      const userTransactionData: { [key: string]: number } = {};

      transactions.forEach(transaction => {
        if (!userTransactionData[transaction.createdBy]) {
          userTransactionData[transaction.createdBy] = 0;
        }
        userTransactionData[transaction.createdBy] += transaction.amount;
      });

      const userTransactionChartData = Object.entries(userTransactionData).map(([userId, total]) => ({
        userId,
        total,
      }));

      console.log('Calculated chart data:', {
        revenueData,
        transactionVolumeData,
        avgTransactionData,
        transactionDistributionData,
        mrrGrowthData,
        userTransactionData: userTransactionChartData
      })

      return {
        revenueData,
        transactionVolumeData,
        avgTransactionData,
        transactionDistributionData,
        mrrGrowthData,
        userTransactionData: userTransactionChartData
      } as ChartData;
    } catch (error) {
      console.error('Error calculating chart data:', error)
      setError('An error occurred while calculating chart data.')
      return null
    }
  }, [dateRange])

  useEffect(() => {
    const data = calculateChartData(transactions)
    if (data) {
      setChartData(data)
      setError(null)
    }
  }, [transactions, calculateChartData])

  const handleAddTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const amount = parseFloat(formData.get('amount') as string)
    const customerName = formData.get('customerName') as string
    const notes = formData.get('notes') as string

    try {
      await addTransaction({ amount, customerName, notes })
      setIsAddTransactionOpen(false)
    } catch (error) {
      console.error('Error adding transaction:', error)
    }
  }

  const toggleViewMode = (chart: keyof typeof viewModes) => {
    setViewModes(prev => ({
      ...prev,
      [chart]: prev[chart] === 'daily' ? 'monthly' : 'daily'
    }))
  }

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
    }
  };

  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-dot-pattern">
        <Header 
          isAddTransactionOpen={isAddTransactionOpen}
          setIsAddTransactionOpen={setIsAddTransactionOpen}
        />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <h1 className="text-2xl font-bold mb-4">Analytics</h1>
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-dot-pattern">
      <Header 
        isAddTransactionOpen={isAddTransactionOpen}
        setIsAddTransactionOpen={setIsAddTransactionOpen}
      />
      <main className="flex-1 p-4 md:p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-4">Analytics</h1>
        
        <div className="flex justify-between items-center mb-4">
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
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Render charts only if chartData is available */}
        {chartData && Object.keys(chartData).length > 0 && (
          <>
            {/* Revenue Chart */}
            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Revenue</CardTitle>
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

            {/* Transaction Volume Chart */}
            <Card className="mb-6">
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

            {/* Average Transaction Amount Chart */}
            <Card className="mb-6">
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

            {/* Transaction Distribution Chart */}
            <Card className="mb-6">
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
                      {chartData.transactionDistributionData.map((entry: { name: string; value: number }, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* MRR Growth Chart */}
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

            {/* User Transactions Chart */}
            <Card>
              <CardHeader>
                <CardTitle>User Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData.userTransactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="userId" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
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