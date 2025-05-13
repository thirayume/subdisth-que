
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LineCredentialFields from './line/LineCredentialFields';
import LineActionButtons from './line/LineActionButtons';
import LineOfficialAccountIcon from './line/LineOfficialAccountIcon';
import { useLineSettings } from './line/hooks/useLineSettings';
import { useLineSettingsData } from '@/hooks/useLineSettingsData';

const LineSettings = () => {
  // Define state hooks first for consistent ordering
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isTestingMessage, setIsTestingMessage] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { 
    lineSettings, 
    ttsConfig, 
    loading,
    saveLineSettings 
  } = useLineSettingsData();

  // Only use the custom hook after all useState declarations
  const {
    handleChange,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    validation
  } = useLineSettings();

  // Initialize with default values if not loaded yet
  const defaultLineSettings = {
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  };

  const currentLineSettings = lineSettings || defaultLineSettings;

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
    </>
  );
};

export default LineSettings;
