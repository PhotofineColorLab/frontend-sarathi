import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { OrdersFilters } from '@/components/orders/OrdersFilters';
import { OrdersTable } from '@/components/orders/OrdersTable';
import { EmptyOrdersState } from '@/components/orders/EmptyOrdersState';
import { OrderViewDialog } from '@/components/orders/OrderViewDialog';
import { DeleteOrderDialog } from '@/components/orders/DeleteOrderDialog';
import { MarkPaidDialog } from '@/components/orders/MarkPaidDialog';
import { Order, OrderStatus } from '@/lib/types';
import OrderForm from '@/components/forms/OrderForm';
import UpdateOrderForm from '@/components/forms/UpdateOrderForm';
import { PaginationWrapper } from '@/components/ui/pagination-wrapper';
import { fetchOrders, fetchOrdersByDateRange, fetchOrdersByAssignedTo, deleteOrder, updateOrder, markOrderAsPaid } from '@/lib/api';
import { isAfter, isBefore, isEqual, startOfDay } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

export default function Orders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<OrderStatus | 'all' | 'my-orders'>('all');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMarkPaidDialogOpen, setIsMarkPaidDialogOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [activeTab]);
  
  // Reload orders when date range changes (but only if both from and to are set)
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      loadOrders();
    }
  }, [dateRange.from, dateRange.to]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      console.log("Loading orders with status:", activeTab);
      
      let fetchedOrders;
      
      // If date range is selected, use that API instead of status filter
      if (dateRange.from && dateRange.to) {
        fetchedOrders = await fetchOrdersByDateRange(dateRange.from, dateRange.to);
      } 
      // If my-orders is selected, fetch orders assigned to current user
      else if (activeTab === 'my-orders' && user) {
        // Use _id if available, otherwise use id
        const userId = user._id || user.id;
        if (userId) {
          console.log("Fetching orders for user:", userId);
          fetchedOrders = await fetchOrdersByAssignedTo(userId);
        } else {
          console.error("User ID not found:", user);
          toast.error("Could not determine user ID for assignments");
          fetchedOrders = await fetchOrders();
        }
      }
      // Otherwise fetch by status
      else {
        fetchedOrders = await fetchOrders(activeTab === 'all' ? undefined : activeTab);
        
        // For staff members (non-admin), filter out orders that aren't assigned to them or to all
        if (user && user.role !== 'admin') {
          const userId = user._id || user.id;
          fetchedOrders = fetchedOrders.filter(order => 
            !order.assignedTo || order.assignedTo === userId
          );
        }
      }
      
      setOrders(fetchedOrders);
      toast.success("Orders loaded successfully");
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  // Date filter helper function
  const isWithinDateRange = (date: Date, from?: Date, to?: Date): boolean => {
    if (!from) return true;
    
    const orderDate = startOfDay(new Date(date));
    const fromDate = startOfDay(new Date(from));
    const toDate = to ? startOfDay(new Date(to)) : fromDate;
    
    return (
      (isAfter(orderDate, fromDate) || isEqual(orderDate, fromDate)) &&
      (isBefore(orderDate, toDate) || isEqual(orderDate, toDate))
    );
  };

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setIsUpdateLoading(true);
    
    try {
      // Set dispatchDate if status is changing to dispatched
      const updates: any = { status };
      if (status === 'dispatched') {
        updates.dispatchDate = new Date();
      }
      
      const updatedOrder = await updateOrder(orderId, updates);
      
      setOrders(
        orders.map(order => (order._id === orderId ? updatedOrder : order))
      );
      
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleMarkPaid = async (orderId: string) => {
    setIsUpdateLoading(true);
    
    try {
      const updatedOrder = await markOrderAsPaid(orderId);
      
      setOrders(
        orders.map(order => (order._id === orderId ? updatedOrder : order))
      );
      
      toast.success('Order marked as paid');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark order as paid');
    } finally {
      setIsUpdateLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await deleteOrder(orderId);
      setOrders(orders.filter(order => order._id !== orderId));
      setIsDeleteDialogOpen(false);
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete order');
    }
  };

  const handleUpdateOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsUpdateMode(true);
  };

  const filteredOrders = orders.filter(order => {
    // First filter by search term
    const matchesSearch = searchTerm === '' 
      ? true 
      : order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (order._id && order._id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Then filter by date range - checking only createdAt
    const matchesDateRange = dateRange.from 
      ? isWithinDateRange(new Date(order.createdAt), dateRange.from, dateRange.to)
      : true;
      
    return matchesSearch && matchesDateRange;
  });

  if (isCreateMode) {
    return (
      <DashboardLayout>
        <OrderForm onSuccess={() => {
          setIsCreateMode(false);
          loadOrders();
        }} />
      </DashboardLayout>
    );
  }

  if (isUpdateMode && selectedOrder) {
    return (
      <DashboardLayout>
        <UpdateOrderForm 
          order={selectedOrder}
          onSuccess={() => {
            setIsUpdateMode(false);
            setSelectedOrder(null);
            loadOrders();
          }}
          onCancel={() => {
            setIsUpdateMode(false);
            setSelectedOrder(null);
          }}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Orders</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Manage customer orders and update their statuses
          </p>
        </div>

        <OrdersFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          dateRange={dateRange}
          setDateRange={setDateRange}
          onRefresh={loadOrders}
          onCreateOrder={() => setIsCreateMode(true)}
          showMyOrders={!!user}
          isAdmin={user?.role === 'admin'}
        />

        <Card className="border shadow-sm">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredOrders.length === 0 ? (
              <EmptyOrdersState searchTerm={searchTerm} />
            ) : (
              <PaginationWrapper
                data={filteredOrders}
                itemsPerPage={7}
              >
                {(paginatedOrders) => (
                  <OrdersTable
                    orders={paginatedOrders}
                    onViewOrder={(order) => {
                      setSelectedOrder(order);
                      setIsViewDialogOpen(true);
                    }}
                    onUpdateOrder={handleUpdateOrder}
                    onDeleteOrder={(order) => {
                      setSelectedOrder(order);
                      setIsDeleteDialogOpen(true);
                    }}
                    onMarkPaid={(order) => {
                      setSelectedOrder(order);
                      setIsMarkPaidDialogOpen(true);
                    }}
                    onStatusChange={handleStatusChange}
                    isUpdateLoading={isUpdateLoading}
                    formatCurrency={formatCurrency}
                  />
                )}
              </PaginationWrapper>
            )}
          </CardContent>
        </Card>
      </div>

      <OrderViewDialog
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onMarkPaid={handleMarkPaid}
        onEditOrder={handleUpdateOrder}
        formatCurrency={formatCurrency}
      />

      <DeleteOrderDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        order={selectedOrder}
        onDelete={handleDeleteOrder}
      />

      <MarkPaidDialog
        isOpen={isMarkPaidDialogOpen}
        onOpenChange={setIsMarkPaidDialogOpen}
        order={selectedOrder}
        onMarkPaid={handleMarkPaid}
      />
    </DashboardLayout>
  );
}
