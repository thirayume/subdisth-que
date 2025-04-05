
import { z } from "zod";
import { QueueAlgorithmType } from '@/utils/queueAlgorithms';

export interface FormatOption {
  value: '0' | '00' | '000';
  label: string;
  example: string;
}

export const formatOptions: FormatOption[] = [
  { value: '0', label: 'ไม่เติมเลข 0', example: '1, 2, 3...' },
  { value: '00', label: 'เติมเลข 0 (2 หลัก)', example: '01, 02, 03...' },
  { value: '000', label: 'เติมเลข 0 (3 หลัก)', example: '001, 002, 003...' },
];

export const algorithmOptions = [
  { 
    value: QueueAlgorithmType.FIFO, 
    label: 'First In, First Out (FIFO)', 
    description: 'เรียกคิวตามลำดับการมาก่อน-หลัง' 
  },
  { 
    value: QueueAlgorithmType.PRIORITY, 
    label: 'Priority Queue', 
    description: 'เรียกคิวตามลำดับความสำคัญของประเภทคิว' 
  },
  { 
    value: QueueAlgorithmType.MULTILEVEL, 
    label: 'Multilevel Queue', 
    description: 'แบ่งกลุ่มคิวตามประเภทและจัดการแต่ละกลุ่มแยกกัน' 
  },
  { 
    value: QueueAlgorithmType.MULTILEVEL_FEEDBACK, 
    label: 'Multilevel Feedback Queue', 
    description: 'ปรับความสำคัญของคิวตามระยะเวลารอคอย' 
  },
];

export const settingsFormSchema = z.object({
  hospital_name: z.string().min(2, {
    message: "ชื่อโรงพยาบาลต้องมีอย่างน้อย 2 ตัวอักษร",
  }),
  hospital_address: z.string().optional(),
  hospital_phone: z.string().optional(),
  hospital_website: z.string().url().optional().or(z.literal('')),
  
  queue_types: z.array(
    z.object({
      id: z.string(),
      code: z.string().min(1, { message: "รหัสประเภทคิวห้ามว่าง" }),
      name: z.string().min(1, { message: "ชื่อประเภทคิวห้ามว่าง" }),
      prefix: z.string().min(1, { message: "คำนำหน้าคิวห้ามว่าง" }),
      purpose: z.string().optional(),
      format: z.enum(['0', '00', '000']),
      enabled: z.boolean().default(true),
      algorithm: z.nativeEnum(QueueAlgorithmType).default(QueueAlgorithmType.FIFO),
      priority: z.number().min(0).max(10).default(0)
    })
  ),
  
  queue_reset_daily: z.boolean().default(true),
  queue_start_number: z.coerce.number().int().positive().default(1),
  queue_algorithm: z.nativeEnum(QueueAlgorithmType).default(QueueAlgorithmType.FIFO),
  enable_wait_time_prediction: z.boolean().default(true),
  
  queue_announcement_enabled: z.boolean().default(true),
  queue_announcement_text: z.string().min(5).default('ขอเชิญหมายเลข {queueNumber} ที่ช่องบริการ {counter}'),
  queue_voice_speed: z.coerce.number().min(0.5).max(2).default(0.8),
  queue_voice_pitch: z.coerce.number().min(0.5).max(2).default(1),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
