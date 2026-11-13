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
    id: "doc-jose-carrasco",
    email: "jcarrasco@cendo.pe",
    password: "jcarrasco@cendo",
    fullName: "José Luis Carrasco Pérez",
    doctorTitle: "Dr.",
    specialty: "Ginecología Oncológica y Patología Cervical",
    cmp: "58412",
    rne: "34910",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "981 234 567",
    contactEmail: "jcarrasco@cendo.pe",
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "doctor",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "doc-scheiler-jacinto",
    email: "sjacinto@cendo.pe",
    password: "sjacinto@cendo",
    fullName: "Scheiler José Jacinto Gomero",
    doctorTitle: "Dr.",
    specialty: "Cirugía Ginecológica Mínimamente Invasiva y Fertilidad",
    cmp: "65219",
    rne: "40112",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "993 876 543",
    contactEmail: "sjacinto@cendo.pe",
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "doctor",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
  {
    id: "doc-valeria-mendoza",
    email: "vmendoza@cendo.pe",
    password: "vmendoza@cendo",
    fullName: "Valeria Mendoza Quiroz",
    doctorTitle: "Dra.",
    specialty: "Ginecología y Ecografía Doppler Fetal / Ginecológica",
    cmp: "70432",
    rne: "42180",
    clinicName: "CENDO - Centro de Endometriosis",
    clinicAddress: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
    phone: "994 555 123",
    contactEmail: "vmendoza@cendo.pe",
    avatarUrl: "https://images.unsplash.com/photo-1594824813583-0599c9c8e1a1?q=80&w=300&auto=format&fit=crop",
    signatureUrl: "",
    role: "doctor",
    isActive: true,
    createdAt: "2026-11-01T00:00:00Z",
  },
];

// Perfil Activo Inicial: Dr. Patrick José Jacinto Gomero (Director Médico)
export const INITIAL_DOCTOR: DoctorProfile = INITIAL_DOCTORS[0];

// Pacientes Semilla de Demostración Clínica CENDO
export const INITIAL_PATIENTS: Patient[] = [
  {
    id: "pat-stephany-herrera",
    dni: "72961954",
    firstName: "MARÍA STEPHANY",
    lastName: "HERRERA ROJAS",
    birthDate: "1998-02-28",
    age: 28,
    phone: "992 481 029",
    email: "stephany.herrera@email.com",
    address: "Calle Los Pinos 142, Dpto 502, Miraflores",
    civilStatus: "Soltera",
    occupation: "Licenciada en Administración",
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-02T15:30:00Z",
  },
  {
    id: "pat-camila-rossi",
    dni: "74829105",
    firstName: "CAMILA LUCÍA",
    lastName: "ROSSI VALDIVIA",
    birthDate: "2000-05-14",
    age: 26,
    phone: "987 654 321",
    email: "camila.rossi@gmail.com",
    address: "Av. 28 de Julio 884, Dpto 302, Miraflores",
    civilStatus: "Conviviente",
    occupation: "Arquitecta de Interiores",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-11T12:00:00Z",
  },
  {
    id: "pat-valeria-alarcon",
    dni: "71948263",
    firstName: "VALERIA SOFÍA",
    lastName: "ALARCÓN BENAVIDES",
    birthDate: "1995-08-20",
    age: 31,
    phone: "976 543 210",
    email: "valeria.alarcon@outlook.com",
    address: "Av. Angamos Oeste 1120, Dpto 401, Miraflores",
    civilStatus: "Soltera",
    occupation: "Ingeniera Industrial",
    createdAt: "2026-11-06T14:30:00Z",
    updatedAt: "2026-11-08T16:00:00Z",
  },
];

