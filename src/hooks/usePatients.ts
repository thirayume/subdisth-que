
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import { toast } from 'sonner';

export const usePatients = () => {
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

  // Add a new patient
  const addPatient = async (patientData: Partial<Patient>) => {
    try {
      setError(null);
      
      // Generate a patient_id with format P + 4 digits
      const patientIdNum = Math.floor(1000 + Math.random() * 9000); // Random 4-digit number
      const patient_id = `P${patientIdNum}`;
      
      const { data, error } = await supabase
        .from('patients')
        .insert([{ 
          ...patientData, 
          patient_id 
        }])
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPatients(prev => [data[0], ...prev]);
        toast.success(`เพิ่มข้อมูลผู้ป่วย ${patientData.name} เรียบร้อยแล้ว`);
        return data[0];
      }
    } catch (err: any) {
      console.error('Error adding patient:', err);
      setError(err.message || 'Failed to add patient');
      toast.error('ไม่สามารถเพิ่มข้อมูลผู้ป่วยได้');
      return null;
    }
  };

  // Update an existing patient
  const updatePatient = async (id: string, patientData: Partial<Patient>) => {
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setPatients(prev => prev.map(patient => 
          patient.id === id ? { ...patient, ...data[0] } : patient
        ));
        toast.success(`อัปเดตข้อมูลผู้ป่วย ${patientData.name} เรียบร้อยแล้ว`);
        return data[0];
      }
    } catch (err: any) {
      console.error('Error updating patient:', err);
      setError(err.message || 'Failed to update patient');
      toast.error('ไม่สามารถอัปเดตข้อมูลผู้ป่วยได้');
      return null;
    }
  };

  // Delete a patient
  const deletePatient = async (id: string) => {
    try {
      setError(null);
      
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setPatients(prev => prev.filter(patient => patient.id !== id));
      toast.success('ลบข้อมูลผู้ป่วยเรียบร้อยแล้ว');
      return true;
    } catch (err: any) {
      console.error('Error deleting patient:', err);
      setError(err.message || 'Failed to delete patient');
      toast.error('ไม่สามารถลบข้อมูลผู้ป่วยได้');
      return false;
    }
  };

  // Search patients by name, patient_id, or phone
  const searchPatients = async (searchTerm: string) => {
    try {
      setLoading(true);
      setError(null);

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
      setError(err.message || 'Failed to search patients');
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
      return [];
    } finally {
      setLoading(false);
    }
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
    addPatient,
    updatePatient,
    deletePatient,
    searchPatients
  };
};
