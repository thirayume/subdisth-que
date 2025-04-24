
import React from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { Appointment, Patient } from '@/integrations/supabase/schema';
import { AppointmentDialogContent } from './AppointmentDialogContent';
import { appointmentFormSchema } from './schema';
import { AppointmentFormValues } from './types';

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Patient[];
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const EditAppointmentDialog = ({
  open,
  onOpenChange,
  appointment,
  patients,
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
      <AppointmentDialogContent
        form={form}
        onSubmit={onSubmit}
        onOpenChange={onOpenChange}
        selectedPatientId={form.getValues('patient_id')}
        onPatientSelect={handlePatientSelect}
      />
    </Dialog>
  );
};

export default EditAppointmentDialog;
