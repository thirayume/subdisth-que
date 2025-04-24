
import * as React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MedicationsDialogHeaderProps {
  isEditing: boolean;
}

const MedicationsDialogHeader: React.FC<MedicationsDialogHeaderProps> = ({ isEditing }) => (
  <DialogHeader>
    <DialogTitle>
      {isEditing ? 'แก้ไขรายการยา' : 'เพิ่มรายการยาใหม่'}
    </DialogTitle>
  </DialogHeader>
);

export default MedicationsDialogHeader;
