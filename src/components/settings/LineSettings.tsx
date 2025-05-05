
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LineCredentialFields from './line/LineCredentialFields';
// import LineMessageTemplates from './line/LineMessageTemplates';
import LineActionButtons from './line/LineActionButtons';
import LineOfficialAccountIcon from './line/LineOfficialAccountIcon';
// import LineSettingsHelpSection from './line/LineSettingsHelpSection';
// import TextToSpeechSettings from './line/TextToSpeechSettings';
import { useLineSettingsValidation } from './line/hooks/useLineSettingsValidation';
import { LineSettingsErrors } from './line/types';
import { useLineSettingsData } from '@/hooks/useLineSettingsData';

const LineSettings = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [errors, setErrors] = useState<LineSettingsErrors>({});

  const { 
    lineSettings, 
    ttsConfig, 
    loading,
    saveLineSettings 
  } = useLineSettingsData();

  // Initialize with default values if not loaded yet
  const defaultLineSettings = {
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  };

  const defaultTtsConfig = {
    enabled: true,
    volume: 1.0,
    rate: 1.0,
    language: 'th-TH'
  };

  const currentLineSettings = lineSettings || defaultLineSettings;
  const currentTtsConfig = ttsConfig || defaultTtsConfig;

  const { validation, validateSettings } = useLineSettingsValidation(currentLineSettings, isEditing);

  const handleChange = (field: keyof typeof currentLineSettings, value: string) => {
    if (lineSettings) {
      saveLineSettings(
        { ...lineSettings, [field]: value },
        ttsConfig || defaultTtsConfig
      );
    }
  };

  const handleTtsConfigChange = (field: keyof typeof currentTtsConfig, value: any) => {
    if (ttsConfig) {
      saveLineSettings(
        lineSettings || defaultLineSettings,
        { ...ttsConfig, [field]: value }
      );
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    // Reset errors when entering edit mode
    setErrors({});
  };

  const handleSave = () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      return;
    }
    
    saveLineSettings(currentLineSettings, currentTtsConfig);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Clear any errors
    setErrors({});
  };

  const handleTestConnection = async () => {
    const isValid = validateSettings();
    
    if (!isValid) {
      return;
    }
    
    setIsTesting(true);
    
    try {
      // In a real implementation, you would make an API call here
      // For now, we'll simulate the verification process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsTesting(false);
      
      // Check if the LINE API credentials are correct format
      // This is a simplified validation since we can't actually verify with LINE
      const isChannelIdValid = /^\d{5,}$/.test(currentLineSettings.channelId);
      const isChannelSecretValid = currentLineSettings.channelSecret.length >= 20;
      const isAccessTokenValid = currentLineSettings.accessToken.length >= 30;
      
      if (isChannelIdValid && isChannelSecretValid && isAccessTokenValid) {
        // Save successful test to database
        saveLineSettings(currentLineSettings, currentTtsConfig);
      }
    } catch (error) {
      console.error('Error testing LINE connection:', error);
      setIsTesting(false);
    }
  };

  const handleTestMessage = async (messageType: 'welcome' | 'queueReceived' | 'queueCalled') => {
    setIsTestingMessage(true);
    
    try {
      // In a real implementation, you would make an API call to LINE Messaging API
      // For now, we'll simulate the message sending process
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsTestingMessage(false);
    } catch (error) {
      console.error('Error sending test message:', error);
      setIsTestingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gray-300 border-t-pharmacy-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">กำลังโหลดข้อมูลการตั้งค่า LINE...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>LINE Official Account</CardTitle>
            <CardDescription>
              ตั้งค่าการเชื่อมต่อกับ LINE Official Account เพื่อการแจ้งเตือนผู้ป่วย
            </CardDescription>
          </div>
          <LineOfficialAccountIcon />
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <LineCredentialFields 
            lineSettings={currentLineSettings}
            isEditing={isEditing}
            handleChange={handleChange}
            errors={errors}
          />
          
          {/* <LineMessageTemplates 
            lineSettings={currentLineSettings}
            isEditing={isEditing}
            handleChange={handleChange}
            handleTestMessage={handleTestMessage}
            isTesting={isTestingMessage}
          /> */}
          
          <LineActionButtons 
            isEditing={isEditing}
            isTesting={isTesting}
            handleEdit={handleEdit}
            handleSave={handleSave}
            handleCancel={handleCancel}
            handleTestConnection={handleTestConnection}
            isFormValid={validation.isFormValid}
          />
        </CardContent>
      </Card>
      
      {/* <TextToSpeechSettings 
        ttsConfig={currentTtsConfig}
        isEditing={isEditing}
        handleTtsConfigChange={handleTtsConfigChange}
      />
      
      <LineSettingsHelpSection /> */}
    </>
  );
};

export default LineSettings;
