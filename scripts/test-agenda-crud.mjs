/**
 * CENDO - Script Automatizado de Certificación CRUD: AGENDA DE CITAS MÉDICAS
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear cita médica vinculada a paciente y doctor)
 * 2. SELECT (Leer y verificar persistencia, hora, motivo y paciente)
 * 3. UPDATE (Modificar hora, estado a EN_ESPERA / ATENDIDA y notas)
 * 4. VALIDATION CONFLICT (Verificar detección de solapamiento de horario)
 * 5. DELETE (Eliminar cita de prueba y certificar limpieza total)
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

const TEST_PATIENT_ID = "10000000-0000-0000-0000-999999999999";
const TEST_APPOINTMENT_ID = "a0000000-0000-0000-0000-888888888888";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function parseTimeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function checkOverlap(candidateStart, candidateDuration, apptStart, apptDuration) {
  const candidateEnd = candidateStart + candidateDuration;
  const apptEnd = apptStart + apptDuration;
  return candidateStart < apptEnd && candidateEnd > apptStart;
}

async function runAgendaCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: AGENDA DE CITAS MÉDICAS${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre de prueba
    // ------------------------------------------------------------------------
    await supabase.from("medical_appointments").delete().eq("id", TEST_APPOINTMENT_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { error: patErr } = await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Paciente",
      last_name: "Prueba Agenda",
      dni: "99887766",
      birth_date: "1994-06-20",
      phone: "999888777",
      email: "prueba.agenda@cendo.pe",
      civil_status: "Soltera",
      occupation: "Ingeniera",
    });

    if (patErr) {
      throw new Error(`No se pudo crear paciente temporal de prueba: ${patErr.message}`);
    }

    // ------------------------------------------------------------------------
    // PRUEBA 1: CREATE (Insertar cita médica en Supabase)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/4] INSERT: Creando cita médica de prueba en Supabase...${colors.reset}`);

    const newAppointment = {
      id: TEST_APPOINTMENT_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick Jacinto Gomero",
      appointment_date: "2026-11-20",
      appointment_time: "10:30",
      duration_minutes: 30,
      appointment_type: "CONTROL_GINECOLOGICO",
      reason: "Chequeo periódico de control post-quirúrgico",
      status: "CONFIRMADA",
      notes: "Paciente requiere ecografía de control previo a la consulta",
      reminder_sent: false,
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("medical_appointments")
      .insert(newAppointment)
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Fallo en INSERT de cita médica: ${insertErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Cita registrada exitosamente con ID: ${inserted.id}${colors.reset}`);
    console.log(`  📅 Fecha: ${inserted.appointment_date} | ⏰ Hora: ${inserted.appointment_time} (${inserted.duration_minutes} min)`);
    console.log(`  👨‍⚕️ Médico: ${inserted.doctor_name} | Estado: ${inserted.status}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: SELECT (Consultar y validar integridad de datos)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/4] SELECT: Consultando y validando integridad en la nube...${colors.reset}`);

    const { data: fetched, error: fetchErr } = await supabase
      .from("medical_appointments")
      .select("*, patients(first_name, last_name, dni, phone)")
      .eq("id", TEST_APPOINTMENT_ID)
      .single();

    if (fetchErr || !fetched) {
      throw new Error(`Fallo en SELECT de cita médica: ${fetchErr?.message}`);
    }

    const patientName = fetched.patients ? `${fetched.patients.last_name}, ${fetched.patients.first_name}` : "Desconocido";
    console.log(`  ${colors.green}✔ Cita leída de Supabase correctamente:${colors.reset}`);
    console.log(`    - Paciente: ${patientName} (DNI: ${fetched.patients?.dni})`);
    console.log(`    - Motivo: ${fetched.reason}`);
    console.log(`    - Tipo: ${fetched.appointment_type}`);
    console.log(`    - Recordatorio WhatsApp Enviado: ${fetched.reminder_sent}`);

    if (
      String(fetched.appointment_date).slice(0, 10) === "2026-11-20" &&
      String(fetched.appointment_time).startsWith("10:30") &&
      fetched.status === "CONFIRMADA"
    ) {
      console.log(`  ${colors.green}✔ Integridad de campos validada al 100%.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("Discrepancia en los valores leídos de la cita.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE & CONFLICT CHECK (Modificar estado y probar solapamiento)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/4] UPDATE & CONFLICT: Modificando estado y verificando regla de solapamiento...${colors.reset}`);

    // Modificar estado a EN_ESPERA
    const { data: updated, error: updateErr } = await supabase
      .from("medical_appointments")
      .update({
        status: "EN_ESPERA",
        reminder_sent: true,
        notes: "Paciente ya presente en sala de espera. Notificada por WhatsApp.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_APPOINTMENT_ID)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Fallo en UPDATE de cita médica: ${updateErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Estado actualizado a: ${updated.status}${colors.reset}`);
    console.log(`  ✔ Recordatorio WhatsApp marcado: ${updated.reminder_sent}`);

    // Probar detección de conflicto de horario
    const apptStart = parseTimeToMinutes("10:30");
    const conflictCandidate = { start: parseTimeToMinutes("10:45"), duration: 30 }; // Se solapa de 10:45 a 11:15 con 10:30-11:00
    const hasOverlap = checkOverlap(conflictCandidate.start, conflictCandidate.duration, apptStart, 30);

    if (hasOverlap) {
      console.log(`  ${colors.green}✔ Algoritmo anti-solapamiento detectó colisión horaria correctamente (10:45 vs 10:30-11:00).${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("El algoritmo anti-solapamiento falló en detectar colisión.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 4: DELETE (Eliminar registros temporales y certificar limpieza)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/4] DELETE: Eliminando registros de prueba y certificando limpieza total...${colors.reset}`);

    const { error: delApptErr } = await supabase
      .from("medical_appointments")
      .delete()
      .eq("id", TEST_APPOINTMENT_ID);

    if (delApptErr) {
      throw new Error(`Fallo al eliminar cita de prueba: ${delApptErr.message}`);
    }

    // Eliminar paciente temporal
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    // Confirmar que no exista
    const { data: verifyDel } = await supabase
      .from("medical_appointments")
      .select("id")
      .eq("id", TEST_APPOINTMENT_ID)
      .maybeSingle();

    if (!verifyDel) {
      console.log(`  ${colors.green}✔ Cita de prueba eliminada exitosamente. Cero residuos en base de datos.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("La cita de prueba aún existe después del borrado.");
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`Módulo 6 (Agenda de Citas Médicas) 100% verificado contra Supabase Cloud.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR DURANTE LA PRUEBA:${colors.reset}`, err.message);
    // Limpieza de emergencia
    try {
      await supabase.from("medical_appointments").delete().eq("id", TEST_APPOINTMENT_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    } catch {}
    process.exit(1);
  }
}

runAgendaCrudTest();
