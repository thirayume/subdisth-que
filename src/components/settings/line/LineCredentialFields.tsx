
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormLabel } from '@/components/ui/form';
import { AlertCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LineSettings } from './types';

interface LineCredentialFieldsProps {
  lineSettings: LineSettings;
  isEditing: boolean;
  handleChange: (field: keyof LineSettings, value: string) => void;
}

const LineCredentialFields: React.FC<LineCredentialFieldsProps> = ({
  lineSettings,
  isEditing,
  handleChange
}) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center">
            <FormLabel>Channel ID</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">Channel ID พบได้ใน LINE Developer Console ในส่วน Channel ของ Messaging API</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input 
            value={isEditing ? lineSettings.channelId : lineSettings.channelId.replace(/./g, '•')} 
            onChange={(e) => handleChange('channelId', e.target.value)}
            disabled={!isEditing} 
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>
        
        <div>
          <div className="flex items-center">
            <FormLabel>Channel Secret</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="w-56 text-xs">Channel Secret พบได้ใน LINE Developer Console ในส่วน Basic settings ของ Messaging API</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input 
            value={isEditing ? lineSettings.channelSecret : "••••••••••••••••••••••"} 
            onChange={(e) => handleChange('channelSecret', e.target.value)}
            type={isEditing ? "text" : "password"}
            disabled={!isEditing} 
            className={!isEditing ? "bg-gray-50" : ""}
          />
        </div>
      </div>
      
      <div>
        <div className="flex items-center">
          <FormLabel>Access Token</FormLabel>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="h-4 w-4 text-gray-400 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="w-72 text-xs">Access Token (long-lived) พบได้ใน LINE Official Account Manager ที่ Settings &gt; Messaging API ในส่วน &quot;Channel access token&quot;</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Input 
          value={isEditing ? lineSettings.accessToken : "••••••••••••••••••••••••••••••••••••••••••••••••••"}
          onChange={(e) => handleChange('accessToken', e.target.value)}
          type={isEditing ? "text" : "password"}
          disabled={!isEditing} 
          className={!isEditing ? "bg-gray-50" : ""}
        />
      </div>
    </>
  );
};

export default LineCredentialFields;
