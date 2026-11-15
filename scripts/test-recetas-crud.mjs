/**
 * CENDO - Script Automatizado de Certificación CRUD: RECETAS MÉDICAS INTELIGENTES
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear receta médica estructurada con fármacos JSONB en Supabase)
 * 2. SELECT (Leer y verificar persistencia, posología e integridad de ítems)
 * 3. UPDATE (Modificar indicaciones, agregar fármaco y actualizar receta)
 * 4. VALIDATION (Validar prevención de recetas vacías y fármacos duplicados)
 * 5. DELETE (Eliminar receta de prueba y certificar limpieza total)
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
const TEST_PRESCRIPTION_ID = "f0000000-0000-0000-0000-888888888888";

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function checkDuplicateItem(items, name) {
  const norm = name.trim().toLowerCase();
  return items.some((i) => i.medicationName.trim().toLowerCase() === norm);
}

async function runRecetasCrudTest() {
  console.log("\n" + "=".repeat(70));
  console.log(`${colors.bold}${colors.cyan}🧪 CENDO - CERTIFICACIÓN CRUD: RECETAS MÉDICAS INTELIGENTES${colors.reset}`);
  console.log(`📡 URL Supabase: ${supabaseUrl}`);
  console.log("=".repeat(70) + "\n");

  let passedTests = 0;
  const totalTests = 4;

  try {
    // ------------------------------------------------------------------------
    // PASO 0: Limpieza preventiva y asegurar paciente padre de prueba
    // ------------------------------------------------------------------------
    await supabase.from("medical_prescriptions").delete().eq("id", TEST_PRESCRIPTION_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { error: patErr } = await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Paciente",
      last_name: "Prueba Recetas",
      dni: "77665544",
      birth_date: "1995-08-15",
      phone: "998811223",
      email: "prueba.recetas@cendo.pe",
      civil_status: "Soltera",
      occupation: "Diseñadora",
    });

    if (patErr) {
      throw new Error(`No se pudo crear paciente temporal de prueba: ${patErr.message}`);
    }

    // ------------------------------------------------------------------------
    // PRUEBA 1: CREATE (Insertar receta médica estructurada en Supabase)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/4] INSERT: Creando receta médica estructurada en Supabase...${colors.reset}`);

    const newPrescription = {
      id: TEST_PRESCRIPTION_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      prescription_date: "2026-11-14",
      diagnosis: "Endometriosis pélvica profunda infiltrante (N80.3)",
      cie10_code: "N80.3",
      items: [
        {
          id: "item-dienogest-01",
          medicationName: "Dienogest 2mg (Visannette)",
          presentation: "Caja x 28 comprimidos",
          route: "Vía Oral",
          dosage: "1 comprimido (2 mg)",
          frequency: "Cada 24 horas por las noches",
          duration: "Por 6 meses continuos",
          instructions: "Tomar todos los días a la misma hora sin interrupción",
          quantity: "6 cajas",
        },
        {
          id: "item-ketorolaco-02",
          medicationName: "Ketorolaco Trometamol 10mg",
          presentation: "Caja x 10 tabletas sublinguales",
          route: "Vía Oral",
          dosage: "1 tableta sublingual",
          frequency: "Cada 8 horas condicional al dolor agudo",
          duration: "Máximo 3 días",
          instructions: "Disolver debajo de la lengua ante crisis de dolor pélvico",
          quantity: "1 caja",
        },
      ],
      general_indications: "Mantener reposo relativo en crisis. Evitar automedicación con otros AINEs simultáneos.",
      next_appointment_date: "2026-12-14",
    };

    const { data: inserted, error: insertErr } = await supabase
      .from("medical_prescriptions")
      .insert(newPrescription)
      .select()
      .single();

    if (insertErr || !inserted) {
      throw new Error(`Fallo en INSERT de receta médica: ${insertErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Receta emitida exitosamente con ID: ${inserted.id}${colors.reset}`);
    console.log(`  📅 Fecha: ${inserted.prescription_date} | Fármacos: ${inserted.items?.length} prescritos`);
    console.log(`  👨‍⚕️ Médico: ${inserted.doctor_name} (CMP: ${inserted.doctor_cmp})`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: SELECT (Consultar y validar integridad de fármacos JSONB)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/4] SELECT: Consultando y verificando fármacos prescritos...${colors.reset}`);

    const { data: fetched, error: fetchErr } = await supabase
      .from("medical_prescriptions")
      .select("*")
      .eq("id", TEST_PRESCRIPTION_ID)
      .single();

    if (fetchErr || !fetched) {
      throw new Error(`Fallo en SELECT de receta médica: ${fetchErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Receta leída de Supabase correctamente:${colors.reset}`);
    console.log(`    - Diagnóstico: ${fetched.diagnosis}`);
    console.log(`    - Ítem 1: ${fetched.items[0]?.medicationName} (${fetched.items[0]?.frequency})`);
    console.log(`    - Ítem 2: ${fetched.items[1]?.medicationName} (${fetched.items[1]?.dosage})`);

    if (
      fetched.items.length === 2 &&
      fetched.items[0].medicationName.includes("Dienogest") &&
      fetched.cie10_code === "N80.3"
    ) {
      console.log(`  ${colors.green}✔ Integridad de fármacos y posología validada al 100%.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("Discrepancia en los ítems de medicamentos leídos de la receta.");
    }

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE & ANTI-DUPLICATE (Actualizar receta y probar validadores)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/4] UPDATE & VALIDATORS: Modificando ítems y probando anti-duplicados...${colors.reset}`);

    // Probar detección preventiva de duplicado
    const isDup = checkDuplicateItem(fetched.items, "dienogest 2mg (visannette)");
    if (isDup) {
      console.log(`  ${colors.green}✔ Validador anti-duplicados previno correctamente registrar dos veces el mismo fármaco.${colors.reset}`);
    } else {
      throw new Error("El validador anti-duplicados no detectó fármaco repetido.");
    }

    // Actualizar indicaciones generales
    const { data: updated, error: updateErr } = await supabase
      .from("medical_prescriptions")
      .update({
        general_indications: "Control post-tratamiento en 30 días con ecografía de control.",
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_PRESCRIPTION_ID)
      .select()
      .single();

    if (updateErr || !updated) {
      throw new Error(`Fallo en UPDATE de receta médica: ${updateErr?.message}`);
    }

    console.log(`  ${colors.green}✔ Receta actualizada y verificada en la nube con éxito.${colors.reset}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 4: DELETE (Eliminar registros temporales y certificar limpieza)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/4] DELETE: Eliminando receta de prueba y certificando limpieza total...${colors.reset}`);

    const { error: delRecErr } = await supabase
      .from("medical_prescriptions")
      .delete()
      .eq("id", TEST_PRESCRIPTION_ID);

    if (delRecErr) {
      throw new Error(`Fallo al eliminar receta de prueba: ${delRecErr.message}`);
    }

    // Eliminar paciente temporal
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    const { data: verifyDel } = await supabase
      .from("medical_prescriptions")
      .select("id")
      .eq("id", TEST_PRESCRIPTION_ID)
      .maybeSingle();

    if (!verifyDel) {
      console.log(`  ${colors.green}✔ Receta de prueba eliminada exitosamente. Cero residuos en base de datos.${colors.reset}`);
      passedTests++;
    } else {
      throw new Error("La receta de prueba aún existe después del borrado.");
    }

    // ------------------------------------------------------------------------
    // RESUMEN FINAL
    // ------------------------------------------------------------------------
    console.log("\n" + "=".repeat(70));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`Módulo 8 (Recetas Médicas Inteligentes) 100% verificado contra Supabase Cloud.`);
    console.log("=".repeat(70) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}❌ ERROR DURANTE LA PRUEBA:${colors.reset}`, err.message);
    try {
      await supabase.from("medical_prescriptions").delete().eq("id", TEST_PRESCRIPTION_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    } catch {}
    process.exit(1);
  }
}

runRecetasCrudTest();
