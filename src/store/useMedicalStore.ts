import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DoctorProfile,
  Patient,
  PatientBackground,
  ColposcopyReport,
  ClinicalCheckup,
  ProcedureTariff,
  MedicationVademecum,
  MedicalPrescription,
  LabOrder,
  LabOrderItem,
  PrenatalCard,
  PrenatalVisitItem,
  PrenatalBaselineData,
} from "@/types/medical";
import {
  syncPatientToSupabase,
  deletePatientFromSupabase,
  syncBackgroundToSupabase,
  syncColposcopyToSupabase,
  syncPrescriptionToSupabase,
  deletePrescriptionFromSupabase,
  syncLabOrderToSupabase,
  deleteLabOrderFromSupabase,
  syncPrenatalCardToSupabase,
  deletePrenatalCardFromSupabase,
} from "@/lib/supabaseSync";

// Lista Inicial de Médicos y Especialistas CENDO
export const INITIAL_DOCTORS: DoctorProfile[] = [
  {
    id: "doc-patrick-jacinto",
    email: "cendoperu@gmail.com",
    password: "pjacinto@cendo",
    fullName: "Patrick José Jacinto Gomero",
    doctorTitle: "Dr.",
    specialty: "Ginecología y Obstetricia - Endometriosis y Colposcopía",
    cmp: "61693",
    rne: "38657",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "985 945 697",
    contactEmail: "cendoperu@gmail.com",
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "director",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "doc-carlos-benavides",
    email: "cbenavides@cendo.pe",
    password: "cbenavides@cendo",
    fullName: "Carlos Eduardo Benavides Silva",
    doctorTitle: "Dr.",
    specialty: "Ginecología y Obstetricia - Cirugía Laparoscópica Ginecológica",
    cmp: "64520",
    rne: "39145",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "984 321 654",
    contactEmail: "cbenavides@cendo.pe",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "doctor",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "doc-andrea-morales",
    email: "amorales@cendo.pe",
    password: "amorales@cendo",
    fullName: "Andrea Sofía Morales Tello",
    doctorTitle: "Dra.",
    specialty: "Ginecología y Obstetricia - Medicina Materno-Fetal & Ecografía Doppler",
    cmp: "68914",
    rne: "41250",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "976 123 987",
    contactEmail: "amorales@cendo.pe",
    avatarUrl: "https://images.unsplash.com/photo-1594824813583-0599c9c8e1a1?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "doctor",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
];

// Perfil Activo Inicial: Dr. Patrick José Jacinto Gomero (Director Médico)
export const INITIAL_DOCTOR: DoctorProfile = INITIAL_DOCTORS[0];

// Pacientes Semilla de Demostración Clínica CENDO (5 Casos Clínicos Reales)
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pat-luciana-ramos",
    dni: "73819204",
    firstName: "LUCIANA MARÍA",
    lastName: "RAMOS FIGUEROA",
    birthDate: "2001-03-15",
    age: 25,
    phone: "984 125 639",
    email: "luciana.ramos@email.com",
    address: "Av. Pardo y Aliaga 640, Dpto 302, San Isidro",
    civilStatus: "Soltera",
    occupation: "Licenciada en Comunicaciones",
    insuranceInfo: "PACIFICO EPS",
    createdAt: "2026-11-04T10:00:00Z",
    updatedAt: "2026-11-04T11:30:00Z",
  },
  {
    id: "pat-fiorella-mendoza",
    dni: "75294816",
    firstName: "FIORELLA BEATRÍZ",
    lastName: "MENDOZA CHÁVEZ",
    birthDate: "1996-08-22",
    age: 30,
    phone: "976 543 218",
    email: "fiorella.mendoza@email.com",
    address: "Calle Coronel Inclán 320, Dpto 402, Miraflores",
    civilStatus: "Casada",
    occupation: "Contadora Pública Colegiada",
    insuranceInfo: "RIMAC EPS",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-13T10:30:00Z",
  },
  {
    id: "pat-gabriela-paredes",
    dni: "71628493",
    firstName: "GABRIELA ALEJANDRA",
    lastName: "PAREDES NAVARRO",
    birthDate: "1994-11-05",
    age: 32,
    phone: "992 837 465",
    email: "gabriela.paredes@email.com",
    address: "Av. Reducto 1250, Miraflores",
    civilStatus: "Soltera",
    occupation: "Abogada Corporativa",
    insuranceInfo: "Particular / SANITAS",
    createdAt: "2026-11-06T14:30:00Z",
    updatedAt: "2026-11-09T16:00:00Z",
  },
  {
    id: "pat-daniela-castro",
    dni: "74195820",
    firstName: "DANIELA PATRICIA",
    lastName: "CASTRO VILLAVICENCIO",
    birthDate: "1992-06-18",
    age: 34,
    phone: "981 456 723",
    email: "daniela.castro@email.com",
    address: "Malecón Balta 890, Miraflores",
    civilStatus: "Conviviente",
    occupation: "Diseñadora Gráfica",
    insuranceInfo: "Particular",
    createdAt: "2026-11-07T11:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  {
    id: "pat-carmen-huaman",
    dni: "09482715",
    firstName: "CARMEN ROSA",
    lastName: "HUAMÁN SOTOMAYOR",
    birthDate: "1974-04-10",
    age: 52,
    phone: "963 852 741",
    email: "carmen.huaman@email.com",
    address: "Calle Esperanza 245, Miraflores",
    civilStatus: "Casada",
    occupation: "Docente Universitaria",
    insuranceInfo: "PACIFICO EPS",
    createdAt: "2026-11-08T15:00:00Z",
    updatedAt: "2026-11-12T16:30:00Z",
  },
];

