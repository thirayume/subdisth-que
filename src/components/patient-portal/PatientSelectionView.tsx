
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, LogOut, Trash2 } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import PatientList from '@/components/patients/PatientList';
import PatientPortalDebug from './PatientPortalDebug';

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

  const handleAppointmentsClick = () => {
    console.log('[PatientSelectionView] Appointments button clicked');
    console.log('[PatientSelectionView] Selected patient:', selectedPatient);
    console.log('[PatientSelectionView] Auth tokens:', {
      lineToken: !!localStorage.getItem('lineToken'),
      userPhone: localStorage.getItem('userPhone')
    });
    
    if (!selectedPatient) {
      console.error('[PatientSelectionView] No patient selected');
      return;
    }
    
    try {
      navigate('/patient-portal/appointments');
      console.log('[PatientSelectionView] Navigation to appointments initiated');
    } catch (error) {
      console.error('[PatientSelectionView] Navigation error:', error);
    }
  };

  const handleProfileClick = () => {
    console.log('[PatientSelectionView] Profile button clicked');
    console.log('[PatientSelectionView] Selected patient:', selectedPatient);
    console.log('[PatientSelectionView] Auth tokens:', {
      lineToken: !!localStorage.getItem('lineToken'),
      userPhone: localStorage.getItem('userPhone')
    });
    
    if (!selectedPatient) {
      console.error('[PatientSelectionView] No patient selected');
      return;
    }
    
    try {
      navigate('/patient-portal/profile');
      console.log('[PatientSelectionView] Navigation to profile initiated');
    } catch (error) {
      console.error('[PatientSelectionView] Navigation error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">เลือกผู้ป่วย</h1>
          <Button
            variant="outline"
            onClick={onLogout}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ออกจากระบบ
          </Button>
        </div>

        <PatientList
          patients={patients}
          onSelectPatient={onSelectPatient}
        />

        {selectedPatient && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>การจัดการข้อมูล</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button 
                  onClick={handleAppointmentsClick}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  นัดหมายของฉัน
                </Button>
                <Button 
                  onClick={handleProfileClick}
                  className="bg-blue-600 hover:bg-blue-700 w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  แก้ไขข้อมูลส่วนตัว
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={onClearQueueHistory}
                className="w-full text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                ล้างประวัติคิวเก่า
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Debug panel - remove this in production */}
        <PatientPortalDebug 
          patients={patients}
          selectedPatient={selectedPatient}
          isAuthenticated={true}
        />
      </div>
    </div>
  );
};

export default PatientSelectionView;
