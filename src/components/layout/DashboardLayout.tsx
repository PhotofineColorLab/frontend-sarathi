import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  BarChart4, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight, 
  ShoppingCart,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose 
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile, useIsTablet, useIsSmallMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  isAdminOnly?: boolean;
  collapsed?: boolean;
}

const NavItem = React.memo(({ 
  icon, 
  label, 
  href, 
  isActive, 
  onClick, 
  isAdminOnly = false,
  collapsed = false
}: NavItemProps) => {
  const { isAdmin } = useAuth();
  
  if (isAdminOnly && !isAdmin) return null;
  
  const item = (
    <Link 
      to={href} 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
        isActive 
          ? "bg-primary text-primary-foreground shadow-sm" 
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <span className="flex-shrink-0">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
      {isActive && !collapsed && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {item}
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{label}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return item;
});

NavItem.displayName = 'NavItem';

const UserInfo = React.memo(({ collapsed = false }: { collapsed?: boolean }) => {
  const { user, logout } = useAuth();
  const isSmallMobile = useIsSmallMobile();
  
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);
  
  if (collapsed) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-primary/20 cursor-pointer">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.role}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="mt-2 text-muted-foreground hover:text-destructive" 
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Log out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col space-y-3 p-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className={cn("text-sm font-medium", isSmallMobile && "text-xs")}>{user?.name}</p>
          <div className="flex items-center">
            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20">
              {user?.role}
            </Badge>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="justify-start pl-2 text-muted-foreground hover:text-destructive" 
        onClick={handleLogout}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Log out
      </Button>
    </div>
  );
});

UserInfo.displayName = 'UserInfo';

const DashboardLayout = React.memo(({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { isAdmin } = useAuth();

  // Update sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else if (isTablet) {
      setSidebarOpen(true);
      setSidebarCollapsed(true);
    } else {
      setSidebarOpen(true);
      setSidebarCollapsed(false);
    }
  }, [isMobile, isTablet]);

  const navigationItems = useMemo(() => [
    { 
      icon: <LayoutDashboard className="h-5 w-5" />, 
      label: 'Dashboard', 
      href: '/dashboard',
      isAdminOnly: false,
    },
    { 
      icon: <ShoppingCart className="h-5 w-5" />, 
      label: 'Orders', 
      href: '/orders',
      isAdminOnly: false,
    },
    { 
      icon: <Package className="h-5 w-5" />, 
      label: 'Products', 
      href: '/products',
      isAdminOnly: false,
    },
    { 
      icon: <Users className="h-5 w-5" />, 
      label: 'Staff', 
      href: '/staff',
      isAdminOnly: true,
    },
    { 
      icon: <BarChart4 className="h-5 w-5" />, 
      label: 'Analytics', 
      href: '/analytics',
      isAdminOnly: true,
    },
    { 
      icon: <Settings className="h-5 w-5" />, 
      label: 'Settings', 
      href: '/settings',
      isAdminOnly: false,
    },
  ], []);

  const closeSidebar = useCallback(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebarCollapse = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const SidebarContent = useMemo(() => {
    return (
      <aside className="h-screen flex flex-col bg-card border-r">
        <div className="p-4">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed ? (
              <h2 className="text-xl font-bold">Sarathi Orders</h2>
            ) : (
              <div className="w-full flex justify-center">
                <h2 className="text-xl font-bold">E</h2>
              </div>
            )}
            {isMobile ? (
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-5 w-5" />
                </Button>
              </SheetClose>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleSidebarCollapse} 
                className="hidden md:flex"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
        <Separator />
        <nav className="flex-1 overflow-auto p-3 space-y-1">
          {navigationItems.map((item) => (
            <NavItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              isActive={pathname === item.href}
              onClick={closeSidebar}
              isAdminOnly={item.isAdminOnly}
              collapsed={sidebarCollapsed}
            />
          ))}
        </nav>
        <Separator />
        <UserInfo collapsed={sidebarCollapsed} />
      </aside>
    );
  }, [pathname, isMobile, navigationItems, closeSidebar, sidebarCollapsed, toggleSidebarCollapse]);

  return (
    <div className="flex min-h-screen h-screen bg-muted/50 overflow-hidden">
      {isMobile ? (
        <>
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side="left" className="p-0 w-[80vw] max-w-[300px]">
              {SidebarContent}
            </SheetContent>
          </Sheet>
          <Button 
            variant="outline" 
            size="icon" 
            className="fixed top-4 left-4 z-40 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </>
      ) : (
        <div className={cn(
          "transition-all duration-200 ease-in-out",
          sidebarCollapsed ? "w-16" : "w-64"
        )}>
          {SidebarContent}
        </div>
      )}
      
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <div className={cn(
          "container py-6 h-full",
          isMobile && "pt-16 px-4" // Add padding for mobile menu
        )}>
          {children}
        </div>
      </main>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
