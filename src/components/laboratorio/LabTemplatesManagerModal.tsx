"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import {
  X,
  Settings,
  Plus,
  Edit2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Sparkles,
  FileText,
  Microscope,
  Scissors,
  Activity,
  Layers,
} from "lucide-react";
import { LabOrderTemplate, LabTemplateType } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

interface LabTemplatesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: LabOrderTemplate) => void;
}

const TEMPLATE_TYPE_ICONS: Record<LabTemplateType, React.ReactNode> = {
  PAP: <Microscope className="w-4 h-4 text-purple-600" />,
  BIOPSIA: <Scissors className="w-4 h-4 text-emerald-600" />,
  TRUCUT: <Layers className="w-4 h-4 text-pink-600" />,
  ITS: <Activity className="w-4 h-4 text-amber-600" />,
  PERITONEAL: <FlaskConical className="w-4 h-4 text-teal-600" />,
  GENERAL: <FileText className="w-4 h-4 text-slate-600" />,
  CUSTOM: <Sparkles className="w-4 h-4 text-blue-600" />,
};

const TEMPLATE_TYPE_BADGES: Record<LabTemplateType, { label: string; color: string }> = {
  PAP: { label: "Papanicolaou / Citología", color: "bg-purple-100 text-purple-800 border-purple-200" },
  BIOPSIA: { label: "Anatomía Patológica / Biopsia", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  TRUCUT: { label: "Biopsia Tru-Cut Mamaria", color: "bg-pink-100 text-pink-800 border-pink-200" },
  ITS: { label: "Panel Molecular ITS", color: "bg-amber-100 text-amber-800 border-amber-200" },
  PERITONEAL: { label: "Líquido Peritoneal", color: "bg-teal-100 text-teal-800 border-teal-200" },
  GENERAL: { label: "Análisis General", color: "bg-slate-100 text-slate-800 border-slate-200" },
  CUSTOM: { label: "Personalizada CENDO", color: "bg-blue-100 text-blue-800 border-blue-200" },
};

export function LabTemplatesManagerModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: LabTemplatesManagerModalProps) {
  const {
    labTemplates,
    addLabTemplate,
    updateLabTemplate,
    deleteLabTemplate,
    resetLabTemplatesToOfficial,
  } = useMedicalStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Formulario local de plantilla
  const [formData, setFormData] = useState<Omit<LabOrderTemplate, "id">>({
    title: "",
    category: "Anatomía Patológica",
    templateType: "BIOPSIA",
    sampleType: "",
    fixativeTransport: "",
    suggestedDiagnosis: "",
    cie10Code: "",
    defaultTests: [""],
    clinicalNotes: "",
    isOfficial: false,
  });

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setEditingId(null);
    setFormData({
      title: "",
      category: "Personalizada",
      templateType: "CUSTOM",
      sampleType: "Tejido / Muestra biológica en frasco estéril",
      fixativeTransport: "Formol tamponado 10% / Medio adecuado",
      suggestedDiagnosis: "Evaluación diagnóstica especializada",
      cie10Code: "Z01.4",
      defaultTests: ["Estudio histopatológico / citológico de rutina"],
      clinicalNotes: "Instrucciones clínicas para el procesamiento de la muestra.",
      isOfficial: false,
    });
    setIsEditing(true);
  };

  const handleStartEdit = (template: LabOrderTemplate) => {
    setEditingId(template.id);
    setFormData({
      title: template.title,
      category: template.category,
      templateType: template.templateType,
      sampleType: template.sampleType,
      fixativeTransport: template.fixativeTransport,
      suggestedDiagnosis: template.suggestedDiagnosis,
      cie10Code: template.cie10Code || "",
      defaultTests: template.defaultTests && template.defaultTests.length > 0 ? template.defaultTests : [""],
      clinicalNotes: template.clinicalNotes,
      isOfficial: template.isOfficial || false,
    });
    setIsEditing(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Título requerido",
        text: "Por favor ingrese un título descriptivo para la plantilla.",
      });
      return;
    }

    const cleanTests = formData.defaultTests.filter((t) => t.trim().length > 0);
    const payload = {
      ...formData,
      defaultTests: cleanTests.length > 0 ? cleanTests : ["Evaluación diagnóstica estándar"],
    };

    if (editingId) {
      updateLabTemplate(editingId, payload);
      Swal.fire({
        icon: "success",
        title: "Plantilla Actualizada",
        text: "Los cambios se sincronizaron en la base de datos.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      addLabTemplate(payload);
      Swal.fire({
        icon: "success",
        title: "Nueva Plantilla Creada",
        text: "La plantilla ya está disponible para emitir formatos de envío.",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    setIsEditing(false);
    setEditingId(null);
  };

  const handleDelete = (template: LabOrderTemplate) => {
    Swal.fire({
      title: `¿Eliminar "${template.title}"?`,
      text: "Esta plantilla dejará de estar disponible en los selectores rápidos.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deleteLabTemplate(template.id);
        Swal.fire({
          icon: "success",
          title: "Eliminada",
          text: "Plantilla removida del catálogo.",
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleResetOfficial = () => {
    Swal.fire({
      title: "¿Restablecer Plantillas Oficiales CENDO?",
      text: "Se restaurarán los 5 formatos clínicos maestros (PAP, Biopsias, Tru-Cut Mamario, Panel ITS y Líquido Peritoneal).",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0A4D68",
      confirmButtonText: "Sí, restablecer",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        resetLabTemplatesToOfficial();
        Swal.fire({
          icon: "success",
          title: "Formatos Restablecidos",
          text: "Los 5 formatos oficiales CENDO están 100% operativos.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cabecera del Gestor */}
        <div className="p-4 sm:p-5 border-b border-border bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 flex items-center justify-center shadow-2xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-base text-heading">
                  Gestor de Formatos & Plantillas de Envío
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-100 text-teal-800 border border-teal-300">
                  CENDO Laboratorio
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                Cree, personalice o configure los formatos de toma y envío de muestras a citología, patología y biología molecular.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:text-heading hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/40">
          {!isEditing ? (
            <div className="space-y-4">
              {/* Barra de Acciones de Lista */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-border shadow-2xs">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Plantillas de Envío Disponibles ({labTemplates.length})
                  </span>
                  <span className="text-[11px] text-muted">
                    Seleccione una para pre-llenar la orden o edite sus parámetros por defecto.
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetOfficial}
                    className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Restablecer los 5 formatos clínicos maestros de CENDO"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restablecer Oficiales</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleStartCreate}
                    className="px-3.5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nueva Plantilla</span>
                  </button>
                </div>
              </div>

              {/* Lista de Tarjetas de Plantillas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labTemplates.map((template) => {
                  const badge = TEMPLATE_TYPE_BADGES[template.templateType] || TEMPLATE_TYPE_BADGES.CUSTOM;
                  const icon = TEMPLATE_TYPE_ICONS[template.templateType] || <FileText className="w-4 h-4" />;

                  return (
                    <div
                      key={template.id}
                      className="p-4 rounded-xl bg-white border border-border shadow-2xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 shrink-0">
                              {icon}
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badge.color}`}>
                              {badge.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(template)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-teal-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Editar plantilla"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(template)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Eliminar plantilla"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <h4 className="font-heading font-extrabold text-sm text-heading leading-snug">
                          {template.title}
                        </h4>

                        <p className="text-xs text-muted line-clamp-2">
                          {template.suggestedDiagnosis} {template.cie10Code ? `(CIE-10: ${template.cie10Code})` : ""}
                        </p>

                        <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                          <div>
                            <strong className="text-slate-600 font-bold">Muestra: </strong>
                            <span className="text-slate-700">{template.sampleType}</span>
                          </div>
                          <div>
                            <strong className="text-slate-600 font-bold">Fijación: </strong>
                            <span className="text-slate-700">{template.fixativeTransport}</span>
                          </div>
                        </div>

                        {/* Chips de Estudios */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {template.defaultTests.slice(0, 2).map((test, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-700 text-[10px] truncate max-w-[200px]"
                            >
                              &bull; {test}
                            </span>
                          ))}
                          {template.defaultTests.length > 2 && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold">
                              +{template.defaultTests.length - 2} más
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Botón Aplicar en Formulario */}
                      {onSelectTemplate && (
                        <div className="pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              onSelectTemplate(template);
                              onClose();
                            }}
                            className="w-full py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                            <span>Usar Este Formato en la Orden</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Formulario de Creación / Edición */
            <form onSubmit={handleSaveForm} className="space-y-4 bg-white p-5 rounded-2xl border border-border shadow-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="font-heading font-extrabold text-sm text-heading flex items-center gap-2">
                  <Edit2 className="w-4 h-4 text-teal-700" />
                  <span>{editingId ? "Editar Formato de Envío" : "Nuevo Formato de Envío"}</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-muted hover:text-heading cursor-pointer font-semibold"
                >
                  Cancelar Edición
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Título de la Plantilla / Formato *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej. Biopsia Mamaria Tru-Cut"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Tipo de Formato
                  </label>
                  <select
                    value={formData.templateType}
                    onChange={(e) => setFormData({ ...formData, templateType: e.target.value as LabTemplateType })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="PAP">Papanicolaou / Citología</option>
                    <option value="BIOPSIA">Biopsia / Anatomía Patológica</option>
                    <option value="TRUCUT">Biopsia Tru-Cut Mamaria</option>
                    <option value="ITS">Panel Molecular ITS por PCR</option>
                    <option value="PERITONEAL">Líquido Peritoneal / Quirúrgico</option>
                    <option value="CUSTOM">Personalizada</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Tipo de Muestra Biológica *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.sampleType}
                    onChange={(e) => setFormData({ ...formData, sampleType: e.target.value })}
                    placeholder="Ej. Tejido en cuña / Hisopado endocervical"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Medio de Fijación & Transporte *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fixativeTransport}
                    onChange={(e) => setFormData({ ...formData, fixativeTransport: e.target.value })}
                    placeholder="Ej. Formol tamponado 10% / Frasco estéril"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Diagnóstico Clínico Sugerido
                  </label>
                  <input
                    type="text"
                    value={formData.suggestedDiagnosis}
                    onChange={(e) => setFormData({ ...formData, suggestedDiagnosis: e.target.value })}
                    placeholder="Ej. Nódulo mamario sospechoso"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Código CIE-10 Sugerido
                  </label>
                  <input
                    type="text"
                    value={formData.cie10Code}
                    onChange={(e) => setFormData({ ...formData, cie10Code: e.target.value })}
                    placeholder="Ej. N63"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Lista de Estudios Solicitados */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase text-slate-500 block">
                  Estudios Solicitados por Defecto (Uno por línea)
                </label>
                {formData.defaultTests.map((test, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={test}
                      onChange={(e) => {
                        const updated = [...formData.defaultTests];
                        updated[idx] = e.target.value;
                        setFormData({ ...formData, defaultTests: updated });
                      }}
                      placeholder={`Estudio ${idx + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                    {formData.defaultTests.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = formData.defaultTests.filter((_, i) => i !== idx);
                          setFormData({ ...formData, defaultTests: updated });
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, defaultTests: [...formData.defaultTests, ""] })}
                  className="text-xs text-teal-700 font-bold hover:underline flex items-center gap-1 cursor-pointer pt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Agregar otro estudio</span>
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Instrucciones Clínicas y Preparación
                </label>
                <textarea
                  rows={2}
                  value={formData.clinicalNotes}
                  onChange={(e) => setFormData({ ...formData, clinicalNotes: e.target.value })}
                  placeholder="Instrucciones para el patólogo o cuidados de la paciente..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingId ? "Guardar Cambios" : "Crear Plantilla"}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border bg-slate-50 flex items-center justify-between text-xs text-muted">
          <span>Centro de Endometriosis & Ginecología CENDO</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
