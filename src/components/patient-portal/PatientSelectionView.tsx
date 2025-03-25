
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import PatientSelector from '@/components/patient-portal/PatientSelector';
import PatientProfile from '@/components/patient-portal/PatientProfile';
import PatientMedications from '@/components/patient-portal/PatientMedications';
import { useNavigate } from 'react-router-dom';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({ 
  patients, 
  selectedPatient, 
  onSelectPatient, 
  onLogout 
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-pharmacy-700">ระบบติดตามคิวผู้ป่วย</h1>
        <Button variant="outline" size="sm" onClick={onLogout}>
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
              onSelectPatient={onSelectPatient} 
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

export default PatientSelectionView;
