
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMedications } from '@/hooks/useMedications';
import { Medication } from '@/integrations/supabase/schema';

const formSchema = z.object({
  code: z.string().min(1, { message: 'กรุณาระบุรหัสยา' }),
  name: z.string().min(1, { message: 'กรุณาระบุชื่อยา' }),
  description: z.string().optional(),
  unit: z.string().min(1, { message: 'กรุณาระบุหน่วย' }),
  stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
  min_stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
});

type FormValues = z.infer<typeof formSchema>;

interface MedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
}

const MedicationsDialog: React.FC<MedicationsDialogProps> = ({ 
  open, 
  onOpenChange,
  medication 
}) => {
  const { addMedication, updateMedication } = useMedications();
  const isEditing = !!medication;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      name: '',
      description: '',
      unit: '',
      stock: 0,
      min_stock: 0,
    },
  });

  // Reset form when dialog opens/closes or medication changes
  React.useEffect(() => {
    if (open) {
      if (medication) {
        form.reset({
          code: medication.code,
          name: medication.name,
          description: medication.description || '',
          unit: medication.unit,
          stock: medication.stock,
          min_stock: medication.min_stock,
        });
      } else {
        form.reset({
          code: '',
          name: '',
          description: '',
          unit: '',
          stock: 0,
          min_stock: 0,
        });
      }
    }
  }, [open, medication, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEditing && medication) {
        await updateMedication(medication.id, values);
      } else {
        await addMedication(values);
      }
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving medication:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'แก้ไขรายการยา' : 'เพิ่มรายการยาใหม่'}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>รหัสยา</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ชื่อยา</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>คำอธิบาย</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>หน่วย</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนคงเหลือ</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="min_stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>จำนวนขั้นต่ำ</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
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

export default MedicationsDialog;
