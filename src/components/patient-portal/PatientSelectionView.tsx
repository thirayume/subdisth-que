
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, User, LogOut, Trash2, AlertCircle } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import PatientCardWithQueue from './PatientCardWithQueue';
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
    
    if (!selectedPatient) {
      console.error('[PatientSelectionView] No patient selected');
      return;
    }
    
    try {
      // Store the selected patient context for the appointments page
      sessionStorage.setItem('appointmentPatientContext', JSON.stringify(selectedPatient));
      navigate('/patient-portal/appointments');
      console.log('[PatientSelectionView] Navigation to appointments initiated');
    } catch (error) {
      console.error('[PatientSelectionView] Navigation error:', error);
    }
  };

  const handleProfileClick = () => {
    console.log('[PatientSelectionView] Profile button clicked');
    console.log('[PatientSelectionView] Selected patient:', selectedPatient);
    
    if (!selectedPatient) {
      console.error('[PatientSelectionView] No patient selected');
      return;
    }
    
    try {
      // Store the selected patient context for the profile page
      sessionStorage.setItem('profilePatientContext', JSON.stringify(selectedPatient));
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

        {/* Multiple patients info */}
        {patients.length > 1 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">
                  พบข้อมูลผู้ป่วย {patients.length} รายการ กรุณาเลือกผู้ป่วยที่ต้องการจัดการข้อมูล
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patient Cards */}
        <div className="space-y-4 mb-6">
          {patients.map((patient) => (
            <PatientCardWithQueue
              key={patient.id}
              patient={patient}
              isSelected={selectedPatient?.id === patient.id}
              onSelect={onSelectPatient}
            />
          ))}
        </div>

        {/* Action buttons for selected patient */}
        {selectedPatient && (
          <Card>
            <CardHeader>
              <CardTitle>การจัดการข้อมูล - {selectedPatient.name}</CardTitle>
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

        {/* No selection message */}
        {!selectedPatient && patients.length > 0 && (
          <Card className="border-gray-200">
            <CardContent className="p-6 text-center text-gray-500">
              <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>กรุณาเลือกผู้ป่วยที่ต้องการจัดการข้อมูล</p>
              <p className="text-sm mt-1">คลิกที่การ์ดผู้ป่วยด้านบนเพื่อเลือก</p>
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
