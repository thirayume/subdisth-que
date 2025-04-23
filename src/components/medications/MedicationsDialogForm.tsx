import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Medication } from '@/integrations/supabase/schema';
import MedicationCodeField from './dialog-form/MedicationCodeField';
import MedicationNameField from './dialog-form/MedicationNameField';
import MedicationDescriptionField from './dialog-form/MedicationDescriptionField';
import MedicationUnitField from './dialog-form/MedicationUnitField';
import MedicationStockFields from './dialog-form/MedicationStockFields';

const formSchema = z.object({
  code: z.string().min(1, { message: 'กรุณาระบุรหัสยา' }),
  name: z.string().min(1, { message: 'กรุณาระบุชื่อยา' }),
  description: z.string().optional(),
  unit: z.string().min(1, { message: 'กรุณาระบุหน่วย' }),
  stock: z.preprocess((v) => Number(v ?? 0), z.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' })),
  min_stock: z.preprocess((v) => Number(v ?? 0), z.number().min(0, { message: 'จำนวนต้องไม่น้อยกว่า 0' })),
});

export type MedicationsDialogFormProps = {
  medication: Medication | null;
  medications: Medication[];
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
  const [newUnitInput, setNewUnitInput] = React.useState('');
  const [openUnitPopover, setOpenUnitPopover] = React.useState(false);

  // Ensure medications is always an array
  const safeMedications = Array.isArray(medications) ? medications : [];
  
  const unitOptions = React.useMemo(() => {
    // Use safeMedications instead of medications directly
    const nonEmptyUnits = safeMedications
      .map(med => med && med.unit)
      .filter(unit => typeof unit === 'string' && unit.length > 0);
    const units = new Set(nonEmptyUnits);
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

  const submitHandler = async (data: any) => {
    // Ensure numbers are numbers, not strings
    const payload = {
      ...data,
      stock: Number(data.stock) || 0,
      min_stock: Number(data.min_stock) || 0,
    };
    await onSubmit(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-4">
        <MedicationCodeField control={form.control} />
        <MedicationNameField control={form.control} />
        <MedicationDescriptionField control={form.control} />
        <MedicationUnitField
          control={form.control}
          value={form.watch('unit')}
          open={openUnitPopover}
          newUnitInput={newUnitInput}
          setOpen={setOpenUnitPopover}
          setValue={val => form.setValue('unit', val)}
          setNewUnitInput={setNewUnitInput}
          unitOptions={unitOptions}
          handleAddNewUnit={handleAddNewUnit}
        />
        <MedicationStockFields control={form.control} />
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
