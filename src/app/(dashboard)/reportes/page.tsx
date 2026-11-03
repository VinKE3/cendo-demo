"use client";

import React from "react";
import { Download, FileSpreadsheet, FileText, CheckCircle2 } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function ReportesPage() {
  const { patients, colposcopyReports, clinicalCheckups } = useMedicalStore();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-extrabold text-heading">
          Exportación y Base de Datos Clínica
        </h1>
        <p className="text-xs text-muted">
          Generador de reportes en Excel (.xlsx con 59 columnas históricas) y emisión consolidada de informes en PDF
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-heading">
              Exportar Matriz Clínica a Excel (.xlsx)
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Exportación de las 59 columnas del archivo histórico del doctor: DNI, datos de filiación, antecedentes gineco-obstétricos, hallazgos colposcópicos IFCPC y resultados de ecografía.
            </p>
          </div>
          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Matriz Excel (Fase 6)</span>
          </button>
        </div>

        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-heading font-bold text-heading">
              Generador de Informes Médicos en PDF
            </h3>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              Emisión de informes con membrete oficial de CENDO, fotos colposcópicas cuadradas, reloj cervical de biopsias y firma digital del Dr. Patrick Jacinto.
            </p>
          </div>
          <button
            type="button"
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Generar Informe PDF (Fase 6)</span>
          </button>
        </div>
      </div>
    </div>
  );
}

