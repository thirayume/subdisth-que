
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarContent from './sidebar/SidebarContent';
import SidebarFooter from './sidebar/SidebarFooter';

export function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white border-gray-200"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Sidebar - Remove fixed positioning, use relative positioning in flex container */}
      <div
        className={cn(
          "w-64 bg-white border-r border-gray-200 flex flex-col transition-all duration-200 ease-in-out",
          // On mobile: use fixed positioning with transform
          "lg:relative lg:translate-x-0",
          // On mobile: conditionally show/hide with transform
          isSidebarOpen 
            ? "fixed top-0 left-0 z-50 h-full translate-x-0" 
            : "fixed top-0 left-0 z-50 h-full -translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader closeSidebar={closeSidebar} />
        <SidebarContent isActiveRoute={isActiveRoute} closeSidebar={closeSidebar} />
        <SidebarFooter />
      </div>
    </>
  );
}

export default Sidebar;
