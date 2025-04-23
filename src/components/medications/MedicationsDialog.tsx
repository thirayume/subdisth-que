
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useMedications } from '@/hooks/useMedications';
import MedicationsDialogController from './MedicationsDialogController';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: Medication | null;
}

const MedicationsDialog: React.FC<MedicationsDialogProps> = ({ open, onOpenChange, medication }) => {
  const { medications, addMedication, updateMedication } = useMedications();
  const isEditing = !!medication;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <MedicationsDialogController
          medications={medications}
          medication={medication}
          isEditing={isEditing}
          open={open}
          onOpenChange={onOpenChange}
          addMedication={addMedication}
          updateMedication={updateMedication}
        />
      </DialogContent>
    </Dialog>
  );
};
export default MedicationsDialog;
