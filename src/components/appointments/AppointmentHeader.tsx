
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const AppointmentHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">การนัดหมาย</h1>
        <p className="text-gray-500">จัดการการนัดหมายและติดตามการใช้ยา</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          สร้างนัดหมายใหม่
        </Button>
      </div>
    </div>
  );
};

export default AppointmentHeader;
