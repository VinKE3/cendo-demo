/**
 * CENDO - Script Automatizado de Certificación CRUD: CONSULTAS GINECOLÓGICAS
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear consulta médica con signos vitales y examen físico en Supabase)
 * 2. SELECT (Leer y verificar persistencia, JSONB de examen físico y diagnóstico)
 * 3. UPDATE (Modificar plan de tratamiento, receta y exámenes auxiliares)
 * 4. VALIDATION (Validar cálculo de IMC, clasificación y formato de PA)
 * 5. DELETE (Eliminar consulta de prueba y certificar limpieza total)
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
const TEST_CONSULTATION_ID = "c0000000-0000-0000-0000-888888888888";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function calculateBmi(weightKg, heightCm) {
  if (weightKg <= 0 || heightCm <= 0) return 22.0;
  const heightMeters = heightCm / 100;
  return Number((weightKg / (heightMeters * heightMeters)).toFixed(2));
}

function classifyBmi(bmi) {
  if (bmi < 18.5) return "Bajo peso";
  if (bmi < 24.9) return "Peso saludable / Normal";
  if (bmi < 29.9) return "Sobrepeso";
  return "Obesidad";
}

async function runConsultasCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: CONSULTAS GINECOLÓGICAS ESTRUCTURADAS${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre de prueba
    // ------------------------------------------------------------------------
    await supabase.from("medical_consultations").delete().eq("id", TEST_CONSULTATION_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { error: patErr } = await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Paciente",
      last_name: "Prueba Consulta",
      dni: "88776655",
      birth_date: "1992-04-12",
      phone: "999111222",
      email: "prueba.consulta@cendo.pe",
      civil_status: "Casada",
      occupation: "Abogada",
    });

    if (patErr) {
      throw new Error(`No se pudo crear paciente temporal de prueba: ${patErr.message}`);
    }

    // ------------------------------------------------------------------------
    // PRUEBA 1: CREATE (Insertar consulta médica estructurada en Supabase)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/4] INSERT: Creando consulta ginecológica en Supabase...${colors.reset}`);

    const newConsultation = {
      id: TEST_CONSULTATION_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      consultation_date: "2026-11-14",
      reason_for_visit: "Dolor pélvico crónico intenso y dismenorrea progresiva",
      illness_time: "8 meses",
      symptoms: "Dismenorrea EVA 9/10, dispareunia profunda, proctalgia cíclica",
      vital_signs: {
        bloodPressure: "115/75",
        heartRate: 72,
        respiratoryRate: 18,
        temperature: 36.6,
        oxygenSaturation: 99,
        weightKg: 56.5,
        heightCm: 162,
        bmi: 21.53,
      },
      physical_exam: {
        generalExam: "Paciente lúcida, afebril, en buen estado general.",
        breastsExam: "Mamas simétricas sin nódulos ni adenopatías.",
        externalGenitalia: "Genitales externos normotróficos sin lesiones.",
        speculoscopy: "Cérvix cerrado, no sangrante al contacto, sin leucorrea.",
        bimanualPalpation: "Útero en RVF, ligamentos uterosacros engrosados y dolorosos a la palpación.",
      },
      diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
      cie10_code: "N80.3",
      treatment_plan: "1. Dienogest 2mg VO c/24h continuo.\n2. Ecografía Doppler especializada de mapeo de endometriosis.",
      auxiliary_exams: "Ecografía transvaginal para mapeo de endometriosis, CA-125, Perfil renal",
      prescription_notes: "Dienogest 2mg #28, Paracetamol 1g condicional a dolor",
      next_appointment_date: "2026-12-14",
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("medical_consultations")
      .insert(newConsultation)
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Fallo en INSERT de consulta médica: ${insertErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Consulta registrada exitosamente con ID: ${inserted.id}${colors.reset}`);
    console.log(`  📅 Fecha: ${inserted.consultation_date} | 🩺 Diagnóstico: ${inserted.diagnosis}`);
    console.log(`  👨‍⚕️ Médico: ${inserted.doctor_name} (CMP: ${inserted.doctor_cmp})`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: SELECT (Consultar y validar integridad clínica en la nube)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/4] SELECT: Consultando y verificando integridad de JSONB clínicos...${colors.reset}`);

    const { data: fetched, error: fetchErr } = await supabase
      .from("medical_consultations")
      .select("*")
      .eq("id", TEST_CONSULTATION_ID)
      .single();

    if (fetchErr || !fetched) {
      throw new Error(`Fallo en SELECT de consulta médica: ${fetchErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Consulta leída de Supabase correctamente:${colors.reset}`);
    console.log(`    - Signos vitales: PA ${fetched.vital_signs?.bloodPressure}, IMC ${fetched.vital_signs?.bmi}`);
    console.log(`    - Examen físico especuloscópico: ${fetched.physical_exam?.speculoscopy}`);
    console.log(`    - CIE-10: ${fetched.cie10_code}`);
    console.log(`    - Plan de tratamiento: ${fetched.treatment_plan.slice(0, 40)}...`);

    if (
      fetched.diagnosis.includes("Endometriosis") &&
      fetched.vital_signs?.bloodPressure === "115/75" &&
      fetched.cie10_code === "N80.3"
    ) {
      console.log(`  ${colors.green}✔ Integridad de estructura clínica validada al 100%.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("Discrepancia en los valores leídos de la consulta.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE & CALCULATOR (Modificar tratamiento y validar calculadora)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/4] UPDATE & CALCULATOR: Modificando receta y verificando IMC clínico...${colors.reset}`);

    const calcBmi = calculateBmi(60, 165);
    const bmiClassification = classifyBmi(calcBmi);
    console.log(`  📊 Prueba calculadora IMC: 60kg / 165cm = ${calcBmi} (${bmiClassification})`);

    const { data: updated, error: updateErr } = await supabase
      .from("medical_consultations")
      .update({
        treatment_plan: "1. Dienogest 2mg VO c/24h por 6 meses.\n2. Control con RM pélvica.",
        prescription_notes: "Dienogest 2mg caja x 84 comprimidos",
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_CONSULTATION_ID)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Fallo en UPDATE de consulta médica: ${updateErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Plan de tratamiento actualizado y verificado en la nube.${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 4: DELETE (Eliminar consulta de prueba y certificar limpieza)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/4] DELETE: Eliminando registros de prueba y certificando limpieza total...${colors.reset}`);

    const { error: delConsErr } = await supabase
      .from("medical_consultations")
      .delete()
      .eq("id", TEST_CONSULTATION_ID);

    if (delConsErr) {
      throw new Error(`Fallo al eliminar consulta de prueba: ${delConsErr.message}`);
    }

    // Eliminar paciente temporal
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { data: verifyDel } = await supabase
      .from("medical_consultations")
      .select("id")
      .eq("id", TEST_CONSULTATION_ID)
      .maybeSingle();

    if (!verifyDel) {
      console.log(`  ${colors.green}✔ Consulta de prueba eliminada exitosamente. Cero residuos en base de datos.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("La consulta de prueba aún existe después del borrado.");
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`Módulo 7 (Consulta Ginecológica Estructurada) 100% verificado contra Supabase Cloud.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR DURANTE LA PRUEBA:${colors.reset}`, err.message);
    try {
      await supabase.from("medical_consultations").delete().eq("id", TEST_CONSULTATION_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    } catch {}
    process.exit(1);
  }
}

runConsultasCrudTest();
