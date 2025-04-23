
import * as React from 'react';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';

const MedicationsDialogHeader: React.FC<{ isEditing: boolean }> = ({ isEditing }) => (
  <DialogHeader>
    <DialogTitle>
      {isEditing ? 'แก้ไขรายการยา' : 'เพิ่มรายการยาใหม่'}
    </DialogTitle>
  </DialogHeader>
);

export default MedicationsDialogHeader;
