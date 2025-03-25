import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

import { Order, OrderStatus, PaymentCondition, Product, OrderItem, User } from '@/lib/types';
import { getProducts, updateProduct } from '@/lib/data';
import { updateOrder, updateOrderWithImage, fetchStaff } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

// Order form schema
const orderFormSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name is required' }),
  customerPhone: z.string().min(10, { message: 'Phone number is required' }),
  customerEmail: z.string().email().optional().or(z.literal('')),
  status: z.enum(['pending', 'dc', 'invoice', 'dispatched']),
  paymentCondition: z.enum(['immediate', 'days15', 'days30']),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface UpdateOrderFormProps {
  order: Order;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UpdateOrderForm({ order, onSuccess, onCancel }: UpdateOrderFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [orderImage, setOrderImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(order.orderImage || null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  
  const products = getProducts();
  const availableProducts = products.filter(product => product.stock > 0);
  
  // Fetch staff members when component mounts
  useEffect(() => {
    const loadStaffMembers = async () => {
      try {
        const staff = await fetchStaff();
        setStaffMembers(staff);
      } catch (error) {
        console.error("Error loading staff members:", error);
        toast.error("Failed to load staff members");
      }
    };
    
    loadStaffMembers();
  }, []);
  
  // Initialize order items from the existing order
  useEffect(() => {
    // Convert order items to the format expected by the form
    if (order.orderItems && order.orderItems.length > 0) {
      const formattedItems = order.orderItems.map(item => ({
        id: item._id || item.id || Math.random().toString(36).substring(2, 9),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }));
      setOrderItems(formattedItems);
    }
  }, [order]);
  
  // Initialize form with order data
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || '',
      status: order.status as OrderStatus,
      paymentCondition: order.paymentCondition as PaymentCondition || 'immediate',
      assignedTo: order.assignedTo || 'all',
      notes: order.notes || '',
    },
  });

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setOrderImage(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add item to order
  const handleAddItem = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Check if we already have this product in our items
    const existingItemIndex = orderItems.findIndex(item => item.productId === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update the existing item
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += quantity;
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: Math.random().toString(36).substring(2, 9),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        price: product.price,
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    // Reset selection
    setSelectedProduct('');
    setQuantity(1);
  };

  // Remove item from order
  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  // Calculate order total
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  // Handle form submission
  const onSubmit = async (values: OrderFormValues) => {
    if (orderItems.length === 0) {
      toast.error('Please add at least one product to the order');
      return;
    }

    setIsLoading(true);
    
    try {
      // Set dispatchDate if status is dispatched
      const dispatchDate = values.status === 'dispatched' ? new Date().toISOString() : undefined;
      
      // Clean up order items to match backend expectations
      const sanitizedItems = orderItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Create the base order data
      const orderData = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || '',
        status: values.status,
        paymentCondition: values.paymentCondition,
        assignedTo: values.assignedTo === 'all' ? null : values.assignedTo,
        notes: values.notes || '',
        items: sanitizedItems,
        total: calculateTotal()
      };

      // Create a new object with the dispatchDate if needed
      const finalOrderData = dispatchDate 
        ? { ...orderData, dispatchDate } 
        : orderData;
      
      // If we need to update with a new image, we should use FormData
      if (orderImage) {
        const formData = new FormData();
        formData.append('orderData', JSON.stringify(finalOrderData));
        formData.append('orderImage', orderImage);
        
        // Use the update with FormData approach
        await updateOrderWithImage(order._id, formData);
      } else {
        // Update order without changing the image
        await updateOrder(order._id, finalOrderData);
      }
      
      toast.success('Order updated successfully');
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/orders');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Update Order</h2>
          <p className="text-muted-foreground">Edit the existing order details</p>
        </div>
        <Button
          variant="outline"
          onClick={onCancel || (() => navigate('/orders'))}
        >
          Cancel
        </Button>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Customer Information</h3>
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter customer name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter any additional notes"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Order Image Display */}
                {imagePreview && (
                  <div className="space-y-2">
                    <FormLabel>Order Image</FormLabel>
                    <div className="relative w-full h-32">
                      <img 
                        src={imagePreview} 
                        alt="Order Preview" 
                        className="w-full h-full object-contain rounded-md border" 
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Order Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Settings</h3>
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="dc">DC Generated</SelectItem>
                          <SelectItem value="invoice">Invoice Generated</SelectItem>
                          <SelectItem value="dispatched">Dispatched</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="paymentCondition"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Payment Condition</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="immediate" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Immediate
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="days15" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              15 Days
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="days30" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              30 Days
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assigned To</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select staff member" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Staff</SelectItem>
                          {staffMembers.map((staff) => (
                            <SelectItem 
                              key={staff.id || staff._id} 
                              value={staff.id || staff._id}
                            >
                              {staff.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                
                <div className="flex flex-col space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <Select
                        value={selectedProduct}
                        onValueChange={setSelectedProduct}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem 
                              key={product.id}
                              value={product.id}
                              disabled={product.stock <= 0}
                            >
                              {product.name} - ₹{product.price.toFixed(2)} - Stock: {product.stock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                      />
                    </div>
                  </div>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleAddItem}
                    disabled={!selectedProduct}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                
                {orderItems.length > 0 ? (
                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product</TableHead>
                            <TableHead className="text-center">Qty</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orderItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.productName}</TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">₹{item.price.toFixed(2)}</TableCell>
                              <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="text-center py-6 border rounded-md border-dashed">
                    <p className="text-muted-foreground">No items added yet</p>
                  </div>
                )}
                
                {orderItems.length > 0 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-lg font-medium">Total Amount:</span>
                    <span className="text-xl font-bold">₹{calculateTotal().toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel || (() => navigate('/orders'))}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Updating Order...' : 'Update Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 