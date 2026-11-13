const { createClient } = require('@supabase/supabase-js');

const url = 'https://zfyfyeezztaqrzfpogiv.supabase.co';
const key = 'sb_publishable_8pr-mRhpaaxTqEQrSfVQNg_1H9glBtS';
const supabase = createClient(url, key);

async function runReset() {
  console.log('--- INICIANDO PURGA DE DATOS DEMO ANTERIORES EN SUPABASE ---');

  // 1. Borrar todas las tablas dependientes primero
  const tablesToClear = [
    'colposcopy_reports',
    'clinical_checkups',
    'medical_prescriptions',
    'lab_orders',
    'prenatal_cards',
    'patient_backgrounds',
    'patients'
  ];

  for (const table of tablesToClear) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error(`Error limpiando ${table}:`, error.message);
    else console.log(`✓ Tabla ${table} limpiada correctamente.`);
  }

  // 2. Insertar los 5 Nuevos Pacientes
  console.log('\n--- INSERTANDO 5 NUEVOS PACIENTES EN SUPABASE ---');
  const newPatients = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      document_type: 'DNI',
      document_number: '73819204',
      full_name: 'RAMOS FIGUEROA, LUCIANA MARÍA',
      birth_date: '2001-03-15',
      phone: '984 125 639',
      email: 'luciana.ramos@email.com',
      address: 'Av. Pardo y Aliaga 640, Dpto 302',
      district: 'San Isidro',
      insurance_info: 'PACIFICO EPS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      document_type: 'DNI',
      document_number: '75294816',
      full_name: 'MENDOZA CHÁVEZ, FIORELLA BEATRÍZ',
      birth_date: '1996-08-22',
      phone: '976 543 218',
      email: 'fiorella.mendoza@email.com',
      address: 'Calle Coronel Inclán 320, Dpto 402',
      district: 'Miraflores',
      insurance_info: 'RIMAC EPS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      document_type: 'DNI',
      document_number: '71628493',
      full_name: 'PAREDES NAVARRO, GABRIELA ALEJANDRA',
      birth_date: '1994-11-05',
      phone: '992 837 465',
      email: 'gabriela.paredes@email.com',
      address: 'Av. Reducto 1250, Miraflores',
      district: 'Miraflores',
      insurance_info: 'Particular / SANITAS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000004',
      document_type: 'DNI',
      document_number: '74195820',
      full_name: 'CASTRO VILLAVICENCIO, DANIELA PATRICIA',
      birth_date: '1992-06-18',
      phone: '981 456 723',
      email: 'daniela.castro@email.com',
      address: 'Malecón Balta 890, Miraflores',
      district: 'Miraflores',
      insurance_info: 'Particular',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '10000000-0000-0000-0000-000000000005',
      document_type: 'DNI',
      document_number: '09482715',
      full_name: 'HUAMÁN SOTOMAYOR, CARMEN ROSA',
      birth_date: '1974-04-10',
      phone: '963 852 741',
      email: 'carmen.huaman@email.com',
      address: 'Calle Esperanza 245, Miraflores',
      district: 'Miraflores',
      insurance_info: 'PACIFICO EPS',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  const { error: patErr } = await supabase.from('patients').upsert(newPatients, { onConflict: 'document_number' });
  if (patErr) console.error('Error insertando pacientes:', patErr.message);
  else console.log('✓ 5 Pacientes creados exitosamente en tabla patients.');

  // 3. Insertar Antecedentes (patient_backgrounds)
  console.log('\n--- INSERTANDO ANTECEDENTES CLÍNICOS ---');
  const newBackgrounds = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      menarche_age: 12,
      dysmenorrhea: 'Leve',
      sexual_partners_count: '2',
      irs_age: '18',
      fur_date: '2026-10-28',
      catamenial_regime: '4/28',
      obstetric_formula: 'G0 P0000',
      deliveries: [],
      mac_method: 'Preservativo de barrera',
      last_pap_year: '2025',
      last_pap_result: 'Normal',
      vph_test_result: 'Negativo',
      vph_serotype: 'Negativo',
      clinical_flags: { motivo: 'Chequeo preventivo anual y asesoría anticonceptiva' },
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      menarche_age: 13,
      dysmenorrhea: 'Leve',
      sexual_partners_count: '1',
      irs_age: '21',
      fur_date: '2026-09-04',
      catamenial_regime: '5/28',
      obstetric_formula: 'G1 P0000',
      deliveries: [],
      mac_method: 'Ninguno (Gestante)',
      last_pap_year: '2026',
      last_pap_result: 'Normal',
      vph_test_result: 'Negativo',
      vph_serotype: 'Negativo',
      clinical_flags: { prenatal: true, semanas: 10, fpp: '2027-06-11' },
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      menarche_age: 11,
      dysmenorrhea: 'Severa invalidante (EVA 9/10)',
      sexual_partners_count: '2',
      irs_age: '19',
      fur_date: '2026-10-22',
      catamenial_regime: '6/26',
      obstetric_formula: 'G0 P0000',
      deliveries: [],
      mac_method: 'Ninguno',
      last_pap_year: '2026',
      last_pap_result: 'Normal',
      vph_test_result: 'Negativo',
      vph_serotype: 'Negativo',
      clinical_flags: { endometriosis_miomas: true, otros: 'Endometrioma ovárico bilateral kissing ovaries' },
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000004',
      menarche_age: 13,
      dysmenorrhea: 'Moderada',
      sexual_partners_count: '3',
      irs_age: '17',
      fur_date: '2026-10-30',
      catamenial_regime: '5/28',
      obstetric_formula: 'G2 P1011',
      deliveries: ['Parto eutócico 2021'],
      mac_method: 'Preservativo',
      last_pap_year: '2026',
      last_pap_result: 'LIE-AG (Lesión de Alto Grado / NIC 2)',
      vph_test_result: 'Positivo',
      vph_serotype: 'VPH 16 Positivo',
      clinical_flags: { colposcopia_anormal: true, biopsia: true },
      updated_at: new Date().toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000005',
      menarche_age: 12,
      dysmenorrhea: 'No aplica (Menopausia)',
      sexual_partners_count: '1',
      irs_age: '20',
      fur_date: '2025-09-10',
      catamenial_regime: 'Menopausia (14 meses amenorrea)',
      obstetric_formula: 'G2 P2002',
      deliveries: ['2 partos vaginales normales'],
      mac_method: 'Quirúrgico / Salpingoclasia',
      last_pap_year: '2025',
      last_pap_result: 'Normal / Atrofia',
      vph_test_result: 'Negativo',
      vph_serotype: 'Negativo',
      clinical_flags: { menopausia: true, bochornos: true, atrofia: true },
      updated_at: new Date().toISOString()
    }
  ];
  const { error: bgErr } = await supabase.from('patient_backgrounds').upsert(newBackgrounds, { onConflict: 'id' });
  if (bgErr) console.error('Error insertando backgrounds:', bgErr.message);
  else console.log('✓ 5 Antecedentes clínicos creados exitosamente.');

  // 4. Insertar Colposcopías
  console.log('\n--- INSERTANDO COLFOSCOPÍAS ---');
  const newColposcopies = [
    {
      id: '30000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      evaluation_date: '2026-11-04',
      evaluator_name: 'DR. PATRICK JOSÉ JACINTO GOMERO',
      fur_date: '2026-10-28',
      obstetric_formula: 'G0 P0000',
      mac_method: 'Preservativo',
      pap_result: 'Normal',
      vph_test_result: 'Negativo',
      vph_serotype: 'Negativo',
      general_eval: { colposcopia: 'Adecuada', visibilidad_uec: 'Visible', zona_transformacion: 'Tipo 1' },
      normal_findings: { ectopia: 'Sí', epitelio_escamoso_maduro: 'Sí', deciduosis_embarazo: 'No', quiste_naboth: 'No', aberturas_glandulares: 'No' },
      abnormal_grade1: { mosaico_fino: 'No', puntillado_fino: 'No', borde_irregular: 'No', epitelio_acetoblanco_delgado: 'No' },
      abnormal_grade2: { mosaico_grueso: 'No', puntillado_grueso: 'No', epitelio_acetoblanco_denso: 'No' },
      non_specific_findings: { solucion_lugol_schiller: 'Negativo (Lugol Caoba homogéneo)' },
      biopsy_taken: 'NO',
      biopsy_clock_points: [],
      biopsy_quadrants: [],
      diagnostics: ['COLPOSCOPÍA ADECUADA SATISFACTORIA', 'ZONA DE TRANSFORMACIÓN TIPO 1', 'SIN EVIDENCIA DE LESIÓN INTRAEPITELIAL'],
      suggestion: 'Control citológico preventivo en 1 año.',
      images_urls: [],
      created_at: new Date().toISOString()
    },
    {
      id: '30000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000004',
      evaluation_date: '2026-11-10',
      evaluator_name: 'DR. PATRICK JOSÉ JACINTO GOMERO',
      fur_date: '2026-10-30',
      obstetric_formula: 'G2 P1011',
      mac_method: 'Preservativo',
      pap_result: 'LIE-AG (NIC 2)',
      vph_test_result: 'Positivo',
      vph_serotype: 'VPH 16 Positivo',
      general_eval: { colposcopia: 'Adecuada', visibilidad_uec: 'Visible', zona_transformacion: 'Tipo 2' },
      normal_findings: { ectopia: 'Sí', epitelio_escamoso_maduro: 'Sí', deciduosis_embarazo: 'No', quiste_naboth: 'Sí', aberturas_glandulares: 'Sí' },
      abnormal_grade1: { mosaico_fino: 'No', puntillado_fino: 'No', borde_irregular: 'Sí', epitelio_acetoblanco_delgado: 'No' },
      abnormal_grade2: { mosaico_grueso: 'Sí', puntillado_grueso: 'Sí', epitelio_acetoblanco_denso: 'Sí', signo_limite_borde_interno: 'Sí' },
      non_specific_findings: { solucion_lugol_schiller: 'Positivo (Yodonegativo a horas 1 y 7)' },
      biopsy_taken: 'SÍ',
      biopsy_clock_points: ['1', '7'],
      biopsy_quadrants: ['Radio 01:00', 'Radio 07:00'],
      diagnostics: ['COLPOSCOPÍA ANORMAL GRADO 2 (MAYOR)', 'HALLAZGOS COMPATIBLES CON LIE-AG (NIC 2-3)', 'BIOPSIA DIRIGIDA TOMADA A HORAS 01:00 Y 07:00'],
      suggestion: 'Remitir frascos 1 y 2 a histopatología e inmunohistoquímica p16/Ki67. Programar cono LEEP según informe.',
      images_urls: [],
      created_at: new Date().toISOString()
    }
  ];
  const { error: colpoErr } = await supabase.from('colposcopy_reports').upsert(newColposcopies, { onConflict: 'id' });
  if (colpoErr) console.error('Error insertando colposcopies:', colpoErr.message);
  else console.log('✓ 2 Informes colposcópicos creados exitosamente.');

  // 5. Insertar Chequeos y Ecografías
  console.log('\n--- INSERTANDO CHEQUEOS CLÍNICOS Y ECOGRAFÍAS ---');
  const newCheckups = [
    {
      id: '40000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      checkup_date: '2026-11-04',
      motive: 'CHEQUEO PREVENTIVO',
      referred_symptoms: 'Paciente asintomática acude a chequeo ginecológico y mamario preventivo anual',
      clinical_exam: { mamas: { status: 'Normal' }, cervix: { status: 'Normal' }, abdomen: { status: 'Normal' } },
      breast_ultrasound: { birads: '1', conclusions: ['MAMAS NORMALES SIN LESIONES FOCALES (BI-RADS 1)'] },
      tv_ultrasound: {
        uterus_dimensions: '65 x 35 x 42 mm',
        endometrium_mm: '6.2',
        left_ovary_dim: '28 x 18 mm',
        right_ovary_dim: '30 x 20 mm',
        conclusions: ['ÚTERO Y OVARIOS ECOGRÁFICAMENTE NORMALES']
      },
      cie10_diagnostics: [{ code: 'Z01.4', type: 'DEFINITIVO', description: 'Examen ginecológico de rutina' }],
      recommendations: 'Control anual preventivo.',
      attached_lab_pdfs: [],
      created_at: new Date().toISOString()
    },
    {
      id: '40000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      checkup_date: '2026-11-09',
      motive: 'DISMENORREA SEVERA Y DOLOR PÉLVICO',
      referred_symptoms: 'Dismenorrea incapacitante EVA 9/10, dispareunia profunda, dolor lumbar cíclico',
      clinical_exam: { mamas: { status: 'Normal' }, cervix: { status: 'Normal' }, utero_anexos: { status: 'Doloroso a la palpación en fondos de saco' } },
      breast_ultrasound: { birads: '1', conclusions: ['MAMAS NORMALES'] },
      tv_ultrasound: {
        uterus_dimensions: '78 x 46 x 42 mm',
        endometrium_mm: '8.4',
        left_ovary_dim: '36 x 28 mm (Endometrioma 26 mm)',
        right_ovary_dim: '45 x 32 mm (Endometrioma 38 mm)',
        conclusions: [
          'ENDOMETRIOSIS OVÁRICA BILATERAL (ENDOMETRIOMA DERECHO 38 MM E IZQUIERDO 26 MM)',
          'SIGNO DE KISSING OVARIES (OVARIOS BESADORES EN LÍNEA MEDIA RETROCERVICAL)',
          'ADENOMIOSIS UTERINA POSTERIOR FOCAL'
        ]
      },
      cie10_diagnostics: [
        { code: 'N80.1', type: 'DEFINITIVO', description: 'Endometriosis del ovario' },
        { code: 'N80.0', type: 'DEFINITIVO', description: 'Endometriosis del útero (Adenomiosis)' }
      ],
      recommendations: 'Pauta farmacológica con Dienogest 2mg diario continuo x 6 meses y control en 90 días.',
      attached_lab_pdfs: [],
      created_at: new Date().toISOString()
    },
    {
      id: '40000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000005',
      checkup_date: '2026-11-12',
      motive: 'CLIMATERIO Y MENOPAUSIA',
      referred_symptoms: 'Sofocos diurnos intensos, insomnio de mantenimiento, sequedad y ardor vulvovaginal',
      clinical_exam: { mamas: { status: 'Normal' }, cervix: { status: 'Atrófico' }, vagina: { status: 'Mucosa pálida, adelgazada con pliegues borrados' } },
      breast_ultrasound: { birads: '1', conclusions: ['PATRÓN MAMARIO FIBROADIPOSO NORMAL INVOLUTIVO (BI-RADS 1)'] },
      tv_ultrasound: {
        uterus_dimensions: '58 x 30 x 34 mm',
        endometrium_mm: '2.0',
        left_ovary_dim: '18 x 12 mm',
        right_ovary_dim: '19 x 11 mm',
        conclusions: ['ÚTERO Y OVARIOS ATRÓFICOS FISIOLÓGICOS', 'ENDOMETRIO FINO REGULAR DE 2.0 MM (NORMAL)']
      },
      cie10_diagnostics: [{ code: 'N95.2', type: 'DEFINITIVO', description: 'Vaginitis atrófica posmenopáusica' }],
      recommendations: 'Terapia estrogénica tópica con Promestrieno 1% crema vaginal + Calcio y Vitamina D.',
      attached_lab_pdfs: [],
      created_at: new Date().toISOString()
    }
  ];
  const { error: chkErr } = await supabase.from('clinical_checkups').upsert(newCheckups, { onConflict: 'id' });
  if (chkErr) console.error('Error insertando checkups:', chkErr.message);
  else console.log('✓ 3 Informes de chequeo y ecografía creados exitosamente.');

  // 6. Insertar Recetas Médicas Inteligentes
  console.log('\n--- INSERTANDO RECETAS MÉDICAS ---');
  const newPrescriptions = [
    {
      id: '50000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      prescription_date: '2026-11-04',
      diagnosis: 'Asesoría y prescripción de anticoncepción hormonal combinada',
      cie10_code: 'Z30.0',
      items: [
        {
          medicationName: 'Bellaface Suave (Dienogest 2mg + Etinilestradiol 0.03mg)',
          presentation: 'Caja x 21 comprimidos recubiertos',
          dosage: '1 comprimido',
          frequency: 'Cada 24 horas a la misma hora todos los días',
          duration: 'Tomar por 21 días continuos, descansar 7 días y reiniciar',
          route: 'Vía Oral',
          quantity: '3 cajas x 21',
          instructions: 'Tomar preferentemente con la cena. Si olvida una toma, ingerirla de inmediato antes de 12 horas.'
        },
        {
          medicationName: 'Ibuprofeno 400mg',
          presentation: 'Caja x 20 tabletas',
          dosage: '1 tableta (400 mg)',
          frequency: 'Cada 8 horas condicional al dolor',
          duration: 'Por 2 a 3 días durante el periodo menstrual',
          route: 'Vía Oral',
          quantity: '10 tabletas',
          instructions: 'Tomar después de los alimentos.'
        }
      ],
      general_indications: 'Mantener buena hidratación. Asistir a control ginecológico en 3 meses.',
      next_appointment_date: '2027-02-04',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      prescription_date: '2026-11-13',
      diagnosis: 'Gestación de 10 semanas - Suplementación preconcepcional y manejo de náuseas',
      cie10_code: 'Z34.0',
      items: [
        {
          medicationName: 'Ácido Fólico 0.5mg (Folacid 500mcg)',
          presentation: 'Caja x 60 tabletas',
          dosage: '1 tableta diaria',
          frequency: 'Cada 24 horas en ayunas',
          duration: 'Por 60 días continuos',
          route: 'Vía Oral',
          quantity: '1 caja x 60',
          instructions: 'Tomar 30 minutos antes del desayuno con jugo cítrico o agua.'
        },
        {
          medicationName: 'Dimenhidrinato 50mg (Gravol 50mg)',
          presentation: 'Caja x 20 tabletas',
          dosage: '1 tableta',
          frequency: 'Cada 8 horas condicional a náuseas intensas',
          duration: 'Por 5 días según necesidad',
          route: 'Vía Oral',
          quantity: '1 caja x 20',
          instructions: 'Tomar solo si persisten náuseas matutinas intensas.'
        }
      ],
      general_indications: 'Comidas fraccionadas en 5 tomas al día de poco volumen. Acudir a ecografía genética en sem 12.',
      next_appointment_date: '2026-12-11',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      prescription_date: '2026-11-09',
      diagnosis: 'Endometriosis ovárica bilateral severa y dismenorrea severa invalidante',
      cie10_code: 'N80.1',
      items: [
        {
          medicationName: 'Dienogest 2mg (Visannette 2mg / Endometriox)',
          presentation: 'Caja x 28 comprimidos recubiertos',
          dosage: '1 comprimido (2 mg)',
          frequency: 'Cada 24 horas a las 10:00 PM sin descanso',
          duration: 'Por 6 meses continuos sin interrupción',
          route: 'Vía Oral',
          quantity: '6 cajas x 28',
          instructions: 'Tomar ininterrumpidamente todos los días a la misma hora sin pausar durante el sangrado o spotting.'
        },
        {
          medicationName: 'Ketorolaco Trometamol 10mg Sublingual (Dolnix SL)',
          presentation: 'Caja x 10 tabletas sublinguales',
          dosage: '1 tableta sublingual',
          frequency: 'Cada 8 horas condicional a crisis aguda de dolor pélvico',
          duration: 'Máximo por 3 días continuos',
          route: 'Vía Sublingual',
          quantity: '1 caja x 10',
          instructions: 'Colocar debajo de la lengua hasta su disolución completa durante los picos de dolor.'
        }
      ],
      general_indications: 'Dieta antiinflamatoria (reducir azúcares y lácteos). Control ecográfico en 90 días.',
      next_appointment_date: '2027-02-09',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000004',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      prescription_date: '2026-11-10',
      diagnosis: 'Cicatrización post-biopsia cervical y profilaxis infecciosa',
      cie10_code: 'N87.2',
      items: [
        {
          medicationName: 'Madecassol Óvulos (Centella Asiática 15mg + Neomicina)',
          presentation: 'Caja x 10 óvulos vaginales',
          dosage: '1 óvulo',
          frequency: 'Cada 24 horas al acostarse',
          duration: 'Por 7 días continuos',
          route: 'Vía Vaginal',
          quantity: '1 caja x 10',
          instructions: 'Introducir en la vagina antes de dormir a partir de las 48 horas post-biopsia.'
        },
        {
          medicationName: 'Ketoprofeno 100mg',
          presentation: 'Caja x 20 cápsulas',
          dosage: '1 cápsula (100 mg)',
          frequency: 'Cada 12 horas con las comidas',
          duration: 'Por 3 días',
          route: 'Vía Oral',
          quantity: '6 cápsulas',
          instructions: 'Tomar con medio vaso de agua después de los alimentos.'
        }
      ],
      general_indications: 'Abstinencia sexual estricta por 10 días. Reposo físico relativo 48 horas.',
      next_appointment_date: '2026-11-20',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '50000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000005',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      prescription_date: '2026-11-12',
      diagnosis: 'Síndrome climatérico y vaginitis atrófica posmenopáusica',
      cie10_code: 'N95.2',
      items: [
        {
          medicationName: 'Promestrieno 1% Crema Vaginal (Colpotrophine 1%)',
          presentation: 'Tubo x 30g + aplicador dosificador',
          dosage: '1 gramo (1 aplicador lleno)',
          frequency: 'Cada 24 horas por las noches por 20 días, luego 2 veces por semana',
          duration: 'Por 60 días continuos',
          route: 'Vía Vaginal / Vulvar',
          quantity: '2 tubos x 30g',
          instructions: 'Aplicar profundamente en la vagina y colocar una pequeña porción en el introito vulvar.'
        },
        {
          medicationName: 'Citrato de Calcio 1500mg (Calcio elemental 315mg) + Vitamina D3 800 UI',
          presentation: 'Frasco x 60 tabletas',
          dosage: '1 tableta',
          frequency: 'Cada 24 horas con el desayuno',
          duration: 'Por 90 días',
          route: 'Vía Oral',
          quantity: '1 frasco x 60',
          instructions: 'Tomar junto con el desayuno matutino.'
        }
      ],
      general_indications: 'Ejercicio aeróbico regular y caminatas de 30 minutos diarios para protección ósea y cardiovascular.',
      next_appointment_date: '2027-01-12',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  const { error: recErr } = await supabase.from('medical_prescriptions').upsert(newPrescriptions, { onConflict: 'id' });
  if (recErr) console.error('Error insertando recetas:', recErr.message);
  else console.log('✓ 5 Recetas médicas creadas exitosamente.');

  // 7. Insertar Órdenes de Laboratorio
  console.log('\n--- INSERTANDO ÓRDENES DE LABORATORIO ---');
  const newLabOrders = [
    {
      id: '60000000-0000-0000-0000-000000000001',
      patient_id: '10000000-0000-0000-0000-000000000001',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      order_date: '2026-11-04',
      diagnosis: 'Chequeo preventivo ginecológico de rutina',
      cie10_code: 'Z01.4',
      urgency: 'Rutina',
      items: [
        { testName: 'Hemograma Completo Automatizado + Plaquetas', sampleType: 'Sangre con EDTA' },
        { testName: 'Perfil Lipídico (Colesterol, Triglicéridos, HDL, LDL)', sampleType: 'Suero sanguíneo' },
        { testName: 'Glucosa en Ayunas', sampleType: 'Suero sanguíneo' },
        { testName: 'Examen Completo de Orina (EGO)', sampleType: 'Orina chorro medio' },
        { testName: 'Papanicolaou en Base Líquida (ThinPrep)', sampleType: 'Cepillado endocervical' }
      ],
      custom_tests: 'TSH ultrasensible',
      patient_instructions: 'Ayuno de 8 a 10 horas. Abstinencia sexual 48 horas previas al Papanicolaou.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '60000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      order_date: '2026-11-13',
      diagnosis: 'Perfil Prenatal Integral de Primer Trimestre (10 semanas)',
      cie10_code: 'Z34.0',
      urgency: 'Rutina',
      items: [
        { testName: 'Hemograma Completo + Hemoglobina / Hematocrito', sampleType: 'Sangre con EDTA' },
        { testName: 'Grupo Sanguíneo y Factor Rh', sampleType: 'Sangre venosa' },
        { testName: 'Glucosa en Ayunas', sampleType: 'Suero sanguíneo' },
        { testName: 'Serología RPR / VDRL Cuantitativo', sampleType: 'Suero sanguíneo' },
        { testName: 'Prueba Rápida Tamizaje VIH ELISA 4ta Generación', sampleType: 'Suero sanguíneo' },
        { testName: 'Prueba Rápida Hepatitis B (HBsAg)', sampleType: 'Suero sanguíneo' },
        { testName: 'Examen Completo de Orina + Urocultivo con Antibiograma', sampleType: 'Orina chorro medio' }
      ],
      custom_tests: 'Toxoplasma IgG/IgM + Rubéola IgG/IgM',
      patient_instructions: 'Ayuno de 8 horas. Recolectar la primera orina matutina con lavado genital previo con agua.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '60000000-0000-0000-0000-000000000003',
      patient_id: '10000000-0000-0000-0000-000000000003',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      order_date: '2026-11-09',
      diagnosis: 'Endometriosis ovárica bilateral severa y evaluación de reserva ovárica',
      cie10_code: 'N80.1',
      urgency: 'Rutina',
      items: [
        { testName: 'CA-125 (Marcador Tumoral Ovárico y Endometriosis)', sampleType: 'Suero sanguíneo' },
        { testName: 'Marcador Tumoral CA 19-9', sampleType: 'Suero sanguíneo' },
        { testName: 'Proteína C Reactiva Ultrasensible (PCR-us)', sampleType: 'Suero sanguíneo' },
        { testName: 'Hormona Antimülleriana (AMH - Reserva Ovárica)', sampleType: 'Suero sanguíneo' },
        { testName: 'Hemograma Completo + Ferritina Sérica', sampleType: 'Sangre con EDTA' }
      ],
      custom_tests: 'Perfil hepático (TGO, TGP, Bilirrubinas)',
      patient_instructions: 'Ayuno de 8 a 10 horas. Tomar preferentemente fuera de los días de regla.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '60000000-0000-0000-0000-000000000004',
      patient_id: '10000000-0000-0000-0000-000000000004',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      order_date: '2026-11-10',
      diagnosis: 'Estudio de biopsia cervical dirigida por colposcopía anormal LIE-AG',
      cie10_code: 'N87.2',
      urgency: 'Prioritario',
      items: [
        { testName: 'Estudio Histopatológico de Biopsia de Cérvix (2 frascos: h1:00 y h7:00)', sampleType: 'Fragmentos de tejido en formol 10%' },
        { testName: 'Estudio de Inmunohistoquímica Dual p16INK4a / Ki-67', sampleType: 'Bloque de parafina' },
        { testName: 'Panel Genotipificación Molecular VPH 23 Tipos por PCR Real-Time', sampleType: 'Cepillado endocervical' }
      ],
      custom_tests: 'Informe anatomopatológico con margen estromal',
      patient_instructions: 'Entregar de inmediato los 2 frascos rotulados con formol al laboratorio de patología.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '60000000-0000-0000-0000-000000000005',
      patient_id: '10000000-0000-0000-0000-000000000005',
      doctor_id: 'doc-patrick-jacinto',
      doctor_name: 'Dr. Patrick José Jacinto Gomero',
      doctor_cmp: '61693',
      doctor_rne: '38657',
      order_date: '2026-11-12',
      diagnosis: 'Perfil integral de climaterio, menopausia y riesgo óseo-cardiovascular',
      cie10_code: 'N95.2',
      urgency: 'Rutina',
      items: [
        { testName: 'Perfil Hormonal Femenino: FSH + LH + 17-Beta Estradiol', sampleType: 'Suero sanguíneo' },
        { testName: 'Perfil Tiroideo: TSH Ultrasensible + T4 Libre', sampleType: 'Suero sanguíneo' },
        { testName: 'Perfil Lipídico Completo: Colesterol Total, HDL, LDL, VLDL, Triglicéridos', sampleType: 'Suero sanguíneo' },
        { testName: 'Glucosa Basal + Insulina Basal (Índice HOMA-IR)', sampleType: 'Suero sanguíneo' },
        { testName: '25-Hidroxi Vitamina D Total', sampleType: 'Suero sanguíneo' }
      ],
      custom_tests: 'Densitometría Ósea Central DXA (Columna y Fémur)',
      patient_instructions: 'Ayuno de 10 a 12 horas. No ingerir suplementos de calcio o biotina 24 horas antes.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  const { error: labErr } = await supabase.from('lab_orders').upsert(newLabOrders, { onConflict: 'id' });
  if (labErr) console.error('Error insertando órdenes laboratorio:', labErr.message);
  else console.log('✓ 5 Órdenes de laboratorio creadas exitosamente.');

  // 8. Insertar Carnet de Control Prenatal Oficial (Fiorella Mendoza)
  console.log('\n--- INSERTANDO CARNET PRENATAL OFICIAL MINSA ---');
  const newPrenatalCards = [
    {
      id: '70000000-0000-0000-0000-000000000002',
      patient_id: '10000000-0000-0000-0000-000000000002',
      clinic_establishment: 'CENDO - Centro de Endometriosis & Ginecología Especializada',
      attending_doctor_id: 'doc-patrick-jacinto',
      attending_doctor_name: 'Dr. Patrick José Jacinto Gomero',
      baseline: {
        insuranceType: 'PRIVADO',
        insuranceCode: 'RIMAC-75294816',
        educationLevel: 'Superior Univ',
        civilStatus: 'Casada',
        fatherName: 'Mauricio Andrés Chávez Salazar',
        fatherDni: '44819203',
        gestas: 1,
        abortos: 0,
        partosVaginales: 0,
        cesareas: 0,
        nacidosVivos: 0,
        nacidosMuertos: 0,
        viven: 0,
        rnMayorPesoGramos: 0,
        multipleHistory: false,
        pretermHistory: false,
        familyHistory: ['Madre con diabetes gestacional en último parto'],
        personalHistory: ['Niega enfermedades crónicas o cirugías previas'],
        previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: false },
        usualWeightKg: 57.0,
        heightCm: 163,
        bloodGroup: 'O',
        rhFactor: 'Rh (+)',
        smokerCigarettesDay: 0,
        drugsUse: false,
        fum: '2026-09-04',
        fumDoubt: false,
        ultrasoundGestationalAgeWeeks: 6,
        ultrasoundDate: '2026-10-16',
        fpp: '2027-06-11',
        clinicalExam: 'Normal',
        breastsExam: 'Normal',
        cervixExam: 'Normal',
        pelvisExam: 'Normal',
        dentalExam: 'Normal',
        hemoglobin1: 12.6,
        bloodGlucose1: 84,
        vdrlRpr1: 'No reactivo',
        hivScreening1: 'Negativo',
        hepatitisBScreening: 'Negativo',
        completeUrineExam: 'Normal',
        urineCulture: 'Negativo',
        papTestResult: 'Normal',
        colposcopyResult: 'Normal'
      },
      visits: [
        {
          visitNumber: 1,
          visitDate: '2026-10-16',
          visitTime: '09:30',
          gestationalAgeWeeks: 6,
          gestationalAgeDays: 0,
          maternalWeightKg: 57.0,
          temperature: 36.6,
          bloodPressure: '105/65',
          maternalPulse: 74,
          uterineHeightCm: 0,
          fetusSituation: 'NA',
          fetusPresentation: 'NA',
          fetusPosition: 'NA',
          fetalHeartRate: 0,
          fetalMovements: 'NA',
          proteinuria: '-',
          edema: 'SE',
          tendonReflex: '+',
          ironFolicAcidGiven: false,
          calciumGiven: false,
          counselingGiven: 'NUT / ALARMA',
          nextAppointmentDate: '2026-11-13',
          attendingDoctorName: 'Dr. Patrick José Jacinto Gomero',
          notes: 'Captación precoz de gestante. Se inicia Ácido Fólico 0.5mg y solicitud de perfil prenatal.'
        },
        {
          visitNumber: 2,
          visitDate: '2026-11-13',
          visitTime: '10:15',
          gestationalAgeWeeks: 10,
          gestationalAgeDays: 0,
          maternalWeightKg: 57.5,
          temperature: 36.5,
          bloodPressure: '110/68',
          maternalPulse: 76,
          uterineHeightCm: 0,
          fetusSituation: 'NA',
          fetusPresentation: 'NA',
          fetusPosition: 'NA',
          fetalHeartRate: 162,
          fetalMovements: 'NA',
          proteinuria: '-',
          edema: 'SE',
          tendonReflex: '+',
          ironFolicAcidGiven: false,
          calciumGiven: false,
          counselingGiven: 'NUT / GENETICA',
          ultrasoundGestationalAge: '10 sem 1 d',
          nextAppointmentDate: '2026-12-11',
          attendingDoctorName: 'Dr. Patrick José Jacinto Gomero',
          notes: 'Vitalidad fetal confirmada por Doppler portátil (FCF 162 lpm). Programar ecografía genética (semana 12).'
        }
      ],
      maternal_pathologies: [],
      updated_at: new Date().toISOString()
    }
  ];
  const { error: pncErr } = await supabase.from('prenatal_cards').upsert(newPrenatalCards, { onConflict: 'id' });
  if (pncErr) console.error('Error insertando carnet prenatal:', pncErr.message);
  else console.log('✓ Carnet prenatal MINSA de Fiorella Mendoza creado exitosamente.');

  // 9. Actualizar Profiles con el Dr. Patrick y los 2 Nuevos Doctores
  console.log('\n--- ACTUALIZANDO PROFILES MÉDICOS EN SUPABASE ---');
  const newDoctorProfiles = [
    {
      id: 'b414472c-259d-4fc4-8dde-d07f41f26132',
      email: 'cendoperu@gmail.com',
      full_name: 'DR. PATRICK JOSÉ JACINTO GOMERO',
      specialty: 'GINECÓLOGO OBSTETRA - ENDOMETRIOSIS Y COLPOSCOPÍA (DIRECTOR)',
      cmp: '61693',
      rne: '38657',
      clinic_name: 'CENDO - CENTRO DE ENDOMETRIOSIS',
      address: 'Av. Alfredo Benavides N° 2975, Of. 405 / Miraflores - Lima',
      phone: '985 945 697',
      signature_url: null,
      updated_at: new Date().toISOString()
    },
    {
      id: 'b414472c-259d-4fc4-8dde-d07f41f26133',
      email: 'cbenavides@cendo.pe',
      full_name: 'DR. CARLOS EDUARDO BENAVIDES SILVA',
      specialty: 'GINECÓLOGO OBSTETRA - CIRUGÍA LAPAROSCÓPICA GINECOLÓGICA',
      cmp: '64520',
      rne: '39145',
      clinic_name: 'CENDO - CENTRO DE ENDOMETRIOSIS',
      address: 'Av. Alfredo Benavides N° 2975, Of. 405 / Miraflores - Lima',
      phone: '984 321 654',
      signature_url: null,
      updated_at: new Date().toISOString()
    },
    {
      id: 'b414472c-259d-4fc4-8dde-d07f41f26134',
      email: 'amorales@cendo.pe',
      full_name: 'DRA. ANDREA SOFÍA MORALES TELLO',
      specialty: 'GINECOLÓGA OBSTETRA - MEDICINA MATERNO-FETAL & ECOGRAFÍA',
      cmp: '68914',
      rne: '41250',
      clinic_name: 'CENDO - CENTRO DE ENDOMETRIOSIS',
      address: 'Av. Alfredo Benavides N° 2975, Of. 405 / Miraflores - Lima',
      phone: '976 123 987',
      signature_url: null,
      updated_at: new Date().toISOString()
    }
  ];
  const { error: profErr } = await supabase.from('profiles').upsert(newDoctorProfiles, { onConflict: 'email' });
  if (profErr) console.error('Error actualizando profiles:', profErr.message);
  else console.log('✓ Profiles de Dr. Patrick y 2 nuevos especialistas CENDO actualizados.');

  console.log('\n======================================================');
  console.log('RE-SEEDING COMPLETO EN SUPABASE FINALIZADO CON ÉXITO');
  console.log('======================================================');
}

runReset();

