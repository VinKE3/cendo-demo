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
  PatientDocument,
  MedicalConsultation,
  UltrasoundReport,
  MinorProcedureReport,
  ProcedureQuote,
  MedicalAppointment,
  WordHistoryDocument,
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
  syncDocumentToSupabase,
  deleteDocumentFromSupabase,
  syncConsultationToSupabase,
  deleteConsultationFromSupabase,
  syncUltrasoundToSupabase,
  deleteUltrasoundFromSupabase,
  syncMinorProcedureToSupabase,
  deleteMinorProcedureFromSupabase,
  syncAppointmentToSupabase,
  deleteAppointmentFromSupabase,
  syncQuoteToSupabase,
  deleteQuoteFromSupabase,
  syncWordHistoryToSupabase,
  deleteWordHistoryFromSupabase,
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
    address: "Av. Pardo y Aliaga 640, Dpto 302, San Isidro, Lima",
    civilStatus: "Soltera",
    occupation: "Licenciada en Comunicaciones",
    educationLevel: "Superior Universitaria Completa",
    birthPlace: "Lima, Perú",
    religion: "Católica",
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
    address: "Calle Coronel Inclán 320, Dpto 402, Miraflores, Lima",
    civilStatus: "Casada",
    occupation: "Contadora Pública Colegiada",
    educationLevel: "Superior Universitaria Completa",
    birthPlace: "Lima, Perú",
    religion: "Católica",
    insuranceInfo: "RIMAC EPS",
    createdAt: "2026-11-05T09:00:00Z",
    updatedAt: "2026-11-13T10:30:00Z",
  },
  {
    id: "pat-gabriela-paredes",
    dni: "71628493",
    firstName: "GABRIELA ALEJANDRA",
    lastName: "PAREDES VÍLCHEZ",
    birthDate: "1994-06-18",
    age: 32,
    phone: "992 847 163",
    email: "gabriela.paredes@email.com",
    address: "Av. Reducto 1250, Dpto 801, Miraflores, Lima",
    civilStatus: "Soltera",
    occupation: "Abogada Corporativa Senior",
    educationLevel: "Superior Universitaria Completa",
    birthPlace: "Arequipa, Perú",
    religion: "Católica",
    insuranceInfo: "Particular / SANITAS EPS",
    createdAt: "2026-11-06T14:30:00Z",
    updatedAt: "2026-11-09T16:00:00Z",
  },
  {
    id: "pat-daniela-castro",
    dni: "74195820",
    firstName: "DANIELA FERNANDA",
    lastName: "CASTRO MORALES",
    birthDate: "1992-11-05",
    age: 34,
    phone: "987 456 123",
    email: "daniela.castro@email.com",
    address: "Malecón Balta 890, Dpto 502, Miraflores, Lima",
    civilStatus: "Conviviente",
    occupation: "Diseñadora Gráfica & UX",
    educationLevel: "Superior Técnica Completa",
    birthPlace: "Lima, Perú",
    religion: "Cristiana",
    insuranceInfo: "Particular",
    createdAt: "2026-11-07T11:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  {
    id: "pat-carmen-huaman",
    dni: "09482715",
    firstName: "CARMEN ROSA",
    lastName: "HUAMÁN QUISPE",
    birthDate: "1974-04-10",
    age: 52,
    phone: "965 318 742",
    email: "carmen.huaman@email.com",
    address: "Calle Esperanza 245, Dpto 201, Miraflores, Lima",
    civilStatus: "Casada",
    occupation: "Docente Universitaria",
    educationLevel: "Posgrado / Maestría",
    birthPlace: "Cusco, Perú",
    religion: "Católica",
    insuranceInfo: "PACIFICO EPS",
    createdAt: "2026-11-08T15:00:00Z",
    updatedAt: "2026-11-12T16:30:00Z",
  },
];

// Antecedentes Gineco-Obstétricos y Generales (Modelo Oficial Dr. Patrick Jacinto)
export const INITIAL_BACKGROUNDS: Record<string, PatientBackground> = {
  "pat-luciana-ramos": {
    id: "bg-luciana-ramos",
    patientId: "pat-luciana-ramos",
    menarche: 12,
    sexualDebutAge: 18,
    sexualPartnersCount: 2,
    catamenialRegimen: "28/4",
    stiHistory: "Niega ITS",
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Preservativo de barrera",
    lastMenstrualPeriod: "2026-10-28",
    papHistory: "Normal (febrero 2025)",
    vphTestHistory: "Negativo 23 genotipos PCR (2025)",
    hasDiabetes: "Niega",
    hasHypertension: "Niega",
    hasAsthma: "Niega",
    medicalAllergies: "Niega alergias a medicamentos",
    surgeriesHistory: "Niega cirugías previas",
    familyHistory: "Tía materna con quistes ováricos benignos",
    otherPathologies: "Niega patologías sistémicas crónicas",
    notes: "Paciente acude a chequeo preventivo anual y asesoría para colocación de implante subdérmico LARC.",
    updatedAt: "2026-11-04T11:30:00Z",
  },
  "pat-fiorella-mendoza": {
    id: "bg-fiorella-mendoza",
    patientId: "pat-fiorella-mendoza",
    menarche: 13,
    sexualDebutAge: 21,
    sexualPartnersCount: 1,
    catamenialRegimen: "28/4",
    stiHistory: "Niega ITS",
    obstetricFormula: "G1 P0000",
    contraceptiveMethod: "Ninguno (Embarazo deseado y planificado)",
    lastMenstrualPeriod: "2026-09-04",
    papHistory: "Normal (febrero 2026)",
    vphTestHistory: "Negativo (febrero 2026)",
    hasDiabetes: "Niega antecedente propio / Familiar directo en madre (diabetes gestacional)",
    hasHypertension: "Niega",
    hasAsthma: "Niega",
    medicalAllergies: "Niega alergias medicamentosas",
    surgeriesHistory: "Niega cirugías previas",
    familyHistory: "Madre con antecedente de diabetes gestacional en último parto",
    otherPathologies: "Gestante primigesta de 10 semanas de gestación activa",
    notes: "Gestante de 10 semanas con control prenatal estructurado en carnet oficial MINSA/CLAP. FPP Naegele: 11/06/2027.",
    updatedAt: "2026-11-13T10:30:00Z",
  },
  "pat-gabriela-paredes": {
    id: "bg-gabriela-paredes",
    patientId: "pat-gabriela-paredes",
    menarche: 11,
    sexualDebutAge: 19,
    sexualPartnersCount: 2,
    catamenialRegimen: "30/6 (Dismenorrea incapacitante EVA 9/10)",
    stiHistory: "Niega ITS",
    obstetricFormula: "G0 P0000",
    contraceptiveMethod: "Dienogest 2mg diario continuo (Visannette)",
    lastMenstrualPeriod: "2026-10-15",
    papHistory: "Normal (agosto 2026)",
    vphTestHistory: "Negativo (agosto 2026)",
    hasDiabetes: "Niega",
    hasHypertension: "Niega",
    hasAsthma: "Niega",
    medicalAllergies: "Alergia comprobada a Penicilina (erupción cutánea)",
    surgeriesHistory: "Apendicectomía abierta a los 16 años (2010)",
    familyHistory: "Madre y hermana mayor con endometriosis diagnosticada quirúrgicamente",
    otherPathologies: "Endometriosis pélvica profunda comprobada por ultrasonido de alta resolución y RMN pélvica. Disquecia y dispareunia profunda.",
    notes: "Caso de alta complejidad CENDO. Mapeo protocolizado IDEA positivo para endometrioma ovárico izquierdo de 42 mm y nódulo retrocervical de 12 mm en ligamento uterosacro izquierdo.",
    updatedAt: "2026-11-09T16:00:00Z",
  },
  "pat-daniela-castro": {
    id: "bg-daniela-castro",
    patientId: "pat-daniela-castro",
    menarche: 12,
    sexualDebutAge: 17,
    sexualPartnersCount: 4,
    catamenialRegimen: "28/5",
    stiHistory: "VPH positivo oncogénico detectado en octubre 2026",
    obstetricFormula: "G1 P0010 (1 aborto espontáneo en 2021)",
    contraceptiveMethod: "DIU de Cobre (T de Cobre 380A colocado en 2022)",
    lastMenstrualPeriod: "2026-10-24",
    papHistory: "Anormal (Octubre 2026): LIE-AG / HSIL",
    vphTestHistory: "Positivo Genotipo VPH 16 (Octubre 2026)",
    hasDiabetes: "Niega",
    hasHypertension: "Niega",
    hasAsthma: "Niega",
    medicalAllergies: "Niega alergias",
    surgeriesHistory: "Legrado uterino hemostático post-aborto en 2021",
    familyHistory: "Abuela materna con cáncer de cuello uterino a los 62 años",
    otherPathologies: "Patología cervical premaligna NIC 2 confirmada por biopsia dirigida Tischler.",
    notes: "Paciente derivada con PAP anormal y prueba molecular VPH 16 positiva. Requiere conización cervical LEEP ambulatoria.",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  "pat-carmen-huaman": {
    id: "bg-carmen-huaman",
    patientId: "pat-carmen-huaman",
    menarche: 13,
    sexualDebutAge: 20,
    sexualPartnersCount: 1,
    catamenialRegimen: "Menopausia establecida (FUM hace 14 meses)",
    stiHistory: "Niega ITS",
    obstetricFormula: "G2 P2002 (2 partos vaginales a término)",
    contraceptiveMethod: "Quirúrgico (Salpingoclasia bilateral en 2006)",
    lastMenstrualPeriod: "2025-09-12 (Amenorrea 14 meses)",
    papHistory: "Atrofia celular sin atipia (noviembre 2026)",
    vphTestHistory: "Negativo (noviembre 2026)",
    hasDiabetes: "Niega",
    hasHypertension: "Controlada con Enalapril 10 mg diario",
    hasAsthma: "Niega",
    medicalAllergies: "Alergia a AINEs tipo Sulfas",
    surgeriesHistory: "Salpingoclasia bilateral en 2006; Cesárea no refiere (ambos eutócicos)",
    familyHistory: "Madre con osteoporosis severa y fractura de cadera a los 74 años",
    otherPathologies: "Síndrome climatérico severo con bochornos vasomotores, insomnio y atrofia urogenital sintomática.",
    notes: "Paciente en fase climatérica. Evaluación endometrial y mamaria previa a inicio de terapia de reemplazo hormonal (TRH) y protección ósea.",
    updatedAt: "2026-11-12T16:30:00Z",
  },
};

// Informes Colposcópicos IFCPC 2011 Completos
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
    irregularBorder: false,
    fineMosaic: false,
    finePunctation: false,
    denseAcetowhiteEpithelium: false,
    coarseMosaic: false,
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
        caption: "Cérvix con SSF: Ectopia periorificial fisiológica leve",
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
    planRecommendations: "Control citológico ginecológico preventivo en 1 año. Proceder con colocación de método anticonceptivo LARC.",
    cie10Code: "Z01.4",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    createdAt: "2026-11-04T10:45:00Z",
  },
  {
    id: "colpo-daniela-01",
    patientId: "pat-daniela-castro",
    reportDate: "2026-11-01",
    adequateColposcopy: true,
    squamocolumnarJunctionVisible: "Visible",
    transformationZoneType: "Tipo 2",
    matureSquamousEpithelium: false,
    ectopy: true,
    nabothCyst: false,
    cryptOpenings: true,
    deciduosis: false,
    thinAcetowhiteEpithelium: false,
    irregularBorder: false,
    fineMosaic: false,
    finePunctation: false,
    denseAcetowhiteEpithelium: true,
    rapidAcetowhite: true,
    thickenedGlands: true,
    coarseMosaic: true,
    coarsePunctation: true,
    sharpBorders: true,
    innerBorderSign: true,
    ridgeSign: false,
    leukoplakia: false,
    erosion: false,
    schillerTest: "Positivo (Yodo negativo - Amarillo mostaza)",
    atypicalVessels: false,
    fragileVessels: false,
    irregularSurface: false,
    exophyticLesion: false,
    necrosis: false,
    nodularTumor: false,
    congenitalTZ: false,
    condyloma: false,
    polyp: false,
    inflammation: true,
    stenosis: false,
    postTreatmentAnomaly: false,
    endometriosisFoci: false,
    cervicalBiopsyTaken: true,
    biopsyClockHours: ["11", "1"],
    images: [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Ácido acético al 5%: Epitelio acetoblanco denso en labio anterior con mosaico grueso",
        timestamp: "2026-11-01 11:15",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Test de Schiller: Defecto de captación yodo-negativo mostaza a horas 11 a 1",
        timestamp: "2026-11-01 11:18",
      },
    ],
    diagnosis: "Hallazgos colposcópicos anormales Grado 2 (Mayores) IFCPC 2011 / Sospecha de LIE-AG (NIC 2)",
    planRecommendations: "Biopsia cervical dirigida Tischler tomada a horas 11 y 1 enviada a patología. Plan de Conización LEEP ambulatoria según resultado histopatológico.",
    cie10Code: "N87.1",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    createdAt: "2026-11-01T11:00:00Z",
  },
];

