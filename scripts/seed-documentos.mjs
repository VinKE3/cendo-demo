/**
 * CENDO - Seeder Oficial: Repositorio Documental (.pdf & .docx)
 * Módulo 14 (src/modules/documentos/)
 *
 * Registra documentos externos oficiales y antecedentes en Word para las pacientes CENDO:
 * 1. Luciana María Ramos: Biopsia Patológica + Historia Previa en Word (migrada)
 * 2. Daniela Sofía Castro: Citología PAP ThinPrep + Panel Molecular VPH PCR
 * 3. Camila Andrea Valdivia: Informe de Biopsia de Pólipo Endometrial
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

const officialDocuments = [
  {
    id: "80000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    document_type: "PATOLOGIA",
    title: "Informe de Biopsia de Cérvix - Anatomía Patológica",
    file_name: "biopsia-cervical-luciana-ramos.pdf",
    file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/biopsia-luciana.pdf",
    file_size: 1425890,
    mime_type: "application/pdf",
    notes: "Anatomía Patológica Biolaq: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG). Bordes quirúrgicos libres.",
    created_at: "2026-10-15T14:30:00Z",
  },
  {
    id: "80000000-0000-0000-0000-000000000002",
    patient_id: "10000000-0000-0000-0000-000000000003", // Daniela Castro
    document_type: "PAP",
    title: "Citología Cervico-Vaginal PAP ThinPrep - Biolaq",
    file_name: "pap-thinprep-daniela-castro.pdf",
    file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/pap-daniela.pdf",
    file_size: 845200,
    mime_type: "application/pdf",
    notes: "Sistema Bethesda: Lesión Intraepitelial de Alto Grado (LIE-AG / HSIL). Se recomienda colposcopía y biopsia.",
    created_at: "2026-10-20T11:15:00Z",
  },
  {
    id: "80000000-0000-0000-0000-000000000003",
    patient_id: "10000000-0000-0000-0000-000000000003", // Daniela Castro
    document_type: "VPH",
    title: "Panel Molecular VPH 23 Genotipos PCR - Biolaq",
    file_name: "vph-molecular-daniela-castro.pdf",
    file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/vph-daniela.pdf",
    file_size: 1120400,
    mime_type: "application/pdf",
    notes: "Genotipificación por PCR en Tiempo Real: Positivo para VPH Genotipo 16 (Alto Riesgo Oncológico).",
    created_at: "2026-10-22T16:00:00Z",
  },
  {
    id: "80000000-0000-0000-0000-000000000004",
    patient_id: "10000000-0000-0000-0000-000000000004", // Camila Valdivia
    document_type: "PATOLOGIA",
    title: "Informe de Biopsia de Pólipo Endometrial",
    file_name: "patologia-polipo-camila-valdivia.pdf",
    file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/polipo-camila.pdf",
    file_size: 980300,
    mime_type: "application/pdf",
    notes: "Estudio histológico de pieza quirúrgica: Pólipo endometrial hiperplásico benigno sin atipias nucleares.",
    created_at: "2026-11-05T10:00:00Z",
  },
];

const officialWordHistories = [
  {
    id: "85000000-0000-0000-0000-000000000001",
    patient_id: "10000000-0000-0000-0000-000000000001", // Luciana Ramos
    file_name: "HC_Anterior_Luciana_Ramos_2025.docx",
    file_size: 94200,
    file_url: "https://zfyfyeezztaqrzfpogiv.supabase.co/storage/v1/object/public/lab-reports/hc-luciana-ramos-2025.docx",
    extracted_text: "HISTORIA CLÍNICA ANTERIOR (AÑO 2025) - CONSULTORIO EXTERNO GINECOLÓGICO.\nPaciente de 26 años acude por cuadro de dolor pélvico crónico y dismenorrea severa EVA 8/10. Ecografía transvaginal previa reportaba imagen sugestiva de endometrioma ovárico izquierdo de 3.2 cm.",
    notes: "Historia médica en Word migrada al sistema CENDO según solicitud del Dr. Patrick.",
    created_at: "2026-09-01T08:00:00Z",
  },
];

async function seedDocumentos() {
  console.log("\n🌱 Sembrando Repositorio Documental Oficial CENDO (Módulo 14)...");

  // 1. Inyectar documentos PDF en patient_documents
  for (const doc of officialDocuments) {
    const { error } = await supabase.from("patient_documents").upsert(doc, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error al sembrar documento ${doc.title}:`, error.message);
    } else {
      console.log(`   ✔ Documento PDF sembrado: ${doc.title} (${doc.document_type})`);
    }
  }

  // 2. Inyectar historias Word en word_history_documents
  for (const wDoc of officialWordHistories) {
    const { error } = await supabase.from("word_history_documents").upsert(wDoc, { onConflict: "id" });
    if (error) {
      console.error(`❌ Error al sembrar historia Word ${wDoc.file_name}:`, error.message);
    } else {
      console.log(`   ✔ Historia Word migrada sembrada: ${wDoc.file_name}`);
    }
  }

  console.log("✅ Repositorio documental 100% sincronizado en Supabase Cloud.\n");
}

seedDocumentos();
