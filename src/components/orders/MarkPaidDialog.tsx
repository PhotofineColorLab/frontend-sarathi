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
}

export function MarkPaidDialog({
  isOpen,
  onOpenChange,
  order,
  onMarkPaid,
}: MarkPaidDialogProps) {
  if (!order) return null;

  const getOrderId = (order: Order) => order._id || order.id || '';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Order as Paid</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark this order as paid? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <p>
            <span className="font-medium">Order ID:</span> #{getOrderId(order).substring(0, 8)}
          </p>
          <p>
            <span className="font-medium">Customer:</span> {order.customerName}
          </p>
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