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
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Add responsive hooks
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
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Dashboard</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Welcome back, {user?.name}! Here's a summary of your shop.
          </p>
        </div>

        {isAdmin && (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '100ms' }}>
              <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", 
                isSmallMobile ? "px-3 py-2" : "pb-2"
              )}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-xs" : "text-sm")}>Total Revenue</CardTitle>
                <TrendingUp className={cn(isSmallMobile ? "w-3 h-3" : "w-4 h-4", "text-muted-foreground")} />
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "px-3 py-2")}>
                <div className={cn(isSmallMobile ? "text-lg" : "text-2xl", "font-bold")}>
                  {formatCurrency(analytics.totalSales)}
                </div>
                <p className={cn(isSmallMobile ? "text-[10px]" : "text-xs", "text-muted-foreground")}>
                  From {orders.length} total orders
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '200ms' }}>
              <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", 
                isSmallMobile ? "px-3 py-2" : "pb-2"
              )}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-xs" : "text-sm")}>Orders</CardTitle>
                <ShoppingCart className={cn(isSmallMobile ? "w-3 h-3" : "w-4 h-4", "text-muted-foreground")} />
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "px-3 py-2")}>
                <div className={cn(isSmallMobile ? "text-lg" : "text-2xl", "font-bold")}>
                  {analytics.totalOrders}
                </div>
                <p className={cn(isSmallMobile ? "text-[10px]" : "text-xs", "text-muted-foreground")}>
                  {analytics.pendingOrders} pending
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '300ms' }}>
              <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", 
                isSmallMobile ? "px-3 py-2" : "pb-2"
              )}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-xs" : "text-sm")}>Products</CardTitle>
                <Package className={cn(isSmallMobile ? "w-3 h-3" : "w-4 h-4", "text-muted-foreground")} />
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "px-3 py-2")}>
                <div className={cn(isSmallMobile ? "text-lg" : "text-2xl", "font-bold")}>
                  {productCount}
                </div>
                <p className={cn(isSmallMobile ? "text-[10px]" : "text-xs", "text-muted-foreground")}>
                  {lowStockProducts.length} low stock
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '400ms' }}>
              <CardHeader className={cn("flex flex-row items-center justify-between space-y-0", 
                isSmallMobile ? "px-3 py-2" : "pb-2"
              )}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-xs" : "text-sm")}>Avg. Order</CardTitle>
                <BarChart4 className={cn(isSmallMobile ? "w-3 h-3" : "w-4 h-4", "text-muted-foreground")} />
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "px-3 py-2")}>
                <div className={cn(isSmallMobile ? "text-lg" : "text-2xl", "font-bold")}>
                  {formatCurrency(analytics.averageOrderValue)}
                </div>
                <p className={cn(isSmallMobile ? "text-[10px]" : "text-xs", "text-muted-foreground")}>
                  From {orders.length} orders
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {isAdmin && (
            <Card className="dashboard-card animate-slide-in-bottom col-span-1 lg:col-span-2" style={{ animationDelay: '500ms' }}>
              <CardHeader className={cn(isSmallMobile && "p-3")}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-base" : "text-lg")}>
                  Sales Overview
                </CardTitle>
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "p-2")}>
                <div className={cn("w-full", isMobile ? "h-[200px]" : "h-[300px]")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={recentSales}
                      margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { 
                            month: isSmallMobile ? '2-digit' : 'short', 
                            day: 'numeric' 
                          });
                        }}
                        tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => isSmallMobile ? `₹${value}` : `₹${value}`}
                        tick={{ fontSize: isSmallMobile ? 10 : 12 }}
                        width={isSmallMobile ? 35 : 40}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${value}`, 'Revenue']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString('en-US', { 
                            weekday: isSmallMobile ? 'short' : 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          });
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={isSmallMobile ? 1.5 : 2}
                        activeDot={{ r: isSmallMobile ? 5 : 8 }}
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
              <CardHeader className={cn(isSmallMobile && "p-3")}>
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-base" : "text-lg")}>
                  {isMobile ? "Pending Orders" : "Recent Orders Pending"}
                </CardTitle>
              </CardHeader>
              <CardContent className={cn(isSmallMobile && "p-2")}>
                {pendingOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <Clock className="h-10 w-10 text-muted-foreground mb-3 opacity-25" />
                    <p className="text-muted-foreground">No pending orders</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingOrders.slice(0, 4).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className={cn(
                            "font-medium",
                            isSmallMobile ? "text-sm" : ""
                          )}>
                            Order #{order.orderNumber}
                          </p>
                          <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "w-fit capitalize", 
                                isSmallMobile && "text-[10px] px-1 py-0 h-5"
                              )}
                            >
                              {order.status}
                            </Badge>
                            <p className={cn(
                              "text-xs text-muted-foreground",
                              isSmallMobile && "text-[10px]"
                            )}>
                              {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={cn(
                          "font-medium", 
                          isSmallMobile ? "text-sm" : ""
                        )}>
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                    ))}
                    {pendingOrders.length > 4 && (
                      <div className="text-center pt-2">
                        <Link 
                          to="/orders" 
                          className="text-sm text-primary hover:underline"
                        >
                          View all {pendingOrders.length} pending orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {isAdmin && (
          <Card className="dashboard-card animate-slide-in-bottom" style={{ animationDelay: '700ms' }}>
            <CardHeader className={cn(isSmallMobile && "p-3")}>
              <div className="flex items-center justify-between">
                <CardTitle className={cn("font-medium", isSmallMobile ? "text-base" : "text-lg")}>
                  Low Stock Products
                </CardTitle>
                <Badge variant="outline" className="ml-2">
                  {lowStockProducts.length} items
                </Badge>
              </div>
            </CardHeader>
            <CardContent className={cn(isSmallMobile && "p-2")}>
              {lowStockProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Package className="h-10 w-10 text-muted-foreground mb-3 opacity-25" />
                  <p className="text-muted-foreground">All products are well stocked</p>
                </div>
              ) : (
                <>
                  <div className={cn(
                    "rounded-md border", 
                    isSmallMobile ? "text-sm" : ""
                  )}>
                    <div className="grid grid-cols-10 gap-2 p-3 bg-muted/50">
                      <div className="col-span-5 text-muted-foreground font-medium text-xs">Product</div>
                      <div className="col-span-2 text-muted-foreground font-medium text-xs">Price</div>
                      <div className="col-span-3 text-muted-foreground font-medium text-xs">Stock</div>
                    </div>
                    <div className="divide-y">
                      {lowStockProducts.slice(0, isMobile ? 3 : 5).map((product) => (
                        <div key={product.id || product._id} className="grid grid-cols-10 gap-2 p-3">
                          <div className="col-span-5 truncate font-medium">
                            {product.name}
                          </div>
                          <div className="col-span-2 text-muted-foreground">
                            {formatCurrency(product.price)}
                          </div>
                          <div className="col-span-3">
                            <Badge 
                              variant={product.stock === 0 ? "destructive" : "outline"} 
                              className={cn(
                                isSmallMobile && "text-[10px] px-1 py-0 h-5"
                              )}
                            >
                              {product.stock} {product.stock === 1 ? 'item' : 'items'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {lowStockProducts.length > (isMobile ? 3 : 5) && (
                    <div className="text-center pt-4">
                      <Link to="/products" className="text-sm text-primary hover:underline">
                        View all {lowStockProducts.length} low stock products
                      </Link>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}