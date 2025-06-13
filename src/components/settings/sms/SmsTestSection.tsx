
import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface SmsTestSectionProps {
  enabled: boolean;
  messageTemplate: string;
}

const SmsTestSection: React.FC<SmsTestSectionProps> = ({ enabled, messageTemplate }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  const handleTestSms = async () => {
    if (!testPhone.trim()) {
      toast.error('กรุณาใส่หมายเลขโทรศัพท์สำหรับทดสอบ');
      return;
    }

    setIsTesting(true);
    try {
      const testMessage = messageTemplate
        .replace('{queueNumber}', '999')
        .replace('{servicePoint}', 'ช่องทดสอบ');

      const { data, error } = await supabase.functions.invoke('send-sms-notification', {
        body: {
          phoneNumber: testPhone,
          message: testMessage,
          queueNumber: '999',
          patientName: 'ผู้ป่วยทดสอบ'
        }
      });

      if (error) {
        throw error;
      }

      toast.success('ส่ง SMS ทดสอบเรียบร้อยแล้ว');
    } catch (error: any) {
      toast.error(`เกิดข้อผิดพลาดในการส่ง SMS: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="border-t pt-4">
      <Label htmlFor="test-phone">ทดสอบ SMS</Label>
      <div className="flex gap-2 mt-2">
        <Input
          id="test-phone"
          value={testPhone}
          onChange={(e) => setTestPhone(e.target.value)}
          placeholder="หมายเลขโทรศัพท์สำหรับทดสอบ เช่น 0644255591"
          className="flex-1"
        />
        <Button
          onClick={handleTestSms}
          disabled={isTesting || !enabled}
          variant="outline"
        >
          <Send className="w-4 h-4 mr-2" />
          {isTesting ? 'กำลังส่ง...' : 'ทดสอบ'}
        </Button>
      </div>
    </div>
  );
};

export default SmsTestSection;
