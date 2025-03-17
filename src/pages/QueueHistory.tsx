
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Layout from '@/components/layout/Layout';
import { mockQueues, mockPatients, QueueType, QueueStatus } from '@/lib/mockData';
import { toast } from 'sonner';
import { 
  Search, 
  History, 
  Calendar, 
  Clock, 
  Users, 
  List,
  Calendar as CalendarIcon,
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger, 
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { DateRange } from "react-day-picker";

const QueueHistory = () => {
  // Add completion time to completed queues for demo purposes
  const completedQueues = mockQueues
    .filter(q => q.status === QueueStatus.COMPLETED)
    .map(q => ({
      ...q,
      completedAt: new Date(new Date().getTime() - Math.random() * 10000000).toISOString()
    }));
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(new Date().setHours(0, 0, 0, 0)),
    to: new Date(new Date().setHours(23, 59, 59, 999)),
  });
  const [queueType, setQueueType] = useState<string>("all");
  
  const filteredQueues = completedQueues.filter(queue => {
    // Filter by search term (queue number or patient name)
    const patientName = mockPatients.find(p => p.id === queue.patientId)?.name || '';
    const matchesSearch = searchTerm === '' || 
      queue.number.toString().includes(searchTerm) || 
      patientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by date range
    const completedDate = new Date(queue.completedAt!);
    const matchesDateRange = 
      (!dateRange.from || completedDate >= dateRange.from) && 
      (!dateRange.to || completedDate <= dateRange.to);
    
    // Filter by queue type
    const matchesType = queueType === 'all' || queue.type === queueType;
    
    return matchesSearch && matchesDateRange && matchesType;
  });
  
  const sortedQueues = [...filteredQueues].sort((a, b) => 
    new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()
  );
  
  const getPatientName = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    return patient ? patient.name : 'ไม่ระบุชื่อ';
  };
  
  const getQueueTypeLabel = (type: QueueType) => {
    switch (type) {
      case QueueType.GENERAL: return 'ทั่วไป';
      case QueueType.PRIORITY: return 'ด่วน';
      case QueueType.ELDERLY: return 'ผู้สูงอายุ';
      case QueueType.FOLLOW_UP: return 'ติดตามการใช้ยา';
      default: return 'ไม่ระบุ';
    }
  };
  
  const getQueueTypeClass = (type: QueueType) => {
    switch (type) {
      case QueueType.GENERAL: return 'text-blue-600 bg-blue-50';
      case QueueType.PRIORITY: return 'text-red-600 bg-red-50';
      case QueueType.ELDERLY: return 'text-amber-600 bg-amber-50';
      case QueueType.FOLLOW_UP: return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };
  
  const calculateServiceTime = (queue: any) => {
    if (!queue.calledAt || !queue.completedAt) return '?';
    
    const calledTime = new Date(queue.calledAt).getTime();
    const completedTime = new Date(queue.completedAt).getTime();
    const diffMinutes = Math.round((completedTime - calledTime) / (1000 * 60));
    
    return `${diffMinutes} นาที`;
  };
  
  const calculateWaitingTime = (queue: any) => {
    if (!queue.createdAt || !queue.calledAt) return '?';
    
    const createdTime = new Date(queue.createdAt).getTime();
    const calledTime = new Date(queue.calledAt).getTime();
    const diffMinutes = Math.round((calledTime - createdTime) / (1000 * 60));
    
    return `${diffMinutes} นาที`;
  };
  
  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ประวัติคิว</h1>
          <p className="text-gray-500">ดูประวัติการให้บริการย้อนหลัง</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            ส่งออกข้อมูล
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ให้บริการทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{completedQueues.length}</h3>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <List className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                อัพเดทล่าสุด <span className="font-medium">{format(new Date(), 'dd MMM HH:mm น.', { locale: th })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">เวลารอเฉลี่ย</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">15 นาที</h3>
              </div>
              <div className="bg-amber-100 p-3 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                เปรียบเทียบรายสัปดาห์ <span className="font-medium text-green-600">-12%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="dashboard-card">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">ผู้รับบริการทั้งหมด</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{mockPatients.length}</h3>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                เฉลี่ย <span className="font-medium">{Math.round(completedQueues.length / mockPatients.length * 10) / 10}</span> คิว/คน
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>ค้นหาประวัติคิว</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm mb-1.5">ช่วงวันที่</p>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                        </>
                      ) : (
                        format(dateRange.from, 'dd/MM/yyyy')
                      )
                    ) : (
                      <span>เลือกวันที่</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || {})}
                    numberOfMonths={2}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <p className="text-sm mb-1.5">ประเภทคิว</p>
              <Select 
                value={queueType} 
                onValueChange={setQueueType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ทั้งหมด" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value={QueueType.GENERAL}>ทั่วไป</SelectItem>
                  <SelectItem value={QueueType.PRIORITY}>ด่วน</SelectItem>
                  <SelectItem value={QueueType.ELDERLY}>ผู้สูงอายุ</SelectItem>
                  <SelectItem value={QueueType.FOLLOW_UP}>ติดตามการใช้ยา</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <p className="text-sm mb-1.5">ค้นหา</p>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="ค้นหาด้วยหมายเลขคิวหรือชื่อผู้ป่วย" 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันที่</TableHead>
                <TableHead>เวลา</TableHead>
                <TableHead>หมายเลขคิว</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>ผู้ป่วย</TableHead>
                <TableHead>เวลารอคิว</TableHead>
                <TableHead>เวลาให้บริการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQueues.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    ไม่พบข้อมูลประวัติคิว
                  </TableCell>
                </TableRow>
              ) : (
                sortedQueues.map((queue) => (
                  <TableRow key={queue.id}>
                    <TableCell>
                      {format(new Date(queue.completedAt!), 'dd MMM yyyy', { locale: th })}
                    </TableCell>
                    <TableCell>
                      {format(new Date(queue.completedAt!), 'HH:mm น.', { locale: th })}
                    </TableCell>
                    <TableCell className="font-medium">{queue.number}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getQueueTypeClass(queue.type)}`}>
                        {getQueueTypeLabel(queue.type)}
                      </span>
                    </TableCell>
                    <TableCell>{getPatientName(queue.patientId)}</TableCell>
                    <TableCell>{calculateWaitingTime(queue)}</TableCell>
                    <TableCell>{calculateServiceTime(queue)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default QueueHistory;
