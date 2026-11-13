-- ============================================================================
-- CENDO: Centro de Endometriosis & Ginecología Especializada
-- Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
-- MIGRACIÓN MAESTRA UNIFICADA (TODAS LAS ETAPAS A, B Y C)
-- ============================================================================
-- Instrucciones:
-- Copia y pega TODO este archivo en el 'SQL Editor' de tu panel de Supabase
-- y haz clic en "RUN". Es 100% seguro y re-ejecutable (idempotente).
-- ============================================================================

-- 1. EXTENSIONES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLA: profiles (Perfil institucional del médico director)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    doctor_title TEXT NOT NULL DEFAULT 'Dr.',
    specialty TEXT NOT NULL DEFAULT 'Ginecología y Obstetricia',
    cmp TEXT NOT NULL,
    rne TEXT NOT NULL,
    clinic_name TEXT NOT NULL DEFAULT 'CENDO - Centro de Endometriosis y Ginecología',
    clinic_address TEXT NOT NULL DEFAULT 'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    phone TEXT NOT NULL DEFAULT '985 945 697',
    contact_email TEXT NOT NULL DEFAULT 'cendoperu@gmail.com',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: patients (Directorio Maestro de Pacientes CENDO)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni VARCHAR(20) UNIQUE NOT NULL,
    document_number VARCHAR(20),
    document_type TEXT DEFAULT 'DNI',
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    full_name TEXT,
    birth_date DATE NOT NULL,
    age INTEGER NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    district TEXT DEFAULT 'Miraflores',
    civil_status TEXT DEFAULT 'Soltera',
    occupation TEXT,
    education_level TEXT,
    birth_place TEXT,
    religion TEXT,
    insurance_info TEXT DEFAULT 'Particular',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Columnas añadidas para compatibilidad total:
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS document_number VARCHAR(20);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS document_type TEXT DEFAULT 'DNI';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS district TEXT DEFAULT 'Miraflores';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS civil_status TEXT DEFAULT 'Soltera';
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS religion TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS insurance_info TEXT DEFAULT 'Particular';

-- 4. TABLA: patient_backgrounds (Antecedentes Gineco-Obstétricos & Patológicos)
CREATE TABLE IF NOT EXISTS public.patient_backgrounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    menarche INTEGER,
    sexual_debut_age INTEGER,
    sexual_partners_count INTEGER,
    catamenial_regimen TEXT,
    sti_history TEXT,
    obstetric_formula VARCHAR(30) DEFAULT 'G0 P0000',
    contraceptive_method TEXT,
    last_menstrual_period DATE,
    pap_history TEXT,
    vph_test_history TEXT,
    has_diabetes TEXT DEFAULT 'Niega',
    has_hypertension TEXT DEFAULT 'Niega',
    has_asthma TEXT DEFAULT 'Niega',
    medical_allergies TEXT,
    surgeries_history TEXT,
    family_history TEXT,
    other_pathologies TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS catamenial_regimen TEXT;
ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS sti_history TEXT;
ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS has_diabetes TEXT DEFAULT 'Niega';
ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS has_hypertension TEXT DEFAULT 'Niega';
ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS has_asthma TEXT DEFAULT 'Niega';
ALTER TABLE public.patient_backgrounds ADD COLUMN IF NOT EXISTS other_pathologies TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_backgrounds_patient_id ON public.patient_backgrounds(patient_id);

-- 5. TABLA: colposcopy_reports (Informes de Colposcopía IFCPC 2011)
CREATE TABLE IF NOT EXISTS public.colposcopy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    adequate_colposcopy BOOLEAN NOT NULL DEFAULT true,
    squamocolumnar_junction_visible TEXT NOT NULL DEFAULT 'Visible',
    transformation_zone_type TEXT NOT NULL DEFAULT 'Tipo 1',
    mature_squamous_epithelium BOOLEAN DEFAULT true,
    ectopy BOOLEAN DEFAULT false,
    thin_acetowhite_epithelium BOOLEAN DEFAULT false,
    dense_acetowhite_epithelium BOOLEAN DEFAULT false,
    irregular_border BOOLEAN DEFAULT false,
    fine_mosaic BOOLEAN DEFAULT false,
    coarse_mosaic BOOLEAN DEFAULT false,
    fine_punctation BOOLEAN DEFAULT false,
    coarse_punctation BOOLEAN DEFAULT false,
    atypical_vessels BOOLEAN DEFAULT false,
    schiller_test TEXT NOT NULL DEFAULT 'Negativo',
    cervical_biopsy_taken BOOLEAN NOT NULL DEFAULT false,
    biopsy_clock_hours JSONB DEFAULT '[]'::jsonb,
    images JSONB DEFAULT '[]'::jsonb,
    diagnosis TEXT NOT NULL,
    plan_recommendations TEXT NOT NULL,
    cie10_code VARCHAR(15) DEFAULT 'Z01.4',
    doctor_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. TABLA: clinical_checkups (Chequeos Ginecológicos Integrales)
