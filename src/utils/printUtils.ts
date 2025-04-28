
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from './queueFormatters';

interface PrintQueueOptions {
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
}

export const printQueueTicket = ({
  queueNumber,
  queueType,
  patientName = '',
  patientPhone = '',
  patientLineId = '',
  purpose = '',
}: PrintQueueOptions): void => {
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  console.log(`----------------------------------------`);
  console.log(`🖨️🖨️🖨️ PRINT QUEUE TICKET FUNCTION CALLED 🖨️🖨️🖨️`);
  console.log(`----------------------------------------`);
  console.log(`[printQueueTicket] Queue details:`, { 
    queueNumber, 
    queueType, 
    patientName, 
    patientPhone,
    patientLineId,
    purpose 
  });
  
  try {
    // Create a new window with just the content we want to print
    console.log(`[printQueueTicket] Opening new window for printing`);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      console.error('[printQueueTicket] Popup blocked. Please allow popups for printing');
      alert('โปรดอนุญาตให้เปิด popup เพื่อพิมพ์บัตรคิว');
      return;
    }

    // Create the print content with queue information and QR code
    console.log(`[printQueueTicket] Creating print content`);
    
    const currentDate = new Date().toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const currentTime = new Date().toLocaleTimeString('th-TH');
    
    console.log(`[printQueueTicket] Formatted date and time: ${currentDate} ${currentTime}`);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>คิวหมายเลข ${formattedQueueNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            .icon {
              display: inline-block;
              width: 16px;
              height: 16px;
              margin-right: 4px;
              vertical-align: middle;
            }
            @media print {
              body {
                margin: 0;
                padding: 15px;
              }
              .queue-number {
                font-size: 60px;
              }
              
              /* Force print background colors and images */
              * {
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          </style>
        </head>
        <body>
          <h2>คิวของท่าน</h2>
          <div class="queue-number">${formattedQueueNumber}</div>
          ${patientName ? `<div class="patient-info">📋 ชื่อผู้ป่วย: ${patientName}</div>` : ''}
          ${patientPhone ? `<div class="patient-info">📱 โทรศัพท์: ${patientPhone}</div>` : ''}
          ${patientLineId ? `<div class="patient-info">💬 LINE ID: ${patientLineId}</div>` : ''}
          ${purpose ? `<div class="purpose-info">วัตถุประสงค์: ${purpose}</div>` : ''}
          <div class="queue-info">
            วันที่: ${currentDate}
          </div>
          <div class="queue-info">
            เวลา: ${currentTime}
          </div>
          <p>สแกน QR Code เพื่อติดตามคิวบน LINE</p>
          <div class="qr-placeholder">
            <img src="data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='3' rx='2' ry='2'/%3E%3Cpath d='M7 7h.01M11 7h.01M7 11h.01M11 11h.01'/%3E%3Cpath d='M7 15h7M16 10.5v.2M14.5 7h-.18M16 14.5v.18M20 14.5v.16'/%3E%3Cpath d='M20 7h.01M20 11h.01M16 7h1'/%3E%3C/svg%3E" alt="QR Code" width="150" height="150">
          </div>
          <div class="footer">
            <p>ขอบคุณที่ใช้บริการ</p>
          </div>
          <script>
            console.log('[PrintWindow] Print script initialized');
            // Auto print when the window loads
            window.onload = function() {
              console.log('[PrintWindow] Window loaded, preparing to print...');
              
              // Small delay to ensure content is properly rendered before printing
              setTimeout(() => {
                console.log('[PrintWindow] Triggering browser print dialog');
                try {
                  window.print();
                  console.log('[PrintWindow] Print triggered successfully');
                } catch (e) {
                  console.error('[PrintWindow] Error during print:', e);
                }
                
                // Close after printing or after 10 seconds
                setTimeout(() => {
                  console.log('[PrintWindow] Closing print window');
                  window.close();
                }, 10000);
              }, 500);
            }
          </script>
        </body>
      </html>
    `;

    // Write the content to the new window and trigger print
    console.log('[printQueueTicket] Writing content to print window');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    console.log('[printQueueTicket] Print window opened and content written');
  } catch (error) {
    console.error('[printQueueTicket] Error during printing process:', error);
    alert('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว');
  }
};
