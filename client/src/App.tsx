import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import HomePage from "./pages/HomePage";
import NotFound from "@/pages/not-found";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NewsManagement from "./pages/NewsManagement";
import RentalNews from "./pages/RentalNews";
import { useEffect } from "react";

// 어드민 경로 접근 시 처리를 위한 중간 라우트
const AdminRedirect = () => {
  useEffect(() => {
    window.location.href = "/admin/dashboard";
  }, []);
  return null;
};

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/news" component={RentalNews} />
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/adminlogin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/news" component={NewsManagement} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