// Antecedentes Gineco-Obstétricos de las Pacientes Semilla
export const INITIAL_BACKGROUNDS: Record<string, PatientBackground> = {
  "pat-stephany-herrera": {
    id: "bg-stephany-herrera",
    patientId: "pat-stephany-herrera",
    menarche: 12,
    sexualDebutAge: 18,
    sexualPartnersCount: 2,
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Implante subdérmico",
    lastMenstrualPeriod: "2026-09-26",
    papHistory: "ASC-US (Células escamosas atípicas de significado indeterminado)",
    vphTestHistory: "Negativo (PCR 23 Genotipos)",
    medicalAllergies: "Niega alergias medicamentosas",
    surgeriesHistory: "Apendicectomía laparoscópica (2021)",
    familyHistory: "Madre con antecedente de miomatosis uterina operada",
    notes: "Paciente acude a chequeo ginecológico y evaluación por resultado PAP.",
    updatedAt: "2026-11-02T15:30:00Z",
  },
  "pat-camila-rossi": {
    id: "bg-camila-rossi",
    patientId: "pat-camila-rossi",
    menarche: 13,
    sexualDebutAge: 19,
    sexualPartnersCount: 1,
    obstetricFormula: "G1 P0000",
    contraceptiveMethod: "Ninguno (Embarazo planificado)",
    lastMenstrualPeriod: "2026-07-08",
    papHistory: "Negativo para lesión intraepitelial (2025)",
    vphTestHistory: "No realizado",
    medicalAllergies: "Niega alergias medicamentosas",
    surgeriesHistory: "Niega cirugías previas",
    familyHistory: "Sin antecedentes familiares de diabetes gestacional ni preeclampsia",
    notes: "Gestante primigesta de 18 semanas que cursa embarazo normoevolutivo.",
    updatedAt: "2026-11-11T12:00:00Z",
  },
  "pat-valeria-alarcon": {
    id: "bg-valeria-alarcon",
    patientId: "pat-valeria-alarcon",
    menarche: 11,
    sexualDebutAge: 17,
    sexualPartnersCount: 3,
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Preservativo de barrera",
    lastMenstrualPeriod: "2026-10-18",
    papHistory: "LIE-BG (Lesión Intraepitelial Escamosa de Bajo Grado / NIC 1)",
    vphTestHistory: "Positivo para genotipos de alto riesgo",
    medicalAllergies: "Alergia confirmada a la Penicilina",
    surgeriesHistory: "Niega antecedentes quirúrgicos",
    familyHistory: "Hermana menor con antecedente de endometriosis pélvica laparoscópica",
    notes: "Paciente con dismenorrea severa EVA 8/10, dispareunia profunda y citología cervical anormal.",
    updatedAt: "2026-11-08T16:00:00Z",
  },
};

// Informe Colposcópico Semilla Real
export const INITIAL_COLPOSCOPY: ColposcopyReport[] = [
  {
    id: "colpo-stephany-01",
    patientId: "pat-stephany-herrera",
    reportDate: "2026-11-02",
    adequateColposcopy: true,
    squamocolumnarJunctionVisible: "No visible",
    transformationZoneType: "Tipo 1",
    matureSquamousEpithelium: true,
    ectopy: true,
    thinAcetowhiteEpithelium: true,
    denseAcetowhiteEpithelium: false,
    irregularBorder: true,
    fineMosaic: false,
    coarseMosaic: false,
    finePunctation: false,
    coarsePunctation: false,
    atypicalVessels: false,
    schillerTest: "Negativo (Lugol Caoba)",
    cervicalBiopsyTaken: false,
    biopsyClockHours: [],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Cérvix con SSF: Ectopia periorificial sin sangrado",
        timestamp: "2026-11-02 11:15",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Epitelio acetoblanco tenue con borde irregular",
        timestamp: "2026-11-02 11:18",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Zona de transformación Tipo 1 ampliada",
        timestamp: "2026-11-02 11:21",
      },
      {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Captación homogénea caoba (Negativo)",
        timestamp: "2026-11-02 11:24",
      },
    ],
    diagnosis:
      "1. Colposcopía adecuada. 2. ZT Tipo 1. 3. Descartar displasia cervical (LIEBG vs cambios reactivos inflamatorios) - Se sugiere biopsia de cérvix si persiste PAP anormal.",
    planRecommendations:
      "Control citológico en 6 meses o biopsia de cérvix dirigida en persistencia de atipia citológica.",
    cie10Code: "N87.9",
    doctorName: "Dr. Patrick José Jacinto Gomero (CMP 61693 / RNE 38657)",
    createdAt: "2026-11-02T11:30:00Z",
  },
  {
    id: "colpo-valeria-01",
    patientId: "pat-valeria-alarcon",
    reportDate: "2026-11-08",
    adequateColposcopy: true,
    squamocolumnarJunctionVisible: "Visible",
    transformationZoneType: "Tipo 1",
    matureSquamousEpithelium: true,
    ectopy: true,
    nabothCyst: false,
    cryptOpenings: true,
    deciduosis: false,
    thinAcetowhiteEpithelium: true,
    denseAcetowhiteEpithelium: false,
    irregularBorder: true,
    fineMosaic: true,
    coarseMosaic: false,
    finePunctation: true,
    coarsePunctation: false,
    sharpBorders: false,
    atypicalVessels: false,
    leukoplakia: false,
    schillerTest: "Positivo (Yodonegativo en horas 12 y 6)",
    cervicalBiopsyTaken: true,
    biopsyClockHours: ["12", "6"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Cérvix con SSF: Ectropion periorificial con epitelio columnar evertido",
        timestamp: "2026-11-08 14:45",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Acetoblanco tenue con punteado fino en hora 12",
        timestamp: "2026-11-08 14:48",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Mosaico fino focal en labio posterior a horas 6",
        timestamp: "2026-11-08 14:51",
      },
      {
        url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Lugol: Captación heterogénea con yodonegatividad en horas 12 y 6",
        timestamp: "2026-11-08 14:54",
      },
    ],
    diagnosis:
      "1. Colposcopía adecuada. 2. ZT Tipo 1. 3. Hallazgos colposcópicos anormales Grado 1 (menor): Mosaico fino y punteado fino a horas 12 y 6 compatible con LIE-BG (NIC 1).",
    planRecommendations:
      "Biopsia de cérvix dirigida tomada a horas 12:00 y 6:00 enviada a patología. Se indica control citológico en 6 meses y pauta hormonal para endometriosis asociada.",
    cie10Code: "N87.0",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    createdAt: "2026-11-08T15:00:00Z",
  },
];

