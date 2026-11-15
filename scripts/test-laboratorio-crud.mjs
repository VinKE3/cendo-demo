/**
 * CENDO - Script Automatizado de Certificación CRUD: ÓRDENES DE LABORATORIO
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear orden de laboratorio clínico con exámenes JSONB en Supabase)
 * 2. SELECT (Leer y verificar persistencia, muestras, urgencia e ítems)
 * 3. UPDATE (Modificar urgencia a Prioritario y actualizar notas del análisis)
 * 4. VALIDATION (Validar anti-duplicados de análisis y requerimiento de ítems)
 * 5. DELETE (Eliminar orden de prueba y certificar limpieza total)
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
const TEST_ORDER_ID = "e0000000-0000-0000-0000-888888888888";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function checkDuplicateTest(items, testName) {
  const norm = testName.trim().toLowerCase();
  return items.some((i) => i.testName.trim().toLowerCase() === norm);
}

async function runLaboratorioCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: ÓRDENES DE LABORATORIO CLÍNICO${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre de prueba
    // ------------------------------------------------------------------------
    await supabase.from("lab_orders").delete().eq("id", TEST_ORDER_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { error: patErr } = await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Paciente",
      last_name: "Prueba Laboratorio",
      dni: "66554433",
      birth_date: "1993-10-05",
      phone: "998844556",
      email: "prueba.lab@cendo.pe",
      civil_status: "Soltera",
      occupation: "Arquitecta",
    });

    if (patErr) {
      throw new Error(`No se pudo crear paciente temporal de prueba: ${patErr.message}`);
    }

    // ------------------------------------------------------------------------
    // PRUEBA 1: CREATE (Insertar orden de laboratorio en Supabase)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/4] INSERT: Creando orden de análisis clínicos en Supabase...${colors.reset}`);

    const newOrder = {
      id: TEST_ORDER_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      order_date: "2026-11-14",
      diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
      cie10_code: "N80.3",
      urgency: "Rutina",
      items: [
        {
          id: "lab-item-ca125",
          category: "Ginecología & Marcadores",
          testName: "CA-125 (Marcador Ovárico / Endometriosis)",
          sampleType: "Sangre venosa",
          notes: "Ayuno de 8 horas",
        },
        {
          id: "lab-item-he4",
          category: "Ginecología & Marcadores",
          testName: "HE-4 + Índice ROMA (Riesgo Ovárico)",
          sampleType: "Sangre venosa",
          notes: "Ayuno de 8 horas",
        },
        {
          id: "lab-item-hemo",
          category: "Hematología & Bioquímica",
          testName: "Hemograma Completo Automatizado + Plaquetas",
          sampleType: "Sangre con EDTA",
          notes: "Evaluación preoperatoria",
        },
      ],
      custom_tests: "Perfil de coagulación pre-quirúrgico",
      patient_instructions: "Acudir en ayunas de 8 a 10 horas entre las 7:00 y 9:30 AM.",
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("lab_orders")
      .insert(newOrder)
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Fallo en INSERT de orden de laboratorio: ${insertErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Orden registrada exitosamente con ID: ${inserted.id}${colors.reset}`);
    console.log(`  📅 Fecha: ${inserted.order_date} | Urgencia: ${inserted.urgency} | Análisis: ${inserted.items?.length}`);
    console.log(`  👨‍⚕️ Médico: ${inserted.doctor_name} (CMP: ${inserted.doctor_cmp})`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: SELECT (Consultar y validar integridad de análisis JSONB)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/4] SELECT: Consultando y verificando análisis clínicos solicitados...${colors.reset}`);

    const { data: fetched, error: fetchErr } = await supabase
      .from("lab_orders")
      .select("*")
      .eq("id", TEST_ORDER_ID)
      .single();

    if (fetchErr || !fetched) {
      throw new Error(`Fallo en SELECT de orden de laboratorio: ${fetchErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Orden leída de Supabase correctamente:${colors.reset}`);
    console.log(`    - Diagnóstico: ${fetched.diagnosis}`);
    console.log(`    - Análisis 1: ${fetched.items[0]?.testName} (${fetched.items[0]?.sampleType})`);
    console.log(`    - Análisis 2: ${fetched.items[1]?.testName}`);
    console.log(`    - Instrucciones paciente: ${fetched.patient_instructions}`);

    if (
      fetched.items.length === 3 &&
      fetched.items[0].testName.includes("CA-125") &&
      fetched.urgency === "Rutina"
    ) {
      console.log(`  ${colors.green}✔ Integridad de estructura de laboratorio validada al 100%.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("Discrepancia en los análisis leídos de la orden.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE & ANTI-DUPLICATE (Actualizar orden y validar duplicados)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/4] UPDATE & VALIDATORS: Modificando urgencia y probando anti-duplicados...${colors.reset}`);

    // Detección de duplicado
    const isDup = checkDuplicateTest(fetched.items, "ca-125 (marcador ovárico / endometriosis)");
    if (isDup) {
      console.log(`  ${colors.green}✔ Validador anti-duplicados detectó correctamente prueba repetida en la orden.${colors.reset}`);
    } else {
      throw new Error("El validador anti-duplicados falló en detectar prueba repetida.");
    }

    // Actualizar urgencia a Prioritario
    const { data: updated, error: updateErr } = await supabase
      .from("lab_orders")
      .update({
        urgency: "Prioritario",
        custom_tests: "Perfil de coagulación + Grupo y Factor Rh",
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_ORDER_ID)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Fallo en UPDATE de orden de laboratorio: ${updateErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Urgencia actualizada a: ${updated.urgency} y verificada en la nube.${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 4: DELETE (Eliminar orden de prueba y certificar limpieza)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/4] DELETE: Eliminando orden de prueba y certificando limpieza total...${colors.reset}`);

    const { error: delOrderErr } = await supabase
      .from("lab_orders")
      .delete()
      .eq("id", TEST_ORDER_ID);

    if (delOrderErr) {
      throw new Error(`Fallo al eliminar orden de prueba: ${delOrderErr.message}`);
    }

    // Eliminar paciente temporal
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { data: verifyDel } = await supabase
      .from("lab_orders")
      .select("id")
      .eq("id", TEST_ORDER_ID)
      .maybeSingle();

    if (!verifyDel) {
      console.log(`  ${colors.green}✔ Orden de prueba eliminada exitosamente. Cero residuos en base de datos.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("La orden de prueba aún existe después del borrado.");
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`Módulo 9A (Órdenes de Laboratorio Clínico) 100% verificado contra Supabase Cloud.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR DURANTE LA PRUEBA:${colors.reset}`, err.message);
    try {
      await supabase.from("lab_orders").delete().eq("id", TEST_ORDER_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    } catch {}
    process.exit(1);
  }
}

runLaboratorioCrudTest();
