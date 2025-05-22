
import React from 'react';
import { ListOrdered, MonitorPlay, Clock, PlusCircle, Pill } from 'lucide-react';
import SidebarNavLink from './SidebarNavLink';
import SidebarSection from './SidebarSection';

interface QueueManagementLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const QueueManagementLinks: React.FC<QueueManagementLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <SidebarSection title="จัดการคิว">
      <SidebarNavLink
        to="/queue/management"
        icon={ListOrdered}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        จัดการคิว
      </SidebarNavLink>
      
      <SidebarNavLink
        to="/pharmacy"
        icon={Pill}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        บริการจ่ายยา
      </SidebarNavLink>
      
      <SidebarNavLink
        to="/queue/create"
        icon={PlusCircle}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        สร้างคิวใหม่
      </SidebarNavLink>
      
      <SidebarNavLink
        to="/queue/board"
        icon={MonitorPlay}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        จอแสดงคิว
      </SidebarNavLink>

      <SidebarNavLink
        to="/queue/history"
        icon={Clock}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        ประวัติคิว
      </SidebarNavLink>
    </SidebarSection>
  );
};

export default QueueManagementLinks;
