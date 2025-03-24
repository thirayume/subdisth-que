
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LineQRCode from '@/components/ui/LineQRCode';
import { QrCode } from 'lucide-react';

const DashboardSidebar: React.FC<{
  completedQueuesLength: number;
}> = ({ completedQueuesLength }) => {
  return (
    <div className="space-y-6">
      <Card className="dashboard-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <QrCode className="h-5 w-5 mr-2 text-pharmacy-600" />
            ลงทะเบียนผ่าน LINE
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineQRCode queueNumber={999} />
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>สแกนเพื่อเข้าสู่ระบบการจองคิวออนไลน์</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card bg-pharmacy-50 border-pharmacy-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-pharmacy-800">สถิติการให้บริการ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เวลาเฉลี่ยต่อคิว</span>
              <span className="font-semibold">12 นาที</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ผู้รับบริการวันนี้</span>
              <span className="font-semibold">{completedQueuesLength} คน</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">เวลารอเฉลี่ย</span>
              <span className="font-semibold">25 นาที</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">คิวสูงสุดวันนี้</span>
              <span className="font-semibold">8</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSidebar;