// Antecedentes Gineco-Obstétricos de las 5 Pacientes
export const INITIAL_BACKGROUNDS: Record<string, PatientBackground> = {
  "pat-luciana-ramos": {
    id: "bg-luciana-ramos",
    patientId: "pat-luciana-ramos",
    menarche: 12,
    sexualDebutAge: 18,
    sexualPartnersCount: 2,
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Preservativo de barrera",
    lastMenstrualPeriod: "2026-10-28",
    papHistory: "Normal (2025)",
    vphTestHistory: "Negativo",
    medicalAllergies: "Niega alergias a medicamentos",
    surgeriesHistory: "Niega cirugías previas",
    familyHistory: "Tía materna con quistes ováricos benignos",
    notes: "Paciente acude a chequeo preventivo anual y asesoría para método anticonceptivo.",
    updatedAt: "2026-11-04T11:30:00Z",
  },
  "pat-fiorella-mendoza": {
    id: "bg-fiorella-mendoza",
    patientId: "pat-fiorella-mendoza",
    menarche: 13,
    sexualDebutAge: 21,
    sexualPartnersCount: 1,
    obstetricFormula: "G1 P0000",
    contraceptiveMethod: "Ninguno (Embarazo deseado y planificado)",
    lastMenstrualPeriod: "2026-09-04",
    papHistory: "Normal (febrero 2026)",
    vphTestHistory: "Negativo",
    medicalAllergies: "Niega alergias medicamentosas",
    surgeriesHistory: "Niega cirugías",
    familyHistory: "Madre con antecedente de diabetes gestacional en último parto",
    notes: "Gestante primigesta de 10 semanas de gestación. FPP por regla de Naegele: 11/06/2027.",
    updatedAt: "2026-11-13T10:30:00Z",
  },
  "pat-gabriela-paredes": {
    id: "bg-gabriela-paredes",
    patientId: "pat-gabriela-paredes",
    menarche: 11,
    sexualDebutAge: 19,
    sexualPartnersCount: 2,
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Ninguno",
    lastMenstrualPeriod: "2026-10-22",
    papHistory: "Negativo para células atípicas (agosto 2026)",
    vphTestHistory: "Negativo",
    medicalAllergies: "Alergia comprobada a Sulfas (erupción maculopapular)",
    surgeriesHistory: "Apendicectomía abierta a los 16 años",
    familyHistory: "Hermana mayor operada por laparoscopía de endometriosis ovárica",
    notes: "Paciente con dismenorrea severa progresiva EVA 9/10, dispareunia profunda y dolor pélvico crónico.",
    updatedAt: "2026-11-09T16:00:00Z",
  },
  "pat-daniela-castro": {
    id: "bg-daniela-castro",
    patientId: "pat-daniela-castro",
    menarche: 13,
    sexualDebutAge: 17,
    sexualPartnersCount: 3,
    obstetricFormula: "G2 P1011",
    contraceptiveMethod: "Preservativo",
    lastMenstrualPeriod: "2026-10-30",
    papHistory: "LIE-AG (Lesión Intraepitelial Escamosa de Alto Grado / NIC 2)",
    vphTestHistory: "Positivo para genotipo de alto riesgo VPH 16",
    medicalAllergies: "Niega alergias",
    surgeriesHistory: "Legrado uterino por aborto espontáneo precoz (2023)",
    familyHistory: "Abuela materna con cáncer de mama a los 68 años",
    notes: "Derivada por citología anormal LIE-AG. Colposcopía con biopsia dirigida.",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  "pat-carmen-huaman": {
    id: "bg-carmen-huaman",
    patientId: "pat-carmen-huaman",
    menarche: 12,
    sexualDebutAge: 20,
    sexualPartnersCount: 1,
    obstetricFormula: "G2 P2002",
    contraceptiveMethod: "Quirúrgico / Salpingoclasia bilateral previa",
    lastMenstrualPeriod: "2025-09-10",
    papHistory: "Atrofia fisiológica / Negativo a neoplasia (2025)",
    vphTestHistory: "Negativo",
    medicalAllergies: "Niega alergias medicamentosas",
    surgeriesHistory: "Colecistectomía laparoscópica (2018)",
    familyHistory: "Madre con osteoporosis y fractura de cadera a los 74 años",
    notes: "Paciente en menopausia (14 meses de amenorrea) con bochornos intensos e insomnio.",
    updatedAt: "2026-11-12T16:30:00Z",
  },
};

// Informes Colposcópicos IFCPC 2011 Semilla
export const INITIAL_COLPOSCOPY: ColposcopyReport[] = [
  {
    id: "colpo-luciana-01",
    patientId: "pat-luciana-ramos",
    reportDate: "2026-11-04",
    adequateColposcopy: true,
    squamocolumnarJunctionVisible: "Visible",
    transformationZoneType: "Tipo 1",
    matureSquamousEpithelium: true,
    ectopy: true,
    nabothCyst: false,
    cryptOpenings: false,
    deciduosis: false,
    thinAcetowhiteEpithelium: false,
    denseAcetowhiteEpithelium: false,
    irregularBorder: false,
    fineMosaic: false,
    coarseMosaic: false,
    finePunctation: false,
    coarsePunctation: false,
    sharpBorders: false,
    atypicalVessels: false,
    leukoplakia: false,
    schillerTest: "Negativo (Lugol Caoba homogéneo)",
    cervicalBiopsyTaken: false,
    biopsyClockHours: [],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Cérvix con SSF: Ectopia periorificial leve fisiológica",
        timestamp: "2026-11-04 10:45",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Sin cambios acetoblancos patológicos",
        timestamp: "2026-11-04 10:48",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Detalle de ZT Tipo 1 completamente visible",
        timestamp: "2026-11-04 10:51",
      },
      {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Captación homogénea caoba (Negativo)",
        timestamp: "2026-11-04 10:54",
      },
    ],
    diagnosis: "Colposcopía adecuada satisfactoria. Zona de transformación Tipo 1. Sin evidencia de atipia colposcópica.",
    planRecommendations: "Control citológico ginecológico preventivo en 1 año.",
    cie10Code: "Z01.4",
    doctorName: "Dr. Patrick José Jacinto Gomero (CMP 61693 / RNE 38657)",
    createdAt: "2026-11-04T11:00:00Z",
  },
  {
    id: "colpo-daniela-01",
    patientId: "pat-daniela-castro",
    reportDate: "2026-11-10",
    adequateColposcopy: true,
    squamocolumnarJunctionVisible: "Visible",
    transformationZoneType: "Tipo 2",
    matureSquamousEpithelium: true,
    ectopy: true,
    nabothCyst: true,
    cryptOpenings: true,
    deciduosis: false,
    thinAcetowhiteEpithelium: false,
    denseAcetowhiteEpithelium: true,
    irregularBorder: true,
    fineMosaic: false,
    coarseMosaic: true,
    finePunctation: false,
    coarsePunctation: true,
    sharpBorders: true,
    atypicalVessels: false,
    leukoplakia: false,
    schillerTest: "Positivo (Yodonegativo a horas 1 y 7)",
    cervicalBiopsyTaken: true,
    biopsyClockHours: ["1", "7"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Cérvix con SSF: Zona de transformación con ectropion e hiperemia",
        timestamp: "2026-11-10 11:15",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Epitelio acetoblanco denso en labio anterior a hora 1:00",
        timestamp: "2026-11-10 11:18",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Mosaico grueso y puntillado en labio posterior a hora 7:00",
        timestamp: "2026-11-10 11:21",
      },
      {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Yodonegatividad franca amarillo mostaza en horas 1 y 7",
        timestamp: "2026-11-10 11:24",
      },
    ],
    diagnosis:
      "1. Colposcopía adecuada. 2. ZT Tipo 2. 3. Hallazgos colposcópicos anormales Grado 2 (Mayor): Mosaico grueso y puntillado grueso compatible con LIE-AG (NIC 2-3).",
    planRecommendations:
      "Biopsia de cérvix tomada a horas 01:00 y 07:00 enviada a patología con inmunohistoquímica p16/Ki67. Se programa cono LEEP ambulatorio según resultado histológico.",
    cie10Code: "N87.2",
    doctorName: "Dr. Patrick José Jacinto Gomero (CMP 61693 / RNE 38657)",
    createdAt: "2026-11-10T11:45:00Z",
  },
];

// Informes de Chequeo y Ecografías Semilla
export const INITIAL_CHECKUPS: ClinicalCheckup[] = [
  {
    id: "chk-luciana-01",
    patientId: "pat-luciana-ramos",
    checkupDate: "2026-11-04",
    reasonForConsultation: "Chequeo ginecológico y mamario preventivo anual",
    breastUltrasoundFindings:
      "Patrón ecográfico mamario bilateral homogéneo predominantemente fibroglandular. No se evidencian nódulos sólidos, quísticos ni microcalcificaciones sospechosas. Axilas libres.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin lesiones focales",
    transvaginalUltrasoundFindings:
      "Útero en AVF de 65 x 35 x 42 mm, miometrio homogéneo de ecogenicidad conservada. Endometrio fino regular trilaminar de 6.2 mm. Ovarios normales con folículos antrales fisiológicos.",
    uterusMeasurements: "65 x 35 x 42 mm (Vol: 50 cc)",
    endometriumThicknessMm: 6.2,
    ovariesFindings: "Ovario derecho 28 x 18 mm. Ovario izquierdo 30 x 20 mm. Ambos con ecotextura normal.",
    papResult: "Normal (Negativo para lesión intraepitelial o malignidad)",
    vphResult: "Negativo para 23 genotipos",
    conclusions: "Chequeo ginecológico y mamario preventivo dentro de límites normales.",
    medicalPrescription: "1. Iniciar anticoncepción hormonal combinada.\n2. Control ginecológico anual.",
    createdAt: "2026-11-04T11:15:00Z",
  },
  {
    id: "chk-gabriela-01",
    patientId: "pat-gabriela-paredes",
    checkupDate: "2026-11-09",
    reasonForConsultation: "Dismenorrea severa progresiva (EVA 9/10), dispareunia profunda y evaluación de endometriosis",
    breastUltrasoundFindings:
      "Mamas fibroglandulares normales sin alteraciones ecográficas. Regiones axilares normales sin adenopatías.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin lesiones mamarias",
    transvaginalUltrasoundFindings:
      "Útero en retroversoflexión fija de 78 x 46 x 42 mm. Miometrio heterogéneo con áreas focales hipoecoicas en pared posterior compatibles con adenomiosis. Endometrio regular de 8.4 mm. Ovario derecho aumentado de tamaño con endometrioma unilocular de 38 x 30 mm con ecos en vidrio esmerilado sin vascularización doppler. Ovario izquierdo aumentado con endometrioma de 26 mm. Ambos ovarios adheridos en la línea media posterior retrocervical (Kissing Ovaries). Fondo de saco de Douglas parcialmente obliterado.",
    uterusMeasurements: "78 x 46 x 42 mm (Vol: 79 cc)",
    endometriumThicknessMm: 8.4,
    ovariesFindings: "Endometrioma ovárico derecho de 38 mm e izquierdo de 26 mm. Kissing Ovaries positivo.",
    papResult: "Normal (Negativo para neoplasia)",
    vphResult: "Negativo",
    conclusions:
      "1. Endometriosis ovárica bilateral severa estadio IV (Kissing Ovaries).\n2. Adenomiosis uterina posterior focal.\n3. Dismenorrea secundaria severa y dolor pélvico crónico.",
    medicalPrescription:
      "1. Dienogest 2mg diario continuo x 6 meses.\n2. Ketorolaco sublingual condicional al dolor.\n3. Control ecográfico en 90 días.",
    createdAt: "2026-11-09T15:30:00Z",
  },
  {
    id: "chk-carmen-01",
    patientId: "pat-carmen-huaman",
    checkupDate: "2026-11-12",
    reasonForConsultation: "Control de climaterio y menopausia (14 meses de amenorrea) y bochornos intensos",
    breastUltrasoundFindings:
      "Patrón mamario fibroadiposo involutivo simétrico bilateral. No se observan nódulos sólidos, quísticos ni distorsión tisular. Axilas libres.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin nódulos",
    transvaginalUltrasoundFindings:
      "Útero en AVF de dimensiones reducidas 58 x 30 x 34 mm (involutivo senil fisiológico), miometrio homogéneo. Endometrio lineal fino atrófico de 2.0 mm de espesor (descarte de patología endometrial posmenopáusica). Ovarios de volumen atrófico bilateral sin imágenes tumorales ni quísticas.",
    uterusMeasurements: "58 x 30 x 34 mm (Vol: 31 cc)",
    endometriumThicknessMm: 2.0,
    ovariesFindings: "Ovarios atróficos bilaterales fisiológicos (18x12 mm y 19x11 mm).",
    papResult: "Frotis atrófico fisiológico negativo a neoplasia",
    vphResult: "Negativo",
    conclusions:
      "1. Menopausia fisiológica normoevolutiva.\n2. Atrofia endometrial fisiológica (2.0 mm).\n3. Mamas y útero ecográficamente benignos.",
    medicalPrescription:
      "1. Promestrieno 1% crema vaginal tópica nocturna.\n2. Citrato de Calcio + Vitamina D3 oral diaria.\n3. Densitometría ósea de control.",
    createdAt: "2026-11-12T16:00:00Z",
  },
];

