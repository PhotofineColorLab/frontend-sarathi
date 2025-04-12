import React, { useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from "lucide-react";
import { Product } from '@/lib/types';
import { toast } from 'sonner';

interface DeleteProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onDelete: (productId: string) => Promise<void>;
}

export function DeleteProductDialog({
  isOpen,
  onOpenChange,
  product,
  onDelete,
}: DeleteProductDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Enhanced debugging when dialog opens
  useEffect(() => {
    if (isOpen) {
      console.log('Delete Dialog Opened');
      console.log('Product in DeleteProductDialog:', product);
      
      if (!product) {
        console.error('Product is null or undefined');
      } else {
        console.table({
          name: product.name || 'Missing name',
          id: product._id || product.id || 'Missing ID',
          price: product.price || 'Missing price',
          stock: product.stock || 'Missing stock',
          dimension: product.dimension || 'Missing dimension'
        });
      }
    }
  }, [isOpen, product]);

  const handleDelete = async () => {
    if (!product) {
      toast.error("Cannot delete: Product information is missing");
      return;
    }
    
    const productId = product._id || product.id;
    if (!productId) {
      toast.error("Cannot delete: Product ID is missing");
      return;
    }
    
    setIsLoading(true);
    try {
      await onDelete(productId);
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsLoading(false);
    }
  };

  // Get safe values with fallbacks
  const productName = product?.name || 'Unknown Product';
  const productStock = product?.stock ?? 0;
  const productDimension = product?.dimension || 'Pc';
  const productPrice = product?.price ?? 0;
  
  // Format the price with thousand separators
  const formattedPrice = `₹${productPrice.toLocaleString()}`;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Product</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-2">
          <p><strong>Product Name:</strong> {productName}</p>
          <p><strong>Current Stock:</strong> {productStock} {productDimension}</p>
          <p><strong>Price:</strong> {formattedPrice}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 