"use client";

import React, { useState, useMemo } from "react";
import Swal from "sweetalert2";
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  Filter,
  CheckCircle2,
  Layers,
  Sparkles,
  Search,
  Eye,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { ColposcopyPrintView } from "@/components/export/ColposcopyPrintView";
import { CheckupPrintView } from "@/components/export/CheckupPrintView";
import { CendoCoverPage } from "@/components/export/CendoCoverPage";
import { PdfMergerModal } from "@/components/export/PdfMergerModal";
import {
  exportClinicalMatrixToExcel,
  buildDrPatrickExportRows,
} from "@/lib/exportExcel";
import { printHtmlElement } from "@/lib/pdfGenerator";
import {
  generateColposcopyWhatsAppUrl,
  generateCheckupWhatsAppUrl,
} from "@/lib/whatsappShare";

export default function ReportesPage() {
  const {
    patients,
    backgrounds,
    colposcopyReports,
    clinicalCheckups,
    doctorProfile,
  } = useMedicalStore();

  const [activeTab, setActiveTab] = useState<"pdf" | "excel">("pdf");

  // Estado para Pestaña PDF
  const [selectedPatientId, setSelectedPatientId] = useState<string>(
    patients[0]?.id || ""
  );
  const [reportType, setReportType] = useState<"colpo" | "checkup">("colpo");
  const [includeCover, setIncludeCover] = useState(true);
  const [isMergerModalOpen, setIsMergerModalOpen] = useState(false);

  // Estado para Pestaña Excel
  const [excelPatientId, setExcelPatientId] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Datos del Paciente Seleccionado para PDF
  const currentPatient = useMemo(() => {
    return patients.find((p) => p.id === selectedPatientId) || patients[0];
  }, [patients, selectedPatientId]);

  const currentColpo = useMemo(() => {
    if (!currentPatient) return colposcopyReports[0] || null;
    const found = colposcopyReports.find((c) => c.patientId === currentPatient.id);
    return found || colposcopyReports[0] || null;
  }, [colposcopyReports, currentPatient]);

  const currentCheckup = useMemo(() => {
    if (!currentPatient) return clinicalCheckups[0] || null;
    const found = clinicalCheckups.find((c) => c.patientId === currentPatient.id);
    return found || clinicalCheckups[0] || null;
  }, [clinicalCheckups, currentPatient]);

  // Manejo de Impresión / Guardado PDF
  const handlePrintPdf = () => {
    const docTitle =
      reportType === "colpo"
        ? `Informe_Colposcopia_${currentPatient.lastName}_${currentPatient.firstName}`
        : `Informe_Chequeo_${currentPatient.lastName}_${currentPatient.firstName}`;

    printHtmlElement("print-document-container", docTitle);
  };

  // Manejo de Descarga Excel
  const handleDownloadExcel = () => {
    try {
      setIsExportingExcel(true);

      const result = exportClinicalMatrixToExcel(
        patients,
        backgrounds,
        colposcopyReports,
        clinicalCheckups,
        {
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          patientId: excelPatientId,
        }
      );

      Swal.fire({
        icon: "success",
        title: "Excel Descargado",
        html: `
          <div class="text-left text-xs space-y-1">
            <p>Se exportaron exitosamente <b>${result.rowCount} registros</b> con las <b>59 columnas clínicas</b> completas.</p>
            <p class="font-mono text-slate-500 mt-2">${result.fileName}</p>
          </div>
        `,
        confirmButtonColor: "#0A4D68",
        timer: 2500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error al exportar Excel:", err);
      Swal.fire({
        icon: "error",
        title: "Error de Exportación",
        text: "Ocurrió un error al generar la matriz en Excel.",
        confirmButtonColor: "#0A4D68",
      });
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Conteo de filas estimadas para Excel
  const previewRows = useMemo(() => {
    return buildDrPatrickExportRows(
      patients,
      backgrounds,
      colposcopyReports,
      clinicalCheckups,
      {
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        patientId: excelPatientId,
      }
    );
  }, [patients, backgrounds, colposcopyReports, clinicalCheckups, startDate, endDate, excelPatientId]);

  return (
    <div className="space-y-6">
      {/* 1. Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Download className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-heading">
              Exportación y Motor de Informes Médicos
            </h1>
          </div>
          <p className="text-xs text-muted mt-1">
            Emisión de informes en PDF institucional A4, fusión con laboratorios externos (pdf-lib) y exportación a Excel (.xlsx - 59 columnas)
          </p>
        </div>
      </div>

      {/* 2. Selector de Pestañas de Exportación */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("pdf")}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "pdf"
              ? "bg-primary text-white shadow-xs"
              : "bg-surface border border-border text-muted hover:text-heading hover:bg-slate-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>1. Emisión de Informes en PDF & Fusión de Laboratorio</span>
        </button>

        <button
          onClick={() => setActiveTab("excel")}
          className={`px-4 py-2.5 rounded-xl font-heading font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeTab === "excel"
              ? "bg-emerald-700 text-white shadow-xs"
              : "bg-surface border border-border text-muted hover:text-heading hover:bg-slate-50"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>2. Matriz Clínica Histórica en Excel (59 Columnas)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PESTAÑA 1: GENERACIÓN DE PDF INSTITUCIONAL & FUSIÓN DE LABORATORIOS       */}
      {/* ========================================================================= */}
      {activeTab === "pdf" && (
        <div className="space-y-6">
          {/* Barra de Control y Configuración del PDF */}
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 max-w-2xl text-xs">
                {/* Selector de Paciente */}
                <div className="space-y-1">
                  <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                    Seleccionar Paciente:
                  </label>
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.lastName}, {p.firstName} (DNI: {p.dni})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selector de Tipo de Informe */}
                <div className="space-y-1">
                  <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                    Tipo de Informe a Emitir:
                  </label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="colpo">Informe de Colposcopía Especializada (IFCPC)</option>
                    <option value="checkup">Informe de Chequeo Ginecológico & Ecografías</option>
                  </select>
                </div>
              </div>

              {/* Botones de Acción de Impresión / Fusión */}
              <div className="flex items-center gap-2 self-start md:self-end flex-wrap">
                {currentPatient && (
                  <button
                    onClick={() => {
                      let url = "";
                      if (reportType === "colpo" && currentColpo) {
                        url = generateColposcopyWhatsAppUrl(currentPatient, currentColpo, doctorProfile);
                      } else if (reportType === "checkup" && currentCheckup) {
                        url = generateCheckupWhatsAppUrl(currentPatient, currentCheckup, doctorProfile);
                      }
                      if (url) {
                        window.open(url, "_blank");
                      } else {
                        Swal.fire({
                          icon: "info",
                          title: "Sin informe emitido",
                          text: "No hay informe registrado para compartir con la paciente.",
                          confirmButtonColor: "#0A4D68",
                        });
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-2xs"
                    title={`Enviar informe a ${currentPatient.firstName} por WhatsApp`}
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                    <span>Enviar a Paciente por WhatsApp</span>
                  </button>
                )}

                {reportType === "checkup" && currentCheckup && (
                  <button
                    onClick={() => setIsMergerModalOpen(true)}
                    className="px-4 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Layers className="w-4 h-4 text-indigo-600" />
                    <span>Fusionar con Laboratorio (pdf-lib)</span>
                  </button>
                )}

                <button
                  onClick={handlePrintPdf}
                  className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-secondary" />
                  <span>Imprimir / Descargar PDF</span>
                </button>
              </div>
            </div>

            {/* Selector de Carátula Institucional */}
            <div className="pt-3 border-t border-border flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-heading font-medium">
                <input
                  type="checkbox"
                  checked={includeCover}
                  onChange={(e) => setIncludeCover(e.target.checked)}
                  className="w-4 h-4 rounded text-primary accent-primary"
                />
                <span className="font-semibold text-slate-800">
                  Incluir Carátula Oficial CENDO con cenefa ondulada (Página 1)
                </span>
              </label>

              <span className="text-[11px] text-muted hidden sm:inline">
                Formato A4 idéntico al dossier del consultorio
              </span>
            </div>
          </div>

          {/* Previsualizador en Pantalla de la Hoja A4 */}
          <div className="p-4 sm:p-8 rounded-2xl bg-slate-100 border border-border overflow-x-auto flex justify-center">
            <div id="print-document-container" className="space-y-8 w-full max-w-[210mm]">
              {/* Página 1: Carátula Oficial Si está habilitada */}
              {includeCover && currentPatient && (
                <CendoCoverPage
                  patient={currentPatient}
                  doctor={doctorProfile}
                  documentTitle={
                    reportType === "colpo"
                      ? "COLPOSCOPÍA ESPECIALIZADA"
                      : "CHEQUEO GINECOLÓGICO"
                  }
                />
              )}

              {/* Página 2: Contenido Clínico */}
              {reportType === "colpo" && currentColpo && currentPatient && (
                <ColposcopyPrintView
                  report={currentColpo}
                  patient={currentPatient}
                  doctor={doctorProfile}
                />
              )}

              {reportType === "colpo" && !currentColpo && (
                <div className="py-16 text-center text-xs text-muted bg-white rounded-xl border border-slate-200">
                  No hay informe colposcópico registrado para esta paciente.
                </div>
              )}

              {reportType === "checkup" && currentCheckup && currentPatient && (
                <CheckupPrintView
                  checkup={currentCheckup}
                  patient={currentPatient}
                  doctor={doctorProfile}
                />
              )}

              {reportType === "checkup" && !currentCheckup && (
                <div className="py-16 text-center text-xs text-muted bg-white rounded-xl border border-slate-200">
                  No hay chequeo ginecológico registrado para esta paciente.
                </div>
              )}
            </div>
          </div>

          {/* Modal de Fusión de Laboratorio */}
          {currentCheckup && currentPatient && (
            <PdfMergerModal
              isOpen={isMergerModalOpen}
              onClose={() => setIsMergerModalOpen(false)}
              patient={currentPatient}
              checkup={currentCheckup}
              doctor={doctorProfile}
            />
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* PESTAÑA 2: MATRIZ CLÍNICA EXCEL (.xlsx - 59 COLUMNAS)                     */}
      {/* ========================================================================= */}
      {activeTab === "excel" && (
        <div className="space-y-6">
          {/* Panel de Configuración de Filtros Excel */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-heading">
                    Exportador de Matriz Histórica de CENDO (.xlsx)
                  </h3>
                  <p className="text-[11px] text-muted">
                    Compatible con el archivo maestro de 59 columnas del Dr. Patrick Jacinto Gomero
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                59 Columnas Clínicas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              {/* Filtro de Paciente */}
              <div className="space-y-1">
                <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                  Filtrar por Paciente:
                </label>
                <select
                  value={excelPatientId}
                  onChange={(e) => setExcelPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="all">Todas las Pacientes ({patients.length})</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha Desde */}
              <div className="space-y-1">
                <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                  Fecha Desde:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-semibold focus:outline-none"
                />
              </div>

              {/* Fecha Hasta */}
              <div className="space-y-1">
                <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                  Fecha Hasta:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-semibold focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border/80">
              <span className="text-xs text-muted">
                Registros listos para exportar: <strong className="text-heading font-mono">{previewRows.length}</strong> filas
              </span>

              <button
                onClick={handleDownloadExcel}
                disabled={isExportingExcel || previewRows.length === 0}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isExportingExcel ? "Generando Excel..." : "Descargar Matriz Excel (.xlsx)"}</span>
              </button>
            </div>
          </div>

          {/* Vista Previa de Columnas y Estructura */}
          <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
            <h4 className="font-heading font-bold text-xs text-heading uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Estructura de las 59 Columnas Clínicas Incluidas
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-800 text-[11px] block">1. Paciente & Filiación (10 col)</strong>
                <p className="text-[10px] text-muted leading-relaxed">
                  DNI, Apellidos, Nombres, Edad, Fecha Nacimiento, Teléfono, Email, Dirección, Estado Civil, Ocupación.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-800 text-[11px] block">2. Antecedentes (12 col)</strong>
                <p className="text-[10px] text-muted leading-relaxed">
                  Menarquia, IRS, N° Parejas, Fórmula Obstétrica, MAC, FUR, Antecedente PAP, Antecedente VPH, Alergias, Cirugías, Familiares, Notas.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-800 text-[11px] block">3. Chequeo & Ecografías (13 col)</strong>
                <p className="text-[10px] text-muted leading-relaxed">
                  Fecha, Motivo, Eco Mama, BI-RADS, Lesiones Mama, Eco TV, Medidas Útero, Endometrio (mm), Ovarios, PAP, VPH PCR, Conclusiones, Receta.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <strong className="text-slate-800 text-[11px] block">4. Colposcopía IFCPC (22 col)</strong>
                <p className="text-[10px] text-muted leading-relaxed">
                  Fecha, Adecuada, UEC, ZT, Escamoso, Ectopia, Acetoblanco 1/2, Mosaico, Punteado, Vasos, Schiller, Biopsia, Horas Reloj, Diagnóstico, CIE-10, Médico.
                </p>
              </div>
            </div>

            {/* Muestra Previa de la Tabla */}
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-border">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600">
                  <tr>
                    <th className="px-3 py-2.5">CONCATENA</th>
                    <th className="px-3 py-2.5">Fecha</th>
                    <th className="px-3 py-2.5">DNI</th>
                    <th className="px-3 py-2.5">Apellidos y Nombres</th>
                    <th className="px-3 py-2.5">Edad</th>
                    <th className="px-3 py-2.5">Fórmula</th>
                    <th className="px-3 py-2.5">FUR</th>
                    <th className="px-3 py-2.5">PAP</th>
                    <th className="px-3 py-2.5">VPH</th>
                    <th className="px-3 py-2.5">Colposcopia</th>
                    <th className="px-3 py-2.5">Schiller</th>
                    <th className="px-3 py-2.5">Biopsia</th>
                    <th className="px-3 py-2.5">Diagnóstico</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-white font-mono text-[11px]">
                  {previewRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-bold text-primary">{row.CONCATENA}</td>
                      <td className="px-3 py-2">{row["Fecha de cita"]}</td>
                      <td className="px-3 py-2 font-bold">{row["DNI:"]}</td>
                      <td className="px-3 py-2 font-sans font-medium text-heading">
                        {row["APELLIDOS Y NOMBRES:"]}
                      </td>
                      <td className="px-3 py-2">{row["EDAD:"]} a</td>
                      <td className="px-3 py-2 font-bold text-primary">{row["FORMULA OBSTETRICA:"]}</td>
                      <td className="px-3 py-2">{row["FUR:"]}</td>
                      <td className="px-3 py-2 text-indigo-700">{row["RESULTADO DE PAP:"]}</td>
                      <td className="px-3 py-2">{row["RESULTADO DE TEST DE VPH:"]}</td>
                      <td className="px-3 py-2 font-sans">{row["Colposcopia"]}</td>
                      <td className="px-3 py-2">{row["Solución de Lugol (test de Schiller)"]}</td>
                      <td className="px-3 py-2 text-rose-700 font-bold">{row["BIOPSIA"]}</td>
                      <td className="px-3 py-2 font-sans text-slate-800">{row["DIAGNÓSTICO"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
