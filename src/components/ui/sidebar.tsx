"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { usePathname } from 'next/navigation';
import Link from "next/link";

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  title: string;
  href: string;
  icon?: React.ReactNode;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  return (
    <NavigationMenu className={cn("hidden lg:flex items-center", className)}>
      <NavigationMenuList>
        <SidebarItem title="Dashboard" href="/" icon={null} />
        <SidebarItem title="Queue Management" href="/queue-management" icon={null} />
        <SidebarItem title="Analytics" href="/analytics" icon={null} />
        <SidebarItem title="Queue Board" href="/queue-board" icon={null} />
        <SidebarItem title="Patients" href="/patients" icon={null} />
        <SidebarItem title="Medications" href="/medications" icon={null} />
        <SidebarItem title="Appointments" href="/appointments" icon={null} />
        <SidebarItem title="History" href="/history" icon={null} />
        <SidebarItem title="Settings" href="/settings" icon={null} />
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ title, href, icon, className }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          className={cn(
            navigationMenuTriggerStyle(),
            "data-[active]:text-foreground data-[active]:bg-muted",
            isActive ? "bg-muted text-foreground" : "text-muted-foreground",
            className
          )}
        >
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
};

export default Sidebar;
