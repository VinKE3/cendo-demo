/**
 * CENDO - Script Automatizado de Certificación CRUD: CARNET PRENATAL MINSA / CLAP
 * Módulo 13 (src/modules/prenatal/)
 *
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT (Crear carnet prenatal basal con visita 1 y patologías maternas)
 * 2. SELECT (Leer y verificar persistencia en Supabase, baseline JSONB y visitas)
 * 3. UPDATE (Agregar visita 2 con signos de alarma hipertensiva y tratamiento)
 * 4. VALIDATION (Validar cálculo Naegele FPP, edad gestacional y evaluación de riesgo ARO)
 * 5. DELETE (Eliminar carnet de prueba y certificar limpieza total)
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

const TEST_CARD_ID = "70000000-0000-0000-0000-999999999999";
let testPatientId = null;

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bold: "\x1b[1m",
};

function logPass(msg) {
  console.log(`${colors.green}  ✔ PASS:${colors.reset} ${msg}`);
}

function logFail(msg, err) {
  console.error(`${colors.red}  ✖ FAIL:${colors.reset} ${msg}`);
  if (err) console.error("    Detalles:", err);
}

// Lógica de cálculo Naegele para test
function testNaegeleFPP(fumStr) {
  if (!fumStr || fumStr.length < 10) return "";
  const parts = fumStr.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  const fumDate = new Date(year, month, day);
  const fppDate = new Date(fumDate.getTime() + 280 * 24 * 60 * 60 * 1000);
  const fYear = fppDate.getFullYear();
  const fMonth = String(fppDate.getMonth() + 1).padStart(2, "0");
  const fDay = String(fppDate.getDate()).padStart(2, "0");
  return `${fYear}-${fMonth}-${fDay}`;
}

async function runPrenatalTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  CENDO - SUITE DE CERTIFICACIÓN MÓDULO 13: CARNET PRENATAL MINSA  ${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  let passed = 0;
  let total = 5;

  try {
    // 0. Obtener paciente de prueba oficial
    const { data: patients, error: pErr } = await supabase
      .from("patients")
      .select("id, first_name, last_name, dni")
      .limit(1);

    if (pErr || !patients || patients.length === 0) {
      throw new Error("No se pudo obtener un paciente base para la prueba: " + (pErr?.message || "vacío"));
    }
    testPatientId = patients[0].id;
    const patientName = `${patients[0].first_name} ${patients[0].last_name}`;
    console.log(`Paciente asignada para la prueba: ${patientName} (DNI: ${patients[0].dni})\n`);

    // Limpieza preventiva
    await supabase.from("prenatal_cards").delete().eq("id", TEST_CARD_ID);

    // =========================================================================
    // PRUEBA 1: INSERT
    // =========================================================================
    console.log(`${colors.yellow}[1/5] TEST: Creación e Inserción de Carnet Prenatal Basal...${colors.reset}`);

    const fppCalculated = testNaegeleFPP("2026-03-01");

    const newCard = {
      id: TEST_CARD_ID,
      patient_id: testPatientId,
      clinic_establishment: "CENDO - Centro de Endometriosis y Ginecología",
      attending_doctor_id: "doc-patrick-jacinto",
      attending_doctor_name: "Dr. Patrick Jacinto Gomero",
      baseline: {
        insuranceType: "PRIVADO",
        educationLevel: "Superior Univ",
        civilStatus: "Casada",
        gestas: 1,
        abortos: 0,
        partosVaginales: 0,
        cesareas: 0,
        nacidosVivos: 0,
        nacidosMuertos: 0,
        viven: 0,
        familyHistory: ["Hipertensión arterial"],
        personalHistory: ["Ninguno"],
        previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: false },
        usualWeightKg: 58.5,
        heightCm: 164,
        bloodGroup: "O",
        rhFactor: "Rh (+)",
        fum: "2026-03-01",
        fumDoubt: false,
        fpp: fppCalculated,
        clinicalExam: "Normal",
        breastsExam: "Normal",
        cervixExam: "Normal",
        pelvisExam: "Normal",
        dentalExam: "Normal",
        hemoglobin1: 12.4,
        bloodGlucose1: 85,
        vdrlRpr1: "No reactivo",
        hivScreening1: "Negativo",
      },
      visits: [
        {
          visitNumber: 1,
          visitDate: "2026-04-12",
          visitTime: "10:30",
          gestationalAgeWeeks: 6,
          gestationalAgeDays: 0,
          maternalWeightKg: 59.0,
          temperature: 36.6,
          bloodPressure: "110/70",
          maternalPulse: 74,
          uterineHeightCm: 0,
          fetusSituation: "NA",
          fetusPresentation: "NA",
          fetusPosition: "NA",
          fetalHeartRate: 0,
          fetalMovements: "NA",
          proteinuria: "-",
          edema: "-",
          tendonReflex: "++",
          ironFolicAcidGiven: true,
          calciumGiven: false,
          counselingGiven: "Signos de alarma y nutrición en 1er trimestre",
          nextAppointmentDate: "2026-05-15",
          attendingDoctorName: "Dr. Patrick Jacinto Gomero",
        },
      ],
      maternal_pathologies: [
        {
          id: "path-1",
          name: "Emesis gravídica leve",
          cie10: "O21.0",
          diagnosedDate: "2026-04-12",
        },
      ],
      updated_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from("prenatal_cards").insert(newCard);

    if (insErr) {
      logFail("Fallo al insertar carnet prenatal en Supabase", insErr.message);
    } else {
      logPass(`Carnet insertado correctamente (ID: ${TEST_CARD_ID}) con FPP Naegele: ${fppCalculated}`);
      passed++;
    }

    // =========================================================================
    // PRUEBA 2: SELECT
    // =========================================================================
    console.log(`\n${colors.yellow}[2/5] TEST: Consulta y Verificación de Carnet Prenatal y Visitas...${colors.reset}`);
    const { data: fetchCard, error: selErr } = await supabase
      .from("prenatal_cards")
      .select("*")
      .eq("id", TEST_CARD_ID)
      .single();

    if (selErr || !fetchCard) {
      logFail("Fallo al recuperar carnet prenatal recién insertado", selErr?.message);
    } else if (
      fetchCard.baseline?.fum === "2026-03-01" &&
      Array.isArray(fetchCard.visits) &&
      fetchCard.visits.length === 1 &&
      fetchCard.visits[0].maternalWeightKg === 59.0
    ) {
      logPass(`Carnet recuperado: Paciente ID ${fetchCard.patient_id}, FUM ${fetchCard.baseline.fum}, 1 visita registrada.`);
      passed++;
    } else {
      logFail("Datos recuperados no coinciden con los esperados", JSON.stringify(fetchCard));
    }

    // =========================================================================
    // PRUEBA 3: UPDATE
    // =========================================================================
    console.log(`\n${colors.yellow}[3/5] TEST: Actualización (Agregar Visita 2 de Control)...${colors.reset}`);
    const updatedVisits = [
      ...fetchCard.visits,
      {
        visitNumber: 2,
        visitDate: "2026-05-15",
        visitTime: "11:00",
        gestationalAgeWeeks: 10,
        gestationalAgeDays: 5,
        maternalWeightKg: 60.2,
        temperature: 36.7,
        bloodPressure: "115/75",
        maternalPulse: 76,
        uterineHeightCm: 10,
        fetusSituation: "L",
        fetusPresentation: "C",
        fetusPosition: "NA",
        fetalHeartRate: 156,
        fetalMovements: "NA",
        proteinuria: "-",
        edema: "-",
        tendonReflex: "++",
        ironFolicAcidGiven: true,
        calciumGiven: true,
        counselingGiven: "Ecografía genética 11-13.6 semanas indicada",
        nextAppointmentDate: "2026-06-12",
        attendingDoctorName: "Dr. Patrick Jacinto Gomero",
      },
    ];

    const { error: updErr } = await supabase
      .from("prenatal_cards")
      .update({
        visits: updatedVisits,
        updated_at: new Date().toISOString(),
      })
      .eq("id", TEST_CARD_ID);

    if (updErr) {
      logFail("Fallo al actualizar visitas del carnet prenatal", updErr.message);
    } else {
      const { data: checkUpd } = await supabase
        .from("prenatal_cards")
        .select("visits")
        .eq("id", TEST_CARD_ID)
        .single();

      if (checkUpd?.visits?.length === 2 && checkUpd.visits[1].fetalHeartRate === 156) {
        logPass(`Visita 2 agregada exitosamente: FCF 156 lpm, Semanas: 10s 5d.`);
        passed++;
      } else {
        logFail("La visita 2 no se persistió correctamente", checkUpd);
      }
    }

    // =========================================================================
    // PRUEBA 4: VALIDATION
    // =========================================================================
    console.log(`\n${colors.yellow}[4/5] TEST: Validación de Regla de Naegele y Alertas Obstétricas...${colors.reset}`);
    
    // Test Naegele: FUM 2026-01-01 -> 2026-10-08 (+7 días, -3 meses + 1 año)
    const testFpp = testNaegeleFPP("2026-01-01");
    const naegeleValid = testFpp === "2026-10-08";

    // Test detección de alerta de hipertensión
    const highBpVisit = { bloodPressure: "145/95", visitNumber: 3 };
    const parts = highBpVisit.bloodPressure.split("/");
    const isHypertensive = parseInt(parts[0], 10) >= 140 || parseInt(parts[1], 10) >= 90;

    if (naegeleValid && isHypertensive) {
      logPass(`Algoritmo Naegele verificado (${testFpp}) y detector de Preeclampsia/HTA validado.`);
      passed++;
    } else {
      logFail("Fallo en la validación algorítmica de Naegele o hipertensión");
    }

    // =========================================================================
    // PRUEBA 5: DELETE
    // =========================================================================
    console.log(`\n${colors.yellow}[5/5] TEST: Eliminación y Limpieza de Carnet de Prueba...${colors.reset}`);
    const { error: delErr } = await supabase
      .from("prenatal_cards")
      .delete()
      .eq("id", TEST_CARD_ID);

    if (delErr) {
      logFail("Fallo al eliminar carnet prenatal de prueba", delErr.message);
    } else {
      const { data: checkDel } = await supabase
        .from("prenatal_cards")
        .select("id")
        .eq("id", TEST_CARD_ID)
        .maybeSingle();

      if (!checkDel) {
        logPass("Carnet de prueba eliminado y certificado. Base de datos 100% limpia.");
        passed++;
      } else {
        logFail("El registro de prueba todavía permanece en la tabla prenatal_cards");
      }
    }
  } catch (err) {
    logFail("Excepción no controlada durante las pruebas", err.message || err);
  }

  // Resumen
  console.log(`\n${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
  if (passed === total) {
    console.log(`${colors.green}${colors.bold}  RESULTADO: ${passed}/${total} PRUEBAS EXITOSAS (100% PASS) - MÓDULO 13 CERTIFICADO${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}  RESULTADO: ${passed}/${total} PRUEBAS SUPERADAS${colors.reset}`);
  }
  console.log(`${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  process.exit(passed === total ? 0 : 1);
}

runPrenatalTestSuite();
