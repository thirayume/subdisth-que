import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Appointment, AppointmentStatus, Patient } from '@/integrations/supabase/schema';
import { PatientSearchSection } from './patient-search/PatientSearchSection';
import { format } from 'date-fns';

export const appointmentFormSchema = z.object({
  patient_id: z.string().min(1, { message: 'กรุณาเลือกผู้ป่วย' }),
  date: z.string().min(1, { message: 'กรุณาระบุวันที่นัดหมาย' }),
  time: z.string().min(1, { message: 'กรุณาระบุเวลานัดหมาย' }),
  purpose: z.string().min(1, { message: 'กรุณาระบุวัตถุประสงค์' }),
  notes: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
});

export type AppointmentFormValues = z.infer<typeof appointmentFormSchema>;

interface EditAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment | null;
  patients: Patient[];
  onSubmit: (values: AppointmentFormValues) => Promise<void>;
}

const EditAppointmentDialog: React.FC<EditAppointmentDialogProps> = ({
  open,
  onOpenChange,
  appointment,
  patients,
  onSubmit,
}) => {
  const form = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      time: '',
      purpose: '',
      notes: '',
      status: 'SCHEDULED' as AppointmentStatus,
    },
  });

  // Reset form when appointment changes
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
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patient_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ผู้ป่วย</FormLabel>
                  <PatientSearchSection 
                    onPatientSelect={handlePatientSelect}
                    selectedPatientId={field.value}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วันที่นัด</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>เวลานัด</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>วัตถุประสงค์</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>บันทึกเพิ่มเติม</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>สถานะ</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="เลือกสถานะ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SCHEDULED">นัดหมาย</SelectItem>
                      <SelectItem value="COMPLETED">เสร็จสิ้น</SelectItem>
                      <SelectItem value="CANCELLED">ยกเลิก</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                ยกเลิก
              </Button>
              <Button type="submit">บันทึก</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAppointmentDialog;
