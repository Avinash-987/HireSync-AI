import React from "react";
import { Link, useLocation } from "wouter";
import { 
  Sparkles, 
  LayoutDashboard, 
  Briefcase, 
  Zap, 
  FileText, 
  ClipboardList, 
  Bookmark, 
  Bell, 
  User, 
  Shield, 
  LogOut,
  Menu
} from "lucide-react";
import { useAuth } from "@/context/auth";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Browse Jobs", url: "/jobs", icon: Briefcase },
    { title: "Recommended", url: "/jobs/recommended", icon: Zap },
    { title: "Resume", url: "/resume", icon: FileText },
    { title: "Applications", url: "/applications", icon: ClipboardList },
    { title: "Saved Jobs", url: "/saved-jobs", icon: Bookmark },
    { title: "Alerts", url: "/alerts", icon: Bell },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
  ];

  if (user?.role === "admin") {
    navItems.push({ title: "Admin Dashboard", url: "/admin", icon: Shield });
  }

  const getInitials = (name: string) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border">
          <SidebarContent className="flex flex-col h-full bg-sidebar">
            <div className="p-4 flex items-center gap-2">
              <div className="bg-primary/10 p-2 rounded-lg text-primary">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight hidden group-data-[collapsible=icon]:hidden md:block">HireSync AI</span>
            </div>
            
            <SidebarGroup className="flex-1">
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => {
                    const isActive = location === item.url;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive}
                          tooltip={item.title}
                          className={isActive ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}
                        >
                          <Link href={item.url} className="flex items-center gap-3 w-full">
                            <item.icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="p-4 border-t border-border mt-auto">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-3 px-2 h-auto py-2 hover:bg-sidebar-accent">
                    <Avatar className="w-8 h-8 rounded-md bg-primary/10 text-primary">
                      <AvatarFallback className="bg-transparent">{getInitials(user?.name || '')}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm group-data-[collapsible=icon]:hidden">
                      <span className="font-medium truncate max-w-[120px]">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate max-w-[120px]">{user?.email}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem onClick={() => setLocation("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarContent>
        </Sidebar>

        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <SidebarTrigger />
            <div className="flex-1 flex items-center">
              <h1 className="text-sm font-semibold sm:text-base capitalize">
                {location.split('/').pop()?.replace('-', ' ') || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setLocation('/notifications')}>
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-background/50">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
