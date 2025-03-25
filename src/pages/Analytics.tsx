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
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57'];

export default function Analytics() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Responsive hooks
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

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
        fontSize={isSmallMobile ? 8 : 12}
      >
        {isSmallMobile && percent < 0.05 ? '' : `${(percent * 100).toFixed(0)}%`}
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
    <Card>
      <CardHeader className={cn("flex flex-row items-center justify-between space-y-0 pb-2", 
        isSmallMobile && "px-3 py-2"
      )}>
        <CardTitle className={cn("font-medium", isSmallMobile ? "text-xs" : "text-sm")}>
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent className={cn(isSmallMobile && "px-3 py-2")}>
        <div className={cn(isSmallMobile ? "text-base" : "text-2xl", "font-bold")}>{value}</div>
        <p className={cn(
          "text-muted-foreground flex items-center space-x-2",
          isSmallMobile ? "text-xs mt-1" : "mt-2"
        )}>
          <span>{description}</span>
          {trend && (
            <span className={`flex items-center text-xs ${trend.positive ? 'text-green-500' : 'text-red-500'}`}>
              {trend.positive ? <ArrowUpRight className={cn(isSmallMobile ? "h-3 w-3" : "h-4 w-4")} /> : <ArrowDownRight className={cn(isSmallMobile ? "h-3 w-3" : "h-4 w-4")} />}
              <span>{trend.value}%</span>
            </span>
          )}
        </p>
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
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Analytics</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Track your sales performance and inventory
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={formatCurrency(analytics.totalSales)}
            description="Total sales"
            trend={{ value: 12.5, positive: true }}
            icon={<TrendingUp className={cn(isSmallMobile ? "h-3.5 w-3.5" : "h-5 w-5", "text-muted-foreground")} />}
          />
          <StatCard
            title="Orders"
            value={analytics.totalOrders.toString()}
            description="Total orders"
            trend={{ value: 8.2, positive: true }}
            icon={<ShoppingCart className={cn(isSmallMobile ? "h-3.5 w-3.5" : "h-5 w-5", "text-muted-foreground")} />}
          />
          <StatCard
            title="Average Order"
            value={formatCurrency(analytics.averageOrderValue)}
            description="Per order"
            trend={{ value: 3.1, positive: true }}
            icon={<BarChart4 className={cn(isSmallMobile ? "h-3.5 w-3.5" : "h-5 w-5", "text-muted-foreground")} />}
          />
          <StatCard
            title="Pending Orders"
            value={analytics.pendingOrders.toString()}
            description="Awaiting fulfillment"
            trend={null}
            icon={<Users className={cn(isSmallMobile ? "h-3.5 w-3.5" : "h-5 w-5", "text-muted-foreground")} />}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader className={cn(isSmallMobile && "p-3")}>
              <CardTitle className={cn(isSmallMobile ? "text-base" : "text-lg")}>
                Revenue Over Time
              </CardTitle>
              <CardDescription className={cn(isSmallMobile && "text-xs")}>
                Daily revenue for the past 7 days
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(isSmallMobile && "p-3")}>
              <div className={cn("h-[300px]", isMobile && "h-[200px]")}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={salesByPeriod}
                    margin={{
                      top: 20,
                      right: isSmallMobile ? 5 : 20,
                      left: isSmallMobile ? 0 : 20,
                      bottom: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString('en-US', { 
                          month: isSmallMobile ? 'numeric' : 'short', 
                          day: 'numeric' 
                        });
                      }}
                      tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      tickFormatter={(value) => isSmallMobile ? `₹${value/1000}k` : `₹${value}`}
                      tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                      width={isSmallMobile ? 35 : 60}
                    />
                    <Tooltip 
                      content={<CustomTooltip formatter={formatCurrency} />} 
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={cn(isSmallMobile && "p-3")}>
              <CardTitle className={cn(isSmallMobile ? "text-base" : "text-lg")}>
                Revenue by Category
              </CardTitle>
              <CardDescription className={cn(isSmallMobile && "text-xs")}>
                Distribution of sales by product category
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(isSmallMobile && "p-3")}>
              <div className={cn("h-[300px]", isMobile && "h-[250px]")}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={salesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={isSmallMobile ? 70 : 80}
                      fill="#8884d8"
                      dataKey="amount"
                    >
                      {salesByCategory.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Legend 
                      layout={isSmallMobile ? "horizontal" : "vertical"}
                      verticalAlign={isSmallMobile ? "bottom" : "middle"}
                      align={isSmallMobile ? "center" : "right"}
                      formatter={(value) => {
                        // Truncate long category names on small screens
                        if (isSmallMobile && value.length > 10) {
                          return `${value.substring(0, 8)}...`;
                        }
                        return value;
                      }}
                    />
                    <Tooltip 
                      formatter={(value) => formatCurrency(Number(value))}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className={cn(isSmallMobile && "p-3")}>
              <CardTitle className={cn(isSmallMobile ? "text-base" : "text-lg")}>
                Top Selling Categories
              </CardTitle>
              <CardDescription className={cn(isSmallMobile && "text-xs")}>
                Revenue by product category
              </CardDescription>
            </CardHeader>
            <CardContent className={cn(isSmallMobile && "p-3")}>
              <div className={cn("h-[300px]", isMobile && "h-[250px]")}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={salesByCategory.slice(0, isSmallMobile ? 5 : 7)}
                    layout="vertical"
                    margin={{
                      top: 5,
                      right: isSmallMobile ? 5 : 20,
                      left: isSmallMobile ? 70 : 90,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis 
                      type="number" 
                      tickFormatter={(value) => isSmallMobile ? `₹${value/1000}k` : `₹${value}`}
                      tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                    />
                    <YAxis 
                      type="category" 
                      dataKey="category" 
                      tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                      tickFormatter={(value) => {
                        // Truncate long category names on small screens
                        if (isSmallMobile && value.length > 10) {
                          return `${value.substring(0, 8)}...`;
                        }
                        return value;
                      }}
                    />
                    <Tooltip 
                      content={<CustomTooltip formatter={formatCurrency} />} 
                    />
                    <Bar 
                      dataKey="amount" 
                      fill="hsl(var(--primary))" 
                      radius={[0, 4, 4, 0]} 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
