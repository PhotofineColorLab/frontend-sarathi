import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Order } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteOrderDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onDelete: (orderId: string) => void;
}

export function DeleteOrderDialog({
  isOpen,
  onOpenChange,
  order,
  onDelete,
}: DeleteOrderDialogProps) {
  const getOrderId = (order: Order) => order._id || order.id || '';
  const getDisplayOrderId = (order: Order) => {
    return order.orderNumber || `#${(order._id || order.id || '').substring(0, 8)}`;
  };

  if (!order) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete order {getDisplayOrderId(order)}? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onDelete(getOrderId(order));
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
