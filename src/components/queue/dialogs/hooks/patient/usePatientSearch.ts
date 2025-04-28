
import * as React from 'react';
import { toast } from 'sonner';
import { Patient } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

export const usePatientSearch = () => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [matchedPatients, setMatchedPatients] = React.useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  
  const resetPatientSearch = () => {
    console.log('[usePatientSearch] Resetting patient search state');
    setPhoneNumber('');
    setIsSearching(false);
    setMatchedPatients([]);
    setShowNewPatientForm(false);
  };

  const handlePhoneSearch = async () => {
    console.log(`[usePatientSearch] Starting phone search for: "${phoneNumber}"`);
    
    if (!phoneNumber) {
      console.log('[usePatientSearch] Phone number is empty, showing error toast');
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return [];
    }

    setIsSearching(true);
    console.log('[usePatientSearch] Setting isSearching to true');
    
    try {
      console.log('[usePatientSearch] Making Supabase request to search for patients');
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('phone', `%${phoneNumber}%`);
        
      if (error) {
        console.error('[usePatientSearch] Supabase error:', error);
        throw error;
      }
      
      const patients = data || [];
      console.log(`[usePatientSearch] Found ${patients.length} patients:`, patients);
      setMatchedPatients(patients);
      
      if (patients.length === 0) {
        console.log('[usePatientSearch] No patients found, showing new patient form');
        setShowNewPatientForm(true);
      } else {
        console.log('[usePatientSearch] Patients found, hiding new patient form');
        setShowNewPatientForm(false);
      }
      
      return patients;
    } catch (err: any) {
      console.error('[usePatientSearch] Error searching for patients:', err);
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
      return [];
    } finally {
      console.log('[usePatientSearch] Search completed, setting isSearching to false');
      setIsSearching(false);
    }
  };

  const handleAddNewPatient = () => {
    console.log('[usePatientSearch] Adding new patient, showing form');
    setShowNewPatientForm(true);
  };

  return {
    phoneNumber,
    setPhoneNumber,
    isSearching,
    matchedPatients,
    showNewPatientForm,
    setShowNewPatientForm,
    handlePhoneSearch,
    handleAddNewPatient,
    resetPatientSearch
  };
};
