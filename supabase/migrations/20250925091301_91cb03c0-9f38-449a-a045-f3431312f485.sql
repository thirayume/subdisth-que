-- Create queues_ins table for insurance queue management
CREATE TABLE public.queues_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  number INTEGER NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'WAITING',
  service_point_id UUID,
  queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  called_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  skipped_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  paused_at TIMESTAMP WITH TIME ZONE,
  transferred_at TIMESTAMP WITH TIME ZONE,
  noti_at TIMESTAMP WITH TIME ZONE,
  phone_number TEXT,
  ID_card TEXT,
  full_name TEXT,
  house_number TEXT,
  moo TEXT
);

-- Enable Row Level Security
ALTER TABLE public.queues_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for queues_ins access
CREATE POLICY "Staff and admin can manage queues_ins" 
ON public.queues_ins 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can view queues_ins" 
ON public.queues_ins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_queues_ins_updated_at
BEFORE UPDATE ON public.queues_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create service_points_ins table for insurance service points
CREATE TABLE public.service_points_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  location TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.service_points_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for service_points_ins access
CREATE POLICY "Staff and admin can manage service_points_ins" 
ON public.service_points_ins 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can view service_points_ins" 
ON public.service_points_ins 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_service_points_ins_updated_at
BEFORE UPDATE ON public.service_points_ins
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();