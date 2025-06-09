
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/settings';
import { toast } from 'sonner';
import { Send } from 'lucide-react';

const SmsSettings: React.FC = () => {
  const { settings, updateMultipleSettings, loading } = useSettings('sms');
  const [formData, setFormData] = useState({
    enabled: false,
    api_key: '',
    secret: '',
    sender_name: 'Nattharida',
    message_template: 'ท่านกำลังจะได้รับบริการในคิวถัดไป คิวหมายเลข {queueNumber} ที่ {servicePoint}'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testPhone, setTestPhone] = useState('');

  // Load settings when component mounts
  useEffect(() => {
    if (settings && Array.isArray(settings)) {
      const newFormData = { ...formData };
      settings.forEach((setting: any) => {
        if (setting.key === 'enabled') {
          newFormData.enabled = setting.value === 'true' || setting.value === true;
        } else if (setting.key in newFormData) {
          // Remove quotes from JSON string values
          const value = typeof setting.value === 'string' && setting.value.startsWith('"') 
            ? JSON.parse(setting.value) 
            : setting.value;
          (newFormData as any)[setting.key] = value;
        }
      });
      setFormData(newFormData);
    }
  }, [settings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        enabled: formData.enabled.toString(),
        api_key: JSON.stringify(formData.api_key),
        secret: JSON.stringify(formData.secret),
        sender_name: JSON.stringify(formData.sender_name),
        message_template: JSON.stringify(formData.message_template)
      };

      await updateMultipleSettings(updates, 'sms');
      toast.success('บันทึกการตั้งค่า SMS เรียบร้อยแล้ว');
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhone.trim()) {
      toast.error('กรุณาใส่หมายเลขโทรศัพท์สำหรับทดสอบ');
      return;
    }

    setIsTesting(true);
    try {
      const testMessage = formData.message_template
        .replace('{queueNumber}', '999')
        .replace('{servicePoint}', 'ช่องทดสอบ');

      const { error } = await (window as any).supabase.functions.invoke('send-sms-notification', {
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

  if (loading) {
    return <div>กำลังโหลดการตั้งค่า SMS...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>การตั้งค่า SMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Enable SMS */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-enabled" className="text-base font-medium">
                เปิดใช้งาน SMS
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                เปิด/ปิดการส่ง SMS แจ้งเตือนให้ผู้ป่วย
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => handleInputChange('enabled', checked)}
            />
          </div>

          {/* API Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="api-key">API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={formData.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
                placeholder="ใส่ API Key"
              />
            </div>
            <div>
              <Label htmlFor="secret">Secret</Label>
              <Input
                id="secret"
                type="password"
                value={formData.secret}
                onChange={(e) => handleInputChange('secret', e.target.value)}
                placeholder="ใส่ Secret"
              />
            </div>
          </div>

          {/* Sender Name */}
          <div>
            <Label htmlFor="sender-name">ชื่อผู้ส่ง</Label>
            <Input
              id="sender-name"
              value={formData.sender_name}
              onChange={(e) => handleInputChange('sender_name', e.target.value)}
              placeholder="ชื่อที่จะแสดงเป็นผู้ส่ง SMS"
            />
          </div>

          {/* Message Template */}
          <div>
            <Label htmlFor="message-template">รูปแบบข้อความ</Label>
            <Textarea
              id="message-template"
              value={formData.message_template}
              onChange={(e) => handleInputChange('message_template', e.target.value)}
              placeholder="รูปแบบข้อความที่จะส่ง"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-2">
              ใช้ {'{queueNumber}'} สำหรับหมายเลขคิว และ {'{servicePoint}'} สำหรับชื่อช่องบริการ
            </p>
          </div>

          {/* Test SMS */}
          <div className="border-t pt-4">
            <Label htmlFor="test-phone">ทดสอบ SMS</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="test-phone"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="หมายเลขโทรศัพท์สำหรับทดสอบ"
                className="flex-1"
              />
              <Button
                onClick={handleTestSms}
                disabled={isTesting || !formData.enabled}
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                {isTesting ? 'กำลังส่ง...' : 'ทดสอบ'}
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsSettings;
