"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  X,
  Stethoscope,
  Activity,
  Calendar,
  CheckCircle,
  Printer,
  MessageCircle,
  FileText,
  User,
  HeartPulse,
  Sparkles,
} from "lucide-react";
import { Patient, DoctorProfile, MedicalConsultation } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateConsultationWhatsAppUrl } from "@/lib/whatsappShare";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  consultationToEdit?: MedicalConsultation | null;
  onSavedAndPrint?: (consultation: MedicalConsultation) => void;
}

const FREQUENT_DIAGNOSES = [
  { label: "Endometriosis pélvica profunda (N80.3)", code: "N80.3", text: "Endometriosis pélvica profunda infiltrante (ligamentos uterosacros y tabique rectovaginal)" },
  { label: "Endometrioma ovárico (N80.1)", code: "N80.1", text: "Endometrioma ovárico con dolor pélvico cíclico y dispareunia" },
  { label: "Adenomiosis uterina (N80.0)", code: "N80.0", text: "Adenomiosis uterina difusa con dismenorrea y menorragia" },
  { label: "Displasia Cervical NIC 2 / LIE-AG (N87.1)", code: "N87.1", text: "Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG) en cérvix uterino" },
  { label: "Displasia Cervical NIC 1 / LIE-BG (N87.0)", code: "N87.0", text: "Neoplasia Intraepitelial Cervical Grado 1 (NIC 1 / LIE-BG) asociada a VPH" },
  { label: "Control de Embarazo Normal (Z34.0)", code: "Z34.0", text: "Supervisión de primer embarazo normal de curso favorable" },
  { label: "Miomatosis Uterina Sintomática (D25.9)", code: "D25.9", text: "Leiomiomatosis uterina intramural sintomática" },
  { label: "Síndrome de Ovario Poliquístico (E28.2)", code: "E28.2", text: "Síndrome de Ovario Poliquístico (SOP) fenotipo ovulatorio irregular" },
  { label: "Vaginitis / Cervicitis Mixta (N76.0)", code: "N76.0", text: "Cervicovaginitis mixta aguda en tratamiento antimicrobiano" },
];

