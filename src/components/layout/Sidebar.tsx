
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutGrid,
  Users,
  Calendar,
  Settings,
  Menu,
  X,
  ChevronRight,
  PlusCircle,
  Clock,
  ClipboardList,
  Pill
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const [expanded, setExpanded] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const navItems = [
    { to: '/', label: 'แดชบอร์ด', icon: <LayoutGrid className="h-5 w-5" /> },
    { to: '/queue-board', label: 'หน้าจอแสดงคิว', icon: <ClipboardList className="h-5 w-5" /> },
    { to: '/patients', label: 'ผู้ป่วย', icon: <Users className="h-5 w-5" /> },
    { to: '/medications', label: 'ยาและเวชภัณฑ์', icon: <Pill className="h-5 w-5" /> },
    { to: '/appointments', label: 'นัดหมาย', icon: <Calendar className="h-5 w-5" /> },
    { to: '/history', label: 'ประวัติคิว', icon: <Clock className="h-5 w-5" /> },
    { to: '/settings', label: 'ตั้งค่า', icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <>
      {/* Mobile Sidebar Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={toggleMobileSidebar}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 transition-all duration-300 ease-in-out",
          expanded ? "w-64" : "w-20",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "bg-sidebar border-r border-sidebar-border flex flex-col",
          className
        )}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
          <div className={cn("flex items-center", expanded ? "justify-between w-full" : "justify-center")}>
            {expanded && (
              <div className="flex items-center space-x-2">
                <span className="font-bold text-pharmacy-700">PharmQueue</span>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="hidden lg:flex">
              <ChevronRight
                className={cn("h-5 w-5 transition-transform", !expanded && "rotate-180")}
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleMobileSidebar} className="lg:hidden">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "sidebar-link",
                    isActive ? "sidebar-link-active" : "hover:bg-sidebar-accent/50",
                    !expanded && "justify-center px-2"
                  )
                }
                end={item.to === '/'}
              >
                {item.icon}
                {expanded && <span className="animate-fade-in">{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer - New Queue Button */}
        <div className="p-4 border-t border-sidebar-border">
          <Button
            className={cn(
              "w-full bg-pharmacy-600 hover:bg-pharmacy-700 text-white transition-all duration-300",
              !expanded && "p-2"
            )}
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            {expanded && <span>สร้างคิวใหม่</span>}
          </Button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