// Recetas Médicas Inteligentes Semilla
export const INITIAL_PRESCRIPTIONS: MedicalPrescription[] = [
  {
    id: "rec-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-04",
    diagnosis: "Asesoría y prescripción de anticoncepción hormonal combinada",
    cie10Code: "Z30.0",
    items: [
      {
        id: "item-luc-1",
        medicationName: "Bellaface Suave (Dienogest 2mg + Etinilestradiol 0.03mg)",
        presentation: "Caja x 21 comprimidos recubiertos",
        route: "Vía Oral",
        dosage: "1 comprimido",
        frequency: "Cada 24 horas a la misma hora todos los días",
        duration: "Tomar por 21 días continuos, descansar 7 días y reiniciar",
        instructions: "Tomar preferentemente con la cena. Si olvida una toma, ingerirla antes de 12 horas.",
        quantity: "3 cajas x 21 comprimidos",
      },
      {
        id: "item-luc-2",
        medicationName: "Ibuprofeno 400mg",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta (400 mg)",
        frequency: "Cada 8 horas condicional a cólicos menstruales",
        duration: "Por 2 a 3 días según necesidad",
        instructions: "Tomar con un vaso de agua después de los alimentos.",
        quantity: "10 tabletas",
      },
    ],
    generalIndications: "Mantener buena ingesta hídrica. Control ginecológico en 3 meses para evaluar tolerancia.",
    nextAppointmentDate: "2027-02-04",
    createdAt: "2026-11-04T11:20:00Z",
    updatedAt: "2026-11-04T11:20:00Z",
  },
  {
    id: "rec-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-13",
    diagnosis: "Supervisión de embarazo de 10 semanas - Suplementación preconcepcional y emesis",
    cie10Code: "Z34.0",
    items: [
      {
        id: "item-fio-1",
        medicationName: "Ácido Fólico 0.5mg (Folacid 500mcg)",
        presentation: "Caja x 60 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta",
        frequency: "Cada 24 horas en ayunas",
        duration: "Por 60 días continuos",
        instructions: "Tomar 30 minutos antes del desayuno con jugo cítrico o agua.",
        quantity: "1 caja x 60 tabletas",
      },
      {
        id: "item-fio-2",
        medicationName: "Dimenhidrinato 50mg (Gravol)",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta (50 mg)",
        frequency: "Cada 8 horas condicional a náuseas y vómitos intensos",
        duration: "Por 5 días según necesidad",
        instructions: "Tomar con agua ante presencia de náuseas matutinas intensas.",
        quantity: "1 caja x 20 tabletas",
      },
    ],
    generalIndications: "Comidas fraccionadas en 5 tomas pequeñas al día. Evitar frituras y condimentos. Programar ecografía genética en semana 12.",
    nextAppointmentDate: "2026-12-11",
    createdAt: "2026-11-13T10:45:00Z",
    updatedAt: "2026-11-13T10:45:00Z",
  },
  {
    id: "rec-gabriela-01",
    patientId: "pat-gabriela-paredes",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-09",
    diagnosis: "Endometriosis ovárica bilateral severa y dismenorrea severa invalidante",
    cie10Code: "N80.1",
    items: [
      {
        id: "item-gab-1",
        medicationName: "Dienogest 2mg (Visannette 2mg / Endometriox)",
        presentation: "Caja x 28 comprimidos recubiertos",
        route: "Vía Oral",
        dosage: "1 comprimido (2 mg)",
        frequency: "Cada 24 horas a las 10:00 PM sin descanso",
        duration: "Por 6 meses continuos sin interrupción",
        instructions: "Tomar ininterrumpidamente todos los días a la misma hora sin pausar durante el sangrado o spotting.",
        quantity: "6 cajas x 28 comprimidos",
      },
      {
        id: "item-gab-2",
        medicationName: "Ketorolaco Trometamol 10mg Sublingual (Dolnix SL)",
        presentation: "Caja x 10 tabletas sublinguales",
        route: "Vía Sublingual",
        dosage: "1 tableta sublingual",
        frequency: "Cada 8 horas condicional a crisis aguda de dolor pélvico",
        duration: "Por máximo 3 días continuos",
        instructions: "Colocar debajo de la lengua hasta su disolución completa durante los picos de dolor.",
        quantity: "1 caja x 10 tabletas",
      },
    ],
    generalIndications: "Dieta antiinflamatoria (reducir azúcares y ultraprocesados). Actividad física moderada. Control ecográfico transvaginal en 90 días.",
    nextAppointmentDate: "2027-02-09",
    createdAt: "2026-11-09T15:45:00Z",
    updatedAt: "2026-11-09T15:45:00Z",
  },
  {
    id: "rec-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-10",
    diagnosis: "Cicatrización post-biopsia cervical y profilaxis antiinflamatoria",
    cie10Code: "N87.2",
    items: [
      {
        id: "item-dan-1",
        medicationName: "Madecassol Óvulos (Centella Asiática 15mg + Neomicina)",
        presentation: "Caja x 10 óvulos vaginales",
        route: "Vía Vaginal",
        dosage: "1 óvulo",
        frequency: "Cada 24 horas al acostarse",
        duration: "Por 7 días continuos a partir de las 48h post-biopsia",
        instructions: "Introducir profundamente en la vagina al acostarse.",
        quantity: "1 caja x 10 óvulos",
      },
      {
        id: "item-dan-2",
        medicationName: "Ketoprofeno 100mg",
        presentation: "Caja x 20 cápsulas",
        route: "Vía Oral",
        dosage: "1 cápsula (100 mg)",
        frequency: "Cada 12 horas con las comidas",
        duration: "Por 3 días",
        instructions: "Tomar con abundante agua después del desayuno y la cena.",
        quantity: "6 cápsulas",
      },
    ],
    generalIndications: "Abstinencia sexual estricta por 10 días. Reposo relativo 48 horas. Recoger resultado histopatológico en 10 días hábiles.",
    nextAppointmentDate: "2026-11-20",
    createdAt: "2026-11-10T12:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  {
    id: "rec-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-12",
    diagnosis: "Síndrome climatérico y vaginitis atrófica posmenopáusica",
    cie10Code: "N95.2",
    items: [
      {
        id: "item-car-1",
        medicationName: "Promestrieno 1% Crema Vaginal (Colpotrophine 1%)",
        presentation: "Tubo x 30g + aplicador dosificador",
        route: "Vía Vaginal / Vulvar",
        dosage: "1 gramo (1 aplicador lleno)",
        frequency: "Cada 24 horas por las noches por 20 días, luego 2 veces por semana",
        duration: "Por 60 días continuos",
        instructions: "Aplicar profundamente en la vagina y colocar una pequeña porción en el introito vulvar.",
        quantity: "2 tubos x 30g",
      },
      {
        id: "item-car-2",
        medicationName: "Citrato de Calcio 1500mg (Calcio elemental 315mg) + Vitamina D3 800 UI",
        presentation: "Frasco x 60 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta",
        frequency: "Cada 24 horas con el desayuno",
        duration: "Por 90 días",
        instructions: "Tomar junto con el desayuno matutino.",
        quantity: "1 frasco x 60 tabletas",
      },
    ],
    generalIndications: "Caminatas de 30 minutos al sol matutino para estimulación de síntesis ósea. Control en 60 días con resultados de laboratorio.",
    nextAppointmentDate: "2027-01-12",
    createdAt: "2026-11-12T16:15:00Z",
    updatedAt: "2026-11-12T16:15:00Z",
  },
];

