
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { LineSettings } from './types';

interface LineMessageTemplatesProps {
  lineSettings: LineSettings;
  isEditing: boolean;
  handleChange: (field: keyof LineSettings, value: string) => void;
}

const LineMessageTemplates: React.FC<LineMessageTemplatesProps> = ({
  lineSettings,
  isEditing,
  handleChange
}) => {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-medium mb-2">ข้อความต้อนรับ</h4>
        <Textarea 
          value={lineSettings.welcomeMessage} 
          onChange={(e) => handleChange('welcomeMessage', e.target.value)}
          className="resize-none"
          disabled={!isEditing}
        />
      </div>
      
      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-medium mb-2">ข้อความเมื่อรับคิว</h4>
        <Textarea 
          value={lineSettings.queueReceivedMessage} 
          onChange={(e) => handleChange('queueReceivedMessage', e.target.value)}
          className="resize-none"
          disabled={!isEditing}
        />
        <div className="text-xs text-gray-500 mt-1">
          ตัวแปรที่รองรับ: {'{queueNumber}'}, {'{queueType}'}, {'{estimatedWaitTime}'}
        </div>
      </div>
      
      <div className="rounded-lg border p-4">
        <h4 className="text-sm font-medium mb-2">ข้อความเมื่อเรียกคิว</h4>
        <Textarea 
          value={lineSettings.queueCalledMessage} 
          onChange={(e) => handleChange('queueCalledMessage', e.target.value)}
          className="resize-none" 
          disabled={!isEditing}
        />
        <div className="text-xs text-gray-500 mt-1">
          ตัวแปรที่รองรับ: {'{patientName}'}, {'{counter}'}, {'{queueNumber}'}
        </div>
      </div>
    </div>
  );
};

export default LineMessageTemplates;
