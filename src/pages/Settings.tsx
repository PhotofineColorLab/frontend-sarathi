import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { CheckIcon, Settings as SettingsIcon, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile, useIsSmallMobile, useIsTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export default function Settings() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const isSmallMobile = useIsSmallMobile();
  const isTablet = useIsTablet();
  
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove unnecessary toast
  };
  
  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove unnecessary toast
  };
  
  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    // Remove unnecessary toast
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className={cn("font-bold tracking-tight animate-fade-in", 
                            isMobile ? "text-2xl" : "text-3xl")}>Settings</h1>
          <p className="text-muted-foreground animate-slide-in-bottom text-sm">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className={cn("mb-8", isMobile && "flex w-full flex-wrap gap-1")}>
            <TabsTrigger value="profile" className={cn("flex items-center gap-2", 
                                                       isMobile && "flex-1 min-w-20")}>
              <User className={cn("h-4 w-4", isSmallMobile && "hidden")} />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className={cn(isMobile && "flex-1 min-w-20")}>Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className={cn(isMobile && "flex-1 min-w-20")}>Appearance</TabsTrigger>
          </TabsList>
          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="dashboard-card">
              <CardHeader className={cn(isMobile && "p-4")}>
                <CardTitle className={cn(isMobile && "text-lg")}>Profile</CardTitle>
                <CardDescription className={cn(isMobile && "text-xs")}>
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveProfile}>
                <CardContent className={cn("space-y-6", isMobile && "p-4")}>
                  <div className={cn("flex items-center gap-4", isMobile && "flex-col items-start")}>
                    <Avatar className={cn("border-2 border-primary/20", isMobile ? "h-14 w-14" : "h-16 w-16")}>
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                      <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={cn(isMobile && "mt-2 w-full")}>
                      <p className="text-sm font-medium">Profile Photo</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button type="button" variant="outline" size={isMobile ? "sm" : "default"}>
                          Change
                        </Button>
                        <Button type="button" variant="ghost" size={isMobile ? "sm" : "default"}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input id="fullName" placeholder="Enter your full name" defaultValue={user?.name} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="Enter your email" defaultValue={user?.email} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" defaultValue={user?.role} disabled />
                      <p className="text-xs text-muted-foreground">Your role cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="Enter your phone number" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={cn(isMobile && "p-4")}>
                  <Button type="submit" className={cn(isMobile && "w-full")}>Save Changes</Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card className="dashboard-card">
              <CardHeader className={cn(isMobile && "p-4")}>
                <CardTitle className={cn(isMobile && "text-lg")}>Password</CardTitle>
                <CardDescription className={cn(isMobile && "text-xs")}>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className={cn("space-y-4", isMobile && "p-4")}>
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </CardContent>
              <CardFooter className={cn(isMobile && "p-4")}>
                <Button 
                  onClick={() => toast.success('Password updated successfully')}
                  className={cn(isMobile && "w-full")}
                >
                  Update Password
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="animate-fade-in">
            <Card className="dashboard-card">
              <CardHeader className={cn(isMobile && "p-4")}>
                <CardTitle className={cn(isMobile && "text-lg")}>Notifications</CardTitle>
                <CardDescription className={cn(isMobile && "text-xs")}>
                  Configure how you receive notifications
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveNotifications}>
                <CardContent className={cn("space-y-6", isMobile && "p-4")}>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Email Notifications</h3>
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">New Orders</p>
                        <p className="text-xs text-muted-foreground">Receive notifications when new orders are placed</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">Low Stock Alerts</p>
                        <p className="text-xs text-muted-foreground">Receive alerts when products are running low on stock</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">Status Updates</p>
                        <p className="text-xs text-muted-foreground">Get notified when order statuses change</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">Weekly Reports</p>
                        <p className="text-xs text-muted-foreground">Receive weekly summaries of your shop's performance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={cn(isMobile && "p-4")}>
                  <Button type="submit" className={cn(isMobile && "w-full")}>Save Notification Settings</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="animate-fade-in">
            <Card className="dashboard-card">
              <CardHeader className={cn(isMobile && "p-4")}>
                <CardTitle className={cn(isMobile && "text-lg")}>Appearance</CardTitle>
                <CardDescription className={cn(isMobile && "text-xs")}>
                  Customize how the dashboard looks
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSaveAppearance}>
                <CardContent className={cn("space-y-6", isMobile && "p-4")}>
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Theme</h3>
                    <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-3")}>
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="h-20 w-full rounded-md bg-white border-2 border-primary/80 shadow-sm flex items-center justify-center">
                          <CheckIcon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-xs">Light</span>
                      </div>
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="h-20 w-full rounded-md bg-slate-950 border-2 border-muted shadow-sm"></div>
                        <span className="text-xs">Dark</span>
                      </div>
                      <div className="relative flex flex-col items-center gap-2">
                        <div className="h-20 w-full rounded-md bg-gradient-to-br from-white to-slate-950 border-2 border-muted shadow-sm"></div>
                        <span className="text-xs">System</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">Animations</p>
                        <p className="text-xs text-muted-foreground">Enable animations throughout the interface</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className={cn("flex items-center justify-between", isMobile && "flex-col items-start gap-2")}>
                      <div>
                        <p className="text-sm font-medium">Compact Mode</p>
                        <p className="text-xs text-muted-foreground">Use a more compact layout to fit more content</p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className={cn(isMobile && "p-4")}>
                  <Button type="submit" className={cn(isMobile && "w-full")}>Save Appearance Settings</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}