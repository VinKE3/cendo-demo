-- ============================================================================
-- CENDO: CENTRO DE ENDOMETRIOSIS & GINECOLOGÍA
-- SCRIPT DE LIMPIEZA TOTAL (CLEAN SLATE) PARA CERTIFICACIÓN MODULAR
-- ============================================================================
-- Este script vacía al 100% todos los datos de prueba de las 16 tablas clínicas
-- pero CONSERVA INTACTAS las cuentas médicas institucionales en 'public.profiles'
-- para que el Dr. Patrick y su equipo puedan iniciar sesión sin problemas.
-- ============================================================================

-- 1. VACIADO TOTAL DE LAS 16 TABLAS DE REGISTROS CLÍNICOS Y TRANSACCIONALES
TRUNCATE TABLE 
    public.patient_backgrounds,
    public.colposcopy_reports,
    public.clinical_checkups,
    public.medical_prescriptions,
    public.lab_orders,
    public.prenatal_cards,
    public.patient_documents,
    public.medical_consultations,
    public.ultrasound_reports,
    public.minor_procedures,
    public.procedure_quotes,
    public.medical_appointments,
    public.word_history_documents,
    public.procedures_tariff,
    public.medications_vademecum,
    public.patients
CASCADE;

-- 2. ASEGURAR QUE LAS COLUMNAS CRÍTICAS DE ACCESO EXISTAN EN 'public.profiles'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password TEXT NOT NULL DEFAULT 'Cendo123';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'doctor';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS signature_url TEXT;

-- 3. GARANTIZAR LOS ACCESOS OFICIALES DE LOS 3 MÉDICOS CENDO
INSERT INTO public.profiles (
    id, email, password, full_name, doctor_title, specialty, 
    cmp, rne, clinic_name, clinic_address, phone, contact_email, role, is_active
) VALUES 
(
    'a0000000-0000-0000-0000-000000000001',
    'cendoperu@gmail.com',
    'Cendo123',
    'Patrick José Jacinto Gomero',
    'Dr.',
    'Ginecología y Obstetricia - Endometriosis y Colposcopía',
    '61693',
    '38657',
    'CENDO - Centro de Endometriosis',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '985 945 697',
    'cendoperu@gmail.com',
    'director',
    true
),
(
    'a0000000-0000-0000-0000-000000000002',
    'cbenavides@cendo.pe',
    'Cendo123',
    'Carlos Eduardo Benavides Silva',
    'Dr.',
    'Ginecología y Obstetricia - Cirugía Laparoscópica Ginecológica',
    '64520',
    '39145',
    'CENDO - Centro de Endometriosis',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '984 321 654',
    'cbenavides@cendo.pe',
    'doctor',
    true
),
(
    'a0000000-0000-0000-0000-000000000003',
    'amorales@cendo.pe',
    'Cendo123',
    'Andrea Sofía Morales Tello',
    'Dra.',
    'Ginecología y Obstetricia - Medicina Materno-Fetal & Ecografía Doppler',
    '68914',
    '41250',
    'CENDO - Centro de Endometriosis',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '976 123 987',
    'amorales@cendo.pe',
    'doctor',
    true
)
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    full_name = EXCLUDED.full_name,
    doctor_title = EXCLUDED.doctor_title,
    specialty = EXCLUDED.specialty,
    cmp = EXCLUDED.cmp,
    rne = EXCLUDED.rne,
    clinic_name = EXCLUDED.clinic_name,
    clinic_address = EXCLUDED.clinic_address,
    phone = EXCLUDED.phone,
    contact_email = EXCLUDED.contact_email,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active;

-- 4. DESHABILITAR RLS PARA OPERACIÓN FLUIDA
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_backgrounds DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.colposcopy_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_checkups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenatal_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ultrasound_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.minor_procedures DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.word_history_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures_tariff DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications_vademecum DISABLE ROW LEVEL SECURITY;

-- 4.1 ÍNDICES DE UNICIDAD E INTEGRIDAD
CREATE UNIQUE INDEX IF NOT EXISTS idx_vademecum_unique_name ON public.medications_vademecum (LOWER(TRIM(generic_name)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_procedures_tariff_unique_name ON public.procedures_tariff (LOWER(TRIM(name)));
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_unique_cmp ON public.profiles (TRIM(cmp)) WHERE cmp IS NOT NULL AND cmp <> '';

-- 5. REPORTE DE CONFIRMACIÓN DE LIMPIEZA
SELECT 
    'public.patients' as tabla, count(*) as registros_actuales FROM public.patients
UNION ALL
SELECT 'public.medications_vademecum', count(*) FROM public.medications_vademecum
UNION ALL
SELECT 'public.procedures_tariff', count(*) FROM public.procedures_tariff
UNION ALL
SELECT 'public.medical_consultations', count(*) FROM public.medical_consultations
UNION ALL
SELECT 'public.profiles (Médicos Activos)', count(*) FROM public.profiles;
