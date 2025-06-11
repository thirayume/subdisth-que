
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, Calendar, UserCog, Trash2 } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import PatientList from './PatientList';
import { useNavigate } from 'react-router-dom';

interface PatientSelectionViewProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onLogout: () => void;
  onClearQueueHistory: () => void;
}

const PatientSelectionView: React.FC<PatientSelectionViewProps> = ({
  patients,
  selectedPatient,
  onSelectPatient,
  onLogout,
  onClearQueueHistory
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <User className="w-6 h-6" />
              เลือกผู้ป่วย
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PatientList 
              patients={patients}
              selectedPatient={selectedPatient}
              onSelectPatient={onSelectPatient}
              patientQueues={{}}
              loading={false}
              cancellingQueue=""
              onCancelQueue={() => {}}
            />
            
            {selectedPatient && (
              <div className="mt-6 space-y-3">
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    onClick={() => navigate('/patient-portal/appointments')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    จัดการนัดหมาย
                  </Button>
                  
                  <Button
                    onClick={() => navigate('/patient-portal/profile')}
                    variant="outline"
                    className="w-full border-green-600 text-green-600 hover:bg-green-50"
                  >
                    <UserCog className="w-4 h-4 mr-2" />
                    แก้ไขข้อมูลส่วนตัว
                  </Button>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    onClick={onClearQueueHistory}
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    ล้างประวัติคิวเก่า
                  </Button>
                </div>
              </div>
            )}
            
            <div className="pt-4 border-t">
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full"
              >
                <LogOut className="w-4 h-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PatientSelectionView;
