
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LineOfficialAccountIcon from './line/LineOfficialAccountIcon';
import LineSettingsHelpSection from './line/LineSettingsHelpSection';
import LineCredentialFields from './line/LineCredentialFields';
import LineActionButtons from './line/LineActionButtons';
import LineMessageTemplates from './line/LineMessageTemplates';
import TextToSpeechSettings from './line/TextToSpeechSettings';
import { useLineSettings } from './line/hooks/useLineSettings';

const LineSettings: React.FC = () => {
  const {
    isEditing,
    isTesting,
    isTestingMessage,
    lineSettings,
    ttsConfig,
    errors,
    validation,
    handleEdit,
    handleSave,
    handleCancel,
    handleTestConnection,
    handleTestMessage,
    handleChange,
    handleTtsConfigChange,
  } = useLineSettings();

  return (
    <Card>
      <CardHeader>
        <CardTitle>การเชื่อมต่อ LINE Official Account</CardTitle>
        <CardDescription>
          ตั้งค่าการเชื่อมต่อกับ LINE Official Account เพื่อการแจ้งเตือนและจัดการคิว
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-6 space-y-4">
          <LineOfficialAccountIcon />
          
          <LineSettingsHelpSection />
          
          <LineCredentialFields 
            lineSettings={lineSettings}
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
        </div>
        
        <div className="pt-4">
          <h3 className="text-base font-medium mb-4">การตั้งค่าข้อความ LINE</h3>
          
          <LineMessageTemplates
            lineSettings={lineSettings}
            isEditing={isEditing}
            handleChange={handleChange}
            handleTestMessage={handleTestMessage}
            isTesting={isTestingMessage}
          />
        </div>
        
        <TextToSpeechSettings
          ttsConfig={ttsConfig}
          isEditing={isEditing}
          handleTtsConfigChange={handleTtsConfigChange}
        />
      </CardContent>
    </Card>
  );
};

export default LineSettings;
