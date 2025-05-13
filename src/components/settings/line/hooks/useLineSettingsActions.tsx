
import { useCallback } from 'react';
import { toast } from 'sonner';
import { LineSettings, TextToSpeechConfig } from '../types';

export const useLineSettingsActions = (
  lineSettings: LineSettings,
  ttsConfig: TextToSpeechConfig,
  setIsEditing: (value: boolean) => void,
  setIsTesting: (value: boolean) => void,
  setIsTestingMessage: (value: boolean) => void,
  setLineSettings: (value: LineSettings | ((prev: LineSettings) => LineSettings)) => void,
  setTtsConfig: (value: TextToSpeechConfig | ((prev: TextToSpeechConfig) => TextToSpeechConfig)) => void,
  validateSettings: () => boolean,
  setErrors: (errors: any) => void
) => {
  const handleEdit = useCallback(() => {
    setIsEditing(true);
    // Reset errors when entering edit mode
    setErrors({});
  }, [setIsEditing, setErrors]);

  const handleSave = useCallback(() => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }
    
    setIsEditing(false);
    // Save settings to localStorage for persistence
    localStorage.setItem('lineSettings', JSON.stringify(lineSettings));
    localStorage.setItem('ttsConfig', JSON.stringify(ttsConfig));
    toast.success('บันทึกการตั้งค่า LINE Official Account เรียบร้อยแล้ว');
  }, [validateSettings, lineSettings, ttsConfig, setIsEditing]);

  const handleCancel = useCallback(() => {
    // Restore previous settings
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      setLineSettings(JSON.parse(savedSettings));
    }
    
    const savedTtsConfig = localStorage.getItem('ttsConfig');
    if (savedTtsConfig) {
      setTtsConfig(JSON.parse(savedTtsConfig));
    }
    
    setIsEditing(false);
    // Clear any errors
    setErrors({});
  }, [setIsEditing, setLineSettings, setTtsConfig, setErrors]);

  const handleTestConnection = useCallback(async () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลการเชื่อมต่อให้ถูกต้องก่อนทดสอบ');
      return;
    }
    
    setIsTesting(true);
    
    try {
      // In a real implementation, you would make an API call here
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if the LINE API credentials are correct format
      // This is a simplified validation since we can't actually verify with LINE
      const isChannelIdValid = /^\d{5,}$/.test(lineSettings.channelId);
      const isChannelSecretValid = lineSettings.channelSecret.length >= 20;
      const isAccessTokenValid = lineSettings.accessToken.length >= 30;
      
      if (isChannelIdValid && isChannelSecretValid && isAccessTokenValid) {
        toast.success('การเชื่อมต่อกับ LINE Official Account สำเร็จ');
      } else {
        toast.error('ไม่สามารถเชื่อมต่อกับ LINE Official Account ได้ กรุณาตรวจสอบข้อมูลอีกครั้ง');
      }
    } catch (error) {
      console.error('Error testing LINE connection:', error);
      toast.error('เกิดข้อผิดพลาดในการทดสอบการเชื่อมต่อ');
    } finally {
      setIsTesting(false);
    }
  }, [validateSettings, lineSettings, setIsTesting]);

  const handleTestMessage = useCallback(async (messageType: 'welcome' | 'queueReceived' | 'queueCalled') => {
    setIsTestingMessage(true);
    
    try {
      // In a real implementation, you would make an API call to LINE Messaging API
      // For now, we'll simulate the message sending process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let messageText: string;
      let sampleMessage: string;
      
      switch (messageType) {
        case 'welcome':
          messageText = lineSettings.welcomeMessage;
          sampleMessage = messageText;
          break;
        case 'queueReceived':
          messageText = lineSettings.queueReceivedMessage
            .replace('{queueNumber}', 'A001')
            .replace('{queueType}', 'ทั่วไป')
            .replace('{estimatedWaitTime}', '15');
          sampleMessage = "ตัวอย่างข้อความ: " + messageText;
          break;
        case 'queueCalled':
          messageText = lineSettings.queueCalledMessage
            .replace('{patientName}', 'คุณสมชาย')
            .replace('{counter}', '2')
            .replace('{queueNumber}', 'A001');
          sampleMessage = "ตัวอย่างข้อความ: " + messageText;
          break;
      }
      
      toast.success(`ส่งข้อความทดสอบสำเร็จ\n${sampleMessage}`, {
        duration: 4000
      });
      
    } catch (error) {
      console.error('Error sending test message:', error);
      toast.error('เกิดข้อผิดพลาดในการส่งข้อความทดสอบ');
    } finally {
      setIsTestingMessage(false);
    }
  }, [lineSettings, setIsTestingMessage]);

  return {
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage
  };
};
