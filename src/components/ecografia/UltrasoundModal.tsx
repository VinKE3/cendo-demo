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
  Camera,
  Upload,
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
import { getPeruDateString } from "@/lib/utils";
import { compressImageFile } from "@/lib/imageCompressor";
import { uploadClinicalImageToSupabase } from "@/lib/supabaseStorage";

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

  // Galería de fotos ecográficas
  const [images, setImages] = useState<{ url: string; caption: string }[]>([]);

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
      setReportDate(getPeruDateString());
      setUltrasoundType("TRANSVAGINAL");
      setIndication("Evaluación ginecológica rutinaria / Dolor pélvico");
      setConclusion("Útero y anexos dentro de límites ecográficos normales.");
      setRecommendations("Control preventivo ginecológico en 12 meses.");
      setImages([]);
    }
  }, [reportToEdit, isOpen]);

  if (!isOpen) return null;

  const [isUploading, setIsUploading] = useState(false);

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const newUploads: { url: string; caption: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        // 1. Compresión inteligente en el navegador (reduce archivos de ~6 MB a ~180 KB)
        const compressed = await compressImageFile(file, {
          maxWidth: 1280,
          maxHeight: 960,
          quality: 0.82,
        });

        // 2. Almacenamiento seguro en Supabase con fallback a dataUrl
        const storageResult = await uploadClinicalImageToSupabase(compressed.dataUrl, {
          folder: "ecografias",
          prefix: `echo_${patient?.id || "paciente"}`,
        });

        const finalUrl = storageResult.isRemote ? storageResult.url : compressed.dataUrl;

        // Limpiar el nombre del archivo para epígrafe sugerido
        const rawName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
        const autoCaption = rawName.length > 2 ? rawName : `Captura ecográfica ${images.length + newUploads.length + 1}`;

        newUploads.push({
          url: finalUrl,
          caption: autoCaption,
        });
      }

      setImages((prev) => [...prev, ...newUploads]);

      Swal.fire({
        icon: "success",
        title: "Capturas Procesadas",
        text: `Se agregaron ${newUploads.length} imágenes ecográficas optimizadas.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al procesar fotos",
        text: "No se pudieron optimizar o subir las fotos seleccionadas.",
        confirmButtonColor: "#0A4D68",
      });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleSingleImageReplace = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 960,
        quality: 0.82,
      });

      const storageResult = await uploadClinicalImageToSupabase(compressed.dataUrl, {
        folder: "ecografias",
        prefix: `echo_${patient?.id || "paciente"}`,
      });

      const finalUrl = storageResult.isRemote ? storageResult.url : compressed.dataUrl;

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          url: finalUrl,
        };
        return updated;
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la imagen.",
        confirmButtonColor: "#0A4D68",
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleCaptionChange = (index: number, newCaption: string) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], caption: newCaption };
      return updated;
    });
  };

  const handleLoadSampleImages = () => {
    const samplePhotos = [
      {
        url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
        caption: "Corte longitudinal uterino: Miometrio homogéneo",
      },
      {
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
        caption: "Endometrio trilaminar fase proliferativa avanzada",
      },
      {
        url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
        caption: "Ovario izquierdo con patrón folicular normal",
      },
    ];
    setImages((prev) => [...prev, ...samplePhotos]);
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
      reportDate: reportDate || getPeruDateString(),
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

          {/* Imágenes y Capturas Ecográficas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div>
                <h3 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
                  <Camera className="w-4 h-4 text-teal-600" />
                  Capturas e Imágenes Ecográficas ({images.length})
                </h3>
                <p className="text-[11px] text-muted mt-0.5">
                  Suba capturas directas del ecógrafo desde su PC o dispositivo (JPEG, PNG). Se optimizan automáticamente para no saturar el informe.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {images.length === 0 && (
                  <button
                    type="button"
                    onClick={handleLoadSampleImages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    title="Cargar imágenes ecográficas de muestra"
                  >
                    <span>Cargar Muestras</span>
                  </button>
                )}

                <label className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95 shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? "Procesando..." : "+ Subir Fotos desde PC"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={isUploading}
                    onChange={handleMultipleFilesUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Zona de Drop / Carga Rápida si no hay imágenes */}
            {images.length === 0 && (
              <label className="p-8 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl bg-teal-50/30 hover:bg-teal-50/50 flex flex-col items-center justify-center text-center transition-all cursor-pointer group">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  <Camera className="w-6 h-6" />
                </div>
                <p className="text-xs font-heading font-bold text-teal-900">
                  Haga clic para seleccionar fotos o capturas del ecógrafo
                </p>
                <p className="text-[11px] text-muted mt-1">
                  Puede seleccionar varios archivos a la vez (JPG, PNG, WebP). Optimización automática instantánea.
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={isUploading}
                  onChange={handleMultipleFilesUpload}
                  className="hidden"
                />
              </label>
            )}

            {/* Grid de Imágenes Cargadas */}
            {images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-2xs hover:border-teal-400 transition-all flex flex-col justify-between"
                  >
                    <div className="relative aspect-4/3 bg-slate-900 overflow-hidden group">
                      <img
                        src={img.url}
                        alt={img.caption || `Captura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white font-mono text-[10px] font-bold">
                        Foto #{idx + 1}
                      </div>

                      {/* Botones Flotantes en Hover */}
                      <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                        <label
                          className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white transition-colors cursor-pointer"
                          title="Reemplazar esta captura con otra imagen"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSingleImageReplace(idx, e)}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                          title="Eliminar captura"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white space-y-1 border-t border-slate-100">
                      <label className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                        Pie de Foto / Hallazgo:
                      </label>
                      <input
                        type="text"
                        value={img.caption}
                        onChange={(e) => handleCaptionChange(idx, e.target.value)}
                        placeholder="ej. Útero en AVF, Endometrio trilaminar..."
                        className="w-full text-xs font-medium px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:border-teal-600 focus:outline-none"
                      />
                    </div>
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
                    reportDate: reportDate || getPeruDateString(),
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

