
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form';
import { Globe, Save, RefreshCw, Check, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LineSettings: React.FC = () => {
  // State for LINE OA settings
  const [isEditing, setIsEditing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [lineSettings, setLineSettings] = useState({
    channelId: "1234567890",
    channelSecret: "abcdefghijklmnopqrstuvwxyz",
    accessToken: "12345678901234567890123456789012345678901234567890",
    welcomeMessage: "ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง",
    queueReceivedMessage: "คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที",
    queueCalledMessage: "เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}"
  });

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

  const handleChange = (field: keyof typeof lineSettings, value: string) => {
    setLineSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Load saved settings when component mounts
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('lineSettings');
    if (savedSettings) {
      try {
        setLineSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error parsing saved LINE settings:', error);
      }
    }
  }, []);

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
          <div className="text-center">
            <div className="w-24 h-24 mx-auto bg-green-100 rounded-xl flex items-center justify-center">
              <Globe className="h-12 w-12 text-green-600" />
            </div>
            <h3 className="mt-4 text-lg font-medium">LINE Official Account</h3>
            <p className="text-sm text-gray-500 mt-1">เชื่อมต่อระบบกับ LINE เพื่อเพิ่มประสิทธิภาพการสื่อสาร</p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800">วิธีการรับข้อมูลสำหรับการตั้งค่า</h4>
                <p className="text-xs text-blue-600 mt-1">
                  คุณสามารถค้นหาข้อมูล Channel ID, Channel Secret และ Access Token ได้จาก LINE Developer Console และ LINE Official Account Manager:
                </p>
                <ol className="list-decimal text-xs text-blue-600 mt-2 ml-5 space-y-1">
                  <li>ไปที่ <a href="https://developers.line.biz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex items-center">LINE Developers <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                  <li>เข้าสู่โปรเจค/Provider ที่มี LINE Official Account ของคุณ</li>
                  <li>เลือก Channel ของ Messaging API</li>
                  <li>คุณจะพบ Channel ID และ Channel Secret</li>
                  <li>สำหรับ Access Token ให้ไปที่ <a href="https://manager.line.biz" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline inline-flex items-center">LINE Official Account Manager <ExternalLink className="h-3 w-3 ml-1" /></a></li>
                  <li>เลือก Official Account ของคุณ</li>
                  <li>ไปที่ Settings &gt; Messaging API</li>
                  <li>ดูที่ส่วน "Channel access token (long-lived)" และสร้างหรือคัดลอก Token</li>
                </ol>
              </div>
            </div>
          </div>
          
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
                    <p className="w-72 text-xs">Access Token (long-lived) พบได้ใน LINE Official Account Manager ที่ Settings > Messaging API ในส่วน "Channel access token"</p>
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
          
          <div className="flex justify-center pt-2 space-x-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  แก้ไขการเชื่อมต่อ
                </Button>
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isTesting}
                  className="min-w-[140px]"
                >
                  {isTesting ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      กำลังทดสอบ...
                    </>
                  ) : (
                    <>ทดสอบการเชื่อมต่อ</>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  ยกเลิก
                </Button>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
                  <Save className="w-4 h-4 mr-2" />
                  บันทึกการตั้งค่า
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div className="pt-4">
          <h3 className="text-base font-medium mb-4">การตั้งค่าข้อความ LINE</h3>
          
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
        </div>
      </CardContent>
    </Card>
  );
};

export default LineSettings;

