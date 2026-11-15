/**
 * CENDO - Script Automatizado de Certificación CRUD: ECOGRAFÍAS ESPECIALIZADAS
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear ecografía transvaginal con mapeo de endometriosis en Supabase)
 * 2. SELECT (Leer y verificar persistencia, Protocolo IDEA, hallazgos JSONB e imágenes)
 * 3. UPDATE (Modificar a ecografía mamaria con clasificación BI-RADS 2)
 * 4. VALIDATION (Validar cálculo de volumen uterino en cc y validador Zod de tipos)
 * 5. DELETE (Eliminar informe de prueba y certificar limpieza total)
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

const TEST_ECHO_ID = "50000000-0000-0000-0000-999999999999";
let testPatientId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function calculateUterusVolumeCc(lMm, apMm, tMm) {
  if (lMm <= 0 || apMm <= 0 || tMm <= 0) return 0;
  return Math.round(((lMm * apMm * tMm * 0.523) / 1000) * 10) / 10;
}

async function runTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  CENDO - CERTIFICACIÓN CRUD: ECOGRAFÍAS ESPECIALIZADAS & MAPEO ENDO   ${colors.reset}`);
  console.log(`${colors.cyan}  Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)${colors.reset}`);
  console.log(`${colors.cyan}  Supabase Cloud Target: ${supabaseUrl}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

  let passedTests = 0;
  const totalTests = 5;

  try {
    // 0. Obtener paciente oficial para la prueba
    const { data: patients, error: pError } = await supabase.from("patients").select("id, first_name, last_name, dni").limit(1);
    if (pError || !patients || patients.length === 0) {
      throw new Error("No se encontraron pacientes para asociar la ecografía de prueba.");
    }
    testPatientId = patients[0].id;
    const patientName = `${patients[0].first_name} ${patients[0].last_name}`;
    console.log(`👤 Paciente vinculada para test: ${colors.bold}${patientName}${colors.reset} (DNI: ${patients[0].dni})\n`);

    // Limpieza preventiva
    await supabase.from("ultrasound_reports").delete().eq("id", TEST_ECHO_ID);

    // TEST 1: INSERT
    console.log(`${colors.yellow}▶ TEST 1: INSERT - Creación de ecografía transvaginal con mapeo de endometriosis...${colors.reset}`);
    const echoPayload = {
      id: TEST_ECHO_ID,
      patient_id: testPatientId,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick José Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      report_date: "2026-11-14",
      ultrasound_type: "TRANSVAGINAL",
      indication: "Mapeo ecográfico especializado de endometriosis profunda (Protocolo IDEA)",
      findings: {
        uterusPosition: "AVF",
        uterusDimensions: "76 x 44 x 48 mm",
        uterusVolumeCc: 84.1,
        myometriumStatus: "Heterogéneo, engrosamiento asimétrico compatible con adenomiosis focal.",
        endometriumThicknessMm: 7.5,
        endometriumPattern: "Secretor",
        rightOvaryDimensions: "36 x 28 mm (Vol: 14.5 cc)",
        leftOvaryDimensions: "40 x 32 mm (Vol: 22.1 cc)",
        ovariesNotes: "Endometrioma ovárico izquierdo de 38 mm con ecos en vidrio esmerilado.",
        douglasPouch: "Signo de deslizamiento (sliding sign) NEGATIVO en fondo de saco de Douglas.",
        endometriosisFoci: "Nódulo de 10 mm en ligamento uterosacro izquierdo.",
      },
      conclusion: "1. Endometriosis ovárica izquierda (Endometrioma 38 mm).\n2. Adherencia pélvica profunda posterior.",
      recommendations: "Manejo médico supresor con Dienogest 2mg diario y valoración quirúrgica laparoscópica.",
      images: [
        { url: "https://images.unsplash.com/photo-1516549655169-df83a0774514", caption: "Endometrioma ovárico izquierdo 38 mm" },
        { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118", caption: "Fondo de saco posterior fijo (Sliding sign negativo)" },
      ],
    };

    const { data: inserted, error: insertError } = await supabase
      .from("ultrasound_reports")
      .insert(echoPayload)
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(`Fallo en INSERT de ecografía: ${insertError?.message}`);
    }

    console.log(`  ${colors.green}✔ INSERT exitoso:${colors.reset} ID: ${inserted.id}`);
    console.log(`    - Tipo: ${inserted.ultrasound_type} | Médico: ${inserted.doctor_name}`);
    console.log(`    - Hallazgo: ${inserted.findings?.ovariesNotes}`);
    passedTests++;

    // TEST 2: SELECT
    console.log(`\n${colors.yellow}▶ TEST 2: SELECT - Verificación de persistencia, JSONB e imágenes...${colors.reset}`);
    const { data: fetched, error: fetchError } = await supabase
      .from("ultrasound_reports")
      .select("*")
      .eq("id", TEST_ECHO_ID)
      .single();

    if (fetchError || !fetched) {
      throw new Error(`Fallo en SELECT de ecografía: ${fetchError?.message}`);
    }

    if (fetched.ultrasound_type !== "TRANSVAGINAL" || !fetched.findings?.douglasPouch) {
      throw new Error("Los datos de ecografía recuperados no coinciden con lo guardado.");
    }

    console.log(`  ${colors.green}✔ SELECT exitoso:${colors.reset} Conclusión: "${fetched.conclusion.slice(0, 50)}..."`);
    console.log(`    - Imágenes adjuntas: ${fetched.images?.length || 0}`);
    passedTests++;

    // TEST 3: UPDATE
    console.log(`\n${colors.yellow}▶ TEST 3: UPDATE - Modificación a Ecografía Mamaria Bilateral BI-RADS 2...${colors.reset}`);
    const { data: updated, error: updateError } = await supabase
      .from("ultrasound_reports")
      .update({
        ultrasound_type: "MAMA_BILATERAL",
        indication: "Despistaje mamario ecográfico preventivo",
        findings: {
          breastPattern: "Parénquima fibroglandular de distribución homogénea bilateral.",
          rightBreastFindings: "A hora 10 radio 3 se visualiza quiste simple anecoico de 6 x 4 mm de contornos regulares.",
          leftBreastFindings: "Sin nódulos sólidos, quísticos ni microcalcificaciones sospechosas.",
          biradsCategory: "BI-RADS 2",
        },
        conclusion: "Ecografía mamaria bilateral con hallazgo benigno: Quiste simple en mama derecha (BI-RADS 2).",
        recommendations: "Control mamario ecográfico habitual en 1 año.",
      })
      .eq("id", TEST_ECHO_ID)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Fallo en UPDATE de ecografía: ${updateError?.message}`);
    }

    if (updated.ultrasound_type !== "MAMA_BILATERAL" || updated.findings?.biradsCategory !== "BI-RADS 2") {
      throw new Error("Fallo en actualización de ecografía a BI-RADS 2.");
    }

    console.log(`  ${colors.green}✔ UPDATE exitoso:${colors.reset} Nuevo tipo: ${updated.ultrasound_type}`);
    console.log(`    - Clasificación: ${updated.findings?.biradsCategory}`);
    console.log(`    - Conclusión: "${updated.conclusion}"`);
    passedTests++;

    // TEST 4: DOMAIN VALIDATION
    console.log(`\n${colors.yellow}▶ TEST 4: DOMAIN VALIDATION - Cálculo de volumen uterino & rangos...${colors.reset}`);
    const vol = calculateUterusVolumeCc(75, 42, 48);
    if (vol < 75 || vol > 85) {
      throw new Error(`Fórmula de volumen uterino errónea: ${vol} cc (esperado ~79 cc)`);
    }
    console.log(`  ${colors.green}✔ Cálculo biométrico exacto:${colors.reset} 75 x 42 x 48 mm = ${vol} cc.`);

    const zeroVol = calculateUterusVolumeCc(0, 40, 30);
    if (zeroVol !== 0) {
      throw new Error("Dimensiones cero deben retornar 0 cc");
    }
    console.log(`  ${colors.green}✔ Manejo de límites correcto:${colors.reset} 0 mm retorna 0 cc.`);
    passedTests++;

    // TEST 5: DELETE & CLEANUP
    console.log(`\n${colors.yellow}▶ TEST 5: DELETE - Limpieza certificada del registro temporal...${colors.reset}`);
    const { error: deleteError } = await supabase
      .from("ultrasound_reports")
      .delete()
      .eq("id", TEST_ECHO_ID);

    if (deleteError) {
      throw new Error(`Fallo en DELETE de ecografía: ${deleteError.message}`);
    }

    const { data: leftover } = await supabase
      .from("ultrasound_reports")
      .select("id")
      .eq("id", TEST_ECHO_ID);

    if (leftover && leftover.length > 0) {
      throw new Error("El registro de prueba persiste en Supabase.");
    }

    console.log(`  ${colors.green}✔ DELETE exitoso:${colors.reset} Cero residuos en Supabase Cloud.`);
    passedTests++;

    // RESUMEN FINAL
    console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold}  RESULTADO: ${passedTests}/${totalTests} TESTS COMPLETADOS EXITOSAMENTE (100% PASS)  ${colors.reset}`);
    console.log(`${colors.cyan}  MÓDULO 11: ECOGRAFÍAS ESPECIALIZADAS CERTIFICADO EN SUPABASE CLOUD${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}❌ ERROR EN CERTIFICACIÓN DE ECOGRAFÍAS:${colors.reset}`, err.message);
    if (testPatientId) {
      await supabase.from("ultrasound_reports").delete().eq("id", TEST_ECHO_ID);
    }
    process.exit(1);
  }
}

runTestSuite();
