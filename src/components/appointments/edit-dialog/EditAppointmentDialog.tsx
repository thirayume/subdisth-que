
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Appointment, Patient } from '@/integrations/supabase/schema';
import { appointmentFormSchema } from './schema';
import { AppointmentFormValues } from './types';
import { AppointmentForm } from './AppointmentForm';

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
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      time: '',
      purpose: '',
      notes: '',
      status: 'SCHEDULED',
    },
  });

  React.useEffect(() => {
    if (appointment) {
      const appointmentDate = new Date(appointment.date);
      form.reset({
        patient_id: appointment.patient_id,
        date: format(appointmentDate, 'yyyy-MM-dd'),
        time: format(appointmentDate, 'HH:mm'),
        purpose: appointment.purpose,
        notes: appointment.notes || '',
        status: appointment.status,
      });
    }
  }, [appointment, form]);

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
