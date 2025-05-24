
import React from 'react';
import { BarChart3, Monitor, Settings, Clock, Ticket, TestTube } from 'lucide-react';
import SidebarNavLink from './SidebarNavLink';
import SidebarSection from './SidebarSection';

const QueueManagementLinks: React.FC = () => {
  return (
    <SidebarSection title="การจัดการคิว">
      <SidebarNavLink to="/queue/management" icon={Settings} label="จัดการคิว" />
      <SidebarNavLink to="/queue/board" icon={Monitor} label="จอแสดงคิว" />
      <SidebarNavLink to="/queue/create" icon={Ticket} label="สร้างคิว" />
      <SidebarNavLink to="/pharmacy" icon={BarChart3} label="บริการจ่ายยา" />
      <SidebarNavLink to="/queue/history" icon={Clock} label="ประวัติคิว" />
      <SidebarNavLink to="/test-dashboard" icon={TestTube} label="ทดสอบระบบ" />
    </SidebarSection>
  );
};

export default QueueManagementLinks;
