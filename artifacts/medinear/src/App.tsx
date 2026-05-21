import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { useAuth } from "@workspace/replit-auth-web";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Shops from "@/pages/Shops";
import ShopDetail from "@/pages/ShopDetail";
import Doctors from "@/pages/Doctors";
import DoctorDetail from "@/pages/DoctorDetail";
import Appointments from "@/pages/Appointments";
import BookAppointment from "@/pages/BookAppointment";
import LabTests from "@/pages/LabTests";
import BookLabTest from "@/pages/BookLabTest";
import Admin from "@/pages/Admin";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function AppRoutes() {
  const { isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground text-xl">+</span>
        </div>
        <p className="text-muted-foreground text-sm">Loading MediNear...</p>
      </div>
    </div>
  );

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/shops" component={Shops} />
        <Route path="/shops/:id">
          {(params) => <ShopDetail id={parseInt(params.id)} />}
        </Route>
        <Route path="/doctors" component={Doctors} />
        <Route path="/doctors/:id">
          {(params) => <DoctorDetail id={parseInt(params.id)} />}
        </Route>
        <Route path="/appointments" component={Appointments} />
        <Route path="/appointments/new" component={BookAppointment} />
        <Route path="/lab-tests" component={LabTests} />
        <Route path="/lab-tests/new" component={BookLabTest} />
        <Route path="/admin" component={Admin} />
        <Route path="/login" component={Login} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
