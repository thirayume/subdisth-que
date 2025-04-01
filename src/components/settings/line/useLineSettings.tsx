
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { LineSettings, LineSettingsValidation, LineSettingsErrors } from './types';

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
  const [errors, setErrors] = useState<LineSettingsErrors>({});
  const [validation, setValidation] = useState<LineSettingsValidation>({
    channelId: true,
    channelSecret: true,
    accessToken: true,
    isFormValid: true
  });

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

  // Validate settings whenever they change during editing
  useEffect(() => {
    if (isEditing) {
      validateSettings();
    }
  }, [lineSettings, isEditing]);

  const validateSettings = () => {
    const newErrors: LineSettingsErrors = {};
    let newValidation = {
      channelId: true,
      channelSecret: true,
      accessToken: true,
      isFormValid: true
    };

    // Channel ID validation - should be numeric and at least 5 characters
    if (!/^\d{5,}$/.test(lineSettings.channelId)) {
      newErrors.channelId = 'Channel ID ต้องเป็นตัวเลขและมีความยาวอย่างน้อย 5 หลัก';
      newValidation.channelId = false;
      newValidation.isFormValid = false;
    }

    // Channel Secret validation - should be at least 20 characters
    if (lineSettings.channelSecret.length < 20) {
      newErrors.channelSecret = 'Channel Secret ต้องมีความยาวอย่างน้อย 20 ตัวอักษร';
      newValidation.channelSecret = false;
      newValidation.isFormValid = false;
    }

    // Access Token validation - should be at least 30 characters
    if (lineSettings.accessToken.length < 30) {
      newErrors.accessToken = 'Access Token ต้องมีความยาวอย่างน้อย 30 ตัวอักษร';
      newValidation.accessToken = false;
      newValidation.isFormValid = false;
    }

    setErrors(newErrors);
    setValidation(newValidation);
    
    return newValidation.isFormValid;
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset errors when entering edit mode
    setErrors({});
  };

  const handleSave = () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลที่กรอกให้ถูกต้อง');
      return;
    }
    
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
    // Clear any errors
    setErrors({});
  };

  const handleTestConnection = async () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      toast.error('กรุณาตรวจสอบข้อมูลการเชื่อมต่อให้ถูกต้องก่อนทดสอบ');
      return;
    }
    
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
    errors,
    validation,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleChange,
  };
};
