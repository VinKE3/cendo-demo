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
  FlaskConical,
  Pill,
  Plus,
} from "lucide-react";
import { Patient, DoctorProfile, MedicalConsultation, LabOrderItem, PrescriptionItem } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generateConsultationWhatsAppUrl } from "@/lib/whatsappShare";
import { Cie10Autocomplete } from "@/components/common/Cie10Autocomplete";
import {
  FREQUENT_DIAGNOSES,
  calculateBmi,
  classifyBmi,
  validateConsultationInput,
} from "@/modules/consultas";

interface ConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  consultationToEdit?: MedicalConsultation | null;
  onSavedAndPrint?: (consultation: MedicalConsultation) => void;
}

const FREQUENT_LAB_OPTIONS = [
  "Hemograma Completo + Plaquetas",
  "Perfil Hormonal Ginecológico (FSH, LH, Estradiol, Prolactina)",
  "Marcador CA-125 (Endometriosis / Ovárico)",
  "Examen Completo de Orina + Urocultivo con Antibiograma",
  "Beta-HCG Cuantitativa en Sangre",
  "Papanicolaou (PAP) en Base Líquida + Test VPH",
  "Glucosa, Urea, Creatinina & Perfil Lipídico",
  "Ecografía Transvaginal con Mapeo de Endometriosis",
  "Ecografía Mamaria Bilateral de Alta Resolución",
];

const FREQUENT_MED_OPTIONS = [
  { label: "Dienogest 2 mg (Endometriosis)", text: "Dienogest 2 mg: 1 comp diario vía oral a la misma hora sin descanso x 3 meses." },
  { label: "Ketoprofeno 100 mg (Dolor Pélvico)", text: "Ketoprofeno 100 mg: 1 tab c/8h vía oral después de alimentos condicional a dolor." },
  { label: "Metronidazol + Nistatina (Óvulos)", text: "Metronidazol 500mg + Nistatina 100,000UI: 1 óvulo vaginal c/noche x 10 noches." },
  { label: "Doxiciclina 100 mg (Cervicitis / EPI)", text: "Doxiciclina 100 mg: 1 cáp c/12h vía oral con abundante agua x 14 días." },
  { label: "Mupirocina 2% (Tópico)", text: "Mupirocina 2% ungüento: aplicar capa fina en zona vulvar c/12h x 7 días." },
  { label: "Ácido Mefenámico 500 mg (Dismenorrea)", text: "Ácido Mefenámico 500 mg: 1 tab c/8h vía oral al inicio del dolor menstrual x 3 días." },
];

