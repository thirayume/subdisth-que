
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Printer, Share2 } from 'lucide-react';
import PatientInfoDisplay from '@/components/queue/PatientInfoDisplay';
import LineQRCode from '@/components/ui/LineQRCode';
import { formatQueueNumber } from '@/utils/queueFormatters';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import { printQueueTicket } from '@/utils/printUtils';
import { QueueType } from '@/integrations/supabase/schema';

const QueueTicket = () => {
  const { id } = useParams<{ id: string }>();
  const { queues } = useQueues();
  const { patients } = usePatients();
  
  const queue = queues.find(q => q.id === id);
  const patient = queue ? patients.find(p => p.id === queue.patient_id) : null;
  
  if (!queue) {
    return (
      <div className="max-w-md mx-auto mt-12 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">ไม่พบข้อมูลคิว</p>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  กลับไปหน้าหลัก
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const formattedQueueNumber = formatQueueNumber(queue.type as QueueType, queue.number);
  
  const handlePrint = () => {
    printQueueTicket({
      queueNumber: queue.number,
      queueType: queue.type as QueueType,
      patientName: patient?.name,
      patientPhone: patient?.phone,
      purpose: queue.notes
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `คิวหมายเลข ${formattedQueueNumber}`,
        text: `ติดตามคิวรับยาเลขที่ ${formattedQueueNumber}`,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    }
  };
  
  return (
    <div className="max-w-md mx-auto mt-4 px-4 pb-12">
      <div className="mb-6">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            กลับไปหน้าหลัก
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">รายละเอียดคิว</h1>
        <p className="text-gray-600">คิวรับยาของคุณ</p>
      </div>
      
      <Card className="overflow-hidden mb-6">
        <CardContent className="p-6">
          <PatientInfoDisplay
            patientName={patient?.name}
            patientPhone={patient?.phone}
            formattedQueueNumber={formattedQueueNumber}
            className="mb-6"
          />
          
          <LineQRCode 
            queueNumber={queue.number} 
            queueType={queue.type as QueueType} 
            className="w-full max-w-[250px] mx-auto" 
          />
          
          <div className="mt-6">
            <p className="text-sm text-gray-500 text-center mb-4">
              ใช้เพื่อติดตามสถานะคิวของคุณ โดยสแกน QR Code ด้านบน
            </p>
            
            {queue.notes && (
              <div className="bg-gray-50 p-3 rounded-md mb-4">
                <p className="text-sm text-gray-600">{queue.notes}</p>
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4 mr-2" />
                พิมพ์บัตรคิว
              </Button>
              
              <Button 
                className="flex-1 bg-pharmacy-600 hover:bg-pharmacy-700" 
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-2" />
                แชร์
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-center text-sm text-gray-500">
        <p>ออกบัตรคิวเมื่อ {new Date(queue.created_at).toLocaleString('th-TH')}</p>
      </div>
    </div>
  );
};

export default QueueTicket;
