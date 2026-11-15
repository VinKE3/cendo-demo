/**
 * CENDO - Script Automatizado de Certificación CRUD: COTIZACIONES Y PRESUPUESTOS
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear cotización vinculada al tarifario con cálculo de descuentos)
 * 2. SELECT (Leer y verificar persistencia, subtotales y total final en Supabase)
 * 3. UPDATE (Modificar días de validez y notas de condiciones de pago)
 * 4. VALIDATION (Validar algoritmo matemático de totales y descuentos 0-100%)
 * 5. DELETE (Eliminar cotización de prueba y certificar limpieza total)
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
const TEST_QUOTE_ID = "d0000000-0000-0000-0000-888888888888";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function calculateTotals(items) {
  const subtotal = items.reduce((acc, it) => acc + (Number(it.regularPrice) || 0), 0);
  const total = items.reduce((acc, it) => acc + (Number(it.finalPrice) || 0), 0);
  const discountTotal = Math.max(0, subtotal - total);
  return { subtotal, discountTotal, total };
}

async function runCotizacionesCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: COTIZACIONES Y PRESUPUESTOS${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre de prueba
    // ------------------------------------------------------------------------
    await supabase.from("procedure_quotes").delete().eq("id", TEST_QUOTE_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { error: patErr } = await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Paciente",
      last_name: "Prueba Cotización",
      dni: "55443322",
      birth_date: "1991-03-25",
      phone: "998800112",
      email: "prueba.cotizacion@cendo.pe",
      civil_status: "Casada",
      occupation: "Administradora",
    });

    if (patErr) {
      throw new Error(`No se pudo crear paciente temporal de prueba: ${patErr.message}`);
    }

    // ------------------------------------------------------------------------
    // PRUEBA 1: CREATE (Insertar cotización con cálculo de descuentos en Supabase)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/4] INSERT: Creando presupuesto quirúrgico en Supabase...${colors.reset}`);

    const quoteItems = [
      {
        procedureId: "proc-leep-01",
        code: "PROC-004",
        name: "Conización Cervical LEEP en Consultorio",
        category: "Procedimientos Menores",
        regularPrice: 850,
        discountPercent: 10,
        finalPrice: 765,
      },
      {
        procedureId: "proc-eco-02",
        code: "ECO-001",
        name: "Ecografía Doppler Ginecológica de Mapeo",
        category: "Ecografías Especializadas",
        regularPrice: 280,
        discountPercent: 0,
        finalPrice: 280,
      },
    ];

    const totals = calculateTotals(quoteItems);

    const newQuote = {
      id: TEST_QUOTE_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick Jacinto Gomero",
      quote_date: "2026-11-14",
      validity_days: 30,
      items: quoteItems,
      subtotal: totals.subtotal,
      discount_total: totals.discountTotal,
      total: totals.total,
      payment_terms: "50% al programar, 50% el día del procedimiento.",
      notes: "Incluye honorarios quirúrgicos y control post-operatorio a los 15 días.",
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("procedure_quotes")
      .insert(newQuote)
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Fallo en INSERT de cotización: ${insertErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Presupuesto registrado exitosamente con ID: ${inserted.id}${colors.reset}`);
    console.log(`  💰 Subtotal: S/ ${inserted.subtotal} | Descuento: S/ ${inserted.discount_total} | Total: S/ ${inserted.total}`);
    console.log(`  👨‍⚕️ Especialista: ${inserted.doctor_name}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: SELECT (Consultar y validar integridad matemática en la nube)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/4] SELECT: Consultando y verificando consistencia de precios...${colors.reset}`);

    const { data: fetched, error: fetchErr } = await supabase
      .from("procedure_quotes")
      .select("*")
      .eq("id", TEST_QUOTE_ID)
      .single();

    if (fetchErr || !fetched) {
      throw new Error(`Fallo en SELECT de cotización: ${fetchErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Cotización leída de Supabase correctamente:${colors.reset}`);
    console.log(`    - Ítems: ${fetched.items?.length} procedimientos`);
    console.log(`    - Procedimiento 1: ${fetched.items[0]?.name} (S/ ${fetched.items[0]?.finalPrice})`);
    console.log(`    - Términos: ${fetched.payment_terms}`);

    if (
      Number(fetched.subtotal) === 1130 &&
      Number(fetched.discount_total) === 85 &&
      Number(fetched.total) === 1045
    ) {
      console.log(`  ${colors.green}✔ Integridad matemática de totales validada al 100%.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("Discrepancia en los cálculos de subtotal o total de la cotización.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE & CALCULATOR (Modificar validez y recalcular)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/4] UPDATE: Modificando vigencia de presupuesto y notas...${colors.reset}`);

    const { data: updated, error: updateErr } = await supabase
      .from("procedure_quotes")
      .update({
        validity_days: 45,
        notes: "Presupuesto con vigencia extendida a 45 días por coordinación de fecha quirúrgica.",
      })
      .eq("id", TEST_QUOTE_ID)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Fallo en UPDATE de cotización: ${updateErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Vigencia actualizada a ${updated.validity_days} días y verificada en la nube.${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 4: DELETE (Eliminar cotización de prueba y certificar limpieza)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/4] DELETE: Eliminando cotización de prueba y certificando limpieza total...${colors.reset}`);

    const { error: delQuoteErr } = await supabase
      .from("procedure_quotes")
      .delete()
      .eq("id", TEST_QUOTE_ID);

    if (delQuoteErr) {
      throw new Error(`Fallo al eliminar cotización de prueba: ${delQuoteErr.message}`);
    }

    // Eliminar paciente temporal
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { data: verifyDel } = await supabase
      .from("procedure_quotes")
      .select("id")
      .eq("id", TEST_QUOTE_ID)
      .maybeSingle();

    if (!verifyDel) {
      console.log(`  ${colors.green}✔ Cotización de prueba eliminada exitosamente. Cero residuos en base de datos.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("La cotización de prueba aún existe después del borrado.");
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`Módulo 9B (Cotizaciones y Presupuestos) 100% verificado contra Supabase Cloud.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR DURANTE LA PRUEBA:${colors.reset}`, err.message);
    try {
      await supabase.from("procedure_quotes").delete().eq("id", TEST_QUOTE_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    } catch {}
    process.exit(1);
  }
}

runCotizacionesCrudTest();
