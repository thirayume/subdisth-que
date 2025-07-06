
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, List, Users, BarChart4 } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface QueueStatCardProps {
  title: string;
  subtitle?: string;
  value: string | number;
  icon: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  trend?: { 
    value: number; 
    label: string;
    positive?: boolean; 
  };
  isSimulation?: boolean;
}

const QueueStatCard: React.FC<QueueStatCardProps> = ({ 
  title, 
  subtitle,
  value, 
  icon, 
  footer,
  className,
  trend,
  isSimulation = false
}) => (
  <Card className={`${className} ${isSimulation ? 'border-orange-200 bg-orange-50' : ''}`}>
    <CardContent className="p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mb-1">{subtitle}</p>
          )}
          <h3 className="text-3xl font-bold text-gray-900 mt-1">
            {isSimulation && <span className="text-orange-600 text-lg mr-2">🔬</span>}
            {value}
          </h3>
          
          {trend && (
            <div className={`mt-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="font-medium">{trend.positive ? '↑' : '↓'} {trend.value}%</span> {trend.label}
            </div>
          )}
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
  queueDistribution?: {
    regular: number;
    urgent: number;
    elderly: number;
    special: number;
  };
  queueTypeNames?: {
    regular: string;
    urgent: string;
    elderly: string;
    special: string;
  };
  predictedWaitTime?: number;
  isSimulationMode?: boolean;
}

const QueueStats: React.FC<QueueStatsProps> = ({ 
  totalQueues, 
  totalPatients, 
  avgWaitingTime = 15,
  avgServiceTime = 8, 
  className,
  queueDistribution = { regular: 70, urgent: 10, elderly: 15, special: 5 },
  queueTypeNames = { regular: 'ทั่วไป', urgent: 'ด่วน', elderly: 'ผู้สูงอายุ', special: 'นัดหมาย' },
  predictedWaitTime,
  isSimulationMode = false
}) => {
  // Only show predicted wait time if wait time prediction is enabled
  const showPrediction = localStorage.getItem('enable_wait_time_prediction') !== 'false';
  
  // Calculate current averages in minutes and round to nearest integer
  const roundedAvgWaitingTime = Math.round(avgWaitingTime);
  const roundedAvgServiceTime = Math.round(avgServiceTime);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${showPrediction ? '4' : '3'} gap-6 ${className}`}>
      <QueueStatCard
        title="ให้บริการทั้งหมด (วันนี้)"
        subtitle="จากข้อมูลวันนี้เท่านั้น"
        value={totalQueues}
        icon={<div className="bg-blue-100 p-3 rounded-full">
          <List className="w-6 h-6 text-blue-600" />
        </div>}
        footer={<>อัพเดทล่าสุด <span className="font-medium">{format(new Date(), 'dd MMM HH:mm น.', { locale: th })}</span></>}
        trend={{ value: 12, label: "จากสัปดาห์ที่แล้ว", positive: true }}
        isSimulation={isSimulationMode}
      />
      
      <QueueStatCard
        title="เวลารอเฉลี่ย (วันนี้)"
        subtitle="จากข้อมูลวันนี้เท่านั้น"
        value={`${roundedAvgWaitingTime} นาที`}
        icon={<div className="bg-amber-100 p-3 rounded-full">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>}
        footer={<>เปรียบเทียบรายสัปดาห์ <span className="font-medium text-green-600">-12%</span></>}
        trend={{ value: 12, label: "ลดลงจากสัปดาห์ที่แล้ว", positive: true }}
        isSimulation={isSimulationMode}
      />
      
      <QueueStatCard
        title="ผู้รับบริการทั้งหมด (วันนี้)"
        subtitle="จากข้อมูลวันนี้เท่านั้น"
        value={totalPatients}
        icon={<div className="bg-green-100 p-3 rounded-full">
          <Users className="w-6 h-6 text-green-600" />
        </div>}
        footer={
          <>
            <div className="mt-2 space-y-1">
              <div className="text-xs text-gray-600">การกระจายตัวของประเภทคิว:</div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700">
                  {queueTypeNames.regular}: {queueDistribution.regular}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-50 text-red-700">
                  {queueTypeNames.urgent}: {queueDistribution.urgent}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                  {queueTypeNames.elderly}: {queueDistribution.elderly}
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                  {queueTypeNames.special}: {queueDistribution.special}
                </span>
              </div>
            </div>
            เฉลี่ย <span className="font-medium">{Math.round((totalQueues / totalPatients) * 10) / 10 || 0}</span> คิว/คน
          </>
        }
        isSimulation={isSimulationMode}
      />
      
      {showPrediction && predictedWaitTime !== undefined && (
        <QueueStatCard
          title="คาดการณ์เวลารอ (คิวต่อไป)"
          subtitle="จากการวิเคราะห์ปัจจุบัน"
          value={`${predictedWaitTime || roundedAvgWaitingTime} นาที`}
          icon={<div className="bg-purple-100 p-3 rounded-full">
            <BarChart4 className="w-6 h-6 text-purple-600" />
          </div>}
          footer={<>ขึ้นอยู่กับปริมาณผู้รับบริการปัจจุบัน</>}
          trend={avgWaitingTime > predictedWaitTime ? 
            { value: Math.round((avgWaitingTime - predictedWaitTime) / avgWaitingTime * 100), label: "เร็วกว่าค่าเฉลี่ย", positive: true } : 
            { value: Math.round((predictedWaitTime - avgWaitingTime) / avgWaitingTime * 100), label: "ช้ากว่าค่าเฉลี่ย", positive: false }
          }
          isSimulation={isSimulationMode}
        />
      )}
    </div>
  );
};

export default QueueStats;
