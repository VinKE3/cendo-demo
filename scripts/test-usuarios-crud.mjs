/**
 * CENDO - Script Automatizado de Certificación CRUD: USUARIOS Y DIRECTORIO MÉDICO
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear especialista de prueba en public.profiles)
 * 2. SELECT (Leer y verificar integridad de credenciales CMP/RNE y rol)
 * 3. UPDATE (Actualizar contraseña, especialidad y estado activo)
 * 4. DELETE (Eliminar perfil de prueba y certificar borrado)
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

const TEST_ID = "a0000000-0000-0000-0000-999999999999";
const TEST_EMAIL = "test.especialista.crud@cendo.pe";
const TEST_CMP = "99999";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runUsuariosCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN AUTOMATIZADA CRUD: USUARIOS & PERFILES MÉDICOS${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva
    // ------------------------------------------------------------------------
    await supabase.from("profiles").delete().or(`id.eq.${TEST_ID},email.eq.${TEST_EMAIL}`);

    // ------------------------------------------------------------------------
    // TEST 1: CREATE (Inserción de nuevo especialista en profiles)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[PRUEBA 1/4] Creando médico especialista de prueba en Supabase...${colors.reset}`);
    const startTimeCreate = Date.now();

    const newDoctor = {
      id: TEST_ID,
      email: TEST_EMAIL,
      full_name: "Mariana Elena Valdivia Castro (TEST AUTO CRUD)",
      doctor_title: "Dra.",
      specialty: "Ginecología Oncológica y Patología Cervical",
      cmp: TEST_CMP,
      rne: "77777",
      clinic_name: "CENDO - Centro de Endometriosis y Ginecología",
      clinic_address: "Av. Alfredo Benavides N° 2975, Of. 405, Miraflores - Lima",
      phone: "987 654 321",
      contact_email: TEST_EMAIL,
      role: "doctor",
      password: "CendoTestPassword123!",
      is_active: true,
    };

    const { error: insertError } = await supabase
      .from("profiles")
      .insert(newDoctor);

    const createDuration = Date.now() - startTimeCreate;

    if (insertError) {
      console.error(`  ❌ [FAIL] Error al insertar médico: ${insertError.message}`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Especialista insertado correctamente en ${createDuration} ms${colors.reset}`);
    console.log(`    - ID: ${newDoctor.id}`);
    console.log(`    - Especialista: ${newDoctor.doctor_title} ${newDoctor.full_name}`);
    console.log(`    - Credenciales: CMP ${newDoctor.cmp} | RNE ${newDoctor.rne} | Rol: ${newDoctor.role}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 2: READ (Verificación íntegra de credenciales)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 2/4] Leyendo y verificando credenciales médicas en la nube...${colors.reset}`);
    const startTimeRead = Date.now();

    const { data: readData, error: readError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const readDuration = Date.now() - startTimeRead;

    if (readError || !readData) {
      console.error(`  ❌ [FAIL] No se pudo leer el perfil insertado: ${readError?.message || "Registro no encontrado"}`);
      process.exit(1);
    }

    if (
      readData.email !== TEST_EMAIL ||
      readData.cmp !== TEST_CMP ||
      readData.role !== "doctor" ||
      readData.is_active !== true
    ) {
      console.error(`  ❌ [FAIL] Discrepancia en datos del médico:`, readData);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Lectura y credenciales verificadas en ${readDuration} ms${colors.reset}`);
    console.log(`    - Correo institucional: ${readData.email}`);
    console.log(`    - Colegiatura médica: CMP ${readData.cmp} (OK)`);
    console.log(`    - Estado de acceso: ${readData.is_active ? "Activo para atención médica" : "Inactivo"}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 3: UPDATE (Cambio de contraseña y actualización de firma/perfil)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 3/4] Modificando contraseña y actualizando especialidad médica...${colors.reset}`);
    const startTimeUpdate = Date.now();

    const newPassword = "CendoNuevaClave2026!*";
    const newSpecialty = "Ginecología y Reproducción Humana Asistida";

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        password: newPassword,
        specialty: newSpecialty,
        phone: "999 888 777",
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_ID);

    if (updateError) {
      console.error(`  ❌ [FAIL] Error al actualizar perfil: ${updateError.message}`);
      process.exit(1);
    }

    const { data: verifyUpdate, error: verifyError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const updateDuration = Date.now() - startTimeUpdate;

    if (verifyError || !verifyUpdate || verifyUpdate.password !== newPassword || verifyUpdate.specialty !== newSpecialty) {
      console.error(`  ❌ [FAIL] La verificación post-update falló:`, verifyUpdate);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Contraseña y datos médicos actualizados en ${updateDuration} ms${colors.reset}`);
    console.log(`    - Nueva contraseña persistida: "${verifyUpdate.password}"`);
    console.log(`    - Especialidad actualizada: "${verifyUpdate.specialty}"`);
    console.log(`    - Teléfono actualizado: ${verifyUpdate.phone}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 4: DELETE (Eliminación limpia)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 4/4] Eliminando cuenta de prueba y verificando borrado...${colors.reset}`);
    const startTimeDelete = Date.now();

    const { error: deleteError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", TEST_ID);

    if (deleteError) {
      console.error(`  ❌ [FAIL] Error al eliminar perfil: ${deleteError.message}`);
      process.exit(1);
    }

    const { data: checkDeleted } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", TEST_ID);

    const deleteDuration = Date.now() - startTimeDelete;

    if (checkDeleted && checkDeleted.length > 0) {
      console.error(`  ❌ [FAIL] El perfil médico aún permanece en la base de datos.`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Eliminación confirmada (0 filas remanentes) en ${deleteDuration} ms${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN COMPLETADA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (100%)${colors.reset}`);
    console.log(`La tabla public.profiles en Supabase Cloud responde con total`);
    console.log(`integridad para autenticación, gestión de credenciales y contraseñas.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error no controlado durante el test: ${err.message}`);
    process.exit(1);
  }
}

runUsuariosCrudTest();
