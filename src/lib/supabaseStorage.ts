/**
 * CENDO - Supabase Storage Bridge
 * Gestiona la subida de imágenes comprimidas y reportes a los buckets de Supabase:
 * - clinical-images (Fotos de colposcopía y ecografía)
 * - lab-reports (PDFs de laboratorio externo)
 *
 * Arquitectura Híbrida:
 * Sube a Supabase Storage cuando hay conexión. Si está offline o falla,
 * retorna la versión comprimida en base64 de forma transparente para que
 * la demo y la clínica nunca se bloqueen.
 */

import { createClient } from "@/lib/supabase/client";

export interface StorageUploadResult {
  url: string;
  isRemote: boolean;
  fileName: string;
  sizeKb: number;
  error?: string;
}

/**
 * Convierte un DataURL (Base64) a Blob para subida binaria eficiente
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(";base64,");
  const contentType = parts[0].split(":")[1] || "image/jpeg";
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);

  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }

  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Sube una imagen colposcópica o ecográfica comprimida al bucket 'clinical-images'
 */
export async function uploadClinicalImageToSupabase(
  dataUrlOrFile: string | File,
  options: {
    folder?: string;
    prefix?: string;
  } = {}
): Promise<StorageUploadResult> {
  const { folder = "colposcopia", prefix = "foto" } = options;

  let blob: Blob;
  let fallbackDataUrl: string;

  if (typeof dataUrlOrFile === "string") {
    fallbackDataUrl = dataUrlOrFile;
    blob = dataUrlToBlob(dataUrlOrFile);
  } else {
    blob = dataUrlOrFile;
    fallbackDataUrl = "";
  }

  const sizeKb = Math.round(blob.size / 1024);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 7);
  const fileName = `${prefix}_${timestamp}_${random}.jpg`;
  const filePath = `${folder}/${fileName}`;

  try {
    const supabase = createClient();

    // Validar que Supabase esté configurado
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return {
        url: fallbackDataUrl,
        isRemote: false,
        fileName,
        sizeKb,
      };
    }

    const { error: uploadError } = await supabase.storage
      .from("clinical-images")
      .upload(filePath, blob, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      console.warn("Aviso: Subida remota a Supabase Storage no completada, usando local:", uploadError.message);
      return {
        url: fallbackDataUrl,
        isRemote: false,
        fileName,
        sizeKb,
        error: uploadError.message,
      };
    }

    // Obtener la URL pública del bucket 'clinical-images'
    const { data: publicUrlData } = supabase.storage
      .from("clinical-images")
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      isRemote: true,
      fileName,
      sizeKb,
    };
  } catch (err: any) {
    console.warn("Excepción al contactar Supabase Storage, fallback activado:", err?.message || err);
    return {
      url: fallbackDataUrl,
      isRemote: false,
      fileName,
      sizeKb,
      error: err?.message || "Error de red",
    };
  }
}

/**
 * Sube un PDF de laboratorio externo (Biolaq, etc.) al bucket 'lab-reports'
 */
export async function uploadLabReportToSupabase(
  file: File
): Promise<{ url: string; isRemote: boolean; error?: string }> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `informes/${Date.now()}_${cleanName}`;

  try {
    const supabase = createClient();

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === "xxxx") {
      return { url: "", isRemote: false, error: "No configurado" };
    }

    const { error: uploadError } = await supabase.storage
      .from("lab-reports")
      .upload(filePath, file, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      return { url: "", isRemote: false, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from("lab-reports")
      .getPublicUrl(filePath);

    return {
      url: publicUrlData.publicUrl,
      isRemote: true,
    };
  } catch (err: any) {
    return {
      url: "",
      isRemote: false,
      error: err?.message || "Error al subir PDF",
    };
  }
}

