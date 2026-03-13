import { ReactNode, useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Kanban, 
  Bookmark, 
  Bell, 
  BellRing, 
  User, 
  ShieldAlert,
  Menu,
  LogOut
} from "lucide-react";
import { useAuthGetMe, useAuthLogout } from "@workspace/api-client-react";
import { getAuthRequestOptions, removeToken, getToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/jobs", label: "Job Search", icon: Briefcase },
  { href: "/jobs/recommended", label: "AI Matches", icon: Sparkles },
  { href: "/resume", label: "Resume ATS", icon: FileText },
  { href: "/applications", label: "Applications", icon: Kanban },
  { href: "/saved-jobs", label: "Saved Jobs", icon: Bookmark },
  { href: "/alerts", label: "Job Alerts", icon: BellRing },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = getToken();

  // Redirect if no token immediately
  useEffect(() => {
    if (!token) {
      setLocation("/login");
    }
  }, [token, setLocation]);

  const { data: user, isLoading, isError } = useAuthGetMe({
    request: getAuthRequestOptions(),
    query: {
      retry: false,
      enabled: !!token
    }
  });

  const logoutMutation = useAuthLogout();

  useEffect(() => {
    if (isError) {
      removeToken();
      setLocation("/login");
    }
  }, [isError, setLocation]);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (e) {
      // ignore
    }
    removeToken();
    setLocation("/");
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 glass-panel border-b border-white/5 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-display font-bold text-xl">
          <Sparkles className="h-5 w-5" /> HireSync
        </div>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 bg-white/5 rounded-lg text-foreground">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 md:relative md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center gap-3 text-primary font-display font-bold text-2xl border-b border-white/5">
          <Sparkles className="h-6 w-6" /> HireSync <span className="text-sm font-normal text-muted-foreground bg-white/10 px-2 py-0.5 rounded-full ml-auto">AI</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Main Menu</p>
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
              location === item.href 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}

          {user.role === "admin" && (
            <>
              <div className="mt-6 mb-2 border-t border-white/5 pt-4" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">Admin</p>
              <Link href="/admin" className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200",
                location === "/admin" 
                  ? "bg-destructive/20 text-destructive" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}>
                <ShieldAlert className="h-5 w-5" />
                Admin Dashboard
              </Link>
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button onClick={handleLogout} className="p-2 hover:bg-white/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden min-h-screen relative flex flex-col">
        {/* Abstract background ambient glows */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-accent/10 blur-[150px] rounded-full pointer-events-none" />
        
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
