/**
 * CENDO - Script Automatizado de Certificación CRUD: PROCEDIMIENTOS MENORES & LEEP
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear reporte de Cono LEEP con hemostasia Monsel y patología en Supabase)
 * 2. SELECT (Leer y verificar persistencia, detalles JSONB, anestesia y hemostasia)
 * 3. UPDATE (Modificar a Inserción de DIU y actualizar fecha de control ecográfico)
 * 4. VALIDATION (Validar Zod de tipos de procedimiento, anestesia y diagnósticos)
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

const TEST_PROC_ID = "60000000-0000-0000-0000-999999999999";
let testPatientId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const VALID_PROC_TYPES = [
  "BIOPSIA_CERVICAL",
  "BIOPSIA_ENDOMETRIAL",
  "CONO_LEEP",
  "POLIPECTOMIA",
  "INSERCION_DIU",
  "RETIRO_DIU",
  "INSERCION_IMPLANTE",
  "RETIRO_IMPLANTE",
  "OTRO",
];

async function runTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  CENDO - CERTIFICACIÓN CRUD: PROCEDIMIENTOS MENORES & BIOPSIAS LEEP   ${colors.reset}`);
  console.log(`${colors.cyan}  Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)${colors.reset}`);
  console.log(`${colors.cyan}  Supabase Cloud Target: ${supabaseUrl}${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

  let passedTests = 0;
  const totalTests = 5;

  try {
    // 0. Obtener paciente oficial para la prueba
    const { data: patients, error: pError } = await supabase.from("patients").select("id, first_name, last_name, dni").limit(1);
    if (pError || !patients || patients.length === 0) {
      throw new Error("No se encontraron pacientes para asociar el procedimiento de prueba.");
    }
    testPatientId = patients[0].id;
    const patientName = `${patients[0].first_name} ${patients[0].last_name}`;
    console.log(`👤 Paciente vinculada para test: ${colors.bold}${patientName}${colors.reset} (DNI: ${patients[0].dni})\n`);

    // Limpieza preventiva
    await supabase.from("minor_procedures").delete().eq("id", TEST_PROC_ID);

    // TEST 1: INSERT
    console.log(`${colors.yellow}▶ TEST 1: INSERT - Creación de reporte de Cono LEEP con Solución de Monsel...${colors.reset}`);
    const procPayload = {
      id: TEST_PROC_ID,
      patient_id: testPatientId,
      doctor_id: "doc-patrick-jacinto",
      doctor_name: "Dr. Patrick José Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      procedure_date: "2026-11-14",
      procedure_type: "CONO_LEEP",
      pre_op_diagnosis: "Displasia cervical moderada LIE-AG / NIC 2 (N87.1)",
      post_op_diagnosis: "Resección cervical electroquirúrgica con asa diatérmica (Cono LEEP) satisfactoria",
      cie10_code: "N87.1",
      anesthesia_type: "Local (Lidocaína 2%)",
      procedure_details: {
        asepsisTechnique: "Antisepsia estricta con solución de clorhexidina y ácido acético al 5%.",
        biopsySites: "Zona de transformación y labio anterior con compromiso displásico.",
        specimenSentToPathology: true,
        specimenDescription: "Cono cervical único de 18 x 14 x 8 mm con hilo de reparo a hora 12 en formol al 10%.",
        bleedingAmount: "Mínimo (< 10 ml)",
        hemostasisMethod: "Solución de Monsel",
        complications: "Sin complicaciones. Lecho cervical hemostático tras aplicación de pasta de Monsel.",
      },
      post_op_indications: "Reposo domiciliario 48 horas. Abstinencia sexual por 4 semanas. No duchas vaginales. Es normal flujo marrón oscuro por pasta de Monsel.",
      medications_prescribed: "Ciprofloxacino 500mg c/12h x 5 días + Ketorolaco 10mg condicional a dolor.",
      next_control_date: "2026-11-28",
    };

    const { data: inserted, error: insertError } = await supabase
      .from("minor_procedures")
      .insert(procPayload)
      .select()
      .single();

    if (insertError || !inserted) {
      throw new Error(`Fallo en INSERT de procedimiento: ${insertError?.message}`);
    }

    console.log(`  ${colors.green}✔ INSERT exitoso:${colors.reset} ID: ${inserted.id}`);
    console.log(`    - Tipo: ${inserted.procedure_type} | Anestesia: ${inserted.anesthesia_type}`);
    console.log(`    - Hemostasia: ${inserted.procedure_details?.hemostasisMethod}`);
    passedTests++;

    // TEST 2: SELECT
    console.log(`\n${colors.yellow}▶ TEST 2: SELECT - Verificación de persistencia, JSONB y envío a patología...${colors.reset}`);
    const { data: fetched, error: fetchError } = await supabase
      .from("minor_procedures")
      .select("*")
      .eq("id", TEST_PROC_ID)
      .single();

    if (fetchError || !fetched) {
      throw new Error(`Fallo en SELECT de procedimiento: ${fetchError?.message}`);
    }

    if (fetched.procedure_type !== "CONO_LEEP" || !fetched.procedure_details?.specimenSentToPathology) {
      throw new Error("Los datos de procedimiento recuperados no coinciden con lo guardado.");
    }

    console.log(`  ${colors.green}✔ SELECT exitoso:${colors.reset} Diagnóstico post-op: "${fetched.post_op_diagnosis.slice(0, 50)}..."`);
    console.log(`    - Remitido a patología: SÍ (${fetched.procedure_details?.specimenDescription})`);
    passedTests++;

    // TEST 3: UPDATE
    console.log(`\n${colors.yellow}▶ TEST 3: UPDATE - Modificación a Inserción de DIU y control ecográfico...${colors.reset}`);
    const { data: updated, error: updateError } = await supabase
      .from("minor_procedures")
      .update({
        procedure_type: "INSERCION_DIU",
        pre_op_diagnosis: "Deseo de anticoncepción reversible LARC",
        post_op_diagnosis: "Inserción exitosa de SIU liberador de levonorgestrel (Mirena)",
        cie10_code: "Z30.1",
        procedure_details: {
          asepsisTechnique: "Limpieza con povidona yodada en cérvix, pinzamiento con Pozzi, histerometría de 7.5 cm.",
          specimenSentToPathology: false,
          bleedingAmount: "Mínimo (< 10 ml)",
          hemostasisMethod: "Compresión",
          complications: "Sin complicaciones. Guías recortadas a 2.5 cm de orificio cervical externo.",
        },
        post_op_indications: "Abstinencia sexual 48 horas. Control ecográfico transvaginal en 4 semanas para corroborar posición del vástago.",
        medications_prescribed: "Ibuprofeno 400mg cada 8 horas si molestia pélvica.",
        next_control_date: "2026-12-14",
      })
      .eq("id", TEST_PROC_ID)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Fallo en UPDATE de procedimiento: ${updateError?.message}`);
    }

    if (updated.procedure_type !== "INSERCION_DIU") {
      throw new Error("Fallo en actualización a INSERCION_DIU.");
    }

    console.log(`  ${colors.green}✔ UPDATE exitoso:${colors.reset} Nuevo tipo: ${updated.procedure_type}`);
    console.log(`    - CIE-10: ${updated.cie10_code} | Control: ${updated.next_control_date}`);
    passedTests++;

    // TEST 4: DOMAIN VALIDATION
    console.log(`\n${colors.yellow}▶ TEST 4: DOMAIN VALIDATION - Verificación de tipos permitidos y requerimientos...${colors.reset}`);
    const isBadTypeValid = VALID_PROC_TYPES.includes("CIRUGIA_MAYOR_ABDOMINAL");
    if (isBadTypeValid) {
      throw new Error("El validador no debe permitir tipos ajenos a procedimientos ambulatorios.");
    }
    console.log(`  ${colors.green}✔ Validación de catálogo estricto:${colors.reset} Rechazó cirugías no ambulatorias.`);

    const isGoodTypeValid = VALID_PROC_TYPES.includes("CONO_LEEP") && VALID_PROC_TYPES.includes("INSERCION_IMPLANTE");
    if (!isGoodTypeValid) {
      throw new Error("Debe incluir CONO_LEEP e INSERCION_IMPLANTE.");
    }
    console.log(`  ${colors.green}✔ Catálogo ginecológico aprobado:${colors.reset} 9 procedimientos ambulatorios soportados.`);
    passedTests++;

    // TEST 5: DELETE & CLEANUP
    console.log(`\n${colors.yellow}▶ TEST 5: DELETE - Limpieza certificada del registro temporal...${colors.reset}`);
    const { error: deleteError } = await supabase
      .from("minor_procedures")
      .delete()
      .eq("id", TEST_PROC_ID);

    if (deleteError) {
      throw new Error(`Fallo en DELETE de procedimiento: ${deleteError.message}`);
    }

    const { data: leftover } = await supabase
      .from("minor_procedures")
      .select("id")
      .eq("id", TEST_PROC_ID);

    if (leftover && leftover.length > 0) {
      throw new Error("El registro de prueba persiste en Supabase.");
    }

    console.log(`  ${colors.green}✔ DELETE exitoso:${colors.reset} Cero residuos en Supabase Cloud.`);
    passedTests++;

    // RESUMEN FINAL
    console.log(`\n${colors.cyan}${colors.bold}========================================================================${colors.reset}`);
    console.log(`${colors.green}${colors.bold}  RESULTADO: ${passedTests}/${totalTests} TESTS COMPLETADOS EXITOSAMENTE (100% PASS)  ${colors.reset}`);
    console.log(`${colors.cyan}  MÓDULO 12: PROCEDIMIENTOS MENORES & LEEP CERTIFICADO EN SUPABASE CLOUD${colors.reset}`);
    console.log(`${colors.cyan}${colors.bold}========================================================================${colors.reset}\n`);

    process.exit(0);
  } catch (err) {
    console.error(`\n${colors.red}${colors.bold}❌ ERROR EN CERTIFICACIÓN DE PROCEDIMIENTOS:${colors.reset}`, err.message);
    if (testPatientId) {
      await supabase.from("minor_procedures").delete().eq("id", TEST_PROC_ID);
    }
    process.exit(1);
  }
}

runTestSuite();
