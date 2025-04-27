
import React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import LineQRCode from '@/components/ui/LineQRCode';
import PatientInfoDisplay from '../PatientInfoDisplay';
import { Badge } from '@/components/ui/badge';

interface QueueCreatedContentProps {
  formattedQueueNumber: string;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  estimatedWaitTime?: number;
}

const QueueCreatedContent: React.FC<QueueCreatedContentProps> = ({
  formattedQueueNumber,
  queueNumber,
  queueType,
  patientName,
  patientPhone,
  patientLineId,
  estimatedWaitTime = 15,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <PatientInfoDisplay 
        patientName={patientName}
        patientPhone={patientPhone}
        patientLineId={patientLineId}
        formattedQueueNumber={formattedQueueNumber}
      />
      
      <div className="my-3 text-center">
        <Badge variant="outline" className="bg-pharmacy-50 text-pharmacy-700 border-pharmacy-200 px-3 py-1">
          เวลารอโดยประมาณ: {estimatedWaitTime} นาที
        </Badge>
      </div>
      
      <div className="w-full max-w-[250px] mx-auto">
        <LineQRCode 
          queueNumber={queueNumber} 
          queueType={queueType} 
          className="w-full" 
        />
        <p className="text-center text-sm text-gray-500 mt-2">
          สแกนเพื่อรับการแจ้งเตือนผ่าน LINE เมื่อถึงคิวของคุณ
        </p>
      </div>
    </div>
  );
};

export default QueueCreatedContent;
