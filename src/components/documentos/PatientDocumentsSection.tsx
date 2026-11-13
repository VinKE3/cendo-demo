"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Upload,
  Eye,
  Download,
  Share2,
  Trash2,
  Microscope,
  FlaskConical,
  FileCheck,
  Activity,
  Calendar,
  Sparkles,
  Search,
} from "lucide-react";
import Swal from "sweetalert2";
import { Patient, PatientDocument, DoctorProfile, DocumentCategory } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateDocumentWhatsAppUrl } from "@/lib/whatsappShare";

interface PatientDocumentsSectionProps {
  patient: Patient;
  doctor: DoctorProfile;
  onOpenUploadModal: () => void;
  onViewDocument: (doc: PatientDocument) => void;
}

export function PatientDocumentsSection({
  patient,
  doctor,
  onOpenUploadModal,
  onViewDocument,
}: PatientDocumentsSectionProps) {
  const { getDocumentsByPatientId, deletePatientDocument } = useMedicalStore();
  const docs = getDocumentsByPatientId(patient.id);

  const [selectedFilter, setSelectedFilter] = useState<string>("TODOS");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredDocs = useMemo(() => {
    return docs.filter((d: PatientDocument) => {
      // Filtro por categoría
      if (selectedFilter === "PAP_VPH") {
        if (d.documentType !== "PAP" && d.documentType !== "VPH") return false;
      } else if (selectedFilter !== "TODOS" && d.documentType !== selectedFilter) {
        return false;
      }

      // Filtro por buscador de texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesFile = d.fileName.toLowerCase().includes(query);
        const matchesNotes = d.notes?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesFile && !matchesNotes) return false;
      }

      return true;
    });
  }, [docs, selectedFilter, searchTerm]);

  const handleDelete = (doc: PatientDocument) => {
    Swal.fire({
      title: "¿Eliminar documento?",
      html: `¿Está seguro de eliminar <strong>"${doc.title}"</strong>?<br/><span class="text-xs text-slate-500">Esta acción removerá el archivo tanto de la historia clínica como del almacenamiento de Supabase.</span>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await deletePatientDocument(doc.id);
        Swal.fire({
          icon: "success",
          title: "Documento eliminado",
          text: "El archivo ha sido purgado correctamente.",
          timer: 1500,
          showConfirmButton: false,
          confirmButtonColor: "#0A4D68",
        });
      }
    });
  };

  const getCategoryBadge = (type: DocumentCategory) => {
    switch (type) {
      case "PAP":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">PAP ThinPrep</span>;
      case "VPH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-200">PCR VPH</span>;
      case "PATOLOGIA":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Biopsia / Patología</span>;
      case "LABORATORIO":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Laboratorio Clínico</span>;
      case "ECOGRAFIA":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Ecografía Externa</span>;
      case "CONSENTIMIENTO":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Consentimiento</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{type}</span>;
    }
  };

  const getCategoryIcon = (type: DocumentCategory) => {
    switch (type) {
      case "PAP":
        return <Microscope className="w-5 h-5 text-purple-600" />;
      case "VPH":
        return <FlaskConical className="w-5 h-5 text-cyan-600" />;
      case "PATOLOGIA":
        return <FileCheck className="w-5 h-5 text-rose-600" />;
      case "LABORATORIO":
        return <Activity className="w-5 h-5 text-emerald-600" />;
      default:
        return <FileText className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-5">
      {/* Cabecera de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-heading font-extrabold text-sm text-heading flex items-center gap-2">
              <span>Repositorio de Documentos & Exámenes Externos en PDF</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/10 text-primary">
                {docs.length}
              </span>
            </h3>
            <p className="text-[11px] text-muted font-medium">
              Resultados de laboratorios aliados (Biolaq, Roe, Suiza Lab), biopsias y órdenes escaneadas en Supabase Storage
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>+ Subir PDF / Doc Externo</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Pills de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedFilter("TODOS")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "TODOS"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Todos ({docs.length})
          </button>
          <button
            onClick={() => setSelectedFilter("PAP_VPH")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "PAP_VPH"
                ? "bg-purple-700 text-white shadow-2xs"
                : "bg-purple-50 hover:bg-purple-100 text-purple-700"
            }`}
          >
            PAP / VPH
          </button>
          <button
            onClick={() => setSelectedFilter("PATOLOGIA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "PATOLOGIA"
                ? "bg-rose-700 text-white shadow-2xs"
                : "bg-rose-50 hover:bg-rose-100 text-rose-700"
            }`}
          >
            Biopsias / Patología
          </button>
          <button
            onClick={() => setSelectedFilter("LABORATORIO")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "LABORATORIO"
                ? "bg-emerald-700 text-white shadow-2xs"
                : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700"
            }`}
          >
            Laboratorio
          </button>
          <button
            onClick={() => setSelectedFilter("ECOGRAFIA")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedFilter === "ECOGRAFIA"
                ? "bg-blue-700 text-white shadow-2xs"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700"
            }`}
          >
            Ecografías
          </button>
        </div>

        {/* Buscador Rápido */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título o análisis..."
            className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-border bg-white text-xs font-medium text-heading focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted"
          />
        </div>
      </div>

      {/* Grilla de Documentos */}
      {filteredDocs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((d: PatientDocument) => (
            <div
              key={d.id}
              className="p-4.5 rounded-2xl bg-white border border-slate-200 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between group space-y-3"
            >
              <div className="space-y-2.5">
                {/* Cabecera de la Tarjeta */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-primary/10 transition-colors">
                      {getCategoryIcon(d.documentType)}
                    </div>
                    <div>
                      {getCategoryBadge(d.documentType)}
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {d.createdAt.split("T")[0]}
                      </p>
                    </div>
                  </div>

                  {d.fileSize && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                      {(d.fileSize / 1024).toFixed(0)} KB
                    </span>
                  )}
                </div>

                {/* Título y Archivo */}
                <div>
                  <h4
                    onClick={() => onViewDocument(d)}
                    className="font-heading font-extrabold text-xs text-slate-900 group-hover:text-primary transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {d.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                    {d.fileName}
                  </p>
                </div>

                {/* Resumen / Notas Médicas */}
                {d.notes && (
                  <p className="text-[11px] text-slate-600 font-medium bg-slate-50 p-2 rounded-xl line-clamp-2 leading-relaxed border border-slate-100">
                    {d.notes}
                  </p>
                )}
              </div>

              {/* Botones de Acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onViewDocument(d)}
                  className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver PDF</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const url = generateDocumentWhatsAppUrl(patient, d, doctor);
                      window.open(url, "_blank");
                    }}
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                    title="Compartir por WhatsApp"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={d.fileName}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    title="Descargar archivo"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            {searchTerm || selectedFilter !== "TODOS"
              ? "No se encontraron documentos con los filtros seleccionados"
              : "No hay documentos externos registrados para esta paciente"}
          </p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Utilice el botón superior para subir análisis de laboratorio, citologías PAP, paneles VPH o informes de patología en formato PDF.
          </p>
          <button
            onClick={onOpenUploadModal}
            className="mt-2 px-3.5 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-dark transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir primer documento</span>
          </button>
        </div>
      )}
    </div>
  );
}
