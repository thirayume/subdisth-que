
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, User, PhoneCall, Clock, Pill } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Patient, Queue } from '@/integrations/supabase/schema';
import PatientProfile from '@/components/patient-portal/PatientProfile';
import PatientQueueStatus from '@/components/patient-portal/PatientQueueStatus';
import PatientMedications from '@/components/patient-portal/PatientMedications';
import PatientSelector from '@/components/patient-portal/PatientSelector';
import LineLoginButton from '@/components/patient-portal/LineLoginButton';

const PatientPortal: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for LINE authentication state on component mount
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if there's a LINE auth token in localStorage
        const lineToken = localStorage.getItem('lineToken');
        const userPhone = localStorage.getItem('userPhone');
        
        if (lineToken && userPhone) {
          setIsAuthenticated(true);
          setPhoneNumber(userPhone);
          
          // Fetch patients associated with this phone number
          const { data: patientData, error: patientError } = await supabase
            .from('patients')
            .select('*')
            .eq('phone', userPhone);
          
          if (patientError) throw patientError;
          
          if (patientData && patientData.length > 0) {
            setPatients(patientData);
            
            // Check if there's an active queue for any of these patients
            const patientIds = patientData.map(p => p.id);
            const { data: queueData, error: queueError } = await supabase
              .from('queues')
              .select('*')
              .in('patient_id', patientIds)
              .in('status', ['WAITING', 'ACTIVE'])
              .order('created_at', { ascending: false })
              .limit(1);
            
            if (queueError) throw queueError;
            
            if (queueData && queueData.length > 0) {
              setActiveQueue(queueData[0]);
              
              // Find which patient this queue belongs to
              const queuePatient = patientData.find(p => p.id === queueData[0].patient_id);
              if (queuePatient) {
                setSelectedPatient(queuePatient);
              } else {
                // If no active queue patient found, select first patient
                setSelectedPatient(patientData[0]);
              }
            } else {
              // No active queue, select first patient
              setSelectedPatient(patientData[0]);
            }
          }
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('เกิดข้อผิดพลาดในการตรวจสอบการเข้าสู่ระบบ');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
  };

  const handleLineLoginSuccess = async (token: string, userPhone: string) => {
    localStorage.setItem('lineToken', token);
    localStorage.setItem('userPhone', userPhone);
    setIsAuthenticated(true);
    setPhoneNumber(userPhone);
    
    // Reload the page to fetch patient data
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('lineToken');
    localStorage.removeItem('userPhone');
    setIsAuthenticated(false);
    setSelectedPatient(null);
    setPatients([]);
    setActiveQueue(null);
    setPhoneNumber(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">กำลังโหลดข้อมูล</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">ระบบติดตามคิวผู้ป่วย</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center mb-6">
              <QrCode className="mx-auto h-16 w-16 text-pharmacy-600 mb-2" />
              <p className="text-gray-600">กรุณาเข้าสู่ระบบด้วย LINE เพื่อดูข้อมูลคิวและประวัติผู้ป่วย</p>
            </div>
            
            <LineLoginButton onLoginSuccess={handleLineLoginSuccess} />
            
            <div className="text-center mt-6">
              <Button variant="outline" onClick={() => navigate('/')}>
                กลับไปหน้าหลัก
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If there's an active queue, show it
  if (activeQueue && selectedPatient) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-pharmacy-700">ระบบติดตามคิวผู้ป่วย</h1>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            ออกจากระบบ
          </Button>
        </div>
        
        <PatientQueueStatus 
          queue={activeQueue} 
          patient={selectedPatient} 
          className="mb-4" 
        />
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">ข้อมูลผู้ป่วย</h2>
          {patients.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => setActiveQueue(null)}>
              เลือกผู้ป่วยอื่น
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
            <TabsTrigger value="medications">รายการยา</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <PatientProfile patient={selectedPatient} />
          </TabsContent>
          
          <TabsContent value="medications">
            <PatientMedications patientId={selectedPatient.id} />
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            กลับไปหน้าหลัก
          </Button>
        </div>
      </div>
    );
  }

  // If authenticated but no active queue, show patient selector
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pharmacy-700">ระบบติดตามคิวผู้ป่วย</h1>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          ออกจากระบบ
        </Button>
      </div>
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>เลือกผู้ป่วย</CardTitle>
        </CardHeader>
        <CardContent>
          {patients.length > 0 ? (
            <PatientSelector 
              patients={patients} 
              selectedPatientId={selectedPatient?.id}
              onSelectPatient={handlePatientSelect} 
            />
          ) : (
            <div className="text-center py-6">
              <User className="mx-auto h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600">ไม่พบข้อมูลผู้ป่วยที่เชื่อมโยงกับเบอร์โทรศัพท์นี้</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => navigate('/')}
              >
                กลับไปหน้าหลัก
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {selectedPatient && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">ข้อมูลผู้ป่วย: {selectedPatient.name}</h2>
          </div>
          
          <Tabs defaultValue="profile">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">ข้อมูลส่วนตัว</TabsTrigger>
              <TabsTrigger value="medications">รายการยา</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <PatientProfile patient={selectedPatient} />
            </TabsContent>
            
            <TabsContent value="medications">
              <PatientMedications patientId={selectedPatient.id} />
            </TabsContent>
          </Tabs>
        </>
      )}
      
      <div className="mt-6 text-center">
        <Button variant="outline" onClick={() => navigate('/')}>
          กลับไปหน้าหลัก
        </Button>
      </div>
    </div>
  );
};

export default PatientPortal;
