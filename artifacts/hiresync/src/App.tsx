import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import LandingPage from "@/pages/index";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardPage from "@/pages/dashboard";
import JobsPage from "@/pages/jobs";
import RecommendedPage from "@/pages/recommended";
import ResumePage from "@/pages/resume";
import ApplicationsPage from "@/pages/applications";
import SavedJobsPage from "@/pages/saved";
import AlertsPage from "@/pages/alerts";
import NotificationsPage from "@/pages/notifications";
import ProfilePage from "@/pages/profile";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

import { AuthProvider, useAuth } from "@/context/auth";

const queryClient = new QueryClient();

// Protected Route Component
function ProtectedRoute({ component: Component, adminOnly = false, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/dashboard" />;
  }

  return <Component {...rest} />;
}

// Auth Route Component (redirects to dashboard if already logged in)
function AuthRoute({ component: Component, ...rest }: any) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (user) {
    return <Redirect to="/dashboard" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login"><AuthRoute component={LoginPage} /></Route>
      <Route path="/register"><AuthRoute component={RegisterPage} /></Route>
      
      <Route path="/dashboard"><ProtectedRoute component={DashboardPage} /></Route>
      <Route path="/jobs"><ProtectedRoute component={JobsPage} /></Route>
      <Route path="/jobs/recommended"><ProtectedRoute component={RecommendedPage} /></Route>
      <Route path="/resume"><ProtectedRoute component={ResumePage} /></Route>
      <Route path="/applications"><ProtectedRoute component={ApplicationsPage} /></Route>
      <Route path="/saved-jobs"><ProtectedRoute component={SavedJobsPage} /></Route>
      <Route path="/alerts"><ProtectedRoute component={AlertsPage} /></Route>
      <Route path="/notifications"><ProtectedRoute component={NotificationsPage} /></Route>
      <Route path="/profile"><ProtectedRoute component={ProfilePage} /></Route>
      
      <Route path="/admin"><ProtectedRoute component={AdminPage} adminOnly={true} /></Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
