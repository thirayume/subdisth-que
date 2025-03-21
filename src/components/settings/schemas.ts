
import * as z from 'zod';
import { QueueType } from '@/lib/mockData';

export const queueTypeConfigSchema = z.object({
  id: z.string().optional(),
  code: z.string().min(1, 'ต้องระบุรหัสประเภทคิว'),
  name: z.string().min(1, 'ต้องระบุชื่อประเภทคิว'),
  prefix: z.string().min(1, 'ต้องระบุ Prefix'),
  purpose: z.string().min(1, 'ต้องระบุจุดประสงค์'),
  format: z.enum(['0', '00', '000']).default('0'),
  enabled: z.boolean().default(true),
});

export const queueSettingsSchema = z.object({
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

export type FormatOption = {
  value: '0' | '00' | '000';
  label: string;
  example: string;
};

export const formatOptions: FormatOption[] = [
  { value: '0' as const, label: 'ไม่เติมศูนย์ (1, 2, 3, ...)', example: 'A1, A2, ..., A10, A11' },
  { value: '00' as const, label: 'เติมศูนย์ 2 หลัก (01, 02, ...)', example: 'A01, A02, ..., A10, A11' },
  { value: '000' as const, label: 'เติมศูนย์ 3 หลัก (001, 002, ...)', example: 'A001, A002, ..., A010, A011' },
];

export const initialQueueTypes = [
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
