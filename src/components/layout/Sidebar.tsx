
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Users,
  Calendar,
  Settings,
  BarChart,
  Menu,
  X,
  Home,
  ListOrdered,
  MonitorPlay,
  Clock,
  PanelsTopLeft,
  Pill,
  PlusCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

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

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 transform transition-transform duration-200 ease-in-out bg-white border-r border-gray-200 flex flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold tracking-tight">Pharmacy System</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeSidebar}
            className="ml-auto lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            <NavLink
              to="/"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Home className="mr-3 h-5 w-5" />
              หน้าหลัก
            </NavLink>
            
            <div className="pt-4 pb-2">
              <div className="px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  จัดการคิว
                </h3>
              </div>
            </div>
            
            <NavLink
              to="/queue/management"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/queue/management")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <ListOrdered className="mr-3 h-5 w-5" />
              จัดการคิว
            </NavLink>
            
            <NavLink
              to="/pharmacy"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/pharmacy")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Pill className="mr-3 h-5 w-5" />
              บริการจ่ายยา
            </NavLink>
            
            <NavLink
              to="/queue/create"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/queue/create")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <PlusCircle className="mr-3 h-5 w-5" />
              สร้างคิวใหม่
            </NavLink>
            
            <NavLink
              to="/queue/board"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/queue/board")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <MonitorPlay className="mr-3 h-5 w-5" />
              จอแสดงคิว
            </NavLink>

            <NavLink
              to="/queue/history"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/queue/history")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Clock className="mr-3 h-5 w-5" />
              ประวัติคิว
            </NavLink>
            
            <div className="pt-4 pb-2">
              <div className="px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  จัดการข้อมูล
                </h3>
              </div>
            </div>
            
            <NavLink
              to="/patients"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/patients")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Users className="mr-3 h-5 w-5" />
              ผู้ป่วย
            </NavLink>
            
            <NavLink
              to="/appointments"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/appointments")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Calendar className="mr-3 h-5 w-5" />
              นัดหมาย
            </NavLink>
            
            <NavLink
              to="/medications"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/medications")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <PanelsTopLeft className="mr-3 h-5 w-5" />
              คลังยา
            </NavLink>

            <div className="pt-4 pb-2">
              <div className="px-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ระบบ
                </h3>
              </div>
            </div>

            <NavLink
              to="/analytics"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/analytics")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <BarChart className="mr-3 h-5 w-5" />
              รายงาน
            </NavLink>

            <NavLink
              to="/settings"
              onClick={closeSidebar}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActiveRoute("/settings")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Settings className="mr-3 h-5 w-5" />
              ตั้งค่า
            </NavLink>
          </nav>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center">
          &copy; {new Date().getFullYear()} Pharmacy Queue System
        </div>
      </div>
    </>
  );
}

export default Sidebar;
