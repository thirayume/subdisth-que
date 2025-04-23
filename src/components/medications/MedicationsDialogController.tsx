
import React from 'react';
import MedicationsDialogHeader from './MedicationsDialogHeader';
import MedicationsDialogForm from './MedicationsDialogForm';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationsDialogControllerProps {
  medications: Medication[];
  medication: Medication | null;
  isEditing: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addMedication: (data: any) => Promise<any>;
  updateMedication: (id: string, data: any) => Promise<any>;
}

const MedicationsDialogController: React.FC<MedicationsDialogControllerProps> = ({
  medications,
  medication,
  isEditing,
  open,
  onOpenChange,
  addMedication,
  updateMedication,
}) => {
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
    <>
      <MedicationsDialogHeader isEditing={isEditing} />
      <MedicationsDialogForm
        medication={medication}
        medications={medications}
        isEditing={isEditing}
        open={open}
        onSubmit={handleSubmit}
        onCancel={() => onOpenChange(false)}
      />
    </>
  );
};

export default MedicationsDialogController;
