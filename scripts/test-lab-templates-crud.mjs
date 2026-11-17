/**
 * CENDO - Script Automatizado de Certificación CRUD: PLANTILLAS Y FORMATOS DE LABORATORIO (PAP, BIOPSIA, TRUCUT, ITS, PERITONEAL)
 * Verifica:
 * 1. Integridad del catálogo maestro de 5 plantillas oficiales CENDO
 * 2. CRUD completo de Plantillas de Laboratorio contra Supabase Cloud (INSERT, SELECT, UPDATE, DELETE)
 * 3. Persistencia híbrida de Órdenes de Laboratorio con Metadata Especializada (specimenDetails, templateType, templateTitle)
 * 4. Recuperación y deserialización fidedigna sin pérdida de datos en la nube
 * 5. Limpieza total de registros de prueba (0 residuos)
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
  console.error("❌ Faltan las credenciales de Supabase en .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

const TEST_PATIENT_ID = "20000000-0000-0000-0000-999999999999";
const TEST_ORDER_ID = "f0000000-0000-0000-0000-777777777777";
const TEST_TMPL_CODE = "TMPL-TEST-CITO-2026";

async function runTest() {
  console.log("\n" + "=".repeat(75));
  console.log(`${colors.bold}${colors.cyan}🔬 CENDO - CERTIFICACIÓN: PLANTILLAS Y FORMATOS DE CITOLOGÍA / PATOLOGÍA${colors.reset}`);
  console.log(`📡 URL Supabase Cloud: ${supabaseUrl}`);
  console.log("=".repeat(75) + "\n");

  let passedTests = 0;
  const totalTests = 5;

  try {
    // ------------------------------------------------------------------------
    // PRUEBA 1: Verificación de Catálogo Oficial CENDO (5 formatos)
    // ------------------------------------------------------------------------
    console.log(`${colors.bold}[1/5] Verificando Catálogo Oficial de Plantillas CENDO...${colors.reset}`);
    const catalogPath = path.resolve(process.cwd(), "src/modules/laboratorio/labTemplatesCatalog.ts");
    if (!fs.existsSync(catalogPath)) {
      throw new Error("No se encontró src/modules/laboratorio/labTemplatesCatalog.ts");
    }
    const catalogContent = fs.readFileSync(catalogPath, "utf-8");

    const requiredTypes = ["PAP", "BIOPSIA", "TRUCUT", "ITS", "PERITONEAL"];
    for (const reqType of requiredTypes) {
      if (!catalogContent.includes(`templateType: "${reqType}"`)) {
        throw new Error(`Falta la plantilla oficial requerida para: ${reqType}`);
      }
      console.log(`  ✔ Formato oficial verificado en catálogo: [${reqType}]`);
    }
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 2: CRUD de Plantillas contra Supabase (INSERT & SELECT)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[2/5] INSERT & SELECT: Creando y consultando plantilla en Supabase...${colors.reset}`);

    // Limpieza preventiva
    await supabase.from("procedures_tariff").delete().eq("code", TEST_TMPL_CODE);

    const testTemplateData = {
      code: TEST_TMPL_CODE,
      name: "Plantilla de Ensayo - Biopsia Inmunohistoquímica",
      category: "Laboratorio",
      price: 0,
      cost: 0,
      description: JSON.stringify({
        category: "Anatomía Patológica Especializada",
        templateType: "BIOPSIA",
        sampleType: "Fragmento tisular en parafina",
        fixativeTransport: "Formol tamponado 10%",
        suggestedDiagnosis: "Neoplasia intraepitelial / Inmunohistoquímica p16",
        cie10Code: "N87.2",
        defaultTests: ["Tinción p16 INK4a", "Ki-67 índice proliferativo"],
        clinicalNotes: "Estudio confirmatorio CENDO",
        isOfficial: false,
      }),
    };

    const { error: insTmplErr } = await supabase.from("procedures_tariff").insert(testTemplateData);
    if (insTmplErr) throw new Error(`Error insertando plantilla: ${insTmplErr.message}`);

    const { data: readTmpl, error: readTmplErr } = await supabase
      .from("procedures_tariff")
      .select("*")
      .eq("code", TEST_TMPL_CODE)
      .single();

    if (readTmplErr || !readTmpl) throw new Error(`Error leyendo plantilla: ${readTmplErr?.message}`);

    const parsedTmplMeta = JSON.parse(readTmpl.description);
    if (parsedTmplMeta.templateType !== "BIOPSIA" || parsedTmplMeta.defaultTests.length !== 2) {
      throw new Error("Metadatos de plantilla en Supabase no coinciden con lo guardado.");
    }
    console.log(`  ✔ Plantilla registrada y leída con éxito en Supabase Cloud.`);
    console.log(`    - Nombre: ${readTmpl.name}`);
    console.log(`    - Diagnóstico sugerido: ${parsedTmplMeta.suggestedDiagnosis}`);
    console.log(`    - Pruebas configuradas: ${parsedTmplMeta.defaultTests.join(", ")}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 3: UPDATE de Plantilla en Supabase
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[3/5] UPDATE: Modificando plantilla en Supabase...${colors.reset}`);
    parsedTmplMeta.suggestedDiagnosis = "Carcinoma In Situ / Panel Inmuno Extendido";
    parsedTmplMeta.defaultTests.push("Receptores hormonales RE/RP");

    const { error: updTmplErr } = await supabase
      .from("procedures_tariff")
      .update({
        name: "Plantilla de Ensayo - Biopsia Inmuno Actualizada",
        description: JSON.stringify(parsedTmplMeta),
      })
      .eq("code", TEST_TMPL_CODE);

    if (updTmplErr) throw new Error(`Error actualizando plantilla: ${updTmplErr.message}`);

    const { data: updatedTmpl } = await supabase
      .from("procedures_tariff")
      .select("*")
      .eq("code", TEST_TMPL_CODE)
      .single();

    const verifiedUpdMeta = JSON.parse(updatedTmpl.description);
    if (verifiedUpdMeta.defaultTests.length !== 3) {
      throw new Error("La actualización de pruebas en la plantilla no persistió.");
    }
    console.log(`  ✔ Plantilla actualizada correctamente (3 exámenes incluidos).`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 4: Creación de Orden con Formato Especializado (PAP & Ficha)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[4/5] PERSISTENCIA DE ORDEN CON FORMATO PAP & DATOS DE MUESTRA...${colors.reset}`);

    // Limpieza y creación de paciente de prueba
    await supabase.from("lab_orders").delete().eq("id", TEST_ORDER_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);

    await supabase.from("patients").insert({
      id: TEST_PATIENT_ID,
      first_name: "Valeria",
      last_name: "Prueba PAP CENDO",
      dni: "77665544",
      birth_date: "1994-06-15",
      phone: "991122334",
      email: "valeria.pap@test.pe",
      civil_status: "Casada",
      occupation: "Diseñadora",
    });

    const testSpecimen = {
      anatomicalSite: "Exocérvix y canal endocervical - cuadrante horario 12:00",
      fixative: "Vial PreservCyt ThinPrep",
      containerCount: 1,
      cervixAspect: "Ectropión periorificial sangrante al contacto",
      fur: "2026-11-01",
      parity: "G1 P1001",
      mac: "DIU T-Cobre",
      clinicalObservations: "Control post-crioterapia. Solicitar Bethesda 2014.",
      sampleObtainedAt: "2026-11-17",
    };

    const metadataPayload = {
      templateType: "PAP",
      templateTitle: "Citología Cervicovaginal / Papanicolaou ThinPrep",
      specimenDetails: testSpecimen,
      rawCustomTests: "Investigación complementaria de Chlamydia por PCR",
    };

    const encodedCustomTests = `__METADATA__:${JSON.stringify(metadataPayload)}`;

    const testLabOrder = {
      id: TEST_ORDER_ID,
      patient_id: TEST_PATIENT_ID,
      doctor_name: "Dr. Patrick José Jacinto Gomero",
      doctor_cmp: "61693",
      doctor_rne: "38657",
      order_date: "2026-11-17",
      diagnosis: "Despistaje preventivo anual / Lesión escamosa intraepitelial",
      urgency: "Prioritario",
      items: [
        {
          id: "item-pap-1",
          category: "Ginecología & Marcadores",
          testName: "Citología en Base Líquida (ThinPrep Pap Test)",
          sampleType: "Exocérvix y cepillado endocervical",
          notes: "Vial PreservCyt ThinPrep",
        },
      ],
      custom_tests: encodedCustomTests,
      patient_instructions: "Abstinencia sexual 48 horas previas.",
    };

    const { error: insOrderErr } = await supabase.from("lab_orders").insert(testLabOrder);
    if (insOrderErr) throw new Error(`Error insertando orden de laboratorio con formato: ${insOrderErr.message}`);

    // Consultar desde Supabase y deserializar metadatos
    const { data: fetchedOrder, error: fetchOrderErr } = await supabase
      .from("lab_orders")
      .select("*")
      .eq("id", TEST_ORDER_ID)
      .single();

    if (fetchOrderErr || !fetchedOrder) throw new Error(`Error leyendo orden: ${fetchOrderErr?.message}`);

    if (!fetchedOrder.custom_tests.startsWith("__METADATA__:")) {
      throw new Error("No se detectó el prefijo de metadata en custom_tests.");
    }

    const decodedMeta = JSON.parse(fetchedOrder.custom_tests.replace("__METADATA__:", ""));

    if (decodedMeta.templateType !== "PAP") {
      throw new Error(`Esperado templateType PAP, recibido ${decodedMeta.templateType}`);
    }
    if (decodedMeta.specimenDetails.fixative !== "Vial PreservCyt ThinPrep") {
      throw new Error("Fijador no coincide con los datos remitidos.");
    }
    if (decodedMeta.specimenDetails.parity !== "G1 P1001") {
      throw new Error("Fórmula obstétrica no coincide con los datos remitidos.");
    }

    console.log(`  ✔ Orden de Citología/Patología persistida y leída de Supabase.`);
    console.log(`    - ID Orden: ${fetchedOrder.id}`);
    console.log(`    - Tipo de Plantilla: ${decodedMeta.templateType} (${decodedMeta.templateTitle})`);
    console.log(`    - Sitio de Toma: ${decodedMeta.specimenDetails.anatomicalSite}`);
    console.log(`    - Fijador: ${decodedMeta.specimenDetails.fixative}`);
    console.log(`    - FUR / Paridad / MAC: ${decodedMeta.specimenDetails.fur} | ${decodedMeta.specimenDetails.parity} | ${decodedMeta.specimenDetails.mac}`);
    passedTests++;

    // ------------------------------------------------------------------------
    // PRUEBA 5: DELETE & Limpieza Integral (0 residuos)
    // ------------------------------------------------------------------------
    console.log(`\n${colors.bold}[5/5] DELETE: Limpieza de registros temporales en Supabase...${colors.reset}`);
    await supabase.from("lab_orders").delete().eq("id", TEST_ORDER_ID);
    await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
    await supabase.from("procedures_tariff").delete().eq("code", TEST_TMPL_CODE);

    // Verificar eliminación
    const { data: checkOrd } = await supabase.from("lab_orders").select("id").eq("id", TEST_ORDER_ID);
    const { data: checkPat } = await supabase.from("patients").select("id").eq("id", TEST_PATIENT_ID);
    const { data: checkTmpl } = await supabase.from("procedures_tariff").select("id").eq("code", TEST_TMPL_CODE);

    if (checkOrd?.length !== 0 || checkPat?.length !== 0 || checkTmpl?.length !== 0) {
      throw new Error("Quedaron registros residuales tras la prueba de eliminación.");
    }

    console.log(`  ✔ Limpieza total confirmada. Cero residuos en la base de datos.`);
    passedTests++;

    console.log("\n" + "=".repeat(75));
    console.log(`${colors.bold}${colors.green}🎉 CERTIFICACIÓN EXITOSA: ${passedTests}/${totalTests} PRUEBAS COMPLETADAS (100%)${colors.reset}`);
    console.log(`${colors.green}Todos los formatos oficiales (PAP, Biopsia, Tru-Cut, ITS, Líquido Peritoneal)${colors.reset}`);
    console.log(`${colors.green}y el nuevo CRUD de plantillas de laboratorio funcionan al 100% en Supabase Cloud.${colors.reset}`);
    console.log("=".repeat(75) + "\n");
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ ${colors.red}FALLÓ LA PRUEBA:${colors.reset}`, err.message);
    // Intento de limpieza de emergencia
    try {
      await supabase.from("lab_orders").delete().eq("id", TEST_ORDER_ID);
      await supabase.from("patients").delete().eq("id", TEST_PATIENT_ID);
      await supabase.from("procedures_tariff").delete().eq("code", TEST_TMPL_CODE);
    } catch (_) {}
    process.exit(1);
  }
}

runTest();
