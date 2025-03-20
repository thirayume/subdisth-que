
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, List, Users } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface QueueStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const QueueStatCard: React.FC<QueueStatCardProps> = ({ 
  title, 
  value, 
  icon, 
  footer,
  className 
}) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
        </div>
        {icon}
      </div>
      {footer && (
        <div className="mt-4">
          <div className="text-xs text-gray-500">
            {footer}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
);

interface QueueStatsProps {
  totalQueues: number;
  totalPatients: number;
  avgWaitingTime?: number;
  avgServiceTime?: number;
  className?: string;
}

const QueueStats: React.FC<QueueStatsProps> = ({ 
  totalQueues, 
  totalPatients, 
  avgWaitingTime = 15,
  avgServiceTime, 
  className 
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      <QueueStatCard
        title="ให้บริการทั้งหมด"
        value={totalQueues}
        icon={<div className="bg-blue-100 p-3 rounded-full">
          <List className="w-6 h-6 text-blue-600" />
        </div>}
        footer={<>อัพเดทล่าสุด <span className="font-medium">{format(new Date(), 'dd MMM HH:mm น.', { locale: th })}</span></>}
      />
      
      <QueueStatCard
        title="เวลารอเฉลี่ย"
        value={`${avgWaitingTime} นาที`}
        icon={<div className="bg-amber-100 p-3 rounded-full">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>}
        footer={<>เปรียบเทียบรายสัปดาห์ <span className="font-medium text-green-600">-12%</span></>}
      />
      
      <QueueStatCard
        title="ผู้รับบริการทั้งหมด"
        value={totalPatients}
        icon={<div className="bg-green-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-green-600" />
        </div>}
        footer={<>เฉลี่ย <span className="font-medium">{Math.round((totalQueues / totalPatients) * 10) / 10 || 0}</span> คิว/คน</>}
      />
    </div>
  );
};

export default QueueStats;
