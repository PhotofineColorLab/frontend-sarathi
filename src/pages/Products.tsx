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
  
  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productCategory, setProductCategory] = useState<ProductCategory>('fans');
  const [productStock, setProductStock] = useState('');
  const [productImage, setProductImage] = useState('');

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

  const handleOpenProductForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setProductName(product.name);
      setProductDescription(product.description);
      setProductPrice(product.price.toString());
      setProductCategory(product.category as ProductCategory);
      setProductStock(product.stock.toString());
      setProductImage(product.image || '');
      setIsEditing(true);
    } else {
      resetForm();
    }
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
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">Products</h1>
          <p className="text-muted-foreground animate-slide-in-bottom">
            Manage your product inventory and categories
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 md:w-[300px] lg:w-[400px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button onClick={() => handleOpenProductForm()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        <Card className="border shadow-sm">
          <CardHeader className="px-5 pt-5 pb-0">
            <CardTitle>
              <Tabs 
                defaultValue="all" 
                className="w-full"
                value={activeCategory}
                onValueChange={(value) => setActiveCategory(value as ProductCategory | 'all')}
              >
                <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="fans">Fans</TabsTrigger>
                  <TabsTrigger value="lights">Lights</TabsTrigger>
                  <TabsTrigger value="switches">Switches</TabsTrigger>
                  <TabsTrigger value="sockets">Sockets</TabsTrigger>
                  <TabsTrigger value="panels">Panels</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 text-primary mb-4 animate-spin" />
                <p className="text-lg font-medium text-center">Loading products...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <p className="text-lg font-medium text-center">No products found</p>
                <p className="text-muted-foreground text-center mt-1">
                  {searchTerm ? "Try adjusting your search." : "Add your first product to get started."}
                </p>
              </div>
            ) : (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedProducts.map((product) => (
                        <TableRow key={getProductId(product)}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{product.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {productCategories.find(c => c.value === product.category)?.label || product.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(product.price)}</TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                              className="w-12"
                            >
                              {product.stock}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleOpenProductForm(product)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setIsDeleteDialogOpen(true);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
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
    </DashboardLayout>
  );
}