// Informe de Chequeo y Ecografías Semilla Real
export const INITIAL_CHECKUPS: ClinicalCheckup[] = [
  {
    id: "chk-stephany-01",
    patientId: "pat-stephany-herrera",
    checkupDate: "2026-11-02",
    reasonForConsultation: "Chequeo ginecológico preventivo anual y revisión de implante",
    breastUltrasoundFindings:
      "Parénquima mamario bilateral de distribución normal. En mama izquierda a radio 10 se observa nódulo anecoico de 6.3 x 2.4 mm, bien delimitado, compatible con quiste simple.",
    breastUltrasoundBirads: "BI-RADS 2 (Benigno)",
    breastLesionMeasurements: "Quiste simple 6.3 x 2.4 mm en radio 10 mama izquierda",
    transvaginalUltrasoundFindings:
      "Útero en AVF de 68 x 38 x 49 mm, miometrio homogéneo sin nódulos. Endometrio fino de 2.2 mm compatible con atrofia medicamentosa esperada por implante subdérmico.",
    uterusMeasurements: "68 x 38 x 49 mm (Vol: 66 cc)",
    endometriumThicknessMm: 2.2,
    ovariesFindings: "Ovarios normales bilateralmente sin folículos patológicos ni masas anexiales.",
    papResult: "ASC-US (Células escamosas atípicas de significado indeterminado)",
    vphResult: "Negativo para 23 tipos oncogénicos y no oncogénicos",
    conclusions:
      "Chequeo ginecológico global satisfactorio. Quiste simple mamario izquierdo benigno (BI-RADS 2). Endometrio delgado atrófico fisiológico por implante.",
    medicalPrescription:
      "1. Continuar con implante subdérmico.\n2. Ecografía mamaria de control en 1 año.\n3. Repetir Papanicolaou en 6 meses.",
    createdAt: "2026-11-02T12:00:00Z",
  },
  {
    id: "chk-valeria-01",
    patientId: "pat-valeria-alarcon",
    checkupDate: "2026-11-08",
    reasonForConsultation: "Dismenorrea severa invalidante (EVA 8/10), dispareunia profunda y evaluación pélvica",
    breastUltrasoundFindings:
      "Mamas de ecogenicidad fibrogranular normal sin lesiones sólidas ni microcalcificaciones sospechosas. Regiones axilares libres.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin lesiones focales",
    transvaginalUltrasoundFindings:
      "Útero en retroversoflexión leve de 74 x 42 x 38 mm. Endometrio regular de 7.5 mm. En ovario izquierdo se visualiza imagen quística unilocular de 32 x 28 mm con ecos internos en vidrio esmerilado homogéneo compatible con endometrioma ovárico.",
    uterusMeasurements: "74 x 42 x 38 mm (Vol: 62 cc)",
    endometriumThicknessMm: 7.5,
    ovariesFindings: "Ovario derecho normal (25 x 18 mm). Ovario izquierdo aumentado de volumen con endometrioma de 32 mm.",
    papResult: "LIE-BG (Lesión Intraepitelial Escamosa de Bajo Grado)",
    vphResult: "Positivo para Virus del Papiloma Humano",
    conclusions:
      "1. Endometriosis ovárica izquierda (Endometrioma de 32 mm). 2. Dismenorrea secundaria severa. 3. Displasia cervical leve (LIE-BG).",
    medicalPrescription:
      "1. Dienogest 2mg diario continuo x 3 meses.\n2. Naproxeno sódico 550mg condicional al dolor.\n3. Control ecográfico transvaginal en 90 días.",
    createdAt: "2026-11-08T15:30:00Z",
  },
];

