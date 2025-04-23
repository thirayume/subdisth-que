
import * as React from 'react';
import { toast } from 'sonner';
import { Patient } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';

// Add debug logging
console.log("[DEBUG] usePatientSearch importing React:", React);

export const usePatientSearch = () => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [matchedPatients, setMatchedPatients] = React.useState<Patient[]>([]);
  const [showNewPatientForm, setShowNewPatientForm] = React.useState(false);
  
  const resetPatientSearch = () => {
    setPhoneNumber('');
    setIsSearching(false);
    setMatchedPatients([]);
    setShowNewPatientForm(false);
  };

  const handlePhoneSearch = async () => {
    if (!phoneNumber) {
      toast.error('กรุณากรอกเบอร์โทรศัพท์');
      return [];
    }

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .ilike('phone', `%${phoneNumber}%`);
        
      if (error) {
        throw error;
      }
      
      const patients = data || [];
      setMatchedPatients(patients);
      
      if (patients.length === 0) {
        setShowNewPatientForm(true);
      } else {
        setShowNewPatientForm(false);
      }
      
      return patients;
    } catch (err: any) {
      console.error('Error searching for patients:', err);
      toast.error('ไม่สามารถค้นหาข้อมูลผู้ป่วยได้');
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddNewPatient = () => {
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
