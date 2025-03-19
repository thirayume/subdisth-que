import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Calendar,
  Plus,
  Trash2,
  Edit,
  Check,
  CopyPlus
} from 'lucide-react';

// Add a schema for queue type configuration
const queueTypeConfigSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'ต้องระบุรหัสประเภทคิว'),
  name: z.string().min(1, 'ต้องระบุชื่อประเภทคิว'),
  prefix: z.string().min(1, 'ต้องระบุ Prefix'),
  purpose: z.string().min(1, 'ต้องระบุจุดประสงค์'),
  format: z.enum(['0', '00', '000']).default('0'),
  enabled: z.boolean().default(true),
});

// Update the main settings schema to include queue types
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
  queue_types: z.array(queueTypeConfigSchema),
});

// Define the format options for the queue number display
const formatOptions = [
  { value: '0', label: 'ไม่เติมศูนย์ (1, 2, 3, ...)', example: 'A1, A2, ..., A10, A11' },
  { value: '00', label: 'เติมศูนย์ 2 หลัก (01, 02, ...)', example: 'A01, A02, ..., A10, A11' },
  { value: '000', label: 'เติมศูนย์ 3 หลัก (001, 002, ...)', example: 'A001, A002, ..., A010, A011' },
];

const Settings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingQueueType, setEditingQueueType] = useState<string | null>(null);
  const [newQueueType, setNewQueueType] = useState(false);
  
  // Initial queue types based on existing system - Fixed format type to use the exact string literals
  const initialQueueTypes = [
    {
      id: QueueType.GENERAL,
      code: 'GENERAL',
      name: 'ทั่วไป',
      prefix: 'A',
      purpose: 'รับยาทั่วไป',
      format: '0' as const,
      enabled: true,
    },
    {
      id: QueueType.PRIORITY,
      code: 'PRIORITY',
      name: 'ด่วน',
      prefix: 'P',
      purpose: 'กรณีเร่งด่วน',
      format: '0' as const,
      enabled: true,
    },
    {
      id: QueueType.ELDERLY,
      code: 'ELDERLY',
      name: 'ผู้สูงอายุ',
      prefix: 'E',
      purpose: 'รับยาสำหรับผู้สูงอายุ',
      format: '0' as const,
      enabled: true,
    },
    {
      id: QueueType.FOLLOW_UP,
      code: 'FOLLOW_UP',
      name: 'ติดตามการใช้ยา',
      prefix: 'F',
      purpose: 'ติดตามการรักษา',
      format: '0' as const,
      enabled: true,
    },
  ];
  
  
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
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Settings data submitted:', data);
    toast.success('บันทึกการตั้งค่าเรียบร้อยแล้ว');
    
    setIsSubmitting(false);
  };

  const handleAddQueueType = () => {
    setNewQueueType(true);
    // Generate a unique ID for the new queue type
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
    // Validate the queue type first
    const queueType = queueTypes[index];
    const result = queueTypeConfigSchema.safeParse(queueType);
    
    if (!result.success) {
      // Display validation errors
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
      // If this was a new queue type, remove it
      const updatedQueueTypes = [...queueTypes];
      updatedQueueTypes.splice(index, 1);
      form.setValue('queue_types', updatedQueueTypes);
      setNewQueueType(false);
    }
    setEditingQueueType(null);
  };
  
  const handleDuplicateQueueType = (index: number) => {
    const queueTypeToDuplicate = { ...queueTypes[index] };
    // Generate a new ID for the duplicate
    queueTypeToDuplicate.id = `CUSTOM_${Date.now()}`;
    queueTypeToDuplicate.name = `${queueTypeToDuplicate.name} (สำเนา)`;
    
    const updatedQueueTypes = [...queueTypes, queueTypeToDuplicate];
    form.setValue('queue_types', updatedQueueTypes);
    toast.success('คัดลอกประเภทคิวเรียบร้อยแล้ว');
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
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-medium">ประเภทคิวที่เปิดใช้งาน</h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddQueueType}
                        className="flex items-center"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        เพิ่มประเภทคิว
                      </Button>
                    </div>
                    
                    {queueTypes.map((queueType, index) => {
                      const isEditing = editingQueueType === queueType.id;
                      
                      return (
                        <div key={queueType.id} className="mb-4 rounded-lg border p-4">
                          {isEditing ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`queueType_${index}_code`}>รหัสประเภทคิว</Label>
                                  <Input
                                    id={`queueType_${index}_code`}
                                    value={queueType.code}
                                    onChange={(e) => {
                                      const updatedQueueTypes = [...queueTypes];
                                      updatedQueueTypes[index] = {
                                        ...updatedQueueTypes[index],
                                        code: e.target.value,
                                      };
                                      form.setValue('queue_types', updatedQueueTypes);
                                    }}
                                    placeholder="เช่น GENERAL, PRIORITY"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`queueType_${index}_name`}>ชื่อประเภทคิว</Label>
                                  <Input
                                    id={`queueType_${index}_name`}
                                    value={queueType.name}
                                    onChange={(e) => {
                                      const updatedQueueTypes = [...queueTypes];
                                      updatedQueueTypes[index] = {
                                        ...updatedQueueTypes[index],
                                        name: e.target.value,
                                      };
                                      form.setValue('queue_types', updatedQueueTypes);
                                    }}
                                    placeholder="เช่น ทั่วไป, ด่วน"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`queueType_${index}_prefix`}>Prefix</Label>
                                  <Input
                                    id={`queueType_${index}_prefix`}
                                    value={queueType.prefix}
                                    onChange={(e) => {
                                      const updatedQueueTypes = [...queueTypes];
                                      updatedQueueTypes[index] = {
                                        ...updatedQueueTypes[index],
                                        prefix: e.target.value,
                                      };
                                      form.setValue('queue_types', updatedQueueTypes);
                                    }}
                                    placeholder="เช่น A, B, C"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`queueType_${index}_purpose`}>จุดประสงค์</Label>
                                  <Input
                                    id={`queueType_${index}_purpose`}
                                    value={queueType.purpose}
                                    onChange={(e) => {
                                      const updatedQueueTypes = [...queueTypes];
                                      updatedQueueTypes[index] = {
                                        ...updatedQueueTypes[index],
                                        purpose: e.target.value,
                                      };
                                      form.setValue('queue_types', updatedQueueTypes);
                                    }}
                                    placeholder="เช่น รับยาทั่วไป, กรณีเร่งด่วน"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <Label htmlFor={`queueType_${index}_format`}>รูปแบบหมายเลขคิว</Label>
                                <div className="space-y-2">
                                  {formatOptions.map((option) => (
                                    <div key={option.value} className="flex items-center">
                                      <input
                                        type="radio"
                                        id={`queueType_${index}_format_${option.value}`}
                                        name={`queueType_${index}_format`}
                                        className="mr-2"
                                        checked={queueType.format === option.value}
                                        onChange={() => {
                                          const updatedQueueTypes = [...queueTypes];
                                          updatedQueueTypes[index] = {
                                            ...updatedQueueTypes[index],
                                            format: option.value as '0' | '00' | '000',
                                          };
                                          form.setValue('queue_types', updatedQueueTypes);
                                        }}
                                      />
                                      <label htmlFor={`queueType_${index}_format_${option.value}`} className="text-sm">
                                        {option.label}
                                        <div className="text-xs text-gray-500">ตัวอย่าง: {option.example}</div>
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="flex justify-end space-x-2 pt-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleCancelEdit(index)}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  ยกเลิก
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-pharmacy-600 hover:bg-pharmacy-700"
                                  onClick={() => handleSaveQueueType(index)}
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  บันทึก
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col md:flex-row justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h4 className="font-medium text-lg">{queueType.name}</h4>
                                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {queueType.code}
                                  </div>
                                  <Switch
                                    checked={queueType.enabled}
                                    onCheckedChange={(checked) => {
                                      const updatedQueueTypes = [...queueTypes];
                                      updatedQueueTypes[index] = {
                                        ...updatedQueueTypes[index],
                                        enabled: checked,
                                      };
                                      form.setValue('queue_types', updatedQueueTypes);
                                    }}
                                  />
                                </div>
                                <div className="text-sm text-gray-500">
                                  จุดประสงค์: {queueType.purpose}
                                </div>
                                <div className="text-sm flex space-x-3">
                                  <span className="text-gray-500">
                                    <strong>Prefix:</strong> {queueType.prefix}
                                  </span>
                                  <span className="text-gray-500">
                                    <strong>รูปแบบ:</strong> {
                                      formatOptions.find(opt => opt.value === queueType.format)?.label.split(' ')[0] || 
                                      queueType.format
                                    }
                                  </span>
                                  <span className="text-gray-500">
                                    <strong>ตัวอย่าง:</strong> {
                                      queueType.prefix + 
                                      (queueType.format === '0' ? '1' : 
                                        queueType.format === '00' ? '01' : '001')
                                    }
                                  </span>
                                </div>
                              </div>
                              <div className="flex space-x-1 mt-3 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleDuplicateQueueType(index)}
                                >
                                  <CopyPlus className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => handleEditQueueType(queueType.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleRemoveQueueType(index)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
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
