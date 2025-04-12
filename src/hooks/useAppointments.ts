
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { toast } from '@/components/ui/use-toast';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all appointments
  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Cast the data to ensure proper type conversion
      setAppointments((data || []).map(item => ({
        ...item,
        status: item.status as AppointmentStatus
      })));
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถดึงข้อมูลการนัดหมายได้',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add a new appointment
  const addAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      setError(null);
      
      if (!appointmentData.patient_id || !appointmentData.date || !appointmentData.purpose) {
        throw new Error('Missing required appointment data');
      }
      
      const { data, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: appointmentData.patient_id,
          date: appointmentData.date,
          purpose: appointmentData.purpose,
          notes: appointmentData.notes,
          status: appointmentData.status || 'SCHEDULED'
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Cast the returned data to ensure proper type conversion
        const newAppointment: Appointment = {
          ...data[0],
          status: data[0].status as AppointmentStatus
        };
        
        setAppointments(prev => [...prev, newAppointment].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        
        toast({
          title: 'สำเร็จ',
          description: 'เพิ่มการนัดหมายเรียบร้อยแล้ว'
        });
        
        return newAppointment;
      }
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      setError(err.message || 'Failed to add appointment');
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถเพิ่มการนัดหมายได้',
        variant: 'destructive'
      });
      return null;
    }
  };

  // Update appointment
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('appointments')
        .update({
          ...appointmentData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Cast the returned data to ensure proper type conversion
        const updatedAppointment: Appointment = {
          ...data[0],
          status: data[0].status as AppointmentStatus
        };
        
        setAppointments(prev => prev.map(appointment => 
          appointment.id === id ? updatedAppointment : appointment
        ));
        
        toast({
          title: 'สำเร็จ',
          description: 'อัปเดตการนัดหมายเรียบร้อยแล้ว'
        });
        
        return updatedAppointment;
      }
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError(err.message || 'Failed to update appointment');
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถอัปเดตการนัดหมายได้',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Delete appointment
  const deleteAppointment = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setAppointments(prev => prev.filter(appointment => appointment.id !== id));
      
      toast({
        title: 'สำเร็จ',
        description: 'ลบการนัดหมายเรียบร้อยแล้ว'
      });
      
      return true;
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.message || 'Failed to delete appointment');
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถลบการนัดหมายได้',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Get appointments by date range
  const getAppointmentsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      // Cast the data to ensure proper type conversion
      return (data || []).map(item => ({
        ...item,
        status: item.status as AppointmentStatus
      }));
    } catch (err: any) {
      console.error('Error fetching appointments by date range:', err);
      setError(err.message || 'Failed to fetch appointments');
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถดึงข้อมูลการนัดหมายได้',
        variant: 'destructive'
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByDateRange
  };
};
