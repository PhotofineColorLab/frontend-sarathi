import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Edit,
  Loader2,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  ChevronLeft,
  ChevronRight,
  List,
  Grid,
  PlusCircle,
  Eye,
  Trash,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Product, ProductCategory } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import { fetchProducts, createProduct, updateProduct as updateProductAPI, deleteProduct as deleteProductAPI } from '@/lib/api';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductCard } from '@/components/cards/ProductCard';
import { useNavigate } from 'react-router-dom';

const ITEMS_PER_PAGE = 10;

const productCategories: { value: ProductCategory; label: string }[] = [
  { value: 'fans', label: 'Fans' },
  { value: 'lights', label: 'Lights' },
  { value: 'switches', label: 'Switches' },
  { value: 'sockets', label: 'Sockets' },
  { value: 'wires', label: 'Wires' },
  { value: 'conduits', label: 'Conduits' },
  { value: 'mcbs', label: 'MCBs' },
  { value: 'panels', label: 'Panels' },
  { value: 'tools', label: 'Tools' },
  { value: 'accessories', label: 'Accessories' },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('fans');
  const [productStock, setProductStock] = useState('');
  const [productImage, setProductImage] = useState('');

  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();

  // Add a state for product view dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch products when component mounts or category changes
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts(activeCategory === 'all' ? undefined : activeCategory);
        setProducts(data);
        setCurrentPage(1); // Reset to first page when category changes
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, [activeCategory]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value);
  };

  const resetForm = () => {
    setProductName('');
    setProductDescription('');
    setProductPrice('');
    setProductCategory('fans');
    setProductStock('');
    setProductImage('');
    setIsEditing(false);
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setSelectedProduct(product);
    setIsProductFormOpen(true);
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setIsDeleting(true);
      await deleteProductAPI(productId);
      setProducts(products.filter(product => product._id !== productId));
      setIsDeleteDialogOpen(false);
      toast.success('Product deleted successfully');
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error(error.message || 'Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productName || !productDescription || !productPrice || !productCategory || !productStock) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare product data
      const productData = {
        name: productName,
        description: productDescription,
        price: parseFloat(productPrice),
        category: productCategory,
        stock: parseInt(productStock),
        image: productImage,
      };
      
      let result;
      
      if (isEditing && selectedProduct) {
        // Update existing product
        result = await updateProductAPI(selectedProduct._id!, productData);
        
        // Update local state
        setProducts(products.map(p => 
          p._id === selectedProduct._id ? { ...p, ...result } : p
        ));
        
        toast.success('Product updated successfully');
      } else {
        // Create new product
        result = await createProduct(productData);
        
        // Update local state
        setProducts([result, ...products]);
        
        toast.success('Product added successfully');
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

  // Function to get product ID (supports both mock data and MongoDB)
  const getProductId = (product: Product) => {
    return product._id || product.id;
  };

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
            
            <div className="flex-shrink-0">
              <Select
                value={activeCategory}
                onValueChange={(value) => setActiveCategory(value as ProductCategory | 'all')}
              >
                <SelectTrigger className={cn("w-full sm:w-auto", isMobile && "text-sm")}>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="fans">Fans</SelectItem>
                  <SelectItem value="lights">Lights</SelectItem>
                  <SelectItem value="switches">Switches</SelectItem>
                  <SelectItem value="sockets">Sockets</SelectItem>
                  <SelectItem value="wires">Wires</SelectItem>
                  <SelectItem value="conduits">Conduits</SelectItem>
                  <SelectItem value="mcbs">MCBs</SelectItem>
                  <SelectItem value="panels">Panels</SelectItem>
                  <SelectItem value="tools">Tools</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-row gap-2 justify-between sm:justify-end">
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="h-4 w-4 mr-2" />
                  {!isSmallMobile && <span>Table View</span>}
                </>
              ) : (
                <>
                  <Grid className="h-4 w-4 mr-2" />
                  {!isSmallMobile && <span>Grid View</span>}
                </>
              )}
            </Button>
            
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
              ? "Try adjusting your search term or filter" 
              : "Get started by creating your first product"
            }
            action={
              <Button onClick={() => setIsProductFormOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            }
          />
        ) : viewMode === 'grid' ? (
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          )}>
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id || product._id}
                product={product}
                onView={() => handleViewProduct(product)}
                onEdit={() => handleEditProduct(product)}
                onDelete={() => {
                  setSelectedProduct(product);
                  setIsDeleteDialogOpen(true);
                }}
                className={cn(
                  isMobile && "p-3 text-sm" // Smaller padding and text for mobile
                )}
              />
            ))}
          </div>
        ) : (
          <div className="border rounded-md">
            {isMobile ? (
              // Responsive list view for mobile
              <div className="divide-y">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id || product._id}
                    className="p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewProduct(product)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        {product.image ? (
                          <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium text-sm">{product.name}</h3>
                          <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
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
                            setSelectedProduct(product);
                            setIsDeleteDialogOpen(true);
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
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id || product._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {product.image ? (
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-muted">
                              <img 
                                src={product.image} 
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          <div>
                            <span 
                              className="cursor-pointer hover:text-primary hover:underline"
                              onClick={() => handleViewProduct(product)}
                            >
                              {product.name}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{product.category}</TableCell>
                      <TableCell>₹{product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Badge>
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
                              setSelectedProduct(product);
                              setIsDeleteDialogOpen(true);
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update the product details below." 
                : "Fill out the form below to add a new product to your inventory."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmitProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Enter product name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={productCategory}
                  onValueChange={(value) => setProductCategory(value as ProductCategory)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {productCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                placeholder="Enter product description"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={productPrice}
                  onChange={(e) => setProductPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  step="1"
                  value={productStock}
                  onChange={(e) => setProductStock(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="image">Image URL</Label>
              <Input
                id="image"
                value={productImage}
                onChange={(e) => setProductImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              
              {productImage && (
                <div className="mt-2 rounded-md overflow-hidden border h-24 flex items-center justify-center">
                  <img
                    src={productImage}
                    alt="Product preview"
                    className="max-h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://placehold.co/400x300?text=Invalid+Image+URL';
                    }}
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsProductFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Product' : 'Add Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 border rounded-md">
            <h4 className="font-semibold">{selectedProduct?.name}</h4>
            <p className="text-sm text-muted-foreground mt-1">{selectedProduct?.description}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedProduct && handleDeleteProduct(getProductId(selectedProduct))}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product view dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          
          {selectedProduct && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  {selectedProduct.image ? (
                    <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={selectedProduct.image} 
                        alt={selectedProduct.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <Package className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="capitalize">{selectedProduct.category}</Badge>
                      <Badge variant={selectedProduct.stock > 10 ? "default" : "destructive"}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of stock'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-3xl font-bold">₹{selectedProduct.price.toLocaleString()}</p>
                  </div>
                  
                  {selectedProduct.description && (
                    <div>
                      <h3 className="text-sm text-muted-foreground mb-1">Description</h3>
                      <p className="text-sm">{selectedProduct.description}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditProduct(selectedProduct);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setSelectedProduct(selectedProduct);
                    setIsDeleteDialogOpen(true);
                  }}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Product
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
