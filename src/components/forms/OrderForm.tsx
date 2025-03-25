import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Plus, Trash2, Upload, CalendarIcon } from 'lucide-react';
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

import { OrderStatus, PaymentCondition, Product, OrderItem, User } from '@/lib/types';
import { createOrder, fetchStaff, fetchProducts, updateProduct } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

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
}

export default function OrderForm({ onSuccess }: OrderFormProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [orderImage, setOrderImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [staffMembers, setStaffMembers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
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
  
  // Filter available products
  const availableProducts = React.useMemo(() => {
    return (products || [])
      .filter(product => product.stock > 0)
      .filter(product => {
        if (!searchTerm) return true;
        
        const searchLower = searchTerm.toLowerCase();
        const productName = (product.name || '').toLowerCase();
        return productName.includes(searchLower);
      });
  }, [products, searchTerm]);
  
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
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      status: 'pending',
      paymentCondition: 'immediate',
      assignedTo: 'all',
      notes: '',
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
      const orderData = {
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined, // Make email optional
        status: values.status,
        paymentCondition: values.paymentCondition,
        assignedTo: values.assignedTo === 'all' ? null : values.assignedTo,
        notes: values.notes || '',
        items: sanitizedItems,
        total: calculateTotal(),
        isPaid: false,
        createdBy: user?._id || user?.id || '1',
      };

      // Create a new object with the dispatchDate if needed
      const finalOrderData = dispatchDate 
        ? { ...orderData, dispatchDate } 
        : orderData;
      
      console.log('Preparing to create order with data:', finalOrderData);
      
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
      
      try {
        // Create order
        const createdOrder = await createOrder(formData);
        console.log('Order created successfully:', createdOrder);
        
        // Update product stock
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
        
        toast.success('Order created successfully');
        
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/orders');
        }
      } catch (apiError: any) {
        console.error('API error creating order:', apiError);
        
        // Show a more specific error message if available
        const errorMessage = apiError.message || 'Failed to create order';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error in order submission process:', error);
      toast.error(`Error creating order: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      setUploadingImage(false);
    }
  };

  // Handle navigation back to orders page
  const handleCancel = () => {
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
          <h2 className="text-2xl font-bold">Create New Order</h2>
          <p className="text-muted-foreground">Add a new customer order to the system</p>
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
                          {productsLoading ? (
                            <div className="flex items-center justify-center py-2">
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              <span>Loading products...</span>
                            </div>
                          ) : (
                            <>
                              <div className="px-2 py-1.5">
                                <Input
                                  placeholder="Search products..."
                                  className="h-8 w-full"
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onKeyDown={(e) => {
                                    // Prevent select from closing on keydown
                                    if (e.key !== 'Enter' && e.key !== 'Escape') {
                                      e.stopPropagation();
                                    }
                                  }}
                                />
                              </div>
                              {availableProducts.length > 0 ? (
                                availableProducts.map((product) => (
                                  <SelectItem 
                                    key={product._id || product.id}
                                    value={String(product._id || product.id || '')}
                                    disabled={(product.stock === undefined || product.stock <= 0)}
                                  >
                                    {product.name || 'Unnamed Product'} - ₹{(product.price || 0).toFixed(2)} - Stock: {product.stock || 0}
                                  </SelectItem>
                                ))
                              ) : (
                                <div className="text-center py-2 text-muted-foreground">
                                  No products found
                                </div>
                              )}
                            </>
                          )}
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
          
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || uploadingImage}
            >
              {(isLoading || uploadingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {uploadingImage ? 'Uploading Image...' : isLoading ? 'Creating Order...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
