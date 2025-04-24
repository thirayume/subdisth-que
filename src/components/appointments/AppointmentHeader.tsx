import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAppointments } from '@/hooks/appointments/useAppointments';
import { usePatients } from '@/hooks/usePatients';
import { AppointmentStatus, Patient } from '@/integrations/supabase/schema';
import { PatientSearchSection } from './patient-search/PatientSearchSection';

const formSchema = z.object({
  patient_id: z.string().min(1, { message: 'กรุณาเลือกผู้ป่วย' }),
  date: z.string().min(1, { message: 'กรุณาระบุวันที่นัดหมาย' }),
  time: z.string().min(1, { message: 'กรุณาระบุเวลานัดหมาย' }),
  purpose: z.string().min(1, { message: 'กรุณาระบุวัตถุประสงค์' }),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const AppointmentHeader: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addAppointment } = useAppointments();
  const { patients } = usePatients();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
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

  const onSubmit = async (values: FormValues) => {
    const { date, time, ...rest } = values;
    
    // Combine date and time into a single ISO string
    const combinedDate = new Date(`${date}T${time}`);
    
    const appointment = await addAppointment({
      ...rest,
      date: combinedDate.toISOString(),
      status: 'SCHEDULED' as AppointmentStatus,
    });
    
    if (appointment) {
      setIsDialogOpen(false);
      form.reset();
    }
  };

  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">การนัดหมาย</h1>
        <p className="text-gray-500">จัดการการนัดหมายและติดตามการใช้ยา</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          สร้างนัดหมายใหม่
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  ยกเลิก
                </Button>
                <Button type="submit">บันทึก</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentHeader;