CREATE TABLE IF NOT EXISTS public.clinical_checkups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    checkup_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason_for_consultation TEXT,
    breast_ultrasound_findings TEXT,
    breast_ultrasound_birads TEXT DEFAULT 'BI-RADS 1',
    breast_lesion_measurements TEXT,
    transvaginal_ultrasound_findings TEXT,
    uterus_measurements TEXT,
    endometrium_thickness_mm NUMERIC(5,2),
    ovaries_findings TEXT,
    pap_result TEXT,
    vph_result TEXT,
    conclusions TEXT,
    medical_prescription TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. TABLA: medical_prescriptions (Etapa A - Recetario Inteligente)
CREATE TABLE IF NOT EXISTS public.medical_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(15),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_indications TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. TABLA: lab_orders (Etapa A - Órdenes de Laboratorio)
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(15),
    urgency TEXT NOT NULL DEFAULT 'Rutina',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_tests TEXT,
    patient_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. TABLA: prenatal_cards (Etapa A - Carnet de Control Prenatal MINSA/CLAP)
CREATE TABLE IF NOT EXISTS public.prenatal_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    clinic_establishment TEXT NOT NULL DEFAULT 'CENDO - Centro de Endometriosis & Ginecología Especializada',
    attending_doctor_id TEXT,
    attending_doctor_name TEXT NOT NULL,
    baseline JSONB NOT NULL DEFAULT '{}'::jsonb,
    visits JSONB NOT NULL DEFAULT '[]'::jsonb,
    maternal_pathologies JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. TABLA: patient_documents (Etapa B - Repositorio de Documentos & PDFs Externos)
CREATE TABLE IF NOT EXISTS public.patient_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL DEFAULT 'LABORATORIO',
    title TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INT,
    mime_type TEXT DEFAULT 'application/pdf',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. TABLA: medical_consultations (Etapa B - Consulta Ginecológica Estructurada)
CREATE TABLE IF NOT EXISTS public.medical_consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    consultation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason_for_visit TEXT NOT NULL,
    illness_time TEXT,
    symptoms TEXT,
    vital_signs JSONB NOT NULL DEFAULT '{}'::jsonb,
    physical_exam JSONB NOT NULL DEFAULT '{}'::jsonb,
    diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(15),
    treatment_plan TEXT NOT NULL,
    auxiliary_exams TEXT,
    prescription_notes TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.medical_consultations ADD COLUMN IF NOT EXISTS auxiliary_exams TEXT;
ALTER TABLE public.medical_consultations ADD COLUMN IF NOT EXISTS prescription_notes TEXT;

-- 12. TABLA: ultrasound_reports (Etapa B - Formatos de Ecografía Especializada)
CREATE TABLE IF NOT EXISTS public.ultrasound_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    ultrasound_type TEXT NOT NULL,
    indication TEXT NOT NULL,
    findings JSONB NOT NULL DEFAULT '{}'::jsonb,
    conclusion TEXT NOT NULL,
    recommendations TEXT,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 13. TABLA: minor_procedures (Etapa B - Procedimientos Menores & Biopsias)
CREATE TABLE IF NOT EXISTS public.minor_procedures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    procedure_date DATE NOT NULL DEFAULT CURRENT_DATE,
    procedure_type TEXT NOT NULL,
    pre_op_diagnosis TEXT NOT NULL,
    post_op_diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(15),
    anesthesia_type TEXT DEFAULT 'Local (Lidocaína 2%)',
    procedure_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    post_op_indications TEXT NOT NULL,
    medications_prescribed TEXT,
    next_control_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 14. TABLA: procedure_quotes (Etapa C - Presupuestos y Cotizaciones WhatsApp)
CREATE TABLE IF NOT EXISTS public.procedure_quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    validity_days INT DEFAULT 30,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL DEFAULT 0,
    payment_terms TEXT DEFAULT 'Efectivo, Transferencia BCP/BBVA o Tarjeta de Crédito/Débito',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 15. TABLA: medical_appointments (Etapa C - Agenda de Citas Médicas)
CREATE TABLE IF NOT EXISTS public.medical_appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT NOT NULL,
    doctor_name TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration_minutes INT DEFAULT 30,
    appointment_type TEXT NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'CONFIRMADA',
    notes TEXT,
    reminder_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 16. TABLA: word_history_documents (Etapa C - Historias Clínicas en Word)
CREATE TABLE IF NOT EXISTS public.word_history_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size INT,
    file_url TEXT NOT NULL,
    extracted_text TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 17. TABLA: procedures_tariff (Tarifario Médico)
