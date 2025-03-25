
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const usePatientsSearch = () => {
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Search patients by name, patient_id, or phone
  const searchPatients = async (searchTerm: string) => {
    try {
      setSearchLoading(true);
      setSearchError(null);

      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,patient_id.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (err: any) {
      console.error('Error searching patients:', err);
      setSearchError(err.message || 'Failed to search patients');
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
      return [];
    } finally {
      setSearchLoading(false);
    }
  };

  return {
    searchLoading,
    searchError,
    searchPatients
  };
};
