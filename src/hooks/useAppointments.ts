
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

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

      setAppointments(data || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message || 'Failed to fetch appointments');
      toast.error('ไม่สามารถดึงข้อมูลการนัดหมายได้');
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
        setAppointments(prev => [...prev, data[0]].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        ));
        toast.success('เพิ่มการนัดหมายเรียบร้อยแล้ว');
        return data[0];
      }
    } catch (err: any) {
      console.error('Error adding appointment:', err);
      setError(err.message || 'Failed to add appointment');
      toast.error('ไม่สามารถเพิ่มการนัดหมายได้');
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
        setAppointments(prev => prev.map(appointment => 
          appointment.id === id ? { ...appointment, ...data[0] } : appointment
        ));
        toast.success('อัปเดตการนัดหมายเรียบร้อยแล้ว');
        return data[0];
      }
    } catch (err: any) {
      console.error('Error updating appointment:', err);
      setError(err.message || 'Failed to update appointment');
      toast.error('ไม่สามารถอัปเดตการนัดหมายได้');
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
      toast.success('ลบการนัดหมายเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting appointment:', err);
      setError(err.message || 'Failed to delete appointment');
      toast.error('ไม่สามารถลบการนัดหมายได้');
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

      return data || [];
    } catch (err: any) {
      console.error('Error fetching appointments by date range:', err);
      setError(err.message || 'Failed to fetch appointments');
      toast.error('ไม่สามารถดึงข้อมูลการนัดหมายได้');
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
