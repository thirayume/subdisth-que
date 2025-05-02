
import { QueueType } from '@/integrations/supabase/schema';
import { formatQueueNumber } from './queueFormatters';
import { BASE_URL } from '@/config/constants';
import { createLogger } from '@/utils/logger';

const logger = createLogger('printUtils');

interface PrintQueueOptions {
  queueNumber: number;
  queueType: QueueType;
  patientName?: string;
  patientPhone?: string;
  patientLineId?: string;
  purpose?: string;
  estimatedWaitTime?: number;
}

export const printQueueTicket = ({
  queueNumber,
  queueType,
  patientName = '',
  patientPhone = '',
  patientLineId = '',
  purpose = '',
  estimatedWaitTime = 15,
}: PrintQueueOptions): void => {
  const formattedQueueNumber = formatQueueNumber(queueType, queueNumber);
  
  logger.debug(`----------------------------------------`);
  logger.debug(`🖨️🖨️🖨️ PRINT QUEUE TICKET FUNCTION CALLED 🖨️🖨️🖨️`);
  logger.debug(`----------------------------------------`);
  logger.debug(`[printQueueTicket] Queue details:`, { 
    queueNumber, 
    queueType, 
    patientName, 
    patientPhone,
    patientLineId,
    purpose,
    estimatedWaitTime
  });
  
  try {
    // Create a new window with just the content we want to print
    logger.debug(`[printQueueTicket] Opening new window for printing`);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      logger.error('[printQueueTicket] Popup blocked. Please allow popups for printing');
      alert('โปรดอนุญาตให้เปิด popup เพื่อพิมพ์บัตรคิว');
      return;
    }

    // Create the QR code URL for tracking the queue
    const patientPortalUrl = `${BASE_URL}/patient-portal?queue=${queueNumber}${queueType ? `&type=${queueType}` : ''}`;
    logger.debug(`[printQueueTicket] Generated QR URL: ${patientPortalUrl}`);

    // Create the print content with queue information and QR code
    logger.debug(`[printQueueTicket] Creating print content`);
    
    const currentDate = new Date().toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    const currentTime = new Date().toLocaleTimeString('th-TH');
    
    logger.debug(`[printQueueTicket] Formatted date and time: ${currentDate} ${currentTime}`);
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>คิวหมายเลข ${formattedQueueNumber}</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
          <style>
            body {
              font-family: 'Sukhumvit Set', 'Prompt', system-ui, sans-serif;
              padding: 20px;
              text-align: center;
            }
            .patient-header {
              margin-bottom: 10px;
              font-size: 18px;
              font-weight: bold;
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
            .qr-container {
              margin: 20px auto;
              width: 200px;
              height: 200px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .wait-time {
              margin: 12px 0;
              font-size: 16px;
              padding: 4px 12px;
              background-color: #f0f9ff;
              border: 1px solid #bae6fd;
              border-radius: 4px;
              color: #0369a1;
              display: inline-block;
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
              .wait-time {
                background-color: #f0f9ff !important;
                border-color: #bae6fd !important;
                color: #0369a1 !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
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
          ${patientName ? `<div class="patient-header">${patientName}</div>` : ''}
          ${patientPhone ? `<div class="patient-info">📱 ${patientPhone}</div>` : ''}
          
          <div class="queue-number">${formattedQueueNumber}</div>
          
          ${estimatedWaitTime ? `<div class="wait-time">⏱️ เวลารอโดยประมาณ: ${estimatedWaitTime} นาที</div>` : ''}
          
          ${patientLineId ? `<div class="patient-info">💬 LINE ID: ${patientLineId}</div>` : ''}
          ${purpose ? `<div class="purpose-info">วัตถุประสงค์: ${purpose}</div>` : ''}
          
          <div class="queue-info">
            วันที่: ${currentDate}
          </div>
          <div class="queue-info">
            เวลา: ${currentTime}
          </div>
          
          <p>สแกน QR Code เพื่อติดตามคิวบน LINE</p>
          <div id="qrcode" class="qr-container"></div>
          
          <div class="footer">
            <p>ขอบคุณที่ใช้บริการ</p>
          </div>
          
          <script>
            console.log('[PrintWindow] Print script initialized');
            
            // Generate QR Code when window loads
            window.onload = function() {
              console.log('[PrintWindow] Window loaded, generating QR code...');
              
              try {
                // Create QR code
                new QRCode(document.getElementById("qrcode"), {
                  text: "${patientPortalUrl}",
                  width: 180,
                  height: 180,
                  colorDark: "#000000",
                  colorLight: "#ffffff",
                  correctLevel: QRCode.CorrectLevel.L
                });
                
                console.log('[PrintWindow] QR code generated');
                
                // Small delay to ensure content and QR code are properly rendered before printing
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
                }, 800); // Increased delay to ensure QR code renders
              } catch (err) {
                console.error('[PrintWindow] Error generating QR code:', err);
              }
            }
          </script>
        </body>
      </html>
    `;

    // Write the content to the new window and trigger print
    logger.debug('[printQueueTicket] Writing content to print window');
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    logger.debug('[printQueueTicket] Print window opened and content written');
  } catch (error) {
    logger.error('[printQueueTicket] Error during printing process:', error);
    alert('เกิดข้อผิดพลาดในการพิมพ์บัตรคิว');
  }
};