// Órdenes de Laboratorio Clínico Semilla
export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: "lab-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-04",
    diagnosis: "Chequeo preventivo ginecológico de rutina",
    cie10Code: "Z01.4",
    urgency: "Rutina",
    items: [
      { id: "lab-luc-1", category: "Hematología & Bioquímica", testName: "Hemograma Completo Automatizado + Plaquetas", sampleType: "Sangre con EDTA" },
      { id: "lab-luc-2", category: "Hematología & Bioquímica", testName: "Perfil Lipídico (Colesterol Total, HDL, LDL, Triglicéridos)", sampleType: "Suero sanguíneo" },
      { id: "lab-luc-3", category: "Hematología & Bioquímica", testName: "Glucosa en Ayunas", sampleType: "Suero sanguíneo" },
      { id: "lab-luc-4", category: "Orina & Función Renal", testName: "Examen Completo de Orina (EGO)", sampleType: "Orina chorro medio" },
      { id: "lab-luc-5", category: "Ginecología & Marcadores", testName: "Papanicolaou en Base Líquida (ThinPrep)", sampleType: "Cepillado endocervical" },
    ],
    customTests: "TSH ultrasensible",
    patientInstructions: "Ayuno de 8 a 10 horas. Abstinencia sexual 48 horas previas al Papanicolaou.",
    createdAt: "2026-11-04T11:25:00Z",
    updatedAt: "2026-11-04T11:25:00Z",
  },
  {
    id: "lab-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-13",
    diagnosis: "Perfil Prenatal Integral de Primer Trimestre (10 semanas)",
    cie10Code: "Z34.0",
    urgency: "Rutina",
    items: [
      { id: "lab-fio-1", category: "Hematología & Bioquímica", testName: "Hemograma Completo + Hemoglobina / Hematocrito", sampleType: "Sangre con EDTA" },
      { id: "lab-fio-2", category: "Prenatal & Gestación", testName: "Grupo Sanguíneo y Factor Rh", sampleType: "Sangre venosa" },
      { id: "lab-fio-3", category: "Hematología & Bioquímica", testName: "Glucosa en Ayunas", sampleType: "Suero sanguíneo" },
      { id: "lab-fio-4", category: "Infeccioso & Microbiología", testName: "Serología RPR / VDRL Cuantitativo", sampleType: "Suero sanguíneo" },
      { id: "lab-fio-5", category: "Infeccioso & Microbiología", testName: "Prueba Rápida Tamizaje VIH ELISA 4ta Generación", sampleType: "Suero sanguíneo" },
      { id: "lab-fio-6", category: "Infeccioso & Microbiología", testName: "Prueba Rápida Hepatitis B (HBsAg)", sampleType: "Suero sanguíneo" },
      { id: "lab-fio-7", category: "Orina & Función Renal", testName: "Examen Completo de Orina + Urocultivo con Antibiograma", sampleType: "Orina chorro medio" },
    ],
    customTests: "Toxoplasma IgG/IgM + Rubéola IgG/IgM",
    patientInstructions: "Ayuno de 8 horas. Recolectar la primera orina matutina con lavado genital previo.",
    createdAt: "2026-11-13T10:50:00Z",
    updatedAt: "2026-11-13T10:50:00Z",
  },
  {
    id: "lab-gabriela-01",
    patientId: "pat-gabriela-paredes",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-09",
    diagnosis: "Endometriosis ovárica bilateral severa y evaluación de reserva ovárica",
    cie10Code: "N80.1",
    urgency: "Rutina",
    items: [
      { id: "lab-gab-1", category: "Ginecología & Marcadores", testName: "CA-125 (Marcador Tumoral Ovárico y Endometriosis)", sampleType: "Suero sanguíneo" },
      { id: "lab-gab-2", category: "Ginecología & Marcadores", testName: "Marcador Tumoral CA 19-9", sampleType: "Suero sanguíneo" },
      { id: "lab-gab-3", category: "Hematología & Bioquímica", testName: "Proteína C Reactiva Ultrasensible (PCR-us)", sampleType: "Suero sanguíneo" },
      { id: "lab-gab-4", category: "Ginecología & Marcadores", testName: "Hormona Antimülleriana (AMH - Reserva Ovárica)", sampleType: "Suero sanguíneo" },
      { id: "lab-gab-5", category: "Hematología & Bioquímica", testName: "Hemograma Completo + Ferritina Sérica", sampleType: "Sangre con EDTA" },
    ],
    customTests: "Perfil hepático (TGO, TGP, Bilirrubinas)",
    patientInstructions: "Ayuno de 8 a 10 horas. Tomar preferentemente fuera de los días de regla.",
    createdAt: "2026-11-09T15:50:00Z",
    updatedAt: "2026-11-09T15:50:00Z",
  },
  {
    id: "lab-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-10",
    diagnosis: "Estudio de biopsia cervical dirigida por colposcopía anormal LIE-AG",
    cie10Code: "N87.2",
    urgency: "Prioritario",
    items: [
      { id: "lab-dan-1", category: "Ginecología & Marcadores", testName: "Estudio Histopatológico de Biopsia de Cérvix (2 frascos: h1 y h7)", sampleType: "Fragmentos de tejido en formol 10%" },
      { id: "lab-dan-2", category: "Ginecología & Marcadores", testName: "Estudio de Inmunohistoquímica Dual p16INK4a / Ki-67", sampleType: "Bloque de parafina" },
      { id: "lab-dan-3", category: "Infeccioso & Microbiología", testName: "Panel Genotipificación Molecular VPH 23 Tipos por PCR Real-Time", sampleType: "Cepillado endocervical" },
    ],
    customTests: "Informe anatomopatológico con margen estromal",
    patientInstructions: "Entregar de inmediato los 2 frascos rotulados con formol al laboratorio de patología.",
    createdAt: "2026-11-10T12:05:00Z",
    updatedAt: "2026-11-10T12:05:00Z",
  },
  {
    id: "lab-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-12",
    diagnosis: "Perfil integral de climaterio, menopausia y riesgo óseo-cardiovascular",
    cie10Code: "N95.2",
    urgency: "Rutina",
    items: [
      { id: "lab-car-1", category: "Ginecología & Marcadores", testName: "Perfil Hormonal Femenino: FSH + LH + 17-Beta Estradiol", sampleType: "Suero sanguíneo" },
      { id: "lab-car-2", category: "Hematología & Bioquímica", testName: "Perfil Tiroideo: TSH Ultrasensible + T4 Libre", sampleType: "Suero sanguíneo" },
      { id: "lab-car-3", category: "Hematología & Bioquímica", testName: "Perfil Lipídico Completo: Colesterol, HDL, LDL, VLDL, Triglicéridos", sampleType: "Suero sanguíneo" },
      { id: "lab-car-4", category: "Hematología & Bioquímica", testName: "Glucosa Basal + Insulina Basal (Índice HOMA-IR)", sampleType: "Suero sanguíneo" },
      { id: "lab-car-5", category: "Hematología & Bioquímica", testName: "25-Hidroxi Vitamina D Total", sampleType: "Suero sanguíneo" },
    ],
    customTests: "Densitometría Ósea Central DXA (Columna y Fémur)",
    patientInstructions: "Ayuno de 10 a 12 horas. No ingerir suplementos de calcio o biotina 24 horas antes.",
    createdAt: "2026-11-12T16:20:00Z",
    updatedAt: "2026-11-12T16:20:00Z",
  },
];

