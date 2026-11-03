-- ============================================================================
-- CENDO: Centro de Endometriosis - Dr. Patrick José Jacinto Gomero
-- CMP 61693 | RNE 38657 | Ginecología y Obstetricia | Miraflores, Lima - Perú
-- Esquema Maestro de Base de Datos PostgreSQL + Seed Data Real
-- ============================================================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABLA: profiles (Datos del médico / consultorio)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    doctor_title TEXT NOT NULL DEFAULT 'Dr.',
    specialty TEXT NOT NULL DEFAULT 'Ginecólogo Obstetra',
    cmp TEXT NOT NULL,
    rne TEXT NOT NULL,
    clinic_name TEXT NOT NULL DEFAULT 'CENDO - Centro de Endometriosis',
    clinic_address TEXT NOT NULL DEFAULT 'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    phone TEXT NOT NULL DEFAULT '985 945 697',
    contact_email TEXT NOT NULL DEFAULT 'cendoperu@gmail.com',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. TABLA: patients (Directorio maestro de pacientes)
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dni VARCHAR(12) UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birth_date DATE NOT NULL,
    age INTEGER NOT NULL,
    phone TEXT,
    email TEXT,
    address TEXT,
    civil_status TEXT DEFAULT 'Soltera',
    occupation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. TABLA: patient_backgrounds (Antecedentes Gineco-Obstétricos Persistentes)
CREATE TABLE IF NOT EXISTS public.patient_backgrounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    menarche INTEGER,
    sexual_debut_age INTEGER,
    sexual_partners_count INTEGER,
    obstetric_formula VARCHAR(20) DEFAULT 'G0 P0000',
    contraceptive_method TEXT,
    last_menstrual_period DATE,
    pap_history TEXT,
    vph_test_history TEXT,
    medical_allergies TEXT,
    surgeries_history TEXT,
    family_history TEXT,
    notes TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. TABLA: colposcopy_reports (Informes de Colposcopía Especializada)
CREATE TABLE IF NOT EXISTS public.colposcopy_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,
    adequate_colposcopy BOOLEAN NOT NULL DEFAULT true,
    squamocolumnar_junction_visible TEXT NOT NULL DEFAULT 'No visible',
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
    cie10_code VARCHAR(10) DEFAULT 'N87.9',
    doctor_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. TABLA: clinical_checkups (Chequeos Integrales y Ecografías)
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

-- 6. TABLA: procedures_tariff (Tarifario Médico y Procedimientos)
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

-- 7. TABLA: medications_vademecum (Vademécum Ginecológico: Principio Activo -> Marcas y Precios)
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

-- Índices para búsqueda rápida (<100ms)
CREATE INDEX IF NOT EXISTS idx_patients_dni ON public.patients(dni);
CREATE INDEX IF NOT EXISTS idx_patients_name ON public.patients(last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_colposcopy_patient ON public.colposcopy_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_checkups_patient ON public.clinical_checkups(patient_id);
CREATE INDEX IF NOT EXISTS idx_tariff_code ON public.procedures_tariff(code);
CREATE INDEX IF NOT EXISTS idx_vademecum_name ON public.medications_vademecum(generic_name);

-- ============================================================================
-- SEED DATA REAL: DR. PATRICK JACINTO / CENDO
-- ============================================================================

-- A. Perfil del Doctor
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
    'CENDO - Centro de Endometriosis',
    'Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima',
    '985 945 697',
    'cendoperu@gmail.com'
) ON CONFLICT (email) DO NOTHING;

-- B. Paciente Semilla Real: María Stephany Herrera Rojas
INSERT INTO public.patients (
    id, dni, first_name, last_name, birth_date, age, phone, email, address, civil_status, occupation
) VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '72961954',
    'MARÍA STEPHANY',
    'HERRERA ROJAS',
    '1998-02-28',
    28,
    '992 481 029',
    'stephany.herrera@email.com',
    'Calle Los Pinos 142, Dpto 502, Miraflores',
    'Soltera',
    'Licenciada en Administración'
) ON CONFLICT (dni) DO NOTHING;

