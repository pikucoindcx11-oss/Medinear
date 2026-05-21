import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-6xl font-bold text-primary mb-4">404</div>
      <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button className="flex items-center gap-2">
          <Home className="w-4 h-4" /> Back to Home
        </Button>
      </Link>
    </div>
  );
}