export function ConsultationModal({
  isOpen,
  onClose,
  patient,
  consultationToEdit,
  onSavedAndPrint,
}: ConsultationModalProps) {
  const { doctorProfile, addConsultation, updateConsultation, addLabOrder, addPrescription } = useMedicalStore();

  const [consultationDate, setConsultationDate] = useState("");
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [illnessTime, setIllnessTime] = useState("");
  const [symptoms, setSymptoms] = useState("");

  // Signos Vitales (Formato Dr. Patrick Jacinto)
  const [bloodPressure, setBloodPressure] = useState("110/70");
  const [heartRate, setHeartRate] = useState(72);
  const [respiratoryRate, setRespiratoryRate] = useState<number>(18);
  const [temperature, setTemperature] = useState(36.5);
  const [oxygenSaturation, setOxygenSaturation] = useState<number>(98);
  const [weightKg, setWeightKg] = useState(58);
  const [heightCm, setHeightCm] = useState(162);

  // Examen Físico
  const [generalExam, setGeneralExam] = useState("Paciente en regular estado general, orientada en tiempo, espacio y persona.");
  const [breastsExam, setBreastsExam] = useState("Mamas simétricas, turgentes, sin nódulos ni adenopatías axilares palpables.");
  const [externalGenitalia, setExternalGenitalia] = useState("Genitales externos con distribución ginecoide habitual sin lesiones.");
  const [speculoscopy, setSpeculoscopy] = useState("Vagina elástica. Cuello posterior, epitelio liso sin ectopia sangrante.");
  const [bimanualPalpation, setBimanualPalpation] = useState("Útero en posición normal, móvil, dolor leve a la palpación de fondos de saco. Anexos libres.");

  // Diagnóstico, Plan, Exámenes Auxiliares y Receta
  const [diagnosis, setDiagnosis] = useState("");
  const [cie10Code, setCie10Code] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [auxiliaryExams, setAuxiliaryExams] = useState("");
  const [prescriptionNotes, setPrescriptionNotes] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");

  // IMC dinámico
  const bmi = useMemo(() => {
    return calculateBmi(weightKg, heightCm);
  }, [weightKg, heightCm]);

  useEffect(() => {
    if (consultationToEdit) {
      setConsultationDate(consultationToEdit.consultationDate);
      setReasonForVisit(consultationToEdit.reasonForVisit);
      setIllnessTime(consultationToEdit.illnessTime || "");
      setSymptoms(consultationToEdit.symptoms || "");
      setBloodPressure(consultationToEdit.vitalSigns.bloodPressure || "110/70");
      setHeartRate(consultationToEdit.vitalSigns.heartRate || 72);
      setRespiratoryRate(consultationToEdit.vitalSigns.respiratoryRate ?? 18);
      setTemperature(consultationToEdit.vitalSigns.temperature || 36.5);
      setOxygenSaturation(consultationToEdit.vitalSigns.oxygenSaturation ?? 98);
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
      setAuxiliaryExams(consultationToEdit.auxiliaryExams || "");
      setPrescriptionNotes(consultationToEdit.prescriptionNotes || "");
      setNextAppointmentDate(consultationToEdit.nextAppointmentDate || "");
    } else {
      setConsultationDate(new Date().toISOString().split("T")[0]);
      setReasonForVisit("");
      setIllnessTime("");
      setSymptoms("");
      setBloodPressure("110/70");
      setHeartRate(72);
      setRespiratoryRate(18);
      setTemperature(36.5);
      setOxygenSaturation(98);
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
      setAuxiliaryExams("Hemograma, Perfil lipídico, Glucosa, Ecografía pélvica / transvaginal");
      setPrescriptionNotes("");
      setNextAppointmentDate("");
    }
  }, [consultationToEdit, isOpen]);

  if (!isOpen) return null;

  const handleGenerateLabOrder = () => {
    if (!auxiliaryExams.trim()) {
      Swal.fire({
        icon: "info",
        title: "Sin Exámenes",
        text: "Por favor seleccione o escriba exámenes auxiliares antes de generar la orden.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const rawItems = auxiliaryExams
      .split("\n")
      .map((line) => line.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

    const items: LabOrderItem[] = rawItems.length > 0
      ? rawItems.map((testName, idx) => ({
          id: `lab-item-${Date.now()}-${idx}`,
          category: "Ginecología & Marcadores",
          testName,
          sampleType: "Según protocolo",
          notes: diagnosis ? `Dx: ${diagnosis}` : undefined,
        }))
      : [
          {
            id: `lab-item-${Date.now()}-0`,
            category: "Ginecología & Marcadores",
            testName: auxiliaryExams.trim(),
            sampleType: "Según protocolo",
          },
        ];

    addLabOrder({
      patientId: patient.id,
      doctorId: doctorProfile.id,
      doctorName: `${doctorProfile.doctorTitle} ${doctorProfile.fullName}`,
      doctorCmp: doctorProfile.cmp || "61693",
      doctorRne: doctorProfile.rne || "38657",
      orderDate: consultationDate || new Date().toISOString().split("T")[0],
      diagnosis: diagnosis || "Evaluación ginecológica en consulta",
      cie10Code: cie10Code || "Z01.4",
      urgency: "Rutina",
      items,
      patientInstructions: "Cumplir ayuno o indicaciones según protocolo de laboratorio.",
    });

    Swal.fire({
      icon: "success",
      title: "¡Orden de Laboratorio Generada!",
      html: `
        <div style="font-size: 13px; color: #475569; text-align: left;">
          Se registraron <b>${items.length} exámenes</b> en la orden médica oficial.<br/>
          Ya está disponible en la pestaña <b>Laboratorio</b> para imprimir o enviar por WhatsApp a la paciente.
        </div>
      `,
      confirmButtonColor: "#0A4D68",
      confirmButtonText: "Entendido",
    });
  };

  const handleGeneratePrescription = () => {
    if (!prescriptionNotes.trim()) {
      Swal.fire({
        icon: "info",
        title: "Sin Medicamentos",
        text: "Por favor seleccione o escriba los medicamentos antes de generar la receta.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const lines = prescriptionNotes
      .split("\n")
      .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

    const items: PrescriptionItem[] = lines.map((line, idx) => ({
      id: `rec-item-${Date.now()}-${idx}`,
      medicationName: line,
      presentation: "Presentación indicada",
      dosage: "Según pauta médica",
      frequency: "Indicada",
      duration: "Tratamiento completo",
      instructions: line,
      route: "Vía Oral",
    }));

    addPrescription({
      patientId: patient.id,
      doctorId: doctorProfile.id,
      doctorName: `${doctorProfile.doctorTitle} ${doctorProfile.fullName}`,
      doctorCmp: doctorProfile.cmp || "61693",
      doctorRne: doctorProfile.rne || "38657",
      prescriptionDate: consultationDate || new Date().toISOString().split("T")[0],
      diagnosis: diagnosis || "Tratamiento médico ginecológico",
      cie10Code: cie10Code || "Z01.4",
      items,
      generalIndications: "Cumplir la indicación médica completa.",
      nextAppointmentDate: nextAppointmentDate || undefined,
    });

    Swal.fire({
      icon: "success",
      title: "¡Receta Médica Oficial Generada!",
      html: `
        <div style="font-size: 13px; color: #475569; text-align: left;">
          La receta ha sido generada con formato membretado CENDO.<br/>
          Ya está lista en la pestaña <b>Recetas</b> para imprimir en A4/A5 o enviar por WhatsApp.
        </div>
      `,
      confirmButtonColor: "#0A4D68",
      confirmButtonText: "Entendido",
    });
  };

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
        respiratoryRate: Number(respiratoryRate) || 18,
        temperature: Number(temperature) || 36.5,
        oxygenSaturation: Number(oxygenSaturation) || 98,
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
      auxiliaryExams: auxiliaryExams.trim() || undefined,
      prescriptionNotes: prescriptionNotes.trim() || undefined,
      nextAppointmentDate: nextAppointmentDate || undefined,
    };

    const validation = validateConsultationInput(payload);
    if (!validation.success) {
      Swal.fire({
        icon: "warning",
        title: "Dato Clínico Requerido",
        text: validation.error,
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

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

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">P.A. (mmHg)</label>
                <input
                  type="text"
                  value={bloodPressure}
                  onChange={(e) => setBloodPressure(e.target.value)}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">F.C. (lpm)</label>
                <input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">F.R. (rpm)</label>
                <input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                  placeholder="18"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">SatO2 (%)</label>
                <input
                  type="number"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                  placeholder="98"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Peso (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 block">Talla (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg bg-white border border-slate-200 font-mono text-xs focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1 bg-white p-2 rounded-lg border border-indigo-200 flex flex-col justify-center">
                <span className="text-[9px] uppercase font-bold text-indigo-700 block">IMC Calculado</span>
                <span className="font-mono font-extrabold text-xs text-indigo-950">{bmi} kg/m²</span>
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
              {/* Diagnóstico con Autocompletado CIE-10 (Feedback Dr. Patrick) */}
              <div className="md:col-span-12">
                <Cie10Autocomplete
                  diagnosis={diagnosis}
                  cie10Code={cie10Code}
                  onChange={(diag, code) => {
                    setDiagnosis(diag);
                    setCie10Code(code);
                  }}
                  required
                />
              </div>

              <div className="md:col-span-12 space-y-1">
                <label className="font-semibold text-slate-800 block">Plan de Trabajo / Indicaciones</label>
                <textarea
                  rows={2}
                  placeholder="Pautas de manejo, conducta médica..."
                  value={treatmentPlan}
                  onChange={(e) => setTreatmentPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:border-emerald-600 focus:outline-none font-mono"
                />
              </div>

              {/* Exámenes Auxiliares con Desplegable & Generación a 1 Clic (Uno debajo del otro para evitar solapamientos) */}
              <div className="col-span-12 space-y-2 p-3.5 rounded-xl bg-teal-50/60 border border-teal-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="font-bold text-teal-950 flex items-center gap-1.5 shrink-0">
                    <FlaskConical className="w-4 h-4 text-teal-700" />
                    <span>Exámenes Auxiliares</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const newExams = auxiliaryExams ? `${auxiliaryExams}\n• ${e.target.value}` : `• ${e.target.value}`;
                        setAuxiliaryExams(newExams);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="w-full sm:w-auto max-w-full sm:max-w-xs px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-xs font-bold text-teal-800 cursor-pointer focus:outline-none shadow-2xs truncate"
                  >
                    <option value="" disabled>+ Añadir examen frecuente...</option>
                    {FREQUENT_LAB_OPTIONS.map((lab) => (
                      <option key={lab} value={lab}>
                        {lab}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Ej: • Hemograma completo&#10;• Perfil hormonal&#10;• Ecografía transvaginal..."
                  value={auxiliaryExams}
                  onChange={(e) => setAuxiliaryExams(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-teal-200 text-xs focus:border-teal-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateLabOrder}
                  className="w-full py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Crear orden médica oficial lista para imprimir con estos exámenes"
                >
                  <FlaskConical className="w-3.5 h-3.5" />
                  <span>🧪 Generar Orden de Laboratorio (1 Clic)</span>
                </button>
              </div>

              {/* Receta Médica con Desplegable & Generación a 1 Clic (Uno debajo del otro) */}
              <div className="col-span-12 space-y-2 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <label className="font-bold text-indigo-950 flex items-center gap-1.5 shrink-0">
                    <Pill className="w-4 h-4 text-indigo-700" />
                    <span>Receta Médica (Rp/)</span>
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const newNotes = prescriptionNotes ? `${prescriptionNotes}\n• ${e.target.value}` : `• ${e.target.value}`;
                        setPrescriptionNotes(newNotes);
                        e.target.value = "";
                      }
                    }}
                    defaultValue=""
                    className="w-full sm:w-auto max-w-full sm:max-w-xs px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-xs font-bold text-indigo-800 cursor-pointer focus:outline-none shadow-2xs truncate"
                  >
                    <option value="" disabled>+ Añadir fármaco frecuente...</option>
                    {FREQUENT_MED_OPTIONS.map((med) => (
                      <option key={med.label} value={med.text}>
                        {med.label}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  rows={2}
                  placeholder="Ej: • Dienogest 2mg diario continuo x 3 meses&#10;• Ketoprofeno 100mg condicional a dolor..."
                  value={prescriptionNotes}
                  onChange={(e) => setPrescriptionNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs focus:border-indigo-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGeneratePrescription}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  title="Crear receta médica oficial con membrete lista para imprimir"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>💊 Generar Receta Médica Oficial (1 Clic)</span>
                </button>
              </div>

              <div className="md:col-span-12 space-y-1 pt-1">
                <label className="font-semibold text-slate-800 block">Próxima Cita de Control Sugerida</label>
                <input
                  type="date"
                  value={nextAppointmentDate}
                  onChange={(e) => setNextAppointmentDate(e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono focus:border-emerald-600 focus:outline-none"
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
                    vitalSigns: {
                      bloodPressure,
                      heartRate,
                      respiratoryRate,
                      temperature,
                      oxygenSaturation,
                      weightKg,
                      heightCm,
                      bmi,
                    },
                    physicalExam: { generalExam, breastsExam, externalGenitalia, speculoscopy, bimanualPalpation },
                    diagnosis,
                    cie10Code,
                    treatmentPlan,
                    auxiliaryExams,
                    prescriptionNotes,
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