-- C. Antecedentes Gineco-Obstétricos de la Paciente Semilla
INSERT INTO public.patient_backgrounds (
    id, patient_id, menarche, sexual_debut_age, sexual_partners_count, obstetric_formula,
    contraceptive_method, last_menstrual_period, pap_history, vph_test_history,
    medical_allergies, surgeries_history, family_history, notes
) VALUES (
    'c0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    12,
    18,
    2,
    'G0 P0000',
    'Implante subdérmico (colocado hace 1 año y 4 meses)',
    '2026-09-26',
    'ASC-US (Células escamosas atípicas de significado indeterminado)',
    'Negativo (PCR 23 Genotipos de Alto y Bajo Riesgo)',
    'Niega alergias a medicamentos (AINEs, Penicilinas tolerados)',
    'Apendicectomía laparoscópica en 2021',
    'Madre con antecedente de miomatosis uterina intervenida a los 46 años',
    'Paciente acude a control ginecológico anual y evaluación especializada por resultado de PAP.'
) ON CONFLICT (id) DO NOTHING;

-- D. Informe Colposcópico Real de María Stephany
INSERT INTO public.colposcopy_reports (
    id, patient_id, report_date, adequate_colposcopy, squamocolumnar_junction_visible, transformation_zone_type,
    mature_squamous_epithelium, ectopy, thin_acetowhite_epithelium, dense_acetowhite_epithelium,
    irregular_border, fine_mosaic, coarse_mosaic, fine_punctation, coarse_punctation,
    atypical_vessels, schiller_test, cervical_biopsy_taken, biopsy_clock_hours, images,
    diagnosis, plan_recommendations, cie10_code, doctor_name
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    true,
    'No visible',
    'Tipo 1',
    true,
    true,
    true,
    false,
    true,
    false,
    false,
    false,
    false,
    false,
    'Negativo (Lugol Caoba homogéneo)',
    false,
    '[]'::jsonb,
    '[
      {"url": "/images/colpo-demo-1.jpg", "caption": "Cérvix panorámico con solución fisiológica", "timestamp": "2026-11-02"},
      {"url": "/images/colpo-demo-2.jpg", "caption": "Aplicación de ácido acético al 5%: epitelio acetoblanco tenue", "timestamp": "2026-11-02"},
      {"url": "/images/colpo-demo-3.jpg", "caption": "Detalle de zona de transformación y borde irregular", "timestamp": "2026-11-02"},
      {"url": "/images/colpo-demo-4.jpg", "caption": "Test de Schiller: captación uniforme de Lugol", "timestamp": "2026-11-02"}
    ]'::jsonb,
    '1. Colposcopía adecuada. 2. Zona de Transformación Tipo 1. 3. Descartar displasia cervical leve (LIEBG) vs cambios reactivos inflamatorios.',
    'Se sugiere biopsia de cérvix dirigida en siguiente control si persiste alteración citológica. Control con nueva citología en 6 meses.',
    'N87.9',
    'Dr. Patrick José Jacinto Gomero (CMP 61693 / RNE 38657)'
) ON CONFLICT (id) DO NOTHING;

