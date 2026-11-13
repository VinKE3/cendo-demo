-- =========================================================================
-- CENDO MEDICAL SUITE - ETAPAS B & C (MIGRACIÓN INTEGRAL DE BASE DE DATOS)
-- =========================================================================

-- 1. Consultas Médicas Ginecológicas Estructuradas (Punto 13)
CREATE TABLE IF NOT EXISTS medical_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
  cie10_code TEXT,
  treatment_plan TEXT NOT NULL,
  next_appointment_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Informes de Ecografía Especializada (Punto 5)
CREATE TABLE IF NOT EXISTS ultrasound_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_cmp TEXT NOT NULL,
  doctor_rne TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  ultrasound_type TEXT NOT NULL, -- 'TRANSVAGINAL', 'PELVICA', 'MAMA_BILATERAL', 'OBSTETRICA_1T', 'OBSTETRICA_2T_3T', 'DOPPLER'
  indication TEXT NOT NULL,
  findings JSONB NOT NULL DEFAULT '{}'::jsonb,
  conclusion TEXT NOT NULL,
  recommendations TEXT,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Informes de Procedimientos Menores & Biopsias (Punto 6)
CREATE TABLE IF NOT EXISTS minor_procedures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  doctor_cmp TEXT NOT NULL,
  doctor_rne TEXT,
  procedure_date DATE NOT NULL DEFAULT CURRENT_DATE,
  procedure_type TEXT NOT NULL, -- 'BIOPSIA_CERVICAL', 'BIOPSIA_ENDOMETRIAL', 'CONO_LEEP', 'POLIPECTOMIA', 'INSERCION_DIU', 'RETIRO_DIU', 'INSERCION_IMPLANTE', 'RETIRO_IMPLANTE', 'OTRO'
  pre_op_diagnosis TEXT NOT NULL,
  post_op_diagnosis TEXT NOT NULL,
  cie10_code TEXT,
  anesthesia_type TEXT DEFAULT 'Local (Lidocaína 2%)',
  procedure_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  post_op_indications TEXT NOT NULL,
  medications_prescribed TEXT,
  next_control_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Cotizaciones y Presupuestos de Procedimientos (Punto 3)
CREATE TABLE IF NOT EXISTS procedure_quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
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
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agenda de Citas Médicas y Disponibilidad (Puntos 10 y 11)
CREATE TABLE IF NOT EXISTS medical_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL,
  doctor_name TEXT NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  appointment_type TEXT NOT NULL, -- 'CONSULTA_PRIMERA_VEZ', 'CONTROL_GINECOLOGICO', 'CHEQUEO_INTEGRAL', 'CONTROL_PRENATAL', 'COLPOSCOPIA', 'ECOGRAFIA', 'PROCEDIMIENTO_MENOR'
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONFIRMADA', -- 'PENDIENTE', 'CONFIRMADA', 'EN_ESPERA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO'
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Historias Clínicas en Word / Importaciones Anteriores (Punto 12)
CREATE TABLE IF NOT EXISTS word_history_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INT,
  file_url TEXT NOT NULL,
  extracted_text TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deshabilitar RLS para sincronización directa en desarrollo
ALTER TABLE medical_consultations DISABLE ROW LEVEL SECURITY;
ALTER TABLE ultrasound_reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE minor_procedures DISABLE ROW LEVEL SECURITY;
ALTER TABLE procedure_quotes DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE word_history_documents DISABLE ROW LEVEL SECURITY;

-- 7. Campos Oficiales de Modelo Clínico CENDO (Dr. Patrick Jacinto)
-- En pacientes:
ALTER TABLE patients ADD COLUMN IF NOT EXISTS civil_status TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS education_level TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS birth_place TEXT;
ALTER TABLE patients ADD COLUMN IF NOT EXISTS religion TEXT;

-- En antecedentes:
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS catamenial_regimen TEXT;
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS sti_history TEXT;
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS has_diabetes TEXT;
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS has_hypertension TEXT;
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS has_asthma TEXT;
ALTER TABLE patient_backgrounds ADD COLUMN IF NOT EXISTS other_pathologies TEXT;

-- En consultas médicas:
ALTER TABLE medical_consultations ADD COLUMN IF NOT EXISTS auxiliary_exams TEXT;
ALTER TABLE medical_consultations ADD COLUMN IF NOT EXISTS prescription_notes TEXT;