// Chequeos Clínicos Semilla
export const INITIAL_CHECKUPS: ClinicalCheckup[] = [
  {
    id: "chk-luciana-01",
    patientId: "pat-luciana-ramos",
    checkupDate: "2026-11-04",
    reasonForConsultation: "Chequeo ginecológico y mamario preventivo anual",
    breastUltrasoundFindings: "Patrón ecográfico mamario bilateral homogéneo fibroglandular. Sin nódulos sólidos, quísticos ni microcalcificaciones sospechosas. Axilas libres.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin lesiones focales",
    transvaginalUltrasoundFindings: "Útero en AVF de 65 x 35 x 42 mm, miometrio homogéneo de ecogenicidad conservada. Endometrio fino regular trilaminar de 6.2 mm. Ovarios normales con folículos antrales fisiológicos.",
    uterusMeasurements: "65 x 35 x 42 mm (Vol: 50 cc)",
    endometriumThicknessMm: 6.2,
    ovariesFindings: "Ovario derecho 28 x 18 mm. Ovario izquierdo 30 x 20 mm. Ambos con ecotextura normal.",
    papResult: "Normal (Negativo para lesión intraepitelial o malignidad)",
    vphResult: "Negativo para 23 genotipos",
    conclusions: "Chequeo ginecológico y mamario preventivo dentro de límites normales. Apta para LARC.",
    medicalPrescription: "1. Ácido Fólico 0.5 mg diario.\n2. Cuidados post-inserción de implante Jadelle.",
    createdAt: "2026-11-04T11:15:00Z",
  },
  {
    id: "chk-gabriela-01",
    patientId: "pat-gabriela-paredes",
    checkupDate: "2026-11-09",
    reasonForConsultation: "Dismenorrea severa progresiva (EVA 9/10), dispareunia profunda y evaluación de endometriosis",
    breastUltrasoundFindings: "Mamas fibroglandulares normales sin alteraciones ecográficas. Regiones axilares normales sin adenopatías.",
    breastUltrasoundBirads: "BI-RADS 1 (Negativo a malignidad)",
    breastLesionMeasurements: "Sin lesiones mamarias",
    transvaginalUltrasoundFindings: "Útero en retroversoflexión fija de 78 x 46 x 42 mm. Miometrio heterogéneo con áreas focales hipoecoicas en pared posterior compatibles con adenomiosis. Endometrio regular de 8.4 mm. Ovario derecho con endometrioma unilocular de 38 x 30 mm. Ovario izquierdo con endometrioma de 42 mm. Ambos adheridos en línea media posterior (Kissing Ovaries).",
    uterusMeasurements: "78 x 46 x 42 mm (Vol: 79 cc)",
    endometriumThicknessMm: 8.4,
    ovariesFindings: "Endometrioma ovárico izquierdo de 42 mm y derecho de 38 mm. Kissing Ovaries positivo.",
    papResult: "Normal (Negativo para neoplasia)",
    vphResult: "Negativo",
    conclusions: "1. Endometriosis ovárica bilateral severa estadio IV (Kissing Ovaries).\n2. Adenomiosis uterina posterior focal.\n3. Dismenorrea secundaria severa y dolor pélvico crónico.",
    medicalPrescription: "1. Dienogest 2mg diario continuo x 6 meses.\n2. Ketoprofeno condicional al dolor severo.\n3. Evaluación pre-quirúrgica para laparoscopía avanzada.",
    createdAt: "2026-11-09T15:30:00Z",
  },
  {
    id: "chk-carmen-01",
    patientId: "pat-carmen-huaman",
    checkupDate: "2026-11-12",
    reasonForConsultation: "Evaluación integral de climaterio, bochornos vasomotores y atrofia urogenital",
    breastUltrasoundFindings: "Mamas con involución adiposa moderada. Mama derecha presenta quiste simple anecoico de paredes finas de 7 x 5 mm a hora 10 radio 3. Sin nódulos sólidos ni calcificaciones sospechosas.",
    breastUltrasoundBirads: "BI-RADS 2 (Benigno - Quiste simple)",
    breastLesionMeasurements: "Quiste simple mama derecha 7 x 5 mm",
    transvaginalUltrasoundFindings: "Útero en AVF de 58 x 28 x 34 mm (involución climatérica fisiológica). Endometrio fino atrófico lineal homogéneo de 2.4 mm (normal en postmenopausia < 4 mm). Ovarios atróficos bilaterales sin formaciones expansivas.",
    uterusMeasurements: "58 x 28 x 34 mm (Vol: 29 cc)",
    endometriumThicknessMm: 2.4,
    ovariesFindings: "Ovario derecho 18 x 10 mm. Ovario izquierdo 16 x 9 mm. Ambos de aspecto atrófico fisiológico.",
    papResult: "Frotis atrófico con flora disminuida, negativo para malignidad",
    vphResult: "Negativo",
    conclusions: "1. Síndrome climatérico y menopausia establecida.\n2. Endometrio atrófico normal (2.4 mm) apto para TRH.\n3. Quiste simple mama derecha BI-RADS 2.\n4. Atrofia vulvovaginal sintomática.",
    medicalPrescription: "1. Estriol crema vaginal 1 mg/g.\n2. Citrato de Calcio 1500 mg + Vitamina D3 800 UI diario.\n3. Densitometría ósea de control.",
    createdAt: "2026-11-12T16:00:00Z",
  },
];

// Recetas Médicas Inteligentes Semilla (con Vademécum integrado)
export const INITIAL_PRESCRIPTIONS: MedicalPrescription[] = [
  {
    id: "rec-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-04",
    diagnosis: "Asesoría y prescripción post-colocación de método anticonceptivo LARC",
    cie10Code: "Z30.0",
    items: [
      {
        id: "item-luc-1",
        medicationName: "Ácido Fólico 0.5 mg",
        presentation: "Caja x 30 tabletas",
        route: "Vía Oral",
        dosage: "0.5 mg (1 tableta)",
        frequency: "Cada 24 horas (en el desayuno)",
        duration: "90 días",
        instructions: "Tomar diariamente con el desayuno para optimización de salud celular y nutricional.",
        quantity: "3 cajas",
      },
      {
        id: "item-luc-2",
        medicationName: "Paracetamol 500 mg",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "500 mg (1 tableta)",
        frequency: "Cada 8 horas condicional al dolor",
        duration: "2 días",
        instructions: "Tomar únicamente si presenta dolor local en el brazo post colocación de implante.",
        quantity: "1 caja",
      },
    ],
    generalIndications: "Mantener vendaje seco durante 24 horas tras la inserción del implante Jadelle. Evitar esfuerzos excesivos con el brazo izquierdo.",
    nextAppointmentDate: "2026-12-08",
    createdAt: "2026-11-04T11:00:00Z",
    updatedAt: "2026-11-04T11:00:00Z",
  },
  {
    id: "rec-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-13",
    diagnosis: "Gestación única intrauterina de 10 semanas y emesis gravídica leve",
    cie10Code: "Z34.0",
    items: [
      {
        id: "item-fio-1",
        medicationName: "Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg",
        presentation: "Caja x 30 tabletas recubiertas",
        route: "Vía Oral",
        dosage: "1 tableta (60 mg Fe elemental)",
        frequency: "Cada 24 horas",
        duration: "30 días",
        instructions: "Tomar en ayunas con jugo de naranja o agua. No consumir junto con lácteos ni café.",
        quantity: "1 caja",
      },
      {
        id: "item-fio-2",
        medicationName: "Dimenhidrinato 50 mg",
        presentation: "Caja x 10 tabletas",
        route: "Vía Oral",
        dosage: "50 mg (1 tableta)",
        frequency: "Cada 8 horas condicional a náuseas severas",
        duration: "5 días",
        instructions: "Tomar 30 minutos antes de los alimentos si presenta náuseas intensas.",
        quantity: "1 caja",
      },
    ],
    generalIndications: "Fraccionar las comidas en 5 a 6 tomas al día. Mantener hidratación adecuada con pequeños sorbos de agua fría.",
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
    diagnosis: "Endometriosis ovárica y pélvica profunda (CIE-10 N80.1 / N80.3)",
    cie10Code: "N80.1",
    items: [
      {
        id: "item-gab-1",
        medicationName: "Dienogest 2 mg (Visannette)",
        presentation: "Caja x 28 comprimidos",
        route: "Vía Oral",
        dosage: "2 mg (1 comprimido)",
        frequency: "Cada 24 horas continuo (sin descanso)",
        duration: "84 días (3 cajas x 28 comp)",
        instructions: "Tomar siempre a la misma hora todos los días para supresión óptima de focos endometriósicos.",
        quantity: "3 cajas",
      },
      {
        id: "item-gab-2",
        medicationName: "Ketoprofeno 100 mg",
        presentation: "Caja x 20 cápsulas",
        route: "Vía Oral",
        dosage: "100 mg (1 cápsula)",
        frequency: "Cada 8 horas con las comidas",
        duration: "3 días condicional al dolor severo",
        instructions: "Tomar con el estómago lleno únicamente durante episodios de dolor agudo.",
        quantity: "1 caja",
      },
      {
        id: "item-gab-3",
        medicationName: "Omeprazol 20 mg",
        presentation: "Caja x 30 cápsulas",
        route: "Vía Oral",
        dosage: "20 mg (1 cápsula)",
        frequency: "Cada 24 horas en ayunas",
        duration: "14 días",
        instructions: "Tomar 30 minutos antes del desayuno como gastroprotector.",
        quantity: "1 caja",
      },
    ],
    generalIndications: "Evitar lácteos y alimentos ultraprocesados proinflamatorios. Realizar caminatas suaves. Consultar de urgencia ante dolor intratable.",
    nextAppointmentDate: "2026-11-25",
    createdAt: "2026-11-09T16:15:00Z",
    updatedAt: "2026-11-09T16:15:00Z",
  },
  {
    id: "rec-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-11",
    diagnosis: "Neoplasia intraepitelial cervical NIC 2 / Preparación para LEEP",
    cie10Code: "N87.1",
    items: [
      {
        id: "item-dan-1",
        medicationName: "Clindamicina 100 mg + Ketoconazol 400 mg",
        presentation: "Caja x 7 óvulos vaginales",
        route: "Vía Vaginal",
        dosage: "1 óvulo vaginal",
        frequency: "Cada 24 horas (al acostarse)",
        duration: "7 noches",
        instructions: "Introducir profundamente en la vagina antes de dormir. Abstenerse de relaciones sexuales durante el tratamiento.",
        quantity: "1 caja",
      },
      {
        id: "item-dan-2",
        medicationName: "Ibuprofeno 400 mg",
        presentation: "Caja x 20 tabletas",
        route: "Vía Oral",
        dosage: "400 mg (1 tableta)",
        frequency: "Cada 8 horas condicional a dolor pélvico",
        duration: "3 días",
        instructions: "Tomar con alimentos si presenta molestias tipo cólico post-biopsia.",
        quantity: "1 caja",
      },
    ],
    generalIndications: "Completar tratamiento antimicrobiano tópico para acondicionamiento cervical previo al procedimiento quirúrgico LEEP.",
    nextAppointmentDate: "2026-11-19",
    createdAt: "2026-11-11T12:00:00Z",
    updatedAt: "2026-11-11T12:00:00Z",
  },
  {
    id: "rec-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    prescriptionDate: "2026-11-12",
    diagnosis: "Síndrome climatérico severo y atrofia vulvovaginal",
    cie10Code: "N95.1",
    items: [
      {
        id: "item-car-1",
        medicationName: "Estriol 1 mg/g (Crema Vaginal)",
        presentation: "Tubo x 30 g con aplicador graduado",
        route: "Vía Vaginal",
        dosage: "0.5 g de crema (1 dosis del aplicador)",
        frequency: "Diario x 2 semanas, luego 2 veces por semana",
        duration: "60 días",
        instructions: "Aplicar profundamente por las noches antes de dormir para regeneración epitelial vaginal.",
        quantity: "1 tubo",
      },
      {
        id: "item-car-2",
        medicationName: "Citrato de Calcio 1500 mg + Vitamina D3 800 UI",
        presentation: "Frasco x 60 tabletas masticables",
        route: "Vía Oral",
        dosage: "1 tableta masticable",
        frequency: "Cada 24 horas",
        duration: "90 días",
        instructions: "Tomar junto con el almuerzo para prevención y manejo de pérdida de densidad ósea.",
        quantity: "2 frascos",
      },
    ],
    generalIndications: "Usar hidratante vaginal sin hormonas a base de ácido hialurónico según necesidad. Mantener actividad física con pesas suaves para estímulo óseo.",
    nextAppointmentDate: "2026-12-03",
    createdAt: "2026-11-12T16:45:00Z",
    updatedAt: "2026-11-12T16:45:00Z",
  },
];

