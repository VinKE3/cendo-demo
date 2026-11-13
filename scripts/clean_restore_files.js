const { execSync } = require('child_process');
const fs = require('fs');

console.log('Restaurando src/lib/whatsappShare.ts desde commit 3e3721f...');
let wa = execSync('git show 3e3721f:src/lib/whatsappShare.ts', { encoding: 'utf8' });

// Add PatientDocument to import
wa = wa.replace(
  '  PrenatalCard,\n} from "@/types/medical";',
  '  PrenatalCard,\n  PatientDocument,\n} from "@/types/medical";'
);

const waFunc = `
export function generateDocumentWhatsAppUrl(
  patient: Patient,
  doc: PatientDocument,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    \`👋 *Estimada \${patient.firstName} \${patient.lastName}*,\`,
    \`\`,
    \`Le saluda el consultorio del *\${doctor.doctorTitle} \${doctor.fullName}* (\${doctor.clinicName}).\`,
    \`\`,
    \`📂 Le compartimos el documento / informe médico registrado en su expediente clínico:\`,
    \`📋 *Documento:* \${doc.title}\`,
    \`🏷 *Tipo:* \${doc.documentType}\`,
    \`🗓 *Fecha:* \${doc.createdAt.split("T")[0]}\`,
    doc.notes ? \`📝 *Observación / Resumen:* \${doc.notes}\` : null,
    \`\`,
    \`🔗 *Puede visualizar o descargar su documento en el siguiente enlace oficial:*\`,
    \`\${doc.fileUrl}\`,
    \`\`,
    \`🏥 *Sede de Atención:* \${doctor.clinicAddress}\`,
    \`📞 *Central de Consultas:* \${doctor.phone}\`,
    \`\`,
    \`_CENDO - Archivo Digital Clínico Seguro._\`,
  ]
    .filter(Boolean)
    .join("\\n");

  const encodedText = encodeURIComponent(message);
  return \`https://wa.me/\${targetPhone}?text=\${encodedText}\`;
}
`;

wa = wa.trim() + '\n' + waFunc;
fs.writeFileSync('src/lib/whatsappShare.ts', wa, 'utf8');
console.log('✓ src/lib/whatsappShare.ts restaurado sin duplicados ni problemas de encoding. Líneas:', wa.split('\n').length);

console.log('\nRestaurando src/lib/supabaseSync.ts desde commit 3e3721f...');
let supa = execSync('git show 3e3721f:src/lib/supabaseSync.ts', { encoding: 'utf8' });

supa = supa.replace(
  '  PrenatalCard,\n} from "@/types/medical";',
  '  PrenatalCard,\n  PatientDocument,\n} from "@/types/medical";'
);

const supaFuncs = `
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

supa = supa.trim() + '\n' + supaFuncs;
fs.writeFileSync('src/lib/supabaseSync.ts', supa, 'utf8');
console.log('✓ src/lib/supabaseSync.ts restaurado sin duplicados. Líneas:', supa.split('\n').length);

