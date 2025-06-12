
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

        // Fetch patient data - use regular query to handle multiple patients
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', userPhone);

        console.log('[PatientPortalAuthWrapper] Patient query result:', { 
          data: patientData, 
          error: error,
          count: patientData?.length || 0
        });

        if (error) {
          console.error('[PatientPortalAuthWrapper] Database error:', error);
          toast.error('เกิดข้อผิดพลาดในการเข้าถึงข้อมูล กรุณาลองใหม่อีกครั้ง');
          localStorage.removeItem('lineToken');
          localStorage.removeItem('userPhone');
          navigate('/patient-portal');
          return;
        }

        if (!patientData || patientData.length === 0) {
          console.error('[PatientPortalAuthWrapper] No patients found for phone:', userPhone);
          toast.error('ไม่พบข้อมูลผู้ป่วย กรุณาลองใหม่อีกครั้ง');
          localStorage.removeItem('lineToken');
          localStorage.removeItem('userPhone');
          navigate('/patient-portal');
          return;
        }

        // Handle multiple patients - prioritize those with LINE integration
        let selectedPatient: Patient;
        
        if (patientData.length === 1) {
          selectedPatient = patientData[0];
          console.log('[PatientPortalAuthWrapper] Single patient found:', selectedPatient.name);
        } else {
          console.log('[PatientPortalAuthWrapper] Multiple patients found, count:', patientData.length);
          
          // Prioritize patient with LINE user ID (most integrated)
          const lineIntegratedPatient = patientData.find(p => p.line_user_id);
          
          if (lineIntegratedPatient) {
            selectedPatient = lineIntegratedPatient;
            console.log('[PatientPortalAuthWrapper] Selected LINE-integrated patient:', selectedPatient.name);
          } else {
            // If no LINE-integrated patient, pick the most recently updated
            selectedPatient = patientData.sort((a, b) => 
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            )[0];
            console.log('[PatientPortalAuthWrapper] Selected most recent patient:', selectedPatient.name);
          }
          
          // Log warning about multiple patients
          console.warn('[PatientPortalAuthWrapper] Multiple patients found for phone:', userPhone, 
            'Patient IDs:', patientData.map(p => p.patient_id));
          toast.info('พบข้อมูลผู้ป่วยหลายรายการ ระบบจะใช้ข้อมูลล่าสุด');
        }

        console.log('[PatientPortalAuthWrapper] Authentication successful for patient:', selectedPatient.name);
        setPatient(selectedPatient);
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
