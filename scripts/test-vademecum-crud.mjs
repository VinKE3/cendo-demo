/**
 * CENDO - Script Automatizado de Certificación CRUD: VADEMÉCUM
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear)
 * 2. SELECT (Leer y Verificar Integridad)
 * 3. UPDATE (Modificar y Validar)
 * 4. DELETE (Eliminar y Confirmar Borrado)
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// 1. Cargar variables de entorno desde .env.local
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

const TEST_ID = "c2000000-0000-0000-0000-999999999999";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

async function runVademecumCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN AUTOMATIZADA CRUD: VADEMÉCUM (SUPABASE)${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva por si el ID de prueba ya existía
    // ------------------------------------------------------------------------
    await supabase.from("medications_vademecum").delete().eq("id", TEST_ID);

    // ------------------------------------------------------------------------
    // TEST 1: CREATE (Inserción de nuevo medicamento)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[PRUEBA 1/4] Creando fármaco de prueba en Supabase...${colors.reset}`);
    const startTimeCreate = Date.now();

    const newMedication = {
      id: TEST_ID,
      generic_name: "Dienogest 2 mg (TEST CRUD AUTO)",
      atc_code: "G03DB08",
      therapeutic_group: "Progestágenos / Tratamiento de Endometriosis",
      commercial_brands: [
        {
          brandName: "Visannette",
          laboratory: "Bayer Healthcare",
          presentation: "Caja x 28 comprimidos",
          referencePricePen: 280,
        },
      ],
      indications: "Tratamiento de primera línea para dolor pélvico crónico asociado a endometriosis.",
      contraindications: "Hemorragia genital no diagnosticada, trastorno tromboembólico venoso activo.",
    };

    const { error: insertError } = await supabase
      .from("medications_vademecum")
      .insert(newMedication);

    const createDuration = Date.now() - startTimeCreate;

    if (insertError) {
      console.log(`  ${colors.red}❌ FALLO AL CREAR:${colors.reset} ${insertError.message}`);
      console.log(`  Detalle: ${JSON.stringify(insertError, null, 2)}`);
      process.exit(1);
    } else {
      console.log(`  ${colors.green}✔ [PASS] Registro insertado correctamente en ${createDuration} ms${colors.reset}`);
      console.log(`    - ID: ${newMedication.id}`);
      console.log(`    - Principio Activo: ${newMedication.generic_name}`);
      console.log(`    - Marcas: ${newMedication.commercial_brands[0].brandName} (S/ ${newMedication.commercial_brands[0].referencePricePen})`);
      passedTests++;
    }

    // ------------------------------------------------------------------------
    // TEST 2: READ (Lectura y verificación de integridad)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 2/4] Leyendo y verificando integridad del registro...${colors.reset}`);
    const startTimeRead = Date.now();

    const { data: readData, error: readError } = await supabase
      .from("medications_vademecum")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    const readDuration = Date.now() - startTimeRead;

    if (readError || !readData) {
      console.log(`  ${colors.red}❌ FALLO AL LEER:${colors.reset} ${readError?.message || "No se encontró el registro"}`);
      process.exit(1);
    } else if (
      readData.generic_name !== newMedication.generic_name ||
      readData.atc_code !== newMedication.atc_code ||
      !Array.isArray(readData.commercial_brands) ||
      readData.commercial_brands.length !== 1
    ) {
      console.log(`  ${colors.red}❌ ERROR DE INTEGRIDAD:${colors.reset} Los datos devueltos no coinciden con los guardados.`);
      console.log("  Recibido:", readData);
      process.exit(1);
    } else {
      console.log(`  ${colors.green}✔ [PASS] Lectura íntegra confirmada en ${readDuration} ms${colors.reset}`);
      console.log(`    - Estructura JSONB de marcas validada: OK (${readData.commercial_brands.length} marca)`);
      passedTests++;
    }

    // ------------------------------------------------------------------------
    // TEST 3: UPDATE (Edición y persistencia de cambios)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 3/4] Modificando registro (agregando segunda marca comercial y ajustando dosis)...${colors.reset}`);
    const startTimeUpdate = Date.now();

    const updatedBrands = [
      {
        brandName: "Visannette",
        laboratory: "Bayer Healthcare",
        presentation: "Caja x 28 comprimidos",
        referencePricePen: 285, // precio actualizado
      },
      {
        brandName: "Dienomed",
        laboratory: "Medifarma",
        presentation: "Caja x 30 comprimidos",
        referencePricePen: 195, // segunda marca agregada
      },
    ];

    const updatedIndications = "Tratamiento de primera línea para dolor pélvico. [MODIFICADO POR TEST AUTO]";

    const { error: updateError } = await supabase
      .from("medications_vademecum")
      .update({
        commercial_brands: updatedBrands,
        indications: updatedIndications,
      })
      .eq("id", TEST_ID);

    const updateDuration = Date.now() - startTimeUpdate;

    if (updateError) {
      console.log(`  ${colors.red}❌ FALLO AL ACTUALIZAR:${colors.reset} ${updateError.message}`);
      process.exit(1);
    }

    // Verificar que la actualización impactó de verdad en Supabase
    const { data: verifyUpdateData } = await supabase
      .from("medications_vademecum")
      .select("*")
      .eq("id", TEST_ID)
      .single();

    if (
      verifyUpdateData?.commercial_brands?.length !== 2 ||
      verifyUpdateData?.indications !== updatedIndications
    ) {
      console.log(`  ${colors.red}❌ ERROR: La actualización no se reflejó correctamente en PostgreSQL.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`  ${colors.green}✔ [PASS] Modificación verificada exitosamente en ${updateDuration} ms${colors.reset}`);
      console.log(`    - Total de marcas tras edición: ${verifyUpdateData.commercial_brands.length}`);
      console.log(`    - Marca 1: ${verifyUpdateData.commercial_brands[0].brandName} (S/ ${verifyUpdateData.commercial_brands[0].referencePricePen})`);
      console.log(`    - Marca 2: ${verifyUpdateData.commercial_brands[1].brandName} (S/ ${verifyUpdateData.commercial_brands[1].referencePricePen})`);
      console.log(`    - Indicación actualizada: "${verifyUpdateData.indications}"`);
      passedTests++;
    }

    // ------------------------------------------------------------------------
    // TEST 4: DELETE (Eliminación y confirmación de borrado)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[PRUEBA 4/4] Eliminando registro de prueba y verificando borrado...${colors.reset}`);
    const startTimeDelete = Date.now();

    const { error: deleteError } = await supabase
      .from("medications_vademecum")
      .delete()
      .eq("id", TEST_ID);

    const deleteDuration = Date.now() - startTimeDelete;

    if (deleteError) {
      console.log(`  ${colors.red}❌ FALLO AL ELIMINAR:${colors.reset} ${deleteError.message}`);
      process.exit(1);
    }

    // Verificar que ya no existe (404 / null)
    const { data: verifyDeleteData } = await supabase
      .from("medications_vademecum")
      .select("id")
      .eq("id", TEST_ID)
      .maybeSingle();

    if (verifyDeleteData !== null) {
      console.log(`  ${colors.red}❌ ERROR: El registro aún figura en la base de datos tras la eliminación.${colors.reset}`);
      process.exit(1);
    } else {
      console.log(`  ${colors.green}✔ [PASS] Eliminación confirmada (0 filas remanentes) en ${deleteDuration} ms${colors.reset}`);
      passedTests++;
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN COMPLETADA: ${passedTests}/${totalTests} PRUEBAS EXITOSAS (100%)${colors.reset}`);
    console.log(`${colors.cyan}La tabla public.medications_vademecum en Supabase Cloud responde con total`);
    console.log(`integridad para operaciones CREATE, READ, UPDATE y DELETE.${colors.reset}`);
    console.log("=".repeat(70) + "\n");

  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR INESPERADO:${colors.reset}`, err);
    process.exit(1);
  }
}

runVademecumCrudTest();
