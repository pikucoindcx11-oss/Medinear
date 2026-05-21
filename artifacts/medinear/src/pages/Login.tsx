import { Stethoscope, Shield, Calendar, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@workspace/replit-auth-web";

export default function Login() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-teal-50/30 dark:to-teal-950/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/20">
            <Stethoscope className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-primary">MediNear</h1>
          <p className="text-muted-foreground mt-2">Your trusted healthcare companion</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-md mb-6">
          <h2 className="text-xl font-bold mb-1">Welcome back</h2>
          <p className="text-muted-foreground text-sm mb-6">Sign in to book appointments, manage lab tests, and more.</p>
          <Button className="w-full h-11 text-base" onClick={login} data-testid="button-sign-in">
            Sign in with Replit
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Calendar, label: "Book Appointments", color: "text-primary" },
            { icon: FlaskConical, label: "Lab Tests", color: "text-purple-600 dark:text-purple-400" },
            { icon: Shield, label: "Secure & Private", color: "text-emerald-600 dark:text-emerald-400" },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
              <Icon className={`w-6 h-6 mx-auto mb-1.5 ${color}`} />
              <p className="text-xs text-muted-foreground font-medium">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