// Órdenes de Laboratorio Semilla
export const INITIAL_LAB_ORDERS: LabOrder[] = [
  {
    id: "lab-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-04",
    diagnosis: "Chequeo ginecológico preventivo anual",
    cie10Code: "Z01.4",
    urgency: "Rutina",
    items: [
      { id: "test-luc-1", category: "Hematología & Bioquímica", testName: "Hemograma Automatizado Completo", sampleType: "Sangre venosa" },
      { id: "test-luc-2", category: "Hematología & Bioquímica", testName: "Glucosa basal en ayunas", sampleType: "Sangre venosa" },
      { id: "test-luc-3", category: "Hematología & Bioquímica", testName: "Perfil Lipídico Completo (Colesterol, HDL, LDL, Triglicéridos)", sampleType: "Sangre venosa" },
      { id: "test-luc-4", category: "Orina & Función Renal", testName: "Examen Completo de Orina + Sedimento", sampleType: "Orina matutina" },
    ],
    patientInstructions: "Ayuno estricto de 8 a 10 horas. Muestra de primera orina de la mañana con asepsia previa.",
    createdAt: "2026-11-04T10:15:00Z",
    updatedAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "lab-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-05",
    diagnosis: "Control prenatal primer trimestre (Semana 10)",
    cie10Code: "Z34.0",
    urgency: "Rutina",
    items: [
      { id: "test-fio-1", category: "Hematología & Bioquímica", testName: "Hemograma Completo + Recuento Plaquetario", sampleType: "Sangre venosa" },
      { id: "test-fio-2", category: "Perfil Prenatal / Gestacional", testName: "Grupo Sanguíneo y Factor Rh", sampleType: "Sangre venosa" },
      { id: "test-fio-3", category: "Hematología & Bioquímica", testName: "Glucosa basal en ayunas", sampleType: "Sangre venosa" },
      { id: "test-fio-4", category: "Infeccioso & Microbiología", testName: "Prueba rápida VDRL / RPR", sampleType: "Sangre venosa" },
      { id: "test-fio-5", category: "Infeccioso & Microbiología", testName: "Prueba rápida VIH / ELISA 4ta Generación", sampleType: "Sangre venosa" },
      { id: "test-fio-6", category: "Orina & Función Renal", testName: "Urocultivo con Antibiograma Automatizado", sampleType: "Orina segundo chorro" },
      { id: "test-fio-7", category: "Perfil Hormonal & Ovárico", testName: "TSH Ultrasensible", sampleType: "Sangre venosa" },
      { id: "test-fio-8", category: "Infeccioso & Microbiología", testName: "Toxoplasma gondii IgG e IgM", sampleType: "Sangre venosa" },
    ],
    patientInstructions: "Batería prenatal completa estandarizada MINSA. Ayuno de 8 horas.",
    createdAt: "2026-11-05T09:30:00Z",
    updatedAt: "2026-11-05T09:30:00Z",
  },
  {
    id: "lab-gabriela-01",
    patientId: "pat-gabriela-paredes",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-09",
    diagnosis: "Endometriosis pélvica profunda y endometrioma ovárico",
    cie10Code: "N80.1",
    urgency: "Prioritario",
    items: [
      { id: "test-gab-1", category: "Ginecología & Marcadores", testName: "Marcador Tumoral CA-125 sérico", sampleType: "Sangre venosa" },
      { id: "test-gab-2", category: "Ginecología & Marcadores", testName: "Marcador Tumoral CA 19-9", sampleType: "Sangre venosa" },
      { id: "test-gab-3", category: "Hematología & Bioquímica", testName: "Hemograma Automatizado con Fórmula Leucocitaria", sampleType: "Sangre venosa" },
      { id: "test-gab-4", category: "Hematología & Bioquímica", testName: "Tiempo de Protrombina (TP) + INR + TTPa", sampleType: "Sangre con citrato" },
      { id: "test-gab-5", category: "Orina & Función Renal", testName: "Urea y Creatinina sérica", sampleType: "Sangre venosa" },
    ],
    patientInstructions: "Evaluación de marcadores endometriósicos y riesgo pre-quirúrgico laparoscópico.",
    createdAt: "2026-11-09T16:30:00Z",
    updatedAt: "2026-11-09T16:30:00Z",
  },
  {
    id: "lab-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-10",
    diagnosis: "Riesgo pre-quirúrgico para Conización LEEP y estudio de biopsia",
    cie10Code: "N87.1",
    urgency: "Prioritario",
    items: [
      { id: "test-dan-1", category: "Ginecología & Marcadores", testName: "Estudio Histopatológico de Biopsia de Cérvix", sampleType: "Tejido en formol 10%" },
      { id: "test-dan-2", category: "Hematología & Bioquímica", testName: "Coagulograma Completo (TP, INR, TTPa, Fibrinógeno)", sampleType: "Sangre venosa" },
      { id: "test-dan-3", category: "Hematología & Bioquímica", testName: "Hemograma Automatizado y Plaquetas", sampleType: "Sangre venosa" },
      { id: "test-dan-4", category: "Infeccioso & Microbiología", testName: "Prueba Serológica Rápida VIH 1/2 y Sífilis", sampleType: "Sangre venosa" },
    ],
    patientInstructions: "Estudio pre-quirúrgico obligatorio para procedimiento electroquirúrgico LEEP.",
    createdAt: "2026-11-10T11:45:00Z",
    updatedAt: "2026-11-10T11:45:00Z",
  },
  {
    id: "lab-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    orderDate: "2026-11-12",
    diagnosis: "Perfil bioquímico, hormonal y de patología en climaterio",
    cie10Code: "N95.1",
    urgency: "Rutina",
    items: [
      { id: "test-car-1", category: "Ginecología & Marcadores", testName: "Estudio Histopatológico de Biopsia de Endometrio (Pipelle)", sampleType: "Tejido endometrial en formol" },
      { id: "test-car-2", category: "Perfil Hormonal & Ovárico", testName: "FSH (Hormona Folículo Estimulante) + Estradiol (E2)", sampleType: "Sangre venosa" },
      { id: "test-car-3", category: "Hematología & Bioquímica", testName: "25-Hidroxi Vitamina D sérica total", sampleType: "Sangre venosa" },
      { id: "test-car-4", category: "Hematología & Bioquímica", testName: "Perfil Lipídico Completo y Perfil Hepático (TGO, TGP, FA)", sampleType: "Sangre venosa" },
    ],
    patientInstructions: "Ayuno de 10 a 12 horas. Remitir muestra de biopsia endometrial en frasco estéril con formol al 10%.",
    createdAt: "2026-11-12T16:15:00Z",
    updatedAt: "2026-11-12T16:15:00Z",
  },
];

// Carnet de Control Prenatal Oficial MINSA / CLAP
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
        maternalWeightKg: 57.2,
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
        edema: "-",
        tendonReflex: "++",
        nippleExam: "Formado",
        ironFolicAcidGiven: true,
        calciumGiven: false,
        counselingGiven: "Signos de alarma, nutrición materna e inicio de ácido fólico.",
        ultrasoundGestationalAge: "6 sem por saco gestacional con embrión y LCF presentes.",
        nextAppointmentDate: "2026-11-13",
        homeVisit: "No",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Captación prenatal temprana exitosa. Gestación intrauterina confirmada.",
      },
      {
        visitNumber: 2,
        visitDate: "2026-11-13",
        visitTime: "10:00",
        gestationalAgeWeeks: 10,
        gestationalAgeDays: 0,
        maternalWeightKg: 57.8,
        temperature: 36.5,
        bloodPressure: "110/68",
        maternalPulse: 78,
        uterineHeightCm: 8,
        fetusSituation: "NA",
        fetusPresentation: "NA",
        fetusPosition: "NA",
        fetalHeartRate: 168,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "-",
        tendonReflex: "++",
        nippleExam: "Formado",
        ironFolicAcidGiven: true,
        calciumGiven: false,
        counselingGiven: "Prevención de anemia, higiene gestacional y manejo de náuseas.",
        ultrasoundGestationalAge: "10 semanas (LCC 33.8 mm, FCF 168 lpm activo).",
        nextAppointmentDate: "2026-12-11",
        homeVisit: "No",
        attendingDoctorName: "Dr. Patrick José Jacinto Gomero",
        notes: "Excelente evolución. FCF audible por doppler obstétrico y verificada en eco de control.",
      },
    ],
    maternalPathologies: [],
    createdAt: "2026-10-16T10:00:00Z",
    updatedAt: "2026-11-13T10:30:00Z",
  },
];

