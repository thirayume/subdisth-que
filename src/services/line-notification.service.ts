// src/services/line-notification.service.ts
import axios from 'axios';
import { Queue } from '@/integrations/supabase/schema';

class LineNotificationService {
  /**
   * Sends a notification to a patient that their queue will be called soon
   */
  async sendQueueNotification(lineUserId: string, queue: Queue, estimatedWaitTime: number): Promise<boolean> {
    try {
      const response = await axios.post('/api/line-send-notification', {
        lineUserId,
        message: this.createQueueNotificationMessage(queue, estimatedWaitTime),
        queueId: queue.id
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Error sending LINE notification:', error);
      return false;
    }
  }

  /**
   * Creates a formatted message for queue notifications
   */
  private createQueueNotificationMessage(queue: Queue, estimatedWaitTime: number): string {
    const waitTimeText = estimatedWaitTime <= 5 
      ? 'ประมาณ 5 นาที' 
      : `ประมาณ ${estimatedWaitTime} นาที`;
    
    // Using 'number' property instead of 'queue_number'
    return `🔔 แจ้งเตือนคิวของคุณ 🔔\n\n` +
      `คิวหมายเลข ${queue.number} ของคุณกำลังจะถูกเรียกในอีก${waitTimeText}\n\n` +
      `กรุณาเตรียมตัวและอยู่ในบริเวณที่สามารถได้ยินการเรียกคิว\n\n` +
      `หากคุณไม่อยู่ในสถานที่ กรุณากดปุ่ม "ขอเวลา" ในแอปพลิเคชัน`;
  }
}

export const lineNotificationService = new LineNotificationService();