-- E. Informe de Chequeo y Ecografías Reales
INSERT INTO public.clinical_checkups (
    id, patient_id, checkup_date, reason_for_consultation,
    breast_ultrasound_findings, breast_ultrasound_birads, breast_lesion_measurements,
    transvaginal_ultrasound_findings, uterus_measurements, endometrium_thickness_mm,
    ovaries_findings, pap_result, vph_result, conclusions, medical_prescription
) VALUES (
    'e0000000-0000-0000-0000-000000000001',
    'b0000000-0000-0000-0000-000000000001',
    CURRENT_DATE,
    'Chequeo ginecológico preventivo integral anual + revisión de implante',
    'Parénquima mamario bilateral de distribución normal. En mama izquierda a radio 10 se observa imagen anecoica, ovalada, bordes circunscritos, refuerzo acústico posterior compatible con quiste simple.',
    'BI-RADS 2 (Benigno)',
    '6.3 x 2.4 mm en radio 10 mama izquierda',
    'Útero en anteversoflexión de contornos regulares y miometrio homogéneo. Sin evidencia de nódulos miomatosos ni adenomiosis.',
    '68 x 38 x 49 mm (Volumen estimado: 66 cc)',
    2.20,
    'Ambos ovarios de morfología, ecoestructura y volumen conservados. No se observan masas anexiales quísticas ni sólidas patológicas.',
    'ASC-US (Células escamosas atípicas de significado indeterminado)',
    'Negativo para 23 genotipos de VPH oncogénicos y no oncogénicos',
    '1. Hallazgos mamarios compatibles con mastopatía fibroquística benigna (BI-RADS 2). 2. Ecografía transvaginal dentro de límites normales con endometrio atrófico esperado por implante progestágeno.',
    '1. Control ecográfico mamario y control ginecológico en 1 año. 2. Continuar con implante subdérmico.'
) ON CONFLICT (id) DO NOTHING;

-- F. Tarifario Inicial Real de Procedimientos CENDO (8 Servicios)
INSERT INTO public.procedures_tariff (id, code, name, category, description, price, active) VALUES
('f0000000-0000-0000-0000-000000000001', 'GIN-001', 'Consulta Ginecológica Especializada', 'Consulta', 'Evaluación médica integral, anamnesis, exploración pélvica y prescripción médica', 200.00, true),
('f0000000-0000-0000-0000-000000000002', 'COL-001', 'Colposcopía Digital + Informe Fotográfico', 'Procedimiento', 'Inspección colposcópica de cérvix de alta resolución con ácido acético y test de Schiller', 250.00, true),
('f0000000-0000-0000-0000-000000000003', 'ECO-001', 'Ecografía Transvaginal Doppler', 'Ecografía', 'Evaluación pélvica endocavitaria de útero, endometrio y anexos con mapeo vascular', 180.00, true),
('f0000000-0000-0000-0000-000000000004', 'ECO-002', 'Ecografía Mamaria Bilateral', 'Ecografía', 'Rastreo ecográfico mamario bilateral y regiones axilares con clasificación BI-RADS', 180.00, true),
('f0000000-0000-0000-0000-000000000005', 'LAB-001', 'Toma de Papanicolaou en Base Líquida (ThinPrep)', 'Laboratorio', 'Toma de muestra cervical con citología monocapa líquida y lectura patológica especializada', 120.00, true),
('f0000000-0000-0000-0000-000000000006', 'LAB-002', 'Panel VPH 23 Genotipos por PCR Tiempo Real', 'Laboratorio', 'Detección y genotipificación molecular de 14 tipos de alto riesgo y 9 de bajo riesgo oncogénico', 280.00, true),
('f0000000-0000-0000-0000-000000000007', 'PRC-002', 'Biopsia de Cérvix Dirigida por Colposcopía', 'Procedimiento', 'Toma de fragmentos de tejido cervical con pinza Tischler bajo guía óptica + frasco formol', 320.00, true),
('f0000000-0000-0000-0000-000000000008', 'PAQ-001', 'Paquete Chequeo Integral Ginecológico CENDO', 'Paquete', 'Incluye: Consulta + Colposcopía + PAP Base Líquida + Ecografía Transvaginal + Ecografía Mamaria', 650.00, true)
ON CONFLICT (code) DO NOTHING;

