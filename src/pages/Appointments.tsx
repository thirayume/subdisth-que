
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { Search, Plus } from 'lucide-react';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';
import AppointmentsList from '@/components/appointments/AppointmentsList';
import AppointmentStats from '@/components/appointments/AppointmentStats';

const Appointments = () => {
  const { appointments, loading } = useAppointments();
  const { patients } = usePatients();
  const [searchTerm, setSearchTerm] = useState('');
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayAppointments = appointments.filter(app => 
    new Date(app.date).toDateString() === today.toDateString()
  );
  
  const tomorrowAppointments = appointments.filter(app => 
    new Date(app.date).toDateString() === tomorrow.toDateString()
  );
  
  const upcomingAppointments = appointments.filter(app => 
    new Date(app.date) > tomorrow
  );
  
  const getPatientName = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่ระบุชื่อ';
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">การนัดหมาย</h1>
          <p className="text-gray-500">จัดการการนัดหมายและติดตามการใช้ยา</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            สร้างนัดหมายใหม่
          </Button>
        </div>
      </div>
      
      <AppointmentStats 
        todayCount={todayAppointments.length}
        tomorrowCount={tomorrowAppointments.length}
        totalCount={appointments.length}
        upcomingCount={upcomingAppointments.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Tabs defaultValue="today" className="space-y-4">
            <TabsList>
              <TabsTrigger value="today">วันนี้ ({todayAppointments.length})</TabsTrigger>
              <TabsTrigger value="tomorrow">พรุ่งนี้ ({tomorrowAppointments.length})</TabsTrigger>
              <TabsTrigger value="upcoming">นัดหมายในอนาคต ({upcomingAppointments.length})</TabsTrigger>
            </TabsList>
            
            <div className="flex mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ค้นหานัดหมาย..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
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
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">ปฏิทินนัดหมาย</CardTitle>
            </CardHeader>
            <CardContent>
              <AppointmentCalendar appointments={appointments} />
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