export function ConsultationModal({
  isOpen,
  onClose,
  patient,
  consultationToEdit,
  onSavedAndPrint,
}: ConsultationModalProps) {
  const { doctorProfile, addConsultation, updateConsultation } = useMedicalStore();

  const [consultationDate, setConsultationDate] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [illnessTime, setIllnessTime] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Signos Vitales
  const [bloodPressure, setBloodPressure] = useState("110/70");
  const [heartRate, setHeartRate] = useState(72);
  const [temperature, setTemperature] = useState(36.5);
  const [weightKg, setWeightKg] = useState(58);
  const [heightCm, setHeightCm] = useState(162);

  // Examen Físico
  const [generalExam, setGeneralExam] = useState("Paciente en regular estado general, orientada en tiempo, espacio y persona.");
  const [breastsExam, setBreastsExam] = useState("Mamas simétricas, turgentes, sin nódulos ni adenopatías axilares palpables.");
  const [externalGenitalia, setExternalGenitalia] = useState("Genitales externos con distribución ginecoide habitual sin lesiones.");
  const [speculoscopy, setSpeculoscopy] = useState("Vagina elástica. Cuello posterior, epitelio liso sin ectopia sangrante.");
  const [bimanualPalpation, setBimanualPalpation] = useState("Útero en posición normal, móvil, dolor leve a la palpación de fondos de saco. Anexos libres.");

  // Diagnóstico & Plan
  const [diagnosis, setDiagnosis] = useState("");
  const [cie10Code, setCie10Code] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");

  // IMC dinámico
  const bmi = useMemo(() => {
    if (weightKg > 0 && heightCm > 0) {
      const hMeters = heightCm / 100;
      return Number((weightKg / (hMeters * hMeters)).toFixed(2));
    }
    return 22.0;
  }, [weightKg, heightCm]);

  useEffect(() => {
    if (consultationToEdit) {
      setConsultationDate(consultationToEdit.consultationDate);
      setReasonForVisit(consultationToEdit.reasonForVisit);
      setIllnessTime(consultationToEdit.illnessTime || "");
      setSymptoms(consultationToEdit.symptoms || "");
      setBloodPressure(consultationToEdit.vitalSigns.bloodPressure || "110/70");
      setHeartRate(consultationToEdit.vitalSigns.heartRate || 72);
      setTemperature(consultationToEdit.vitalSigns.temperature || 36.5);
      setWeightKg(consultationToEdit.vitalSigns.weightKg || 58);
      setHeightCm(consultationToEdit.vitalSigns.heightCm || 162);
      setGeneralExam(consultationToEdit.physicalExam.generalExam || "");
      setBreastsExam(consultationToEdit.physicalExam.breastsExam || "");
      setExternalGenitalia(consultationToEdit.physicalExam.externalGenitalia || "");
      setSpeculoscopy(consultationToEdit.physicalExam.speculoscopy || "");
      setBimanualPalpation(consultationToEdit.physicalExam.bimanualPalpation || "");
      setDiagnosis(consultationToEdit.diagnosis);
      setCie10Code(consultationToEdit.cie10Code || "");
      setTreatmentPlan(consultationToEdit.treatmentPlan);
      setNextAppointmentDate(consultationToEdit.nextAppointmentDate || "");
    } else {
      setConsultationDate(new Date().toISOString().split("T")[0]);
      setReasonForVisit("");
      setIllnessTime("");
      setSymptoms("");
      setBloodPressure("110/70");
      setHeartRate(72);
      setTemperature(36.5);
      setWeightKg(58);
      setHeightCm(162);
      setGeneralExam("Paciente en regular estado general, lúcida y hemodinámicamente estable.");
      setBreastsExam("Mamas simétricas, sin masas ni telorrea.");
      setExternalGenitalia("Genitales externos sanos, sin lesiones dérmicas.");
      setSpeculoscopy("Cérvix cerrado, no sangrante al contacto.");
      setBimanualPalpation("Útero de tamaño conservado, no doloroso, anexos no palpables.");
      setDiagnosis("");
      setCie10Code("");
      setTreatmentPlan("1. Indicaciones generales de estilo de vida e higiene ginecológica.\n2. Exámenes auxiliares según necesidad clínica.\n3. Acudir a control según programación.");
      setNextAppointmentDate("");
    }
  }, [consultationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSave = (shouldPrint = false) => {
    if (!reasonForVisit.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Motivo Requerido",
        text: "Por favor ingrese el motivo de consulta de la paciente.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    if (!diagnosis.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Diagnóstico Requerido",
        text: "Por favor indique la conclusión o diagnóstico de la consulta.",
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
      consultationDate: consultationDate || new Date().toISOString().split("T")[0],
      reasonForVisit: reasonForVisit.trim(),
      illnessTime: illnessTime.trim() || undefined,
      symptoms: symptoms.trim() || undefined,
      vitalSigns: {
        bloodPressure: bloodPressure || "110/70",
        heartRate: Number(heartRate) || 72,
        temperature: Number(temperature) || 36.5,
        weightKg: Number(weightKg) || 58,
        heightCm: Number(heightCm) || 162,
        bmi,
      },
      physicalExam: {
        generalExam: generalExam.trim(),
        breastsExam: breastsExam.trim(),
        externalGenitalia: externalGenitalia.trim(),
        speculoscopy: speculoscopy.trim(),
        bimanualPalpation: bimanualPalpation.trim(),
      },
      diagnosis: diagnosis.trim(),
      cie10Code: cie10Code.trim() || undefined,
      treatmentPlan: treatmentPlan.trim(),
      nextAppointmentDate: nextAppointmentDate || undefined,
    };

    let result: MedicalConsultation;
    if (consultationToEdit) {
      updateConsultation(consultationToEdit.id, payload);
      result = { ...consultationToEdit, ...payload, updatedAt: new Date().toISOString() };
      Swal.fire({
        icon: "success",
        title: "Consulta Actualizada",
        text: "La atención clínica ha sido actualizada y sincronizada.",
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      result = addConsultation(payload);
      Swal.fire({
        icon: "success",
        title: "Consulta Registrada",
        text: "La nueva consulta ha sido guardada en la historia clínica.",
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
        <div className="px-6 py-4 border-b border-border bg-gradient-to-r from-primary/10 via-primary/5 to-transparent flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base sm:text-lg text-heading">
                {consultationToEdit ? "Editar Consulta Ginecológica" : "Nueva Consulta Ginecológica Estructurada"}
              </h2>
              <p className="text-xs text-muted">
                Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni} &bull; {patient.age} años
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

        {/* Cuerpo con Scroll */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          {/* Fila 1: Fecha y Selector Rápido de Diagnóstico */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-4 space-y-1">
              <label className="font-bold text-heading block">Fecha de Atención *</label>
              <input
                type="date"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs focus:bg-white focus:border-primary focus:outline-none"
              />
            </div>

            <div className="md:col-span-8 space-y-1">
              <label className="font-bold text-heading block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Diagnósticos Ginecológicos Frecuentes CENDO (1 Clic)</span>
              </label>
              <select
                onChange={(e) => {
                  const selected = FREQUENT_DIAGNOSES.find((d) => d.code === e.target.value);
                  if (selected) {
                    setDiagnosis(selected.text);
                    setCie10Code(selected.code);
                  }
                }}
                defaultValue=""
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-primary focus:outline-none"
              >
                <option value="" disabled>Seleccione un diagnóstico habitual para autocompletar...</option>
                {FREQUENT_DIAGNOSES.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila 2: Anamnesis */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              1. Anamnesis & Motivo de Consulta
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-8 space-y-1">
                <label className="font-semibold text-slate-700 block">Motivo Principal de Consulta *</label>
                <input
                  type="text"
                  placeholder="Ej: Dolor pélvico severo, dismenorrea progresiva, sangrado irregular..."
                  value={reasonForVisit}
                  onChange={(e) => setReasonForVisit(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none font-medium"
                />
              </div>

              <div className="md:col-span-4 space-y-1">
                <label className="font-semibold text-slate-700 block">Tiempo de Enfermedad</label>
                <input
                  type="text"
                  placeholder="Ej: 6 meses, 3 semanas..."
                  value={illnessTime}
                  onChange={(e) => setIllnessTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="font-semibold text-slate-700 block">Síntomas y Relato Cronológico</label>
                <textarea
                  rows={2}
                  placeholder="Detalle la cronología de síntomas, intensidad EVA, relación con ciclo menstrual..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fila 3: Signos Vitales & Medidas Antropométricas */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-3">
            <h3 className="font-heading font-bold text-sm text-indigo-950 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-indigo-600" />
              2. Signos Vitales & Antropometría
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">P.A. (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">F.C. (lpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Peso (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 block">Talla (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 bg-white p-2 rounded-lg border border-indigo-200 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-indigo-700 block">IMC Calculado</span>
                <span className="font-mono font-extrabold text-sm text-indigo-950">{bmi} kg/m²</span>
              </div>
            </div>
          </div>

          {/* Fila 4: Examen Físico Ginecológico */}
          <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              3. Examen Físico Ginecológico Dirigido
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Examen General</label>
                <textarea
                  rows={2}
                  value={generalExam}
                  onChange={(e) => setGeneralExam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Examen de Mamas (Bilateral)</label>
                <textarea
                  rows={2}
                  value={breastsExam}
                  onChange={(e) => setBreastsExam(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Genitales Externos</label>
                <input
                  type="text"
                  value={externalGenitalia}
                  onChange={(e) => setExternalGenitalia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 block">Especuloscopía (Vagina & Cérvix)</label>
                <input
                  type="text"
                  value={speculoscopy}
                  onChange={(e) => setSpeculoscopy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>

              <div className="md:col-span-2 space-y-1">
                <label className="font-semibold text-slate-700 block">Tacto Bimanual (Útero & Anexos)</label>
                <input
                  type="text"
                  value={bimanualPalpation}
                  onChange={(e) => setBimanualPalpation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fila 5: Diagnóstico y Plan Terapéutico */}
          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-3">
            <h3 className="font-heading font-bold text-sm text-emerald-950 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              4. Diagnóstico & Plan de Trabajo
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-9 space-y-1">
                <label className="font-semibold text-slate-800 block">Diagnóstico Principal *</label>
                <input
                  type="text"
                  placeholder="Ej: Endometriosis pélvica profunda infiltrante..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-emerald-950 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-3 space-y-1">
                <label className="font-semibold text-slate-800 block">Código CIE-10</label>
                <input
                  type="text"
                  placeholder="Ej: N80.3"
                  value={cie10Code}
                  onChange={(e) => setCie10Code(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold uppercase focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="font-semibold text-slate-800 block">Plan Terapéutico, Medicación & Exámenes Auxiliares</label>
                <textarea
                  rows={4}
                  placeholder="1. Tratamiento farmacológico...\n2. Exámenes de imágenes o laboratorio solicitados...\n3. Pautas de estilo de vida..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>

              <div className="md:col-span-6 space-y-1">
                <label className="font-semibold text-slate-800 block">Próxima Cita de Control Sugerida</label>
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:border-emerald-600 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Acciones */}
        <div className="px-6 py-4 border-t border-border bg-slate-50 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {patient && diagnosis && (
              <button
                type="button"
                onClick={() => {
                  const tempCons: MedicalConsultation = {
                    id: consultationToEdit ? consultationToEdit.id : "temp-cons",
                    patientId: patient.id,
                    doctorId: doctorProfile.id,
                    doctorName: doctorProfile.fullName,
                    doctorCmp: doctorProfile.cmp,
                    doctorRne: doctorProfile.rne,
                    consultationDate: consultationDate || new Date().toISOString().split("T")[0],
                    reasonForVisit,
                    illnessTime: illnessTime || undefined,
                    symptoms: symptoms || undefined,
                    vitalSigns: { bloodPressure, heartRate, temperature, weightKg, heightCm, bmi },
                    physicalExam: { generalExam, breastsExam, externalGenitalia, speculoscopy, bimanualPalpation },
                    diagnosis,
                    cie10Code,
                    treatmentPlan,
                    nextAppointmentDate,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  const url = generateConsultationWhatsAppUrl(patient, tempCons, doctorProfile);
                  window.open(url, "_blank");
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                title="Compartir resumen por WhatsApp"
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
              className="px-4 py-2 rounded-xl bg-accent-soft hover:bg-sky-100 text-primary border border-primary/20 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Guardar e Imprimir</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{consultationToEdit ? "Guardar Cambios" : "Guardar Consulta"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
