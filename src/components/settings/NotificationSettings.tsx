
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
} from '@/components/ui/form';

const NotificationSettings: React.FC<{ form: UseFormReturn<any> }> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>การแจ้งเตือน</CardTitle>
        <CardDescription>
          ตั้งค่าการแจ้งเตือนผู้ป่วยผ่านช่องทางต่างๆ
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="line_notification_enabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">การแจ้งเตือนผ่าน LINE</FormLabel>
                <FormDescription>
                  ส่งการแจ้งเตือนผ่าน LINE เมื่อมีการเรียกคิว
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">การแจ้งเตือนผ่าน SMS</FormLabel>
            <FormDescription>
              ส่งการแจ้งเตือนผ่าน SMS เมื่อมีการเรียกคิว
            </FormDescription>
          </div>
          <Switch defaultChecked={false} />
        </div>
        
        <div className="flex flex-row items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <FormLabel className="text-base">การแจ้งเตือนการนัดหมาย</FormLabel>
            <FormDescription>
              ส่งการแจ้งเตือนล่วงหน้าสำหรับการนัดหมาย
            </FormDescription>
          </div>
          <Switch defaultChecked={true} />
        </div>
        
        <h3 className="text-base font-medium pt-4">การตั้งเวลาแจ้งเตือนการนัดหมาย</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">1 วันล่วงหน้า</FormLabel>
              <FormDescription>
                แจ้งเตือน 1 วันก่อนการนัดหมาย
              </FormDescription>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">3 ชั่วโมงล่วงหน้า</FormLabel>
              <FormDescription>
                แจ้งเตือน 3 ชั่วโมงก่อนการนัดหมาย
              </FormDescription>
            </div>
            <Switch defaultChecked={true} />
          </div>
          
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">1 ชั่วโมงล่วงหน้า</FormLabel>
              <FormDescription>
                แจ้งเตือน 1 ชั่วโมงก่อนการนัดหมาย
              </FormDescription>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
