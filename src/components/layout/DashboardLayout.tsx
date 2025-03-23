import React, { useState, useMemo, useCallback } from 'react';
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
  ShoppingCart 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive: boolean;
  onClick?: () => void;
  isAdminOnly?: boolean;
}

const NavItem = React.memo(({ icon, label, href, isActive, onClick, isAdminOnly = false }: NavItemProps) => {
  const { isAdmin } = useAuth();
  
  if (isAdminOnly && !isAdmin) return null;
  
  return (
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
      {icon}
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
    </Link>
  );
});

NavItem.displayName = 'NavItem';

const UserInfo = React.memo(() => {
  const { user, logout } = useAuth();
  
  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);
  
  return (
    <div className="flex flex-col space-y-3 p-4">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 border-2 border-primary/20">
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
          <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <p className="text-sm font-medium">{user?.name}</p>
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
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const { isAdmin } = useAuth();

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

  const SidebarContent = useMemo(() => {
    return (
      <aside className="h-screen flex flex-col bg-card border-r">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Electra</h2>
            {isMobile && (
              <Button variant="ghost" size="icon" onClick={closeSidebar}>
                <X className="h-5 w-5" />
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
            />
          ))}
        </nav>
        <Separator />
        <UserInfo />
      </aside>
    );
  }, [pathname, isMobile, navigationItems, closeSidebar]);

  return (
    <div className="flex h-screen bg-muted/50 overflow-hidden">
      {isMobile ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="fixed top-4 left-4 z-50 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            {SidebarContent}
          </SheetContent>
        </Sheet>
      ) : (
        <div className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-200 ease-in-out`}>
          {SidebarContent}
        </div>
      )}
      
      <main className="flex-1 overflow-auto">
        <div className="container py-6 h-full">
          {children}
        </div>
      </main>
    </div>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
