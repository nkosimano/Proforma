import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, FileText, Users, Calendar, Download } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface AnalyticsData {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  pendingInvoices: number;
  revenueGrowth: number;
  invoiceGrowth: number;
  monthlyRevenue: Array<{ month: string; revenue: number; invoices: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  topCustomers: Array<{ name: string; revenue: number; invoices: number }>;
  paymentMethods: Array<{ method: string; amount: number; count: number }>;
}

interface AnalyticsProps {
  className?: string;
}

const Analytics: React.FC<AnalyticsProps> = ({ className = '' }) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last_30_days');


  const processAnalyticsData = useCallback((invoices: Array<{
    total?: number;
    status: string;
    customer_id: string;
    created_at: string;
    customers?: { name: string };
    payments?: Array<{
      amount?: number;
      payment_method?: string;
      created_at: string;
    }>;
  }>, customers: Array<{ name: string }>, startDate: Date, endDate: Date): AnalyticsData => {
    // Calculate totals
    const totalRevenue = invoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const totalInvoices = invoices.length;
    const totalCustomers = customers.length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

    // Calculate growth (mock data for demo)
    const revenueGrowth = Math.random() * 20 - 10; // -10% to +10%
    const invoiceGrowth = Math.random() * 30 - 15; // -15% to +15%

    // Monthly revenue data
    const monthlyData = generateMonthlyData(invoices, startDate, endDate);

    // Status distribution
    const statusCounts = invoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = [
      { name: 'Paid', value: statusCounts.paid || 0, color: '#10B981' },
      { name: 'Pending', value: statusCounts.pending || 0, color: '#F59E0B' },
      { name: 'Overdue', value: statusCounts.overdue || 0, color: '#EF4444' },
      { name: 'Draft', value: statusCounts.draft || 0, color: '#6B7280' }
    ];

    // Top customers
    const customerRevenue = invoices.reduce((acc, invoice) => {
      const customerId = invoice.customer_id;
      const customerName = invoice.customers?.name || 'Unknown Customer';
      if (!acc[customerId]) {
        acc[customerId] = { name: customerName, revenue: 0, invoices: 0 };
      }
      acc[customerId].revenue += invoice.total || 0;
      acc[customerId].invoices += 1;
      return acc;
    }, {} as Record<string, { name: string; revenue: number; invoices: number }>);

    const topCustomers = Object.values(customerRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Payment methods
    const paymentMethodData = invoices
      .flatMap(invoice => invoice.payments || [])
      .reduce((acc, payment) => {
        const method = payment.payment_method || 'Unknown';
        if (!acc[method]) {
          acc[method] = { method, amount: 0, count: 0 };
        }
        acc[method].amount += payment.amount || 0;
        acc[method].count += 1;
        return acc;
      }, {} as Record<string, { method: string; amount: number; count: number }>);

    const paymentMethods = Object.values(paymentMethodData);

    return {
      totalRevenue,
      totalInvoices,
      totalCustomers,
      pendingInvoices,
      revenueGrowth,
      invoiceGrowth,
      monthlyRevenue: monthlyData,
      statusDistribution,
      topCustomers,
      paymentMethods
    };
  }, []);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      switch (dateRange) {
        case 'last_7_days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'last_30_days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case 'last_90_days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case 'last_year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }

      // Fetch invoices data
      // Fetch invoices with proper database-level joins (migrations applied)
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers(name, email),
          payments(amount, gateway, created_at)
        `)
        .eq('user_id', user.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const userInvoices = invoices || [];

      if (invoicesError) throw invoicesError;

      // Fetch customers data
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id);

      if (customersError) throw customersError;

      // Process analytics data
      const analyticsData = processAnalyticsData(userInvoices, customers || [], startDate, endDate);
      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [dateRange, processAnalyticsData]);

  useEffect(() => {
    loadAnalyticsData().catch(err => {
      console.error('Error in loadAnalyticsData useEffect:', err);
    });
  }, [loadAnalyticsData]);



  const generateMonthlyData = (invoices: Array<{
    total?: number;
    created_at: string;
  }>, startDate: Date, endDate: Date) => {
    const months = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
      const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
      
      const monthInvoices = invoices.filter(invoice => {
        const invoiceDate = new Date(invoice.created_at);
        return invoiceDate >= monthStart && invoiceDate <= monthEnd;
      });
      
      const monthRevenue = monthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      months.push({
        month: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        invoices: monthInvoices.length
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const exportData = () => {
    if (!data) return;
    
    const exportData = {
      summary: {
        totalRevenue: data.totalRevenue,
        totalInvoices: data.totalInvoices,
        totalCustomers: data.totalCustomers,
        pendingInvoices: data.pendingInvoices
      },
      monthlyRevenue: data.monthlyRevenue,
      topCustomers: data.topCustomers,
      paymentMethods: data.paymentMethods
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-12">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics data available</h3>
          <p className="text-gray-600">Create some invoices to see your analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics &amp; Reports</h1>
          <p className="text-gray-600 mt-1">Track your business performance and insights</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="last_7_days">Last 7 days</option>
            <option value="last_30_days">Last 30 days</option>
            <option value="last_90_days">Last 90 days</option>
            <option value="last_year">Last year</option>
          </select>
          <button
            onClick={exportData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">R{data.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {data.revenueGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              data.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.revenueGrowth >= 0 ? '+' : ''}{data.revenueGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalInvoices}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {data.invoiceGrowth >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
            )}
            <span className={`text-sm font-medium ${
              data.invoiceGrowth >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {data.invoiceGrowth >= 0 ? '+' : ''}{data.invoiceGrowth.toFixed(1)}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{data.totalCustomers}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Active customers</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{data.pendingInvoices}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Awaiting payment</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`R${Number(value).toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Invoice Status Distribution */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topCustomers} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [`R${Number(value).toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-4">
            {data.paymentMethods.map((method, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{method.method}</p>
                  <p className="text-sm text-gray-500">{method.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">R{method.amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;