// Recetas Médicas Semilla Real
export const INITIAL_PRESCRIPTIONS: MedicalPrescription[] = [
  {
    id: "rec-stephany-01",
    patientId: "pat-stephany-herrera",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-02",
    diagnosis: "Vaginitis mixta y cervicitis periorificial",
    cie10Code: "N76.0",
    items: [
      {
        id: "item-01",
        medicationName: "Ginedazol (Metronidazol 500mg + Miconazol 100mg)",
        presentation: "Caja x 10 óvulos vaginales",
        route: "Vía Vaginal",
        dosage: "1 óvulo",
        frequency: "Cada 24 horas por las noches antes de acostarse",
        duration: "Por 7 días continuos",
        instructions:
          "Introducir profundamente en la vagina. Abstinencia sexual durante el tratamiento. No ingerir bebidas alcohólicas.",
        quantity: "1 caja",
      },
      {
        id: "item-02",
        medicationName: "Naproxeno Sódico 550mg (Flanax 550)",
        presentation: "Caja x 20 tabletas recubiertas",
        route: "Vía Oral",
        dosage: "1 tableta (550 mg)",
        frequency: "Cada 8 a 12 horas después de los alimentos",
        duration: "Por 3 a 5 días condicional al dolor",
        instructions:
          "Tomar con un vaso de agua tras ingerir alimentos. Suspender si el dolor cede.",
        quantity: "10 tabletas",
      },
    ],
    generalIndications:
      "Aseo de la zona íntima con agua tibia y jabón neutro. Usar ropa interior de algodón. Evitar duchas vaginales.",
    nextAppointmentDate: "2026-11-16",
    createdAt: "2026-11-02T12:15:00Z",
    updatedAt: "2026-11-02T12:15:00Z",
  },
  {
    id: "rec-camila-01",
    patientId: "pat-camila-rossi",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-11",
    diagnosis: "Supervisión de embarazo normal de 18 semanas - Suplementación prenatal",
    cie10Code: "Z34.8",
    items: [
      {
        id: "item-cam-01",
        medicationName: "Sulfato Ferroso 300mg + Ácido Fólico 400mcg (Hierro Elemental 60mg)",
        presentation: "Caja x 90 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta",
        frequency: "Cada 24 horas en ayunas",
        duration: "Durante todo el segundo y tercer trimestre (90 días)",
        instructions:
          "Tomar 30 minutos antes del desayuno con jugo de naranja o limonada rica en Vitamina C. No ingerir simultáneamente con leche, té o café.",
        quantity: "1 caja x 90 tabletas",
      },
      {
        id: "item-cam-02",
        medicationName: "Carbonato de Calcio 500mg + Colecalciferol 400 UI (Vitamina D3)",
        presentation: "Frasco x 60 tabletas masticables",
        route: "Vía Oral",
        dosage: "1 tableta masticable",
        frequency: "Cada 12 horas con las comidas principales",
        duration: "Por 60 días continuos",
        instructions:
          "Masticar bien después del almuerzo y la cena. Separar al menos 2 horas de la toma de hierro para evitar competencia en la absorción.",
        quantity: "1 frasco x 60 tabletas",
      },
    ],
    generalIndications:
      "Ingesta hídrica mínima de 2.5 litros de agua al día. Dieta balanceada rica en fibra, legumbres y vegetales verdes. Control de movimientos fetales diarios.",
    nextAppointmentDate: "2026-12-09",
    createdAt: "2026-11-11T12:30:00Z",
    updatedAt: "2026-11-11T12:30:00Z",
  },
  {
    id: "rec-valeria-01",
    patientId: "pat-valeria-alarcon",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-08",
    diagnosis: "Endometrioma ovárico izquierdo y dismenorrea secundaria severa",
    cie10Code: "N80.1",
    items: [
      {
        id: "item-val-01",
        medicationName: "Dienogest 2mg (Visannette / Endometriox)",
        presentation: "Caja x 28 comprimidos recubiertos",
        route: "Vía Oral",
        dosage: "1 comprimido (2 mg)",
        frequency: "Cada 24 horas a la misma hora todos los días",
        duration: "Por 3 meses continuos sin interrupción",
        instructions:
          "Tomar siempre al acostarse con un vaso con agua. Es fundamental la toma continua ininterrumpida aun en presencia de manchado (spotting).",
        quantity: "3 cajas x 28 comprimidos",
      },
      {
        id: "item-val-02",
        medicationName: "Naproxeno Sódico 550mg (Flanax 550)",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "1 tableta (550 mg)",
        frequency: "Cada 8 a 12 horas condicional al dolor pélvico",
        duration: "Por 3 a 5 días durante los picos de dolor",
        instructions:
          "Tomar siempre después de los alimentos para protección gástrica.",
        quantity: "1 caja x 20 tabletas",
      },
    ],
    generalIndications:
      "Evitar alimentos ultraprocesados e inflamatorios (azúcares refinados, carnes rojas en exceso). Realizar actividad física aeróbica de bajo impacto 30 min al día.",
    nextAppointmentDate: "2027-02-08",
    createdAt: "2026-11-08T15:45:00Z",
    updatedAt: "2026-11-08T15:45:00Z",
  },
];

