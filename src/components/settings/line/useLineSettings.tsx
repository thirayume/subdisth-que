
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LineSettings } from './types';

export const useLineSettings = () => {
  const defaultSettings: LineSettings = {
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  };

  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lineSettings, setLineSettings] = useState<LineSettings>(defaultSettings);

  // Load saved settings when component mounts
  useEffect(() => {
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      try {
        setLineSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved LINE settings:', error);
      }
    }
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save settings to localStorage for persistence
    localStorage.setItem('lineSettings', JSON.stringify(lineSettings));
    toast.success('บันทึกการตั้งค่า LINE Official Account เรียบร้อยแล้ว');
  };

  const handleCancel = () => {
    // Restore previous settings
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      setLineSettings(JSON.parse(savedSettings));
    }
    setIsEditing(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    
    // Simulate API test connection
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simulate successful connection
    toast.success('การเชื่อมต่อกับ LINE Official Account สำเร็จ');
    setIsTesting(false);
  };

  const handleChange = (field: keyof LineSettings, value: string) => {
    setLineSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    isEditing,
    isTesting,
    lineSettings,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleChange,
  };
};
