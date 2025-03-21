
import React from 'react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Settings as SettingsIcon, Bell, Globe, ClipboardList } from 'lucide-react';

interface SettingsTabsProps {
  children: React.ReactNode;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ children }) => {
  return (
    <Tabs defaultValue="general" className="space-y-6">
      <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
        <TabsTrigger value="general" className="flex items-center gap-2">
          <SettingsIcon className="h-4 w-4" />
          <span>ทั่วไป</span>
        </TabsTrigger>
        <TabsTrigger value="queue" className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4" />
          <span>การจัดการคิว</span>
        </TabsTrigger>
        <TabsTrigger value="notification" className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <span>การแจ้งเตือน</span>
        </TabsTrigger>
        <TabsTrigger value="line" className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <span>ตั้งค่า LINE</span>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default SettingsTabs;