// Órdenes de Laboratorio Clínico Iniciales
export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: "lab-stephany-01",
    patientId: "pat-stephany-herrera",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-02",
    diagnosis: "Evaluación por cervicitis y descarte de patología anexial / Endometriosis",
    cie10Code: "N87.0",
    urgency: "Rutina",
    items: [
      {
        id: "lab-item-1",
        category: "Ginecología & Marcadores",
        testName: "CA-125 (Marcador Ovárico y Endometriosis)",
        sampleType: "Sangre venosa",
        notes: "Ayuno de 8 horas",
      },
      {
        id: "lab-item-2",
        category: "Ginecología & Marcadores",
        testName: "Papanicolaou en Base Líquida (ThinPrep)",
        sampleType: "Secreción cervical",
        notes: "Abstinencia sexual 48 horas previas",
      },
      {
        id: "lab-item-3",
        category: "Infeccioso & Microbiología",
        testName: "Panel Tipificación VPH 23 Genotipos (PCR en tiempo real)",
        sampleType: "Muestra endocervical",
        notes: "Sin aplicación de óvulos ni cremas 48h antes",
      },
      {
        id: "lab-item-4",
        category: "Hematología & Bioquímica",
        testName: "Hemograma Completo Automatizado + Plaquetas + VSG",
        sampleType: "Sangre con EDTA",
        notes: "Ayuno de 8 horas",
      },
      {
        id: "lab-item-5",
        category: "Orina & Función Renal",
        testName: "Examen Completo de Orina (EGO) + Urocultivo con Antibiograma",
        sampleType: "Orina chorro medio",
        notes: "Primera orina matutina con higiene previa estricta",
      },
    ],
    customTests: "Perfil tiroideo completo (TSH, T4 libre, T3 libre)",
    patientInstructions:
      "Ayuno de 8 a 10 horas. No tener relaciones sexuales ni colocarse óvulos, cremas ni duchas vaginales 48 horas antes de la toma de muestra. Entregar primera orina de la mañana.",
    createdAt: "2026-11-02T12:20:00Z",
    updatedAt: "2026-11-02T12:20:00Z",
  },
  {
    id: "lab-camila-01",
    patientId: "pat-camila-rossi",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-11",
    diagnosis: "Control prenatal II trimestre (18 sem) - Tamizaje diabetes gestacional y bacteriuria",
    cie10Code: "Z34.8",
    urgency: "Rutina",
    items: [
      {
        id: "lab-cam-item-1",
        category: "Prenatal & Gestación",
        testName: "Test de Tolerancia Oral a la Glucosa (TTG 75g - 2 Horas)",
        sampleType: "Sangre venosa en ayunas + 2h post-carga",
        notes: "Ayuno de 8 a 10 horas. Traer solución de 75g de glucosa anhidra.",
      },
      {
        id: "lab-cam-item-2",
        category: "Hematología & Bioquímica",
        testName: "Hemograma Completo + Recuento Plaquetario + Ferritina Sérica",
        sampleType: "Sangre con EDTA",
        notes: "Evaluación de anemia fisiológica de la gestación",
      },
      {
        id: "lab-cam-item-3",
        category: "Orina & Función Renal",
        testName: "Examen Completo de Orina (EGO) + Urocultivo con Antibiograma",
        sampleType: "Orina chorro medio",
        notes: "Higiene genital previa con agua estéril sin antisépticos",
      },
      {
        id: "lab-cam-item-4",
        category: "Prenatal & Gestación",
        testName: "Proteinuria en Orina de 24 Horas",
        sampleType: "Orina de 24 horas",
        notes: "Descarte de preeclampsia y nefropatía gestacional",
      },
      {
        id: "lab-cam-item-5",
        category: "Infeccioso & Microbiología",
        testName: "Serología VDRL / RPR Cuantitativo + ELISA VIH 4ta Generación",
        sampleType: "Suero sanguíneo",
        notes: "Segundo control serológico del embarazo según norma técnica MINSA",
      },
    ],
    customTests: "Perfil tiroideo gestacional (TSH sensible + T4 Libre)",
    patientInstructions:
      "Acudir con 8 a 10 horas de ayuno estricto a las 7:30 AM. La prueba de tolerancia a la glucosa requiere permanencia en reposo en el laboratorio durante 2 horas. Recolectar la orina de 24 horas en recipiente estéril.",
    createdAt: "2026-11-11T12:40:00Z",
    updatedAt: "2026-11-11T12:40:00Z",
  },
  {
    id: "lab-valeria-01",
    patientId: "pat-valeria-alarcon",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-08",
    diagnosis: "Endometrioma ovárico izquierdo de 32mm y citología cervical anormal LIE-BG",
    cie10Code: "N80.1",
    urgency: "Rutina",
    items: [
      {
        id: "lab-val-item-1",
        category: "Ginecología & Marcadores",
        testName: "CA-125 (Marcador Tumoral Ovárico y Marcador de Endometriosis)",
        sampleType: "Suero sanguíneo",
        notes: "Tomar preferentemente fuera de los días de sangrado menstrual",
      },
      {
        id: "lab-val-item-2",
        category: "Ginecología & Marcadores",
        testName: "Marcador Tumoral CA 19-9",
        sampleType: "Suero sanguíneo",
        notes: "Ayuno de 8 horas",
      },
      {
        id: "lab-val-item-3",
        category: "Hematología & Bioquímica",
        testName: "Proteína C Reactiva Ultrasensible (PCR-us) + Perfil Lipídico",
        sampleType: "Suero sanguíneo",
        notes: "Evaluación de inflamación sistémica por endometriosis",
      },
      {
        id: "lab-val-item-4",
        category: "Infeccioso & Microbiología",
        testName: "Panel Tipificación VPH 23 Genotipos (PCR en tiempo real)",
        sampleType: "Cepillado endocervical",
        notes: "Abstinencia sexual 48 horas previas",
      },
      {
        id: "lab-val-item-5",
        category: "Ginecología & Marcadores",
        testName: "Estudio Histopatológico de Biopsia Cervical (2 fragmentos: horas 12 y 6)",
        sampleType: "Fragmentos de tejido en formol al 10%",
        notes: "Muestra obtenida en colposcopía. Descarte de NIC 1 vs NIC 2/3.",
      },
    ],
    customTests: "Hormona Antimülleriana (AMH) para evaluación de reserva ovárica",
    patientInstructions:
      "Ayuno de 8 a 10 horas. Abstinencia sexual estricta por 48 horas. Entregar los 2 frascos de biopsia debidamente rotulados al servicio de patología.",
    createdAt: "2026-11-08T15:50:00Z",
    updatedAt: "2026-11-08T15:50:00Z",
  },
];

