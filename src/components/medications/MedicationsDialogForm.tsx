
import React, { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MedicationsUnitPopover from './MedicationsUnitPopover';
import { DialogFooter } from '@/components/ui/dialog';
import { Medication } from '@/integrations/supabase/schema';

const formSchema = z.object({
  code: z.string().min(1, { message: 'กรุณาระบุรหัสยา' }),
  name: z.string().min(1, { message: 'กรุณาระบุชื่อยา' }),
  description: z.string().optional(),
  unit: z.string().min(1, { message: 'กรุณาระบุหน่วย' }),
  stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
  min_stock: z.coerce.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' }),
});

export type MedicationsDialogFormProps = {
  medication: Medication | null;
  medications: Medication[] | undefined; // can be undefined
  isEditing: boolean;
  open: boolean;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  onCancel: () => void;
};

const MedicationsDialogForm: React.FC<MedicationsDialogFormProps> = ({
  medication,
  medications,
  isEditing,
  open,
  onSubmit,
  onCancel
}) => {
  const [newUnitInput, setNewUnitInput] = useState('');
  const [openUnitPopover, setOpenUnitPopover] = useState(false);

  // Fallback medications to empty array if undefined
  const safeMedications = Array.isArray(medications) ? medications : [];

  // Extract unique unit values from medications
  const unitOptions = useMemo(() => {
    const units = new Set(safeMedications.map(med => med.unit));
    return Array.from(units).map(unit => ({
      value: unit,
      label: unit
    }));
  }, [safeMedications]);

  const form = useForm<z.infer<typeof formSchema>>({
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
      setNewUnitInput('');
    }
  }, [open, medication, form]);

  const handleAddNewUnit = () => {
    if (newUnitInput.trim() !== '') {
      form.setValue('unit', newUnitInput.trim());
      setOpenUnitPopover(false);
      setNewUnitInput('');
    }
  };

  return (
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
            <FormItem className="flex flex-col">
              <FormLabel>หน่วย</FormLabel>
              <FormControl>
                <MedicationsUnitPopover
                  unitOptions={unitOptions}
                  value={field.value}
                  open={openUnitPopover}
                  newUnitInput={newUnitInput}
                  setOpen={setOpenUnitPopover}
                  setValue={val => form.setValue('unit', val)}
                  setNewUnitInput={setNewUnitInput}
                  handleAddNewUnit={handleAddNewUnit}
                />
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
          <Button type="button" variant="outline" onClick={onCancel}>
            ยกเลิก
          </Button>
          <Button type="submit">บันทึก</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default MedicationsDialogForm;

