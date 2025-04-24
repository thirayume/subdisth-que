
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import AppointmentHeader from '@/components/appointments/AppointmentHeader';
import AppointmentStats from '@/components/appointments/AppointmentStats';
import AppointmentTabs from '@/components/appointments/AppointmentTabs';
import AppointmentCalendarSection from '@/components/appointments/AppointmentCalendarSection';
import { Appointment } from '@/integrations/supabase/schema';

const Appointments = () => {
  const { appointments, loading } = useAppointments();
  const { patients } = usePatients();
  
  // Search state
  const [nameSearchTerm, setNameSearchTerm] = useState('');
  const [phoneSearchTerm, setPhoneSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  
  // Filter tracking
  const isFiltered = !!nameSearchTerm || !!phoneSearchTerm || !!dateRange.from;

  // Filtered appointments
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  
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

  const getPatientPhone = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.phone : '';
  };

  // Handle searching/filtering of appointments
  useEffect(() => {
    if (!isFiltered) {
      setFilteredAppointments([]);
      return;
    }

    const filtered = appointments.filter(appointment => {
      const patient = patients.find(p => p.id === appointment.patient_id);
      const appointmentDate = new Date(appointment.date);
      
      // Patient name match
      const nameMatch = !nameSearchTerm || 
        (patient && patient.name.toLowerCase().includes(nameSearchTerm.toLowerCase()));
      
      // Phone match
      const phoneMatch = !phoneSearchTerm || 
        (patient && patient.phone.includes(phoneSearchTerm));
      
      // Date range match
      let dateMatch = true;
      if (dateRange.from) {
        dateRange.from.setHours(0, 0, 0, 0);
        dateMatch = appointmentDate >= dateRange.from;
        
        if (dateMatch && dateRange.to) {
          const endDate = new Date(dateRange.to);
          endDate.setHours(23, 59, 59, 999);
          dateMatch = appointmentDate <= endDate;
        }
      }
      
      return nameMatch && phoneMatch && dateMatch;
    });
    
    setFilteredAppointments(filtered);
  }, [nameSearchTerm, phoneSearchTerm, dateRange, appointments, patients, isFiltered]);

  const handleClearSearch = () => {
    setNameSearchTerm('');
    setPhoneSearchTerm('');
    setDateRange({ from: undefined, to: undefined });
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
            nameSearchTerm={nameSearchTerm}
            setNameSearchTerm={setNameSearchTerm}
            phoneSearchTerm={phoneSearchTerm}
            setPhoneSearchTerm={setPhoneSearchTerm}
            dateRange={dateRange}
            setDateRange={setDateRange}
            getPatientName={getPatientName}
            getPatientPhone={getPatientPhone}
            filteredAppointments={filteredAppointments}
            isFiltered={isFiltered}
            onClearSearch={handleClearSearch}
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
