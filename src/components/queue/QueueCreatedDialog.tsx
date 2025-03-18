
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import LineQRCode from '@/components/ui/LineQRCode';
import { Check, Printer } from 'lucide-react';

interface QueueCreatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueNumber: number;
}

const QueueCreatedDialog: React.FC<QueueCreatedDialogProps> = ({
  open,
  onOpenChange,
  queueNumber,
}) => {
  const handlePrint = () => {
    // Create a new window with just the content we want to print
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for printing');
      return;
    }

    // Create the print content with queue information and QR code
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>คิวหมายเลข ${queueNumber}</title>
          <style>
            body {
              font-family: 'Sukhumvit Set', 'Prompt', system-ui, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .queue-info {
              margin: 20px 0;
              font-size: 24px;
              font-weight: bold;
            }
            .queue-number {
              font-size: 64px;
              font-weight: bold;
              color: #158a7b;
              margin: 20px 0;
            }
            .qr-placeholder {
              margin: 20px auto;
              width: 200px;
              height: 200px;
              border: 1px solid #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .footer {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h2>คิวของท่าน</h2>
          <div class="queue-number">${queueNumber}</div>
          <div class="queue-info">
            วันที่: ${new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
          <div class="queue-info">
            เวลา: ${new Date().toLocaleTimeString('th-TH')}
          </div>
          <p>สแกน QR Code เพื่อติดตามคิวบน LINE</p>
          <div class="qr-placeholder">
            <img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Cpath d='M7 7h.01M11 7h.01M7 11h.01M11 11h.01'/%3E%3Cpath d='M7 15h7M16 10.5v.2M14.5 7h-.18M16 14.5v.18M20 14.5v.16'/%3E%3Cpath d='M20 7h.01M20 11h.01M16 7h1'/%3E%3C/svg%3E" alt="QR Code" width="150" height="150">
          </div>
          <div class="footer">
            <p>ขอบคุณที่ใช้บริการ</p>
          </div>
          <script>
            // Auto print when the window loads
            window.onload = function() {
              window.print();
              // Close after printing or after 10 seconds
              setTimeout(() => window.close(), 10000);
            }
          </script>
        </body>
      </html>
    `;

    // Write the content to the new window and trigger print
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <span>สร้างคิวเรียบร้อยแล้ว</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center py-4">
          <div className="text-center mb-4">
            <p className="text-lg font-medium text-pharmacy-700">คิวหมายเลข: <span className="text-2xl">{queueNumber}</span></p>
            <p className="text-sm text-gray-500 mt-1">สแกน QR Code เพื่อติดตามคิวบน LINE</p>
          </div>
          
          <LineQRCode queueNumber={queueNumber} className="w-full max-w-[250px] mx-auto" />
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline"
            onClick={handlePrint} 
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            พิมพ์คิว
          </Button>
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto bg-pharmacy-600 hover:bg-pharmacy-700"
          >
            ตกลง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QueueCreatedDialog;
