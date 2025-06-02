
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Patient } from '@/integrations/supabase/schema';
import { User, Phone, Calendar, MapPin } from 'lucide-react';

interface PatientInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
}

const PatientInfoDialog: React.FC<PatientInfoDialogProps> = ({
  isOpen,
  onClose,
  patient
}) => {
  if (!patient) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            ข้อมูลผู้ป่วย
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-lg">{patient.name}</p>
              <p className="text-sm text-gray-500">HN: {patient.patient_id}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{patient.phone}</span>
            </div>

            {patient.birth_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm">วันเกิด: {new Date(patient.birth_date).toLocaleDateString('th-TH')}</span>
              </div>
            )}

            {patient.gender && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">เพศ: {patient.gender}</span>
              </div>
            )}

            {patient.address && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{patient.address}</span>
              </div>
            )}
          </div>

          {patient.line_user_id && (
            <div className="pt-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                เชื่อมต่อ LINE แล้ว
              </Badge>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatientInfoDialog;
