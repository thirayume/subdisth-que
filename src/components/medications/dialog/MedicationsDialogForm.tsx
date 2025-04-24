
import * as React from 'react';
import { Form } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Medication } from '@/integrations/supabase/schema';
import { useMedicationForm } from '../hooks/useMedicationForm';
import { useUnitOptions } from '../hooks/useUnitOptions';
import { MedicationFormValues } from '../schemas/medicationSchema';
import { 
  CodeField, 
  NameField, 
  DescriptionField, 
  UnitField, 
  StockFields 
} from '../form-fields';

interface MedicationsDialogFormProps {
  medication: Medication | null;
  medications: Medication[];
  isEditing: boolean;
  open: boolean;
  onSubmit: (values: MedicationFormValues) => Promise<void>;
  onCancel: () => void;
}

const MedicationsDialogForm: React.FC<MedicationsDialogFormProps> = ({
  medication,
  medications,
  isEditing,
  open,
  onSubmit,
  onCancel
}) => {
  const { 
    newUnitInput,
    setNewUnitInput,
    openUnitPopover,
    setOpenUnitPopover,
    unitOptions,
    handleAddNewUnit 
  } = useUnitOptions(medications);

  const { form, submitHandler } = useMedicationForm(medication, onSubmit, open);

  const handleAddUnit = () => handleAddNewUnit(value => form.setValue('unit', value));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(submitHandler)} className="space-y-4">
        <CodeField control={form.control} />
        <NameField control={form.control} />
        <DescriptionField control={form.control} />
        <UnitField 
          control={form.control}
          value={form.watch('unit')}
          open={openUnitPopover}
          newUnitInput={newUnitInput}
          setOpen={setOpenUnitPopover}
          setValue={value => form.setValue('unit', value)}
          setNewUnitInput={setNewUnitInput}
          unitOptions={unitOptions}
          handleAddNewUnit={handleAddUnit}
        />
        <StockFields control={form.control} />
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
