
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Patient, AppointmentStatus } from '@/integrations/supabase/schema';
import { PatientSearchSection } from '../patient-search/PatientSearchSection';
import { CreateAppointmentFormValues } from './types';
import { createAppointmentFormSchema } from './schema';
import { useAppointments } from '@/hooks/appointments/useAppointments';

interface CreateAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateAppointmentDialog = ({
  open,
  onOpenChange,
}: CreateAppointmentDialogProps) => {
  const { addAppointment } = useAppointments();
  
  const form = useForm<CreateAppointmentFormValues>({
    resolver: zodResolver(createAppointmentFormSchema),
    defaultValues: {
      patient_id: '',
      date: '',
      time: '',
      purpose: '',
      notes: '',
    },
  });

  const handlePatientSelect = (patient: Patient) => {
    form.setValue('patient_id', patient.id);
  };

  const onSubmit = async (values: CreateAppointmentFormValues) => {
    const { date, time, ...rest } = values;
    
    // Combine date and time into a single ISO string
    const combinedDate = new Date(`${date}T${time}`);
    
    const appointment = await addAppointment({
      ...rest,
      date: combinedDate.toISOString(),
      status: 'SCHEDULED' as AppointmentStatus,
    });
    
    if (appointment) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>เพิ่มการนัดหมายใหม่</DialogTitle>
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

