
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form';
import { Globe } from 'lucide-react';

const LineSettings: React.FC = () => {
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Channel ID</FormLabel>
              <Input value="1234567890" disabled className="bg-gray-50" />
            </div>
            
            <div>
              <FormLabel>Channel Secret</FormLabel>
              <Input value="••••••••••••••••••••••" disabled className="bg-gray-50" />
            </div>
          </div>
          
          <div>
            <FormLabel>Access Token</FormLabel>
            <Input value="••••••••••••••••••••••••••••••••••••••••••••••••••" disabled className="bg-gray-50" />
          </div>
          
          <div className="flex justify-center pt-2">
            <Button variant="outline" className="mr-2">
              แก้ไขการเชื่อมต่อ
            </Button>
            <Button>ทดสอบการเชื่อมต่อ</Button>
          </div>
        </div>
        
        <div className="pt-4">
          <h3 className="text-base font-medium mb-4">การตั้งค่าข้อความ LINE</h3>
          
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">ข้อความต้อนรับ</h4>
              <Textarea defaultValue="ยินดีต้อนรับสู่ระบบคิวห้องยา โรงพยาบาลชุมชนตัวอย่าง" className="resize-none" />
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">ข้อความเมื่อรับคิว</h4>
              <Textarea defaultValue="คุณได้รับคิวหมายเลข {queueNumber} ประเภท: {queueType}\nระยะเวลารอโดยประมาณ: {estimatedWaitTime} นาที" className="resize-none" />
            </div>
            
            <div className="rounded-lg border p-4">
              <h4 className="text-sm font-medium mb-2">ข้อความเมื่อเรียกคิว</h4>
              <Textarea defaultValue="เรียนคุณ {patientName}\nถึงคิวของคุณแล้ว! กรุณามาที่ช่องบริการ {counter}\nหมายเลขคิวของคุณคือ: {queueNumber}" className="resize-none" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LineSettings;
