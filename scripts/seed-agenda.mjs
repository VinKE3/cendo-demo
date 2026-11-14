/**
 * CENDO - Inyector de Citas Médicas Oficiales para la Agenda
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

function getEnv() {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) throw new Error(".env.local no encontrado");
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const idx = trimmed.indexOf("=");
      if (idx !== -1) env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
  return env;
}

const env = getEnv();
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

const today = new Date();
const tomorrow = new Date();
tomorrow.setDate(today.getDate() + 1);

const todayStr = formatDate(today);
const tomorrowStr = formatDate(tomorrow);

const OFFICIAL_APPOINTMENTS = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    appointment_date: todayStr,
    appointment_time: "09:00",
    duration_minutes: 45,
    appointment_type: "CONSULTA_PRIMERA_VEZ",
    reason: "Dismenorrea severa incapacitante, sospecha clínica de endometriosis ovárica",
    status: "CONFIRMADA",
    notes: "Paciente derivada de consultorio general. Asistirá con exámenes previos.",
    reminder_sent: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000002", // Fiorella Mendoza
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    appointment_date: todayStr,
    appointment_time: "10:00",
    duration_minutes: 30,
    appointment_type: "CONTROL_GINECOLOGICO",
    reason: "Control post-operatorio laparoscópico y evaluación de ecografía TV",
    status: "EN_ESPERA",
    notes: "Paciente ya presente en sala de espera del 2do piso.",
    reminder_sent: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Gabriela Paredes
    doctor_id: "doc-patrick-jacinto",
    doctor_name: "Dr. Patrick Jacinto Gomero",
    appointment_date: todayStr,
    appointment_time: "11:30",
    duration_minutes: 40,
    appointment_type: "CONTROL_PRENATAL",
    reason: "Control Prenatal II Trimestre (Semana 22) y Doppler Arterias Uterinas",
    status: "ATENDIDA",
    notes: "Control exitoso. Se entregó orden de perfil bioquímico gestacional.",
    reminder_sent: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Daniela Castro
    doctor_id: "doc-carlos-mendoza",
    doctor_name: "Dr. Carlos Mendoza",
    appointment_date: tomorrowStr,
    appointment_time: "15:00",
    duration_minutes: 30,
    appointment_type: "COLPOSCOPIA",
    reason: "Colposcopía y biopsia cervical dirigida por resultado citológico anormal",
    status: "CONFIRMADA",
    notes: "Indicar a la paciente abstinencia sexual y sin lavados 48h antes.",
    reminder_sent: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000005",
    patient_id: "10000000-0000-0000-0000-000000000005", // Carmen Huamán
    doctor_id: "doc-andrea-morales",
    doctor_name: "Dra. Andrea Morales",
    appointment_date: tomorrowStr,
    appointment_time: "16:30",
    duration_minutes: 30,
    appointment_type: "CHEQUEO_INTEGRAL",
    reason: "Chequeo ginecológico integral preventivo anual y PAP",
    status: "PENDIENTE",
    notes: "Pendiente confirmación telefónica por recepción.",
    reminder_sent: false,
  },
];

async function seedAgenda() {
  console.log("\n=======================================================");
  console.log("🌱 CENDO - INYECTANDO CITAS MÉDICAS OFICIALES EN LA NUBE");
  console.log(`📅 Fecha de hoy: ${todayStr} | Mañana: ${tomorrowStr}`);
  console.log("=======================================================\n");

  for (const appt of OFFICIAL_APPOINTMENTS) {
    const { data, error } = await supabase
      .from("medical_appointments")
      .upsert(appt, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      console.error(`❌ Error al inyectar cita ${appt.id}:`, error.message);
    } else {
      console.log(`✔ Cita registrada: ${appt.appointment_date} ${appt.appointment_time} [${appt.status}]`);
      console.log(`   Médico: ${appt.doctor_name} | Motivo: ${appt.reason}`);
    }
  }

  console.log("\n=======================================================");
  console.log("🎉 INYECCIÓN DE AGENDA COMPLETADA EXITOSAMENTE");
  console.log("=======================================================\n");
}

seedAgenda();