CREATE TABLE IF NOT EXISTS public.procedures_tariff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 18. TABLA: medications_vademecum (Vademécum Farmacológico)
CREATE TABLE IF NOT EXISTS public.medications_vademecum (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generic_name TEXT NOT NULL,
    atc_code VARCHAR(20),
    therapeutic_group TEXT NOT NULL,
    commercial_brands JSONB NOT NULL DEFAULT '[]'::jsonb,
    indications TEXT,
    contraindications TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- PERMISOS Y SEGURIDAD (RLS DESHABILITADO PARA ACCESO DIRECTO CON ANON KEY)
-- ============================================================================
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

-- ============================================================================
-- POLÍTICAS DE ACCESO PARA SUPABASE STORAGE (BUCKETS)
-- ============================================================================
DROP POLICY IF EXISTS "Allow public all on lab-reports" ON storage.objects;
CREATE POLICY "Allow public all on lab-reports" 
ON storage.objects FOR ALL 
USING (bucket_id = 'lab-reports') 
WITH CHECK (bucket_id = 'lab-reports');

DROP POLICY IF EXISTS "Allow public all on clinical-images" ON storage.objects;
CREATE POLICY "Allow public all on clinical-images" 
ON storage.objects FOR ALL 
USING (bucket_id = 'clinical-images') 
WITH CHECK (bucket_id = 'clinical-images');

-- ============================================================================
-- INSERT DE LOS 5 CASOS CLÍNICOS REALES CON UUIDs DETERMINÍSTICOS
-- ============================================================================
INSERT INTO public.patients (
    id, dni, document_number, document_type, first_name, last_name, full_name, birth_date, age, phone, email, address, district, civil_status, occupation, education_level, birth_place, religion, insurance_info
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '73819204',
    '73819204',
    'DNI',
    'LUCIANA MARÍA',
    'RAMOS FIGUEROA',
    'RAMOS FIGUEROA, LUCIANA MARÍA',
    '2001-03-15',
    25,
    '984 125 639',
    'luciana.ramos@email.com',
    'Av. Pardo y Aliaga 640, Dpto 302, San Isidro',
    'San Isidro',
    'Soltera',
    'Licenciada en Comunicaciones',
    'Superior Universitaria Completa',
    'Lima, Perú',
    'Católica',
    'PACIFICO EPS'
),
(
    '10000000-0000-0000-0000-000000000002',
    '75294816',
    '75294816',
    'DNI',
    'FIORELLA BEATRÍZ',
    'MENDOZA CHÁVEZ',
    'MENDOZA CHÁVEZ, FIORELLA BEATRÍZ',
    '1996-08-22',
    30,
    '976 543 218',
    'fiorella.mendoza@email.com',
    'Calle Coronel Inclán 320, Dpto 402, Miraflores',
    'Miraflores',
    'Casada',
    'Contadora Pública Colegiada',
    'Superior Universitaria Completa',
    'Lima, Perú',
    'Católica',
    'RIMAC EPS'
),
(
    '10000000-0000-0000-0000-000000000003',
    '71628493',
    '71628493',
    'DNI',
    'GABRIELA ALEJANDRA',
    'PAREDES VÍLCHEZ',
    'PAREDES VÍLCHEZ, GABRIELA ALEJANDRA',
    '1994-06-18',
    32,
    '992 847 163',
    'gabriela.paredes@email.com',
    'Av. Reducto 1250, Dpto 801, Miraflores',
    'Miraflores',
    'Soltera',
    'Abogada Corporativa Senior',
    'Superior Universitaria Completa',
    'Arequipa, Perú',
    'Católica',
    'Particular / SANITAS EPS'
),
(
    '10000000-0000-0000-0000-000000000004',
    '74195820',
    '74195820',
    'DNI',
    'DANIELA FERNANDA',
    'CASTRO MORALES',
    'CASTRO MORALES, DANIELA FERNANDA',
    '1992-11-05',
    34,
    '987 456 123',
    'daniela.castro@email.com',
    'Malecón Balta 890, Dpto 502, Miraflores',
    'Miraflores',
    'Conviviente',
    'Diseñadora Gráfica & UX',
    'Superior Técnica Completa',
    'Lima, Perú',
    'Cristiana',
    'Particular'
),
(
    '10000000-0000-0000-0000-000000000005',
    '09482715',
    '09482715',
    'DNI',
    'CARMEN ROSA',
    'HUAMÁN QUISPE',
    'HUAMÁN QUISPE, CARMEN ROSA',
    '1974-04-10',
    52,
    '965 318 742',
    'carmen.huaman@email.com',
    'Calle Esperanza 245, Dpto 201, Miraflores',
    'Miraflores',
    'Casada',
    'Docente Universitaria',
    'Posgrado / Maestría',
    'Cusco, Perú',
    'Católica',
    'PACIFICO EPS'
)
ON CONFLICT (dni) DO UPDATE SET
    document_number = EXCLUDED.document_number,
    full_name = EXCLUDED.full_name,
    civil_status = EXCLUDED.civil_status,
    occupation = EXCLUDED.occupation,
    education_level = EXCLUDED.education_level,
    birth_place = EXCLUDED.birth_place,
    religion = EXCLUDED.religion,
    insurance_info = EXCLUDED.insurance_info,
    updated_at = NOW();

-- Perfil del Director Médico
INSERT INTO public.profiles (
    id, email, full_name, doctor_title, specialty, cmp, rne, clinic_name, clinic_address, phone, contact_email
) VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'cendoperu@gmail.com',
    'Patrick José Jacinto Gomero',
    'Dr.',
    'Ginecología y Obstetricia',
    '61693',
    '38657',
    'CENDO - Centro de Endometriosis y Ginecología',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '985 945 697',
    'cendoperu@gmail.com'
) ON CONFLICT (email) DO NOTHING;
