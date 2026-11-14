/**
 * CENDO - Script Automatizado de Certificación CRUD: ANTECEDENTES GINECO-OBSTÉTRICOS
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear antecedentes gineco-obstétricos vinculados a UUID de paciente)
 * 2. SELECT (Leer y verificar consistencia de FUR, Menarquia, R/C y Fórmula Obstétrica)
 * 3. UPDATE (Modificar método anticonceptivo, alergias y notas clínicas)
 * 4. DELETE (Eliminar antecedentes de prueba y certificar borrado)
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
const TEST_BG_ID = "b0000000-0000-0000-0000-999999999999";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runAntecedentesCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: ANTECEDENTES GINECO-OBSTÉTRICOS${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre
    // ------------------------------------------------------------------------
    await supabase.from("patient_backgrounds").delete().eq("id", TEST_BG_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    // Crear paciente efímero para respetar la foreign key
    await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      dni: "99887711",
      document_number: "99887711",
      document_type: "DNI",
      first_name: "PACIENTE TEST ANTECEDENTES",
      last_name: "PRUEBA AUTOMATIZADA",
      full_name: "PRUEBA AUTOMATIZADA, PACIENTE TEST ANTECEDENTES",
      birth_date: "1998-03-10",
      age: 28,
      phone: "987 000 111",
    });

    // ------------------------------------------------------------------------
    // TEST 1: CREATE (Inserción de antecedentes en patient_backgrounds)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[PRUEBA 1/4] Registrando antecedentes gineco-obstétricos en Supabase...${colors.reset}`);
    const startTimeCreate = Date.now();

    const newBackground = {
      id: TEST_BG_ID,
      patient_id: TEST_PATIENT_ID,
      menarche: 12,
      sexual_debut_age: 18,
      sexual_partners_count: 2,
      catamenial_regimen: "28/4",
      sti_history: "Niega ITS",
      obstetric_formula: "G1 P1001",
      contraceptive_method: "Implante subdérmico (Jadelle / Implanon)",
      last_menstrual_period: "2026-10-25",
      pap_history: "Normal hace 6 meses",
      vph_test_history: "Negativo PCR alto riesgo",
      has_diabetes: "Niega",
      has_hypertension: "Niega",
      has_asthma: "Niega",
      medical_allergies: "Alergia a AINEs (Ketorolaco)",
      surgeries_history: "Apendicectomía laparoscópica (2020)",
      family_history: "Madre con antecedentes de miomatosis uterina",
      other_pathologies: "Niega",
      notes: "Registro generado por prueba automatizada de certificación modular.",
    };

    const { error: insertError } = await supabase
      .from("patient_backgrounds")
      .insert(newBackground);

    const createDuration = Date.now() - startTimeCreate;

    if (insertError) {
      console.error(`  ❌ [FAIL] Error al insertar antecedentes: ${insertError.message}`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Antecedentes insertados correctamente en ${createDuration} ms${colors.reset}`);
    console.log(`    - ID Ficha: ${newBackground.id}`);
    console.log(`    - Fórmula Obstétrica: ${newBackground.obstetric_formula} | Régimen: R/C ${newBackground.catamenial_regimen}`);
    console.log(`    - FUR: ${newBackground.last_menstrual_period} | MAC: ${newBackground.contraceptive_method}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 2: READ (Verificación íntegra de antecedentes)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 2/4] Leyendo y verificando integridad del historial clínico...${colors.reset}`);
    const startTimeRead = Date.now();

    const { data: readData, error: readError } = await supabase
      .from("patient_backgrounds")
      .select("*")
      .eq("id", TEST_BG_ID)
      .single();

    const readDuration = Date.now() - startTimeRead;

    if (readError || !readData) {
      console.error(`  ❌ [FAIL] No se pudo leer el registro de antecedentes: ${readError?.message || "No encontrado"}`);
      process.exit(1);
    }

    if (
      readData.patient_id !== TEST_PATIENT_ID ||
      readData.obstetric_formula !== "G1 P1001" ||
      readData.menarche !== 12 ||
      readData.last_menstrual_period !== "2026-10-25"
    ) {
      console.error(`  ❌ [FAIL] Discrepancia en antecedentes leídos:`, readData);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Lectura y consistencia de datos confirmada en ${readDuration} ms${colors.reset}`);
    console.log(`    - Menarquía: ${readData.menarche} años | Inicio vida sexual: ${readData.sexual_debut_age} años`);
    console.log(`    - Alergias detectadas: "${readData.medical_allergies}"`);
    console.log(`    - PAP y VPH previos: "${readData.pap_history}" / "${readData.vph_test_history}"`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 3: UPDATE (Modificación de método anticonceptivo, alergias y notas)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 3/4] Modificando método anticonceptivo y notas clínicas...${colors.reset}`);
    const startTimeUpdate = Date.now();

    const updatedMac = "DIU Hormonal (Mirena / Kyleena)";
    const updatedAllergies = "Alergia a Penicilinas y AINEs";
    const updatedNotes = "Paciente opta por cambio de método anticonceptivo en consulta ginecológica.";

    const { error: updateError } = await supabase
      .from("patient_backgrounds")
      .update({
        contraceptive_method: updatedMac,
        medical_allergies: updatedAllergies,
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_BG_ID);

    if (updateError) {
      console.error(`  ❌ [FAIL] Error al actualizar antecedentes: ${updateError.message}`);
      process.exit(1);
    }

    const { data: verifyUpdate, error: verifyError } = await supabase
      .from("patient_backgrounds")
      .select("*")
      .eq("id", TEST_BG_ID)
      .single();

    const updateDuration = Date.now() - startTimeUpdate;

    if (
      verifyError ||
      !verifyUpdate ||
      verifyUpdate.contraceptive_method !== updatedMac ||
      verifyUpdate.medical_allergies !== updatedAllergies
    ) {
      console.error(`  ❌ [FAIL] La verificación post-update falló:`, verifyUpdate);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Modificación validada exitosamente en ${updateDuration} ms${colors.reset}`);
    console.log(`    - Nuevo MAC: ${verifyUpdate.contraceptive_method}`);
    console.log(`    - Alergias actualizadas: "${verifyUpdate.medical_allergies}"`);
    console.log(`    - Notas clínicas: "${verifyUpdate.notes}"`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 4: DELETE (Eliminación limpia y borrado en cascada)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 4/4] Eliminando registro de prueba y verificando borrado...${colors.reset}`);
    const startTimeDelete = Date.now();

    const { error: deleteError } = await supabase
      .from("patient_backgrounds")
      .delete()
      .eq("id", TEST_BG_ID);

    if (deleteError) {
      console.error(`  ❌ [FAIL] Error al eliminar antecedentes: ${deleteError.message}`);
      process.exit(1);
    }

    // Limpiar paciente efímero
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { data: checkDeleted } = await supabase
      .from("patient_backgrounds")
      .select("id")
      .eq("id", TEST_BG_ID);

    const deleteDuration = Date.now() - startTimeDelete;

    if (checkDeleted && checkDeleted.length > 0) {
      console.error(`  ❌ [FAIL] El registro de antecedentes aún permanece en la base de datos.`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Eliminación confirmada (0 filas remanentes) en ${deleteDuration} ms${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN COMPLETADA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (100%)${colors.reset}`);
    console.log(`La tabla public.patient_backgrounds en Supabase Cloud responde con total`);
    console.log(`integridad para persistencia de antecedentes gineco-obstétricos.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error no controlado durante el test: ${err.message}`);
    process.exit(1);
  }
}

runAntecedentesCrudTest();