// Carnet de Control Prenatal Oficial MINSA / CLAP (Fiorella Beatríz Mendoza Chávez)
export const INITIAL_PRENATAL_CARDS: PrenatalCard[] = [
  {
    id: "pnc-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    clinicEstablishment: "CENDO - Centro de Endometriosis & Ginecología Especializada",
    attendingDoctorId: "doc-patrick-jacinto",
    attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
    baseline: {
      insuranceType: "PRIVADO",
      insuranceCode: "RIMAC-75294816",
      educationLevel: "Superior Univ",
      civilStatus: "Casada",
      fatherName: "Mauricio Andrés Chávez Salazar",
      fatherDni: "44819203",
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
      familyHistory: ["Madre con diabetes gestacional en último parto"],
      personalHistory: ["Niega enfermedades crónicas o cirugías previas"],
      previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: false },
      usualWeightKg: 57.0,
      heightCm: 163,
      bloodGroup: "O",
      rhFactor: "Rh (+)",
      smokerCigarettesDay: 0,
      drugsUse: false,
      fum: "2026-09-04",
      fumDoubt: false,
      ultrasoundGestationalAgeWeeks: 6,
      ultrasoundDate: "2026-10-16",
      fpp: "2027-06-11",
      clinicalExam: "Normal",
      breastsExam: "Normal",
      cervixExam: "Normal",
      pelvisExam: "Normal",
      dentalExam: "Normal",
      hemoglobin1: 12.6,
      bloodGlucose1: 84,
      vdrlRpr1: "No reactivo",
      hivScreening1: "Negativo",
      hepatitisBScreening: "Negativo",
      completeUrineExam: "Normal",
      urineCulture: "Negativo",
      papTestResult: "Normal",
      colposcopyResult: "Normal",
    },
    visits: [
      {
        visitNumber: 1,
        visitDate: "2026-10-16",
        visitTime: "09:30",
        gestationalAgeWeeks: 6,
        gestationalAgeDays: 0,
        maternalWeightKg: 57.0,
        temperature: 36.6,
        bloodPressure: "105/65",
        maternalPulse: 74,
        uterineHeightCm: 0,
        fetusSituation: "NA",
        fetusPresentation: "NA",
        fetusPosition: "NA",
        fetalHeartRate: 0,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "SE",
        tendonReflex: "+",
        ironFolicAcidGiven: false,
        calciumGiven: false,
        counselingGiven: "NUT / ALARMA",
        nextAppointmentDate: "2026-11-13",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Captación precoz de gestante. Se inicia Ácido Fólico 0.5mg y solicitud de perfil prenatal.",
      },
      {
        visitNumber: 2,
        visitDate: "2026-11-13",
        visitTime: "10:15",
        gestationalAgeWeeks: 10,
        gestationalAgeDays: 0,
        maternalWeightKg: 57.5,
        temperature: 36.5,
        bloodPressure: "110/68",
        maternalPulse: 76,
        uterineHeightCm: 0,
        fetusSituation: "NA",
        fetusPresentation: "NA",
        fetusPosition: "NA",
        fetalHeartRate: 162,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "SE",
        tendonReflex: "+",
        ironFolicAcidGiven: false,
        calciumGiven: false,
        counselingGiven: "NUT / GENETICA",
        ultrasoundGestationalAge: "10 sem 1 d",
        nextAppointmentDate: "2026-12-11",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Vitalidad fetal confirmada por Doppler portátil (FCF 162 lpm). Programar ecografía genética (semana 12).",
      },
    ],
    maternalPathologies: [],
    createdAt: "2026-10-16T09:30:00Z",
    updatedAt: "2026-11-13T10:15:00Z",
  },
];

