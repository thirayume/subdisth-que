
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Appointment, Patient } from '@/integrations/supabase/schema';
import { AppointmentFormValues } from './types';
import { AppointmentForm } from './AppointmentForm';
import { useAppointmentForm } from '@/hooks/appointments/useAppointmentForm';

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const EditAppointmentDialog = ({
  open,
  onOpenChange,
  appointment,
  onSubmit,
}: EditAppointmentDialogProps) => {
  const form = useAppointmentForm(appointment);

  const handlePatientSelect = (patient: Patient) => {
    form.setValue('patient_id', patient.id);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>แก้ไขการนัดหมาย</DialogTitle>
        </DialogHeader>
        
        <AppointmentForm
          form={form}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          onPatientSelect={handlePatientSelect}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;
