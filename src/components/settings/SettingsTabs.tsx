
import * as React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import GeneralSettings from './GeneralSettings';
import QueueSettings from './QueueSettings';
import NotificationSettings from './NotificationSettings';
import LineSettings from './LineSettings';
import LoggingSettingsSection from './LoggingSettingsSection';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SettingsTabs');

interface SettingsTabsProps {
  children: React.ReactNode;
}

const SettingsTabs: React.FC<SettingsTabsProps> = ({ children }) => {
  logger.debug('Rendering settings tabs');
  
  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList className="grid grid-cols-5 mb-8">
        <TabsTrigger value="general">ทั่วไป</TabsTrigger>
        <TabsTrigger value="queue">คิว</TabsTrigger>
        <TabsTrigger value="notifications">แจ้งเตือน</TabsTrigger>
        <TabsTrigger value="line">LINE</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
      </TabsList>
      
      {children}
    </Tabs>
  );
};

export default SettingsTabs;