// Tarifario Médico Inicial (8 Exámenes y Procedimientos)
export const INITIAL_TARIFF: ProcedureTariff[] = [
  {
    id: "tar-01",
    code: "GIN-001",
    name: "Consulta Ginecológica Especializada",
    category: "Consulta",
    description: "Evaluación integral gineco-obstétrica, historia clínica y prescripción",
    price: 200.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-02",
    code: "COL-001",
    name: "Colposcopía Digital + Informe Fotográfico",
    category: "Procedimiento",
    description: "Evaluación colposcópica de alta definición con reporte gráfico a color",
    price: 250.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-03",
    code: "ECO-001",
    name: "Ecografía Transvaginal Doppler",
    category: "Ecografía",
    description: "Mapeo pélvico endocavitario de útero, endometrio y anexos con doppler color",
    price: 180.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-04",
    code: "ECO-002",
    name: "Ecografía Mamaria Bilateral",
    category: "Ecografía",
    description: "Exploración bilateral de parénquima mamario y cadenas ganglionares axilares",
    price: 180.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-05",
    code: "LAB-001",
    name: "Toma de Papanicolaou Base Líquida (ThinPrep)",
    category: "Laboratorio",
    description: "Citología monocapa cervical procesada en medio líquido de máxima sensibilidad",
    price: 120.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-06",
    code: "LAB-002",
    name: "Panel VPH 23 Genotipos PCR",
    category: "Laboratorio",
    description: "Detección molecular de 14 genotipos de alto riesgo y 9 de bajo riesgo oncogénico",
    price: 280.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-07",
    code: "PRC-002",
    name: "Biopsia de Cérvix Dirigida por Colposcopía",
    category: "Procedimiento",
    description: "Toma de tejido cervical con pinza Tischler bajo magnificación óptica + frasco formol",
    price: 320.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "tar-08",
    code: "PAQ-001",
    name: "Paquete Chequeo Integral Ginecológico CENDO",
    category: "Paquete",
    description: "Consulta + Colposcopía + PAP Base Líquida + Ecografía Transvaginal + Ecografía Mamaria",
    price: 650.0,
    active: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
];

// Vademécum Ginecológico Inicial (8 Fármacos Clave con Marcas y Precios en S/)
export const INITIAL_VADEMECUM: MedicationVademecum[] = [
  {
    id: "vad-01",
    genericName: "Mupirocina 2%",
    atcCode: "D06AX09",
    therapeuticGroup: "Antibiótico Tópico Dérmico / Vulvar",
    indications: "Foliculitis vulvar, forúnculos, piodermitis y lesiones sobreinfectadas perivulvares.",
    contraindications: "Hipersensibilidad al principio activo o polietilenglicol en heridas abiertas extensas.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Bactroban", laboratory: "GSK", presentation: "Tubo ungüento 15g", referencePricePen: 46.5 },
      { brandName: "Mupax", laboratory: "Roemmers", presentation: "Tubo pomada 15g", referencePricePen: 38.0 },
      { brandName: "Mupirocina Genérico", laboratory: "Genfar / Portugal", presentation: "Tubo ungüento 15g", referencePricePen: 18.5 },
    ],
  },
  {
    id: "vad-02",
    genericName: "Dienogest 2mg",
    atcCode: "G03DB08",
    therapeuticGroup: "Progestágeno / Tratamiento de Endometriosis",
    indications: "Tratamiento de primera línea de la endometriosis sintomática, dolor pélvico crónico y dismenorrea severa.",
    contraindications: "Enfermedad tromboembólica venosa activa, patología arterial grave, sangrado no diagnosticado.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Visannette", laboratory: "Bayer", presentation: "Caja x 28 comprimidos", referencePricePen: 195.0 },
      { brandName: "Dienopill", laboratory: "Medicamenta / Recalcine", presentation: "Caja x 28 comprimidos", referencePricePen: 135.0 },
      { brandName: "Endometriox", laboratory: "Siegfried", presentation: "Caja x 30 tabletas", referencePricePen: 142.0 },
    ],
  },
  {
    id: "vad-03",
    genericName: "Ácido Tranexámico 500mg",
    atcCode: "B02AA02",
    therapeuticGroup: "Antifibrinolítico / Hemostático",
    indications: "Sangrado uterino anormal abundante (menorragia), hemorragia asociada a miomas o DIU.",
    contraindications: "Trombofilias, historial de trombosis activa, falla renal severa.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Amstat", laboratory: "Medifarma", presentation: "Caja x 20 tabletas", referencePricePen: 68.0 },
      { brandName: "Tranex", laboratory: "Maver", presentation: "Caja x 30 comprimidos", referencePricePen: 85.0 },
      { brandName: "Ácido Tranexámico Genérico", laboratory: "Sanofi / Genfar", presentation: "Caja x 20 tabletas", referencePricePen: 34.0 },
    ],
  },
  {
    id: "vad-04",
    genericName: "Fluconazol 150mg",
    atcCode: "J02AC01",
    therapeuticGroup: "Antimicótico Sistémico",
    indications: "Candidiasis vulvovaginal aguda, recurrente o resistente al tratamiento local.",
    contraindications: "Uso simultáneo con fármacos que prolonguen el intervalo QT, hepatopatía aguda severa.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Diflucan", laboratory: "Pfizer", presentation: "Caja x 1 cápsula", referencePricePen: 32.0 },
      { brandName: "Mutum", laboratory: "Roemmers", presentation: "Caja x 2 cápsulas", referencePricePen: 28.5 },
      { brandName: "Fluconazol Genérico", laboratory: "Medifarma / AC Farma", presentation: "Caja x 2 cápsulas", referencePricePen: 9.5 },
    ],
  },
  {
    id: "vad-05",
    genericName: "Metronidazol 500mg + Miconazol 100mg",
    atcCode: "G01AF20",
    therapeuticGroup: "Antibacteriano, Antiparasitario y Antimicótico Vaginal",
    indications: "Vaginitis y vaginosis mixtas causadas por Gardnerella, Trichomonas vaginalis y Candida albicans.",
    contraindications: "Primer trimestre de gestación, consumo concomitante de alcohol, hipersensibilidad a imidazoles.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Ginedazol", laboratory: "Roemmers", presentation: "Caja x 10 óvulos vaginales", referencePricePen: 48.0 },
      { brandName: "Neo-Penotran Forte", laboratory: "Bayer", presentation: "Caja x 7 óvulos vaginales", referencePricePen: 72.0 },
      { brandName: "Micospor Met", laboratory: "Bagó", presentation: "Caja x 10 óvulos", referencePricePen: 42.0 },
    ],
  },
  {
    id: "vad-06",
    genericName: "Clindamicina 100mg + Ketoconazol 400mg",
    atcCode: "G01AA51",
    therapeuticGroup: "Terapia Dual Vaginal de Amplio Espectro",
    indications: "Vaginosis bacteriana recurrente y vaginitis mixta inespecífica con flora polimicrobiana.",
    contraindications: "Antecedentes de colitis enterotóxica o colitis asociada a antibióticos, hipersensibilidad a lincosamidas.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Vagitrol V", laboratory: "Armstrong / Siegfried", presentation: "Caja x 7 óvulos vaginales", referencePricePen: 64.0 },
      { brandName: "Trexen Duo", laboratory: "Medicamenta", presentation: "Caja x 7 óvulos", referencePricePen: 69.5 },
      { brandName: "Femisan", laboratory: "Medifarma", presentation: "Caja x 7 óvulos", referencePricePen: 49.0 },
    ],
  },
  {
    id: "vad-07",
    genericName: "Doxiciclina 100mg",
    atcCode: "J01AA02",
    therapeuticGroup: "Tetraciclina / Antibacteriano Sistémico",
    indications: "Enfermedad Pélvica Inflamatoria (EPI), cervicitis por Chlamydia trachomatis y Mycoplasma genitalium.",
    contraindications: "Embarazo, período de lactancia materna, menores de 12 años, insuficiencia hepática severa.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Vibramicina", laboratory: "Pfizer", presentation: "Caja x 10 cápsulas", referencePricePen: 44.0 },
      { brandName: "Doxipil", laboratory: "Recalcine", presentation: "Caja x 14 tabletas", referencePricePen: 36.0 },
      { brandName: "Doxiciclina Genfar", laboratory: "Genfar", presentation: "Caja x 10 cápsulas", referencePricePen: 14.0 },
    ],
  },
  {
    id: "vad-08",
    genericName: "Naproxeno Sódico 550mg",
    atcCode: "M01AE02",
    therapeuticGroup: "Antiinflamatorio No Esteroideo (AINE) de Alta Potencia",
    indications: "Dolor pélvico agudo, dismenorrea moderada/severa, analgesia post-procedimientos ginecológicos.",
    contraindications: "Úlcera péptica activa, hemorragia digestiva, tercer trimestre del embarazo, insuficiencia cardíaca descompensada.",
    createdAt: "2026-11-01T00:00:00Z",
    commercialBrands: [
      { brandName: "Flanax 550", laboratory: "Bayer", presentation: "Caja x 20 tabletas recubiertas", referencePricePen: 48.0 },
      { brandName: "Apronax 550", laboratory: "Bayer / Aleve", presentation: "Caja x 24 tabletas", referencePricePen: 52.0 },
      { brandName: "Naproxeno Genérico", laboratory: "Portugal / Medifarma", presentation: "Caja x 20 tabletas", referencePricePen: 16.0 },
    ],
  },
];

// Estado Global del Sistema Médico
interface MedicalStoreState {
  // Autenticación, Médicos y Usuarios
  doctorsList: DoctorProfile[];
  doctorProfile: DoctorProfile;
  isAuthenticated: boolean;
  userRole: "doctor" | "admin" | "assistant";
  loginDemo: () => void;
  loginCustom: (email: string) => void;
  loginWithCredentials: (
    email: string,
    password?: string
  ) => { success: boolean; doctor?: DoctorProfile; error?: string };
  switchActiveDoctor: (doctorId: string) => void;
  addDoctor: (doctor: Omit<DoctorProfile, "id" | "createdAt">) => DoctorProfile;
  updateDoctor: (id: string, updates: Partial<DoctorProfile>) => void;
  resetDoctorPassword: (
    doctorId: string,
    newPassword: string
  ) => { success: boolean; error?: string };
  deleteDoctor: (id: string) => { success: boolean; error?: string };
  toggleDoctorActive: (id: string) => void;
  logout: () => void;

  // Pacientes
  patients: Patient[];
  addPatient: (patient: Omit<Patient, "id" | "createdAt" | "updatedAt">) => Patient;
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  getPatientById: (id: string) => Patient | undefined;
  getPatientByDni: (dni: string) => Patient | undefined;

  // Antecedentes
  backgrounds: Record<string, PatientBackground>;
  updateBackground: (patientId: string, data: Partial<PatientBackground>) => void;
  getBackground: (patientId: string) => PatientBackground | undefined;

  // Colposcopías
  colposcopyReports: ColposcopyReport[];
  addColposcopyReport: (report: Omit<ColposcopyReport, "id" | "createdAt">) => ColposcopyReport;
  updateColposcopyReport: (id: string, updates: Partial<ColposcopyReport>) => void;
  deleteColposcopyReport: (id: string) => void;
  getColposcopyByPatientId: (patientId: string) => ColposcopyReport[];

  // Chequeos y Ecografías
  clinicalCheckups: ClinicalCheckup[];
  addClinicalCheckup: (checkup: Omit<ClinicalCheckup, "id" | "createdAt">) => ClinicalCheckup;
  updateClinicalCheckup: (id: string, updates: Partial<ClinicalCheckup>) => void;
  deleteClinicalCheckup: (id: string) => void;
  getCheckupsByPatientId: (patientId: string) => ClinicalCheckup[];

  // Tarifario
  tariffItems: ProcedureTariff[];
  addTariffItem: (item: Omit<ProcedureTariff, "id" | "createdAt">) => ProcedureTariff;
  updateTariffItem: (id: string, updates: Partial<ProcedureTariff>) => void;
  deleteTariffItem: (id: string) => void;

  // Vademécum
  vademecumItems: MedicationVademecum[];
  addVademecumItem: (item: Omit<MedicationVademecum, "id" | "createdAt">) => MedicationVademecum;
  updateVademecumItem: (id: string, updates: Partial<MedicationVademecum>) => void;
  deleteVademecumItem: (id: string) => void;

  // Recetas Médicas Inteligentes
  prescriptions: MedicalPrescription[];
  addPrescription: (
    prescription: Omit<MedicalPrescription, "id" | "createdAt" | "updatedAt">
  ) => MedicalPrescription;
  updatePrescription: (
    id: string,
    updates: Partial<MedicalPrescription>
  ) => void;
  deletePrescription: (id: string) => void;
  getPrescriptionsByPatientId: (patientId: string) => MedicalPrescription[];

