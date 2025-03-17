
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { mockAppointments, mockPatients } from '@/lib/mockData';
import { toast } from 'sonner';
import { Calendar, Search, Plus, Clock, Users, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import AppointmentCalendar from '@/components/appointments/AppointmentCalendar';

const Appointments = () => {
  const [appointments, setAppointments] = useState(mockAppointments);
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
    const patient = mockPatients.find(p => p.id === patientId);
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">นัดหมายวันนี้</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{todayAppointments.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                วันที่ {format(today, 'dd MMMM yyyy', { locale: th })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">นัดหมายพรุ่งนี้</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{tomorrowAppointments.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                วันที่ {format(tomorrow, 'dd MMMM yyyy', { locale: th })}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">นัดหมายทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{appointments.length}</h3>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                กำลังรอการติดตาม <span className="font-medium text-purple-600">{upcomingAppointments.length}</span> รายการ
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
              <Card>
                <CardContent className="p-0">
                  {todayAppointments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      ไม่มีนัดหมายในวันนี้
                    </div>
                  ) : (
                    <div className="divide-y">
                      {todayAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center p-4 hover:bg-gray-50">
                          <div className="w-14 h-14 flex-shrink-0 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getPatientName(appointment.patientId)}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {appointment.purpose}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(appointment.date), 'HH:mm น.', { locale: th })}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tomorrow" className="animate-fade-in">
              <Card>
                <CardContent className="p-0">
                  {tomorrowAppointments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      ไม่มีนัดหมายในวันพรุ่งนี้
                    </div>
                  ) : (
                    <div className="divide-y">
                      {tomorrowAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center p-4 hover:bg-gray-50">
                          <div className="w-14 h-14 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getPatientName(appointment.patientId)}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {appointment.purpose}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(appointment.date), 'HH:mm น.', { locale: th })}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="upcoming" className="animate-fade-in">
              <Card>
                <CardContent className="p-0">
                  {upcomingAppointments.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      ไม่มีนัดหมายในอนาคต
                    </div>
                  ) : (
                    <div className="divide-y">
                      {upcomingAppointments.map((appointment) => (
                        <div key={appointment.id} className="flex items-center p-4 hover:bg-gray-50">
                          <div className="w-14 h-14 flex-shrink-0 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                            <Calendar className="w-6 h-6" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {getPatientName(appointment.patientId)}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {appointment.purpose}
                            </p>
                            <p className="text-xs text-gray-400">
                              {format(new Date(appointment.date), 'dd MMM yyyy, HH:mm น.', { locale: th })}
                            </p>
                          </div>
                          <div className="ml-4">
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
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
