
import React from 'react';
import { QueueType } from '@/integrations/supabase/schema';
import LineQRCode from '@/components/ui/LineQRCode';
import PatientInfoDisplay from '../PatientInfoDisplay';

interface QueueCreatedContentProps {
  formattedQueueNumber: string;
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
}

const QueueCreatedContent: React.FC<QueueCreatedContentProps> = ({
  formattedQueueNumber,
  queueNumber,
  queueType,
  patientName,
  patientPhone,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <PatientInfoDisplay 
        patientName={patientName}
        patientPhone={patientPhone}
        formattedQueueNumber={formattedQueueNumber}
      />
      
      <LineQRCode 
        queueNumber={queueNumber} 
        queueType={queueType} 
        className="w-full max-w-[250px] mx-auto" 
      />
    </div>
  );
};

export default QueueCreatedContent;
