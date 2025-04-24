
import { Appointment, AppointmentStatus } from '@/integrations/supabase/schema';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useAppointmentDateRange = () => {
  const getAppointmentsByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .gte('date', startDate.toISOString())
        .lte('date', endDate.toISOString())
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        status: item.status as AppointmentStatus
      }));
    } catch (err: any) {
      console.error('Error fetching appointments by date range:', err);
      toast({
        title: 'เกิดข้อผิดพลาด',
        description: 'ไม่สามารถดึงข้อมูลการนัดหมายได้',
        variant: 'destructive'
      });
      return [];
    }
  };

  return { getAppointmentsByDateRange };
};
