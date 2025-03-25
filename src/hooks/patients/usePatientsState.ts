
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const usePatientsState = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPatients(data || []);
    } catch (err: any) {
      console.error('Error fetching patients:', err);
      setError(err.message || 'Failed to fetch patients');
      toast.error('ไม่สามารถดึงข้อมูลผู้ป่วยได้');
    } finally {
      setLoading(false);
    }
  };

  // Update patients state
  const updatePatientsState = (updatedPatients: Patient[]) => {
    setPatients(updatedPatients);
  };

  // Initial data fetch
  useEffect(() => {
    fetchPatients();
  }, []);

  return {
    patients,
    loading,
    error,
    fetchPatients,
    updatePatientsState
  };
};