  // Órdenes de Laboratorio Clínico
  labOrders: LabOrder[];
  addLabOrder: (
    order: Omit<LabOrder, "id" | "createdAt" | "updatedAt">
  ) => LabOrder;
  updateLabOrder: (
    id: string,
    updates: Partial<LabOrder>
  ) => void;
  deleteLabOrder: (id: string) => void;
  getLabOrdersByPatientId: (patientId: string) => LabOrder[];

  // Carnet de Control Prenatal Oficial (MINSA / CLAP)
  prenatalCards: PrenatalCard[];
  addPrenatalCard: (
    card: Omit<PrenatalCard, "id" | "createdAt" | "updatedAt">
  ) => PrenatalCard;
  updatePrenatalCard: (id: string, updates: Partial<PrenatalCard>) => void;
  deletePrenatalCard: (id: string) => void;
  getPrenatalCardByPatientId: (patientId: string) => PrenatalCard | undefined;
  addPrenatalVisit: (cardId: string, visit: PrenatalVisitItem) => void;
  updatePrenatalVisit: (
    cardId: string,
    visitIndex: number,
    visit: PrenatalVisitItem
  ) => void;
  deletePrenatalVisit: (cardId: string, visitIndex: number) => void;

  // Reset a datos iniciales
  resetToSeedData: () => void;
}