// Tarifario Clínico Institucional CENDO
export const INITIAL_TARIFF: ProcedureTariff[] = [
  {
    id: "tar-1",
    code: "CONS-ESP",
    name: "Consulta Médica Ginecológica Especializada",
    category: "Consulta",
    description: "Evaluación integral por especialista en ginecología y cirugía mínimamente invasiva.",
    price: 180,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-2",
    code: "COLPO-DX",
    name: "Colposcopía Digital de Alta Resolución IFCPC con Test de Ácido Acético y Schiller",
    category: "Procedimiento",
    description: "Evaluación colposcópica completa con videocámara HD, captura fotográfica y reporte oficial.",
    price: 250,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-3",
    code: "ECO-TV",
    name: "Ecografía Ginecológica Transvaginal Doppler Color",
    category: "Ecografía",
    description: "Estudio ultrasonográfico de alta definición para útero, miometrio, endometrio y reserva ovárica.",
    price: 180,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-4",
    code: "ECO-MAMA",
    name: "Ecografía Mamaria Bilateral con Clasificación BI-RADS",
    category: "Ecografía",
    description: "Mapeo ecográfico de ambas mamas y huecos axilares por cuadrantes.",
    price: 200,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-5",
    code: "BIO-CX",
    name: "Biopsia de Cérvix Dirigida Tischler + Acondicionamiento de Muestra",
    category: "Procedimiento",
    description: "Toma de tejido cervical bajo visión colposcópica directa con hemostasia local.",
    price: 320,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-6",
    code: "LEEP-CX",
    name: "Conización Cervical LEEP / Radiocirugía Ambulatoria con Asa Diatérmica",
    category: "Procedimiento",
    description: "Escisión electroquirúrgica de la zona de transformación bajo anestesia local en sala de procedimientos.",
    price: 1600,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-7",
    code: "LAPA-ENDO",
    name: "Cirugía Laparoscópica Ginecológica Avanzada / Escisión de Endometriosis Profunda",
    category: "Procedimiento",
    description: "Intervención quirúrgica mínimamente invasiva de alta especialidad para erradicación de endometriosis.",
    price: 7500,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-8",
    code: "INS-LARC",
    name: "Inserción de Implante Subdérmico LARC (Jadelle / Implanon) + Insumos",
    category: "Procedimiento",
    description: "Colocación subdérmica bajo anestesia local con técnica aséptica y apósito compresivo.",
    price: 450,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-9",
    code: "BIO-ENDO",
    name: "Biopsia Endometrial por Aspiración Tipo Pipelle",
    category: "Procedimiento",
    description: "Toma de muestra de cavidad endometrial ambulatoria con cánula de Pipelle sin dilatación.",
    price: 380,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "tar-10",
    code: "PAQ-PRENATAL",
    name: "Paquete de Seguimiento Prenatal Integral (Controles + Ecos 1T/Morfo)",
    category: "Paquete",
    description: "Monitoreo materno-fetal completo protocolizado MINSA/CLAP con ecografías de control.",
    price: 1800,
    active: true,
    createdAt: "2026-01-01T00:00:00Z",
  },
];

// Vademécum Farmacológico Específico CENDO
export const INITIAL_VADEMECUM: MedicationVademecum[] = [
  {
    id: "vad-1",
    genericName: "Dienogest 2 mg",
    atcCode: "G03DB08",
    therapeuticGroup: "Progestágenos / Tratamiento de Endometriosis",
    commercialBrands: [
      { brandName: "Visannette", laboratory: "Bayer", presentation: "Caja x 28 comprimidos", referencePricePen: 215 },
      { brandName: "Dienopill", laboratory: "Bagó", presentation: "Caja x 30 comprimidos", referencePricePen: 145 },
    ],
    indications: "Tratamiento de la endometriosis ovárica y pélvica profunda, dismenorrea severa asociada.",
    contraindications: "Trastorno tromboembólico venoso activo, enfermedad hepática severa, hemorragia vaginal no filiada.",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "vad-2",
    genericName: "Clindamicina 100 mg + Ketoconazol 400 mg (Óvulos)",
    atcCode: "G01AF20",
    therapeuticGroup: "Antiinfecciosos ginecológicos combinados",
    commercialBrands: [
      { brandName: "Ginedazol Dual", laboratory: "Roemmers", presentation: "Caja x 7 óvulos", referencePricePen: 68 },
      { brandName: "Tricomax", laboratory: "Farmindustria", presentation: "Caja x 7 óvulos", referencePricePen: 54 },
    ],
    indications: "Vaginitis mixta, preparación antiséptica prequirúrgica cervical.",
    contraindications: "Hipersensibilidad a clindamicina o derivados imidazólicos.",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "vad-3",
    genericName: "Estriol 1 mg/g (Crema Vaginal)",
    atcCode: "G03CA04",
    therapeuticGroup: "Estrógenos tópicos urogenitales",
    commercialBrands: [
      { brandName: "Ovestin", laboratory: "Aspen", presentation: "Tubo x 30 g + aplicador", referencePricePen: 110 },
      { brandName: "Colpotrophine", laboratory: "Theramex", presentation: "Tubo x 30 g", referencePricePen: 95 },
    ],
    indications: "Atrofia vulvovaginal por deficiencia estrogénica en peri y postmenopausia.",
    contraindications: "Cáncer de mama o estrógeno-dependiente sospechado o confirmado, sangrado no diagnosticado.",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "vad-4",
    genericName: "Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg",
    atcCode: "B03AE02",
    therapeuticGroup: "Antianémicos y Suplementos Prenatales",
    commercialBrands: [
      { brandName: "Feranin Fol", laboratory: "Takeda", presentation: "Caja x 30 tabletas", referencePricePen: 48 },
      { brandName: "Maltofer Fol", laboratory: "Vifor Pharma", presentation: "Caja x 30 comprimidos", referencePricePen: 82 },
    ],
    indications: "Profilaxis y tratamiento de anemia por deficiencia de hierro durante la gestación.",
    contraindications: "Hemocromatosis, hemosiderosis, anemia hemolítica.",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "vad-5",
    genericName: "Levonorgestrel 75 mg (Implante Subdérmico Jadelle x 2 varillas)",
    atcCode: "G03AC03",
    therapeuticGroup: "Anticonceptivos de larga duración (LARC)",
    commercialBrands: [
      { brandName: "Jadelle", laboratory: "Bayer Healthcare", presentation: "Caja con 2 implantes subdérmicos + trocar", referencePricePen: 420 },
    ],
    indications: "Anticoncepción de larga duración hasta por 5 años continuos.",
    contraindications: "Embarazo conocido o sospechado, enfermedad arterial severa activa.",
    createdAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "vad-6",
    genericName: "Ketoprofeno 100 mg",
    atcCode: "M01AE03",
    therapeuticGroup: "Antiinflamatorios No Esteroides (AINEs)",
    commercialBrands: [
      { brandName: "Profenid", laboratory: "Sanofi", presentation: "Caja x 20 cápsulas", referencePricePen: 52 },
    ],
    indications: "Dolor pélvico agudo, dismenorrea severa secundaria a endometriosis.",
    contraindications: "Úlcera péptica activa, insuficiencia renal grave, alergia a AINEs.",
    createdAt: "2026-01-01T00:00:00Z",
  },
];

// Repositorio de Documentos & Exámenes Externos en PDF (Supabase)
export const INITIAL_DOCUMENTS: PatientDocument[] = [
  {
    id: "doc-luciana-01",
    patientId: "pat-luciana-ramos",
    documentType: "LABORATORIO",
    title: "Hemograma y Perfil Lipídico de Chequeo Preventivo - Suiza Lab",
    fileName: "Analisis_Sanguineo_Luciana_Ramos.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-luciana-ramos/Analisis_Sanguineo_Luciana_Ramos.pdf",
    filePath: "pat-luciana-ramos/Analisis_Sanguineo_Luciana_Ramos.pdf",
    fileSize: 142000,
    mimeType: "application/pdf",
    notes: "Hb: 13.5 g/dL, Leucocitos: 6,400, Plaquetas: 245,000, Colesterol Total: 175 mg/dL. Todo dentro de límites óptimos.",
    createdAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "doc-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    documentType: "LABORATORIO",
    title: "Perfil Prenatal Integral Primer Trimestre - Laboratorios Roe",
    fileName: "Perfil_Prenatal_Completo_Fiorella_Mendoza.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-fiorella-mendoza/Perfil_Prenatal_Completo_Fiorella_Mendoza.pdf",
    filePath: "pat-fiorella-mendoza/Perfil_Prenatal_Completo_Fiorella_Mendoza.pdf",
    fileSize: 215000,
    mimeType: "application/pdf",
    notes: "Hb: 12.6 g/dL, Grupo O Rh (+), Glucosa basal: 84 mg/dL, VDRL No Reactivo, VIH No Reactivo, Urocultivo Negativo.",
    createdAt: "2026-11-05T09:30:00Z",
  },
  {
    id: "doc-gabriela-01",
    patientId: "pat-gabriela-paredes",
    documentType: "INFORME_MEDICO",
    title: "Resonancia Magnética Multiparamétrica de Pelvis - Resomasa",
    fileName: "RMN_Pelvica_Endometriosis_Profunda_Gabriela_Paredes.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-gabriela-paredes/RMN_Pelvica_Endometriosis_Profunda_Gabriela_Paredes.pdf",
    filePath: "pat-gabriela-paredes/RMN_Pelvica_Endometriosis_Profunda_Gabriela_Paredes.pdf",
    fileSize: 489000,
    mimeType: "application/pdf",
    notes: "Informa endometrioma de 4.2 cm en ovario izquierdo y nódulo fibrótico de 1.2 cm en ligamento uterosacro izquierdo con estenosis focal serosa sin infiltración mucosa rectal.",
    createdAt: "2026-11-07T14:00:00Z",
  },
  {
    id: "doc-daniela-01",
    patientId: "pat-daniela-castro",
    documentType: "PATOLOGIA",
    title: "Informe Histopatológico de Biopsia de Cérvix - Oncocenter Patología",
    fileName: "Patologia_Biopsia_Cervical_NIC2_Daniela_Castro.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-daniela-castro/Patologia_Biopsia_Cervical_NIC2_Daniela_Castro.pdf",
    filePath: "pat-daniela-castro/Patologia_Biopsia_Cervical_NIC2_Daniela_Castro.pdf",
    fileSize: 187000,
    mimeType: "application/pdf",
    notes: "Diagnóstico histológico: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG). Efecto citopático coilocítico asociado a VPH. Márgenes estromales libres.",
    createdAt: "2026-11-08T11:30:00Z",
  },
  {
    id: "doc-carmen-01",
    patientId: "pat-carmen-huaman",
    documentType: "INFORME_MEDICO",
    title: "Densitometría Ósea DEXA Lumbar y Fémur - Centro Diagnóstico San Borja",
    fileName: "Densitometria_Osea_DEXA_Carmen_Huaman.pdf",
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-carmen-huaman/Densitometria_Osea_DEXA_Carmen_Huaman.pdf",
    filePath: "pat-carmen-huaman/Densitometria_Osea_DEXA_Carmen_Huaman.pdf",
    fileSize: 312000,
    mimeType: "application/pdf",
    notes: "Columna L1-L4: T-score -1.8 (Osteopenia). Cuello femoral: T-score -1.4. Sin criterios de osteoporosis manifiesta.",
    createdAt: "2026-11-10T17:00:00Z",
  },
];

