
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/integrations/supabase/schema';
import { formatThaiDate } from '@/utils/dateUtils';
import { Phone, MapPin, Calendar, User, Loader2 } from 'lucide-react';
import PatientMedicationHistory from './PatientMedicationHistory';
import MedicationDispenseForm from './MedicationDispenseForm';
import { usePatientMedications } from '@/hooks/usePatientMedications';
import { useMedications } from '@/hooks/useMedications';

interface PatientInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient | null;
  queueNumber?: string;
}

const PatientInfoDialog: React.FC<PatientInfoDialogProps> = ({
  open,
  onOpenChange,
  patient,
  queueNumber
}) => {
  const { 
    medications: patientMedications, 
    loading: medicationsLoading,
    addMedication 
  } = usePatientMedications(patient?.id);
  
  const { medications, loading: medicationsListLoading } = useMedications();

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            ข้อมูลผู้ป่วย {queueNumber && `- คิว ${queueNumber}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">ข้อมูลส่วนตัว</TabsTrigger>
            <TabsTrigger value="history">ประวัติการรับยา</TabsTrigger>
            <TabsTrigger value="dispense">จ่ายยา</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>ข้อมูลส่วนตัว</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">ชื่อ-นามสกุล</div>
                        <div className="font-medium">{patient.name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        รหัสผู้ป่วย: {patient.patient_id}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="text-sm text-gray-500">เบอร์โทรศัพท์</div>
                        <div className="font-medium">{patient.phone || '-'}</div>
                      </div>
                    </div>

                    {patient.birth_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-sm text-gray-500">วันเกิด</div>
                          <div className="font-medium">{formatThaiDate(patient.birth_date)}</div>
                        </div>
                      </div>
                    )}

                    {patient.gender && (
                      <div>
                        <div className="text-sm text-gray-500">เพศ</div>
                        <div className="font-medium">{patient.gender}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {patient.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                        <div>
                          <div className="text-sm text-gray-500">ที่อยู่</div>
                          <div className="font-medium">{patient.address}</div>
                        </div>
                      </div>
                    )}

                    {patient.line_id && (
                      <div>
                        <div className="text-sm text-gray-500">LINE ID</div>
                        <div className="font-medium">{patient.line_id}</div>
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-gray-500">วันที่ลงทะเบียน</div>
                      <div className="font-medium">{formatThaiDate(patient.created_at)}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <PatientMedicationHistory
              patientName={patient.name}
              medications={patientMedications}
              loading={medicationsLoading}
            />
          </TabsContent>

          <TabsContent value="dispense">
            {medicationsListLoading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังโหลดข้อมูลยา...
                  </div>
                </CardContent>
              </Card>
            ) : (
              <MedicationDispenseForm
                patientId={patient.id}
                medications={medications}
                onDispenseMedication={addMedication}
              />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientInfoDialog;
