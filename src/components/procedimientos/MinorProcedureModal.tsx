"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Scissors,
  CheckCircle,
  Printer,
  MessageCircle,
  Sparkles,
  AlertTriangle,
  FileText,
} from "lucide-react";
import {
  Patient,
  DoctorProfile,
  MinorProcedureReport,
  ProcedureType,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateMinorProcedureWhatsAppUrl } from "@/lib/whatsappShare";

interface MinorProcedureModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  procedureToEdit?: MinorProcedureReport | null;
  onSavedAndPrint?: (proc: MinorProcedureReport) => void;
}

const PROCEDURE_OPTIONS: { id: ProcedureType; label: string }[] = [
  { id: "BIOPSIA_CERVICAL", label: "Biopsia Cervical Dirigida por Colposcopía" },
  { id: "BIOPSIA_ENDOMETRIAL", label: "Biopsia Endometrial con Cánula de Pipelle de Cornier" },
  { id: "CONO_LEEP", label: "Cono LEEP con Asa Diatérmica (Resección Cervical)" },
  { id: "POLIPECTOMIA", label: "Polipectomía Cervical / Endocervical" },
  { id: "INSERCION_DIU", label: "Inserción de DIU / SIU (Mirena / Kyleena / T de Cobre)" },
  { id: "RETIRO_DIU", label: "Retiro de DIU / SIU" },
  { id: "INSERCION_IMPLANTE", label: "Inserción de Implante Subdérmico (Nexplanon)" },
  { id: "RETIRO_IMPLANTE", label: "Retiro de Implante Subdérmico" },
  { id: "OTRO", label: "Otro Procedimiento Menor Ginecológico" },
];

const PRESET_INDICATIONS: Record<ProcedureType, string> = {
  BIOPSIA_CERVICAL: `1. No realizar esfuerzos físicos intensos por 72 horas.
2. Abstinencia sexual estricta por 7 a 10 días.
3. No utilizar tampones ni duchas vaginales.
4. Es normal observar un flujo oscuro o grumos color café (efecto de la solución de Monsel).
5. Acudir por emergencia ante sangrado mayor a regla o fiebre > 38°C.`,
  BIOPSIA_ENDOMETRIAL: `1. Reposo relativo por 24 horas.
2. Abstinencia sexual por 5 días.
3. Leve cólico tipo menstrual es esperado durante las primeras 12 a 24 horas.
4. Manchado escaso por 2 a 3 días.`,
  CONO_LEEP: `1. Reposo en domicilio por 48 a 72 horas (evitar subir escaleras bruscamente y cargar peso).
2. Abstinencia sexual absoluta por 4 a 6 semanas (hasta cicatrización de lecho cervical).
3. No realizar inmersión en tinas ni piscinas.
4. Flujo serosanguinolento o café amarillento es normal durante las primeras semanas.
5. Tomar medicación analgésica y antibiótica según prescripción.`,
  POLIPECTOMIA: `1. Reposo relativo por 24 horas.
2. Abstinencia sexual por 7 días.
3. Acudir al consultorio para entrega del resultado de patología.`,
  INSERCION_DIU: `1. Abstinencia sexual por 48 horas tras colocación.
2. Es esperable spotting (manchado intermitente) los primeros 2 a 3 meses.
3. Acudir a control ecográfico en 4 semanas para verificar ubicación de vástago.`,
  RETIRO_DIU: `1. Continuar con método anticonceptivo alternativo de inmediato si no desea gestación.
2. Vida habitual sin restricciones.`,
  INSERCION_IMPLANTE: `1. Mantener vendaje compresivo por 24 horas y curita por 3 a 5 días limpia y seca.
2. No masajear la zona del implante.
3. Protección anticonceptiva efectiva inmediata o uso de condón por 7 días si se colocó fuera de menstruación.`,
  RETIRO_IMPLANTE: `1. Mantener herida limpia y seca con vendaje por 24 horas.
2. La fertilidad se reanuda de inmediato tras la extracción.`,
  OTRO: `1. Reposo relativo según indicación médica.
2. Mantener la zona limpia y seca.
3. Acudir a control programado en consultorio.`,
};