// Carnets de Control Prenatal Iniciales (MINSA / CLAP)
export const INITIAL_PRENATAL_CARDS: PrenatalCard[] = [
  {
    id: "pnc-stephany-01",
    patientId: "pat-stephany-herrera",
    clinicEstablishment: "CENDO - Centro de Endometriosis & Ginecología Especializada",
    attendingDoctorId: "doc-patrick-jacinto",
    attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
    baseline: {
      insuranceType: "PRIVADO",
      insuranceCode: "PACIFICO-72961954",
      educationLevel: "Superior Univ",
      civilStatus: "Soltera",
      fatherName: "Carlos Eduardo Mendoza Rivas",
      fatherDni: "45829104",
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
      familyHistory: [
        "Madre con hipertensión arterial",
        "Madre con antecedente de miomatosis uterina",
      ],
      personalHistory: [
        "Apendicectomía laparoscópica (2021)",
        "Niega diabetes mellitus o asma",
      ],
      previousVaccines: {
        rubella: true,
        hepatitisB: true,
        hpv: true,
        yellowFever: true,
      },
      usualWeightKg: 56.5,
      heightCm: 162,
      bloodGroup: "O",
      rhFactor: "Rh (+)",
      smokerCigarettesDay: 0,
      drugsUse: false,
      fum: "2026-09-26",
      fumDoubt: false,
      ultrasoundGestationalAgeWeeks: 6,
      ultrasoundDate: "2026-11-12",
      fpp: "2027-07-03",
      clinicalExam: "Normal",
      breastsExam: "Normal",
      cervixExam: "Patológico",
      pelvisExam: "Normal",
      dentalExam: "Normal",
      hemoglobin1: 12.8,
      bloodGlucose1: 84,
      vdrlRpr1: "No reactivo",
      hivScreening1: "Negativo",
      hepatitisBScreening: "Negativo",
      completeUrineExam: "Normal",
      urineCulture: "Negativo",
      papTestResult: "Anormal",
      colposcopyResult: "Anormal",
    },
    visits: [
      {
        visitNumber: 1,
        visitDate: "2026-10-24",
        visitTime: "10:30",
        gestationalAgeWeeks: 4,
        gestationalAgeDays: 0,
        maternalWeightKg: 56.5,
        temperature: 36.6,
        bloodPressure: "110/70",
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
        counselingGiven: "NUT / ITS / PF",
        nextAppointmentDate: "2026-11-12",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Captación precoz. Se indica Ácido Fólico 0.5mg VO c/24h y exámenes basales.",
      },
      {
        visitNumber: 2,
        visitDate: "2026-11-12",
        visitTime: "11:15",
        gestationalAgeWeeks: 6,
        gestationalAgeDays: 5,
        maternalWeightKg: 57.0,
        temperature: 36.5,
        bloodPressure: "110/65",
        maternalPulse: 76,
        uterineHeightCm: 0,
        fetusSituation: "NA",
        fetusPresentation: "NA",
        fetusPosition: "NA",
        fetalHeartRate: 145,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "SE",
        tendonReflex: "+",
        ironFolicAcidGiven: false,
        calciumGiven: false,
        counselingGiven: "NUT",
        ultrasoundGestationalAge: "6 sem 4 d",
        nextAppointmentDate: "2026-12-10",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Eco transvaginal confirma embrión intrauterino único con vitalidad presente.",
      },
    ],
    maternalPathologies: [
      {
        id: "mp-1",
        name: "Cervicitis y Displasia Cervical Leve (NIC 1)",
        cie10: "N87.0",
        diagnosedDate: "2026-11-02",
      },
    ],
    createdAt: "2026-10-24T10:30:00Z",
    updatedAt: "2026-11-12T11:15:00Z",
  },
  {
    id: "pnc-camila-01",
    patientId: "pat-camila-rossi",
    clinicEstablishment: "CENDO - Centro de Endometriosis & Ginecología Especializada",
    attendingDoctorId: "doc-patrick-jacinto",
    attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
    baseline: {
      insuranceType: "PRIVADO",
      insuranceCode: "RIMAC-74829105",
      educationLevel: "Superior Univ",
      civilStatus: "Casada",
      fatherName: "Mateo Fernando Benavides Castro",
      fatherDni: "42109845",
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
      familyHistory: [
        "Madre hipertensa controlada",
      ],
      personalHistory: [
        "Niega diabetes mellitus, hipertensión o asma",
        "Alergia a AINEs leve (eritema cutáneo con ketorolaco)",
      ],
      previousVaccines: {
        rubella: true,
        hepatitisB: true,
        hpv: true,
        yellowFever: false,
      },
      usualWeightKg: 58.0,
      heightCm: 165,
      bloodGroup: "O",
      rhFactor: "Rh (+)",
      smokerCigarettesDay: 0,
      drugsUse: false,
      fum: "2026-07-08",
      fumDoubt: false,
      ultrasoundGestationalAgeWeeks: 12,
      ultrasoundDate: "2026-09-30",
      fpp: "2027-04-15",
      clinicalExam: "Normal",
      breastsExam: "Normal",
      cervixExam: "Normal",
      pelvisExam: "Normal",
      dentalExam: "Normal",
      hemoglobin1: 12.4,
      bloodGlucose1: 82,
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
        visitDate: "2026-09-02",
        visitTime: "09:30",
        gestationalAgeWeeks: 8,
        gestationalAgeDays: 0,
        maternalWeightKg: 58.2,
        temperature: 36.6,
        bloodPressure: "105/65",
        maternalPulse: 72,
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
        counselingGiven: "NUT / ITS / PF",
        nextAppointmentDate: "2026-10-07",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Primer control prenatal. Gestación incipiente de 8 sem por FUM. Se inicia Ácido Fólico 0.5mg VO diario.",
      },
      {
        visitNumber: 2,
        visitDate: "2026-10-07",
        visitTime: "10:15",
        gestationalAgeWeeks: 13,
        gestationalAgeDays: 0,
        maternalWeightKg: 59.8,
        temperature: 36.5,
        bloodPressure: "110/70",
        maternalPulse: 74,
        uterineHeightCm: 10,
        fetusSituation: "NA",
        fetusPresentation: "NA",
        fetusPosition: "NA",
        fetalHeartRate: 152,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "SE",
        tendonReflex: "+",
        ironFolicAcidGiven: true,
        calciumGiven: true,
        counselingGiven: "NUT / S. ALARMA",
        ultrasoundGestationalAge: "13 sem 1 d",
        nextAppointmentDate: "2026-11-11",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Ecografía genética (11-13.6 sem) con translucencia nucal normal y hueso nasal presente. Se indica suplementación con Fe + Ca.",
      },
      {
        visitNumber: 3,
        visitDate: "2026-11-11",
        visitTime: "11:00",
        gestationalAgeWeeks: 18,
        gestationalAgeDays: 0,
        maternalWeightKg: 61.5,
        temperature: 36.7,
        bloodPressure: "112/72",
        maternalPulse: 78,
        uterineHeightCm: 16,
        fetusSituation: "L",
        fetusPresentation: "C",
        fetusPosition: "I",
        fetalHeartRate: 146,
        fetalMovements: "+",
        proteinuria: "-",
        edema: "SE",
        tendonReflex: "+",
        ironFolicAcidGiven: true,
        calciumGiven: true,
        counselingGiven: "NUT / PSICOPROF",
        ultrasoundGestationalAge: "18 sem 0 d",
        nextAppointmentDate: "2026-12-09",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Embarazo normoevolutivo de 18 semanas. Movimientos fetales percibidos por la madre. Se solicita perfil de laboratorio prenatal de 2do trimestre (TTG 75g) y ecografía morfológica.",
      },
    ],
    maternalPathologies: [],
    createdAt: "2026-09-02T09:30:00Z",
    updatedAt: "2026-11-11T11:00:00Z",
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
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          const state = persistedState || {};
          const existingPatients = state.patients || [];
          const existingIds = new Set(existingPatients.map((p: any) => p.id));
          const newPatientsToAdd = INITIAL_PATIENTS.filter((p) => !existingIds.has(p.id));

          return {
            ...state,
            doctorsList: state.doctorsList && state.doctorsList.length > 0 ? state.doctorsList : INITIAL_DOCTORS,
            patients: [...existingPatients, ...newPatientsToAdd],
            backgrounds: { ...INITIAL_BACKGROUNDS, ...(state.backgrounds || {}) },
            colposcopyReports: [
              ...(state.colposcopyReports || []),
              ...INITIAL_COLPOSCOPY.filter(
                (c) => !(state.colposcopyReports || []).some((ec: any) => ec.id === c.id)
              ),
            ],
            clinicalCheckups: [
              ...(state.clinicalCheckups || []),
              ...INITIAL_CHECKUPS.filter(
                (c) => !(state.clinicalCheckups || []).some((ec: any) => ec.id === c.id)
              ),
            ],
            prescriptions: [
              ...(state.prescriptions || []),
              ...INITIAL_PRESCRIPTIONS.filter(
                (p) => !(state.prescriptions || []).some((ep: any) => ep.id === p.id)
              ),
            ],
            labOrders: [
              ...(state.labOrders || []),
              ...INITIAL_LAB_ORDERS.filter(
                (l) => !(state.labOrders || []).some((el: any) => el.id === l.id)
              ),
            ],
            prenatalCards: [
              ...(state.prenatalCards || []),
              ...INITIAL_PRENATAL_CARDS.filter(
                (p) => !(state.prenatalCards || []).some((ep: any) => ep.id === p.id)
              ),
            ],
            tariffItems: state.tariffItems && state.tariffItems.length > 0 ? state.tariffItems : INITIAL_TARIFF,
            vademecumItems: state.vademecumItems && state.vademecumItems.length > 0 ? state.vademecumItems : INITIAL_VADEMECUM,
          };
        }
        return persistedState;
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);

