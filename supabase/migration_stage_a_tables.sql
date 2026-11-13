-- ============================================================================
-- CENDO: Centro de Endometriosis & Ginecología Especializada
-- Migración Etapa A: Nuevas Tablas en Supabase
-- 1. medical_prescriptions (Recetario Médico Inteligente)
-- 2. lab_orders (Órdenes de Laboratorio Clínico Especializado)
-- 3. prenatal_cards (Carnet de Control Prenatal Oficial MINSA / CLAP)
-- ============================================================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: medical_prescriptions
CREATE TABLE IF NOT EXISTS public.medical_prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(12),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    general_indications TEXT,
    next_appointment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: lab_orders
CREATE TABLE IF NOT EXISTS public.lab_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    doctor_id TEXT,
    doctor_name TEXT NOT NULL,
    doctor_cmp TEXT NOT NULL,
    doctor_rne TEXT,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    diagnosis TEXT NOT NULL,
    cie10_code VARCHAR(12),
    urgency TEXT NOT NULL DEFAULT 'Rutina',
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    custom_tests TEXT,
    patient_instructions TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: prenatal_cards
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

-- Habilitar permisos de lectura y escritura para el rol anon/authenticated (RLS deshabilitado para desarrollo)
ALTER TABLE public.medical_prescriptions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lab_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.prenatal_cards DISABLE ROW LEVEL SECURITY;

-- Semilla de Recetas de Prueba
INSERT INTO public.medical_prescriptions (
    id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, prescription_date, diagnosis, cie10_code, items, general_indications, next_appointment_date
) VALUES 
(
    '11111111-0000-0000-0000-000000000010',
    '11111111-1111-1111-1111-111111111111',
    'doc-patrick-jacinto',
    'Dr. Patrick José Jacinto Gomero',
    '61693',
    '38657',
    '2026-11-02',
    'Vaginitis mixta y cervicitis periorificial',
    'N76.0',
    '[{"medicationName":"Ginedazol (Metronidazol 500mg + Miconazol 100mg)","dosage":"1 óvulo","frequency":"Cada 24 horas por las noches","duration":"Por 7 días","route":"Vía Vaginal","quantity":"1 caja"}]'::jsonb,
    'Aseo de zona íntima con agua tibia y jabón neutro. Ropa interior de algodón.',
    '2026-11-16'
),
(
    '22222222-0000-0000-0000-000000000010',
    '22222222-2222-2222-2222-222222222222',
    'doc-patrick-jacinto',
    'Dr. Patrick José Jacinto Gomero',
    '61693',
    '38657',
    '2026-11-11',
    'Supervisión de embarazo normal de 18 semanas - Suplementación prenatal',
    'Z34.8',
    '[{"medicationName":"Sulfato Ferroso 300mg + Ácido Fólico 400mcg","dosage":"1 tableta","frequency":"Cada 24 horas en ayunas","duration":"Por 90 días","route":"Vía Oral","quantity":"1 caja x 90"},{"medicationName":"Carbonato de Calcio 500mg + Vitamina D3","dosage":"1 tableta masticable","frequency":"Cada 12 horas","duration":"Por 60 días","route":"Vía Oral","quantity":"1 frasco"}]'::jsonb,
    'Ingesta hídrica mínima de 2.5 litros al día. Separar el calcio del hierro 2 horas.',
    '2026-12-09'
),
(
    '33333333-0000-0000-0000-000000000010',
    '33333333-3333-3333-3333-333333333333',
    'doc-patrick-jacinto',
    'Dr. Patrick José Jacinto Gomero',
    '61693',
    '38657',
    '2026-11-08',
    'Endometrioma ovárico izquierdo y dismenorrea secundaria severa',
    'N80.1',
    '[{"medicationName":"Dienogest 2mg (Visannette)","dosage":"1 comprimido","frequency":"Cada 24 horas continua","duration":"Por 90 días","route":"Vía Oral","quantity":"3 cajas x 28"},{"medicationName":"Naproxeno Sódico 550mg","dosage":"1 tableta","frequency":"Cada 8-12h condicional","duration":"3-5 días","route":"Vía Oral","quantity":"1 caja"}]'::jsonb,
    'Toma continua sin interrupción a la misma hora para control de endometriosis.',
    '2027-02-08'
)
ON CONFLICT (id) DO NOTHING;

-- Semilla de Órdenes de Laboratorio de Prueba
INSERT INTO public.lab_orders (
    id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, order_date, diagnosis, cie10_code, urgency, items, custom_tests, patient_instructions
) VALUES 
(
    '22222222-0000-0000-0000-000000000020',
    '22222222-2222-2222-2222-222222222222',
    'doc-patrick-jacinto',
    'Dr. Patrick José Jacinto Gomero',
    '61693',
    '38657',
    '2026-11-11',
    'Control prenatal II trimestre (18 sem) - Tamizaje diabetes gestacional',
    'Z34.8',
    'Rutina',
    '[{"testName":"Test de Tolerancia a la Glucosa (TTG 75g)","sampleType":"Sangre venosa"},{"testName":"Hemograma Completo + Ferritina","sampleType":"Sangre con EDTA"},{"testName":"Examen Completo de Orina + Urocultivo","sampleType":"Orina chorro medio"},{"testName":"Proteinuria en Orina de 24h","sampleType":"Orina 24h"}]'::jsonb,
    'Perfil tiroideo gestacional (TSH + T4L)',
    'Ayuno de 8 a 10 horas. Acudir a las 7:30 AM.'
),
(
    '33333333-0000-0000-0000-000000000020',
    '33333333-3333-3333-3333-333333333333',
    'doc-patrick-jacinto',
    'Dr. Patrick José Jacinto Gomero',
    '61693',
    '38657',
    '2026-11-08',
    'Endometrioma ovárico izquierdo de 32mm y citología cervical anormal LIE-BG',
    'N80.1',
    'Rutina',
    '[{"testName":"CA-125 (Marcador Ovárico y Endometriosis)","sampleType":"Suero sanguíneo"},{"testName":"Marcador Tumoral CA 19-9","sampleType":"Suero sanguíneo"},{"testName":"Panel Tipificación VPH 23 Genotipos PCR","sampleType":"Cepillado endocervical"},{"testName":"Estudio Histopatológico de Biopsia Cervical (h12 y h6)","sampleType":"Tejido en formol 10%"}]'::jsonb,
    'Hormona Antimülleriana (AMH)',
    'Ayuno de 8 a 10 horas. Abstinencia sexual por 48 horas.'
)
ON CONFLICT (id) DO NOTHING;

