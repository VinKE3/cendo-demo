-- ============================================================================
-- CENDO: SINCRONIZACIÓN PROFESIONAL DE AUTENTICACIÓN Y USUARIOS (PROFILES)
-- ============================================================================
-- Ejecuta este script en el SQL Editor de Supabase para activar la autenticación
-- sincronizada en tiempo real entre todos los dispositivos (PC, Tablet, Celular).
-- ============================================================================

-- 1. Agregar columnas de contraseña, rol y estado activo a public.profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'Cendo123';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'doctor';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 2. Deshabilitar RLS para lectura y actualización con anon key
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Upsert de los 3 médicos oficiales de CENDO
INSERT INTO public.profiles (
    id, email, full_name, doctor_title, specialty, cmp, rne, clinic_name, clinic_address, phone, contact_email, role, password, is_active
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'cendoperu@gmail.com',
    'Patrick José Jacinto Gomero',
    'Dr.',
    'Ginecología y Obstetricia - Endometriosis y Colposcopía',
    '61693',
    '38657',
    'CENDO - Centro de Endometriosis y Ginecología',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '985 945 697',
    'cendoperu@gmail.com',
    'director',
    'Cendo123',
    true
),
(
    'a0000000-0000-0000-0000-000000000002',
    'cbenavides@cendo.pe',
    'Carlos Eduardo Benavides Silva',
    'Dr.',
    'Ginecología y Obstetricia - Cirugía Laparoscópica Ginecológica',
    '64520',
    '39145',
    'CENDO - Centro de Endometriosis y Ginecología',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '984 321 654',
    'cbenavides@cendo.pe',
    'doctor',
    'Cendo123',
    true
),
(
    'a0000000-0000-0000-0000-000000000003',
    'amorales@cendo.pe',
    'Andrea Sofía Morales Tello',
    'Dra.',
    'Ginecología y Obstetricia - Medicina Materno-Fetal & Ecografía Doppler',
    '68914',
    '41250',
    'CENDO - Centro de Endometriosis y Ginecología',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '976 123 987',
    'amorales@cendo.pe',
    'doctor',
    'Cendo123',
    true
)
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    doctor_title = EXCLUDED.doctor_title,
    specialty = EXCLUDED.specialty,
    cmp = EXCLUDED.cmp,
    rne = EXCLUDED.rne,
    clinic_name = EXCLUDED.clinic_name,
    clinic_address = EXCLUDED.clinic_address,
    phone = EXCLUDED.phone,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;
