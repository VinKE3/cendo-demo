"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  X,
  FileText,
  Upload,
  Plus,
  Trash2,
  Download,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import {
  mergePdfDocuments,
  downloadPdfBlob,
  readFileAsUint8Array,
} from "@/lib/pdfGenerator";
import { Patient, ClinicalCheckup, DoctorProfile } from "@/types/medical";

interface PdfMergerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  checkup: ClinicalCheckup;
  doctor: DoctorProfile;
}

interface AttachedFile {
  id: string;
  file: File;
  name: string;
  sizeKb: number;
}

export function PdfMergerModal({
  isOpen,
  onClose,
  patient,
  checkup,
  doctor,
}: PdfMergerModalProps) {
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: AttachedFile[] = [];

    Array.from(files).forEach((file) => {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        newAttachments.push({
          id: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          name: file.name,
          sizeKb: Math.round(file.size / 1024),
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Formato no válido",
          text: `"${file.name}" no es un archivo PDF.`,
          confirmButtonColor: "#0A4D68",
        });
      }
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  /**
   * Crea un PDF base de carátula clínica institucional en caso de no tener PDF previo renderizado
   */
  const createBaseClinicalPdf = async (): Promise<Uint8Array> => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 en puntos
    const { width, height } = page.getSize();

    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Color primario CENDO #0A4D68
    const primaryColor = rgb(10 / 255, 77 / 255, 104 / 255);
    const darkColor = rgb(15 / 255, 23 / 255, 42 / 255);
    const mutedColor = rgb(100 / 255, 116 / 255, 139 / 255);

    // Membrete Superior
    page.drawText("CENDO - CENTRO DE ENDOMETRIOSIS", {
      x: 40,
      y: height - 50,
      size: 16,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(
      `Ginecología Especializada • ${doctor.clinicAddress} • Tel: ${doctor.phone}`,
      {
        x: 40,
        y: height - 68,
        size: 9,
        font: fontRegular,
        color: mutedColor,
      }
    );

    page.drawText(
      `${doctor.doctorTitle} ${doctor.fullName} (CMP ${doctor.cmp} / RNE ${doctor.rne})`,
      {
        x: 40,
        y: height - 82,
        size: 9,
        font: fontBold,
        color: darkColor,
      }
    );

    page.drawLine({
      start: { x: 40, y: height - 95 },
      end: { x: width - 40, y: height - 95 },
      thickness: 1.5,
      color: primaryColor,
    });

    // Título del Informe
    page.drawText("INFORME DE CHEQUEO GINECOLÓGICO & ECOGRAFÍAS", {
      x: 40,
      y: height - 120,
      size: 13,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(`Fecha: ${checkup.checkupDate}   |   ID Informe: ${checkup.id}`, {
      x: 40,
      y: height - 135,
      size: 9,
      font: fontRegular,
      color: mutedColor,
    });

    // Fila Datos de Paciente
    let currentY = height - 165;
    page.drawRectangle({
      x: 40,
      y: currentY - 35,
      width: width - 80,
      height: 45,
      color: rgb(248 / 255, 250 / 255, 252 / 255),
      borderColor: rgb(226 / 255, 232 / 255, 240 / 255),
      borderWidth: 1,
    });

    page.drawText(`Paciente: ${patient.lastName}, ${patient.firstName}`, {
      x: 50,
      y: currentY - 8,
      size: 10,
      font: fontBold,
      color: darkColor,
    });

    page.drawText(
      `DNI: ${patient.dni}    Edad: ${patient.age} años    Teléfono: ${patient.phone}`,
      {
        x: 50,
        y: currentY - 24,
        size: 9,
        font: fontRegular,
        color: darkColor,
      }
    );

    // Sección 1: Ecografía Mamaria
    currentY -= 65;
    page.drawText("1. ECOGRAFÍA MAMARIA BILATERAL", {
      x: 40,
      y: currentY,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(`Clasificación: ${checkup.breastUltrasoundBirads}`, {
      x: 40,
      y: currentY - 16,
      size: 9,
      font: fontBold,
      color: darkColor,
    });

    page.drawText(
      `Hallazgos: ${checkup.breastUltrasoundFindings.slice(0, 110)}...`,
      {
        x: 40,
        y: currentY - 30,
        size: 8.5,
        font: fontRegular,
        color: darkColor,
      }
    );

    // Sección 2: Ecografía Transvaginal
    currentY -= 60;
    page.drawText("2. ECOGRAFÍA TRANSVAGINAL DOPPLER", {
      x: 40,
      y: currentY,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(
      `Útero: ${checkup.uterusMeasurements}    |    Endometrio: ${checkup.endometriumThicknessMm} mm`,
      {
        x: 40,
        y: currentY - 16,
        size: 9,
        font: fontBold,
        color: darkColor,
      }
    );

    page.drawText(
      `Hallazgos: ${checkup.transvaginalUltrasoundFindings.slice(0, 110)}...`,
      {
        x: 40,
        y: currentY - 30,
        size: 8.5,
        font: fontRegular,
        color: darkColor,
      }
    );

    // Sección 3: Conclusiones y Receta
    currentY -= 60;
    page.drawText("3. CONCLUSIONES DIAGNÓSTICAS & PLAN", {
      x: 40,
      y: currentY,
      size: 11,
      font: fontBold,
      color: primaryColor,
    });

    page.drawText(`${checkup.conclusions.slice(0, 120)}...`, {
      x: 40,
      y: currentY - 16,
      size: 8.5,
      font: fontRegular,
      color: darkColor,
    });

    // Indicador de Anexos Adjuntos
    currentY -= 55;
    page.drawRectangle({
      x: 40,
      y: currentY - 40,
      width: width - 80,
      height: 48,
      color: rgb(238 / 255, 242 / 255, 255 / 255),
      borderColor: rgb(199 / 255, 210 / 255, 254 / 255),
      borderWidth: 1,
    });

    page.drawText(
      "DOCUMENTO CONSOLIDADO: Contiene informes de laboratorio externos adjuntos a continuación.",
      {
        x: 50,
        y: currentY - 14,
        size: 8.5,
        font: fontBold,
        color: rgb(49 / 255, 46 / 255, 129 / 255),
      }
    );

    page.drawText(
      `Anexos fusionados (${attachments.length}): ${attachments.map((a) => a.name).join(", ")}`,
      {
        x: 50,
        y: currentY - 30,
        size: 8,
        font: fontRegular,
        color: rgb(67 / 255, 56 / 255, 202 / 255),
      }
    );

    // Firma Sello Inferior
    page.drawLine({
      start: { x: width - 230, y: 110 },
      end: { x: width - 50, y: 110 },
      thickness: 1,
      color: mutedColor,
    });

    page.drawText(`${doctor.doctorTitle} ${doctor.fullName}`, {
      x: width - 220,
      y: 95,
      size: 9,
      font: fontBold,
      color: darkColor,
    });

    page.drawText(
      `${doctor.specialty} • CMP ${doctor.cmp} • RNE ${doctor.rne}`,
      {
        x: width - 225,
        y: 82,
        size: 7.5,
        font: fontRegular,
        color: mutedColor,
      }
    );

    return await pdfDoc.save();
  };

  const handleMergeAndDownload = async () => {
    if (attachments.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Sin archivos adjuntos",
        text: "Por favor adjunte al menos un PDF de laboratorio (ej. Citología PAP o Test VPH) para consolidar.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // 1. Crear PDF Base de CENDO
      const basePdfBytes = await createBaseClinicalPdf();

      // 2. Leer archivos externos como Uint8Array
      const loadedAttachments = await Promise.all(
        attachments.map(async (att) => {
          const bytes = await readFileAsUint8Array(att.file);
          return { name: att.name, bytes };
        })
      );

      // 3. Fusionar con pdf-lib
      const mergedPdfBytes = await mergePdfDocuments(basePdfBytes, loadedAttachments);

      // 4. Descargar archivo
      const sanitizedName = `${patient.lastName}_${patient.firstName}`
        .replace(/[^a-zA-Z0-9]/g, "_")
        .toUpperCase();
      const fileName = `Chequeo_Consolidado_${sanitizedName}_${checkup.checkupDate}.pdf`;

      downloadPdfBlob(mergedPdfBytes, fileName);

      await Swal.fire({
        icon: "success",
        title: "PDF Consolidado Descargado",
        html: `<p class="text-xs">Se fusionaron con éxito <b>${attachments.length} documento(s)</b> de laboratorio junto al informe de CENDO.</p>`,
        confirmButtonColor: "#0A4D68",
        timer: 2000,
        showConfirmButton: false,
      });

      onClose();
    } catch (error) {
      console.error("Error al fusionar PDFs:", error);
      Swal.fire({
        icon: "error",
        title: "Error de fusión",
        text: "Ocurrió un error al unir los archivos PDF. Verifique que los PDFs no tengan contraseñas.",
        confirmButtonColor: "#0A4D68",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Cabecera del Modal */}
        <div className="p-4 bg-slate-50 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-heading font-extrabold text-sm text-heading">
                Consolidador de PDFs Clínicos (pdf-lib)
              </h3>
              <p className="text-[11px] text-muted">
                Fusión del informe de CENDO con PDFs de laboratorios externos (Biolaq, Roe, etc.)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal */}
        <div className="p-6 space-y-5 text-xs">
          {/* Tarjeta de Resumen del Paciente */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold">Paciente Asignada</span>
              <p className="font-heading font-bold text-heading text-sm">
                {patient.lastName}, {patient.firstName}
              </p>
              <p className="text-[11px] text-muted font-mono">
                DNI: {patient.dni} &bull; Chequeo: {checkup.checkupDate}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Informe CENDO Base Listo
            </span>
          </div>

          {/* Selector de Archivos PDF Externos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-heading uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Adjuntar Informes de Laboratorio (PDF)
              </label>
              <span className="text-[10px] text-muted font-mono">
                {attachments.length} archivo(s) seleccionado(s)
              </span>
            </div>

            <label className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/30 hover:bg-indigo-50/60 p-6 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-center">
              <Upload className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="font-semibold text-heading text-xs">
                  Haga clic para seleccionar archivos PDF
                </p>
                <p className="text-[10px] text-muted mt-0.5">
                  Ej. Resultado_PAP_Biolaq.pdf, Panel_Molecular_VPH.pdf
                </p>
              </div>
              <input
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>

          {/* Lista de Archivos Adjuntos */}
          {attachments.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-muted block">
                Archivos a fusionar en orden correlativo:
              </span>
              <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                {attachments.map((att, idx) => (
                  <div
                    key={att.id}
                    className="p-2.5 rounded-lg bg-white border border-border flex items-center justify-between gap-2 shadow-2xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-5 h-5 rounded bg-indigo-100 text-indigo-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-heading truncate">{att.name}</span>
                      <span className="text-[10px] text-muted font-mono shrink-0">
                        ({att.sizeKb} KB)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      className="p-1 rounded text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Quitar anexo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nota informativa */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 space-y-1 text-[11px] leading-relaxed">
            <p className="font-bold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
              Ventaja para el consultorio:
            </p>
            <p>
              La paciente recibirá un <b>único archivo PDF consolidado</b> que contiene la carátula de chequeo del Dr. Patrick Jacinto seguida inmediatamente de los resultados analíticos originales de laboratorio.
            </p>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-muted hover:text-heading hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={isProcessing || attachments.length === 0}
            onClick={handleMergeAndDownload}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>{isProcessing ? "Fusionando PDFs..." : "Descargar PDF Consolidado"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

