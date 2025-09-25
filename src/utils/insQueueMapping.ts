import { QueueIns, QueueStatus } from '@/integrations/supabase/schema';

export const mapToQueueInsObject = (data: any): QueueIns => {
  return {
    id: data.id,
    number: data.number,
    type: data.type,
    status: data.status as QueueStatus,
    service_point_id: data.service_point_id,
    queue_date: data.queue_date,
    created_at: data.created_at,
    updated_at: data.updated_at,
    called_at: data.called_at,
    completed_at: data.completed_at,
    skipped_at: data.skipped_at,
    cancelled_at: data.cancelled_at,
    paused_at: data.paused_at,
    transferred_at: data.transferred_at,
    noti_at: data.noti_at,
    phone_number: data.phone_number,
    ID_card: data.ID_card,
    full_name: data.full_name,
    house_number: data.house_number,
    moo: data.moo,
  };
};