
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { QrCode } from 'lucide-react';
import { QueueType } from '@/lib/mockData';
import { formatQueueNumber } from '@/components/queue/QueueCreatedDialog';

interface LineQRCodeProps {
  queueNumber: number;
  queueType?: QueueType;
  className?: string;
}

const LineQRCode: React.FC<LineQRCodeProps> = ({ 
  queueNumber, 
  queueType = QueueType.GENERAL, 
  className 
}) => {
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  // This is a placeholder for a real QR code generator
  // In a real app, you would generate a proper QR code for LINE integration
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6 flex flex-col items-center">
        <div className="mb-4 text-center">
          <h4 className="font-semibold text-gray-900 mb-1">ติดตามคิวบน LINE</h4>
          <p className="text-sm text-gray-500">สแกนเพื่อรับการแจ้งเตือนคิวบน LINE</p>
        </div>
        
        <div className="w-40 h-40 bg-white border-2 border-pharmacy-100 rounded-lg flex items-center justify-center relative overflow-hidden">
          {/* Placeholder for actual QR code */}
          <div className="absolute inset-4 grid grid-cols-5 grid-rows-5 gap-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "rounded-sm",
                  // Create a pattern that looks like a QR code with queue number influence
                  (i === 0 || i === 4 || i === 20 || i === 24 || 
                   i % (queueNumber % 7 === 0 ? 7 : queueNumber % 5 + 3) === 0) ? "bg-black" : "",
                  (i === 6 || i === 7 || i === 8 || i === 11 || i === 13 || i === 16 || i === 17 || i === 18) && "bg-white"
                )}
              />
            ))}
          </div>
          
          {/* QR code center with queue number */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white flex items-center justify-center rounded-md shadow-sm">
              <QrCode className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">คิวหมายเลข</p>
          <p className="text-xl font-bold text-pharmacy-700">{formattedQueueNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineQRCode;
