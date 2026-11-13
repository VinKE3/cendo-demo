"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Activity,
  Calendar,
  CheckCircle,
  Printer,
  MessageCircle,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Patient,
  DoctorProfile,
  UltrasoundReport,
  UltrasoundType,
  UltrasoundFindings,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateUltrasoundWhatsAppUrl } from "@/lib/whatsappShare";

interface UltrasoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  reportToEdit?: UltrasoundReport | null;
  onSavedAndPrint?: (report: UltrasoundReport) => void;
}

const TYPE_OPTIONS: { id: UltrasoundType; label: string }[] = [
  { id: "TRANSVAGINAL", label: "Ecografía Transvaginal (Mapeo Ginecológico & Endometriosis)" },
  { id: "PELVICA", label: "Ecografía Pélvica Suprapúbica" },
  { id: "MAMA_BILATERAL", label: "Ecografía Mamaria Bilateral (Clasificación BI-RADS)" },
  { id: "OBSTETRICA_1T", label: "Ecografía Obstétrica del 1er Trimestre (Viabilidad Fetal)" },
  { id: "OBSTETRICA_2T_3T", label: "Ecografía Obstétrica Morfológica / 2do-3er Trimestre" },
  { id: "DOPPLER", label: "Ecografía Doppler Ginecológico Color de Alta Resolución" },
];

