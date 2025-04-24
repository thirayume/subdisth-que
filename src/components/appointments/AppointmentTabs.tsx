
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppointmentsList from './AppointmentsList';
import AppointmentSearchForm from './AppointmentSearchForm';
import { Appointment } from '@/integrations/supabase/schema';

interface AppointmentTabsProps {
  todayAppointments: Appointment[];
  tomorrowAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  nameSearchTerm: string;
  setNameSearchTerm: (value: string) => void;
  phoneSearchTerm: string;
  setPhoneSearchTerm: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  getPatientName: (patientId: string) => string;
  getPatientPhone: (patientId: string) => string;
  filteredAppointments: Appointment[];
  isFiltered: boolean;
  onClearSearch: () => void;
}

const AppointmentTabs: React.FC<AppointmentTabsProps> = ({
  todayAppointments,
  tomorrowAppointments,
  upcomingAppointments,
  nameSearchTerm,
  setNameSearchTerm,
  phoneSearchTerm,
  setPhoneSearchTerm,
  dateRange,
  setDateRange,
  getPatientName,
  getPatientPhone,
  filteredAppointments,
  isFiltered,
  onClearSearch
}) => {
  return (
    <Tabs defaultValue="today" className="space-y-4">
      <TabsList>
        <TabsTrigger value="today" disabled={isFiltered}>วันนี้ ({todayAppointments.length})</TabsTrigger>
        <TabsTrigger value="tomorrow" disabled={isFiltered}>พรุ่งนี้ ({tomorrowAppointments.length})</TabsTrigger>
        <TabsTrigger value="upcoming" disabled={isFiltered}>นัดหมายในอนาคต ({upcomingAppointments.length})</TabsTrigger>
        {isFiltered && (
          <TabsTrigger value="search-results">ผลการค้นหา ({filteredAppointments.length})</TabsTrigger>
        )}
      </TabsList>
      
      <AppointmentSearchForm
        nameSearchTerm={nameSearchTerm}
        setNameSearchTerm={setNameSearchTerm}
        phoneSearchTerm={phoneSearchTerm}
        setPhoneSearchTerm={setPhoneSearchTerm}
        dateRange={dateRange}
        setDateRange={setDateRange}
        onClearSearch={onClearSearch}
        isFiltered={isFiltered}
      />
      
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

      {isFiltered && (
        <TabsContent value="search-results" className="animate-fade-in">
          <AppointmentsList 
            appointments={filteredAppointments}
            getPatientName={getPatientName}
            emptyMessage="ไม่พบนัดหมายที่ตรงกับเงื่อนไขการค้นหา"
            iconBgColor="bg-amber-100"
            iconColor="text-amber-600"
          />
        </TabsContent>
      )}
    </Tabs>
  );
};

export default AppointmentTabs;
