/**
 * CENDO - Seeder Oficial: Carnet de Control Prenatal MINSA / CLAP
 * Módulo 13 (src/modules/prenatal/)
 *
 * Registra el Carnet Prenatal oficial para:
 * Paciente: María José Contreras Solís (DNI 44556677 / ID: 10000000-0000-0000-0000-000000000002)
 * Gestación actual de bajo riesgo obstétrico inicial, FUM: 2026-09-04, FPP Naegele: 2027-06-11.
 * Incluye datos basales completos, visita 1 (semana 5) y visita 2 (semana 9).
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function getEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error("No se encontró el archivo .env.local en la raíz del proyecto.");
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim();
        env[key] = val;
      }
    }
  }
  return env;
}

const env = getEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Faltan las variables NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PRENATAL_CARD_ID = "70000000-0000-0000-0000-000000000001";
const PATIENT_ID = "10000000-0000-0000-0000-000000000002"; // María José Contreras Solís

const officialPrenatalCard = {
  id: PRENATAL_CARD_ID,
  patient_id: PATIENT_ID,
  clinic_establishment: "CENDO - Centro de Endometriosis y Ginecología",
  attending_doctor_id: "doc-patrick-jacinto",
  attending_doctor_name: "Dr. Patrick Jacinto Gomero",
  baseline: {
    insuranceType: "PRIVADO",
    insuranceCode: "RIMAC-9923841",
    educationLevel: "Superior Univ",
    civilStatus: "Casada",
    fatherName: "Carlos Eduardo Mendoza Ruiz",
    fatherDni: "41223344",
    gestas: 1,
    abortos: 0,
    partosVaginales: 0,
    cesareas: 0,
    nacidosVivos: 0,
    nacidosMuertos: 0,
    viven: 0,
    multipleHistory: false,
    pretermHistory: false,
    adequateIntergenesicPeriod: true,
    familyHistory: ["Madre con diabetes gestacional en 2do embarazo", "Padre con HTA controlada"],
    personalHistory: ["Ninguno"],
    previousVaccines: {
      rubella: true,
      hepatitisB: true,
      hpv: true,
      yellowFever: false,
    },
    usualWeightKg: 59.0,
    heightCm: 165,
    bloodGroup: "O",
    rhFactor: "Rh (+)",
    smokerCigarettesDay: 0,
    drugsUse: false,
    fum: "2026-09-04",
    fumDoubt: false,
    ultrasoundGestationalAgeWeeks: 5,
    ultrasoundDate: "2026-10-12",
    fpp: "2027-06-11", // FUM + 7 días - 3 meses + 1 año
    clinicalExam: "Normal",
    breastsExam: "Normal",
    cervixExam: "Normal",
    pelvisExam: "Normal",
    dentalExam: "Normal",
    hemoglobin1: 12.8,
    bloodGlucose1: 82,
    vdrlRpr1: "No reactivo",
    hivScreening1: "Negativo",
    hepatitisBScreening: "Negativo",
    completeUrineExam: "Normal",
    urineCulture: "Negativo",
    papTestResult: "Normal",
    colposcopyResult: "No se hizo",
  },
  visits: [
    {
      visitNumber: 1,
      visitDate: "2026-10-12",
      visitTime: "09:30",
      gestationalAgeWeeks: 5,
      gestationalAgeDays: 3,
      maternalWeightKg: 59.2,
      temperature: 36.6,
      bloodPressure: "110/70",
      maternalPulse: 72,
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
      counselingGiven: "Nutrición materna, signos de alarma obstétrica y suplementación de ácido fólico 0.5 mg/día.",
      ultrasoundGestationalAge: "5 sem 2 d (Saco gestacional intrauterino normoinserto)",
      biophysicalProfileScore: "NA",
      nextAppointmentDate: "2026-11-10",
      homeVisit: "No",
      attendingDoctorName: "Dr. Patrick Jacinto Gomero",
      notes: "Captación precoz de gestante. Embarazo planificado y normoevolutivo.",
    },
    {
      visitNumber: 2,
      visitDate: "2026-11-10",
      visitTime: "10:15",
      gestationalAgeWeeks: 9,
      gestationalAgeDays: 4,
      maternalWeightKg: 60.1,
      temperature: 36.5,
      bloodPressure: "110/75",
      maternalPulse: 74,
      uterineHeightCm: 8,
      fetusSituation: "L",
      fetusPresentation: "C",
      fetusPosition: "NA",
      fetalHeartRate: 168,
      fetalMovements: "NA",
      proteinuria: "-",
      edema: "-",
      tendonReflex: "++",
      nippleExam: "Formado",
      ironFolicAcidGiven: true,
      calciumGiven: true,
      counselingGiven: "Importancia del tamizaje genético 1er trimestre (11 a 13.6 sem) y dieta fraccionada para náuseas.",
      ultrasoundGestationalAge: "9 sem 4 d (LCR acorde a EG, actividad cardíaca presente y rítmica)",
      biophysicalProfileScore: "NA",
      nextAppointmentDate: "2026-12-08",
      homeVisit: "No",
      attendingDoctorName: "Dr. Patrick Jacinto Gomero",
      notes: "Control del primer trimestre. Embrión vital, cuello cerrado, sin pérdidas hemáticas.",
    },
  ],
  maternal_pathologies: [
    {
      id: "path-01",
      name: "Emesis gravídica leve de primer trimestre",
      cie10: "O21.0",
      diagnosedDate: "2026-10-12",
    },
  ],
  updated_at: new Date().toISOString(),
};

async function seedPrenatalCard() {
  console.log("\n🌱 Sembrando Carnet de Control Prenatal Oficial CENDO (Módulo 13)...");

  const { data, error } = await supabase
    .from("prenatal_cards")
    .upsert(officialPrenatalCard, { onConflict: "id" })
    .select("id, patient_id, clinic_establishment, attending_doctor_name")
    .single();

  if (error) {
    console.error("❌ Error al sembrar carnet prenatal:", error.message);
    process.exit(1);
  }

  console.log("✅ Carnet Prenatal sembrado exitosamente en Supabase Cloud:");
  console.log(`   - ID Carnet: ${data.id}`);
  console.log(`   - Paciente ID: ${data.patient_id} (María José Contreras Solís)`);
  console.log(`   - Médico: ${data.attending_doctor_name}`);
  console.log(`   - Visitas registradas: 2 atenciones estructuradas`);
  console.log(`   - FUM: 2026-09-04 | FPP Naegele: 2027-06-11`);
  console.log(`   - Estado: 100% Sincronizado en la nube.\n`);
}

seedPrenatalCard();
