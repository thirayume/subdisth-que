
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from './queueFormatters';

interface PrintQueueOptions {
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  purpose?: string;
}

export const printQueueTicket = ({
  queueNumber,
  queueType,
  patientName = '',
  patientPhone = '',
  purpose = '',
}: PrintQueueOptions): void => {
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
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
        <title>คิวหมายเลข ${formattedQueueNumber}</title>
        <style>
          body {
            font-family: 'Sukhumvit Set', 'Prompt', system-ui, sans-serif;
            padding: 20px;
            text-align: center;
          }
          .queue-info {
            margin: 16px 0;
            font-size: 18px;
            font-weight: bold;
          }
          .queue-number {
            font-size: 64px;
            font-weight: bold;
            color: #158a7b;
            margin: 20px 0;
          }
          .patient-info {
            margin: 8px 0;
            font-size: 16px;
          }
          .purpose-info {
            margin: 10px 0;
            font-size: 16px;
            color: #555;
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
        <div class="queue-number">${formattedQueueNumber}</div>
        ${patientName ? `<div class="patient-info">ชื่อผู้ป่วย: ${patientName}</div>` : ''}
        ${patientPhone ? `<div class="patient-info">โทรศัพท์: ${patientPhone}</div>` : ''}
        ${purpose ? `<div class="purpose-info">วัตถุประสงค์: ${purpose}</div>` : ''}
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
