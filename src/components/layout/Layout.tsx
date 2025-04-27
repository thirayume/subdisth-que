
import * as React from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
  const [mounted, setMounted] = React.useState(false);
  
  // Wait for component to mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    console.log("[DEBUG] Layout component mounted");
  }, []);
  
  // Show a loading state until the component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main
        className={cn(
          "lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300",
          className
        )}
      >
        <div className="container mx-auto p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
