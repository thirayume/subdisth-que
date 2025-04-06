
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQueues } from '@/hooks/useQueues';
import { usePatients } from '@/hooks/usePatients';
import QueueSummaryCards from '@/components/dashboard/QueueSummaryCards';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { BarChart, ListChecks, Users, Calendar, Pill, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { queues, sortQueues } = useQueues();
  const { patients } = usePatients();
  
  const [waitingQueues, setWaitingQueues] = useState([]);
  const [activeQueues, setActiveQueues] = useState([]);
  const [completedQueues, setCompletedQueues] = useState([]);
  const [todayStats, setTodayStats] = useState({
    avgWaitTime: 0,
    avgServiceTime: 0
  });

  // Update filtered queues when the main queues array changes
  useEffect(() => {
    if (queues) {
      const waiting = queues.filter(q => q.status === 'WAITING');
      const active = queues.filter(q => q.status === 'ACTIVE');
      const completed = queues.filter(q => q.status === 'COMPLETED');
      
      setWaitingQueues(sortQueues(waiting));
      setActiveQueues(active);
      setCompletedQueues(completed);
    }
  }, [queues, sortQueues]);
  
  // Fetch today's statistics
  useEffect(() => {
    const fetchTodayStats = async () => {
      try {
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fetch completed queues for today
        const { data, error } = await supabase
          .from('queues')
          .select('*')
          .eq('status', 'COMPLETED')
          .gte('created_at', today.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Calculate average wait time and service time
          const totalWaitTime = data.reduce((sum, queue) => {
            if (queue.called_at && queue.created_at) {
              const waitMs = new Date(queue.called_at).getTime() - new Date(queue.created_at).getTime();
              return sum + (waitMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          const totalServiceTime = data.reduce((sum, queue) => {
            if (queue.completed_at && queue.called_at) {
              const serviceMs = new Date(queue.completed_at).getTime() - new Date(queue.called_at).getTime();
              return sum + (serviceMs / 60000); // Convert to minutes
            }
            return sum;
          }, 0);
          
          setTodayStats({
            avgWaitTime: data.length > 0 ? totalWaitTime / data.length : 0,
            avgServiceTime: data.length > 0 ? totalServiceTime / data.length : 0
          });
        }
      } catch (err) {
        console.error('Error fetching today stats:', err);
      }
    };
    
    fetchTodayStats();
  }, []);

  return (
    <Layout>
      <DashboardHeader />
      
      <QueueSummaryCards 
        waitingQueues={waitingQueues}
        activeQueues={activeQueues}
        completedQueues={completedQueues}
        queues={queues}
        avgWaitTime={todayStats.avgWaitTime}
        avgServiceTime={todayStats.avgServiceTime}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link to="/queue-management" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-blue-50 to-purple-50 hover:shadow-md border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ListChecks className="mr-2 h-5 w-5 text-blue-600" />
                จัดการคิว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">จัดการคิวรอดำเนินการ กำลังให้บริการ และเสร็จสิ้น</p>
              <div className="mt-4 text-sm text-blue-600">
                คิวรอดำเนินการ: {waitingQueues.length} | กำลังให้บริการ: {activeQueues.length}
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/analytics" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-md border-green-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart className="mr-2 h-5 w-5 text-green-600" />
                การวิเคราะห์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">ข้อมูลวิเคราะห์และสถิติของระบบคิว</p>
              <div className="mt-4 text-sm text-green-600">
                เวลารอเฉลี่ย: {Math.round(todayStats.avgWaitTime)} นาที
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/patients" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-amber-50 to-yellow-50 hover:shadow-md border-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-amber-600" />
                ผู้ป่วย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">จัดการข้อมูลผู้ป่วยและประวัติ</p>
              <div className="mt-4 text-sm text-amber-600">
                ผู้ป่วยทั้งหมด: {patients.length}
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/medications" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-red-50 to-pink-50 hover:shadow-md border-red-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Pill className="mr-2 h-5 w-5 text-red-600" />
                ยาและเวชภัณฑ์
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">จัดการรายการยาและเวชภัณฑ์</p>
              <div className="mt-4 text-sm text-red-600">
                ดูรายละเอียดเพิ่มเติม
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/appointments" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-indigo-50 to-blue-50 hover:shadow-md border-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-indigo-600" />
                นัดหมาย
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">จัดการการนัดหมายและตารางนัด</p>
              <div className="mt-4 text-sm text-indigo-600">
                ดูตารางนัดหมาย
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link to="/history" className="transition-transform hover:scale-105">
          <Card className="h-full bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-md border-purple-100">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-purple-600" />
                ประวัติคิว
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">ดูประวัติคิวที่ให้บริการไปแล้ว</p>
              <div className="mt-4 text-sm text-purple-600">
                บริการทั้งหมด: {completedQueues.length}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </Layout>
  );
};

export default Dashboard;
