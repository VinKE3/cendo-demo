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
} from "@/types/medical";
import {
  syncPatientToSupabase,
  deletePatientFromSupabase,
  syncBackgroundToSupabase,
  syncColposcopyToSupabase,
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

// Paciente Semilla Real: María Stephany Herrera Rojas
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
];

// Antecedentes Gineco-Obstétricos de la Paciente Semilla
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
        set((state) => {
          const nextBackgrounds = { ...state.backgrounds };
          delete nextBackgrounds[id];
          return {
            patients: state.patients.filter((p) => p.id !== id),
            backgrounds: nextBackgrounds,
            colposcopyReports: state.colposcopyReports.filter((r) => r.patientId !== id),
            clinicalCheckups: state.clinicalCheckups.filter((c) => c.patientId !== id),
          };
        });
        deletePatientFromSupabase(id);
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

      // RESET
      resetToSeedData: () => {
        set({
          doctorsList: INITIAL_DOCTORS,
          doctorProfile: INITIAL_DOCTOR,
          patients: INITIAL_PATIENTS,
          backgrounds: INITIAL_BACKGROUNDS,
          colposcopyReports: INITIAL_COLPOSCOPY,
          clinicalCheckups: INITIAL_CHECKUPS,
          tariffItems: INITIAL_TARIFF,
          vademecumItems: INITIAL_VADEMECUM,
        });
      },
    }),
    {
      name: "cendo-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