-- G. Vademécum Ginecológico Inicial (8 Medicamentos con Marcas Comerciales y Precios Referenciales en Perú)
INSERT INTO public.medications_vademecum (id, generic_name, atc_code, therapeutic_group, commercial_brands, indications, contraindications) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    'Mupirocina 2%',
    'D06AX09',
    'Antibiótico Tópico Dérmico / Vulvar',
    '[
        {"brand_name": "Bactroban", "laboratory": "GSK", "presentation": "Tubo ungüento 15g", "reference_price_pen": 46.50},
        {"brand_name": "Mupax", "laboratory": "Roemmers", "presentation": "Tubo pomada 15g", "reference_price_pen": 38.00},
        {"brand_name": "Mupirocina Genérico", "laboratory": "Portugal / Genfar", "presentation": "Tubo ungüento 15g", "reference_price_pen": 18.50}
    ]'::jsonb,
    'Tratamiento de foliculitis vulvar, forúnculos, piodermitis e infecciones bacterianas cutáneas superficiales de la región perivulvar.',
    'Hipersensibilidad al principio activo o a formulaciones que contengan polietilenglicol en heridas extensas.'
),
(
    '10000000-0000-0000-0000-000000000002',
    'Dienogest 2mg',
    'G03DB08',
    'Progestágeno / Tratamiento de Endometriosis',
    '[
        {"brand_name": "Visannette", "laboratory": "Bayer", "presentation": "Caja x 28 comprimidos", "reference_price_pen": 195.00},
        {"brand_name": "Dienopill", "laboratory": "Medicamenta / Recalcine", "presentation": "Caja x 28 comprimidos", "reference_price_pen": 135.00},
        {"brand_name": "Endometriox", "laboratory": "Siegfried", "presentation": "Caja x 30 tabletas", "reference_price_pen": 142.00}
    ]'::jsonb,
    'Tratamiento médico hormonal de primera línea para la endometriosis sintomática, dolor pélvico crónico y dismenorrea severa.',
    'Enfermedad tromboembólica venosa activa, patología cardiovascular grave, hemorragia vaginal de causa no diagnosticada.'
),
(
    '10000000-0000-0000-0000-000000000003',
    'Ácido Tranexámico 500mg',
    'B02AA02',
    'Antifibrinolítico / Hemostático',
    '[
        {"brand_name": "Amstat", "laboratory": "Medifarma", "presentation": "Caja x 20 tabletas", "reference_price_pen": 68.00},
        {"brand_name": "Tranex", "laboratory": "Maver", "presentation": "Caja x 30 comprimidos", "reference_price_pen": 85.00},
        {"brand_name": "Ácido Tranexámico Genfar", "laboratory": "Sanofi / Genfar", "presentation": "Caja x 20 tabletas", "reference_price_pen": 34.00}
    ]'::jsonb,
    'Manejo del sangrado uterino anormal agudo o crónico, menorragia idiopática o asociada a miomatosis / dispositivo intrauterino.',
    'Hipersensibilidad, trombofilias, historial de trombosis arterial o venosa, insuficiencia renal severa.'
),
(
    '10000000-0000-0000-0000-000000000004',
    'Fluconazol 150mg',
    'J02AC01',
    'Antimicótico Sistémico',
    '[
        {"brand_name": "Diflucan", "laboratory": "Pfizer", "presentation": "Caja x 1 cápsula", "reference_price_pen": 32.00},
        {"brand_name": "Mutum", "laboratory": "Roemmers", "presentation": "Caja x 2 cápsulas", "reference_price_pen": 28.50},
        {"brand_name": "Fluconazol Genérico", "laboratory": "Medifarma / AC Farma", "presentation": "Caja x 2 cápsulas", "reference_price_pen": 9.50}
    ]'::jsonb,
    'Candidiasis vulvovaginal aguda, recurrente o resistente a terapia tópica local.',
    'Co-administración con fármacos que prolonguen el intervalo QT (terfenadina, cisaprida), hepatopatía activa grave.'
),
(
    '10000000-0000-0000-0000-000000000005',
    'Metronidazol 500mg + Miconazol 100mg',
    'G01AF20',
    'Antibacteriano, Antiparasitario y Antimicótico Vaginal',
    '[
        {"brand_name": "Ginedazol", "laboratory": "Roemmers", "presentation": "Caja x 10 óvulos vaginales", "reference_price_pen": 48.00},
        {"brand_name": "Neo-Penotran Forte", "laboratory": "Bayer", "presentation": "Caja x 7 óvulos vaginales", "reference_price_pen": 72.00},
        {"brand_name": "Micospor Met", "laboratory": "Bagó", "presentation": "Caja x 10 óvulos", "reference_price_pen": 42.00}
    ]'::jsonb,
    'Vaginitis mixtas causadas por Trichomonas vaginalis, Gardnerella vaginalis, bacterias anaerobias y Candida albicans.',
    'Primer trimestre del embarazo, consumo concomitante de alcohol (efecto disulfiram), hipersensibilidad a imidazoles.'
),
(
    '10000000-0000-0000-0000-000000000006',
    'Clindamicina 100mg + Ketoconazol 400mg',
    'G01AA51',
    'Terapia Dual Vaginal de Amplio Espectro',
    '[
        {"brand_name": "Vagitrol V", "laboratory": "Armstrong / Siegfried", "presentation": "Caja x 7 óvulos vaginales", "reference_price_pen": 64.00},
        {"brand_name": "Trexen Duo", "laboratory": "Medicamenta", "presentation": "Caja x 7 óvulos", "reference_price_pen": 69.50},
        {"brand_name": "Femisan", "laboratory": "Medifarma", "presentation": "Caja x 7 óvulos", "reference_price_pen": 49.00}
    ]'::jsonb,
    'Vaginosis bacteriana recurrente y vaginitis mixta inespecífica con flora polimicrobiana.',
    'Antecedentes de colitis enterotóxica o colitis asociada a antibióticos, hipersensibilidad a lincosamidas.'
),
(
    '10000000-0000-0000-0000-000000000007',
    'Doxiciclina 100mg',
    'J01AA02',
    'Tetraciclina / Antibacteriano Sistémico',
    '[
        {"brand_name": "Vibramicina", "laboratory": "Pfizer", "presentation": "Caja x 10 cápsulas", "reference_price_pen": 44.00},
        {"brand_name": "Doxipil", "laboratory": "Recalcine", "presentation": "Caja x 14 tabletas", "reference_price_pen": 36.00},
        {"brand_name": "Doxiciclina Genfar", "laboratory": "Genfar", "presentation": "Caja x 10 cápsulas", "reference_price_pen": 14.00}
    ]'::jsonb,
    'Tratamiento de Enfermedad Pélvica Inflamatoria (EPI), cervicitis por Chlamydia trachomatis y Mycoplasma genitalium.',
    'Embarazo, período de lactancia materna, pacientes pediátricos menores de 12 años, insuficiencia hepática severa.'
),
(
    '10000000-0000-0000-0000-000000000008',
    'Naproxeno Sódico 550mg',
    'M01AE02',
    'Antiinflamatorio No Esteroideo (AINE) de Alta Potencia',
    '[
        {"brand_name": "Flanax 550", "laboratory": "Bayer", "presentation": "Caja x 20 tabletas recubiertas", "reference_price_pen": 48.00},
        {"brand_name": "Apronax 550", "laboratory": "Bayer / Aleve", "presentation": "Caja x 24 tabletas", "reference_price_pen": 52.00},
        {"brand_name": "Naproxeno Sódico Genérico", "laboratory": "Portugal / Medifarma", "presentation": "Caja x 20 tabletas", "reference_price_pen": 16.00}
    ]'::jsonb,
    'Tratamiento del dolor pélvico agudo, dismenorrea primaria y dolor post-procedimiento ginecológico (biopsia, colocación de DIU).',
    'Úlcera péptica activa, hemorragia digestiva previa por AINEs, insuficiencia cardíaca descompensada, tercer trimestre de gestación.'
)
ON CONFLICT (id) DO NOTHING;

