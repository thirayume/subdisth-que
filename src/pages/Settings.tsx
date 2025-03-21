
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
} from '@/components/ui/form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon,
  Bell,
  Globe,
  ClipboardList,
  Save,
} from 'lucide-react';
import GeneralSettings from '@/components/settings/GeneralSettings';
import QueueSettings from '@/components/settings/QueueSettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import LineSettings from '@/components/settings/LineSettings';
import { queueSettingsSchema, formatOptions, initialQueueTypes } from '@/components/settings/schemas';
import { z } from 'zod';

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);
  
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
      queue_types: initialQueueTypes,
    },
  });
  
  const queueTypes = form.watch('queue_types');
  
  const onSubmit = async (data: z.infer<typeof queueSettingsSchema>) => {
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Settings data submitted:', data);
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    
    setIsSubmitting(false);
  };

  const handleAddQueueType = () => {
    setNewQueueType(true);
    const newId = `CUSTOM_${Date.now()}`;
    const newQueueTypeItem = {
      id: newId,
      code: '',
      name: '',
      prefix: '',
      purpose: '',
      format: '0' as const,
      enabled: true,
    };
    
    form.setValue('queue_types', [...queueTypes, newQueueTypeItem]);
    setEditingQueueType(newId);
  };
  
  const handleRemoveQueueType = (index: number) => {
    const updatedQueueTypes = [...queueTypes];
    updatedQueueTypes.splice(index, 1);
    form.setValue('queue_types', updatedQueueTypes);
    toast.success('ลบประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleEditQueueType = (id: string) => {
    setEditingQueueType(id);
  };
  
  const handleSaveQueueType = (index: number) => {
    const queueType = queueTypes[index];
    const result = queueSettingsSchema.shape.queue_types.element.safeParse(queueType);
    
    if (!result.success) {
      const errors = result.error.errors;
      errors.forEach(error => {
        toast.error(`ข้อผิดพลาด: ${error.message}`);
      });
      return;
    }
    
    setEditingQueueType(null);
    setNewQueueType(false);
    toast.success('บันทึกประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleCancelEdit = (index: number) => {
    if (newQueueType) {
      const updatedQueueTypes = [...queueTypes];
      updatedQueueTypes.splice(index, 1);
      form.setValue('queue_types', updatedQueueTypes);
      setNewQueueType(false);
    }
    setEditingQueueType(null);
  };
  
  const handleDuplicateQueueType = (index: number) => {
    const queueTypeToDuplicate = { ...queueTypes[index] };
    queueTypeToDuplicate.id = `CUSTOM_${Date.now()}`;
    queueTypeToDuplicate.name = `${queueTypeToDuplicate.name} (สำเนา)`;
    
    const updatedQueueTypes = [...queueTypes, queueTypeToDuplicate];
    form.setValue('queue_types', updatedQueueTypes);
    toast.success('คัดลอกประเภทคิวเรียบร้อยแล้ว');
  };
  
  const handleQueueTypeChange = (index: number, field: string, value: any) => {
    const updatedQueueTypes = [...queueTypes];
    updatedQueueTypes[index] = {
      ...updatedQueueTypes[index],
      [field]: value,
    };
    form.setValue('queue_types', updatedQueueTypes);
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
              <GeneralSettings form={form} />
            </TabsContent>
            
            <TabsContent value="queue" className="space-y-6">
              <QueueSettings 
                form={form}
                editingQueueType={editingQueueType}
                setEditingQueueType={setEditingQueueType}
                newQueueType={newQueueType}
                setNewQueueType={setNewQueueType}
                formatOptions={formatOptions}
                handleAddQueueType={handleAddQueueType}
                handleRemoveQueueType={handleRemoveQueueType}
                handleEditQueueType={handleEditQueueType}
                handleSaveQueueType={handleSaveQueueType}
                handleCancelEdit={handleCancelEdit}
                handleDuplicateQueueType={handleDuplicateQueueType}
                handleQueueTypeChange={handleQueueTypeChange}
              />
            </TabsContent>
            
            <TabsContent value="notification" className="space-y-6">
              <NotificationSettings form={form} />
            </TabsContent>
            
            <TabsContent value="line" className="space-y-6">
              <LineSettings />
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
