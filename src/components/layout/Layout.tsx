
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className }) => {
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
