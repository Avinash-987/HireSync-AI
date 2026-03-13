import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="bg-primary/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-primary shadow-[0_0_40px_rgba(99,102,241,0.2)]">
          <SearchX className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground text-lg mb-8">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link href="/">
          <Button size="lg" className="bg-primary text-primary-foreground border-0 hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-full px-8 h-12 text-base font-medium">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