// Consultas Ginecológicas Estructuradas (Punto 13)
export const INITIAL_CONSULTATIONS: MedicalConsultation[] = [
  {
    id: "cons-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    consultationDate: "2026-11-04",
    reasonForVisit: "Chequeo ginecológico de rutina y orientación para anticoncepción subdérmica",
    illnessTime: "Asintomática",
    symptoms: "Ninguno",
    vitalSigns: {
      bloodPressure: "110/70",
      heartRate: 72,
      respiratoryRate: 16,
      temperature: 36.5,
      oxygenSaturation: 99,
      weightKg: 54.0,
      heightCm: 162,
      bmi: 20.6,
    },
    physicalExam: {
      generalExam: "Paciente en buen estado general, lúcida, colaboradora, normohidratada.",
      breastsExam: "Mamas simétricas, blandas, depresibles, sin nódulos ni adenopatías palpables.",
      externalGenitalia: "Genitales externos acordes a edad y sexo, sin lesiones ni condilomas.",
      speculoscopy: "Cérvix eutrófico, rosado, orificio cervical externo puntiforme, sin sangrado ni flujo anormal.",
      bimanualPalpation: "Útero en AVF de 7 cm, móvil, no doloroso. Anexos libres sin masas.",
    },
    diagnosis: "Examen ginecológico de rutina / Planificación familiar (CIE-10 Z01.4)",
    cie10Code: "Z01.4",
    treatmentPlan: "1. Realización de Colposcopía y Ecografía TV.\n2. Inserción de Implante Jadelle bajo anestesia local.\n3. Suplementación con Ácido Fólico 0.5 mg diario.",
    auxiliaryExams: "Hemograma, glucosa, perfil lipídico y orina completa.",
    prescriptionNotes: "Ácido Fólico 0.5 mg y Paracetamol 500 mg condicional.",
    nextAppointmentDate: "2026-12-08",
    createdAt: "2026-11-04T10:00:00Z",
    updatedAt: "2026-11-04T11:30:00Z",
  },
  {
    id: "cons-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    consultationDate: "2026-11-13",
    reasonForVisit: "Control prenatal de segundo control (10 semanas) y náuseas matutinas",
    illnessTime: "3 semanas",
    symptoms: "Náuseas matutinas ocasionales, somnolencia, congestión mamaria.",
    vitalSigns: {
      bloodPressure: "110/68",
      heartRate: 78,
      respiratoryRate: 18,
      temperature: 36.5,
      oxygenSaturation: 98,
      weightKg: 57.8,
      heightCm: 163,
      bmi: 21.7,
    },
    physicalExam: {
      generalExam: "Gestante orientada en tiempo y espacio, fascie tranquila, mucosas húmedas.",
      breastsExam: "Mamas turgentes, areolas pigmentadas con tubérculos de Montgomery visibles. Sin masas sospechosas.",
      externalGenitalia: "Vulva y periné sin alteraciones. Sin pérdidas transvaginales de líquido ni sangre.",
      speculoscopy: "Cuello con signo de Chadwick leve (coloración violácea gestacional normal), OCE cerrado.",
      bimanualPalpation: "Útero gestacional aumentado de tamaño acorde a 10 semanas de amenorrea, blando, no doloroso.",
    },
    diagnosis: "Supervisión de embarazo normal de primer trimestre (CIE-10 Z34.0)",
    cie10Code: "Z34.0",
    treatmentPlan: "1. Continuar carnet de control prenatal MINSA/CLAP.\n2. Sulfato Ferroso 300 mg + Ácido Fólico 400 mcg diario.\n3. Dimenhidrinato 50 mg condicional.\n4. Programar ecografía genética (semanas 11-14).",
    auxiliaryExams: "Revisión de perfil prenatal del 1T (todos normales).",
    prescriptionNotes: "Sulfato Ferroso + Ácido Fólico x 30 días, Dimenhidrinato x 5 días.",
    nextAppointmentDate: "2026-12-11",
    createdAt: "2026-11-13T09:45:00Z",
    updatedAt: "2026-11-13T10:45:00Z",
  },
  {
    id: "cons-gabriela-01",
    patientId: "pat-gabriela-paredes",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    consultationDate: "2026-11-09",
    reasonForVisit: "Dismenorrea progresiva severa (EVA 9/10), dolor pélvico no menstrual y disquecia",
    illnessTime: "3 años con empeoramiento progresivo los últimos 6 meses",
    symptoms: "Dolor pélvico lancinante perimenstrual, dispareunia profunda, disquecia catamenial.",
    vitalSigns: {
      bloodPressure: "115/75",
      heartRate: 80,
      respiratoryRate: 16,
      temperature: 36.7,
      oxygenSaturation: 99,
      weightKg: 59.0,
      heightCm: 166,
      bmi: 21.4,
    },
    physicalExam: {
      generalExam: "Paciente quejumbrosa al examen pélvico, lúcida, marcha antálgica leve durante crisis.",
      breastsExam: "Mamas simétricas de consistencia normal sin nódulos.",
      externalGenitalia: "Sin lesiones evidentes en vulva o introito.",
      speculoscopy: "Cérvix desviado hacia la izquierda por retracción cicatrizal, fondo de saco posterior doloroso a la inspección.",
      bimanualPalpation: "Útero en RVF fija, escasa movilidad por adherencias. Palpación de nódulo doloroso de 1.5 cm en fondo de saco posterior y ligamento uterosacro izquierdo. Ovario izquierdo aumentado y doloroso.",
    },
    diagnosis: "Endometriosis pélvica profunda e infiltrativa y endometrioma ovárico izquierdo (CIE-10 N80.1 / N80.3)",
    cie10Code: "N80.1",
    treatmentPlan: "1. Tratamiento médico de supresión con Dienogest 2 mg continuo.\n2. Analgesia escalonada con Ketoprofeno 100 mg.\n3. Ecografía con mapeo de endometriosis protocolo IDEA.\n4. Propuesta de Laparoscopía Quirúrgica Avanzada para excisión completa.",
    auxiliaryExams: "Marcador CA-125, perfil hepático, prequirúrgico completo.",
    prescriptionNotes: "Dienogest 2mg diario continuo x 3 meses, Ketoprofeno 100mg condicional.",
    nextAppointmentDate: "2026-11-25",
    createdAt: "2026-11-09T14:45:00Z",
    updatedAt: "2026-11-09T16:15:00Z",
  },
  {
    id: "cons-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    consultationDate: "2026-11-10",
    reasonForVisit: "Entrega de resultado de biopsia cervical Tischler (NIC 2) y planificación de cono LEEP",
    illnessTime: "1 mes desde PAP anormal",
    symptoms: "Asintomática actualmente. Flujo vaginal escaso post-biopsia ya resuelto.",
    vitalSigns: {
      bloodPressure: "120/80",
      heartRate: 74,
      respiratoryRate: 16,
      temperature: 36.6,
      oxygenSaturation: 99,
      weightKg: 62.0,
      heightCm: 165,
      bmi: 22.8,
    },
    physicalExam: {
      generalExam: "Buen estado general, tranquila, comprende la naturaleza de la lesión cervical.",
      breastsExam: "Mamas simétricas, sin masas ni retracciones.",
      externalGenitalia: "Genitales normales sin lesiones activas.",
      speculoscopy: "Cérvix con lecho de biopsias a horas 11 y 1 en proceso de cicatrización adecuado, sin sangrado activo ni signos de infección.",
      bimanualPalpation: "Útero en AVF, tamaño normal, no doloroso a la movilización cervical. Anexos libres.",
    },
    diagnosis: "Displasia cervical moderada / NIC 2 (CIE-10 N87.1)",
    cie10Code: "N87.1",
    treatmentPlan: "1. Programar Conización cervical LEEP con asa diatérmica ambulatoria bajo anestesia local.\n2. Óvulos de Clindamicina + Ketoconazol nocturnos x 7 días.\n3. Firma de Consentimiento Informado Quirúrgico.",
    auxiliaryExams: "Coagulograma completo y riesgo pre-quirúrgico.",
    prescriptionNotes: "Clindamicina + Ketoconazol óvulos x 7 noches, Ibuprofeno 400 mg.",
    nextAppointmentDate: "2026-11-19",
    createdAt: "2026-11-10T11:00:00Z",
    updatedAt: "2026-11-10T12:00:00Z",
  },
  {
    id: "cons-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    consultationDate: "2026-11-12",
    reasonForVisit: "Síndrome climatérico severo, sofocos nocturnos intensos, sequedad vaginal y dispareunia",
    illnessTime: "14 meses",
    symptoms: "Bochornos frecuentes (> 6 al día), insomnio, irritabilidad, marcada resequedad vaginal con dolor al coito.",
    vitalSigns: {
      bloodPressure: "125/82",
      heartRate: 76,
      respiratoryRate: 16,
      temperature: 36.6,
      oxygenSaturation: 98,
      weightKg: 64.5,
      heightCm: 158,
      bmi: 25.8,
    },
    physicalExam: {
      generalExam: "Paciente lúcida, colaboradora, mucosas orales húmedas, piel algo adelgazada.",
      breastsExam: "Mamas con predominio adiposo, sin nódulos sólidos palpables ni secreción por pezón.",
      externalGenitalia: "Introito con mucosa adelgazada, pálida, pérdida de pliegues vaginales acorde a hipoestrogenismo severo.",
      speculoscopy: "Paredes vaginales pálidas y lisas. Cérvix pequeño atrófico sin lesiones focales ni sangrado.",
      bimanualPalpation: "Útero pequeño, atrófico, móvil, indoloro. Ovarios no palpables.",
    },
    diagnosis: "Estados menopáusicos y climatéricos de la mujer / Atrofia vulvovaginal (CIE-10 N95.1)",
    cie10Code: "N95.1",
    treatmentPlan: "1. Terapia local con Estriol crema 1 mg/g profunda.\n2. Suplemento de Calcio con Vitamina D3.\n3. Realización de biopsia Pipelle para confirmar atrofia endometrial antes de TRH sistémica.\n4. Control en 3 semanas con reporte histológico.",
    auxiliaryExams: "Densitometría ósea, perfil lipídico, mamografía/eco mamaria anual.",
    prescriptionNotes: "Estriol crema vaginal x 30g, Citrato de Calcio + Vit D3 x 60 días.",
    nextAppointmentDate: "2026-12-03",
    createdAt: "2026-11-12T15:15:00Z",
    updatedAt: "2026-11-12T16:45:00Z",
  },
];

