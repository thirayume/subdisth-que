
import { v4 as uuidv4 } from 'uuid';

export enum QueueStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  SKIPPED = 'skipped',
}

export enum QueueType {
  GENERAL = 'general',
  PRIORITY = 'priority',
  FOLLOW_UP = 'follow-up',
  ELDERLY = 'elderly',
}

export interface Queue {
  id: string;
  number: number;
  type: QueueType;
  status: QueueStatus;
  patientId: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  calledAt?: Date;
  completedAt?: Date;
}

export interface Patient {
  id: string;
  name: string;
  phoneNumber: string;
  lineId?: string;
  profileImage?: string;
  address?: string;
  distanceFromHospital?: number; // in km
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  instructions: string;
  patientId: string;
  queueId: string;
  createdAt: Date;
}

export interface Appointment {
  id: string;
  patientId: string;
  date: Date;
  type: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderSent: boolean;
}

// Mock data for development
export const mockPatients: Patient[] = [
  {
    id: uuidv4(),
    name: 'สมชาย ใจดี',
    phoneNumber: '0812345678',
    lineId: 'somchai123',
    profileImage: 'https://i.pravatar.cc/150?img=1',
    address: '123 ถนนสุขุมวิท กรุงเทพฯ',
    distanceFromHospital: 2.5,
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2023, 5, 15),
  },
  {
    id: uuidv4(),
    name: 'สมหญิง รักสงบ',
    phoneNumber: '0898765432',
    lineId: 'somying456',
    profileImage: 'https://i.pravatar.cc/150?img=5',
    address: '456 ถนนพญาไท กรุงเทพฯ',
    distanceFromHospital: 5.1,
    createdAt: new Date(2023, 6, 10),
    updatedAt: new Date(2023, 6, 10),
  },
  {
    id: uuidv4(),
    name: 'สมศักดิ์ มีชัย',
    phoneNumber: '0871234567',
    lineId: 'somsak789',
    profileImage: 'https://i.pravatar.cc/150?img=8',
    address: '789 ถนนเพชรบุรี กรุงเทพฯ',
    distanceFromHospital: 1.2,
    createdAt: new Date(2023, 7, 5),
    updatedAt: new Date(2023, 7, 5),
  },
  {
    id: uuidv4(),
    name: 'วิมล พัฒนา',
    phoneNumber: '0856789012',
    lineId: 'wimon321',
    profileImage: 'https://i.pravatar.cc/150?img=9',
    address: '321 ถนนสีลม กรุงเทพฯ',
    distanceFromHospital: 3.8,
    createdAt: new Date(2023, 8, 20),
    updatedAt: new Date(2023, 8, 20),
  },
  {
    id: uuidv4(),
    name: 'ประสิทธิ์ จริงใจ',
    phoneNumber: '0832109876',
    lineId: 'prasit654',
    profileImage: 'https://i.pravatar.cc/150?img=12',
    address: '654 ถนนรามคำแหง กรุงเทพฯ',
    distanceFromHospital: 7.5,
    createdAt: new Date(2023, 9, 15),
    updatedAt: new Date(2023, 9, 15),
  },
];

// Generate mock queues
export const mockQueues: Queue[] = [
  {
    id: uuidv4(),
    number: 1,
    type: QueueType.PRIORITY,
    status: QueueStatus.ACTIVE,
    patientId: mockPatients[0].id,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 2)),
    updatedAt: new Date(new Date().setHours(new Date().getHours() - 1)),
    calledAt: new Date(new Date().setMinutes(new Date().getMinutes() - 5)),
  },
  {
    id: uuidv4(),
    number: 2,
    type: QueueType.GENERAL,
    status: QueueStatus.WAITING,
    patientId: mockPatients[1].id,
    notes: 'แพ้ยาเพนนิซิลิน',
    createdAt: new Date(new Date().setHours(new Date().getHours() - 1.5)),
    updatedAt: new Date(new Date().setHours(new Date().getHours() - 1.5)),
  },
  {
    id: uuidv4(),
    number: 3,
    type: QueueType.ELDERLY,
    status: QueueStatus.WAITING,
    patientId: mockPatients[2].id,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 1)),
    updatedAt: new Date(new Date().setHours(new Date().getHours() - 1)),
  },
  {
    id: uuidv4(),
    number: 4,
    type: QueueType.FOLLOW_UP,
    status: QueueStatus.COMPLETED,
    patientId: mockPatients[3].id,
    createdAt: new Date(new Date().setHours(new Date().getHours() - 3)),
    updatedAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
    calledAt: new Date(new Date().setMinutes(new Date().getMinutes() - 40)),
    completedAt: new Date(new Date().setMinutes(new Date().getMinutes() - 30)),
  },
  {
    id: uuidv4(),
    number: 5,
    type: QueueType.GENERAL,
    status: QueueStatus.SKIPPED,
    patientId: mockPatients[4].id,
    notes: 'ไม่ได้ยินการเรียก',
    createdAt: new Date(new Date().setHours(new Date().getHours() - 2.5)),
    updatedAt: new Date(new Date().setHours(new Date().getHours() - 0.5)),
    calledAt: new Date(new Date().setHours(new Date().getHours() - 0.5)),
  },
];

// Generate mock medications
export const mockMedications: Medication[] = [
  {
    id: uuidv4(),
    name: 'Paracetamol',
    dosage: '500mg',
    instructions: 'รับประทานครั้งละ 1-2 เม็ด ทุก 4-6 ชั่วโมง เมื่อมีอาการปวด',
    patientId: mockPatients[0].id,
    queueId: mockQueues[0].id,
    createdAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Amoxicillin',
    dosage: '250mg',
    instructions: 'รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร',
    patientId: mockPatients[1].id,
    queueId: mockQueues[1].id,
    createdAt: new Date(),
  },
  {
    id: uuidv4(),
    name: 'Simvastatin',
    dosage: '20mg',
    instructions: 'รับประทานครั้งละ 1 เม็ด ก่อนนอน',
    patientId: mockPatients[2].id,
    queueId: mockQueues[2].id,
    createdAt: new Date(),
  },
];

// Generate mock appointments
export const mockAppointments: Appointment[] = [
  {
    id: uuidv4(),
    patientId: mockPatients[0].id,
    date: new Date(new Date().setDate(new Date().getDate() + 30)),
    type: 'ติดตามอาการประจำเดือน',
    notes: 'นำผลการตรวจเลือดมาด้วย',
    createdAt: new Date(),
    updatedAt: new Date(),
    reminderSent: false,
  },
  {
    id: uuidv4(),
    patientId: mockPatients[2].id,
    date: new Date(new Date().setDate(new Date().getDate() + 15)),
    type: 'ตรวจติดตามความดันโลหิต',
    createdAt: new Date(),
    updatedAt: new Date(),
    reminderSent: true,
  },
];
