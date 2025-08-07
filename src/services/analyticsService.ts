import { supabase } from '../lib/supabase';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export interface RevenueData {
  month: string;
  revenue: number;
  invoices: number;
}

export interface PaymentStatusData {
  status: string;
  count: number;
  amount: number;
}

export interface CustomerData {
  name: string;
  totalInvoices: number;
  totalAmount: number;
  lastInvoiceDate: string;
}

export interface MonthlyTrend {
  month: string;
  invoices: number;
  quotes: number;
  customers: number;
  revenue: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalInvoices: number;
  totalCustomers: number;
  totalQuotes: number;
  pendingPayments: number;
  overdueInvoices: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
  revenueGrowth: number;
}

export const analyticsService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const now = new Date();
      const thisMonthStart = startOfMonth(now);
      const thisMonthEnd = endOfMonth(now);
      const lastMonthStart = startOfMonth(subMonths(now, 1));
      const lastMonthEnd = endOfMonth(subMonths(now, 1));

      // Get total revenue from payments
      const { data: totalRevenueData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = totalRevenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get total invoices
      const { count: totalInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true });

      // Get total customers
      const { count: totalCustomers } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true });

      // Get total quotes
      const { count: totalQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });

      // Get pending payments
      const { data: pendingPaymentsData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'pending');

      const pendingPayments = pendingPaymentsData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get overdue invoices
      const { count: overdueInvoices } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'overdue');

      // Get this month's revenue
      const { data: thisMonthData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thisMonthStart.toISOString())
        .lte('created_at', thisMonthEnd.toISOString());

      const thisMonthRevenue = thisMonthData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Get last month's revenue
      const { data: lastMonthData } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      const lastMonthRevenue = lastMonthData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      // Calculate revenue growth
      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      return {
        totalRevenue,
        totalInvoices: totalInvoices || 0,
        totalCustomers: totalCustomers || 0,
        totalQuotes: totalQuotes || 0,
        pendingPayments,
        overdueInvoices: overdueInvoices || 0,
        thisMonthRevenue,
        lastMonthRevenue,
        revenueGrowth,
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalRevenue: 0,
        totalInvoices: 0,
        totalCustomers: 0,
        totalQuotes: 0,
        pendingPayments: 0,
        overdueInvoices: 0,
        thisMonthRevenue: 0,
        lastMonthRevenue: 0,
        revenueGrowth: 0,
      };
    }
  },

  // Get revenue data for charts
  async getRevenueData(months: number = 12): Promise<RevenueData[]> {
    try {
      const data: RevenueData[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM yyyy');

        // Get revenue for this month
        const { data: revenueData } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const revenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        // Get invoice count for this month
        const { count: invoices } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        data.push({
          month: monthLabel,
          revenue,
          invoices: invoices || 0,
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching revenue data:', error);
      return [];
    }
  },

  // Get payment status distribution
  async getPaymentStatusData(): Promise<PaymentStatusData[]> {
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('status, amount');

      if (!payments) return [];

      const statusMap = new Map<string, { count: number; amount: number }>();

      payments.forEach(payment => {
        const current = statusMap.get(payment.status) || { count: 0, amount: 0 };
        statusMap.set(payment.status, {
          count: current.count + 1,
          amount: current.amount + payment.amount,
        });
      });

      return Array.from(statusMap.entries()).map(([status, data]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count: data.count,
        amount: data.amount,
      }));
    } catch (error) {
      console.error('Error fetching payment status data:', error);
      return [];
    }
  },

  // Get top customers by revenue
  async getTopCustomers(limit: number = 10): Promise<CustomerData[]> {
    try {
      const { data: invoices } = await supabase
        .from('invoices')
        .select(`
          client_details,
          totals,
          created_at,
          customers!inner(name)
        `);

      if (!invoices) return [];

      const customerMap = new Map<string, {
        name: string;
        totalInvoices: number;
        totalAmount: number;
        lastInvoiceDate: string;
      }>();

      invoices.forEach(invoice => {
        const clientDetails = invoice.client_details as {
          name?: string;
          [key: string]: unknown;
        };
        const totals = invoice.totals as {
          total?: number;
          [key: string]: unknown;
        };
        const customerName = clientDetails?.name || 'Unknown Customer';
        
        const current = customerMap.get(customerName) || {
          name: customerName,
          totalInvoices: 0,
          totalAmount: 0,
          lastInvoiceDate: invoice.created_at,
        };

        customerMap.set(customerName, {
          name: customerName,
          totalInvoices: current.totalInvoices + 1,
          totalAmount: current.totalAmount + (totals?.total || 0),
          lastInvoiceDate: invoice.created_at > current.lastInvoiceDate 
            ? invoice.created_at 
            : current.lastInvoiceDate,
        });
      });

      return Array.from(customerMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching top customers:', error);
      return [];
    }
  },

  // Get monthly trends
  async getMonthlyTrends(months: number = 6): Promise<MonthlyTrend[]> {
    try {
      const data: MonthlyTrend[] = [];
      const now = new Date();

      for (let i = months - 1; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthLabel = format(monthDate, 'MMM yyyy');

        // Get invoices count
        const { count: invoices } = await supabase
          .from('invoices')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        // Get quotes count
        const { count: quotes } = await supabase
          .from('quotes')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        // Get customers count
        const { count: customers } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        // Get revenue
        const { data: revenueData } = await supabase
          .from('payments')
          .select('amount')
          .eq('status', 'completed')
          .gte('created_at', monthStart.toISOString())
          .lte('created_at', monthEnd.toISOString());

        const revenue = revenueData?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

        data.push({
          month: monthLabel,
          invoices: invoices || 0,
          quotes: quotes || 0,
          customers: customers || 0,
          revenue,
        });
      }

      return data;
    } catch (error) {
      console.error('Error fetching monthly trends:', error);
      return [];
    }
  },

  // Format currency for display
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Calculate percentage change
  calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  },
};

export default analyticsService;