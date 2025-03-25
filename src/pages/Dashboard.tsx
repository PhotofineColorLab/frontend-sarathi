import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart4, Package, ShoppingCart, Users, TrendingUp, Clock, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { getSalesByPeriod } from '@/lib/data';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Order, Product } from '@/lib/types';
import { fetchOrders, fetchProducts } from '@/lib/api';
import { toast } from 'sonner';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
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
        console.error('Error loading dashboard data:', error);
        toast.error('Failed to load dashboard data');
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
  
  const analytics = calculateAnalytics();
  const pendingOrders = orders.filter(order => order.status === 'pending').sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  const recentSales = getSalesByPeriod();
  const productCount = products.length;
  const lowStockProducts = products.filter(p => p.stock < 15).sort((a, b) => a.stock - b.stock);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[80vh] flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium">Loading dashboard data...</h2>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Dashboard</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Welcome back, {user?.name}! Here's a summary of your shop.
          </p>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(analytics.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  From {orders.length} total orders
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Orders</CardTitle>
                <ShoppingCart className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.pendingOrders} pending
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Products</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{productCount}</div>
                <p className="text-xs text-muted-foreground">
                  {lowStockProducts.length} low stock
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '400ms' }}>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                <BarChart4 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(analytics.averageOrderValue)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Calculated from {orders.length} orders
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isAdmin && (
            <Card className="dashboard-card animate-slide-in-bottom col-span-1 lg:col-span-2" style={{ animationDelay: '500ms' }}>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Sales Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentSales}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
                        }}
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
          )}
          
          <div className={`space-y-6 ${!isAdmin ? 'lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6' : ''}`}>
            {/* Low Stock Alerts */}
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '550ms' }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">Low Stock Alerts</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
              </CardHeader>
              <CardContent>
                {lowStockProducts.length > 0 ? (
                  <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2">
                    {lowStockProducts.map((product) => (
                      <div key={product._id || product.id} className="flex items-center justify-between pb-2 border-b border-muted last:border-0 last:pb-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-destructive' : 'bg-amber-500'}`} />
                          <span className="font-medium text-sm">{product.name}</span>
                        </div>
                        <Badge variant={product.stock < 5 ? 'destructive' : 'outline'} className="text-xs">
                          {product.stock} left
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground text-sm">All products have sufficient stock</p>
                  </div>
                )}
                {lowStockProducts.length > 0 && (
                  <div className="mt-3 pt-2">
                    <Link 
                      to="/products" 
                      className="text-sm text-primary hover:underline block text-center"
                    >
                      View all products
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Recent Orders */}
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '600ms' }}>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Recent Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOrders.slice(0, 5).map((order) => (
                    <div key={order._id || order.id} className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'items'} · {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {pendingOrders.length === 0 && (
                    <div className="text-sm text-muted-foreground italic text-center py-6">
                      No pending orders
                    </div>
                  )}
                  
                  {pendingOrders.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <Link 
                        to="/orders" 
                        className="text-sm text-primary hover:underline block text-center"
                      >
                        View all orders
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}