export const useMedicalStore = create<MedicalStoreState>()(
  persist(
    (set, get) => ({
      // MÉDICOS Y EQUIPO ASISTENCIAL
      doctorsList: INITIAL_DOCTORS,
      doctorProfile: INITIAL_DOCTOR,
      isAuthenticated: false,
      userRole: "admin",

      loginDemo: () => {
        const state = get();
        const patrick = (state.doctorsList || INITIAL_DOCTORS).find(
          (d) => d.id === "doc-patrick-jacinto"
        ) || INITIAL_DOCTOR;
        set({
          isAuthenticated: true,
          userRole: "admin",
          doctorProfile: patrick,
        });
      },

      loginCustom: (email: string) => {
        const state = get();
        const list = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
        const found = list.find((d) => d.email.toLowerCase() === email.trim().toLowerCase());
        const doctor = found || { ...INITIAL_DOCTOR, email };
        set({
          isAuthenticated: true,
          userRole: doctor.role === "director" ? "admin" : "doctor",
          doctorProfile: doctor,
        });
      },

      loginWithCredentials: (email: string, password?: string) => {
        const state = get();
        const cleanEmail = email.trim().toLowerCase();
        const list = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
        const found = list.find((d) => d.email.toLowerCase() === cleanEmail);

        if (!found) {
          return {
            success: false,
            error: "El correo electrónico no se encuentra registrado en el sistema CENDO.",
          };
        }

        if (!found.isActive) {
          return {
            success: false,
            error: "Esta cuenta médica se encuentra inactiva. Contacte al Director Médico (Dr. Patrick Jacinto).",
          };
        }

        if (password && found.password && found.password !== password) {
          return {
            success: false,
            error: "Contraseña incorrecta. Verifique sus credenciales institucionales.",
          };
        }

        set({
          doctorProfile: found,
          isAuthenticated: true,
          userRole: found.role === "director" ? "admin" : "doctor",
        });

        return { success: true, doctor: found };
      },

      switchActiveDoctor: (doctorId: string) => {
        const state = get();
        const list = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
        const found = list.find((d) => d.id === doctorId);
        if (found) {
          set({
            doctorProfile: found,
            isAuthenticated: true,
            userRole: found.role === "director" ? "admin" : "doctor",
          });
        }
      },

      addDoctor: (doctorData) => {
        const id = `doc-${Date.now()}`;
        const newDoctor: DoctorProfile = {
          ...doctorData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => {
          const currentList = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
          return {
            doctorsList: [...currentList, newDoctor],
          };
        });
        return newDoctor;
      },

      updateDoctor: (id, updates) => {
        set((state) => {
          const currentList = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
          const updatedList = currentList.map((d) => (d.id === id ? { ...d, ...updates } : d));
          const updatedActive = state.doctorProfile.id === id ? { ...state.doctorProfile, ...updates } : state.doctorProfile;
          return {
            doctorsList: updatedList,
            doctorProfile: updatedActive,
          };
        });
      },

      resetDoctorPassword: (doctorId, newPassword) => {
        const state = get();
        const currentList = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
        const doctor = currentList.find((d) => d.id === doctorId);
        if (!doctor) {
          return { success: false, error: "Profesional médico no encontrado en CENDO." };
        }
        const updatedList = currentList.map((d) =>
          d.id === doctorId ? { ...d, password: newPassword } : d
        );
        const updatedActive =
          state.doctorProfile.id === doctorId
            ? { ...state.doctorProfile, password: newPassword }
            : state.doctorProfile;
        set({
          doctorsList: updatedList,
          doctorProfile: updatedActive,
        });
        return { success: true };
      },

      deleteDoctor: (id) => {
        if (id === "doc-patrick-jacinto") {
          return {
            success: false,
            error: "No se puede eliminar la cuenta del Director Médico Principal (Dr. Patrick Jacinto).",
          };
        }
        set((state) => {
          const currentList = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
          const filtered = currentList.filter((d) => d.id !== id);
          const newActive = state.doctorProfile.id === id ? (filtered[0] || INITIAL_DOCTOR) : state.doctorProfile;
          return {
            doctorsList: filtered,
            doctorProfile: newActive,
          };
        });
        return { success: true };
      },

      toggleDoctorActive: (id) => {
        if (id === "doc-patrick-jacinto") return;
        set((state) => {
          const currentList = state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS;
          const updated = currentList.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
          return { doctorsList: updated };
        });
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      // PACIENTES
      patients: INITIAL_PATIENTS,
      addPatient: (patientData) => {
        const id = `pat-${Date.now()}`;
        const now = new Date().toISOString();
        const newPatient: Patient = {
          ...patientData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          patients: [newPatient, ...state.patients],
        }));
        // Sincronización transparente en segundo plano con Supabase Cloud
        syncPatientToSupabase(newPatient);
        return newPatient;
      },
      updatePatient: (id, updates) => {
        let updatedPatient: Patient | null = null;
        set((state) => ({
          patients: state.patients.map((p) => {
            if (p.id === id) {
              updatedPatient = { ...p, ...updates, updatedAt: new Date().toISOString() };
              return updatedPatient;
            }
            return p;
          }),
        }));
        if (updatedPatient) {
          syncPatientToSupabase(updatedPatient);
        }
      },
      deletePatient: (id) => {
        const targetPatient = get().patients.find((p) => p.id === id);
        const targetDni = targetPatient?.dni;
        set((state) => {
          const nextBackgrounds = { ...state.backgrounds };
          delete nextBackgrounds[id];
          return {
            patients: state.patients.filter((p) => p.id !== id),
            backgrounds: nextBackgrounds,
            colposcopyReports: state.colposcopyReports.filter((r) => r.patientId !== id),
            clinicalCheckups: state.clinicalCheckups.filter((c) => c.patientId !== id),
            prescriptions: state.prescriptions.filter((p) => p.patientId !== id),
            labOrders: state.labOrders.filter((l) => l.patientId !== id),
            prenatalCards: state.prenatalCards.filter((c) => c.patientId !== id),
          };
        });
        deletePatientFromSupabase(id, targetDni);
      },
      getPatientById: (id) => get().patients.find((p) => p.id === id),
      getPatientByDni: (dni) => get().patients.find((p) => p.dni === dni),

      // ANTECEDENTES
      backgrounds: INITIAL_BACKGROUNDS,
      updateBackground: (patientId, data) => {
        let updatedBg: PatientBackground | null = null;
        set((state) => {
          const current = state.backgrounds[patientId] || {
            id: `bg-${patientId}`,
            patientId,
            obstetricFormula: "G0 P0000",
            contraceptiveMethod: "Ninguno",
            lastMenstrualPeriod: "",
            papHistory: "No refiere",
            vphTestHistory: "No realizado",
            medicalAllergies: "Niega",
            surgeriesHistory: "Niega",
            familyHistory: "No refiere",
            updatedAt: new Date().toISOString(),
          };
          updatedBg = {
            ...current,
            ...data,
            updatedAt: new Date().toISOString(),
          };
          return {
            backgrounds: {
              ...state.backgrounds,
              [patientId]: updatedBg,
            },
          };
        });
        if (updatedBg) {
          syncBackgroundToSupabase(updatedBg);
        }
      },
      getBackground: (patientId) => get().backgrounds[patientId],

      // COLPOSCOPÍA
      colposcopyReports: INITIAL_COLPOSCOPY,
      addColposcopyReport: (reportData) => {
        const id = `colpo-${Date.now()}`;
        const newReport: ColposcopyReport = {
          ...reportData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          colposcopyReports: [newReport, ...state.colposcopyReports],
        }));
        syncColposcopyToSupabase(newReport);
        return newReport;
      },
      updateColposcopyReport: (id, updates) => {
        set((state) => ({
          colposcopyReports: state.colposcopyReports.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
      },
      deleteColposcopyReport: (id) => {
        set((state) => ({
          colposcopyReports: state.colposcopyReports.filter((r) => r.id !== id),
        }));
      },
      getColposcopyByPatientId: (patientId) =>
        get().colposcopyReports.filter((r) => r.patientId === patientId),

      // CHEQUEOS
      clinicalCheckups: INITIAL_CHECKUPS,
      addClinicalCheckup: (checkupData) => {
        const id = `chk-${Date.now()}`;
        const newCheckup: ClinicalCheckup = {
          ...checkupData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          clinicalCheckups: [newCheckup, ...state.clinicalCheckups],
        }));
        return newCheckup;
      },
      updateClinicalCheckup: (id, updates) => {
        set((state) => ({
          clinicalCheckups: state.clinicalCheckups.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        }));
      },
      deleteClinicalCheckup: (id) => {
        set((state) => ({
          clinicalCheckups: state.clinicalCheckups.filter((c) => c.id !== id),
        }));
      },
      getCheckupsByPatientId: (patientId) =>
        get().clinicalCheckups.filter((c) => c.patientId === patientId),

      // TARIFARIO
      tariffItems: INITIAL_TARIFF,
      addTariffItem: (item) => {
        const newItem: ProcedureTariff = {
          ...item,
          id: `tar-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tariffItems: [newItem, ...state.tariffItems],
        }));
        return newItem;
      },
      updateTariffItem: (id, updates) => {
        set((state) => ({
          tariffItems: state.tariffItems.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        }));
      },
      deleteTariffItem: (id) => {
        set((state) => ({
          tariffItems: state.tariffItems.filter((t) => t.id !== id),
        }));
      },

      // VADEMÉCUM
      vademecumItems: INITIAL_VADEMECUM,
      addVademecumItem: (item) => {
        const newItem: MedicationVademecum = {
          ...item,
          id: `vad-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          vademecumItems: [newItem, ...state.vademecumItems],
        }));
        return newItem;
      },
      updateVademecumItem: (id, updates) => {
        set((state) => ({
          vademecumItems: state.vademecumItems.map((v) => (v.id === id ? { ...v, ...updates } : v)),
        }));
      },
      deleteVademecumItem: (id) => {
        set((state) => ({
          vademecumItems: state.vademecumItems.filter((v) => v.id !== id),
        }));
      },

      // RECETAS MÉDICAS INTELIGENTES
      prescriptions: INITIAL_PRESCRIPTIONS,
      addPrescription: (data) => {
        const id = `rec-${Date.now()}`;
        const now = new Date().toISOString();
        const newPrescription: MedicalPrescription = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const currentList = state.prescriptions || [];
          return {
            prescriptions: [newPrescription, ...currentList],
          };
        });
        syncPrescriptionToSupabase(newPrescription);
        return newPrescription;
      },
      updatePrescription: (id, updates) => {
        let updated: MedicalPrescription | null = null;
        set((state) => ({
          prescriptions: (state.prescriptions || []).map((p) => {
            if (p.id === id) {
              updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return p;
          }),
        }));
        if (updated) syncPrescriptionToSupabase(updated);
      },
      deletePrescription: (id) => {
        set((state) => ({
          prescriptions: (state.prescriptions || []).filter((p) => p.id !== id),
        }));
        deletePrescriptionFromSupabase(id);
      },
      getPrescriptionsByPatientId: (patientId) => {
        const list = get().prescriptions || [];
        return list.filter((p) => p.patientId === patientId);
      },

      // ÓRDENES DE LABORATORIO CLÍNICO
      labOrders: INITIAL_LAB_ORDERS,
      addLabOrder: (data) => {
        const id = `lab-${Date.now()}`;
        const now = new Date().toISOString();
        const newLabOrder: LabOrder = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const currentList = state.labOrders || [];
          return {
            labOrders: [newLabOrder, ...currentList],
          };
        });
        syncLabOrderToSupabase(newLabOrder);
        return newLabOrder;
      },
      updateLabOrder: (id, updates) => {
        let updated: LabOrder | null = null;
        set((state) => ({
          labOrders: (state.labOrders || []).map((ord) => {
            if (ord.id === id) {
              updated = { ...ord, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return ord;
          }),
        }));
        if (updated) syncLabOrderToSupabase(updated);
      },
      deleteLabOrder: (id) => {
        set((state) => ({
          labOrders: (state.labOrders || []).filter((ord) => ord.id !== id),
        }));
        deleteLabOrderFromSupabase(id);
      },
      getLabOrdersByPatientId: (patientId) => {
        const list = get().labOrders || [];
        return list.filter((ord) => ord.patientId === patientId);
      },

      // CARNET DE CONTROL PRENATAL OFICIAL (MINSA / CLAP)
      prenatalCards: INITIAL_PRENATAL_CARDS,
      addPrenatalCard: (data) => {
        const id = `pnc-${Date.now()}`;
        const now = new Date().toISOString();
        const newCard: PrenatalCard = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => {
          const currentList = state.prenatalCards || [];
          return {
            prenatalCards: [newCard, ...currentList],
          };
        });
        syncPrenatalCardToSupabase(newCard);
        return newCard;
      },
      updatePrenatalCard: (id, updates) => {
        let updated: PrenatalCard | null = null;
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id === id) {
              updated = { ...card, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return card;
          }),
        }));
        if (updated) syncPrenatalCardToSupabase(updated);
      },
      deletePrenatalCard: (id) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).filter((c) => c.id !== id),
        }));
        deletePrenatalCardFromSupabase(id);
      },
      getPrenatalCardByPatientId: (patientId) => {
        const list = get().prenatalCards || [];
        return list.find((c) => c.patientId === patientId);
      },
      addPrenatalVisit: (cardId, visit) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id !== cardId) return card;
            const updatedVisits = [...(card.visits || []), visit].slice(0, 9);
            return {
              ...card,
              visits: updatedVisits,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      updatePrenatalVisit: (cardId, visitIndex, visit) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id !== cardId) return card;
            const updatedVisits = [...(card.visits || [])];
            if (visitIndex >= 0 && visitIndex < updatedVisits.length) {
              updatedVisits[visitIndex] = visit;
            }
            return {
              ...card,
              visits: updatedVisits,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },
      deletePrenatalVisit: (cardId, visitIndex) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id !== cardId) return card;
            const updatedVisits = (card.visits || []).filter((_, idx) => idx !== visitIndex);
            return {
              ...card,
              visits: updatedVisits,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // RESET
      resetToSeedData: () => {
        set({
          doctorsList: INITIAL_DOCTORS,
          doctorProfile: INITIAL_DOCTOR,
          patients: INITIAL_PATIENTS,
          backgrounds: INITIAL_BACKGROUNDS,
          colposcopyReports: INITIAL_COLPOSCOPY,
          clinicalCheckups: INITIAL_CHECKUPS,
          prescriptions: INITIAL_PRESCRIPTIONS,
          labOrders: INITIAL_LAB_ORDERS,
          prenatalCards: INITIAL_PRENATAL_CARDS,
          tariffItems: INITIAL_TARIFF,
          vademecumItems: INITIAL_VADEMECUM,
        });
      },
    }),
    {
      name: "cendo-storage",
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            ...(persistedState || {}),
            doctorsList: INITIAL_DOCTORS,
            doctorProfile: INITIAL_DOCTOR,
            patients: INITIAL_PATIENTS,
            backgrounds: INITIAL_BACKGROUNDS,
            colposcopyReports: INITIAL_COLPOSCOPY,
            clinicalCheckups: INITIAL_CHECKUPS,
            prescriptions: INITIAL_PRESCRIPTIONS,
            labOrders: INITIAL_LAB_ORDERS,
            prenatalCards: INITIAL_PRENATAL_CARDS,
            tariffItems: persistedState?.tariffItems || INITIAL_TARIFF,
            vademecumItems: persistedState?.vademecumItems || INITIAL_VADEMECUM,
          };
        }
        return persistedState;
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);

