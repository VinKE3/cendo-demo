-- ============================================================================
-- CENDO: INSERCIÓN MAESTRA DE DATOS CLÍNICOS REALES PARA TODAS LAS TABLAS
-- ============================================================================
-- Ejecuta este script en el SQL Editor de Supabase para poblar al 100%
-- todas las tablas con la información de los 5 casos clínicos del Dr. Patrick.
-- ============================================================================

-- 0. TABLA: patients (5 Pacientes Oficiales CENDO)
INSERT INTO public.patients (
    id, document_number, document_type, dni, first_name, last_name, full_name, birth_date, age, phone, email, address, district, civil_status, occupation, education_level, birth_place, religion, insurance_info
) VALUES
(
    '10000000-0000-0000-0000-000000000001',
    '73819204',
    'DNI',
    '73819204',
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
    'DNI',
    '75294816',
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
    'DNI',
    '71628493',
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
    'DNI',
    '74195820',
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
    'DNI',
    '09482715',
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
ON CONFLICT (id) DO UPDATE SET
    document_number = EXCLUDED.document_number,
    dni = EXCLUDED.dni,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    civil_status = EXCLUDED.civil_status,
    occupation = EXCLUDED.occupation,
    education_level = EXCLUDED.education_level,
    birth_place = EXCLUDED.birth_place,
    religion = EXCLUDED.religion,
    insurance_info = EXCLUDED.insurance_info,
    updated_at = NOW();

-- 1. TABLA: patient_backgrounds (5 Pacientes)
INSERT INTO public.patient_backgrounds (
  id, patient_id, menarche, sexual_debut_age, sexual_partners_count, catamenial_regimen, sti_history,
  obstetric_formula, contraceptive_method, last_menstrual_period, pap_history, vph_test_history,
  has_diabetes, has_hypertension, has_asthma, medical_allergies, surgeries_history, family_history,
  other_pathologies, notes
) VALUES
(
  '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 12, 18, 2, '28/4', 'Niega ITS',
  'G0 P0000', 'Preservativo de barrera', '2026-10-28', 'Normal (febrero 2025)', 'Negativo 23 genotipos PCR (2025)',
  'Niega', 'Niega', 'Niega', 'Niega alergias a medicamentos', 'Niega cirugías previas', 'Tía materna con quistes ováricos benignos',
  'Niega patologías sistémicas crónicas', 'Paciente acude a chequeo preventivo anual y asesoría para colocación de implante subdérmico LARC.'
),
(
  '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 13, 21, 1, '28/4', 'Niega ITS',
  'G1 P0000', 'Ninguno (Embarazo deseado y planificado)', '2026-09-04', 'Normal (febrero 2026)', 'Negativo (febrero 2026)',
  'Niega antecedente propio / Familiar directo en madre (diabetes gestacional)', 'Niega', 'Niega', 'Niega alergias medicamentosas', 'Niega cirugías previas', 'Madre con antecedente de diabetes gestacional en último parto',
  'Gestante primigesta de 10 semanas de gestación activa', 'Gestante de 10 semanas con control prenatal estructurado en carnet oficial MINSA/CLAP. FPP Naegele: 11/06/2027.'
),
(
  '20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 11, 19, 2, '30/6 (Dismenorrea incapacitante EVA 9/10)', 'Niega ITS',
  'G0 P0000', 'Dienogest 2mg diario continuo (Visannette)', '2026-10-15', 'Normal (agosto 2026)', 'Negativo (agosto 2026)',
  'Niega', 'Niega', 'Niega', 'Alergia comprobada a Penicilina (erupción cutánea)', 'Apendicectomía abierta a los 16 años (2010)', 'Madre y hermana mayor con endometriosis diagnosticada quirúrgicamente',
  'Endometriosis pélvica profunda comprobada por ultrasonido de alta resolución y RMN pélvica. Disquecia y dispareunia profunda.', 'Caso de alta complejidad CENDO. Mapeo protocolizado IDEA positivo para endometrioma ovárico izquierdo de 42 mm y nódulo retrocervical de 12 mm en ligamento uterosacro izquierdo.'
),
(
  '20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 12, 17, 4, '28/5', 'VPH positivo oncogénico detectado en octubre 2026',
  'G1 P0010 (1 aborto espontáneo en 2021)', 'DIU de Cobre (T de Cobre 380A colocado en 2022)', '2026-10-24', 'Anormal (Octubre 2026): LIE-AG / HSIL', 'Positivo Genotipo VPH 16 (Octubre 2026)',
  'Niega', 'Niega', 'Niega', 'Niega alergias', 'Legrado uterino hemostático post-aborto en 2021', 'Abuela materna con cáncer de cuello uterino a los 62 años',
  'Patología cervical premaligna NIC 2 confirmada por biopsia dirigida Tischler.', 'Paciente derivada con PAP anormal y prueba molecular VPH 16 positiva. Requiere conización cervical LEEP ambulatoria.'
),
(
  '20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 13, 20, 1, 'Menopausia establecida (FUM hace 14 meses)', 'Niega ITS',
  'G2 P2002 (2 partos vaginales a término)', 'Quirúrgico (Salpingoclasia bilateral en 2006)', '2025-09-12', 'Atrofia celular sin atipia (noviembre 2026)', 'Negativo (noviembre 2026)',
  'Niega', 'Controlada con Enalapril 10 mg diario', 'Niega', 'Alergia a AINEs tipo Sulfas', 'Salpingoclasia bilateral en 2006; Cesárea no refiere (ambos eutócicos)', 'Madre con osteoporosis severa y fractura de cadera a los 74 años',
  'Síndrome climatérico severo con bochornos vasomotores, insomnio y atrofia urogenital sintomática.', 'Paciente en fase climatérica. Evaluación endometrial y mamaria previa a inicio de terapia de reemplazo hormonal (TRH) y protección ósea.'
)
ON CONFLICT (patient_id) DO UPDATE SET
  menarche = EXCLUDED.menarche,
  sexual_debut_age = EXCLUDED.sexual_debut_age,
  sexual_partners_count = EXCLUDED.sexual_partners_count,
  catamenial_regimen = EXCLUDED.catamenial_regimen,
  sti_history = EXCLUDED.sti_history,
  obstetric_formula = EXCLUDED.obstetric_formula,
  contraceptive_method = EXCLUDED.contraceptive_method,
  last_menstrual_period = EXCLUDED.last_menstrual_period,
  pap_history = EXCLUDED.pap_history,
  vph_test_history = EXCLUDED.vph_test_history,
  has_diabetes = EXCLUDED.has_diabetes,
  has_hypertension = EXCLUDED.has_hypertension,
  has_asthma = EXCLUDED.has_asthma,
  medical_allergies = EXCLUDED.medical_allergies,
  surgeries_history = EXCLUDED.surgeries_history,
  family_history = EXCLUDED.family_history,
  other_pathologies = EXCLUDED.other_pathologies,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- 2. TABLA: medical_consultations (5 Consultas Estructuradas)
INSERT INTO public.medical_consultations (
  id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, consultation_date,
  reason_for_visit, illness_time, symptoms, vital_signs, physical_exam, diagnosis,
  cie10_code, treatment_plan, auxiliary_exams, prescription_notes, next_appointment_date
) VALUES
(
  '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-04',
  'Chequeo ginecológico de rutina y orientación para anticoncepción subdérmica', 'Asintomática', 'Ninguno', '{"bloodPressure":"110/70","heartRate":72,"respiratoryRate":16,"temperature":36.5,"oxygenSaturation":99,"weightKg":54,"heightCm":162,"bmi":20.6}'::jsonb, '{"generalExam":"Paciente en buen estado general, lúcida, colaboradora, normohidratada.","breastsExam":"Mamas simétricas, blandas, depresibles, sin nódulos ni adenopatías palpables.","externalGenitalia":"Genitales externos acordes a edad y sexo, sin lesiones ni condilomas.","speculoscopy":"Cérvix eutrófico, rosado, orificio cervical externo puntiforme, sin sangrado ni flujo anormal.","bimanualPalpation":"Útero en AVF de 7 cm, móvil, no doloroso. Anexos libres sin masas."}'::jsonb, 'Examen ginecológico de rutina / Planificación familiar (CIE-10 Z01.4)',
  'Z01.4', '1. Realización de Colposcopía y Ecografía TV.
2. Inserción de Implante Jadelle bajo anestesia local.
3. Suplementación con Ácido Fólico 0.5 mg diario.', 'Hemograma, glucosa, perfil lipídico y orina completa.', 'Ácido Fólico 0.5 mg y Paracetamol 500 mg condicional.', '2026-12-08'
),
(
  '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-13',
  'Control prenatal de segundo control (10 semanas) y náuseas matutinas', '3 semanas', 'Náuseas matutinas ocasionales, somnolencia, congestión mamaria.', '{"bloodPressure":"110/68","heartRate":78,"respiratoryRate":18,"temperature":36.5,"oxygenSaturation":98,"weightKg":57.8,"heightCm":163,"bmi":21.7}'::jsonb, '{"generalExam":"Gestante orientada en tiempo y espacio, fascie tranquila, mucosas húmedas.","breastsExam":"Mamas turgentes, areolas pigmentadas con tubérculos de Montgomery visibles. Sin masas sospechosas.","externalGenitalia":"Vulva y periné sin alteraciones. Sin pérdidas transvaginales de líquido ni sangre.","speculoscopy":"Cuello con signo de Chadwick leve (coloración violácea gestacional normal), OCE cerrado.","bimanualPalpation":"Útero gestacional aumentado de tamaño acorde a 10 semanas de amenorrea, blando, no doloroso."}'::jsonb, 'Supervisión de embarazo normal de primer trimestre (CIE-10 Z34.0)',
  'Z34.0', '1. Continuar carnet de control prenatal MINSA/CLAP.
2. Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg diario.
3. Dimenhidrinato 50 mg condicional.
4. Programar ecografía genética (semanas 11-14).', 'Revisión de perfil prenatal del 1T (todos normales).', 'Sulfato Ferroso + Ácido Fólico x 30 días, Dimenhidrinato x 5 días.', '2026-12-11'
),
(
  '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-09',
  'Dismenorrea progresiva severa (EVA 9/10), dolor pélvico no menstrual y disquecia', '3 años con empeoramiento progresivo los últimos 6 meses', 'Dolor pélvico lancinante perimenstrual, dispareunia profunda, disquecia catamenial.', '{"bloodPressure":"115/75","heartRate":80,"respiratoryRate":16,"temperature":36.7,"oxygenSaturation":99,"weightKg":59,"heightCm":166,"bmi":21.4}'::jsonb, '{"generalExam":"Paciente quejumbrosa al examen pélvico, lúcida, marcha antálgica leve durante crisis.","breastsExam":"Mamas simétricas de consistencia normal sin nódulos.","externalGenitalia":"Sin lesiones evidentes en vulva o introito.","speculoscopy":"Cérvix desviado hacia la izquierda por retracción cicatrizal, fondo de saco posterior doloroso a la inspección.","bimanualPalpation":"Útero en RVF fija, escasa movilidad por adherencias. Palpación de nódulo doloroso de 1.5 cm en fondo de saco posterior y ligamento uterosacro izquierdo. Ovario izquierdo aumentado y doloroso."}'::jsonb, 'Endometriosis pélvica profunda e infiltrativa y endometrioma ovárico izquierdo (CIE-10 N80.1 / N80.3)',
  'N80.1', '1. Tratamiento médico de supresión con Dienogest 2 mg continuo.
2. Analgesia escalonada con Ketoprofeno 100 mg.
3. Ecografía con mapeo de endometriosis protocolo IDEA.
4. Propuesta de Laparoscopía Quirúrgica Avanzada para excisión completa.', 'Marcador CA-125, perfil hepático, prequirúrgico completo.', 'Dienogest 2mg diario continuo x 3 meses, Ketoprofeno 100mg condicional.', '2026-11-25'
),
(
  '40000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-10',
  'Entrega de resultado de biopsia cervical Tischler (NIC 2) y planificación de cono LEEP', '1 mes desde PAP anormal', 'Asintomática actualmente. Flujo vaginal escaso post-biopsia ya resuelto.', '{"bloodPressure":"120/80","heartRate":74,"respiratoryRate":16,"temperature":36.6,"oxygenSaturation":99,"weightKg":62,"heightCm":165,"bmi":22.8}'::jsonb, '{"generalExam":"Buen estado general, tranquila, comprende la naturaleza de la lesión cervical.","breastsExam":"Mamas simétricas, sin masas ni retracciones.","externalGenitalia":"Genitales normales sin lesiones activas.","speculoscopy":"Cérvix con lecho de biopsias a horas 11 y 1 en proceso de cicatrización adecuado, sin sangrado activo ni signos de infección.","bimanualPalpation":"Útero en AVF, tamaño normal, no doloroso a la movilización cervical. Anexos libres."}'::jsonb, 'Displasia cervical moderada / NIC 2 (CIE-10 N87.1)',
  'N87.1', '1. Programar Conización cervical LEEP con asa diatérmica ambulatoria bajo anestesia local.
2. Óvulos de Clindamicina + Ketoconazol nocturnos x 7 días.
3. Firma de Consentimiento Informado Quirúrgico.', 'Coagulograma completo y riesgo pre-quirúrgico.', 'Clindamicina + Ketoconazol óvulos x 7 noches, Ibuprofeno 400 mg.', '2026-11-19'
),
(
  '40000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-12',
  'Síndrome climatérico severo, sofocos nocturnos intensos, sequedad vaginal y dispareunia', '14 meses', 'Bochornos frecuentes (> 6 al día), insomnio, irritabilidad, marcada resequedad vaginal con dolor al coito.', '{"bloodPressure":"125/82","heartRate":76,"respiratoryRate":16,"temperature":36.6,"oxygenSaturation":98,"weightKg":64.5,"heightCm":158,"bmi":25.8}'::jsonb, '{"generalExam":"Paciente lúcida, colaboradora, mucosas orales húmedas, piel algo adelgazada.","breastsExam":"Mamas con predominio adiposo, sin nódulos sólidos palpables ni secreción por pezón.","externalGenitalia":"Introito con mucosa adelgazada, pálida, pérdida de pliegues vaginales acorde a hipoestrogenismo severo.","speculoscopy":"Paredes vaginales pálidas y lisas. Cérvix pequeño atrófico sin lesiones focales ni sangrado.","bimanualPalpation":"Útero pequeño, atrófico, móvil, indoloro. Ovarios no palpables."}'::jsonb, 'Estados menopáusicos y climatéricos de la mujer / Atrofia vulvovaginal (CIE-10 N95.1)',
  'N95.1', '1. Terapia local con Estriol crema 1 mg/g profunda.
2. Suplemento de Calcio con Vitamina D3.
3. Realización de biopsia Pipelle para confirmar atrofia endometrial antes de TRH sistémica.
4. Control en 3 semanas con reporte histológico.', 'Densitometría ósea, perfil lipídico, mamografía/eco mamaria anual.', 'Estriol crema vaginal x 30g, Citrato de Calcio + Vit D3 x 60 días.', '2026-12-03'
)
ON CONFLICT (id) DO UPDATE SET
  reason_for_visit = EXCLUDED.reason_for_visit,
  vital_signs = EXCLUDED.vital_signs,
  physical_exam = EXCLUDED.physical_exam,
  diagnosis = EXCLUDED.diagnosis,
  treatment_plan = EXCLUDED.treatment_plan,
  updated_at = NOW();

-- 3. TABLA: ultrasound_reports (4 Ecografías Especializadas)
INSERT INTO public.ultrasound_reports (
  id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, report_date,
  ultrasound_type, indication, findings, conclusion, recommendations, images
) VALUES
(
  '50000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-04',
  'TRANSVAGINAL', 'Chequeo ginecológico preventivo y evaluación previa a inserción de implante LARC', '{"uterusPosition":"AVF","uterusDimensions":"72 x 34 x 42 mm","uterusVolumeCc":53.5,"myometriumStatus":"Homogéneo, ecogenicidad conservada, sin nódulos miomatosos ni adenomiosis.","endometriumThicknessMm":6.2,"endometriumPattern":"Trilaminar","rightOvaryDimensions":"28 x 18 x 20 mm (Vol: 5.2 cc)","leftOvaryDimensions":"30 x 19 x 22 mm (Vol: 6.5 cc)","ovariesNotes":"Ambos ovarios con reserva folicular antral acorde a edad (7-8 folículos por corte).","douglasPouch":"Libre, sin líquido libre en cavidad peritoneal."}'::jsonb, 'Ecografía transvaginal dentro de límites normales. Aparato reproductor ginecológico sano.', 'Control ecográfico preventivo en 1 año.', '[{"url":"https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop","caption":"Corte longitudinal de útero en AVF con endometrio trilaminar de 6.2 mm"},{"url":"https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop","caption":"Ovario derecho con folículos antrales fisiológicos normales"}]'::jsonb
),
(
  '50000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-13',
  'OBSTETRICA_1T', 'Control prenatal primer trimestre (Semana 10) - Verificación de viabilidad fetal', '{"gestationalSacsCount":1,"embryoCrownRumpLengthMm":33.8,"gestationalAgeByEcho":"10 semanas 1 día","fetalHeartRate":168,"placentaLocation":"Posterior en desarrollo homogéneo","amnioticFluidIndex":"Normal para la edad gestacional"}'::jsonb, 'Gestación única activa intrauterina de 10 semanas. Vitalidad y morfología fetal temprana conservada.', 'Programar ecografía genética (tamizaje aneuploidías y translucencia nucal) a las 12-13 semanas.', '[{"url":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop","caption":"Embrión único con LCC de 33.8 mm acorde a 10 semanas"},{"url":"https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop","caption":"Doppler espectral con FCF regular de 168 latidos por minuto"}]'::jsonb
),
(
  '50000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-09',
  'PELVICA', 'Mapeo ecográfico especializado de endometriosis profunda (Protocolo IDEA)', '{"uterusPosition":"RVF","uterusDimensions":"78 x 46 x 42 mm","uterusVolumeCc":79,"myometriumStatus":"Heterogéneo, engrosamiento de pared posterior con estrías hipoecoicas (Adenomiosis focal).","endometriumThicknessMm":8.4,"endometriumPattern":"Secretor","rightOvaryDimensions":"38 x 30 x 28 mm (Vol: 16.6 cc)","leftOvaryDimensions":"42 x 34 x 36 mm (Vol: 26.8 cc)","ovariesNotes":"Endometrioma ovárico izquierdo de 42 mm y derecho de 38 mm con ecos internos en vidrio esmerilado. Kissing Ovaries positivo en línea media retrocervical.","douglasPouch":"Signo de deslizamiento (Sliding sign) NEGATIVO en fondo de saco posterior. Nódulo hipoecoico de 12 mm en ligamento uterosacro izquierdo."}'::jsonb, '1. Endometriosis ovárica bilateral severa con Endometriomas y Kissing Ovaries.
2. Endometriosis profunda en ligamento uterosacro izquierdo con adherencia peritoneal.
3. Adenomiosis uterina focal posterior.', 'Valoración pre-quirúrgica para laparoscopía avanzada de excisión de endometriosis profunda.', '[{"url":"https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop","caption":"Endometrioma ovárico izquierdo de 42 mm con ecos en vidrio esmerilado"},{"url":"https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop","caption":"Kissing Ovaries: Ambos ovarios adheridos retrocervicalmente en línea media"}]'::jsonb
),
(
  '50000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-12',
  'MAMA_BILATERAL', 'Despistaje mamario ecográfico anual previo a inicio de TRH climatérica', '{"breastPattern":"Predominio tejido adiposo con islotes fibroglandulares residuales homogéneos.","rightBreastFindings":"A hora 10 radio 3 se visualiza imagen anecoica de 7 x 5 mm, bordes netos, sin vascularización interna, compatible con quiste simple benigno.","leftBreastFindings":"Sin nódulos sólidos, quísticos ni distorsiones de la arquitectura.","biradsCategory":"BI-RADS 2"}'::jsonb, 'Hallazgos ecográficos mamarios benignos. Quiste simple en mama derecha BI-RADS 2.', 'Control mamario habitual en 1 año (Mamografía bilateral complementaria).', '[{"url":"https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop","caption":"Mama derecha radio 10: Quiste simple anecoico de 7 x 5 mm BI-RADS 2"}]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  findings = EXCLUDED.findings,
  conclusion = EXCLUDED.conclusion,
  recommendations = EXCLUDED.recommendations,
  updated_at = NOW();

-- 4. TABLA: minor_procedures (3 Procedimientos & Biopsias)
INSERT INTO public.minor_procedures (
  id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, procedure_date,
  procedure_type, pre_op_diagnosis, post_op_diagnosis, cie10_code, anesthesia_type,
  procedure_details, post_op_indications, medications_prescribed, next_control_date
) VALUES
(
  '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-04',
  'INSERCION_IMPLANTE', 'Deseo de anticoncepción reversible de larga duración (LARC)', 'Inserción exitosa de implante subdérmico Jadelle (2 varillas)', 'Z30.0', 'Local (Lidocaína 2%)',
  '{"asepsisTechnique":"Antisepsia estricta con Clorhexidina al 2% en cara anterointerna de brazo no dominante.","specimenSentToPathology":false,"bleedingAmount":"Mínimo (< 10 ml)","hemostasisMethod":"Compresión","complications":"Sin complicaciones inmediatas. Adecuada palpación subdérmica de ambas varillas."}'::jsonb, 'Mantener vendaje compresivo durante 24 horas. Evitar mojar la zona por 48 horas. Signos de alarma explicados.', 'Paracetamol 500 mg condicional a dolor local.', '2026-12-08'
),
(
  '60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-01',
  'BIOPSIA_CERVICAL', 'Sospecha colposcópica de LIE-AG / NIC 2 en labio anterior', 'Biopsia de cuello uterino dirigida Tischler a horas 11 y 1', 'N87.1', 'Tópica',
  '{"asepsisTechnique":"Colocación de espéculo bivalvo estéril, lavado cervical con SSF y solución de ác. acético al 5%.","biopsySites":"Horas 11:00 y 1:00 sobre epitelio acetoblanco denso","specimenSentToPathology":true,"specimenDescription":"Dos fragmentos tisulares blanquecino-rosáceos de 3x2 mm fijados en formol tamponado al 10%.","bleedingAmount":"Escaso","hemostasisMethod":"Solución de Monsel","complications":"Ninguna. Excelente hemostasia con pasta de Monsel."}'::jsonb, 'Reposo relativo por 24 horas. No duchas vaginales ni relaciones sexuales por 7 días. Acudir con resultado de patología.', 'Ibuprofeno 400 mg cada 8 horas por 2 días si cólico.', '2026-11-10'
),
(
  '60000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-12',
  'BIOPSIA_ENDOMETRIAL', 'Síndrome climatérico en evaluación para TRH / Confirmación de atrofia endometrial', 'Biopsia endometrial por aspiración tipo Pipelle ambulatoria', 'N95.1', 'Sin Anestesia',
  '{"asepsisTechnique":"Limpieza con povidona yodada en cérvix, pinzamiento suave con Pozzi, inserción de cánula Pipelle de 3.1 mm.","biopsySites":"Cavidad endometrial completa por aspiración circunferencial","specimenSentToPathology":true,"specimenDescription":"Escasas hebras mucosas y tisulares endometriales fijadas en formol al 10%.","bleedingAmount":"Mínimo (< 10 ml)","hemostasisMethod":"Compresión","complications":"Molestia leve tipo dismenorrea tolerable de 3 minutos. Sin sangrado activo."}'::jsonb, 'Uso de toalla higiénica por 24 horas por manchado leve esperado. Reposo relativo el día del procedimiento.', 'Paracetamol 500 mg en caso de cólico leve.', '2026-12-03'
)
ON CONFLICT (id) DO UPDATE SET
  procedure_details = EXCLUDED.procedure_details,
  post_op_indications = EXCLUDED.post_op_indications,
  updated_at = NOW();

-- 5. TABLA: medical_appointments (5 Citas Médicas Agendadas)
INSERT INTO public.medical_appointments (
  id, patient_id, doctor_id, doctor_name, appointment_date, appointment_time,
  duration_minutes, appointment_type, reason, status, notes, reminder_sent
) VALUES
(
  '80000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-13', '09:00',
  30, 'CONTROL_GINECOLOGICO', 'Control post-inserción de implante LARC y retiro de apósito compresivo', 'CONFIRMADA', 'Paciente confirmó asistencia por WhatsApp.', TRUE
),
(
  '80000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-13', '10:30',
  45, 'CONTROL_PRENATAL', 'Control prenatal oficial MINSA/CLAP (Semana 10) y ecografía de viabilidad', 'EN_ESPERA', 'Paciente presente en sala de espera de CENDO.', TRUE
),
(
  '80000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-14', '11:30',
  45, 'CONSULTA_PRIMERA_VEZ', 'Evaluación pre-quirúrgica y revisión de riesgo operatorio para laparoscopía', 'PENDIENTE', 'Acudirá con familiares para explicación de la técnica quirúrgica.', FALSE
),
(
  '80000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-15', '15:00',
  60, 'PROCEDIMIENTO_MENOR', 'Conización cervical LEEP ambulatoria con asa diatérmica', 'CONFIRMADA', 'Ayuno de sólidos de 4 horas. Consentimiento informado firmado.', TRUE
),
(
  '80000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-16', '16:30',
  30, 'CHEQUEO_INTEGRAL', 'Control clínico de respuesta a Estriol y reporte de patología endometrial', 'PENDIENTE', 'Traer densitometría ósea original.', FALSE
)
ON CONFLICT (id) DO UPDATE SET
  appointment_date = EXCLUDED.appointment_date,
  appointment_time = EXCLUDED.appointment_time,
  status = EXCLUDED.status,
  updated_at = NOW();

-- 6. TABLA: procedure_quotes (5 Presupuestos Médicos)
INSERT INTO public.procedure_quotes (
  id, patient_id, doctor_id, doctor_name, quote_date, validity_days, items,
  subtotal, discount_total, total, payment_terms, notes
) VALUES
(
  '70000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-04', 30, '[{"procedureId":"tar-8","code":"INS-LARC","name":"Inserción de Implante Subdérmico LARC + Insumos","category":"Procedimiento","regularPrice":450,"discountPercent":0,"finalPrice":450},{"procedureId":"tar-2","code":"COLPO-DX","name":"Colposcopía Digital de Alta Resolución IFCPC","category":"Procedimiento","regularPrice":250,"discountPercent":0,"finalPrice":250},{"procedureId":"tar-1","code":"CONS-ESP","name":"Consulta Médica Ginecológica Especializada","category":"Consulta","regularPrice":180,"discountPercent":16.67,"finalPrice":150}]'::jsonb,
  880, 30, 850, 'Efectivo, Tarjeta de Crédito/Débito, Transferencia BCP / BBVA o Yape / Plin.', 'Paquete promocional integral de chequeo y colocación de implante LARC.'
),
(
  '70000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-05', 45, '[{"procedureId":"tar-10","code":"PAQ-PRENATAL","name":"Paquete de Seguimiento Prenatal Integral (Controles + Ecos 1T/Morfo)","category":"Paquete","regularPrice":1800,"discountPercent":0,"finalPrice":1800}]'::jsonb,
  1800, 0, 1800, 'Pago fraccionado en 3 armadas mensuales o cuotas sin intereses.', 'Incluye todas las atenciones médicas prenatales y ecografías de tamizaje.'
),
(
  '70000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-09', 30, '[{"procedureId":"tar-7","code":"LAPA-ENDO","name":"Cirugía Laparoscópica Ginecológica Avanzada / Escisión Endometriosis Profunda","category":"Procedimiento","regularPrice":7500,"discountPercent":0,"finalPrice":7500}]'::jsonb,
  7500, 0, 7500, 'Convenio con EPS / Cartas de garantía o financiamiento directo CENDO.', 'Presupuesto quirúrgico que incluye honorarios del equipo multidisciplinario (Ginecólogo laparoscopista y cirujano digestivo).'
),
(
  '70000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-10', 30, '[{"procedureId":"tar-6","code":"LEEP-CX","name":"Conización Cervical LEEP / Radiocirugía Ambulatoria con Asa Diatérmica","category":"Procedimiento","regularPrice":1600,"discountPercent":0,"finalPrice":1600}]'::jsonb,
  1600, 0, 1600, 'Contado o tarjeta de crédito hasta 6 cuotas.', 'Incluye procedimiento en sala de operaciones ambulatoria, anestesia local y curación.'
),
(
  '70000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '2026-11-12', 30, '[{"procedureId":"tar-9","code":"BIO-ENDO","name":"Biopsia Endometrial por Aspiración Tipo Pipelle","category":"Procedimiento","regularPrice":380,"discountPercent":0,"finalPrice":380},{"procedureId":"tar-4","code":"ECO-MAMA","name":"Ecografía Mamaria Bilateral con Clasificación BI-RADS","category":"Ecografía","regularPrice":200,"discountPercent":0,"finalPrice":200},{"procedureId":"tar-3","code":"ECO-TV","name":"Ecografía Ginecológica Transvaginal Doppler Color","category":"Ecografía","regularPrice":180,"discountPercent":0,"finalPrice":180},{"procedureId":"tar-1","code":"CONS-ESP","name":"Consulta Médica Ginecológica Especializada","category":"Consulta","regularPrice":180,"discountPercent":0,"finalPrice":180}]'::jsonb,
  940, 0, 940, 'Efectivo o tarjeta.', 'Paquete de estudio y evaluación pre-TRH para menopausia.'
)
ON CONFLICT (id) DO UPDATE SET
  items = EXCLUDED.items,
  total = EXCLUDED.total;

-- 7. TABLA: medical_prescriptions (5 Recetas Inteligentes)
INSERT INTO public.medical_prescriptions (
  id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, prescription_date,
  diagnosis, cie10_code, items, general_indications, next_appointment_date
) VALUES
(
  'a1000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-04',
  'Asesoría y prescripción post-colocación de método anticonceptivo LARC', 'Z30.0', '[{"id":"item-luc-1","medicationName":"Ácido Fólico 0.5 mg","presentation":"Caja x 30 tabletas","route":"Vía Oral","dosage":"0.5 mg (1 tableta)","frequency":"Cada 24 horas (en el desayuno)","duration":"90 días","instructions":"Tomar diariamente con el desayuno para optimización de salud celular y nutricional.","quantity":"3 cajas"},{"id":"item-luc-2","medicationName":"Paracetamol 500 mg","presentation":"Caja x 20 tabletas","route":"Vía Oral","dosage":"500 mg (1 tableta)","frequency":"Cada 8 horas condicional al dolor","duration":"2 días","instructions":"Tomar únicamente si presenta dolor local en el brazo post colocación de implante.","quantity":"1 caja"}]'::jsonb, 'Mantener vendaje seco durante 24 horas tras la inserción del implante Jadelle. Evitar esfuerzos excesivos con el brazo izquierdo.', '2026-12-08'
),
(
  'a1000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-13',
  'Gestación única intrauterina de 10 semanas y emesis gravídica leve', 'Z34.0', '[{"id":"item-fio-1","medicationName":"Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg","presentation":"Caja x 30 tabletas recubiertas","route":"Vía Oral","dosage":"1 tableta (60 mg Fe elemental)","frequency":"Cada 24 horas","duration":"30 días","instructions":"Tomar en ayunas con jugo de naranja o agua. No consumir junto con lácteos ni café.","quantity":"1 caja"},{"id":"item-fio-2","medicationName":"Dimenhidrinato 50 mg","presentation":"Caja x 10 tabletas","route":"Vía Oral","dosage":"50 mg (1 tableta)","frequency":"Cada 8 horas condicional a náuseas severas","duration":"5 días","instructions":"Tomar 30 minutos antes de los alimentos si presenta náuseas intensas.","quantity":"1 caja"}]'::jsonb, 'Fraccionar las comidas en 5 a 6 tomas al día. Mantener hidratación adecuada con pequeños sorbos de agua fría.', '2026-12-11'
),
(
  'a1000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-09',
  'Endometriosis ovárica y pélvica profunda (CIE-10 N80.1 / N80.3)', 'N80.1', '[{"id":"item-gab-1","medicationName":"Dienogest 2 mg (Visannette)","presentation":"Caja x 28 comprimidos","route":"Vía Oral","dosage":"2 mg (1 comprimido)","frequency":"Cada 24 horas continuo (sin descanso)","duration":"84 días (3 cajas x 28 comp)","instructions":"Tomar siempre a la misma hora todos los días para supresión óptima de focos endometriósicos.","quantity":"3 cajas"},{"id":"item-gab-2","medicationName":"Ketoprofeno 100 mg","presentation":"Caja x 20 cápsulas","route":"Vía Oral","dosage":"100 mg (1 cápsula)","frequency":"Cada 8 horas con las comidas","duration":"3 días condicional al dolor severo","instructions":"Tomar con el estómago lleno únicamente durante episodios de dolor agudo.","quantity":"1 caja"},{"id":"item-gab-3","medicationName":"Omeprazol 20 mg","presentation":"Caja x 30 cápsulas","route":"Vía Oral","dosage":"20 mg (1 cápsula)","frequency":"Cada 24 horas en ayunas","duration":"14 días","instructions":"Tomar 30 minutos antes del desayuno como gastroprotector.","quantity":"1 caja"}]'::jsonb, 'Evitar lácteos y alimentos ultraprocesados proinflamatorios. Realizar caminatas suaves. Consultar de urgencia ante dolor intratable.', '2026-11-25'
),
(
  'a1000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-11',
  'Neoplasia intraepitelial cervical NIC 2 / Preparación para LEEP', 'N87.1', '[{"id":"item-dan-1","medicationName":"Clindamicina 100 mg + Ketoconazol 400 mg","presentation":"Caja x 7 óvulos vaginales","route":"Vía Vaginal","dosage":"1 óvulo vaginal","frequency":"Cada 24 horas (al acostarse)","duration":"7 noches","instructions":"Introducir profundamente en la vagina antes de dormir. Abstenerse de relaciones sexuales durante el tratamiento.","quantity":"1 caja"},{"id":"item-dan-2","medicationName":"Ibuprofeno 400 mg","presentation":"Caja x 20 tabletas","route":"Vía Oral","dosage":"400 mg (1 tableta)","frequency":"Cada 8 horas condicional a dolor pélvico","duration":"3 días","instructions":"Tomar con alimentos si presenta molestias tipo cólico post-biopsia.","quantity":"1 caja"}]'::jsonb, 'Completar tratamiento antimicrobiano tópico para acondicionamiento cervical previo al procedimiento quirúrgico LEEP.', '2026-11-19'
),
(
  'a1000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-12',
  'Síndrome climatérico severo y atrofia vulvovaginal', 'N95.1', '[{"id":"item-car-1","medicationName":"Estriol 1 mg/g (Crema Vaginal)","presentation":"Tubo x 30 g con aplicador graduado","route":"Vía Vaginal","dosage":"0.5 g de crema (1 dosis del aplicador)","frequency":"Diario x 2 semanas, luego 2 veces por semana","duration":"60 días","instructions":"Aplicar profundamente por las noches antes de dormir para regeneración epitelial vaginal.","quantity":"1 tubo"},{"id":"item-car-2","medicationName":"Citrato de Calcio 1500 mg + Vitamina D3 800 UI","presentation":"Frasco x 60 tabletas masticables","route":"Vía Oral","dosage":"1 tableta masticable","frequency":"Cada 24 horas","duration":"90 días","instructions":"Tomar junto con el almuerzo para prevención y manejo de pérdida de densidad ósea.","quantity":"2 frascos"}]'::jsonb, 'Usar hidratante vaginal sin hormonas a base de ácido hialurónico según necesidad. Mantener actividad física con pesas suaves para estímulo óseo.', '2026-12-03'
)
ON CONFLICT (id) DO UPDATE SET
  items = EXCLUDED.items,
  general_indications = EXCLUDED.general_indications,
  updated_at = NOW();

-- 8. TABLA: lab_orders (5 Órdenes de Laboratorio)
INSERT INTO public.lab_orders (
  id, patient_id, doctor_id, doctor_name, doctor_cmp, doctor_rne, order_date,
  diagnosis, cie10_code, urgency, items, custom_tests, patient_instructions
) VALUES
(
  'a2000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-04',
  'Chequeo ginecológico preventivo anual', 'Z01.4', 'Rutina', '[{"id":"test-luc-1","category":"Hematología & Bioquímica","testName":"Hemograma Automatizado Completo","sampleType":"Sangre venosa"},{"id":"test-luc-2","category":"Hematología & Bioquímica","testName":"Glucosa basal en ayunas","sampleType":"Sangre venosa"},{"id":"test-luc-3","category":"Hematología & Bioquímica","testName":"Perfil Lipídico Completo (Colesterol, HDL, LDL, Triglicéridos)","sampleType":"Sangre venosa"},{"id":"test-luc-4","category":"Orina & Función Renal","testName":"Examen Completo de Orina + Sedimento","sampleType":"Orina matutina"}]'::jsonb, NULL, 'Ayuno estricto de 8 a 10 horas. Muestra de primera orina de la mañana con asepsia previa.'
),
(
  'a2000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-05',
  'Control prenatal primer trimestre (Semana 10)', 'Z34.0', 'Rutina', '[{"id":"test-fio-1","category":"Hematología & Bioquímica","testName":"Hemograma Completo + Recuento Plaquetario","sampleType":"Sangre venosa"},{"id":"test-fio-2","category":"Perfil Prenatal / Gestacional","testName":"Grupo Sanguíneo y Factor Rh","sampleType":"Sangre venosa"},{"id":"test-fio-3","category":"Hematología & Bioquímica","testName":"Glucosa basal en ayunas","sampleType":"Sangre venosa"},{"id":"test-fio-4","category":"Infeccioso & Microbiología","testName":"Prueba rápida VDRL / RPR","sampleType":"Sangre venosa"},{"id":"test-fio-5","category":"Infeccioso & Microbiología","testName":"Prueba rápida VIH / ELISA 4ta Generación","sampleType":"Sangre venosa"},{"id":"test-fio-6","category":"Orina & Función Renal","testName":"Urocultivo con Antibiograma Automatizado","sampleType":"Orina segundo chorro"},{"id":"test-fio-7","category":"Perfil Hormonal & Ovárico","testName":"TSH Ultrasensible","sampleType":"Sangre venosa"},{"id":"test-fio-8","category":"Infeccioso & Microbiología","testName":"Toxoplasma gondii IgG e IgM","sampleType":"Sangre venosa"}]'::jsonb, NULL, 'Batería prenatal completa estandarizada MINSA. Ayuno de 8 horas.'
),
(
  'a2000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-09',
  'Endometriosis pélvica profunda y endometrioma ovárico', 'N80.1', 'Prioritario', '[{"id":"test-gab-1","category":"Ginecología & Marcadores","testName":"Marcador Tumoral CA-125 sérico","sampleType":"Sangre venosa"},{"id":"test-gab-2","category":"Ginecología & Marcadores","testName":"Marcador Tumoral CA 19-9","sampleType":"Sangre venosa"},{"id":"test-gab-3","category":"Hematología & Bioquímica","testName":"Hemograma Automatizado con Fórmula Leucocitaria","sampleType":"Sangre venosa"},{"id":"test-gab-4","category":"Hematología & Bioquímica","testName":"Tiempo de Protrombina (TP) + INR + TTPa","sampleType":"Sangre con citrato"},{"id":"test-gab-5","category":"Orina & Función Renal","testName":"Urea y Creatinina sérica","sampleType":"Sangre venosa"}]'::jsonb, NULL, 'Evaluación de marcadores endometriósicos y riesgo pre-quirúrgico laparoscópico.'
),
(
  'a2000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-10',
  'Riesgo pre-quirúrgico para Conización LEEP y estudio de biopsia', 'N87.1', 'Prioritario', '[{"id":"test-dan-1","category":"Ginecología & Marcadores","testName":"Estudio Histopatológico de Biopsia de Cérvix","sampleType":"Tejido en formol 10%"},{"id":"test-dan-2","category":"Hematología & Bioquímica","testName":"Coagulograma Completo (TP, INR, TTPa, Fibrinógeno)","sampleType":"Sangre venosa"},{"id":"test-dan-3","category":"Hematología & Bioquímica","testName":"Hemograma Automatizado y Plaquetas","sampleType":"Sangre venosa"},{"id":"test-dan-4","category":"Infeccioso & Microbiología","testName":"Prueba Serológica Rápida VIH 1/2 y Sífilis","sampleType":"Sangre venosa"}]'::jsonb, NULL, 'Estudio pre-quirúrgico obligatorio para procedimiento electroquirúrgico LEEP.'
),
(
  'a2000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero', '61693', '38657', '2026-11-12',
  'Perfil bioquímico, hormonal y de patología en climaterio', 'N95.1', 'Rutina', '[{"id":"test-car-1","category":"Ginecología & Marcadores","testName":"Estudio Histopatológico de Biopsia de Endometrio (Pipelle)","sampleType":"Tejido endometrial en formol"},{"id":"test-car-2","category":"Perfil Hormonal & Ovárico","testName":"FSH (Hormona Folículo Estimulante) + Estradiol (E2)","sampleType":"Sangre venosa"},{"id":"test-car-3","category":"Hematología & Bioquímica","testName":"25-Hidroxi Vitamina D sérica total","sampleType":"Sangre venosa"},{"id":"test-car-4","category":"Hematología & Bioquímica","testName":"Perfil Lipídico Completo y Perfil Hepático (TGO, TGP, FA)","sampleType":"Sangre venosa"}]'::jsonb, NULL, 'Ayuno de 10 a 12 horas. Remitir muestra de biopsia endometrial en frasco estéril con formol al 10%.'
)
ON CONFLICT (id) DO UPDATE SET
  items = EXCLUDED.items,
  patient_instructions = EXCLUDED.patient_instructions,
  updated_at = NOW();

-- 9. TABLA: prenatal_cards (Carnet Gestacional MINSA/CLAP)
INSERT INTO public.prenatal_cards (
  id, patient_id, clinic_establishment, attending_doctor_id, attending_doctor_name,
  baseline, visits, maternal_pathologies
) VALUES
(
  'a3000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 'CENDO - Centro de Endometriosis & Ginecología Especializada', 'doc-patrick-jacinto', 'Dr. Patrick José Jacinto Gomero',
  '{"insuranceType":"PRIVADO","insuranceCode":"RIMAC-75294816","educationLevel":"Superior Univ","civilStatus":"Casada","fatherName":"Mauricio Andrés Chávez Salazar","fatherDni":"44819203","gestas":1,"abortos":0,"partosVaginales":0,"cesareas":0,"nacidosVivos":0,"nacidosMuertos":0,"viven":0,"rnMayorPesoGramos":0,"multipleHistory":false,"pretermHistory":false,"familyHistory":["Madre con diabetes gestacional en último parto"],"personalHistory":["Niega enfermedades crónicas o cirugías previas"],"previousVaccines":{"rubella":true,"hepatitisB":true,"hpv":true,"yellowFever":false},"usualWeightKg":57,"heightCm":163,"bloodGroup":"O","rhFactor":"Rh (+)","smokerCigarettesDay":0,"drugsUse":false,"fum":"2026-09-04","fumDoubt":false,"ultrasoundGestationalAgeWeeks":6,"ultrasoundDate":"2026-10-16","fpp":"2027-06-11","clinicalExam":"Normal","breastsExam":"Normal","cervixExam":"Normal","pelvisExam":"Normal","dentalExam":"Normal","hemoglobin1":12.6,"bloodGlucose1":84,"vdrlRpr1":"No reactivo","hivScreening1":"Negativo","hepatitisBScreening":"Negativo","completeUrineExam":"Normal","urineCulture":"Negativo","papTestResult":"Normal","colposcopyResult":"Normal"}'::jsonb, '[{"visitNumber":1,"visitDate":"2026-10-16","visitTime":"09:30","gestationalAgeWeeks":6,"gestationalAgeDays":0,"maternalWeightKg":57.2,"temperature":36.6,"bloodPressure":"110/70","maternalPulse":74,"uterineHeightCm":0,"fetusSituation":"NA","fetusPresentation":"NA","fetusPosition":"NA","fetalHeartRate":0,"fetalMovements":"NA","proteinuria":"-","edema":"-","tendonReflex":"++","nippleExam":"Formado","ironFolicAcidGiven":true,"calciumGiven":false,"counselingGiven":"Signos de alarma, nutrición materna e inicio de ácido fólico.","ultrasoundGestationalAge":"6 sem por saco gestacional con embrión y LCF presentes.","nextAppointmentDate":"2026-11-13","homeVisit":"No","attendingDoctorName":"Dr. Patrick José Jacinto Gomero","notes":"Captación prenatal temprana exitosa. Gestación intrauterina confirmada."},{"visitNumber":2,"visitDate":"2026-11-13","visitTime":"10:00","gestationalAgeWeeks":10,"gestationalAgeDays":0,"maternalWeightKg":57.8,"temperature":36.5,"bloodPressure":"110/68","maternalPulse":78,"uterineHeightCm":8,"fetusSituation":"NA","fetusPresentation":"NA","fetusPosition":"NA","fetalHeartRate":168,"fetalMovements":"NA","proteinuria":"-","edema":"-","tendonReflex":"++","nippleExam":"Formado","ironFolicAcidGiven":true,"calciumGiven":false,"counselingGiven":"Prevención de anemia, higiene gestacional y manejo de náuseas.","ultrasoundGestationalAge":"10 semanas (LCC 33.8 mm, FCF 168 lpm activo).","nextAppointmentDate":"2026-12-11","homeVisit":"No","attendingDoctorName":"Dr. Patrick José Jacinto Gomero","notes":"Excelente evolución. FCF audible por doppler obstétrico y verificada en eco de control."}]'::jsonb, '[]'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  baseline = EXCLUDED.baseline,
  visits = EXCLUDED.visits,
  updated_at = NOW();

-- 10. TABLA: patient_documents (5 Documentos & PDFs Externos)
INSERT INTO public.patient_documents (
  id, patient_id, document_type, title, file_url, file_name, file_size, mime_type, notes
) VALUES
(
  '30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'LABORATORIO', 'Hemograma y Perfil Lipídico de Chequeo Preventivo - Suiza Lab', 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-luciana-ramos/Analisis_Sanguineo_Luciana_Ramos.pdf', 'Analisis_Sanguineo_Luciana_Ramos.pdf',
  142000, 'application/pdf', 'Hb: 13.5 g/dL, Leucocitos: 6,400, Plaquetas: 245,000, Colesterol Total: 175 mg/dL. Todo dentro de límites óptimos.'
),
(
  '30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'LABORATORIO', 'Perfil Prenatal Integral Primer Trimestre - Laboratorios Roe', 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-fiorella-mendoza/Perfil_Prenatal_Completo_Fiorella_Mendoza.pdf', 'Perfil_Prenatal_Completo_Fiorella_Mendoza.pdf',
  215000, 'application/pdf', 'Hb: 12.6 g/dL, Grupo O Rh (+), Glucosa basal: 84 mg/dL, VDRL No Reactivo, VIH No Reactivo, Urocultivo Negativo.'
),
(
  '30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'INFORME_MEDICO', 'Resonancia Magnética Multiparamétrica de Pelvis - Resomasa', 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-gabriela-paredes/RMN_Pelvica_Endometriosis_Profunda_Gabriela_Paredes.pdf', 'RMN_Pelvica_Endometriosis_Profunda_Gabriela_Paredes.pdf',
  489000, 'application/pdf', 'Informa endometrioma de 4.2 cm en ovario izquierdo y nódulo fibrótico de 1.2 cm en ligamento uterosacro izquierdo con estenosis focal serosa sin infiltración mucosa rectal.'
),
(
  '30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'PATOLOGIA', 'Informe Histopatológico de Biopsia de Cérvix - Oncocenter Patología', 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-daniela-castro/Patologia_Biopsia_Cervical_NIC2_Daniela_Castro.pdf', 'Patologia_Biopsia_Cervical_NIC2_Daniela_Castro.pdf',
  187000, 'application/pdf', 'Diagnóstico histológico: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG). Efecto citopático coilocítico asociado a VPH. Márgenes estromales libres.'
),
(
  '30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'INFORME_MEDICO', 'Densitometría Ósea DEXA Lumbar y Fémur - Centro Diagnóstico San Borja', 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-carmen-huaman/Densitometria_Osea_DEXA_Carmen_Huaman.pdf', 'Densitometria_Osea_DEXA_Carmen_Huaman.pdf',
  312000, 'application/pdf', 'Columna L1-L4: T-score -1.8 (Osteopenia). Cuello femoral: T-score -1.4. Sin criterios de osteoporosis manifiesta.'
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  file_url = EXCLUDED.file_url,
  notes = EXCLUDED.notes;

-- 11. TABLA: word_history_documents (5 Historias Clínicas en Word)
INSERT INTO public.word_history_documents (
  id, patient_id, file_name, file_size, file_url, extracted_text, notes
) VALUES
(
  '90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Historia_Previa_Ginecologia_ClinicaElGolf_LucianaRamos.docx', 42100, 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-luciana-ramos/Historia_Previa_Ginecologia_ClinicaElGolf_LucianaRamos.docx',
  'HISTORIA CLÍNICA GINECOLÓGICA EXTERNA (FORMATO WORD):
Fecha: 15/02/2025
Paciente: Ramos Figueroa, Luciana María (24 años)
Motivo: Control anual. Nuligesta. Ciclos regulares 28/4. No antecedentes patológicos de importancia.
Examen físico: Cérvix sano, orificio puntiforme. Papanicolau de base líquida tomado: Negativo para lesión.
Plan previo: Mantener controles anuales preventivos.', 'Registro clínico previo en Word importado al expediente digital CENDO.'
),
(
  '90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Ficha_Preconcepcional_ClinicaSanBorja_FiorellaMendoza.docx', 48300, 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-fiorella-mendoza/Ficha_Preconcepcional_ClinicaSanBorja_FiorellaMendoza.docx',
  'EVALUACIÓN PRECONCEPCIONAL (FORMATO WORD):
Fecha: 20/05/2026
Paciente: Mendoza Chávez, Fiorella Beatriz (29 años)
Motivo: Deseo de concepción planificada con su cónyuge. G0 P0000.
Antecedentes médicos: Sin antecedentes quirúrgicos. Madre con antecedente de diabetes gestacional en último parto.
Plan anterior: Inicio de suplementación con Ácido Fólico 0.5 mg diario, perfil serológico completo y suspensión de métodos anticonceptivos.', 'Registro preconcepcional previo importado desde Word al expediente digital CENDO.'
),
(
  '90000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Informe_Operatorio_Previo_Apendicectomia_RMN_Paredes.docx', 56400, 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-gabriela-paredes/Informe_Operatorio_Previo_Apendicectomia_RMN_Paredes.docx',
  'HISTORIA CLÍNICA PREVIA Y ANTECEDENTE QUIRÚRGICO (FORMATO WORD):
Fecha: 10/11/2024
Paciente: Paredes Navarro, Gabriela Alejandra (30 años)
Antecedente quirúrgico: Apendicectomía abierta a los 16 años por plastrón apendicular en fosa ilíaca derecha.
Evolución dolorosa: Dismenorrea progresiva y severa desde los 28 años, EVA 8/10 a 9/10, acompañada de disquecia y dolor pélvico no catamenial.
Ecografía externa previa: Reporta quiste en vidrio esmerilado de 3.5 cm en anexo izquierdo sugestivo de endometrioma.', 'Documento de evolución externa y antecedentes quirúrgicos importado en Word para el equipo quirúrgico CENDO.'
),
(
  '90000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Citologias_Anteriores_DanielaCastro.docx', 39800, 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-daniela-castro/Citologias_Anteriores_DanielaCastro.docx',
  'HISTORIAL DE CITOLOGÍAS Y PATOLOGÍA PREVIA (FORMATO WORD):
Fecha: 15/10/2026
Paciente: Castro Villavicencio, Daniela Patricia (34 años)
Resultado Citológico PAP: Lesión intraepitelial escamosa de alto grado (LIE-AG / HSIL).
Prueba de ADN VPH: Positivo para genotipo 16 de alto riesgo oncogénico.
Conducta indicada: Derivación urgente a colposcopía y biopsia dirigida para descartar lesión invasora.', 'Informe de citología inicial de laboratorio externo que motivó la derivación a CENDO.'
),
(
  '90000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Historial_Ginecologico_Climaterio_CarmenHuaman.docx', 44200, 'https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-carmen-huaman/Historial_Ginecologico_Climaterio_CarmenHuaman.docx',
  'FICHA CLÍNICA DE MENOPAUSIA PREVIA (FORMATO WORD):
Fecha: 18/06/2026
Paciente: Huamán Sotomayor, Carmen Rosa (52 años)
Antecedentes obstétricos: G2 P2002. FUM: Setiembre 2025. Salpingoclasia bilateral en 2006.
Motivo: Inicio de bochornos vasomotores y sudoración profusa. Pérdida del sueño reparador.
Antecedentes familiares: Madre con fractura de cadera por osteoporosis severa a los 74 años.
Plan anterior: Suplementación con calcio citrato y estilo de vida.', 'Ficha médica previa de climaterio en formato Word provista por la paciente.'
)
ON CONFLICT (id) DO UPDATE SET
  extracted_text = EXCLUDED.extracted_text,
  notes = EXCLUDED.notes;

-- 12. TABLA: colposcopy_reports (2 Informes IFCPC)
INSERT INTO public.colposcopy_reports (
  id, patient_id, report_date, adequate_colposcopy, squamocolumnar_junction_visible,
  transformation_zone_type, mature_squamous_epithelium, ectopy, thin_acetowhite_epithelium,
  dense_acetowhite_epithelium, irregular_border, fine_mosaic, coarse_mosaic, fine_punctation,
  coarse_punctation, atypical_vessels, schiller_test, cervical_biopsy_taken, biopsy_clock_hours,
  images, diagnosis, plan_recommendations, cie10_code, doctor_name
) VALUES
(
  'a4000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-11-04', TRUE, 'Visible',
  'Tipo 1', TRUE, TRUE, FALSE,
  FALSE, FALSE, FALSE, FALSE, FALSE,
  FALSE, FALSE, 'Negativo (Lugol Caoba homogéneo)', FALSE, '[]'::jsonb,
  '[{"url":"https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop","caption":"Cérvix con SSF: Ectopia periorificial fisiológica leve","timestamp":"2026-11-04 10:45"},{"url":"https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop","caption":"Ácido acético al 5%: Sin cambios acetoblancos patológicos","timestamp":"2026-11-04 10:48"},{"url":"https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop","caption":"Detalle de ZT Tipo 1 completamente visible","timestamp":"2026-11-04 10:51"},{"url":"https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop","caption":"Test de Schiller: Captación homogénea caoba (Negativo)","timestamp":"2026-11-04 10:54"}]'::jsonb, 'Colposcopía adecuada satisfactoria. Zona de transformación Tipo 1. Sin evidencia de atipia colposcópica.', 'Control citológico ginecológico preventivo en 1 año. Proceder con colocación de método anticonceptivo LARC.', 'Z01.4', 'Dr. Patrick José Jacinto Gomero'
),
(
  'a4000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', '2026-11-01', TRUE, 'Visible',
  'Tipo 2', FALSE, TRUE, FALSE,
  TRUE, FALSE, FALSE, TRUE, FALSE,
  TRUE, FALSE, 'Positivo (Yodo negativo - Amarillo mostaza)', TRUE, '["11","1"]'::jsonb,
  '[{"url":"https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop","caption":"Ácido acético al 5%: Epitelio acetoblanco denso en labio anterior con mosaico grueso","timestamp":"2026-11-01 11:15"},{"url":"https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop","caption":"Test de Schiller: Defecto de captación yodo-negativo mostaza a horas 11 a 1","timestamp":"2026-11-01 11:18"}]'::jsonb, 'Hallazgos colposcópicos anormales Grado 2 (Mayores) IFCPC 2011 / Sospecha de LIE-AG (NIC 2)', 'Biopsia cervical dirigida Tischler tomada a horas 11 y 1 enviada a patología. Plan de Conización LEEP ambulatoria según resultado histopatológico.', 'N87.1', 'Dr. Patrick José Jacinto Gomero'
)
ON CONFLICT (id) DO UPDATE SET
  diagnosis = EXCLUDED.diagnosis,
  plan_recommendations = EXCLUDED.plan_recommendations;

-- 13. TABLA: clinical_checkups (3 Chequeos Preventivos)
INSERT INTO public.clinical_checkups (
  id, patient_id, checkup_date, reason_for_consultation, breast_ultrasound_findings,
  breast_ultrasound_birads, breast_lesion_measurements, transvaginal_ultrasound_findings,
  uterus_measurements, endometrium_thickness_mm, ovaries_findings, pap_result, vph_result,
  conclusions, medical_prescription
) VALUES
(
  'a5000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '2026-11-04', 'Chequeo ginecológico y mamario preventivo anual', 'Patrón ecográfico mamario bilateral homogéneo fibroglandular. Sin nódulos sólidos, quísticos ni microcalcificaciones sospechosas. Axilas libres.',
  'BI-RADS 1 (Negativo a malignidad)', 'Sin lesiones focales', 'Útero en AVF de 65 x 35 x 42 mm, miometrio homogéneo de ecogenicidad conservada. Endometrio fino regular trilaminar de 6.2 mm. Ovarios normales con folículos antrales fisiológicos.',
  '65 x 35 x 42 mm (Vol: 50 cc)', 6.2, 'Ovario derecho 28 x 18 mm. Ovario izquierdo 30 x 20 mm. Ambos con ecotextura normal.', 'Normal (Negativo para lesión intraepitelial o malignidad)', 'Negativo para 23 genotipos',
  'Chequeo ginecológico y mamario preventivo dentro de límites normales. Apta para LARC.', '1. Ácido Fólico 0.5 mg diario.
2. Cuidados post-inserción de implante Jadelle.'
),
(
  'a5000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', '2026-11-09', 'Dismenorrea severa progresiva (EVA 9/10), dispareunia profunda y evaluación de endometriosis', 'Mamas fibroglandulares normales sin alteraciones ecográficas. Regiones axilares normales sin adenopatías.',
  'BI-RADS 1 (Negativo a malignidad)', 'Sin lesiones mamarias', 'Útero en retroversoflexión fija de 78 x 46 x 42 mm. Miometrio heterogéneo con áreas focales hipoecoicas en pared posterior compatibles con adenomiosis. Endometrio regular de 8.4 mm. Ovario derecho con endometrioma unilocular de 38 x 30 mm. Ovario izquierdo con endometrioma de 42 mm. Ambos adheridos en línea media posterior (Kissing Ovaries).',
  '78 x 46 x 42 mm (Vol: 79 cc)', 8.4, 'Endometrioma ovárico izquierdo de 42 mm y derecho de 38 mm. Kissing Ovaries positivo.', 'Normal (Negativo para neoplasia)', 'Negativo',
  '1. Endometriosis ovárica bilateral severa estadio IV (Kissing Ovaries).
2. Adenomiosis uterina posterior focal.
3. Dismenorrea secundaria severa y dolor pélvico crónico.', '1. Dienogest 2mg diario continuo x 6 meses.
2. Ketoprofeno condicional al dolor severo.
3. Evaluación pre-quirúrgica para laparoscopía avanzada.'
),
(
  'a5000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000005', '2026-11-12', 'Evaluación integral de climaterio, bochornos vasomotores y atrofia urogenital', 'Mamas con involución adiposa moderada. Mama derecha presenta quiste simple anecoico de paredes finas de 7 x 5 mm a hora 10 radio 3. Sin nódulos sólidos ni calcificaciones sospechosas.',
  'BI-RADS 2 (Benigno - Quiste simple)', 'Quiste simple mama derecha 7 x 5 mm', 'Útero en AVF de 58 x 28 x 34 mm (involución climatérica fisiológica). Endometrio fino atrófico lineal homogéneo de 2.4 mm (normal en postmenopausia < 4 mm). Ovarios atróficos bilaterales sin formaciones expansivas.',
  '58 x 28 x 34 mm (Vol: 29 cc)', 2.4, 'Ovario derecho 18 x 10 mm. Ovario izquierdo 16 x 9 mm. Ambos de aspecto atrófico fisiológico.', 'Frotis atrófico con flora disminuida, negativo para malignidad', 'Negativo',
  '1. Síndrome climatérico y menopausia establecida.
2. Endometrio atrófico normal (2.4 mm) apto para TRH.
3. Quiste simple mama derecha BI-RADS 2.
4. Atrofia vulvovaginal sintomática.', '1. Estriol crema vaginal 1 mg/g.
2. Citrato de Calcio 1500 mg + Vitamina D3 800 UI diario.
3. Densitometría ósea de control.'
)
ON CONFLICT (id) DO UPDATE SET
  conclusions = EXCLUDED.conclusions,
  medical_prescription = EXCLUDED.medical_prescription;

-- 14. TABLA: procedures_tariff (10 Tarifas Oficiales)
INSERT INTO public.procedures_tariff (
  id, code, name, category, description, price, active
) VALUES
(
  'c1000000-0000-0000-0000-000000000001', 'CONS-ESP', 'Consulta Médica Ginecológica Especializada', 'Consulta', 'Evaluación integral por especialista en ginecología y cirugía mínimamente invasiva.', 180, TRUE
),
(
  'c1000000-0000-0000-0000-000000000002', 'COLPO-DX', 'Colposcopía Digital de Alta Resolución IFCPC con Test de Ácido Acético y Schiller', 'Procedimiento', 'Evaluación colposcópica completa con videocámara HD, captura fotográfica y reporte oficial.', 250, TRUE
),
(
  'c1000000-0000-0000-0000-000000000003', 'ECO-TV', 'Ecografía Ginecológica Transvaginal Doppler Color', 'Ecografía', 'Estudio ultrasonográfico de alta definición para útero, miometrio, endometrio y reserva ovárica.', 180, TRUE
),
(
  'c1000000-0000-0000-0000-000000000004', 'ECO-MAMA', 'Ecografía Mamaria Bilateral con Clasificación BI-RADS', 'Ecografía', 'Mapeo ecográfico de ambas mamas y huecos axilares por cuadrantes.', 200, TRUE
),
(
  'c1000000-0000-0000-0000-000000000005', 'BIO-CX', 'Biopsia de Cérvix Dirigida Tischler + Acondicionamiento de Muestra', 'Procedimiento', 'Toma de tejido cervical bajo visión colposcópica directa con hemostasia local.', 320, TRUE
),
(
  'c1000000-0000-0000-0000-000000000006', 'LEEP-CX', 'Conización Cervical LEEP / Radiocirugía Ambulatoria con Asa Diatérmica', 'Procedimiento', 'Escisión electroquirúrgica de la zona de transformación bajo anestesia local en sala de procedimientos.', 1600, TRUE
),
(
  'c1000000-0000-0000-0000-000000000007', 'LAPA-ENDO', 'Cirugía Laparoscópica Ginecológica Avanzada / Escisión de Endometriosis Profunda', 'Procedimiento', 'Intervención quirúrgica mínimamente invasiva de alta especialidad para erradicación de endometriosis.', 7500, TRUE
),
(
  'c1000000-0000-0000-0000-000000000008', 'INS-LARC', 'Inserción de Implante Subdérmico LARC (Jadelle / Implanon) + Insumos', 'Procedimiento', 'Colocación subdérmica bajo anestesia local con técnica aséptica y apósito compresivo.', 450, TRUE
),
(
  'c1000000-0000-0000-0000-000000000009', 'BIO-ENDO', 'Biopsia Endometrial por Aspiración Tipo Pipelle', 'Procedimiento', 'Toma de muestra de cavidad endometrial ambulatoria con cánula de Pipelle sin dilatación.', 380, TRUE
),
(
  'c1000000-0000-0000-0000-000000000010', 'PAQ-PRENATAL', 'Paquete de Seguimiento Prenatal Integral (Controles + Ecos 1T/Morfo)', 'Paquete', 'Monitoreo materno-fetal completo protocolizado MINSA/CLAP con ecografías de control.', 1800, TRUE
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price;

-- 15. TABLA: medications_vademecum (6 Principios Activos & Marcas)
INSERT INTO public.medications_vademecum (
  id, generic_name, atc_code, therapeutic_group, commercial_brands, indications, contraindications
) VALUES
(
  'c2000000-0000-0000-0000-000000000001', 'Dienogest 2 mg', 'G03DB08', 'Progestágenos / Tratamiento de Endometriosis', '[{"brandName":"Visannette","laboratory":"Bayer","presentation":"Caja x 28 comprimidos","referencePricePen":215},{"brandName":"Dienopill","laboratory":"Bagó","presentation":"Caja x 30 comprimidos","referencePricePen":145}]'::jsonb, 'Tratamiento de la endometriosis ovárica y pélvica profunda, dismenorrea severa asociada.', 'Trastorno tromboembólico venoso activo, enfermedad hepática severa, hemorragia vaginal no filiada.'
),
(
  'c2000000-0000-0000-0000-000000000002', 'Clindamicina 100 mg + Ketoconazol 400 mg (Óvulos)', 'G01AF20', 'Antiinfecciosos ginecológicos combinados', '[{"brandName":"Ginedazol Dual","laboratory":"Roemmers","presentation":"Caja x 7 óvulos","referencePricePen":68},{"brandName":"Tricomax","laboratory":"Farmindustria","presentation":"Caja x 7 óvulos","referencePricePen":54}]'::jsonb, 'Vaginitis mixta, preparación antiséptica prequirúrgica cervical.', 'Hipersensibilidad a clindamicina o derivados imidazólicos.'
),
(
  'c2000000-0000-0000-0000-000000000003', 'Estriol 1 mg/g (Crema Vaginal)', 'G03CA04', 'Estrógenos tópicos urogenitales', '[{"brandName":"Ovestin","laboratory":"Aspen","presentation":"Tubo x 30 g + aplicador","referencePricePen":110},{"brandName":"Colpotrophine","laboratory":"Theramex","presentation":"Tubo x 30 g","referencePricePen":95}]'::jsonb, 'Atrofia vulvovaginal por deficiencia estrogénica en peri y postmenopausia.', 'Cáncer de mama o estrógeno-dependiente sospechado o confirmado, sangrado no diagnosticado.'
),
(
  'c2000000-0000-0000-0000-000000000004', 'Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg', 'B03AE02', 'Antianémicos y Suplementos Prenatales', '[{"brandName":"Feranin Fol","laboratory":"Takeda","presentation":"Caja x 30 tabletas","referencePricePen":48},{"brandName":"Maltofer Fol","laboratory":"Vifor Pharma","presentation":"Caja x 30 comprimidos","referencePricePen":82}]'::jsonb, 'Profilaxis y tratamiento de anemia por deficiencia de hierro durante la gestación.', 'Hemocromatosis, hemosiderosis, anemia hemolítica.'
),
(
  'c2000000-0000-0000-0000-000000000005', 'Levonorgestrel 75 mg (Implante Subdérmico Jadelle x 2 varillas)', 'G03AC03', 'Anticonceptivos de larga duración (LARC)', '[{"brandName":"Jadelle","laboratory":"Bayer Healthcare","presentation":"Caja con 2 implantes subdérmicos + trocar","referencePricePen":420}]'::jsonb, 'Anticoncepción de larga duración hasta por 5 años continuos.', 'Embarazo conocido o sospechado, enfermedad arterial severa activa.'
),
(
  'c2000000-0000-0000-0000-000000000006', 'Ketoprofeno 100 mg', 'M01AE03', 'Antiinflamatorios No Esteroides (AINEs)', '[{"brandName":"Profenid","laboratory":"Sanofi","presentation":"Caja x 20 cápsulas","referencePricePen":52}]'::jsonb, 'Dolor pélvico agudo, dismenorrea severa secundaria a endometriosis.', 'Úlcera péptica activa, insuficiencia renal grave, alergia a AINEs.'
)
ON CONFLICT (id) DO UPDATE SET
  commercial_brands = EXCLUDED.commercial_brands,
  indications = EXCLUDED.indications;
