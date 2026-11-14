/**
 * CENDO - Script Automatizado de Certificación CRUD: PACIENTES & DIRECTORIO
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear paciente de prueba en public.patients)
 * 2. SELECT (Leer y verificar integridad de filiación y DNI)
 * 3. UPDATE (Actualizar datos de contacto, dirección y ocupación)
 * 4. DELETE (Eliminar paciente de prueba y verificar borrado limpio)
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

const TEST_ID = "10000000-0000-0000-0000-999999999999";
const TEST_DNI = "99887766";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runPacientesCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN AUTOMATIZADA CRUD: DIRECTORIO DE PACIENTES${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva
    // ------------------------------------------------------------------------
    await supabase.from("patients").delete().or(`id.eq.${TEST_ID},dni.eq.${TEST_DNI}`);

    // ------------------------------------------------------------------------
    // TEST 1: CREATE (Inserción de nueva paciente en public.patients)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[PRUEBA 1/4] Creando ficha de paciente de prueba en Supabase...${colors.reset}`);
    const startTimeCreate = Date.now();

    const newPatient = {
      id: TEST_ID,
      dni: TEST_DNI,
      document_type: "DNI",
      document_number: TEST_DNI,
      first_name: "VALERIA SOFÍA (TEST CRUD)",
      last_name: "MONTALVO ALARCÓN",
      full_name: "MONTALVO ALARCÓN, VALERIA SOFÍA (TEST CRUD)",
      birth_date: "1996-05-18",
      age: 30,
      phone: "987 112 233",
      email: "valeria.montalvo.test@cendo.pe",
      address: "Calle Los Pinos 234, Dpto 502",
      district: "Miraflores",
      civil_status: "Soltera",
      occupation: "Ingeniera de Sistemas",
      education_level: "Superior Universitaria",
      birth_place: "Lima, Perú",
      religion: "Católica",
      insurance_info: "Particular",
    };

    const { error: insertError } = await supabase
      .from("patients")
      .insert(newPatient);

    const createDuration = Date.now() - startTimeCreate;

    if (insertError) {
      console.error(`  ❌ [FAIL] Error al insertar paciente: ${insertError.message}`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Paciente registrada correctamente en ${createDuration} ms${colors.reset}`);
    console.log(`    - ID: ${newPatient.id}`);
    console.log(`    - Paciente: ${newPatient.full_name}`);
    console.log(`    - Documento: DNI ${newPatient.dni} | Edad: ${newPatient.age} años | Ocupación: ${newPatient.occupation}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 2: READ (Verificación íntegra de la ficha patronímica)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 2/4] Leyendo y verificando integridad de la historia patronímica...${colors.reset}`);
    const startTimeRead = Date.now();

    const { data: readData, error: readError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const readDuration = Date.now() - startTimeRead;

    if (readError || !readData) {
      console.error(`  ❌ [FAIL] No se pudo leer el registro de paciente: ${readError?.message || "No encontrado"}`);
      process.exit(1);
    }

    if (
      readData.dni !== TEST_DNI ||
      readData.first_name !== newPatient.first_name ||
      readData.birth_date !== newPatient.birth_date
    ) {
      console.error(`  ❌ [FAIL] Discrepancia en la lectura de la paciente:`, readData);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Lectura y coherencia de datos confirmada en ${readDuration} ms${colors.reset}`);
    console.log(`    - DNI confirmado: ${readData.dni}`);
    console.log(`    - Fecha Nacimiento: ${readData.birth_date}`);
    console.log(`    - Dirección registrada: ${readData.address} (${readData.district})`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 3: UPDATE (Modificación de contacto, dirección y estado civil)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 3/4] Modificando datos de contacto, ocupación y dirección...${colors.reset}`);
    const startTimeUpdate = Date.now();

    const updatedPhone = "999 444 555";
    const updatedCivilStatus = "Casada";
    const updatedOccupation = "Directora de Tecnología";

    const { error: updateError } = await supabase
      .from("patients")
      .update({
        phone: updatedPhone,
        civil_status: updatedCivilStatus,
        occupation: updatedOccupation,
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_ID);

    if (updateError) {
      console.error(`  ❌ [FAIL] Error al actualizar paciente: ${updateError.message}`);
      process.exit(1);
    }

    const { data: verifyUpdate, error: verifyError } = await supabase
      .from("patients")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const updateDuration = Date.now() - startTimeUpdate;

    if (
      verifyError ||
      !verifyUpdate ||
      verifyUpdate.phone !== updatedPhone ||
      verifyUpdate.civil_status !== updatedCivilStatus ||
      verifyUpdate.occupation !== updatedOccupation
    ) {
      console.error(`  ❌ [FAIL] La verificación post-update falló:`, verifyUpdate);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Modificación validada exitosamente en ${updateDuration} ms${colors.reset}`);
    console.log(`    - Nuevo teléfono: ${verifyUpdate.phone}`);
    console.log(`    - Estado civil actualizado: ${verifyUpdate.civil_status}`);
    console.log(`    - Ocupación actualizada: ${verifyUpdate.occupation}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 4: DELETE (Eliminación limpia)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 4/4] Eliminando historia de prueba y confirmando borrado...${colors.reset}`);
    const startTimeDelete = Date.now();

    const { error: deleteError } = await supabase
      .from("patients")
      .delete()
      .eq("id", TEST_ID);

    if (deleteError) {
      console.error(`  ❌ [FAIL] Error al eliminar paciente: ${deleteError.message}`);
      process.exit(1);
    }

    const { data: checkDeleted } = await supabase
      .from("patients")
      .select("id")
      .eq("id", TEST_ID);

    const deleteDuration = Date.now() - startTimeDelete;

    if (checkDeleted && checkDeleted.length > 0) {
      console.error(`  ❌ [FAIL] La paciente aún permanece en la base de datos.`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Eliminación confirmada (0 filas remanentes) en ${deleteDuration} ms${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN COMPLETADA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (100%)${colors.reset}`);
    console.log(`La tabla public.patients en Supabase Cloud responde con total`);
    console.log(`integridad para registro, actualización de filiación y control de historias.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error no controlado durante el test: ${err.message}`);
    process.exit(1);
  }
}

runPacientesCrudTest();
