/**
 * CENDO - Compresor Clínico de Imágenes en Canvas (Cliente)
 * Reduce fotografías colposcópicas y ecográficas de alta resolución (~5-10 MB)
 * a ~150-250 KB sin perder nitidez de epitelios, bordes o vascularización.
 * Evita que los informes PDF pesen 32 MB como ocurría en el flujo original del Dr. Patrick.
 */

export interface ImageCompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 a 1.0 (default 0.82 para medicina diagnóstica)
  mimeType?: "image/jpeg" | "image/webp";
}

export interface CompressedImageResult {
  dataUrl: string;
  originalSizeKb: number;
  compressedSizeKb: number;
  compressionRatio: number; // Porcentaje de reducción (ej. 85%)
  width: number;
  height: number;
}

export function compressImageFile(
  file: File,
  options: ImageCompressionOptions = {}
): Promise<CompressedImageResult> {
  const {
    maxWidth = 1280,
    maxHeight = 960,
    quality = 0.82,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const originalSizeKb = Math.round(file.size / 1024);

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Error al leer el archivo de imagen"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Error al decodificar la imagen"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular escalado proporcional manteniendo aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo obtener el contexto 2D de canvas"));
          return;
        }

        // Suavizado bicúbico de alta calidad para nitidez diagnóstica
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Fondo blanco por si la fuente tiene transparencias PNG
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        // Exportar en calidad médica optimizada
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Calcular tamaño aproximado del Base64
        const head = `data:${mimeType};base64,`;
        const base64Len = dataUrl.length - head.length;
        const compressedSizeKb = Math.round((base64Len * 3) / 4 / 1024);

        const reduction = Math.max(
          0,
          Math.round(((originalSizeKb - compressedSizeKb) / Math.max(originalSizeKb, 1)) * 100)
        );

        resolve({
          dataUrl,
          originalSizeKb,
          compressedSizeKb,
          compressionRatio: reduction,
          width,
          height,
        });
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