// Informes de Ecografía Especializada (Punto 5)
export const INITIAL_ULTRASOUNDS: UltrasoundReport[] = [
  {
    id: "eco-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    reportDate: "2026-11-04",
    ultrasoundType: "TRANSVAGINAL",
    indication: "Chequeo ginecológico preventivo y evaluación previa a inserción de implante LARC",
    findings: {
      uterusPosition: "AVF",
      uterusDimensions: "72 x 34 x 42 mm",
      uterusVolumeCc: 53.5,
      myometriumStatus: "Homogéneo, ecogenicidad conservada, sin nódulos miomatosos ni adenomiosis.",
      endometriumThicknessMm: 6.2,
      endometriumPattern: "Trilaminar",
      rightOvaryDimensions: "28 x 18 x 20 mm (Vol: 5.2 cc)",
      leftOvaryDimensions: "30 x 19 x 22 mm (Vol: 6.5 cc)",
      ovariesNotes: "Ambos ovarios con reserva folicular antral acorde a edad (7-8 folículos por corte).",
      douglasPouch: "Libre, sin líquido libre en cavidad peritoneal.",
    },
    conclusion: "Ecografía transvaginal dentro de límites normales. Aparato reproductor ginecológico sano.",
    recommendations: "Control ecográfico preventivo en 1 año.",
    images: [
      { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop", caption: "Corte longitudinal de útero en AVF con endometrio trilaminar de 6.2 mm" },
      { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop", caption: "Ovario derecho con folículos antrales fisiológicos normales" },
    ],
    createdAt: "2026-11-04T10:30:00Z",
    updatedAt: "2026-11-04T10:30:00Z",
  },
  {
    id: "eco-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    reportDate: "2026-11-13",
    ultrasoundType: "OBSTETRICA_1T",
    indication: "Control prenatal primer trimestre (Semana 10) - Verificación de viabilidad fetal",
    findings: {
      gestationalSacsCount: 1,
      embryoCrownRumpLengthMm: 33.8,
      gestationalAgeByEcho: "10 semanas 1 día",
      fetalHeartRate: 168,
      placentaLocation: "Posterior en desarrollo homogéneo",
      amnioticFluidIndex: "Normal para la edad gestacional",
    },
    conclusion: "Gestación única activa intrauterina de 10 semanas. Vitalidad y morfología fetal temprana conservada.",
    recommendations: "Programar ecografía genética (tamizaje aneuploidías y translucencia nucal) a las 12-13 semanas.",
    images: [
      { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop", caption: "Embrión único con LCC de 33.8 mm acorde a 10 semanas" },
      { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop", caption: "Doppler espectral con FCF regular de 168 latidos por minuto" },
    ],
    createdAt: "2026-11-13T10:15:00Z",
    updatedAt: "2026-11-13T10:15:00Z",
  },
  {
    id: "eco-gabriela-01",
    patientId: "pat-gabriela-paredes",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    reportDate: "2026-11-09",
    ultrasoundType: "PELVICA",
    indication: "Mapeo ecográfico especializado de endometriosis profunda (Protocolo IDEA)",
    findings: {
      uterusPosition: "RVF",
      uterusDimensions: "78 x 46 x 42 mm",
      uterusVolumeCc: 79.0,
      myometriumStatus: "Heterogéneo, engrosamiento de pared posterior con estrías hipoecoicas (Adenomiosis focal).",
      endometriumThicknessMm: 8.4,
      endometriumPattern: "Secretor",
      rightOvaryDimensions: "38 x 30 x 28 mm (Vol: 16.6 cc)",
      leftOvaryDimensions: "42 x 34 x 36 mm (Vol: 26.8 cc)",
      ovariesNotes: "Endometrioma ovárico izquierdo de 42 mm y derecho de 38 mm con ecos internos en vidrio esmerilado. Kissing Ovaries positivo en línea media retrocervical.",
      douglasPouch: "Signo de deslizamiento (Sliding sign) NEGATIVO en fondo de saco posterior. Nódulo hipoecoico de 12 mm en ligamento uterosacro izquierdo.",
    },
    conclusion: "1. Endometriosis ovárica bilateral severa con Endometriomas y Kissing Ovaries.\n2. Endometriosis profunda en ligamento uterosacro izquierdo con adherencia peritoneal.\n3. Adenomiosis uterina focal posterior.",
    recommendations: "Valoración pre-quirúrgica para laparoscopía avanzada de excisión de endometriosis profunda.",
    images: [
      { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=500&auto=format&fit=crop", caption: "Endometrioma ovárico izquierdo de 42 mm con ecos en vidrio esmerilado" },
      { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop", caption: "Kissing Ovaries: Ambos ovarios adheridos retrocervicalmente en línea media" },
    ],
    createdAt: "2026-11-09T15:30:00Z",
    updatedAt: "2026-11-09T15:30:00Z",
  },
  {
    id: "eco-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    reportDate: "2026-11-12",
    ultrasoundType: "MAMA_BILATERAL",
    indication: "Despistaje mamario ecográfico anual previo a inicio de TRH climatérica",
    findings: {
      breastPattern: "Predominio tejido adiposo con islotes fibroglandulares residuales homogéneos.",
      rightBreastFindings: "A hora 10 radio 3 se visualiza imagen anecoica de 7 x 5 mm, bordes netos, sin vascularización interna, compatible con quiste simple benigno.",
      leftBreastFindings: "Sin nódulos sólidos, quísticos ni distorsiones de la arquitectura.",
      biradsCategory: "BI-RADS 2",
    },
    conclusion: "Hallazgos ecográficos mamarios benignos. Quiste simple en mama derecha BI-RADS 2.",
    recommendations: "Control mamario habitual en 1 año (Mamografía bilateral complementaria).",
    images: [
      { url: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=500&auto=format&fit=crop", caption: "Mama derecha radio 10: Quiste simple anecoico de 7 x 5 mm BI-RADS 2" },
    ],
    createdAt: "2026-11-12T15:45:00Z",
    updatedAt: "2026-11-12T15:45:00Z",
  },
];

// Procedimientos Menores & Biopsias Semilla (Punto 6)
export const INITIAL_MINOR_PROCEDURES: MinorProcedureReport[] = [
  {
    id: "proc-luciana-01",
    patientId: "pat-luciana-ramos",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    procedureDate: "2026-11-04",
    procedureType: "INSERCION_IMPLANTE",
    preOpDiagnosis: "Deseo de anticoncepción reversible de larga duración (LARC)",
    postOpDiagnosis: "Inserción exitosa de implante subdérmico Jadelle (2 varillas)",
    cie10Code: "Z30.0",
    anesthesiaType: "Local (Lidocaína 2%)",
    procedureDetails: {
      asepsisTechnique: "Antisepsia estricta con Clorhexidina al 2% en cara anterointerna de brazo no dominante.",
      specimenSentToPathology: false,
      bleedingAmount: "Mínimo (< 10 ml)",
      hemostasisMethod: "Compresión",
      complications: "Sin complicaciones inmediatas. Adecuada palpación subdérmica de ambas varillas.",
    },
    postOpIndications: "Mantener vendaje compresivo durante 24 horas. Evitar mojar la zona por 48 horas. Signos de alarma explicados.",
    medicationsPrescribed: "Paracetamol 500 mg condicional a dolor local.",
    nextControlDate: "2026-12-08",
    createdAt: "2026-11-04T11:15:00Z",
    updatedAt: "2026-11-04T11:15:00Z",
  },
  {
    id: "proc-daniela-01",
    patientId: "pat-daniela-castro",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    procedureDate: "2026-11-01",
    procedureType: "BIOPSIA_CERVICAL",
    preOpDiagnosis: "Sospecha colposcópica de LIE-AG / NIC 2 en labio anterior",
    postOpDiagnosis: "Biopsia de cuello uterino dirigida Tischler a horas 11 y 1",
    cie10Code: "N87.1",
    anesthesiaType: "Tópica",
    procedureDetails: {
      asepsisTechnique: "Colocación de espéculo bivalvo estéril, lavado cervical con SSF y solución de ác. acético al 5%.",
      biopsySites: "Horas 11:00 y 1:00 sobre epitelio acetoblanco denso",
      specimenSentToPathology: true,
      specimenDescription: "Dos fragmentos tisulares blanquecino-rosáceos de 3x2 mm fijados en formol tamponado al 10%.",
      bleedingAmount: "Escaso",
      hemostasisMethod: "Solución de Monsel",
      complications: "Ninguna. Excelente hemostasia con pasta de Monsel.",
    },
    postOpIndications: "Reposo relativo por 24 horas. No duchas vaginales ni relaciones sexuales por 7 días. Acudir con resultado de patología.",
    medicationsPrescribed: "Ibuprofeno 400 mg cada 8 horas por 2 días si cólico.",
    nextControlDate: "2026-11-10",
    createdAt: "2026-11-01T11:30:00Z",
    updatedAt: "2026-11-01T11:30:00Z",
  },
  {
    id: "proc-carmen-01",
    patientId: "pat-carmen-huaman",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    doctorCmp: "61693",
    doctorRne: "38657",
    procedureDate: "2026-11-12",
    procedureType: "BIOPSIA_ENDOMETRIAL",
    preOpDiagnosis: "Síndrome climatérico en evaluación para TRH / Confirmación de atrofia endometrial",
    postOpDiagnosis: "Biopsia endometrial por aspiración tipo Pipelle ambulatoria",
    cie10Code: "N95.1",
    anesthesiaType: "Sin Anestesia",
    procedureDetails: {
      asepsisTechnique: "Limpieza con povidona yodada en cérvix, pinzamiento suave con Pozzi, inserción de cánula Pipelle de 3.1 mm.",
      biopsySites: "Cavidad endometrial completa por aspiración circunferencial",
      specimenSentToPathology: true,
      specimenDescription: "Escasas hebras mucosas y tisulares endometriales fijadas en formol al 10%.",
      bleedingAmount: "Mínimo (< 10 ml)",
      hemostasisMethod: "Compresión",
      complications: "Molestia leve tipo dismenorrea tolerable de 3 minutos. Sin sangrado activo.",
    },
    postOpIndications: "Uso de toalla higiénica por 24 horas por manchado leve esperado. Reposo relativo el día del procedimiento.",
    medicationsPrescribed: "Paracetamol 500 mg en caso de cólico leve.",
    nextControlDate: "2026-12-03",
    createdAt: "2026-11-12T16:15:00Z",
    updatedAt: "2026-11-12T16:15:00Z",
  },
];

// Presupuestos & Cotizaciones Médicas (Punto 3 - con WhatsApp)
export const INITIAL_QUOTES: ProcedureQuote[] = [
  {
    id: "quot-luciana-01",
    patientId: "pat-luciana-ramos",
    patientName: "Luciana María Ramos Figueroa",
    patientPhone: "+51 984 125 639",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    quoteDate: "2026-11-04",
    validityDays: 30,
    items: [
      { procedureId: "tar-8", code: "INS-LARC", name: "Inserción de Implante Subdérmico LARC + Insumos", category: "Procedimiento", regularPrice: 450, discountPercent: 0, finalPrice: 450 },
      { procedureId: "tar-2", code: "COLPO-DX", name: "Colposcopía Digital de Alta Resolución IFCPC", category: "Procedimiento", regularPrice: 250, discountPercent: 0, finalPrice: 250 },
      { procedureId: "tar-1", code: "CONS-ESP", name: "Consulta Médica Ginecológica Especializada", category: "Consulta", regularPrice: 180, discountPercent: 16.67, finalPrice: 150 },
    ],
    subtotal: 880,
    discountTotal: 30,
    total: 850,
    paymentTerms: "Efectivo, Tarjeta de Crédito/Débito, Transferencia BCP / BBVA o Yape / Plin.",
    notes: "Paquete promocional integral de chequeo y colocación de implante LARC.",
    createdAt: "2026-11-04T11:45:00Z",
  },
  {
    id: "quot-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    patientName: "Fiorella Beatriz Mendoza Chávez",
    patientPhone: "+51 976 543 218",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    quoteDate: "2026-11-05",
    validityDays: 45,
    items: [
      { procedureId: "tar-10", code: "PAQ-PRENATAL", name: "Paquete de Seguimiento Prenatal Integral (Controles + Ecos 1T/Morfo)", category: "Paquete", regularPrice: 1800, discountPercent: 0, finalPrice: 1800 },
    ],
    subtotal: 1800,
    discountTotal: 0,
    total: 1800,
    paymentTerms: "Pago fraccionado en 3 armadas mensuales o cuotas sin intereses.",
    notes: "Incluye todas las atenciones médicas prenatales y ecografías de tamizaje.",
    createdAt: "2026-11-05T10:15:00Z",
  },
  {
    id: "quot-gabriela-01",
    patientId: "pat-gabriela-paredes",
    patientName: "Gabriela Alejandra Paredes Vílchez",
    patientPhone: "+51 992 847 163",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    quoteDate: "2026-11-09",
    validityDays: 30,
    items: [
      { procedureId: "tar-7", code: "LAPA-ENDO", name: "Cirugía Laparoscópica Ginecológica Avanzada / Escisión Endometriosis Profunda", category: "Procedimiento", regularPrice: 7500, discountPercent: 0, finalPrice: 7500 },
    ],
    subtotal: 7500,
    discountTotal: 0,
    total: 7500,
    paymentTerms: "Convenio con EPS / Cartas de garantía o financiamiento directo CENDO.",
    notes: "Presupuesto quirúrgico que incluye honorarios del equipo multidisciplinario (Ginecólogo laparoscopista y cirujano digestivo).",
    createdAt: "2026-11-09T17:00:00Z",
  },
  {
    id: "quot-daniela-01",
    patientId: "pat-daniela-castro",
    patientName: "Daniela Fernanda Castro Morales",
    patientPhone: "+51 987 456 123",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    quoteDate: "2026-11-10",
    validityDays: 30,
    items: [
      { procedureId: "tar-6", code: "LEEP-CX", name: "Conización Cervical LEEP / Radiocirugía Ambulatoria con Asa Diatérmica", category: "Procedimiento", regularPrice: 1600, discountPercent: 0, finalPrice: 1600 },
    ],
    subtotal: 1600,
    discountTotal: 0,
    total: 1600,
    paymentTerms: "Contado o tarjeta de crédito hasta 6 cuotas.",
    notes: "Incluye procedimiento en sala de operaciones ambulatoria, anestesia local y curación.",
    createdAt: "2026-11-10T12:15:00Z",
  },
  {
    id: "quot-carmen-01",
    patientId: "pat-carmen-huaman",
    patientName: "Carmen Rosa Huamán Quispe",
    patientPhone: "+51 965 318 742",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    quoteDate: "2026-11-12",
    validityDays: 30,
    items: [
      { procedureId: "tar-9", code: "BIO-ENDO", name: "Biopsia Endometrial por Aspiración Tipo Pipelle", category: "Procedimiento", regularPrice: 380, discountPercent: 0, finalPrice: 380 },
      { procedureId: "tar-4", code: "ECO-MAMA", name: "Ecografía Mamaria Bilateral con Clasificación BI-RADS", category: "Ecografía", regularPrice: 200, discountPercent: 0, finalPrice: 200 },
      { procedureId: "tar-3", code: "ECO-TV", name: "Ecografía Ginecológica Transvaginal Doppler Color", category: "Ecografía", regularPrice: 180, discountPercent: 0, finalPrice: 180 },
      { procedureId: "tar-1", code: "CONS-ESP", name: "Consulta Médica Ginecológica Especializada", category: "Consulta", regularPrice: 180, discountPercent: 0, finalPrice: 180 },
    ],
    subtotal: 940,
    discountTotal: 0,
    total: 940,
    paymentTerms: "Efectivo o tarjeta.",
    notes: "Paquete de estudio y evaluación pre-TRH para menopausia.",
    createdAt: "2026-11-12T17:00:00Z",
  },
];

// Agenda de Citas & Disponibilidad Semilla (Puntos 10 y 11)
export const INITIAL_APPOINTMENTS: MedicalAppointment[] = [
  {
    id: "app-luciana-01",
    patientId: "pat-luciana-ramos",
    patientName: "Luciana María Ramos Figueroa",
    patientDni: "73819204",
    patientPhone: "984 125 639",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "09:00",
    durationMinutes: 30,
    appointmentType: "CONTROL_GINECOLOGICO",
    reason: "Control post-inserción de implante LARC y retiro de apósito compresivo",
    status: "CONFIRMADA",
    notes: "Paciente confirmó asistencia por WhatsApp.",
    reminderSent: true,
    createdAt: "2026-11-04T12:00:00Z",
    updatedAt: "2026-11-04T12:00:00Z",
  },
  {
    id: "app-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    patientName: "Fiorella Beatriz Mendoza Chávez",
    patientDni: "75294816",
    patientPhone: "976 543 218",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    appointmentDate: new Date().toISOString().split("T")[0],
    appointmentTime: "10:30",
    durationMinutes: 45,
    appointmentType: "CONTROL_PRENATAL",
    reason: "Control prenatal oficial MINSA/CLAP (Semana 10) y ecografía de viabilidad",
    status: "EN_ESPERA",
    notes: "Paciente presente en sala de espera de CENDO.",
    reminderSent: true,
    createdAt: "2026-11-05T11:00:00Z",
    updatedAt: "2026-11-13T10:00:00Z",
  },
  {
    id: "app-gabriela-01",
    patientId: "pat-gabriela-paredes",
    patientName: "Gabriela Alejandra Paredes Vílchez",
    patientDni: "71628493",
    patientPhone: "992 847 163",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    appointmentDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    appointmentTime: "11:30",
    durationMinutes: 45,
    appointmentType: "CONSULTA_PRIMERA_VEZ",
    reason: "Evaluación pre-quirúrgica y revisión de riesgo operatorio para laparoscopía",
    status: "PENDIENTE",
    notes: "Acudirá con familiares para explicación de la técnica quirúrgica.",
    reminderSent: false,
    createdAt: "2026-11-09T17:30:00Z",
    updatedAt: "2026-11-09T17:30:00Z",
  },
  {
    id: "app-daniela-01",
    patientId: "pat-daniela-castro",
    patientName: "Daniela Fernanda Castro Morales",
    patientDni: "74195820",
    patientPhone: "987 456 123",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    appointmentDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    appointmentTime: "15:00",
    durationMinutes: 60,
    appointmentType: "PROCEDIMIENTO_MENOR",
    reason: "Conización cervical LEEP ambulatoria con asa diatérmica",
    status: "CONFIRMADA",
    notes: "Ayuno de sólidos de 4 horas. Consentimiento informado firmado.",
    reminderSent: true,
    createdAt: "2026-11-10T12:30:00Z",
    updatedAt: "2026-11-10T12:30:00Z",
  },
  {
    id: "app-carmen-01",
    patientId: "pat-carmen-huaman",
    patientName: "Carmen Rosa Huamán Quispe",
    patientDni: "09482715",
    patientPhone: "965 318 742",
    doctorId: "doc-patrick-jacinto",
    doctorName: "Dr. Patrick José Jacinto Gomero",
    appointmentDate: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    appointmentTime: "16:30",
    durationMinutes: 30,
    appointmentType: "CHEQUEO_INTEGRAL",
    reason: "Control clínico de respuesta a Estriol y reporte de patología endometrial",
    status: "PENDIENTE",
    notes: "Traer densitometría ósea original.",
    reminderSent: false,
    createdAt: "2026-11-12T17:15:00Z",
    updatedAt: "2026-11-12T17:15:00Z",
  },
];

// Historias Clínicas Importadas en Word (Punto 12)
export const INITIAL_WORD_HISTORIES: WordHistoryDocument[] = [
  {
    id: "word-luciana-01",
    patientId: "pat-luciana-ramos",
    fileName: "Historia_Previa_Ginecologia_ClinicaElGolf_LucianaRamos.docx",
    fileSize: 42100,
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-luciana-ramos/Historia_Previa_Ginecologia_ClinicaElGolf_LucianaRamos.docx",
    extractedText: "HISTORIA CLÍNICA GINECOLÓGICA EXTERNA (FORMATO WORD):\nFecha: 15/02/2025\nPaciente: Ramos Figueroa, Luciana María (24 años)\nMotivo: Control anual. Nuligesta. Ciclos regulares 28/4. No antecedentes patológicos de importancia.\nExamen físico: Cérvix sano, orificio puntiforme. Papanicolau de base líquida tomado: Negativo para lesión.\nPlan previo: Mantener controles anuales preventivos.",
    notes: "Registro clínico previo en Word importado al expediente digital CENDO.",
    createdAt: "2026-11-04T10:10:00Z",
  },
  {
    id: "word-fiorella-01",
    patientId: "pat-fiorella-mendoza",
    fileName: "Ficha_Preconcepcional_ClinicaSanBorja_FiorellaMendoza.docx",
    fileSize: 48300,
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-fiorella-mendoza/Ficha_Preconcepcional_ClinicaSanBorja_FiorellaMendoza.docx",
    extractedText: "EVALUACIÓN PRECONCEPCIONAL (FORMATO WORD):\nFecha: 20/05/2026\nPaciente: Mendoza Chávez, Fiorella Beatriz (29 años)\nMotivo: Deseo de concepción planificada con su cónyuge. G0 P0000.\nAntecedentes médicos: Sin antecedentes quirúrgicos. Madre con antecedente de diabetes gestacional en último parto.\nPlan anterior: Inicio de suplementación con Ácido Fólico 0.5 mg diario, perfil serológico completo y suspensión de métodos anticonceptivos.",
    notes: "Registro preconcepcional previo importado desde Word al expediente digital CENDO.",
    createdAt: "2026-11-05T10:30:00Z",
  },
  {
    id: "word-gabriela-01",
    patientId: "pat-gabriela-paredes",
    fileName: "Informe_Operatorio_Previo_Apendicectomia_RMN_Paredes.docx",
    fileSize: 56400,
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-gabriela-paredes/Informe_Operatorio_Previo_Apendicectomia_RMN_Paredes.docx",
    extractedText: "HISTORIA CLÍNICA PREVIA Y ANTECEDENTE QUIRÚRGICO (FORMATO WORD):\nFecha: 10/11/2024\nPaciente: Paredes Navarro, Gabriela Alejandra (30 años)\nAntecedente quirúrgico: Apendicectomía abierta a los 16 años por plastrón apendicular en fosa ilíaca derecha.\nEvolución dolorosa: Dismenorrea progresiva y severa desde los 28 años, EVA 8/10 a 9/10, acompañada de disquecia y dolor pélvico no catamenial.\nEcografía externa previa: Reporta quiste en vidrio esmerilado de 3.5 cm en anexo izquierdo sugestivo de endometrioma.",
    notes: "Documento de evolución externa y antecedentes quirúrgicos importado en Word para el equipo quirúrgico CENDO.",
    createdAt: "2026-11-09T17:30:00Z",
  },
  {
    id: "word-daniela-01",
    patientId: "pat-daniela-castro",
    fileName: "Citologias_Anteriores_DanielaCastro.docx",
    fileSize: 39800,
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-daniela-castro/Citologias_Anteriores_DanielaCastro.docx",
    extractedText: "HISTORIAL DE CITOLOGÍAS Y PATOLOGÍA PREVIA (FORMATO WORD):\nFecha: 15/10/2026\nPaciente: Castro Villavicencio, Daniela Patricia (34 años)\nResultado Citológico PAP: Lesión intraepitelial escamosa de alto grado (LIE-AG / HSIL).\nPrueba de ADN VPH: Positivo para genotipo 16 de alto riesgo oncogénico.\nConducta indicada: Derivación urgente a colposcopía y biopsia dirigida para descartar lesión invasora.",
    notes: "Informe de citología inicial de laboratorio externo que motivó la derivación a CENDO.",
    createdAt: "2026-11-01T12:00:00Z",
  },
  {
    id: "word-carmen-01",
    patientId: "pat-carmen-huaman",
    fileName: "Historial_Ginecologico_Climaterio_CarmenHuaman.docx",
    fileSize: 44200,
    fileUrl: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pat-carmen-huaman/Historial_Ginecologico_Climaterio_CarmenHuaman.docx",
    extractedText: "FICHA CLÍNICA DE MENOPAUSIA PREVIA (FORMATO WORD):\nFecha: 18/06/2026\nPaciente: Huamán Sotomayor, Carmen Rosa (52 años)\nAntecedentes obstétricos: G2 P2002. FUM: Setiembre 2025. Salpingoclasia bilateral en 2006.\nMotivo: Inicio de bochornos vasomotores y sudoración profusa. Pérdida del sueño reparador.\nAntecedentes familiares: Madre con fractura de cadera por osteoporosis severa a los 74 años.\nPlan anterior: Suplementación con calcio citrato y estilo de vida.",
    notes: "Ficha médica previa de climaterio en formato Word provista por la paciente.",
    createdAt: "2026-11-12T17:45:00Z",
  },
];
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

  // Repositorio de Documentos y Exámenes Externos en PDF (Etapa B)
  patientDocuments: PatientDocument[];
  addPatientDocument: (doc: PatientDocument) => void;
  deletePatientDocument: (id: string) => Promise<void>;
  getDocumentsByPatientId: (patientId: string) => PatientDocument[];

  // Consultas Ginecológicas Estructuradas (Punto 13)
  consultations: MedicalConsultation[];
  addConsultation: (
    consultation: Omit<MedicalConsultation, "id" | "createdAt" | "updatedAt">
  ) => MedicalConsultation;
  updateConsultation: (
    id: string,
    updates: Partial<MedicalConsultation>
  ) => void;
  deleteConsultation: (id: string) => void;
  getConsultationsByPatientId: (patientId: string) => MedicalConsultation[];

  // Formatos de Ecografía Especializada (Punto 5)
  ultrasoundReports: UltrasoundReport[];
  addUltrasoundReport: (
    report: Omit<UltrasoundReport, "id" | "createdAt" | "updatedAt">
  ) => UltrasoundReport;
  updateUltrasoundReport: (
    id: string,
    updates: Partial<UltrasoundReport>
  ) => void;
  deleteUltrasoundReport: (id: string) => void;
  getUltrasoundsByPatientId: (patientId: string) => UltrasoundReport[];

  // Formatos de Procedimientos Menores & Biopsias (Punto 6)
  minorProcedures: MinorProcedureReport[];
  addMinorProcedure: (
    proc: Omit<MinorProcedureReport, "id" | "createdAt" | "updatedAt">
  ) => MinorProcedureReport;
  updateMinorProcedure: (
    id: string,
    updates: Partial<MinorProcedureReport>
  ) => void;
  deleteMinorProcedure: (id: string) => void;
  getMinorProceduresByPatientId: (patientId: string) => MinorProcedureReport[];

  // Tarifas Cotizadas & Presupuestos por WhatsApp (Punto 3)
  procedureQuotes: ProcedureQuote[];
  addQuote: (
    quote: Omit<ProcedureQuote, "id" | "createdAt">
  ) => ProcedureQuote;
  deleteQuote: (id: string) => void;
  getQuotesByPatientId: (patientId: string) => ProcedureQuote[];

  // Agenda de Citas y Disponibilidad (Puntos 10 y 11)
  appointments: MedicalAppointment[];
  addAppointment: (
    appt: Omit<MedicalAppointment, "id" | "createdAt" | "updatedAt">
  ) => MedicalAppointment;
  updateAppointment: (
    id: string,
    updates: Partial<MedicalAppointment>
  ) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDoctorId: (doctorId: string) => MedicalAppointment[];
  getAppointmentsByPatientId: (patientId: string) => MedicalAppointment[];
  getAppointmentsByDate: (date: string) => MedicalAppointment[];

  // Historias Clínicas en Word (Punto 12)
  wordHistories: WordHistoryDocument[];
  addWordHistory: (doc: WordHistoryDocument) => void;
  deleteWordHistory: (id: string) => Promise<void>;
  getWordHistoriesByPatientId: (patientId: string) => WordHistoryDocument[];

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
            patientDocuments: (state.patientDocuments || []).filter((d) => d.patientId !== id),
            consultations: (state.consultations || []).filter((c) => c.patientId !== id),
            ultrasoundReports: (state.ultrasoundReports || []).filter((u) => u.patientId !== id),
            minorProcedures: (state.minorProcedures || []).filter((p) => p.patientId !== id),
            procedureQuotes: (state.procedureQuotes || []).filter((q) => q.patientId !== id),
            appointments: (state.appointments || []).filter((a) => a.patientId !== id),
            wordHistories: (state.wordHistories || []).filter((w) => w.patientId !== id),
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
            menarche: 12,
            catamenialRegimen: "28/4",
            sexualDebutAge: 18,
            sexualPartnersCount: 1,
            stiHistory: "Niega ITS",
            papHistory: "No refiere",
            vphTestHistory: "No realizado",
            hasDiabetes: "Niega",
            hasHypertension: "Niega",
            hasAsthma: "Niega",
            medicalAllergies: "Niega",
            surgeriesHistory: "Niega",
            familyHistory: "No refiere",
            otherPathologies: "Niega",
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

      // REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS EN PDF (ETAPA B)
      patientDocuments: INITIAL_DOCUMENTS,
      addPatientDocument: (doc) => {
        set((state) => ({
          patientDocuments: [doc, ...(state.patientDocuments || [])],
        }));
        syncDocumentToSupabase(doc);
      },
      deletePatientDocument: async (id) => {
        const doc = (get().patientDocuments || []).find((d) => d.id === id);
        set((state) => ({
          patientDocuments: (state.patientDocuments || []).filter((d) => d.id !== id),
        }));
        await deleteDocumentFromSupabase(id, doc?.filePath);
      },
      getDocumentsByPatientId: (patientId) => {
        return (get().patientDocuments || []).filter((d) => d.patientId === patientId);
      },


      // CONSULTAS GINECOLÓGICAS ESTRUCTURADAS (ETAPA B - PUNTO 13)
      consultations: INITIAL_CONSULTATIONS,
      addConsultation: (consData) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `cons-${Date.now()}`;
        const now = new Date().toISOString();
        const newCons: MedicalConsultation = {
          ...consData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          consultations: [newCons, ...(state.consultations || [])],
        }));
        syncConsultationToSupabase(newCons);
        return newCons;
      },
      updateConsultation: (id, updates) => {
        let updated: MedicalConsultation | null = null;
        set((state) => ({
          consultations: (state.consultations || []).map((c) => {
            if (c.id === id) {
              updated = { ...c, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return c;
          }),
        }));
        if (updated) syncConsultationToSupabase(updated);
      },
      deleteConsultation: (id) => {
        set((state) => ({
          consultations: (state.consultations || []).filter((c) => c.id !== id),
        }));
        deleteConsultationFromSupabase(id);
      },
      getConsultationsByPatientId: (patientId) => {
        return (get().consultations || []).filter((c) => c.patientId === patientId);
      },

      // FORMATOS DE ECOGRAFÍA ESPECIALIZADA (ETAPA B - PUNTO 5)
      ultrasoundReports: INITIAL_ULTRASOUNDS,
      addUltrasoundReport: (repData) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `echo-${Date.now()}`;
        const now = new Date().toISOString();
        const newReport: UltrasoundReport = {
          ...repData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          ultrasoundReports: [newReport, ...(state.ultrasoundReports || [])],
        }));
        syncUltrasoundToSupabase(newReport);
        return newReport;
      },
      updateUltrasoundReport: (id, updates) => {
        let updated: UltrasoundReport | null = null;
        set((state) => ({
          ultrasoundReports: (state.ultrasoundReports || []).map((u) => {
            if (u.id === id) {
              updated = { ...u, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return u;
          }),
        }));
        if (updated) syncUltrasoundToSupabase(updated);
      },
      deleteUltrasoundReport: (id) => {
        set((state) => ({
          ultrasoundReports: (state.ultrasoundReports || []).filter((u) => u.id !== id),
        }));
        deleteUltrasoundFromSupabase(id);
      },
      getUltrasoundsByPatientId: (patientId) => {
        return (get().ultrasoundReports || []).filter((u) => u.patientId === patientId);
      },

      // FORMATOS DE PROCEDIMIENTOS MENORES & BIOPSIAS (ETAPA B - PUNTO 6)
      minorProcedures: INITIAL_MINOR_PROCEDURES,
      addMinorProcedure: (procData) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `proc-${Date.now()}`;
        const now = new Date().toISOString();
        const newProc: MinorProcedureReport = {
          ...procData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          minorProcedures: [newProc, ...(state.minorProcedures || [])],
        }));
        syncMinorProcedureToSupabase(newProc);
        return newProc;
      },
      updateMinorProcedure: (id, updates) => {
        let updated: MinorProcedureReport | null = null;
        set((state) => ({
          minorProcedures: (state.minorProcedures || []).map((p) => {
            if (p.id === id) {
              updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return p;
          }),
        }));
        if (updated) syncMinorProcedureToSupabase(updated);
      },
      deleteMinorProcedure: (id) => {
        set((state) => ({
          minorProcedures: (state.minorProcedures || []).filter((p) => p.id !== id),
        }));
        deleteMinorProcedureFromSupabase(id);
      },
      getMinorProceduresByPatientId: (patientId) => {
        return (get().minorProcedures || []).filter((p) => p.patientId === patientId);
      },

      // TARIFAS COTIZADAS & PRESUPUESTOS POR WHATSAPP (ETAPA C - PUNTO 3)
      procedureQuotes: INITIAL_QUOTES,
      addQuote: (quoteData) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `quote-${Date.now()}`;
        const newQuote: ProcedureQuote = {
          ...quoteData,
          id,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          procedureQuotes: [newQuote, ...(state.procedureQuotes || [])],
        }));
        syncQuoteToSupabase(newQuote);
        return newQuote;
      },
      deleteQuote: (id) => {
        set((state) => ({
          procedureQuotes: (state.procedureQuotes || []).filter((q) => q.id !== id),
        }));
        deleteQuoteFromSupabase(id);
      },
      getQuotesByPatientId: (patientId) => {
        return (get().procedureQuotes || []).filter((q) => q.patientId === patientId);
      },

      // AGENDA DE CITAS Y DISPONIBILIDAD (ETAPA C - PUNTOS 10 Y 11)
      appointments: INITIAL_APPOINTMENTS,
      addAppointment: (apptData) => {
        const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `appt-${Date.now()}`;
        const now = new Date().toISOString();
        const newAppt: MedicalAppointment = {
          ...apptData,
          id,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          appointments: [newAppt, ...(state.appointments || [])],
        }));
        syncAppointmentToSupabase(newAppt);
        return newAppt;
      },
      updateAppointment: (id, updates) => {
        let updated: MedicalAppointment | null = null;
        set((state) => ({
          appointments: (state.appointments || []).map((a) => {
            if (a.id === id) {
              updated = { ...a, ...updates, updatedAt: new Date().toISOString() };
              return updated;
            }
            return a;
          }),
        }));
        if (updated) syncAppointmentToSupabase(updated);
      },
      deleteAppointment: (id) => {
        set((state) => ({
          appointments: (state.appointments || []).filter((a) => a.id !== id),
        }));
        deleteAppointmentFromSupabase(id);
      },
      getAppointmentsByDoctorId: (doctorId) => {
        return (get().appointments || []).filter((a) => a.doctorId === doctorId);
      },
      getAppointmentsByPatientId: (patientId) => {
        return (get().appointments || []).filter((a) => a.patientId === patientId);
      },
      getAppointmentsByDate: (date) => {
        return (get().appointments || []).filter((a) => a.appointmentDate === date);
      },

      // HISTORIAS CLÍNICAS EN WORD (ETAPA C - PUNTO 12)
      wordHistories: INITIAL_WORD_HISTORIES,
      addWordHistory: (doc) => {
        set((state) => ({
          wordHistories: [doc, ...(state.wordHistories || [])],
        }));
        syncWordHistoryToSupabase(doc);
      },
      deleteWordHistory: async (id) => {
        const doc = (get().wordHistories || []).find((w) => w.id === id);
        set((state) => ({
          wordHistories: (state.wordHistories || []).filter((w) => w.id !== id),
        }));
        await deleteWordHistoryFromSupabase(id, doc?.fileName);
      },
      getWordHistoriesByPatientId: (patientId) => {
        return (get().wordHistories || []).filter((w) => w.patientId === patientId);
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
          patientDocuments: INITIAL_DOCUMENTS,
          consultations: INITIAL_CONSULTATIONS,
          ultrasoundReports: INITIAL_ULTRASOUNDS,
          minorProcedures: INITIAL_MINOR_PROCEDURES,
          procedureQuotes: INITIAL_QUOTES,
          appointments: INITIAL_APPOINTMENTS,
          wordHistories: INITIAL_WORD_HISTORIES,
          tariffItems: INITIAL_TARIFF,
          vademecumItems: INITIAL_VADEMECUM,
        });
      },
    }),
    {
      name: "cendo-storage",
      version: 8,
      migrate: (persistedState: any, version: number) => {
        if (version < 8) {
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
            patientDocuments: INITIAL_DOCUMENTS,
            consultations: INITIAL_CONSULTATIONS,
            ultrasoundReports: INITIAL_ULTRASOUNDS,
            minorProcedures: INITIAL_MINOR_PROCEDURES,
            procedureQuotes: INITIAL_QUOTES,
            appointments: INITIAL_APPOINTMENTS,
            wordHistories: INITIAL_WORD_HISTORIES,
            tariffItems: INITIAL_TARIFF,
            vademecumItems: INITIAL_VADEMECUM,
          };
        }
        return persistedState;
      },
      storage: createJSONStorage(() => localStorage),
    }
  )
);

