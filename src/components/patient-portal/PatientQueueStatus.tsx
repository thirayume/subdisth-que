
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Queue, Patient, QueueStatus } from '@/integrations/supabase/schema';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatQueueNumber } from '@/utils/queueFormatters';
import LineQRCode from '@/components/ui/LineQRCode';

interface PatientQueueStatusProps {
  queue: Queue;
  patient: Patient;
  className?: string;
}

const PatientQueueStatus: React.FC<PatientQueueStatusProps> = ({ queue, patient, className }) => {
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<number | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const calculateQueueInfo = async () => {
      if (queue.status === 'WAITING') {
        // Get all waiting queues to determine position
        const { data: waitingQueues, error } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'WAITING')
          .order('created_at', { ascending: true });
        
        if (error) {
          console.error('Error fetching waiting queues:', error);
          return;
        }
        
        // Find position of current queue in waiting queues
        const position = waitingQueues.findIndex(q => q.id === queue.id) + 1;
        setQueuePosition(position);
        
        // Estimate wait time based on position (10 minutes per queue)
        setEstimatedWaitTime(position * 10);
        setStatusMessage('กรุณารอเรียกคิว');
      } else if (queue.status === 'ACTIVE') {
        setStatusMessage('กำลังให้บริการ');
      } else if (queue.status === 'COMPLETED') {
        setStatusMessage('ให้บริการเสร็จสิ้น');
      } else if (queue.status === 'SKIPPED') {
        setStatusMessage('คิวถูกข้าม');
      }
    };
    
    calculateQueueInfo();
    
    // Set up real-time subscription to queue changes
    const channel = supabase
      .channel('queue-status-changes')
      .on('postgres_changes', 
          { event: 'UPDATE', schema: 'public', table: 'queues', filter: `id=eq.${queue.id}` },
          (payload) => {
            console.log('Queue updated:', payload);
            // Reload the page when this queue's status changes
            window.location.reload();
          }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queue]);
  
  let statusIcon: JSX.Element;
  let statusColor: string;
  
  switch (queue.status) {
    case 'ACTIVE':
      statusIcon = <AlertCircle className="h-6 w-6 text-yellow-500" />;
      statusColor = 'bg-yellow-50 border-yellow-200 text-yellow-700';
      break;
    case 'COMPLETED':
      statusIcon = <CheckCircle className="h-6 w-6 text-green-500" />;
      statusColor = 'bg-green-50 border-green-200 text-green-700';
      break;
    case 'SKIPPED':
      statusIcon = <AlertCircle className="h-6 w-6 text-red-500" />;
      statusColor = 'bg-red-50 border-red-200 text-red-700';
      break;
    default:
      statusIcon = <Clock className="h-6 w-6 text-blue-500" />;
      statusColor = 'bg-blue-50 border-blue-200 text-blue-700';
  }

  return (
    <Card className={`${statusColor} border ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {statusIcon}
            <span>คิวของคุณ</span>
          </div>
          <span className="text-2xl font-bold">{formatQueueNumber(queue.number, queue.type)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center">
          <div className="text-lg font-medium">{statusMessage}</div>
          <p className="text-sm">{patient.name}</p>
        </div>
        
        {queue.status === 'WAITING' && (
          <div className="flex flex-col items-center text-center py-2">
            {queuePosition !== null && (
              <div className="mb-2">
                <p className="text-sm">ลำดับคิวของคุณ:</p>
                <p className="text-xl font-bold">{queuePosition}</p>
              </div>
            )}
            
            {estimatedWaitTime !== null && (
              <div>
                <p className="text-sm">เวลารอโดยประมาณ:</p>
                <p className="text-xl font-bold">{estimatedWaitTime} นาที</p>
              </div>
            )}
          </div>
        )}
        
        <div className="text-center">
          <p className="text-sm mb-2">แสกนเพื่อติดตามคิวผ่าน LINE</p>
          <div className="flex justify-center">
            <LineQRCode queueNumber={queue.number} size={120} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientQueueStatus;
