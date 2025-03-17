
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';
import { QueueType } from '@/lib/mockData';
import {
  Building,
  Globe,
  Mail,
  Phone,
  Settings as SettingsIcon,
  Bell,
  Volume2,
  LineChart,
  Save,
  Users,
  ClipboardList,
  Calendar
} from 'lucide-react';

const queueSettingsSchema = z.object({
  hospital_name: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  hospital_address: z.string().min(5, 'ต้องมีอย่างน้อย 5 ตัวอักษร'),
  pharmacy_name: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  pharmacy_phone: z.string().min(10, 'ต้องมีอย่างน้อย 10 ตัวอักษร'),
  pharmacy_email: z.string().email('ต้องเป็นอีเมลที่ถูกต้อง'),
  queue_start_number: z.coerce.number().int().min(1, 'ต้องเป็นจำนวนเต็มที่มากกว่า 0'),
  queue_reset_daily: z.boolean(),
  queue_announcement_text: z.string().min(3, 'ต้องมีอย่างน้อย 3 ตัวอักษร'),
  queue_voice_enabled: z.boolean(),
  line_notification_enabled: z.boolean(),
});

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof queueSettingsSchema>>({
    resolver: zodResolver(queueSettingsSchema),
    defaultValues: {
      hospital_name: 'โรงพยาบาลชุมชนตัวอย่าง',
      hospital_address: '123 ถ.สุขุมวิท ต.บางบัว อ.เมือง จ.สมุทรปราการ 10001',
      pharmacy_name: 'ห้องยา ร.พ.ชุมชนตัวอย่าง',
      pharmacy_phone: '02-123-4567',
      pharmacy_email: 'pharmacy@sample-hospital.go.th',
      queue_start_number: 1,
      queue_reset_daily: true,
      queue_announcement_text: 'เชิญหมายเลข {queueNumber} ที่ช่องจ่ายยา {counter}',
      queue_voice_enabled: true,
      line_notification_enabled: true,
    },
  });
  
  const onSubmit = async (data: z.infer<typeof queueSettingsSchema>) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Settings data submitted:', data);
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ตั้งค่าระบบ</h1>
          <p className="text-gray-500">จัดการการตั้งค่าระบบคิวและห้องยา</p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>ทั่วไป</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span>การจัดการคิว</span>
          </TabsTrigger>
          <TabsTrigger value="notification" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>การแจ้งเตือน</span>
          </TabsTrigger>
          <TabsTrigger value="line" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>ตั้งค่า LINE</span>
          </TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>ข้อมูลโรงพยาบาลและห้องยา</CardTitle>
                  <CardDescription>
                    ตั้งค่าข้อมูลพื้นฐานของโรงพยาบาลและห้องยา
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="hospital_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อโรงพยาบาล</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pharmacy_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ชื่อห้องยา</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="hospital_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ที่อยู่โรงพยาบาล</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="pharmacy_phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เบอร์โทรศัพท์ห้องยา</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="pharmacy_email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>อีเมลห้องยา</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input className="pl-10" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="queue" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>การตั้งค่าคิว</CardTitle>
                  <CardDescription>
                    กำหนดค่าการทำงานของระบบคิว
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="queue_start_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>เริ่มนับคิวจากหมายเลข</FormLabel>
                          <FormControl>
                            <Input type="number" min="1" {...field} />
                          </FormControl>
                          <FormDescription>
                            กำหนดหมายเลขเริ่มต้นของคิวในแต่ละวัน
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="queue_reset_daily"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">รีเซ็ตคิวรายวัน</FormLabel>
                            <FormDescription>
                              ระบบจะรีเซ็ตหมายเลขคิวใหม่ทุกวัน
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
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="text-base font-medium mb-4">ประเภทคิวที่เปิดใช้งาน</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">ทั่วไป</FormLabel>
                          <FormDescription>
                            คิวสำหรับผู้ป่วยทั่วไป
                          </FormDescription>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">ด่วน</FormLabel>
                          <FormDescription>
                            คิวสำหรับกรณีฉุกเฉินหรือเร่งด่วน
                          </FormDescription>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">ผู้สูงอายุ</FormLabel>
                          <FormDescription>
                            คิวสำหรับผู้สูงอายุที่มีอายุ 60 ปีขึ้นไป
                          </FormDescription>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                      
                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">ติดตามการใช้ยา</FormLabel>
                          <FormDescription>
                            คิวสำหรับผู้ป่วยที่นัดติดตามการใช้ยา
                          </FormDescription>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>การประกาศเรียกคิว</CardTitle>
                  <CardDescription>
                    ตั้งค่าการแสดงผลและเสียงประกาศเรียกคิว
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="queue_announcement_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ข้อความประกาศเรียกคิว</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          ใช้ {'{queueNumber}'} สำหรับหมายเลขคิว และ {'{counter}'} สำหรับช่องบริการ
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="queue_voice_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">เปิดใช้งานเสียงเรียกคิว</FormLabel>
                          <FormDescription>
                            ระบบจะประกาศเสียงเมื่อมีการเรียกคิว
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
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="notification" className="space-y-6">
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
            </TabsContent>
            
            <TabsContent value="line" className="space-y-6">
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
            </TabsContent>
            
            <div className="flex justify-end mt-6">
              <Button type="submit" className="bg-pharmacy-600 hover:bg-pharmacy-700 text-white" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า'}
              </Button>
            </div>
          </form>
        </Form>
      </Tabs>
    </Layout>
  );
};

export default Settings;
