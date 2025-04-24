
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateAppointmentDialog } from './create-dialog/CreateAppointmentDialog';

const AppointmentHeader: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

      <CreateAppointmentDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};

export default AppointmentHeader;