export function UltrasoundModal({
  isOpen,
  onClose,
  patient,
  reportToEdit,
  onSavedAndPrint,
}: UltrasoundModalProps) {
  const { doctorProfile, addUltrasoundReport, updateUltrasoundReport } = useMedicalStore();

  const [reportDate, setReportDate] = useState("");
  const [ultrasoundType, setUltrasoundType] = useState<UltrasoundType>("TRANSVAGINAL");
  const [indication, setIndication] = useState("");

  // Ginecológica
  const [uterusPosition, setUterusPosition] = useState<"AVF" | "RVF" | "Indiferente">("AVF");
  const [uterusDimensions, setUterusDimensions] = useState("75 x 42 x 48 mm");
  const [uterusVolumeCc, setUterusVolumeCc] = useState<number>(78);
  const [myometriumStatus, setMyometriumStatus] = useState("Homogéneo, sin lesiones focales miometriales.");
  const [endometriumThicknessMm, setEndometriumThicknessMm] = useState<number>(7.2);
  const [endometriumPattern, setEndometriumPattern] = useState<"Trilaminar" | "Secretor" | "Atrófico" | "Engrosado irregular">("Secretor");
  const [rightOvaryDimensions, setRightOvaryDimensions] = useState("30 x 20 mm, estroma conservado.");
  const [leftOvaryDimensions, setLeftOvaryDimensions] = useState("29 x 19 mm, folículos normales.");
  const [ovariesNotes, setOvariesNotes] = useState("");
  const [douglasPouch, setDouglasPouch] = useState("Libre. Signo de deslizamiento (sliding sign) POSITIVO.");

  // Mama
  const [breastPattern, setBreastPattern] = useState("Parénquima fibroglandular de distribución homogénea.");
  const [rightBreastFindings, setRightBreastFindings] = useState("Sin lesiones sólidas ni quísticas dominantes. Planos dérmicos respetados.");
  const [leftBreastFindings, setLeftBreastFindings] = useState("Sin lesiones nodulares. Sin microcalcificaciones agrupadas.");
  const [biradsCategory, setBiradsCategory] = useState<"BI-RADS 1" | "BI-RADS 2" | "BI-RADS 3" | "BI-RADS 4" | "BI-RADS 5">("BI-RADS 1");

  // Obstétrica
  const [gestationalSacsCount, setGestationalSacsCount] = useState<number>(1);
  const [embryoCrownRumpLengthMm, setEmbryoCrownRumpLengthMm] = useState<number>(10);
  const [gestationalAgeByEcho, setGestationalAgeByEcho] = useState("7 semanas 0 días");
  const [fetalHeartRate, setFetalHeartRate] = useState<number>(145);
  const [placentaLocation, setPlacentaLocation] = useState("Cara posterior normoinserta.");

  // Conclusión & Recomendaciones
  const [conclusion, setConclusion] = useState("");
  const [recommendations, setRecommendations] = useState("");

  // Galería de fotos
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageCaption, setNewImageCaption] = useState("");

  useEffect(() => {
    if (reportToEdit) {
      setReportDate(reportToEdit.reportDate);
      setUltrasoundType(reportToEdit.ultrasoundType);
      setIndication(reportToEdit.indication);
      const f = reportToEdit.findings;
      if (f.uterusPosition) setUterusPosition(f.uterusPosition);
      if (f.uterusDimensions) setUterusDimensions(f.uterusDimensions);
      if (f.uterusVolumeCc) setUterusVolumeCc(f.uterusVolumeCc);
      if (f.myometriumStatus) setMyometriumStatus(f.myometriumStatus);
      if (f.endometriumThicknessMm) setEndometriumThicknessMm(f.endometriumThicknessMm);
      if (f.endometriumPattern) setEndometriumPattern(f.endometriumPattern);
      if (f.rightOvaryDimensions) setRightOvaryDimensions(f.rightOvaryDimensions);
      if (f.leftOvaryDimensions) setLeftOvaryDimensions(f.leftOvaryDimensions);
      if (f.ovariesNotes) setOvariesNotes(f.ovariesNotes);
      if (f.douglasPouch) setDouglasPouch(f.douglasPouch);
      if (f.breastPattern) setBreastPattern(f.breastPattern);
      if (f.rightBreastFindings) setRightBreastFindings(f.rightBreastFindings);
      if (f.leftBreastFindings) setLeftBreastFindings(f.leftBreastFindings);
      if (f.biradsCategory) setBiradsCategory(f.biradsCategory);
      if (f.gestationalSacsCount) setGestationalSacsCount(f.gestationalSacsCount);
      if (f.embryoCrownRumpLengthMm) setEmbryoCrownRumpLengthMm(f.embryoCrownRumpLengthMm);
      if (f.gestationalAgeByEcho) setGestationalAgeByEcho(f.gestationalAgeByEcho);
      if (f.fetalHeartRate) setFetalHeartRate(f.fetalHeartRate);
      if (f.placentaLocation) setPlacentaLocation(f.placentaLocation);
      setConclusion(reportToEdit.conclusion);
      setRecommendations(reportToEdit.recommendations || "");
      setImages(reportToEdit.images || []);
    } else {
      setReportDate(new Date().toISOString().split("T")[0]);
      setUltrasoundType("TRANSVAGINAL");
      setIndication("Evaluación ginecológica rutinaria / Dolor pélvico");
      setConclusion("Útero y anexos dentro de límites ecográficos normales.");
      setRecommendations("Control preventivo ginecológico en 12 meses.");
      setImages([]);
    }
  }, [reportToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages([...images, { url: newImageUrl.trim(), caption: newImageCaption.trim() }]);
    setNewImageUrl("");
    setNewImageCaption("");
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, idx) => idx !== index));
  };

  const handleSave = (shouldPrint = false) => {
    if (!conclusion.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Conclusión Requerida",
        text: "Por favor ingrese la conclusión diagnóstica de la ecografía.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const findings: UltrasoundFindings = {
      uterusPosition,
      uterusDimensions,
      uterusVolumeCc: Number(uterusVolumeCc) || undefined,
      myometriumStatus,
      endometriumThicknessMm: Number(endometriumThicknessMm) || undefined,
      endometriumPattern,
      rightOvaryDimensions,
      leftOvaryDimensions,
      ovariesNotes: ovariesNotes.trim() || undefined,
      douglasPouch: douglasPouch.trim() || undefined,
      breastPattern: breastPattern.trim() || undefined,
      rightBreastFindings: rightBreastFindings.trim() || undefined,
      leftBreastFindings: leftBreastFindings.trim() || undefined,
      biradsCategory: ultrasoundType === "MAMA_BILATERAL" ? biradsCategory : undefined,
      gestationalSacsCount: Number(gestationalSacsCount) || undefined,
      embryoCrownRumpLengthMm: Number(embryoCrownRumpLengthMm) || undefined,
      gestationalAgeByEcho: gestationalAgeByEcho.trim() || undefined,
      fetalHeartRate: Number(fetalHeartRate) || undefined,
      placentaLocation: placentaLocation.trim() || undefined,
    };

    const payload = {
      patientId: patient.id,
      doctorId: doctorProfile.id,
      doctorName: `${doctorProfile.doctorTitle} ${doctorProfile.fullName}`,
      doctorCmp: doctorProfile.cmp,
      doctorRne: doctorProfile.rne || undefined,
      reportDate: reportDate || new Date().toISOString().split("T")[0],
      ultrasoundType,
      indication: indication.trim(),
      findings,
      conclusion: conclusion.trim(),
      recommendations: recommendations.trim() || undefined,
      images,
    };

    let result: UltrasoundReport;
    if (reportToEdit) {
      updateUltrasoundReport(reportToEdit.id, payload);
      result = { ...reportToEdit, ...payload, updatedAt: new Date().toISOString() };
      Swal.fire({
        icon: "success",
        title: "Informe Actualizado",
        text: "El reporte ecográfico ha sido guardado y sincronizado.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      result = addUltrasoundReport(payload);
      Swal.fire({
        icon: "success",
        title: "Informe Guardado",
        text: "El nuevo reporte ecográfico ha sido creado exitosamente.",
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
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-teal-500/10 via-teal-500/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                {reportToEdit ? "Editar Informe Ecográfico" : "Nuevo Formato de Ecografía Especializada"}
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

        {/* Cuerpo */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Tipo de Ecografía y Fecha */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-8 space-y-1">
              <label className="font-bold text-heading block">Tipo de Examen Ecográfico *</label>
              <select
                value={ultrasoundType}
                onChange={(e) => setUltrasoundType(e.target.value as UltrasoundType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-teal-600 focus:bg-white focus:outline-none"
              >
                {TYPE_OPTIONS.map((opt) => (
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
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono focus:border-teal-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="md:col-span-12 space-y-1">
              <label className="font-semibold text-slate-700 block">Indicación Clínica / Motivo</label>
              <input
                type="text"
                placeholder="Ej: Mapeo especializado de endometriosis pélvica, sospecha de quiste ovárico, etc."
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Formulario Dinámico según Tipo */}
          {(ultrasoundType === "TRANSVAGINAL" ||
            ultrasoundType === "PELVICA" ||
            ultrasoundType === "DOPPLER") && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-heading font-bold text-sm text-heading text-teal-900">
                1. Biometría Uterina y Evaluación Miometrial
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Posición Útero</label>
                  <select
                    value={uterusPosition}
                    onChange={(e) => setUterusPosition(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  >
                    <option value="AVF">AVF (Anteversoflexión)</option>
                    <option value="RVF">RVF (Retroversoflexión)</option>
                    <option value="Indiferente">Indiferente / Neutro</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Dimensiones (L x AP x T)</label>
                  <input
                    type="text"
                    value={uterusDimensions}
                    onChange={(e) => setUterusDimensions(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Volumen (cc)</label>
                  <input
                    type="number"
                    value={uterusVolumeCc}
                    onChange={(e) => setUterusVolumeCc(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Endometrio (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={endometriumThicknessMm}
                    onChange={(e) => setEndometriumThicknessMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Patrón Endometrial</label>
                  <select
                    value={endometriumPattern}
                    onChange={(e) => setEndometriumPattern(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  >
                    <option value="Trilaminar">Trilaminar (Fase Proliferativa)</option>
                    <option value="Secretor">Secretor / Hiperecogénico</option>
                    <option value="Atrófico">Atrófico / Postmenopáusico</option>
                    <option value="Engrosado irregular">Engrosado irregular / Sospecha hiperplasia</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Estado del Miometrio</label>
                  <input
                    type="text"
                    value={myometriumStatus}
                    onChange={(e) => setMyometriumStatus(e.target.value)}
                    placeholder="Ej: Homogéneo o sugerente de adenomiosis focal posterior..."
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>
              </div>

              <h3 className="font-heading font-bold text-sm text-heading text-teal-900 pt-2 border-t border-slate-200">
                2. Evaluación de Anexos, Ovarios & Douglas
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Ovario Derecho (Medidas & Folículos)</label>
                  <input
                    type="text"
                    value={rightOvaryDimensions}
                    onChange={(e) => setRightOvaryDimensions(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Ovario Izquierdo (Medidas & Folículos)</label>
                  <input
                    type="text"
                    value={leftOvaryDimensions}
                    onChange={(e) => setLeftOvaryDimensions(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Endometriomas / Quistes / Flujo Doppler</label>
                  <textarea
                    rows={2}
                    value={ovariesNotes}
                    onChange={(e) => setOvariesNotes(e.target.value)}
                    placeholder="Describa presencia de quistes uniloculares en vidrio esmerilado, adherencias..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Fondo de Saco de Douglas (Signo de Deslizamiento)</label>
                  <input
                    type="text"
                    value={douglasPouch}
                    onChange={(e) => setDouglasPouch(e.target.value)}
                    placeholder="Ej: Sliding sign POSITIVO / NEGATIVO (obliterado por adherencias)"
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Formulario Mama Bilateral */}
          {ultrasoundType === "MAMA_BILATERAL" && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-heading font-bold text-sm text-heading text-teal-900">
                Evaluación Ecográfica Mamaria Bilateral
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-slate-700 block">Patrón Parenquimal Fibroglandular</label>
                  <input
                    type="text"
                    value={breastPattern}
                    onChange={(e) => setBreastPattern(e.target.value)}
                    placeholder="Ej: Parénquima fibroglandular difuso homogéneo / heterogéneo (Patrón C)"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Hallazgos Mama Derecha</label>
                  <textarea
                    rows={3}
                    value={rightBreastFindings}
                    onChange={(e) => setRightBreastFindings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">Hallazgos Mama Izquierda</label>
                  <textarea
                    rows={3}
                    value={leftBreastFindings}
                    onChange={(e) => setLeftBreastFindings(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <label className="font-bold text-emerald-950 block">Categoría BI-RADS Conclusiva *</label>
                  <select
                    value={biradsCategory}
                    onChange={(e) => setBiradsCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 focus:outline-none"
                  >
                    <option value="BI-RADS 1">BI-RADS 1: Examen Negativo / Mama Normal (Riesgo 0%)</option>
                    <option value="BI-RADS 2">BI-RADS 2: Hallazgos Benignos (Quistes simples, fibroadenoma estable) (Riesgo 0%)</option>
                    <option value="BI-RADS 3">BI-RADS 3: Probablemente Benigno (Control a 6 meses) (Riesgo &lt; 2%)</option>
                    <option value="BI-RADS 4">BI-RADS 4: Sospecha de Malignidad (Requiere Biopsia core) (Riesgo 2-95%)</option>
                    <option value="BI-RADS 5">BI-RADS 5: Altamente Sugerente de Malignidad (Riesgo &gt; 95%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Formulario Obstétrico */}
          {(ultrasoundType === "OBSTETRICA_1T" || ultrasoundType === "OBSTETRICA_2T_3T") && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h3 className="font-heading font-bold text-sm text-heading text-teal-900">
                Parámetros Biométricos Feto-Gestacionales
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">N° Sacos Gestacionales</label>
                  <input
                    type="number"
                    value={gestationalSacsCount}
                    onChange={(e) => setGestationalSacsCount(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">LCN / DBP (mm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={embryoCrownRumpLengthMm}
                    onChange={(e) => setEmbryoCrownRumpLengthMm(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">EG por Ecografía</label>
                  <input
                    type="text"
                    value={gestationalAgeByEcho}
                    onChange={(e) => setGestationalAgeByEcho(e.target.value)}
                    placeholder="Ej: 7 sem 3 d"
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 block">F.C.F. (lpm)</label>
                  <input
                    type="number"
                    value={fetalHeartRate}
                    onChange={(e) => setFetalHeartRate(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-teal-600"
                  />
                </div>

                <div className="sm:col-span-4 space-y-1">
                  <label className="font-semibold text-slate-700 block">Placenta y Líquido Amniótico</label>
                  <input
                    type="text"
                    value={placentaLocation}
                    onChange={(e) => setPlacentaLocation(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Conclusión y Recomendaciones */}
          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-teal-950">
              Conclusión Diagnóstica & Plan
            </h3>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Conclusiones del Informe *</label>
              <textarea
                rows={3}
                placeholder="1. Endometrioma ovárico izquierdo de 3.8 cm...\n2. Signo de deslizamiento negativo compatible con adherencias..."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold focus:border-teal-600 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 block">Recomendaciones / Sugerencias de Manejo</label>
              <textarea
                rows={2}
                placeholder="Correlación con RMN de pelvis de alta resolución o laparoscopía diagnóstica..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Imágenes Adjuntas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-teal-600" />
              Imágenes y Capturas Ecográficas ({images.length})
            </h3>

            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="URL de imagen (ej. Unsplash o Supabase Storage)..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
              />
              <input
                type="text"
                placeholder="Pie de foto (ej. Ovario izq. endometrioma 3.8cm)..."
                value={newImageCaption}
                onChange={(e) => setNewImageCaption(e.target.value)}
                className="sm:w-64 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-teal-600"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Foto</span>
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 group">
                    <img src={img.url} alt={img.caption} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {img.caption && (
                      <p className="text-[10px] text-white p-1 bg-black/60 truncate font-mono">{img.caption}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            {patient && conclusion && (
              <button
                type="button"
                onClick={() => {
                  const tempEcho: UltrasoundReport = {
                    id: reportToEdit ? reportToEdit.id : "temp-echo",
                    patientId: patient.id,
                    doctorId: doctorProfile.id,
                    doctorName: doctorProfile.fullName,
                    doctorCmp: doctorProfile.cmp,
                    doctorRne: doctorProfile.rne,
                    reportDate: reportDate || new Date().toISOString().split("T")[0],
                    ultrasoundType,
                    indication,
                    findings: {
                      uterusPosition,
                      uterusDimensions,
                      uterusVolumeCc,
                      myometriumStatus,
                      endometriumThicknessMm,
                      endometriumPattern,
                      rightOvaryDimensions,
                      leftOvaryDimensions,
                      ovariesNotes,
                      douglasPouch,
                      breastPattern,
                      rightBreastFindings,
                      leftBreastFindings,
                      biradsCategory,
                      gestationalSacsCount,
                      embryoCrownRumpLengthMm,
                      gestationalAgeByEcho,
                      fetalHeartRate,
                      placentaLocation,
                    },
                    conclusion,
                    recommendations,
                    images,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  const url = generateUltrasoundWhatsAppUrl(patient, tempEcho, doctorProfile);
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
              className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar e Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{reportToEdit ? "Guardar Cambios" : "Guardar Informe"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

