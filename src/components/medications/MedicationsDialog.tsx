
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import MedicationsDialogHeader from './MedicationsDialogHeader';
import MedicationsDialogForm from './MedicationsDialogForm';
import { useMedications } from '@/hooks/useMedications';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
}

const MedicationsDialog: React.FC<MedicationsDialogProps> = ({ open, onOpenChange, medication }) => {
  const { medications, addMedication, updateMedication } = useMedications();
  const isEditing = !!medication;

  // Submit function migrated here to pass to the child form component
  const handleSubmit = async (values: any) => {
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
        <MedicationsDialogHeader isEditing={isEditing} />
        <MedicationsDialogForm
          medication={medication}
          medications={medications}
          isEditing={isEditing}
          open={open}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default MedicationsDialog;
