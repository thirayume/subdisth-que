
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/integrations/supabase/schema';
import PatientPortalLoading from './PatientPortalLoading';
import { toast } from 'sonner';

interface PatientPortalAuthWrapperProps {
  children: React.ReactNode;
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
        const lineToken = localStorage.getItem('lineToken');
        const userPhone = localStorage.getItem('userPhone');
        
        if (!lineToken || !userPhone) {
          navigate('/patient-portal');
          return;
        }

        // Fetch patient data
        const { data: patientData, error } = await supabase
          .from('patients')
          .select('*')
          .eq('phone', userPhone)
          .single();

        if (error || !patientData) {
          toast.error('ไม่พบข้อมูลผู้ป่วย');
          navigate('/patient-portal');
          return;
        }

        setPatient(patientData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        navigate('/patient-portal');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, location.pathname]);

  if (loading) {
    return <PatientPortalLoading />;
  }

  if (!isAuthenticated || !patient) {
    return null;
  }

  // Pass the patient prop to the children
  if (React.isValidElement(children)) {
    return React.cloneElement(children, { patient });
  }

  return <div>{children}</div>;
};

export default PatientPortalAuthWrapper;
