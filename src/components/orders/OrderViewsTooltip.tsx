import React from 'react';
import { Eye } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

// This would normally come from the database, but for demo purposes
// we'll create a mock list of staff who have viewed each order
const orderViews: Record<string, { name: string; time: string }[]> = {
  'o1': [
    { name: 'Admin User', time: '2 hours ago' },
    { name: 'Sarah Johnson', time: '1 day ago' },
  ],
  'o2': [
    { name: 'Staff User', time: '3 hours ago' },
  ],
  'o3': [
    { name: 'Admin User', time: '5 hours ago' },
    { name: 'Michael Davis', time: '6 hours ago' },
    { name: 'John Smith', time: '2 days ago' },
  ],
  'o4': [
    { name: 'Sarah Johnson', time: '1 hour ago' },
  ],
  'o5': [
    { name: 'Admin User', time: '30 minutes ago' },
    { name: 'Staff User', time: '1 day ago' },
  ],
};

interface OrderViewsTooltipProps {
  orderId: string;
}

export function OrderViewsTooltip({ orderId }: OrderViewsTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View order details</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>View order #{orderId.substring(0, 8)} details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}