export function MinorProcedureModal({
  isOpen,
  onClose,
  patient,
  procedureToEdit,
  onSavedAndPrint,
}: MinorProcedureModalProps) {
  const { doctorProfile, addMinorProcedure, updateMinorProcedure } = useMedicalStore();

  const [procedureDate, setProcedureDate] = useState("");
  const [procedureType, setProcedureType] = useState<ProcedureType>("BIOPSIA_CERVICAL");
  const [preOpDiagnosis, setPreOpDiagnosis] = useState("");
  const [postOpDiagnosis, setPostOpDiagnosis] = useState("");
  const [cie10Code, setCie10Code] = useState("");
  const [anesthesiaType, setAnesthesiaType] = useState<"Local (Lidocaína 2%)" | "Sedación" | "Sin Anestesia" | "Tópica">("Local (Lidocaína 2%)");

  // Detalles quirúrgicos
  const [asepsisTechnique, setAsepsisTechnique] = useState("Asepsia y antisepsia vulvovaginal con solución yodopovidona al 10%. Campos estériles descartables.");
  const [biopsySites, setBiopsySites] = useState("");
  const [specimenSentToPathology, setSpecimenSentToPathology] = useState(true);
  const [specimenDescription, setSpecimenDescription] = useState("");
  const [bleedingAmount, setBleedingAmount] = useState<"Mínimo (< 10 ml)" | "Escaso" | "Moderado">("Mínimo (< 10 ml)");
  const [hemostasisMethod, setHemostasisMethod] = useState<"Solución de Monsel" | "Electrocoagulación" | "Compresión" | "Sutura">("Solución de Monsel");
  const [complications, setComplications] = useState("Ninguna durante ni inmediatamente posterior al procedimiento.");

  // Postoperatorio
  const [postOpIndications, setPostOpIndications] = useState("");
  const [medicationsPrescribed, setMedicationsPrescribed] = useState("");
  const [nextControlDate, setNextControlDate] = useState("");

  useEffect(() => {
    if (procedureToEdit) {
      setProcedureDate(procedureToEdit.procedureDate);
      setProcedureType(procedureToEdit.procedureType);
      setPreOpDiagnosis(procedureToEdit.preOpDiagnosis);
      setPostOpDiagnosis(procedureToEdit.postOpDiagnosis);
      setCie10Code(procedureToEdit.cie10Code || "");
      setAnesthesiaType(procedureToEdit.anesthesiaType);
      setAsepsisTechnique(procedureToEdit.procedureDetails.asepsisTechnique);
      setBiopsySites(procedureToEdit.procedureDetails.biopsySites || "");
      setSpecimenSentToPathology(procedureToEdit.procedureDetails.specimenSentToPathology);
      setSpecimenDescription(procedureToEdit.procedureDetails.specimenDescription || "");
      setBleedingAmount(procedureToEdit.procedureDetails.bleedingAmount);
      setHemostasisMethod(procedureToEdit.procedureDetails.hemostasisMethod);
      setComplications(procedureToEdit.procedureDetails.complications || "Ninguna.");
      setPostOpIndications(procedureToEdit.postOpIndications);
      setMedicationsPrescribed(procedureToEdit.medicationsPrescribed || "");
      setNextControlDate(procedureToEdit.nextControlDate || "");
    } else {
      setProcedureDate(new Date().toISOString().split("T")[0]);
      setProcedureType("BIOPSIA_CERVICAL");
      setPreOpDiagnosis("Sospecha colposcópica de lesión cervical / LIE");
      setPostOpDiagnosis("Biopsia cervical dirigida tomada con pinza Tischler-Morgan");
      setCie10Code("N87.1");
      setAnesthesiaType("Local (Lidocaína 2%)");
      setAsepsisTechnique("Asepsia y antisepsia vulvovaginal con solución yodopovidona al 10%. Campos estériles descartables.");
      setBiopsySites("Cérvix labio anterior hora 12:00 y posterior hora 6:00.");
      setSpecimenSentToPathology(true);
      setSpecimenDescription("Fragmentos tisulares de cérvix en formol al 10% rotulados Biopsia Cervical CENDO.");
      setBleedingAmount("Mínimo (< 10 ml)");
      setHemostasisMethod("Solución de Monsel");
      setComplications("Ninguna. Procedimiento tolerado adecuadamente.");
      setPostOpIndications(PRESET_INDICATIONS.BIOPSIA_CERVICAL);
      setMedicationsPrescribed("Paracetamol 500 mg vía oral cada 8 horas por 48 horas condicional al dolor.");
      setNextControlDate("");
    }
  }, [procedureToEdit, isOpen]);

  // Al cambiar tipo de procedimiento en modo nuevo, actualizar plantillas de indicaciones
  const handleTypeChange = (newType: ProcedureType) => {
    setProcedureType(newType);
    if (!procedureToEdit) {
      setPostOpIndications(PRESET_INDICATIONS[newType] || PRESET_INDICATIONS.OTRO);
      if (newType === "INSERCION_DIU" || newType === "RETIRO_DIU" || newType === "INSERCION_IMPLANTE" || newType === "RETIRO_IMPLANTE") {
        setSpecimenSentToPathology(false);
        setSpecimenDescription("");
      } else {
        setSpecimenSentToPathology(true);
      }
    }
  };

  if (!isOpen) return null;

  const handleSave = (shouldPrint = false) => {
    if (!postOpDiagnosis.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Diagnóstico Requerido",
        text: "Por favor ingrese el diagnóstico post-operatorio del procedimiento.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const payload = {
      patientId: patient.id,
      doctorId: doctorProfile.id,
      doctorName: `${doctorProfile.doctorTitle} ${doctorProfile.fullName}`,
      doctorCmp: doctorProfile.cmp,
      doctorRne: doctorProfile.rne || undefined,
      procedureDate: procedureDate || new Date().toISOString().split("T")[0],
      procedureType,
      preOpDiagnosis: preOpDiagnosis.trim(),
      postOpDiagnosis: postOpDiagnosis.trim(),
      cie10Code: cie10Code.trim() || undefined,
      anesthesiaType,
      procedureDetails: {
        asepsisTechnique: asepsisTechnique.trim(),
        biopsySites: biopsySites.trim() || undefined,
        specimenSentToPathology,
        specimenDescription: specimenDescription.trim() || undefined,
        bleedingAmount,
        hemostasisMethod,
        complications: complications.trim(),
      },
      postOpIndications: postOpIndications.trim(),
      medicationsPrescribed: medicationsPrescribed.trim() || undefined,
      nextControlDate: nextControlDate || undefined,
    };

    let result: MinorProcedureReport;
    if (procedureToEdit) {
      updateMinorProcedure(procedureToEdit.id, payload);
      result = { ...procedureToEdit, ...payload, updatedAt: new Date().toISOString() };
      Swal.fire({
        icon: "success",
        title: "Procedimiento Actualizado",
        text: "El protocolo quirúrgico menor ha sido actualizado y sincronizado.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      result = addMinorProcedure(payload);
      Swal.fire({
        icon: "success",
        title: "Procedimiento Registrado",
        text: "El protocolo de procedimiento menor ha sido guardado exitosamente.",
        timer: 1500,
        showConfirmButton: false,
      });
    }

    onClose();
    if (shouldPrint && onSavedAndPrint) {
      onSavedAndPrint(result);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera */}
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-sm">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                {procedureToEdit ? "Editar Procedimiento Menor" : "Nuevo Procedimiento Menor & Protocolo de Biopsia"}
              </h2>
              <p className="text-xs text-muted">
                Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted hover:text-heading hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Tipo y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 space-y-1">
              <label className="font-bold text-heading block">Tipo de Procedimiento *</label>
              <select
                value={procedureType}
                onChange={(e) => handleTypeChange(e.target.value as ProcedureType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-rose-600 focus:bg-white focus:outline-none"
              >
                {PROCEDURE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="font-bold text-heading block">Fecha de Realización *</label>
              <input
                type="date"
                value={procedureDate}
                onChange={(e) => setProcedureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-rose-600 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Diagnósticos Pre y Post */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-6 space-y-1">
              <label className="font-semibold text-slate-700 block">Diagnóstico Preoperatorio</label>
              <input
                type="text"
                value={preOpDiagnosis}
                onChange={(e) => setPreOpDiagnosis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-4 space-y-1">
              <label className="font-bold text-slate-900 block">Diagnóstico Postoperatorio *</label>
              <input
                type="text"
                value={postOpDiagnosis}
                onChange={(e) => setPostOpDiagnosis(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-rose-300 text-xs font-bold text-rose-950 focus:border-rose-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 block">CIE-10</label>
              <input
                type="text"
                value={cie10Code}
                onChange={(e) => setCie10Code(e.target.value)}
                placeholder="Ej: N87.1"
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold uppercase focus:border-rose-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Protocolo Quirúrgico */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-heading text-rose-950">
              Protocolo Operatorio y Técnica
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Anestesia</label>
                <select
                  value={anesthesiaType}
                  onChange={(e) => setAnesthesiaType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                >
                  <option value="Local (Lidocaína 2%)">Local (Lidocaína 2%)</option>
                  <option value="Sedación">Sedación</option>
                  <option value="Sin Anestesia">Sin Anestesia</option>
                  <option value="Tópica">Tópica</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Sangrado</label>
                <select
                  value={bleedingAmount}
                  onChange={(e) => setBleedingAmount(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                >
                  <option value="Mínimo (< 10 ml)">Mínimo (&lt; 10 ml)</option>
                  <option value="Escaso">Escaso</option>
                  <option value="Moderado">Moderado</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Hemostasia</label>
                <select
                  value={hemostasisMethod}
                  onChange={(e) => setHemostasisMethod(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                >
                  <option value="Solución de Monsel">Solución de Monsel</option>
                  <option value="Electrocoagulación">Electrocoagulación</option>
                  <option value="Compresión">Compresión</option>
                  <option value="Sutura">Sutura</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">¿Muestra a Patología?</label>
                <select
                  value={specimenSentToPathology ? "si" : "no"}
                  onChange={(e) => setSpecimenSentToPathology(e.target.value === "si")}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-rose-800 focus:border-rose-600"
                >
                  <option value="si">Sí, enviada</option>
                  <option value="no">No requerida</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Técnica de Asepsia & Antisepsia</label>
                <input
                  type="text"
                  value={asepsisTechnique}
                  onChange={(e) => setAsepsisTechnique(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Sitio de Biopsia / Zona de Resección</label>
                <input
                  type="text"
                  value={biopsySites}
                  onChange={(e) => setBiopsySites(e.target.value)}
                  placeholder="Ej: Labio anterior hora 1:00 y posterior hora 7:00..."
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                />
              </div>

              {specimenSentToPathology && (
                <div className="sm:col-span-2 space-y-1 p-2.5 rounded-lg bg-amber-50/70 border border-amber-200">
                  <label className="font-bold text-amber-950 block">Descripción y Rotulación del Espécimen</label>
                  <input
                    type="text"
                    value={specimenDescription}
                    onChange={(e) => setSpecimenDescription(e.target.value)}
                    placeholder="Ej: Dos fragmentos en formol al 10% rotulados Biopsia Cervical CENDO..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                  />
                </div>
              )}

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 block">Complicaciones</label>
                <input
                  type="text"
                  value={complications}
                  onChange={(e) => setComplications(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Cuidados Postoperatorios */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-heading text-rose-950">
              Cuidados e Indicaciones Post-Procedimiento
            </h3>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 block">Indicaciones para la Paciente *</label>
              <textarea
                rows={4}
                value={postOpIndications}
                onChange={(e) => setPostOpIndications(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-rose-600 font-mono leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Medicación Farmacológica</label>
                <input
                  type="text"
                  value={medicationsPrescribed}
                  onChange={(e) => setMedicationsPrescribed(e.target.value)}
                  placeholder="Ej: Paracetamol 500 mg c/8h x 48h con alimentos..."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-rose-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Próximo Control en Consultorio</label>
                <input
                  type="date"
                  value={nextControlDate}
                  onChange={(e) => setNextControlDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:border-rose-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {patient && postOpDiagnosis && (
              <button
                type="button"
                onClick={() => {
                  const tempProc: MinorProcedureReport = {
                    id: procedureToEdit ? procedureToEdit.id : "temp-proc",
                    patientId: patient.id,
                    doctorId: doctorProfile.id,
                    doctorName: doctorProfile.fullName,
                    doctorCmp: doctorProfile.cmp,
                    doctorRne: doctorProfile.rne,
                    procedureDate: procedureDate || new Date().toISOString().split("T")[0],
                    procedureType,
                    preOpDiagnosis,
                    postOpDiagnosis,
                    cie10Code,
                    anesthesiaType,
                    procedureDetails: {
                      asepsisTechnique,
                      biopsySites,
                      specimenSentToPathology,
                      specimenDescription,
                      bleedingAmount,
                      hemostasisMethod,
                      complications,
                    },
                    postOpIndications,
                    medicationsPrescribed,
                    nextControlDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  const url = generateMinorProcedureWhatsAppUrl(patient, tempProc, doctorProfile);
                  window.open(url, "_blank");
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar e Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{procedureToEdit ? "Guardar Cambios" : "Guardar Procedimiento"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

