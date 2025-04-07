
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useAppointments } from '@/hooks/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentHeader from '@/components/appointments/AppointmentHeader';
import AppointmentStats from '@/components/appointments/AppointmentStats';
import AppointmentTabs from '@/components/appointments/AppointmentTabs';
import AppointmentCalendarSection from '@/components/appointments/AppointmentCalendarSection';

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
      <AppointmentHeader />
      
      <AppointmentStats 
        todayCount={todayAppointments.length}
        tomorrowCount={tomorrowAppointments.length}
        totalCount={appointments.length}
        upcomingCount={upcomingAppointments.length}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AppointmentTabs 
            todayAppointments={todayAppointments}
            tomorrowAppointments={tomorrowAppointments}
            upcomingAppointments={upcomingAppointments}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            getPatientName={getPatientName}
          />
        </div>
        
        <div>
          <AppointmentCalendarSection appointments={appointments} />
        </div>
      </div>
    </Layout>
  );
};

export default Appointments;
