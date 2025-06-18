
import React from 'react';
import { Settings, BarChart3, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SidebarSection from './SidebarSection';
import SidebarNavLink from './SidebarNavLink';

interface SystemLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const SystemLinks: React.FC<SystemLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  const { isAdmin } = useAuth();

  return (
    <SidebarSection title="ระบบ">
      <SidebarNavLink
        to="/analytics"
        icon={BarChart3}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        รายงานและสถิติ
      </SidebarNavLink>
      
      {isAdmin && (
        <>
          <SidebarNavLink
            to="/user-management"
            icon={Users}
            isActive={isActiveRoute}
            onClick={closeSidebar}
          >
            จัดการผู้ใช้
          </SidebarNavLink>
          
          <SidebarNavLink
            to="/settings"
            icon={Settings}
            isActive={isActiveRoute}
            onClick={closeSidebar}
          >
            การตั้งค่าระบบ
          </SidebarNavLink>
        </>
      )}
    </SidebarSection>
  );
};

export default SystemLinks;
