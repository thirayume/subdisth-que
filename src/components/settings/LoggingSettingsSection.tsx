
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogLevel } from '@/utils/logger';

const LoggingSettingsSection: React.FC = () => {
  const [logLevel, setLogLevel] = useState<string>('INFO');

  // Load the current log level when the component mounts
  useEffect(() => {
    const storedLogLevel = localStorage.getItem('log_level') || 'INFO';
    setLogLevel(storedLogLevel);
  }, []);

  const handleSaveLogLevel = () => {
    localStorage.setItem('log_level', logLevel);
    
    // Reload the application to apply the new log level
    // We're using this method because logger is initialized at application start
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>การบันทึกข้อมูล (Logging)</CardTitle>
        <CardDescription>
          ตั้งค่าระดับการบันทึกข้อมูลในคอนโซลสำหรับการพัฒนาและแก้ไขปัญหา
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="logLevel" className="col-span-1">
              ระดับการบันทึก
            </Label>
            <Select
              value={logLevel}
              onValueChange={setLogLevel}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="เลือกระดับการบันทึก" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NONE">ไม่บันทึก (NONE)</SelectItem>
                <SelectItem value="ERROR">ข้อผิดพลาดเท่านั้น (ERROR)</SelectItem>
                <SelectItem value="WARN">คำเตือนและข้อผิดพลาด (WARN)</SelectItem>
                <SelectItem value="INFO">ข้อมูลทั่วไป (INFO)</SelectItem>
                <SelectItem value="DEBUG">ข้อมูลการแก้ไขปัญหา (DEBUG)</SelectItem>
                <SelectItem value="VERBOSE">ข้อมูลอย่างละเอียด (VERBOSE)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveLogLevel}>
              บันทึกและรีโหลด
            </Button>
          </div>
          
          <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm">
            <h4 className="font-semibold mb-2">ระดับการบันทึกข้อมูล:</h4>
            <ul className="list-disc pl-5 space-y-1">
              <li><span className="font-mono">NONE</span> - ไม่บันทึกข้อมูลใดๆ</li>
              <li><span className="font-mono">ERROR</span> - บันทึกเฉพาะข้อผิดพลาดร้ายแรง</li>
              <li><span className="font-mono">WARN</span> - บันทึกข้อมูลคำเตือนและข้อผิดพลาด</li>
              <li><span className="font-mono">INFO</span> - บันทึกข้อมูลสำคัญของแอปพลิเคชัน (ค่าเริ่มต้น)</li>
              <li><span className="font-mono">DEBUG</span> - บันทึกข้อมูลที่ใช้ในการแก้ไขปัญหา</li>
              <li><span className="font-mono">VERBOSE</span> - บันทึกข้อมูลทั้งหมดอย่างละเอียด</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoggingSettingsSection;
