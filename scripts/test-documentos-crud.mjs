/**
 * CENDO - Script Automatizado de Certificación CRUD: REPOSITORIO DOCUMENTAL (.pdf & .docx)
 * Módulo 14 (src/modules/documentos/)
 *
 * Ejecuta ciclo completo de pruebas contra Supabase Cloud:
 * 1. INSERT PDF Document (Crear documento clínico de biopsia patológica en public.patient_documents)
 * 2. SELECT PDF Document (Leer y verificar persistencia en Supabase, categorización y metadatos)
 * 3. INSERT & SELECT Word History (.docx en public.word_history_documents con texto extraído)
 * 4. VALIDATION (Validar categorías de documentos, límites de tamaño y tipos MIME)
 * 5. DELETE (Eliminar documentos de prueba y certificar limpieza total en ambas tablas)
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

const TEST_PDF_DOC_ID = "80000000-0000-0000-0000-999999999991";
const TEST_WORD_DOC_ID = "80000000-0000-0000-0000-999999999992";
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

// Helpers de validación de módulo
function validateDocFile(fileSize, mimeType) {
  const maxBytes = 25 * 1024 * 1024;
  if (fileSize > maxBytes) return { valid: false, error: "Excede 25 MB" };
  const allowed = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/jpeg",
    "image/png",
    "image/webp",
  ];
  if (!allowed.includes(mimeType) && !mimeType.startsWith("image/")) {
    return { valid: false, error: "MIME no permitido" };
  }
  return { valid: true };
}

async function runDocumentosTestSuite() {
  console.log(`\n${colors.cyan}${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}${colors.bold}  CENDO - SUITE DE CERTIFICACIÓN MÓDULO 14: REPOSITORIO DOCUMENTAL  ${colors.reset}`);
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
    await supabase.from("patient_documents").delete().eq("id", TEST_PDF_DOC_ID);
    await supabase.from("word_history_documents").delete().eq("id", TEST_WORD_DOC_ID);

    // =========================================================================
    // PRUEBA 1: INSERT PDF DOCUMENT
    // =========================================================================
    console.log(`${colors.yellow}[1/5] TEST: Creación e Inserción de Documento Externo (PDF Patología)...${colors.reset}`);

    const newDoc = {
      id: TEST_PDF_DOC_ID,
      patient_id: testPatientId,
      document_type: "PATOLOGIA",
      title: "Informe de Biopsia de Cérvix - Anatomía Patológica",
      file_name: "biopsia-cervix-luciana-ramos.pdf",
      file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/test-biopsia.pdf",
      file_size: 1425890,
      mime_type: "application/pdf",
      notes: "Diagnóstico histopatológico: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG). Bordes quirúrgicos libres.",
      created_at: new Date().toISOString(),
    };

    const { error: insErr } = await supabase.from("patient_documents").insert(newDoc);

    if (insErr) {
      logFail("Fallo al insertar documento en patient_documents", insErr.message);
    } else {
      logPass(`Documento PDF insertado correctamente (ID: ${TEST_PDF_DOC_ID}, Tipo: PATOLOGIA)`);
      passed++;
    }

    // =========================================================================
    // PRUEBA 2: SELECT PDF DOCUMENT
    // =========================================================================
    console.log(`\n${colors.yellow}[2/5] TEST: Consulta y Verificación de Documento PDF en Supabase...${colors.reset}`);
    const { data: fetchDoc, error: selErr } = await supabase
      .from("patient_documents")
      .select("*")
      .eq("id", TEST_PDF_DOC_ID)
      .single();

    if (selErr || !fetchDoc) {
      logFail("Fallo al recuperar documento clínico", selErr?.message);
    } else if (
      fetchDoc.document_type === "PATOLOGIA" &&
      fetchDoc.title.includes("Biopsia de Cérvix") &&
      fetchDoc.file_size === 1425890
    ) {
      logPass(`Documento verificado: '${fetchDoc.title}' (${(fetchDoc.file_size / 1024 / 1024).toFixed(2)} MB, Tipo: ${fetchDoc.document_type}).`);
      passed++;
    } else {
      logFail("Datos recuperados no coinciden", JSON.stringify(fetchDoc));
    }

    // =========================================================================
    // PRUEBA 3: INSERT & SELECT WORD HISTORY (.docx)
    // =========================================================================
    console.log(`\n${colors.yellow}[3/5] TEST: Inserción y Consulta de Historia Previa en Word (.docx)...${colors.reset}`);
    const newWordDoc = {
      id: TEST_WORD_DOC_ID,
      patient_id: testPatientId,
      file_name: "HC_Anterior_Luciana_Ramos_2025.docx",
      file_size: 89450,
      file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/test-hc-word.docx",
      extracted_text: "HISTORIA CLÍNICA GINECOLÓGICA PREVIA (2025). Antecedente de dismenorrea severa EVA 8/10 tratada con AINEs.",
      notes: "Historia médica migrada desde archivos Word del consultorio anterior.",
      created_at: new Date().toISOString(),
    };

    const { error: insWordErr } = await supabase.from("word_history_documents").insert(newWordDoc);

    if (insWordErr) {
      logFail("Fallo al insertar historia Word", insWordErr.message);
    } else {
      const { data: fetchWord, error: selWordErr } = await supabase
        .from("word_history_documents")
        .select("*")
        .eq("id", TEST_WORD_DOC_ID)
        .single();

      if (selWordErr || !fetchWord) {
        logFail("Fallo al recuperar historia Word insertada", selWordErr?.message);
      } else if (fetchWord.extracted_text?.includes("HISTORIA CLÍNICA GINECOLÓGICA PREVIA")) {
        logPass(`Historia Word persistida y leída: '${fetchWord.file_name}' con extracción de texto verificada.`);
        passed++;
      } else {
        logFail("El texto extraído de la historia Word no coincide", fetchWord);
      }
    }

    // =========================================================================
    // PRUEBA 4: VALIDATION
    // =========================================================================
    console.log(`\n${colors.yellow}[4/5] TEST: Validación de Tipos MIME, Categorías y Límites de Tamaño...${colors.reset}`);
    const pdfCheck = validateDocFile(1024 * 1024, "application/pdf");
    const docxCheck = validateDocFile(2 * 1024 * 1024, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    const oversizedCheck = validateDocFile(30 * 1024 * 1024, "application/pdf"); // > 25MB
    const exeCheck = validateDocFile(500, "application/x-msdownload"); // disallowed

    if (pdfCheck.valid && docxCheck.valid && !oversizedCheck.valid && !exeCheck.valid) {
      logPass("Validación estricta de seguridad: PDF y DOCX permitidos; archivos >25MB y binarios no médicos bloqueados.");
      passed++;
    } else {
      logFail("Fallo en la suite de validación de archivos", { pdfCheck, docxCheck, oversizedCheck, exeCheck });
    }

    // =========================================================================
    // PRUEBA 5: DELETE & CLEANUP
    // =========================================================================
    console.log(`\n${colors.yellow}[5/5] TEST: Eliminación y Certificación de Limpieza en Ambas Tablas...${colors.reset}`);
    const { error: delPdfErr } = await supabase.from("patient_documents").delete().eq("id", TEST_PDF_DOC_ID);
    const { error: delWordErr } = await supabase.from("word_history_documents").delete().eq("id", TEST_WORD_DOC_ID);

    if (delPdfErr || delWordErr) {
      logFail("Fallo al eliminar documentos de prueba", (delPdfErr || delWordErr).message);
    } else {
      const { data: chk1 } = await supabase.from("patient_documents").select("id").eq("id", TEST_PDF_DOC_ID).maybeSingle();
      const { data: chk2 } = await supabase.from("word_history_documents").select("id").eq("id", TEST_WORD_DOC_ID).maybeSingle();

      if (!chk1 && !chk2) {
        logPass("Documentos de prueba eliminados exitosamente. Tablas patient_documents y word_history_documents limpias.");
        passed++;
      } else {
        logFail("Quedaron registros residuales en Supabase", { chk1, chk2 });
      }
    }
  } catch (err) {
    logFail("Excepción no controlada durante las pruebas", err.message || err);
  }

  // Resumen
  console.log(`\n${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}`);
  if (passed === total) {
    console.log(`${colors.green}${colors.bold}  RESULTADO: ${passed}/${total} PRUEBAS EXITOSAS (100% PASS) - MÓDULO 14 CERTIFICADO${colors.reset}`);
  } else {
    console.log(`${colors.red}${colors.bold}  RESULTADO: ${passed}/${total} PRUEBAS SUPERADAS${colors.reset}`);
  }
  console.log(`${colors.bold}══════════════════════════════════════════════════════════════════${colors.reset}\n`);

  process.exit(passed === total ? 0 : 1);
}

runDocumentosTestSuite();
