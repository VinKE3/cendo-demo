import { PDFDocument } from "pdf-lib";

/**
 * Fusiona un archivo PDF principal con uno o más archivos PDF externos de laboratorio (PAP, VPH, etc.)
 */
export async function mergePdfDocuments(
  basePdfBytes: Uint8Array,
  attachments: { name: string; bytes: Uint8Array }[]
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.load(basePdfBytes);

  for (const att of attachments) {
    try {
      const extPdf = await PDFDocument.load(att.bytes);
      const copiedPages = await mergedPdf.copyPages(extPdf, extPdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    } catch (err) {
      console.error(`Error al fusionar anexo PDF ${att.name}:`, err);
    }
  }

  return await mergedPdf.save();
}

/**
 * Descarga directamente un Uint8Array como archivo PDF en el navegador
 */
export function downloadPdfBlob(bytes: Uint8Array, fileName: string) {
  const blob = new Blob([bytes as unknown as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Lee un archivo de entrada File como Uint8Array
 */
export async function readFileAsUint8Array(file: File): Promise<Uint8Array> {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

/**
 * Imprime directamente un elemento HTML en formato A4 vectorial
 */
export function printHtmlElement(elementId: string, documentTitle: string) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Elemento con id #${elementId} no encontrado para impresión.`);
    return;
  }

  const printWindow = window.open("", "_blank", "width=900,height=1100");
  if (!printWindow) {
    window.print();
    return;
  }

  const styles = Array.from(document.querySelectorAll("link[rel='stylesheet'], style"))
    .map((s) => s.outerHTML)
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        ${styles}
        <style>
          @page {
            size: A4 portrait;
            margin: 0;
          }
          html, body {
            background: white !important;
            color: #0F172A !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
          .print-sheet {
            width: 210mm !important;
            max-width: 210mm !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .page-sheet {
            width: 210mm !important;
            height: 297mm !important;
            max-height: 297mm !important;
            box-sizing: border-box !important;
            page-break-after: always !important;
            break-after: page !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            overflow: hidden !important;
          }
          .page-sheet:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        <div class="print-sheet">
          ${element.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
}
