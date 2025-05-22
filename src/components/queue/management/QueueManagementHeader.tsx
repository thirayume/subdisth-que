
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const QueueManagementHeader: React.FC = () => {
  return (
    <div className="mb-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">การจัดการคิว</h1>
        <p className="text-gray-500">จัดการคิวรอดำเนินการ คิวกำลังให้บริการ และคิวเสร็จสิ้น</p>
      </div>
      
      <Button asChild className="bg-pharmacy-600 hover:bg-pharmacy-700">
        <Link to="/queue/create">
          <PlusCircle className="h-4 w-4 mr-2" />
          สร้างคิวใหม่
        </Link>
      </Button>
    </div>
  );
};

export default QueueManagementHeader;
