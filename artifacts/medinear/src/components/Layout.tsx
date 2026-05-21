import { Link, useLocation } from "wouter";
import { Home, Store, Stethoscope, Calendar, FlaskConical, Settings, Moon, Sun, LogOut, User, Menu, X, Phone } from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shops", label: "Shops", icon: Store },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/appointments", label: "Appointments", icon: Calendar },
  { href: "/lab-tests", label: "Lab Tests", icon: FlaskConical },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, toggle } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const initials = [user?.firstName, user?.lastName].filter(Boolean).map((n) => n![0]).join("") || user?.username?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">MediNear</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {(user as any)?.isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location === "/admin" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggle} className="hidden md:flex" data-testid="button-theme-toggle">
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 px-2" data-testid="button-user-menu">
                    <Avatar className="w-7 h-7">
                      <AvatarImage src={user?.profileImageUrl ?? undefined} />
                      <AvatarFallback className="text-xs bg-primary text-primary-foreground">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{user?.firstName || user?.username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/appointments" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> My Appointments
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" className="hidden md:flex" onClick={() => window.location.href = "/api/login?returnTo=" + encodeURIComponent(window.location.href)} data-testid="button-login">
                Sign In
              </Button>
            )}
            {/* Mobile menu toggle */}
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-mobile-menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border bg-card px-4 py-3 space-y-1">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  location === href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {(user as any)?.isAdmin && (
              <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted">
                <Settings className="w-4 h-4" /> Admin
              </Link>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              <Button variant="ghost" size="sm" onClick={toggle} className="flex items-center gap-2">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={logout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </Button>
              ) : (
                <Button size="sm" onClick={() => window.location.href = "/api/login?returnTo=" + encodeURIComponent(window.location.href)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around h-16">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors ${
                location === href ? "text-primary" : "text-muted-foreground"
              }`}
              data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className={`w-5 h-5 ${location === href ? "stroke-[2.5]" : ""}`} />
              <span className="leading-none">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
