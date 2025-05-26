
import { useCallback } from 'react';

interface UsePatientDataProps {
  patients: any[];
}

export const usePatientData = ({ patients }: UsePatientDataProps) => {
  // Stable patient name getter
  const getPatientName = useCallback((patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่พบข้อมูลผู้ป่วย';
  }, [patients]);

  // Get patient data
  const getPatientData = useCallback((patientId: string) => {
    return patients.find(p => p.id === patientId) || null;
  }, [patients]);

  return {
    getPatientName,
    getPatientData
  };
};
