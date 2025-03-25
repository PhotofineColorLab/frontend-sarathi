import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  BarChart4, 
  TrendingUp, 
  PieChart as PieChartIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Users,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Order, Product } from '@/lib/types';
import { fetchOrders, fetchProducts } from '@/lib/api';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data from API
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch all orders and products in parallel
        const [ordersData, productsData] = await Promise.all([
          fetchOrders(),
          fetchProducts()
        ]);
        
        setOrders(ordersData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calculate analytics from real data
  const calculateAnalytics = () => {
    if (!orders.length) return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      pendingOrders: 0
    };
    
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    
    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      pendingOrders
    };
  };

  // Calculate sales by category
  const calculateSalesByCategory = () => {
    const categories: { [key: string]: number } = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const product = products.find(p => p._id === item.productId || p.id === item.productId);
        if (product) {
          const { category } = product;
          const amount = item.price * item.quantity;
          categories[category] = (categories[category] || 0) + amount;
        }
      });
    });
    
    return Object.entries(categories).map(([category, amount]) => ({
      category,
      amount: Number(amount.toFixed(2)),
    })).sort((a, b) => b.amount - a.amount);
  };

  // Calculate sales by period (last 7 days)
  const calculateSalesByPeriod = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();
    
    const salesByDate: { [date: string]: number } = {};
    
    // Initialize all dates with 0
    last7Days.forEach(date => {
      salesByDate[date] = 0;
    });
    
    // Sum up sales for each date
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
      if (last7Days.includes(orderDate)) {
        salesByDate[orderDate] += order.total;
      }
    });
    
    return Object.entries(salesByDate).map(([date, amount]) => ({
      date,
      amount: Number(amount.toFixed(2)),
    }));
  };

  const analytics = calculateAnalytics();
  const salesByCategory = calculateSalesByCategory();
  const salesByPeriod = calculateSalesByPeriod();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label, formatter }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 border shadow-elevation-low">
          <p className="text-sm font-medium mb-1">{label}</p>
          <p className="text-sm text-primary">
            {typeof formatter === 'function' 
              ? formatter(payload[0].value) 
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const StatCard = ({ 
    title, 
    value, 
    description, 
    trend, 
    icon 
  }: { 
    title: string; 
    value: string; 
    description: string; 
    trend: { value: number; positive: boolean } | null; 
    icon: React.ReactNode 
  }) => (
    <Card className="dashboard-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {trend && (
            <span className={`flex items-center text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.positive ? (
                <ArrowUpRight className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownRight className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
            </span>
          )}
          <p className="text-xs text-muted-foreground ml-2">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium">Loading analytics data...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Analytics</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Get insights into your business performance with detailed analytics
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalSales)}
            description="vs. previous month"
            trend={{ value: 12.5, positive: true }}
            icon={<TrendingUp className="w-4 h-4 text-muted-foreground" />}
          />
          
          <StatCard
            title="Average Order Value"
            value={formatCurrency(analytics.averageOrderValue)}
            description="vs. previous month"
            trend={{ value: 3.2, positive: true }}
            icon={<BarChart4 className="w-4 h-4 text-muted-foreground" />}
          />
          
          <StatCard
            title="Total Orders"
            value={analytics.totalOrders.toString()}
            description="completed orders"
            trend={{ value: 8.1, positive: true }}
            icon={<ShoppingCart className="w-4 h-4 text-muted-foreground" />}
          />
          
          <StatCard
            title="Pending Orders"
            value={analytics.pendingOrders.toString()}
            description="need processing"
            trend={null}
            icon={<Users className="w-4 h-4 text-muted-foreground" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Revenue Trend</CardTitle>
                  <CardDescription>Revenue over the last 7 days</CardDescription>
                </div>
                <TrendingUp className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesByPeriod}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      tickFormatter={(value) => `₹${value}`} 
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="dashboard-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-medium">Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across product categories</CardDescription>
                </div>
                <PieChartIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={130}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                    <Legend formatter={(value, entry, index) => {
                      return (
                        <span className="text-xs capitalize">
                          {value}: {formatCurrency(salesByCategory[index]?.amount || 0)}
                        </span>
                      );
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="dashboard-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-medium">Category Performance</CardTitle>
                <CardDescription>Sales performance by category</CardDescription>
              </div>
              <BarChart4 className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByCategory}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="category" 
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${value}`} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                  <Bar 
                    dataKey="amount" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
