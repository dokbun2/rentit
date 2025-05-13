import { Switch, Route } from "wouter";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import HomePage from "./pages/HomePage";
import NotFound from "./pages/not-found";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NewsManagement from "./pages/NewsManagement";
import RentalNews from "./pages/RentalNews";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/news" component={RentalNews} />
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
