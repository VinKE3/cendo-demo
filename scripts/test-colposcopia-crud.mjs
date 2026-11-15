/**
 * CENDO - Script Automatizado de Certificación CRUD: COLPOSCOPÍA IFCPC 2011
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear informe de colposcopía con IFCPC 2011, 4 fotos y reloj cervical en Supabase)
 * 2. SELECT (Leer y verificar persistencia, ZT Tipo 1, Schiller y reloj cervical)
 * 3. UPDATE (Modificar biopsia cervical a horas 11 y 1 con hallazgos Grado 2)
 * 4. VALIDATION (Validar regla clínica: si hay biopsia debe marcar horas del reloj 1-12)
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

const TEST_COLPO_ID = "a4000000-0000-0000-0000-999999999999";
let testPatientId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const VALID_HOURS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

function validateBiopsyClockHours(biopsyTaken, hours) {
  if (biopsyTaken) {
    if (!hours || hours.length === 0) {
      return { valid: false, error: "Si se tomó biopsia cervical, debe marcar al menos una hora en el reloj cervical." };
    }
    const invalid = hours.filter((h) => !VALID_HOURS.includes(String(h)));
    if (invalid.length > 0) {
      return { valid: false, error: `Horas de reloj inválidas: ${invalid.join(", ")}` };
    }
  }
  return { valid: true };
}

async function runTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  CENDO - CERTIFICACIÓN CRUD: COLPOSCOPÍA IFCPC 2011 & RELOJ CERVICAL  ${colors.reset}`);
  console.log(`${colors.cyan}  Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)${colors.reset}`);
  console.log(`${colors.cyan}  Supabase Cloud Target: ${supabaseUrl}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

  let passedTests = 0;
  const totalTests = 5;

  try {
    // 0. Obtener paciente oficial para la prueba
    const { data: patients, error: pError } = await supabase.from("patients").select("id, first_name, last_name, dni").limit(1);
    if (pError || !patients || patients.length === 0) {
      throw new Error("No se encontraron pacientes para asociar el informe colposcópico de prueba.");
    }
    testPatientId = patients[0].id;
    const patientName = `${patients[0].first_name} ${patients[0].last_name}`;
    console.log(`👤 Paciente vinculada para test: ${colors.bold}${patientName}${colors.reset} (DNI: ${patients[0].dni})\n`);

    // Limpieza preventiva
    await supabase.from("colposcopy_reports").delete().eq("id", TEST_COLPO_ID);

    // TEST 1: INSERT
    console.log(`${colors.yellow}▶ TEST 1: INSERT - Creación de informe colposcópico IFCPC 2011 con 4 fotos...${colors.reset}`);
    const colpoPayload = {
      id: TEST_COLPO_ID,
      patient_id: testPatientId,
      report_date: "2026-11-14",
      adequate_colposcopy: true,
      squamocolumnar_junction_visible: "Visible",
      transformation_zone_type: "Tipo 1",
      mature_squamous_epithelium: true,
      ectopy: true,
      thin_acetowhite_epithelium: false,
      irregular_border: false,
      fine_mosaic: false,
      fine_punctation: false,
      dense_acetowhite_epithelium: false,
      coarse_mosaic: false,
      coarse_punctation: false,
      atypical_vessels: false,
      schiller_test: "Negativo (Lugol Caoba)",
      cervical_biopsy_taken: false,
      biopsy_clock_hours: [],
      images: [
        { url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118", caption: "Panorámica SSF", timestamp: "10:30" },
        { url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982", caption: "Ácido acético 5%", timestamp: "10:33" },
        { url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c", caption: "Filtro verde", timestamp: "10:35" },
        { url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7", caption: "Test de Schiller", timestamp: "10:38" },
      ],
      diagnosis: "Colposcopía satisfactoria adecuada. Ectopia periorificial sin atipia.",
      plan_recommendations: "Control citológico anual preventivo. No requiere biopsia.",
      cie10_code: "Z01.4",
      doctor_name: "Dr. Patrick José Jacinto Gomero",
    };

    const { data: inserted, error: insertError } = await supabase
      .from("colposcopy_reports")
      .insert(colpoPayload)
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(`Fallo en INSERT de colposcopía: ${insertError?.message}`);
    }

    console.log(`  ${colors.green}✔ INSERT exitoso:${colors.reset} ID: ${inserted.id}`);
    console.log(`    - ZT: ${inserted.transformation_zone_type} | UEC: ${inserted.squamocolumnar_junction_visible}`);
    console.log(`    - Fotos cargadas: ${inserted.images?.length || 0} imágenes cuadrante`);
    passedTests++;

    // TEST 2: SELECT
    console.log(`\n${colors.yellow}▶ TEST 2: SELECT - Verificación de persistencia, IFCPC y fotos...${colors.reset}`);
    const { data: fetched, error: fetchError } = await supabase
      .from("colposcopy_reports")
      .select("*")
      .eq("id", TEST_COLPO_ID)
      .single();

    if (fetchError || !fetched) {
      throw new Error(`Fallo en SELECT de colposcopía: ${fetchError?.message}`);
    }

    if (fetched.transformation_zone_type !== "Tipo 1" || fetched.images?.length !== 4) {
      throw new Error("Datos recuperados no coinciden con el informe guardado.");
    }

    console.log(`  ${colors.green}✔ SELECT exitoso:${colors.reset} Diagnóstico: "${fetched.diagnosis.slice(0, 50)}..."`);
    console.log(`    - Schiller: ${fetched.schiller_test}`);
    console.log(`    - Especialista: ${fetched.doctor_name}`);
    passedTests++;

    // TEST 3: UPDATE
    console.log(`\n${colors.yellow}▶ TEST 3: UPDATE - Registro de Biopsia Tischler y Horas Reloj (11h y 1h)...${colors.reset}`);
    const { data: updated, error: updateError } = await supabase
      .from("colposcopy_reports")
      .update({
        transformation_zone_type: "Tipo 2",
        dense_acetowhite_epithelium: true,
        coarse_mosaic: true,
        schiller_test: "Positivo (Yodo negativo)",
        cervical_biopsy_taken: true,
        biopsy_clock_hours: ["11", "1"],
        diagnosis: "Hallazgos colposcópicos anormales Grado 2 (Mayor) / Sospecha LIE-AG (NIC 2)",
        plan_recommendations: "Biopsia dirigida a horas 11 y 1 enviada a patología. Esperar resultado para Cono LEEP.",
        cie10_code: "N87.1",
      })
      .eq("id", TEST_COLPO_ID)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Fallo en UPDATE de colposcopía: ${updateError?.message}`);
    }

    if (!updated.cervical_biopsy_taken || updated.biopsy_clock_hours?.length !== 2) {
      throw new Error("Fallo en actualización de biopsia y reloj cervical.");
    }

    console.log(`  ${colors.green}✔ UPDATE exitoso:${colors.reset} Biopsia tomada: SÍ`);
    console.log(`    - Reloj cervical: Horas ${JSON.stringify(updated.biopsy_clock_hours)}`);
    console.log(`    - Nuevo CIE-10: ${updated.cie10_code} (Displasia moderada)`);
    passedTests++;

    // TEST 4: VALIDATION
    console.log(`\n${colors.yellow}▶ TEST 4: DOMAIN VALIDATION - Reglas de Reloj Cervical y Validación IFCPC...${colors.reset}`);
    const valInvalid = validateBiopsyClockHours(true, []);
    if (valInvalid.valid) {
      throw new Error("La validación debió rechazar biopsia sin horas de reloj.");
    }
    console.log(`  ${colors.green}✔ Validación anti-inconsistencia correcta:${colors.reset} Bloqueó biopsia sin horas.`);

    const valBadHours = validateBiopsyClockHours(true, ["13", "0", "abc"]);
    if (valBadHours.valid) {
      throw new Error("La validación debió rechazar horas fuera del rango 1-12.");
    }
    console.log(`  ${colors.green}✔ Validación de rango correcta:${colors.reset} Rechazó horas inválidas fuera de 1h - 12h.`);

    const valValid = validateBiopsyClockHours(true, ["12", "6"]);
    if (!valValid.valid) {
      throw new Error("La validación debió aceptar horas válidas 12 y 6.");
    }
    console.log(`  ${colors.green}✔ Aprobación de caso clínico correcto:${colors.reset} Horas 12 y 6 aceptadas.`);
    passedTests++;

    // TEST 5: DELETE & CLEANUP
    console.log(`\n${colors.yellow}▶ TEST 5: DELETE - Limpieza certificada del registro temporal...${colors.reset}`);
    const { error: deleteError } = await supabase
      .from("colposcopy_reports")
      .delete()
      .eq("id", TEST_COLPO_ID);

    if (deleteError) {
      throw new Error(`Fallo en DELETE de colposcopía: ${deleteError.message}`);
    }

    const { data: leftover } = await supabase
      .from("colposcopy_reports")
      .select("id")
      .eq("id", TEST_COLPO_ID);

    if (leftover && leftover.length > 0) {
      throw new Error("El registro de prueba persiste en Supabase.");
    }

    console.log(`  ${colors.green}✔ DELETE exitoso:${colors.reset} Cero residuos en Supabase Cloud.`);
    passedTests++;

    // RESUMEN FINAL
    console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold}  RESULTADO: ${passedTests}/${totalTests} TESTS COMPLETADOS EXITOSAMENTE (100% PASS)  ${colors.reset}`);
    console.log(`${colors.cyan}  MÓDULO 10: COLPOSCOPÍA IFCPC 2011 CERTIFICADO EN SUPABASE CLOUD${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}❌ ERROR EN CERTIFICACIÓN DE COLPOSCOPÍA:${colors.reset}`, err.message);
    if (testPatientId) {
      await supabase.from("colposcopy_reports").delete().eq("id", TEST_COLPO_ID);
    }
    process.exit(1);
  }
}

runTestSuite();
