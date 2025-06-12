
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import PatientPortalLoading from './PatientPortalLoading';
import { toast } from 'sonner';

interface PatientPortalAuthWrapperProps {
  children: (patient: Patient) => React.ReactNode;
}

export const PatientPortalAuthWrapper: React.FC<PatientPortalAuthWrapperProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('[PatientPortalAuthWrapper] Starting auth check...');
        
        const lineToken = localStorage.getItem('lineToken');
        const userPhone = localStorage.getItem('userPhone');
        
        console.log('[PatientPortalAuthWrapper] Auth tokens:', { 
          hasLineToken: !!lineToken, 
          userPhone: userPhone 
        });

        if (!lineToken || !userPhone) {
          console.log('[PatientPortalAuthWrapper] Missing auth tokens, redirecting to login');
          navigate('/patient-portal');
          return;
        }

        console.log('[PatientPortalAuthWrapper] Fetching patient data for phone:', userPhone);

        // Fetch patient data
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', userPhone)
          .single();

        console.log('[PatientPortalAuthWrapper] Patient query result:', { 
          data: patientData, 
          error: error 
        });

        if (error || !patientData) {
          console.error('[PatientPortalAuthWrapper] Patient not found:', error);
          toast.error('ไม่พบข้อมูลผู้ป่วย กรุณาลองใหม่อีกครั้ง');
          localStorage.removeItem('lineToken');
          localStorage.removeItem('userPhone');
          navigate('/patient-portal');
          return;
        }

        console.log('[PatientPortalAuthWrapper] Authentication successful for patient:', patientData.name);
        setPatient(patientData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('[PatientPortalAuthWrapper] Auth check error:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ');
        localStorage.removeItem('lineToken');
        localStorage.removeItem('userPhone');
        navigate('/patient-portal');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  console.log('[PatientPortalAuthWrapper] Current state:', { 
    loading, 
    isAuthenticated, 
    hasPatient: !!patient,
    patientName: patient?.name 
  });

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated || !patient) {
    console.log('[PatientPortalAuthWrapper] Not authenticated or no patient, showing null');
    return null;
  }

  console.log('[PatientPortalAuthWrapper] Rendering children with patient:', patient.name);
  return <>{children(patient)}</>;
};

export default PatientPortalAuthWrapper;
