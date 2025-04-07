
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentSearch from './AppointmentSearch';
import AppointmentsList from './AppointmentsList';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentTabsProps {
  todayAppointments: Appointment[];
  tomorrowAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  getPatientName: (patientId: string) => string;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  todayAppointments,
  tomorrowAppointments,
  upcomingAppointments,
  searchTerm,
  setSearchTerm,
  getPatientName
}) => {
  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList>
        <TabsTrigger value="today">วันนี้ ({todayAppointments.length})</TabsTrigger>
        <TabsTrigger value="tomorrow">พรุ่งนี้ ({tomorrowAppointments.length})</TabsTrigger>
        <TabsTrigger value="upcoming">นัดหมายในอนาคต ({upcomingAppointments.length})</TabsTrigger>
      </TabsList>
      
      <AppointmentSearch searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      
      <TabsContent value="today" className="animate-fade-in">
        <AppointmentsList 
          appointments={todayAppointments}
          getPatientName={getPatientName}
          emptyMessage="ไม่มีนัดหมายในวันนี้"
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />
      </TabsContent>
      
      <TabsContent value="tomorrow" className="animate-fade-in">
        <AppointmentsList 
          appointments={tomorrowAppointments}
          getPatientName={getPatientName}
          emptyMessage="ไม่มีนัดหมายในวันพรุ่งนี้"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />
      </TabsContent>
      
      <TabsContent value="upcoming" className="animate-fade-in">
        <AppointmentsList 
          appointments={upcomingAppointments}
          getPatientName={getPatientName}
          emptyMessage="ไม่มีนัดหมายในอนาคต"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />
      </TabsContent>
    </Tabs>
  );
};

export default AppointmentTabs;
