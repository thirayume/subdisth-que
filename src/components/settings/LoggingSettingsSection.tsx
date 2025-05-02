
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { LogLevel, getLogLevel, setLogLevel } from '@/utils/logger';
import { toast } from 'sonner';

const LoggingSettingsSection = () => {
  const [currentLevel, setCurrentLevel] = useState<LogLevel>(LogLevel.WARN);

  useEffect(() => {
    setCurrentLevel(getLogLevel());
  }, []);

  const handleChangeLogLevel = (value: string) => {
    const level = Number(value) as LogLevel;
    setCurrentLevel(level);
  };

  const handleSaveSettings = () => {
    setLogLevel(currentLevel);
    toast.success('จะรีเฟรชหน้าจอเพื่ออัปเดตการตั้งค่า');
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>การตั้งค่า Logging</CardTitle>
        <CardDescription>
          กำหนดระดับการแสดงข้อมูล log ในคอนโซลสำหรับการพัฒนาและแก้ไขปัญหา
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logLevel">ระดับ Log</Label>
            <Select 
              value={currentLevel.toString()} 
              onValueChange={handleChangeLogLevel}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="เลือกระดับ Log" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={LogLevel.NONE.toString()}>ไม่แสดง Log (None)</SelectItem>
                <SelectItem value={LogLevel.ERROR.toString()}>เฉพาะข้อผิดพลาด (Error)</SelectItem>
                <SelectItem value={LogLevel.WARN.toString()}>คำเตือนและข้อผิดพลาด (Warning)</SelectItem>
                <SelectItem value={LogLevel.INFO.toString()}>ข้อมูลทั่วไป (Info)</SelectItem>
                <SelectItem value={LogLevel.DEBUG.toString()}>ข้อมูลดีบัก (Debug)</SelectItem>
                <SelectItem value={LogLevel.VERBOSE.toString()}>แสดงทั้งหมด (Verbose)</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                ระดับ Log สูงขึ้นจะแสดงข้อมูลมากขึ้น แต่อาจทำให้คอนโซลเต็มได้
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                การเปลี่ยนระดับ Log จะต้องรีเฟรชหน้าจอเพื่อใช้งาน
              </p>
            </div>
            
            <Button onClick={handleSaveSettings}>
              บันทึกการตั้งค่า
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoggingSettingsSection;
