-- 1. Create a table for public profiles linked to auth.users
CREATE TABLE public.profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'staff', 'doctor', 'admin')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- Admins can read all profiles (Optional but useful later)
-- CREATE POLICY "Admins can view all profiles"
-- ON public.profiles FOR SELECT
-- USING (auth.jwt() ->> 'role' = 'admin' OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. Create a function to automatically insert a profile row for new users
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    -- Default role mapping: if email contains admin, assign admin role (for ease of testing)
    CASE 
      WHEN NEW.email ILIKE '%admin%' THEN 'admin'
      WHEN NEW.email ILIKE '%doctor%' THEN 'doctor'
      WHEN NEW.email ILIKE '%staff%' THEN 'staff'
      ELSE 'client'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Drop any existing, broken trigger before creating the new one
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 6. Create the Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- MIGRATION: Add QR Code column to appointments
-- ============================================
-- Stores the base64 QR code data URL generated after booking.
-- The QR code encodes only the appointment ID for staff check-in scanning.
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS qr_code text;

-- ============================================
-- MIGRATION: Create scan_logs table for failed QR scans
-- ============================================
-- Logs every rejected QR scan attempt for audit and debugging.
-- Reasons include: INVALID_QR_FORMAT, APPOINTMENT_NOT_FOUND,
--                  TOO_EARLY, TOO_LATE, INVALID_DATETIME_IN_RECORD
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid REFERENCES public.appointments(id) ON DELETE SET NULL,
  reason        text NOT NULL,
  scanned_at    timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Only staff/admin can read scan logs
CREATE POLICY "Staff can view scan logs"
ON public.scan_logs FOR SELECT
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('staff', 'admin')
);

-- Allow insert from authenticated users (the scan handler runs as auth'd staff)
CREATE POLICY "Authenticated users can insert scan logs"
ON public.scan_logs FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
