
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, TrendingUp, Database, Calendar } from 'lucide-react';

interface OverallStatCardProps {
  title: string;
  subtitle: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const OverallStatCard: React.FC<OverallStatCardProps> = ({ 
  title, 
  subtitle,
  value, 
  icon, 
  footer,
  className
}) => (
  <Card className={className}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
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

interface OverallStatsProps {
  avgWaitTime: number;
  avgServiceTime: number;
  totalCompletedQueues: number;
  className?: string;
}

const OverallStats: React.FC<OverallStatsProps> = ({
  avgWaitTime,
  avgServiceTime,
  totalCompletedQueues,
  className
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      <OverallStatCard
        title="เวลารอเฉลี่ย (ตั้งแต่เริ่มต้น)"
        subtitle="จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ"
        value={`${Math.round(avgWaitTime)} นาที`}
        icon={<div className="bg-indigo-100 p-3 rounded-full">
          <Clock className="w-5 h-5 text-indigo-600" />
        </div>}
        footer={<>ข้อมูลสะสมทั้งหมด</>}
      />
      
      <OverallStatCard
        title="เวลาให้บริการเฉลี่ย (ตั้งแต่เริ่มต้น)"
        subtitle="จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ"
        value={`${Math.round(avgServiceTime)} นาที`}
        icon={<div className="bg-emerald-100 p-3 rounded-full">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>}
        footer={<>ประสิทธิภาพโดยรวม</>}
      />
      
      <OverallStatCard
        title="คิวที่เสร็จสิ้น (ตั้งแต่เริ่มต้น)"
        subtitle="จากข้อมูลทั้งหมดตั้งแต่เริ่มใช้ระบบ"
        value={totalCompletedQueues}
        icon={<div className="bg-slate-100 p-3 rounded-full">
          <Database className="w-5 h-5 text-slate-600" />
        </div>}
        footer={<>ข้อมูลประวัติทั้งหมด</>}
      />
    </div>
  );
};

export default OverallStats;
