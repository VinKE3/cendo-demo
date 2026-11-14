/**
 * CENDO - Script Automatizado de Certificación CRUD: TARIFARIO MÉDICO
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear tarifa médica de prueba)
 * 2. SELECT (Leer y verificar integridad de datos)
 * 3. UPDATE (Modificar precio, descripción y disponibilidad)
 * 4. DELETE (Eliminar tarifa de prueba y certificar borrado)
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

const TEST_ID = "c1000000-0000-0000-0000-999999999999";
const TEST_CODE = "TEST-ECO-999";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runTarifarioCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN AUTOMATIZADA CRUD: TARIFARIO (SUPABASE)${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva por si existía de un intento previo
    // ------------------------------------------------------------------------
    await supabase.from("procedures_tariff").delete().or(`id.eq.${TEST_ID},code.eq.${TEST_CODE}`);

    // ------------------------------------------------------------------------
    // TEST 1: CREATE (Inserción de nueva tarifa médica)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[PRUEBA 1/4] Creando prestación médica de prueba en Supabase...${colors.reset}`);
    const startTimeCreate = Date.now();

    const newTariff = {
      id: TEST_ID,
      code: TEST_CODE,
      name: "Ecografía Ginecológica Doppler Especializada (TEST AUTO CRUD)",
      category: "Ecografía",
      description: "Estudio ecográfico Doppler de prueba generado para certificación automatizada de integridad.",
      price: 240.0,
      active: true,
    };

    const { error: insertError } = await supabase
      .from("procedures_tariff")
      .insert(newTariff);

    const createDuration = Date.now() - startTimeCreate;

    if (insertError) {
      console.error(`  ❌ [FAIL] Error al insertar tarifa: ${insertError.message}`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Tarifa insertada correctamente en ${createDuration} ms${colors.reset}`);
    console.log(`    - ID: ${newTariff.id}`);
    console.log(`    - Código: ${newTariff.code}`);
    console.log(`    - Procedimiento: ${newTariff.name}`);
    console.log(`    - Categoría: ${newTariff.category} | Precio: S/ ${newTariff.price}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 2: READ (Verificación íntegra de lectura)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 2/4] Leyendo y verificando integridad del registro...${colors.reset}`);
    const startTimeRead = Date.now();

    const { data: readData, error: readError } = await supabase
      .from("procedures_tariff")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const readDuration = Date.now() - startTimeRead;

    if (readError || !readData) {
      console.error(`  ❌ [FAIL] No se pudo leer el registro insertado: ${readError?.message || "Registro no encontrado"}`);
      process.exit(1);
    }

    if (
      readData.code !== TEST_CODE ||
      Number(readData.price) !== 240 ||
      readData.category !== "Ecografía" ||
      readData.active !== true
    ) {
      console.error(`  ❌ [FAIL] Discrepancia de datos en registro:`, readData);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Lectura íntegra confirmada en ${readDuration} ms${colors.reset}`);
    console.log(`    - Datos coincidentes: Código ${readData.code}, Categoría ${readData.category}, Precio S/ ${readData.price}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 3: UPDATE (Modificación y verificación)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 3/4] Modificando tarifa (ajuste de precio a S/ 260 e inactivación temporal)...${colors.reset}`);
    const startTimeUpdate = Date.now();

    const updatedPrice = 260.0;
    const updatedDesc = "Procedimiento actualizado por test automatizado de certificación.";

    const { error: updateError } = await supabase
      .from("procedures_tariff")
      .update({
        price: updatedPrice,
        description: updatedDesc,
        active: false,
      })
      .eq("id", TEST_ID);

    if (updateError) {
      console.error(`  ❌ [FAIL] Error al actualizar tarifa: ${updateError.message}`);
      process.exit(1);
    }

    const { data: verifyUpdate, error: verifyError } = await supabase
      .from("procedures_tariff")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const updateDuration = Date.now() - startTimeUpdate;

    if (verifyError || !verifyUpdate || Number(verifyUpdate.price) !== 260 || verifyUpdate.active !== false) {
      console.error(`  ❌ [FAIL] La verificación post-update falló:`, verifyUpdate);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Modificación verificada exitosamente en ${updateDuration} ms${colors.reset}`);
    console.log(`    - Nuevo precio verificado: S/ ${verifyUpdate.price}`);
    console.log(`    - Estado actualizado: ${verifyUpdate.active ? "Activo" : "Inactivo (OK)"}`);
    console.log(`    - Nueva descripción: "${verifyUpdate.description}"`);
    passedTests++;

    // ------------------------------------------------------------------------
    // TEST 4: DELETE (Eliminación limpia)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 4/4] Eliminando registro de prueba y verificando borrado...${colors.reset}`);
    const startTimeDelete = Date.now();

    const { error: deleteError } = await supabase
      .from("procedures_tariff")
      .delete()
      .eq("id", TEST_ID);

    if (deleteError) {
      console.error(`  ❌ [FAIL] Error al eliminar registro: ${deleteError.message}`);
      process.exit(1);
    }

    const { data: checkDeleted } = await supabase
      .from("procedures_tariff")
      .select("id")
      .eq("id", TEST_ID);

    const deleteDuration = Date.now() - startTimeDelete;

    if (checkDeleted && checkDeleted.length > 0) {
      console.error(`  ❌ [FAIL] El registro aún permanece en la base de datos.`);
      process.exit(1);
    }

    console.log(`  ${colors.green}✔ [PASS] Eliminación confirmada (0 filas remanentes) en ${deleteDuration} ms${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN COMPLETADA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (100%)${colors.reset}`);
    console.log(`La tabla public.procedures_tariff en Supabase Cloud responde con total`);
    console.log(`integridad para operaciones CREATE, READ, UPDATE y DELETE.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ Error no controlado durante el test: ${err.message}`);
    process.exit(1);
  }
}

runTarifarioCrudTest();
