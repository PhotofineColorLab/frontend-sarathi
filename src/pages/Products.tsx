import React, { useState, useEffect } from 'react';
import {
  Edit,
  Loader2,
  Package,
  Search,
  Trash,
  ChevronLeft,
  PlusCircle,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Product, ProductDimension } from '@/lib/types';
import { fetchProducts, createProduct, updateProduct as updateProductAPI, deleteProduct as deleteProductAPI } from '@/lib/api';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';

const ITEMS_PER_PAGE = 10;

export default function Products() {
  const { isAuthenticated, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Form states
  const [productName, setProductName] = useState(() => selectedProduct?.name || '');
  const [productPrice, setProductPrice] = useState(() => selectedProduct?.price ? selectedProduct.price.toString() : '');
  const [productStock, setProductStock] = useState(() => selectedProduct?.stock ? selectedProduct.stock.toString() : '');
  const [productDimension, setProductDimension] = useState<ProductDimension>(() => (selectedProduct?.dimension as ProductDimension) || 'Pc');

  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  const navigate = useNavigate();

  const { addNotification } = useNotifications();

  // Fetch products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts();
        
        // Ensure all products have consistent ID properties
        const processedProducts = data.map((product: any) => {
          const processedProduct = { ...product };
          if (product._id && !product.id) {
            processedProduct.id = product._id;
          } else if (product.id && !product._id) {
            processedProduct._id = product.id;
          }
          return processedProduct;
        });
        
        setProducts(processedProducts);
        setCurrentPage(1); // Reset to first page
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
    loadProducts();
    } else {
      toast.error('Authentication required');
      navigate('/login');
    }
  }, [isAuthenticated, user]);

  // Populate form fields when editing a product
  useEffect(() => {
    if (selectedProduct && isEditing) {
      setProductName(selectedProduct.name || '');
      setProductPrice(selectedProduct.price.toString() || '');
      setProductStock(selectedProduct.stock.toString() || '');
      setProductDimension((selectedProduct.dimension as ProductDimension) || 'Pc');
    } else if (!isEditing) {
      // Reset form when not editing
      resetForm();
    }
  }, [selectedProduct, isEditing]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const resetForm = () => {
    setProductName('');
    setProductPrice('');
    setProductStock('');
    setProductDimension('Pc');
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    handleEditProduct(product);
  };

  // Function to safely get product ID (supports both MongoDB _id and client-side id)
  const getProductId = (product: Product): string => {
    if (!product) return '';
    return String(product._id || product.id || '');
  };

  // Handle edit using consistent ID
  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
    setIsEditing(true);
  };

  // Direct handler for product deletion with simplified ID handling
  const handleDirectDelete = async (product: Product) => {
    const deleteId = product._id || product.id;
    
    if (!deleteId) {
      toast.error(`Cannot delete ${product.name}: No ID available`);
      return;
    }
    
    if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }
    
    try {
      toast.loading(`Deleting ${product.name}...`);
      
      await deleteProductAPI(deleteId as string);
      
      setProducts(prev => 
        prev.filter(p => !(
          (p._id && p._id === product._id) || 
          (p.id && p.id === product.id)
        ))
      );
      
      toast.dismiss();
      toast.success(`${product.name} deleted successfully`);
    } catch (error: any) {
      toast.dismiss();
      console.error('Failed to delete product:', error);
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = {
        name: productName,
        price: parseFloat(productPrice),
        stock: parseInt(productStock),
        dimension: productDimension
      };

      let updatedProduct;
      
      if (isEditing && selectedProduct) {
        const productId = getProductId(selectedProduct);
        updatedProduct = await updateProductAPI(productId, formData);
        
        setProducts(
          products.map(p => (getProductId(p) === productId ? updatedProduct : p))
        );
        
        toast.success('Product updated successfully');
        
        addNotification({
          type: 'product',
          title: 'Product Updated',
          message: `${updatedProduct.name} has been successfully updated`,
          actionUrl: '/products'
        });
      } else {
        const newProduct = await createProduct(formData);
        setProducts([newProduct, ...products]);
        
        toast.success('Product added successfully');
        
        addNotification({
          type: 'product',
          title: 'New Product Added',
          message: `${newProduct.name} has been successfully added to your inventory`,
          actionUrl: '/products'
        });
      }

      setIsProductFormOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col space-y-2">
            <h1 className={cn("font-bold tracking-tight", 
                            isMobile ? "text-2xl" : "text-3xl")}>Products</h1>
            <p className={cn("text-muted-foreground",
                          isSmallMobile ? "text-xs" : "text-sm")}>
              Manage your inventory and product information
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-1"
            onClick={() => navigate('/')}
          >
            <ChevronLeft className="h-4 w-4" />
            {!isSmallMobile && "Back to Dashboard"}
            {isSmallMobile && "Dashboard"}
          </Button>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-[300px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex flex-row gap-2 justify-between sm:justify-end">
            <Button onClick={() => setIsProductFormOpen(true)} size={isMobile ? "sm" : "default"}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {!isSmallMobile ? 'Add Product' : 'Add'}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            icon={<Package className="h-10 w-10 text-muted-foreground" />}
            title="No products found"
            description={searchTerm 
              ? "Try adjusting your search term" 
              : "Get started by creating your first product"
            }
            action={
              <Button onClick={() => setIsProductFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            }
          />
        ) : (
          <div className="border rounded-md">
            {isMobile ? (
              // Responsive list view for mobile
              <div className="divide-y">
                {filteredProducts.map((product) => (
                  <div 
                    key={getProductId(product)}
                    className="p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => handleEditProduct(product)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        <div>
                          <h3 className="font-medium text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground">{product.dimension || 'Pc'}</p>
                        </div>
                      </div>
                      <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">₹{product.price.toLocaleString()}</p>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditProduct(product);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectDelete(product);
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Desktop table view
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Dimension</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={getProductId(product)}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          <div>
                            <span 
                              className="cursor-pointer hover:text-primary hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditProduct(product);
                              }}
                            >
                              {product.name}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {product.dimension || 'Pc'}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.dimension || 'Pc'}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditProduct(product);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectDelete(product);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* Product form dialog */}
      <Dialog open={isProductFormOpen} onOpenChange={setIsProductFormOpen}>
        <DialogContent className={cn(
          "max-w-2xl",
          isMobile && "w-[95vw] p-4 max-h-[90vh] overflow-y-auto"
        )}>
          <DialogHeader>
            <DialogTitle className={cn(
              isMobile ? "text-lg" : "text-xl"
            )}>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription className={cn(
              isMobile && "text-xs"
            )}>
              {isEditing 
                ? "Update the product details below." 
                : "Fill out the form below to add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className={cn(isMobile && "text-sm")}>Product Name</Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  required
                  className={cn(isMobile && "h-9 text-sm")}
              />
            </div>
            
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            )}>
              <div className="space-y-2">
                <Label htmlFor="price" className={cn(isMobile && "text-sm")}>Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                  required
                  className={cn(isMobile && "h-9 text-sm")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock" className={cn(isMobile && "text-sm")}>Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  placeholder="0"
                  required
                  className={cn(isMobile && "h-9 text-sm")}
                />
              </div>
            </div>
            
            <div className={cn(
              "grid gap-4",
              isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
            )}>
            <div className="space-y-2">
                <Label htmlFor="dimension" className={cn(isMobile && "text-sm")}>Dimension</Label>
                <Select
                  value={productDimension}
                  onValueChange={(value) => setProductDimension(value as ProductDimension)}
                >
                  <SelectTrigger className={cn(isMobile && "h-9 text-sm")}>
                    <SelectValue placeholder="Select dimension" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bag">Bag</SelectItem>
                    <SelectItem value="Bundle">Bundle</SelectItem>
                    <SelectItem value="Box">Box</SelectItem>
                    <SelectItem value="Carton">Carton</SelectItem>
                    <SelectItem value="Coils">Coils</SelectItem>
                    <SelectItem value="Dozen">Dozen</SelectItem>
                    <SelectItem value="Ft">Ft</SelectItem>
                    <SelectItem value="Gross">Gross</SelectItem>
                    <SelectItem value="Kg">Kg</SelectItem>
                    <SelectItem value="Mtr">Mtr</SelectItem>
                    <SelectItem value="Pc">Pc</SelectItem>
                    <SelectItem value="Pkt">Pkt</SelectItem>
                    <SelectItem value="Set">Set</SelectItem>
                    <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                  </SelectContent>
                </Select>
                </div>
            </div>

            <DialogFooter className={cn(
              "gap-2 mt-6",
              isMobile && "flex-col"
            )}>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductFormOpen(false)}
                className={cn(isMobile && "w-full h-9")}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className={cn(isMobile && "w-full h-9")}
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
