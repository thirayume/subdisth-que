
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const usePatientsState = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      setPatients(data || []);
      console.log(`Fetched ${data?.length || 0} patients from database`);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to fetch patients');
      toast.error('ไม่สามารถโหลดข้อมูลผู้ป่วยได้');
    } finally {
      setLoading(false);
    }
  };

  const addPatient = async (newPatient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .insert(newPatient)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // No need to update state manually as we have real-time subscription
      toast.success('เพิ่มข้อมูลผู้ป่วยเรียบร้อยแล้ว');
      return data;
    } catch (err: any) {
      console.error('Error adding patient:', err);
      toast.error('ไม่สามารถเพิ่มข้อมูลผู้ป่วยได้');
      return null;
    }
  };

  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    try {
      const { error } = await supabase
        .from('patients')
        .update(updates)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // No need to update state manually as we have real-time subscription
      toast.success('อัปเดตข้อมูลผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error updating patient:', err);
      toast.error('ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้');
      return false;
    }
  };

  const deletePatient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // No need to update state manually as we have real-time subscription
      toast.success('ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      toast.error('ไม่สามารถลบข้อมูลผู้ป่วยได้');
      return false;
    }
  };

  const updatePatientsState = (newPatients: Patient[]) => {
    setPatients(newPatients);
  };

  // Initial data fetch and set up real-time subscription
  useEffect(() => {
    fetchPatients();
    
    // Set up real-time subscription for patients
    const channel = supabase
      .channel('patients-state-changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'patients' },
          (payload) => {
            console.log('Patient data change detected:', payload);
            fetchPatients(); // Refresh all patients when changes occur
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    addPatient,
    updatePatient,
    deletePatient,
    updatePatientsState
  };
};
