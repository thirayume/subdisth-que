
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Queue, QueueType } from '@/integrations/supabase/schema';
import { Clock, Users, CheckCircle, Calendar } from 'lucide-react';

interface QueueSummaryCardsProps {
  waitingQueues: Queue[];
  activeQueues: Queue[];
  completedQueues: Queue[];
  queues: Queue[];
}

const QueueSummaryCards: React.FC<QueueSummaryCardsProps> = ({
  waitingQueues,
  activeQueues,
  completedQueues,
  queues
}) => {
  // Count queue types
  const generalCount = queues.filter(q => q.type === 'GENERAL' && q.status !== 'COMPLETED').length;
  const priorityCount = queues.filter(q => q.type === 'PRIORITY' && q.status !== 'COMPLETED').length;
  const followUpCount = queues.filter(q => q.type === 'FOLLOW_UP' && q.status !== 'COMPLETED').length;
  const elderlyCount = queues.filter(q => q.type === 'ELDERLY' && q.status !== 'COMPLETED').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">คิวที่รอดำเนินการ</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{waitingQueues.length}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">ทั่วไป: {generalCount}</div>
            <div className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">ด่วน: {priorityCount}</div>
            <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">ผู้สูงอายุ: {elderlyCount}</div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">คิวที่กำลังให้บริการ</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{activeQueues.length}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          {activeQueues.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium">คิวปัจจุบัน: <span className="text-green-600">#{activeQueues[0].number}</span></div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">เสร็จสิ้นวันนี้</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">{completedQueues.length}</h3>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <CheckCircle className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs text-gray-500">
              อัตราการให้บริการเฉลี่ย: <span className="font-medium">12 นาที/คิว</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="dashboard-card">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">นัดหมายวันนี้</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-1">3</h3>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full">ติดตามการใช้ยา: {followUpCount}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QueueSummaryCards;
