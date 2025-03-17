
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LineQRCodeProps {
  queueNumber: number;
  className?: string;
}

const LineQRCode: React.FC<LineQRCodeProps> = ({ queueNumber, className }) => {
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
          <div className="absolute inset-4 grid grid-cols-4 grid-rows-4 gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "bg-black rounded-sm",
                  // Create a pattern that looks like a QR code
                  (i === 0 || i === 3 || i === 12 || i === 15 || i % 7 === 0) && "bg-black",
                  (i === 5 || i === 6 || i === 9 || i === 10) && "bg-white"
                )}
              />
            ))}
          </div>
          
          {/* LINE logo overlay in the center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-white flex items-center justify-center rounded-md shadow-sm">
              <span className="text-xs font-bold text-green-500">LINE</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">คิวหมายเลข</p>
          <p className="text-xl font-bold text-pharmacy-700">{queueNumber}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineQRCode;
