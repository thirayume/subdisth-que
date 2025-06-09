
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/settings';
import { toast } from 'sonner';
import { SmsFormFields, SmsTestSection } from './sms';

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
          <SmsFormFields 
            formData={formData}
            onInputChange={handleInputChange}
          />

          <SmsTestSection 
            enabled={formData.enabled}
            messageTemplate={formData.message_template}
          />

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
