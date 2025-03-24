
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LayoutGrid } from 'lucide-react';

const DashboardHeader: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">แดชบอร์ด</h1>
        <p className="text-gray-500">ระบบจัดการคิวห้องยา</p>
      </div>
      
      <div className="flex items-center gap-2">
        <Button className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white" asChild>
          <Link to="/queue-board">
            <LayoutGrid className="w-4 h-4 mr-2" />
            หน้าจอแสดงคิว
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
