
import * as React from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from '@/hooks/use-toast';

export const usePatientsState = () => {
  const [patients, setPatients] = React.useState<Patient[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

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
      toast({
        title: "Error",
        description: 'ไม่สามารถโหลดข้อมูลผู้ป่วยได้',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch and set up real-time subscription
  React.useEffect(() => {
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
    updatePatientsState: setPatients
  };
};
