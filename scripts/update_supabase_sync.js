const { execSync } = require('child_process');
const fs = require('fs');

let code = execSync('git show HEAD:src/lib/supabaseSync.ts').toString('utf8');

// Add PatientDocument to import
code = code.replace(
  '  PrenatalCard,',
  '  PrenatalCard,\n  PatientDocument,'
);

// Append Document functions
const docFunctions = `
// ============================================================================
// ETAPA B: REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS (PDF)
// ============================================================================

export async function uploadDocumentFileToStorage(
  file: File | Blob,
  patientId: string,
  fileName: string
): Promise<{ publicUrl: string; filePath: string } | null> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return null;
    }

    const patientUuid = getPatientUuid(patientId);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = Date.now();
    const filePath = \`\${patientUuid}/\${uniqueSuffix}_\${cleanFileName}\`;

    const { data, error } = await supabase.storage
      .from("lab-reports")
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || "application/pdf",
      });

    if (error) {
      console.warn("Aviso upload document to storage:", error.message);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from("lab-reports")
      .getPublicUrl(data.path);

    return {
      publicUrl: publicData.publicUrl,
      filePath: data.path,
    };
  } catch (err) {
    console.warn("Excepción al subir archivo a storage:", err);
    return null;
  }
}

export async function syncDocumentToSupabase(doc: PatientDocument): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const patientUuid = getPatientUuid(doc.patientId);
    const docUuid = ensureUuid(doc.id);

    const { error } = await supabase.from("patient_documents").upsert(
      {
        id: docUuid,
        patient_id: patientUuid,
        document_type: doc.documentType,
        title: doc.title,
        file_url: doc.fileUrl,
        file_name: doc.fileName,
        file_size: doc.fileSize || null,
        mime_type: doc.mimeType || "application/pdf",
        notes: doc.notes || null,
        created_at: doc.createdAt || new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("Aviso sync patient document Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function deleteDocumentFromSupabase(
  id: string,
  filePath?: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return false;
    }

    const targetId = ensureUuid(id);

    if (filePath) {
      await supabase.storage.from("lab-reports").remove([filePath]);
    }

    const { error } = await supabase.from("patient_documents").delete().eq("id", targetId);
    if (error) {
      console.warn("Aviso delete patient document Supabase:", error.message);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
`;

code = code.trim() + '\n' + docFunctions;
fs.writeFileSync('src/lib/supabaseSync.ts', code, 'utf8');
console.log('✓ src/lib/supabaseSync.ts updated cleanly! Total lines:', code.split('\n').length);

