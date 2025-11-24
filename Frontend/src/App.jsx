import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import ProfilePage from "@/pages/profile";
import Login from "@/pages/Login";
import AuthCallback from "@/pages/AuthCallback";
import ClansPage from "@/pages/clans";
import ClanDetailPage from "@/pages/clan-detail";
import ClanManagePage from "@/pages/clan-manage";
import JoinClanPage from "@/pages/join-clan";
import AdminPanel from "@/pages/admin-panel";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/callback" component={AuthCallback} />
      
      {/* Публичные страницы - доступны всем (включая GUEST) */}
      <Route path="/clans">
        <Layout>
          <ClansPage />
        </Layout>
      </Route>
      
      <Route path="/clans/:id">
        <Layout>
          <ClanDetailPage />
        </Layout>
      </Route>
      
      <Route path="/join-clan">
        <Layout>
          <JoinClanPage />
        </Layout>
      </Route>
      
      {/* Защищенные страницы - требуют авторизации */}
      <Route>
        <ProtectedRoute>
          <Layout>
            <Switch>
              <Route path="/" component={ProfilePage} />
              <Route path="/profile" component={ProfilePage} />
              <Route path="/clans/:id/manage" component={ClanManagePage} />
              <Route path="/admin" component={AdminPanel} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
