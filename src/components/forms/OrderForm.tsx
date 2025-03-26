import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Upload, CalendarIcon, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

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
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

import { OrderStatus, PaymentCondition, Product, OrderItem, User, Order } from '@/lib/types';
import { createOrder, fetchStaff, fetchProducts, updateProduct, updateOrder, updateOrderWithImage } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';

// Order form schema
const orderFormSchema = z.object({
  customerName: z.string().min(2, { message: 'Customer name is required' }),
  customerPhone: z.string().min(10, { message: 'Phone number is required' }),
  customerEmail: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  status: z.enum(['pending', 'dc', 'invoice', 'dispatched']),
  paymentCondition: z.enum(['immediate', 'days15', 'days30']),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSuccess?: () => void;
  initialOrder?: Order;
  onCancel?: () => void;
}

export default function OrderForm({ onSuccess, initialOrder, onCancel }: OrderFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [orderImage, setOrderImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialOrder?.orderImage || null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => {
    // Initialize order items immediately if initialOrder is provided
    if (initialOrder?.orderItems && initialOrder.orderItems.length > 0) {
      return initialOrder.orderItems.map(item => ({
        id: item._id || item.id || Math.random().toString(36).substring(2, 9),
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }));
    }
    return [];
  });
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState('');
  const [showProductResults, setShowProductResults] = useState(false);
  
  // Fetch products from API
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      try {
        const fetchedProducts = await fetchProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };
    
    loadProducts();
  }, []);
  
  // Filter products based on search term - similar to UpdateOrderForm
  const filteredProducts = productSearch.trim() === ''
    ? products
    : products.filter(product => {
        // Type assertion for products that might have 'sku' property
        const productWithSku = product as (Product & { sku?: string });
        
        return product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
          (productWithSku.sku && typeof productWithSku.sku === 'string' && productWithSku.sku.toLowerCase().includes(productSearch.toLowerCase())) ||
          (product.category && product.category.toLowerCase().includes(productSearch.toLowerCase()));
      });
      
  // Handle product selection from search results
  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product._id || product.id);
    setProductSearch(product.name);
    setShowProductResults(false);
  };
  
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
  
  // Initialize form
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: initialOrder?.customerName || '',
      customerPhone: initialOrder?.customerPhone || '',
      customerEmail: initialOrder?.customerEmail || '',
      status: (initialOrder?.status as OrderStatus) || 'pending',
      paymentCondition: (initialOrder?.paymentCondition as PaymentCondition) || 'immediate',
      assignedTo: initialOrder?.assignedTo || 'all',
      notes: initialOrder?.notes || '',
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
    
    const product = products.find(p => p._id === selectedProduct || p.id === selectedProduct);
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
        productId: product._id || product.id || '',
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
      const dispatchDate = values.status === 'dispatched' ? new Date() : undefined;
      
      // Clean up order items to match backend expectations
      const sanitizedItems = orderItems.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price
      }));
      
      // Create the base order data
      const orderData: any = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined, // Make email optional
        status: values.status,
        paymentCondition: values.paymentCondition,
        assignedTo: values.assignedTo === 'all' ? null : values.assignedTo,
        notes: values.notes || '',
        items: sanitizedItems,
        total: calculateTotal(),
        isPaid: initialOrder?.isPaid || false,
      };

      // Add createdBy only if we're creating a new order
      if (!initialOrder) {
        orderData.createdBy = user?._id || user?.id || '1';
      }

      // Create a new object with the dispatchDate if needed
      const finalOrderData = dispatchDate 
        ? { ...orderData, dispatchDate: dispatchDate.toISOString() } // Convert Date to string
        : orderData;
      
      console.log(`Preparing to ${initialOrder ? 'update' : 'create'} order with data:`, finalOrderData);
      
      let createdOrUpdatedOrder;
      
      // Check if we're updating an existing order or creating a new one
      if (initialOrder) {
        // Update existing order
        if (orderImage) {
          // If we have a new image, use FormData
          const formData = new FormData();
          formData.append('orderData', JSON.stringify(finalOrderData));
          formData.append('orderImage', orderImage);
          
          createdOrUpdatedOrder = await updateOrderWithImage(initialOrder._id, formData);
        } else {
          // Update without changing the image
          createdOrUpdatedOrder = await updateOrder(initialOrder._id, finalOrderData);
        }
        
        toast.success('Order updated successfully');
        
        // Add notification for order update
        addNotification({
          type: 'order',
          title: 'Order Updated',
          message: `Order #${createdOrUpdatedOrder.orderNumber || (createdOrUpdatedOrder._id ? createdOrUpdatedOrder._id.substring(0, 8) : '')} has been updated`,
          actionUrl: '/orders'
        });
      } else {
        // Create new order
        // Create form data
        const formData = new FormData();
        
        // Add order data - ensure it's a string
        formData.append('orderData', JSON.stringify(finalOrderData));
        
        // Add image if exists
        if (orderImage) {
          console.log('Adding image to order:', orderImage.name, orderImage.type, orderImage.size);
          setUploadingImage(true);
          formData.append('orderImage', orderImage);
        }
        
        createdOrUpdatedOrder = await createOrder(formData);
        console.log('Order created successfully:', createdOrUpdatedOrder);
        
        // Add notification for order creation
        addNotification({
          type: 'order',
          title: 'New Order Created',
          message: `Order #${createdOrUpdatedOrder.orderNumber || (createdOrUpdatedOrder._id ? createdOrUpdatedOrder._id.substring(0, 8) : '')} has been created successfully`,
          actionUrl: '/orders'
        });
        
        toast.success('Order created successfully');
      }
      
      // Update product stock (only for new orders)
      if (!initialOrder) {
        for (const item of orderItems) {
          try {
            const product = products.find(p => (p._id === item.productId) || (p.id === item.productId));
            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              await updateProduct(product._id || product.id || '', { stock: newStock });
            }
          } catch (stockError) {
            console.error(`Error updating stock for product ${item.productId}:`, stockError);
            // Continue with next product even if one fails
          }
        }
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/orders');
      }
    } catch (error: any) {
      console.error(`Error ${initialOrder ? 'updating' : 'creating'} order:`, error);
      toast.error(`Error ${initialOrder ? 'updating' : 'creating'} order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  // Handle navigation back to orders page
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    
    try {
      // First attempt with React Router navigation
      navigate('/orders');
      
      // Set a timeout to check if we're still on the same page
      setTimeout(() => {
        // If still showing order form, force redirect using window.location
        if (window.location.pathname.includes('/orders')) {
          console.log('Using fallback navigation method');
          window.location.href = '/orders';
        }
      }, 100);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct location change
      window.location.href = '/orders';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{initialOrder ? 'Update Order' : 'Create New Order'}</h2>
          <p className="text-muted-foreground">
            {initialOrder ? 'Edit the existing order details' : 'Add a new customer order to the system'}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleCancel}
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
              </div>
              
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
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add any additional notes or details here"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Order Image (Optional)</FormLabel>
                  <div className="mt-2">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => document.getElementById('image-upload')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </Button>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                      <p className="text-sm text-muted-foreground">
                        PNG, JPG or GIF, max 5MB
                      </p>
                    </div>
                    
                    {imagePreview && (
                      <div className="mt-4">
                        <p className="text-sm font-medium mb-2">Preview:</p>
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Order Preview"
                            className="rounded-md max-h-[200px] object-contain"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              setOrderImage(null);
                              setImagePreview(null);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Order Items */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Order Items</h3>
                
                <div className="space-y-2">
                  <div className="relative">
                    <div className="flex items-center border rounded-md">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search products by name, category, or SKU..."
                          className="pl-8 border-0 focus-visible:ring-0"
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductResults(true);
                          }}
                          onFocus={() => setShowProductResults(true)}
                        />
                      </div>
                      <Input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        placeholder="Qty"
                        className="w-20 h-10 border-0 focus-visible:ring-0 border-l rounded-none"
                      />
                      <Button
                        type="button"
                        size="sm"
                        className="rounded-l-none"
                        onClick={handleAddItem}
                        disabled={!selectedProduct}
                      >
                        Add
                      </Button>
                    </div>
                    
                    {/* Search results */}
                    {showProductResults && productSearch && (
                      <div className="absolute w-full z-10 mt-1 border rounded-md bg-background shadow-lg">
                        <ScrollArea className="h-60">
                          {productsLoading ? (
                            <div className="p-4 text-center">
                              <Loader2 className="h-5 w-5 mx-auto animate-spin text-muted-foreground" />
                              <p className="text-sm text-muted-foreground mt-2">Loading products...</p>
                            </div>
                          ) : filteredProducts.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                              No products found
                            </div>
                          ) : (
                            <div>
                              {filteredProducts.map((product) => {
                                // Type assertion for product in the UI
                                const productWithSku = product as (Product & { sku?: string });
                                
                                return (
                                  <div
                                    key={product._id || product.id}
                                    className={cn(
                                      "flex items-center justify-between p-3 cursor-pointer hover:bg-muted transition-colors",
                                      product.stock <= 0 && "opacity-50"
                                    )}
                                    onClick={() => product.stock > 0 && handleSelectProduct(product)}
                                  >
                                    <div>
                                      <div className="font-medium">{product.name}</div>
                                      <div className="text-sm text-muted-foreground">
                                        {product.category} {productWithSku.sku && `• SKU: ${productWithSku.sku}`}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div>₹{product.price.toFixed(2)}</div>
                                      <div className={cn(
                                        "text-xs",
                                        product.stock <= 5 ? "text-destructive" : "text-muted-foreground"
                                      )}>
                                        Stock: {product.stock}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    )}
                  </div>
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
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || uploadingImage}
            >
              {(isLoading || uploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingImage ? 'Uploading Image...' : 
               isLoading ? (initialOrder ? 'Updating Order...' : 'Creating Order...') : 
               (initialOrder ? 'Update Order' : 'Create Order')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
