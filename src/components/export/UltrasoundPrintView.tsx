"use client";

import React from "react";
import { Patient, DoctorProfile, UltrasoundReport } from "@/types/medical";
import { BrandLogo } from "@/components/layout/BrandLogo";
import { CendoFooterWave } from "@/components/export/CendoFooterWave";

interface UltrasoundPrintViewProps {
  report: UltrasoundReport;
  patient: Patient;
  doctor: DoctorProfile;
}

const TYPE_NAMES: Record<string, string> = {
  TRANSVAGINAL: "Ecografía Transvaginal de Alta Resolución",
  PELVICA: "Ecografía Pélvica Ginecológica",
  MAMA_BILATERAL: "Ecografía Mamaria Bilateral con Clasificación BI-RADS",
  OBSTETRICA_1T: "Ecografía Obstétrica del Primer Trimestre",
  OBSTETRICA_2T_3T: "Ecografía Obstétrica Morfológica / Detalle Fetal",
  DOPPLER: "Ecografía Doppler Ginecológica y Pélvica Color",
};

export function UltrasoundPrintView({
  report,
  patient,
  doctor,
}: UltrasoundPrintViewProps) {
  const doctorDisplayName = (report.doctorName || doctor.fullName)
    .replace(/^dr\.?\s+/i, "")
    .trim();

  const titlePrefix = doctor.doctorTitle || "Dr.";
  const f = report.findings;

  return (
    <div
      id="ultrasound-print-sheet"
      className="max-w-[210mm] mx-auto text-slate-900 bg-white font-sans text-xs"
    >
      <div className="page-sheet w-[210mm] min-h-[297mm] max-h-[297mm] p-[10mm_14mm_6mm_14mm] flex flex-col justify-between border border-slate-200 shadow-sm rounded-xl print:border-none print:shadow-none print:rounded-none overflow-hidden box-border">
        {/* Contenido Superior */}
        <div className="space-y-3.5 flex-1">
          {/* 1. Membrete CENDO */}
          <div className="border-b-2 border-primary pb-3 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <BrandLogo size="lg" showText={false} />
              <div>
                <h1 className="text-xl font-heading font-extrabold text-primary tracking-tight">
                  CENDO &bull; CENTRO DE ENDOMETRIOSIS
                </h1>
                <p className="text-[11px] font-semibold text-slate-700">
                  Unidad de Diagnóstico por Imágenes &bull; Ecografía de Alta Resolución
                </p>
                <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">
                  {doctor.clinicAddress} &bull; Citas: {doctor.phone}
                </p>
              </div>
            </div>

            <div className="text-right border-l border-slate-200 pl-4 shrink-0">
              <div className="inline-block px-2.5 py-1 rounded-md bg-accent-soft text-primary font-heading font-extrabold text-xs tracking-wider uppercase border border-primary/20">
                INFORME ECOGRÁFICO
              </div>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                N° ECO-{report.id.slice(0, 8)}
              </p>
              <p className="text-[10px] text-slate-700 font-bold">
                Fecha: {report.reportDate}
              </p>
            </div>
          </div>

          {/* 2. Datos de Paciente & Tipo de Examen */}
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
            <div className="md:col-span-5">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Paciente:
              </span>
              <strong className="text-sm font-heading font-bold text-slate-900">
                {patient.lastName}, {patient.firstName}
              </strong>
            </div>

            <div className="md:col-span-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                DNI:
              </span>
              <span className="font-mono font-bold text-slate-900">{patient.dni}</span>
            </div>

            <div className="md:col-span-2">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Edad:
              </span>
              <span className="font-semibold text-slate-800">{patient.age} años</span>
            </div>

            <div className="md:col-span-3">
              <span className="text-[9.5px] uppercase font-bold text-slate-500 block">
                Examen Realizado:
              </span>
              <strong className="text-primary text-[11px] block truncate">
                {TYPE_NAMES[report.ultrasoundType] || report.ultrasoundType}
              </strong>
            </div>

            {report.indication && (
              <div className="md:col-span-12 pt-1 border-t border-slate-200 text-[11px]">
                <strong className="text-slate-600">Indicación Clínica: </strong>
                <span className="text-slate-900">{report.indication}</span>
              </div>
            )}
          </div>

          {/* 3. Hallazgos Específicos según Tipo de Ecografía */}
          <div className="p-3.5 rounded-lg bg-white border border-slate-200 space-y-2.5">
            <h2 className="text-[10px] uppercase font-bold text-primary tracking-wider border-b border-slate-200 pb-1">
              Hallazgos Ecográficos Detallados
            </h2>

            {/* Caso Ginecológica / Pélvica / Doppler */}
            {(report.ultrasoundType === "TRANSVAGINAL" ||
              report.ultrasoundType === "PELVICA" ||
              report.ultrasoundType === "DOPPLER") && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Posición Útero:</span>
                    <strong className="font-mono text-slate-900">{f.uterusPosition || "AVF"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Dimensiones Uterinas:</span>
                    <strong className="font-mono text-slate-900">{f.uterusDimensions || "Normales"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Volumen Estimado:</span>
                    <strong className="font-mono text-slate-900">{f.uterusVolumeCc ? `${f.uterusVolumeCc} cc` : "-"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Endometrio:</span>
                    <strong className="font-mono text-slate-900">{f.endometriumThicknessMm ? `${f.endometriumThicknessMm} mm (${f.endometriumPattern || "Secretor"})` : "Normal"}</strong>
                  </div>
                </div>

                {f.myometriumStatus && (
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Miometrio:</strong>
                    <p className="text-slate-800 leading-snug">{f.myometriumStatus}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Ovario Derecho:</strong>
                    <p className="text-slate-800">{f.rightOvaryDimensions || "Dimensiones normales, folículos habituales."}</p>
                  </div>
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Ovario Izquierdo:</strong>
                    <p className="text-slate-800">{f.leftOvaryDimensions || "Dimensiones normales, folículos habituales."}</p>
                  </div>
                </div>

                {f.ovariesNotes && (
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Evaluación de Anexos / Endometriomas:</strong>
                    <p className="text-slate-800 leading-snug">{f.ovariesNotes}</p>
                  </div>
                )}

                {f.douglasPouch && (
                  <div className="p-2 rounded bg-amber-50/70 border border-amber-200">
                    <strong className="text-amber-950 text-[11px] block">Fondo de Saco de Douglas / Signo de Deslizamiento:</strong>
                    <p className="text-amber-900 text-xs">{f.douglasPouch}</p>
                  </div>
                )}
              </div>
            )}

            {/* Caso Mama Bilateral */}
            {report.ultrasoundType === "MAMA_BILATERAL" && (
              <div className="space-y-2 text-xs">
                {f.breastPattern && (
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Patrón Parenquimal Fibroglandular:</strong>
                    <p className="text-slate-800">{f.breastPattern}</p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <strong className="text-slate-800 text-xs block mb-1">Mama Derecha:</strong>
                    <p className="text-slate-700 leading-snug">{f.rightBreastFindings || "Sin lesiones nodulares dominantes."}</p>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <strong className="text-slate-800 text-xs block mb-1">Mama Izquierda:</strong>
                    <p className="text-slate-700 leading-snug">{f.leftBreastFindings || "Sin lesiones nodulares dominantes."}</p>
                  </div>
                </div>
                {f.biradsCategory && (
                  <div className="p-2 rounded bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-900">Categoría BI-RADS:</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-mono font-extrabold text-xs">
                      {f.biradsCategory}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Caso Obstétrica */}
            {(report.ultrasoundType === "OBSTETRICA_1T" || report.ultrasoundType === "OBSTETRICA_2T_3T") && (
              <div className="space-y-2 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Sacos Gestacionales:</span>
                    <strong className="font-mono text-slate-900">{f.gestationalSacsCount ?? 1}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">LCN / Biometría:</span>
                    <strong className="font-mono text-slate-900">{f.embryoCrownRumpLengthMm ? `${f.embryoCrownRumpLengthMm} mm` : "Acorde"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Edad Gestacional Eco:</span>
                    <strong className="font-mono text-slate-900">{f.gestationalAgeByEcho || "-"}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">F.C.F. Fetal:</span>
                    <strong className="font-mono text-slate-900">{f.fetalHeartRate ? `${f.fetalHeartRate} lpm` : "Presente"}</strong>
                  </div>
                </div>

                {f.placentaLocation && (
                  <div>
                    <strong className="text-slate-700 text-[11px] block">Implantación Placentaria:</strong>
                    <p className="text-slate-800">{f.placentaLocation}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Conclusiones y Recomendaciones */}
          <div className="p-3.5 rounded-lg bg-emerald-50/60 border border-emerald-200 space-y-1.5">
            <h2 className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider">
              Conclusión Diagnóstica
            </h2>
            <div className="text-xs font-bold text-emerald-950 whitespace-pre-line leading-relaxed font-sans">
              {report.conclusion}
            </div>

            {report.recommendations && (
              <div className="pt-2 border-t border-emerald-200 text-xs">
                <strong className="text-emerald-900">Sugerencias y Plan de Manejo: </strong>
                <span className="text-slate-800">{report.recommendations}</span>
              </div>
            )}
          </div>

          {/* 5. Galería de Fotos Ecográficas (si hay) */}
          {report.images && report.images.length > 0 && (
            <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
              <h2 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Capturas Ecográficas ({report.images.length})
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {report.images.map((img, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-900 text-center">
                    <img
                      src={img.url}
                      alt={img.caption || `Captura ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    {img.caption && (
                      <p className="text-[9px] text-white/90 p-1 bg-black/60 truncate font-mono">
                        {img.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 6. Firma Oficial y Pie Institucional */}
        <div className="mt-4 pt-2 border-t border-slate-200">
          <div className="flex items-end justify-between">
            <div className="text-[9.5px] text-slate-500 space-y-0.5">
              <p className="font-semibold text-slate-700">
                CENDO &bull; Centro de Endometriosis y Ginecología Avanzada
              </p>
              <p>Ecografía Médica Especializada con Validez Clínico-Legal</p>
              <p className="font-mono">Miraflores, Lima - Perú</p>
            </div>

            <div className="text-center w-64 border-t border-slate-400 pt-2 shrink-0">
              <p className="text-xs font-heading font-extrabold text-slate-900">
                {titlePrefix} {doctorDisplayName}
              </p>
              <p className="text-[10px] font-semibold text-slate-700">
                {doctor.specialty}
              </p>
              <p className="text-[9.5px] font-mono font-bold text-slate-600">
                CMP {report.doctorCmp || doctor.cmp} &bull; RNE {report.doctorRne || doctor.rne}
              </p>
              <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">
                Especialista en Ecografía Gineco-Obstétrica
              </p>
            </div>
          </div>

          <div className="mt-2">
            <CendoFooterWave />
          </div>
        </div>
      </div>
    </div>
  );
}

