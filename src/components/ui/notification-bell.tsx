import React, { useState, useMemo, useCallback } from 'react';
import { Bell, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useIsMobile, useIsSmallMobile } from '@/hooks/use-mobile';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { useNotifications, NotificationType } from '@/contexts/NotificationContext';

interface NotificationBellProps {
  className?: string;
}

// Memoized notification item component to prevent re-renders
const NotificationItem = React.memo(({ 
  notification, 
  handleClick, 
  getIcon 
}: { 
  notification: any; 
  handleClick: (id: string, actionUrl?: string) => void;
  getIcon: (type: NotificationType) => string;
}) => (
  <div
    key={notification.id}
    role="button"
    tabIndex={0}
    onClick={() => handleClick(notification.id, notification.actionUrl)}
    onKeyDown={(e) => e.key === 'Enter' && handleClick(notification.id, notification.actionUrl)}
    className={cn(
      "flex p-4 gap-3 hover:bg-muted/50 transition-colors cursor-pointer will-change-transform",
      !notification.read && "bg-muted/40"
    )}
  >
    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
      <span className="text-lg">{getIcon(notification.type)}</span>
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start">
        <h5 className={cn(
          "font-medium text-sm truncate",
          !notification.read && "font-semibold"
        )}>
          {notification.title}
        </h5>
        <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
        </p>
      </div>
      <p className={cn(
        "text-sm text-muted-foreground mt-1",
        !notification.read && "text-foreground"
      )}>
        {notification.message}
      </p>
    </div>
  </div>
));

NotificationItem.displayName = 'NotificationItem';

export function NotificationBell({ className }: NotificationBellProps) {
  const { 
    notifications, 
    unreadCount: totalUnreadCount, 
    markAsRead, 
    markAllAsRead,
    clearNotifications
  } = useNotifications();
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const navigate = useNavigate();

  // Get order and product notifications only
  const filteredNotifications = useMemo(() => {
    return notifications.filter(
      notification => notification.type === 'order' || notification.type === 'product'
    );
  }, [notifications]);
  
  // Calculate unread count for filtered notifications only
  const unreadCount = useMemo(() => {
    return filteredNotifications.filter(notification => !notification.read).length;
  }, [filteredNotifications]);

  const getNotificationIcon = useCallback((type: NotificationType) => {
    switch (type) {
      case 'order':
        return "🛒";
      case 'product':
        return "📦";
      case 'staff':
        return "👤";
      case 'system':
        return "⚙️";
      default:
        return "📣";
    }
  }, []);

  const handleNotificationClick = useCallback((id: string, actionUrl?: string) => {
    markAsRead(id);
    setOpen(false);
    if (actionUrl) {
      navigate(actionUrl);
    }
  }, [markAsRead, navigate]);

  // Handle clearing all notifications
  const handleClearAll = useCallback(() => {
    clearNotifications();
    setOpen(false);
  }, [clearNotifications]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative", className)}
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className={cn(
          "w-80 p-0", 
          isMobile && "w-[90vw] max-w-md"
        )}
        align="end"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {filteredNotifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-8 text-destructive hover:text-destructive" 
              onClick={handleClearAll}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear all
            </Button>
          )}
        </div>
        
        <div className="relative" style={{ height: isMobile ? "50vh" : "300px" }}>
          <ScrollArea className="h-full w-full absolute inset-0 overscroll-contain">
            {filteredNotifications.length > 0 ? (
              <div className="divide-y">
                {filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id}
                    notification={notification}
                    handleClick={handleNotificationClick}
                    getIcon={getNotificationIcon}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground">
                <p>No notifications</p>
              </div>
            )}
          </ScrollArea>
        </div>
        
        <div className="p-2 border-t text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={() => {
              setOpen(false);
            }}
          >
            Close
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
} 