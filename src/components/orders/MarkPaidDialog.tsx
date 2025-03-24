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

interface MarkPaidDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order | null;
  onMarkPaid: (orderId: string) => void;
  formatCurrency: (amount: number) => string;
}

export function MarkPaidDialog({
  isOpen,
  onOpenChange,
  order,
  onMarkPaid,
  formatCurrency,
}: MarkPaidDialogProps) {
  const getOrderId = (order: Order) => order._id || order.id || '';
  const getDisplayOrderId = (order: Order) => {
    return order.orderNumber || `#${(order._id || order.id || '').substring(0, 8)}`;
  };

  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Order as Paid</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this order as paid? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-muted p-4 rounded-md space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Order ID:</span> {getDisplayOrderId(order)}
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Customer:</span> {order.customerName}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => {
              onMarkPaid(getOrderId(order));
              onOpenChange(false);
            }}
          >
            Mark as Paid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 