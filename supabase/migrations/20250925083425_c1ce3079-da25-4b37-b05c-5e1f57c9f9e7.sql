-- Remove public access policies and implement strict role-based access control

-- Drop existing public access policies for sensitive tables
DROP POLICY IF EXISTS "Allow public access to patients" ON public.patients;
DROP POLICY IF EXISTS "Allow public access to queues" ON public.queues;
DROP POLICY IF EXISTS "Allow public access to appointments" ON public.appointments;
DROP POLICY IF EXISTS "Allow public access to medications" ON public.medications;
DROP POLICY IF EXISTS "Allow all operations on line_settings" ON public.line_settings;
DROP POLICY IF EXISTS "Allow all operations on settings" ON public.settings;
DROP POLICY IF EXISTS "Allow all operations on queue_types" ON public.queue_types;

-- Patient data - restrict to staff/admin only
CREATE POLICY "Staff and admin can view patients" 
ON public.patients FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can manage patients" 
ON public.patients FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Queue data - restrict to staff/admin only  
CREATE POLICY "Staff and admin can view queues"
ON public.queues FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can manage queues"
ON public.queues FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Appointment data - restrict to staff/admin only
CREATE POLICY "Staff and admin can view appointments"
ON public.appointments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can manage appointments"
ON public.appointments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Medication data - restrict to staff/admin only
CREATE POLICY "Staff and admin can view medications"
ON public.medications FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admin can manage medications"
ON public.medications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- LINE settings - admin only
CREATE POLICY "Admin only can access line settings"
ON public.line_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System settings - admin only
CREATE POLICY "Admin only can access settings"
ON public.settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Queue types - staff and admin can view, admin can manage
CREATE POLICY "Staff and admin can view queue types"
ON public.queue_types FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admin can manage queue types"
ON public.queue_types FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Fix pharmacy queue services policies
DROP POLICY IF EXISTS "select_pharmacy_queue_services" ON public.pharmacy_queue_services;

CREATE POLICY "Staff and admin can view pharmacy queue services"
ON public.pharmacy_queue_services FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can manage pharmacy queue services"
ON public.pharmacy_queue_services FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Clean up overly permissive patient medications policies
DROP POLICY IF EXISTS "Allow anonymous users to insert patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow anonymous users to update patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow anonymous users to delete patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow anonymous users to select patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow authenticated users to insert patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow authenticated users to select patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow authenticated users to update patient medications" ON public.patient_medications;
DROP POLICY IF EXISTS "Allow authenticated users to delete patient medications" ON public.patient_medications;

-- Replace with proper patient medication policies
CREATE POLICY "Users can view own patient medications"
ON public.patient_medications FOR SELECT
USING (auth.uid() = patient_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Staff and admin can manage patient medications"
ON public.patient_medications FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

-- Clean up overly permissive service point policies
DROP POLICY IF EXISTS "Allow public read access to service points" ON public.service_points;
DROP POLICY IF EXISTS "Allow public insert access to service points" ON public.service_points;
DROP POLICY IF EXISTS "Allow public update access to service points" ON public.service_points;
DROP POLICY IF EXISTS "Allow public delete access to service points" ON public.service_points;
DROP POLICY IF EXISTS "Allow public read access to service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Allow public insert access to service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Allow public update access to service point queue types" ON public.service_point_queue_types;
DROP POLICY IF EXISTS "Allow public delete access to service point queue types" ON public.service_point_queue_types;

-- Replace with proper service point policies
CREATE POLICY "Staff and admin can view service points"
ON public.service_points FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admin can manage service points"
ON public.service_points FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff and admin can view service point queue types"
ON public.service_point_queue_types FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'staff'::app_role));

CREATE POLICY "Admin can manage service point queue types"
ON public.service_point_queue_types FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));