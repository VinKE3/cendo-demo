-- ============================================================================
-- CENDO: MIGRACIÓN TABLA DE PLANTILLAS Y FORMATOS DE LABORATORIO / PATOLOGÍA
-- Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.lab_order_templates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'General',
    template_type TEXT NOT NULL DEFAULT 'CUSTOM',
    sample_type TEXT NOT NULL DEFAULT '',
    fixative_transport TEXT NOT NULL DEFAULT '',
    suggested_diagnosis TEXT NOT NULL DEFAULT '',
    cie10_code VARCHAR(15),
    default_tests JSONB NOT NULL DEFAULT '[]'::jsonb,
    clinical_notes TEXT,
    is_official BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.lab_order_templates DISABLE ROW LEVEL SECURITY;

-- 5 Plantillas Oficiales CENDO
INSERT INTO public.lab_order_templates (
  id, title, category, template_type, sample_type, fixative_transport,
  suggested_diagnosis, cie10_code, default_tests, clinical_notes, is_official
) VALUES
(
  'tmpl-pap-cervicovaginal',
  'Citología Cervicovaginal / Papanicolaou (ThinPrep & Convencional)',
  'Citología & Cérvix',
  'PAP',
  'Exocérvix y cepillado endocervical en medio líquido PreservCyt / Frotis fijado',
  'Vial PreservCyt ThinPrep / Spray fijador citológico en lámina portaobjetos',
  'Despistaje ginecológico preventivo / Sospecha de lesión intraepitelial',
  'Z01.4',
  '["Citología en Base Líquida (ThinPrep Pap Test)", "Evaluación citomorfológica según Sistema Bethesda 2014", "Identificación de flora bacteriana / agentes infecciosos (Döderlein, Gardnerella, Cándida, Trichomonas)", "Evaluación hormonal del frotis citológico (trofismo epitelial)"]'::jsonb,
  'Abstinencia sexual 48 horas previas. Sin sangrado menstrual activo. No haber aplicado óvulos ni duchas vaginales 48 horas antes de la toma de muestra.',
  true
),
(
  'tmpl-biopsia-patologia',
  'Biopsia Quirúrgica / Histopatología (Cérvix, Endometrio, Cono LEEP, Pólipos)',
  'Anatomía Patológica',
  'BIOPSIA',
  'Tejido en cuña cervical / Fragmentos endometriales / Pieza quirúrgica LEEP',
  'Formol neutro tamponado al 10% (volumen formol:tejido mínimo 10:1) en frasco hermético estéril',
  'Displasia cervical moderada / Pólipo / Hiperplasia endometrial',
  'N87.1',
  '["Estudio histopatológico con inclusión en parafina y tinción Hematoxilina-Eosina (H&E)", "Evaluación de márgenes quirúrgicos endocervicales y ectocervicales", "Evaluación de profundidad estromal y compromiso vascular o linfático", "Inmunohistoquímica p16 / Ki-67 en caso de displasia sospechosa de alto grado"]'::jsonb,
  'Rotulación clara del frasco con nombres, DNI, fecha y cuadrante/hora de reloj de toma. Fijación inmediata en formol tamponado para evitar autólisis celular.',
  true
),
(
  'tmpl-biopsia-trucut-mama',
  'Biopsia Mamaria Percutánea con Aguja Gruesa (Tru-Cut Core Biopsy)',
  'Patología Mamaria',
  'TRUCUT',
  'Cilindros tisulares mamarios (calibre 14G / 16G, 3 a 5 fragmentos intactos)',
  'Formol neutro tamponado al 10% con inmersión inmediata',
  'Nódulo / Masa mamaria sospechosa (BI-RADS 4/5)',
  'N63',
  '["Estudio histopatológico estándar con tinción H&E de cilindros mamarios", "Clasificación histológica (Carcinoma ductal infiltrante, lobulillar, fibroadenoma, etc.)", "Grado histológico de Nottingham / Bloom-Richardson", "Panel de Inmunohistoquímica Mamaria: Receptores de Estrógeno (RE), Progesterona (RP), HER2 y Ki-67 (en caso de malignidad)"]'::jsonb,
  'Indicar radio horario (horas 1 a 12), distancia al pezón en cm, cuadrante y mama (Izquierda/Derecha). Acompañar informe ecográfico BI-RADS.',
  true
),
(
  'tmpl-panel-its-pcr',
  'Panel Molecular de ITS Multiplex por PCR en Tiempo Real (7 Patógenos)',
  'Biología Molecular',
  'ITS',
  'Hisopado endocervical / vaginal profundo en medio de transporte molecular (o primera fracción de orina)',
  'Tubo con medio de lisis y transporte molecular para ADN/ARN a 2°C - 8°C',
  'Cervicitis mucopurulenta / Síndrome de flujo vaginal recidivante / ITS',
  'A56.0',
  '["Chlamydia trachomatis por PCR en tiempo real", "Neisseria gonorrhoeae por PCR en tiempo real", "Mycoplasma genitalium por PCR en tiempo real", "Mycoplasma hominis por PCR en tiempo real", "Ureaplasma urealyticum / Ureaplasma parvum por PCR en tiempo real", "Trichomonas vaginalis por PCR en tiempo real", "Herpes Simplex Virus Tipo 1 y Tipo 2 (HSV-1 / HSV-2) por PCR"]'::jsonb,
  'Muestra recolectada sin lubricante ni antisépticos previos. Transporte refrigerado con cadena de frío garantizada.',
  true
),
(
  'tmpl-liquido-peritoneal',
  'Estudio Citoquímico, Bloque Celular y Marcadores de Líquido Peritoneal',
  'Fluidos Corporales & Laparoscopía',
  'PERITONEAL',
  'Líquido peritoneal / lavado peritoneal obtenido por laparoscopía o paracentesis (20-50 mL)',
  'Frasco estéril con heparina (evita coágulos) para citología + tubo seco estéril para bioquímica',
  'Endometriosis pélvica profunda / Ascitis en estudio / Masa pélvica',
  'N80.3',
  '["Examen citoquímico: Recuento celular total y diferencial, Glucosa, Proteínas totales, Albúmina, LDH, GASA", "Citología oncológica con técnica de Bloque Celular (Cell Block) para células atípicas", "Marcador tumoral CA-125 cuantitativo en líquido peritoneal", "Frotis con tinción Gram y cultivo aerobio/anaerobio + antibiograma", "Tinción de Ziehl-Neelsen / GeneXpert para Mycobacterium tuberculosis en fluido peritoneal"]'::jsonb,
  'Envío inmediato al laboratorio dentro de las 2 horas post-punción. Indicar sospecha clínica de endometriosis pélvica o masa ovárica.',
  true
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  template_type = EXCLUDED.template_type,
  sample_type = EXCLUDED.sample_type,
  fixative_transport = EXCLUDED.fixative_transport,
  suggested_diagnosis = EXCLUDED.suggested_diagnosis,
  cie10_code = EXCLUDED.cie10_code,
  default_tests = EXCLUDED.default_tests,
  clinical_notes = EXCLUDED.clinical_notes,
  is_official = EXCLUDED.is_official,
  updated_at = NOW();
