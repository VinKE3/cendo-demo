"use client";

import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  X,
  Baby,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Heart,
  Scale,
  Activity,
  FileText,
  Printer,
  Sparkles,
  Stethoscope,
  Info,
  Clock,
} from "lucide-react";
import {
  PrenatalCard,
  PrenatalVisitItem,
  PrenatalBaselineData,
  Patient,
  DoctorProfile,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  calculateNaegeleFPP,
  calculateGestationalAge,
  evaluatePrenatalRisks,
} from "@/lib/prenatalCalculators";

interface PrenatalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onPrintRequested?: (card: PrenatalCard) => void;
}

export function PrenatalCardModal({
  isOpen,
  onClose,
  patient,
  onPrintRequested,
}: PrenatalCardModalProps) {
  const {
    doctorProfile,
    doctorsList,
    getPrenatalCardByPatientId,
    addPrenatalCard,
    updatePrenatalCard,
  } = useMedicalStore();

  const [activeTab, setActiveTab] = useState<"baseline" | "visits" | "risks">("visits");
  const [selectedVisitToEdit, setSelectedVisitToEdit] = useState<PrenatalVisitItem | null>(null);
  const [isAddingVisit, setIsAddingVisit] = useState(false);

  // Carnet actual en store o plantilla nueva
  const existingCard = getPrenatalCardByPatientId(patient.id);

  const todayStr = new Date().toISOString().split("T")[0];

  // Estado local para edición de Ficha Basal
  const [baselineData, setBaselineData] = useState<PrenatalBaselineData>({
    insuranceType: "PRIVADO",
    insuranceCode: "",
    educationLevel: "Superior Univ",
    civilStatus: "Soltera",
    gestas: 1,
    abortos: 0,
    partosVaginales: 0,
    cesareas: 0,
    nacidosVivos: 0,
    nacidosMuertos: 0,
    viven: 0,
    rnMayorPesoGramos: 0,
    familyHistory: [],
    personalHistory: [],
    previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
    usualWeightKg: 56.5,
    heightCm: 162,
    bloodGroup: "O",
    rhFactor: "Rh (+)",
    smokerCigarettesDay: 0,
    drugsUse: false,
    fum: "2026-09-26",
    fumDoubt: false,
    fpp: calculateNaegeleFPP("2026-09-26"),
    clinicalExam: "Normal",
    breastsExam: "Normal",
    cervixExam: "Normal",
    pelvisExam: "Normal",
    dentalExam: "Normal",
  });

  const [visitsList, setVisitsList] = useState<PrenatalVisitItem[]>([]);

  // Sincronizar con datos existentes
  useEffect(() => {
    if (existingCard) {
      setBaselineData(existingCard.baseline);
      setVisitsList(existingCard.visits || []);
    } else {
      // Plantilla por defecto para la paciente
      const defFum = "2026-09-26";
      setBaselineData({
        insuranceType: "PRIVADO",
        insuranceCode: `CENDO-${patient.dni}`,
        educationLevel: "Superior Univ",
        civilStatus: "Soltera",
        gestas: 1,
        abortos: 0,
        partosVaginales: 0,
        cesareas: 0,
        nacidosVivos: 0,
        nacidosMuertos: 0,
        viven: 0,
        familyHistory: ["Niega hipertensión o diabetes familiar"],
        personalHistory: ["Niega cirugías previas"],
        previousVaccines: { rubella: true, hepatitisB: true, hpv: true, yellowFever: true },
        usualWeightKg: 56.0,
        heightCm: 160,
        bloodGroup: "O",
        rhFactor: "Rh (+)",
        fum: defFum,
        fumDoubt: false,
        fpp: calculateNaegeleFPP(defFum),
        clinicalExam: "Normal",
        breastsExam: "Normal",
        cervixExam: "Normal",
        pelvisExam: "Normal",
        dentalExam: "Normal",
      });
      setVisitsList([]);
    }
  }, [existingCard, patient, isOpen]);

  // Recalcular Naegele reactivamente si cambia la FUM
  const handleFumChange = (newFum: string) => {
    const newFpp = calculateNaegeleFPP(newFum);
    setBaselineData((prev) => ({
      ...prev,
      fum: newFum,
      fpp: newFpp,
    }));
  };

  if (!isOpen) return null;

  // Evaluación de riesgo obstétrico
  const risksReport = evaluatePrenatalRisks(baselineData, patient.age, visitsList);
  const currentGestAge = calculateGestationalAge(baselineData.fum);

  // Manejo de guardado completo del carnet
  const handleSaveCard = () => {
    const payload = {
      patientId: patient.id,
      clinicEstablishment: "CENDO - Consultorio Ginecológico & Obstétrico Miraflores",
      attendingDoctorId: doctorProfile.id,
      attendingDoctorName: `${doctorProfile.doctorTitle || "Dr."} ${doctorProfile.fullName}`,
      baseline: baselineData,
      visits: visitsList,
      maternalPathologies: existingCard?.maternalPathologies || [],
    };

    let savedCard: PrenatalCard;
    if (existingCard) {
      updatePrenatalCard(existingCard.id, payload);
      savedCard = { ...existingCard, ...payload, updatedAt: new Date().toISOString() };
    } else {
      savedCard = addPrenatalCard(payload);
    }

    Swal.fire({
      icon: "success",
      title: "Carnet Prenatal Guardado",
      text: "La ficha de control materno perinatal se actualizó exitosamente.",
      timer: 1800,
      showConfirmButton: false,
    });

    return savedCard;
  };

  // Agregar nueva atención prenatal
  const handleAddQuickVisit = () => {
    if (visitsList.length >= 9) {
      Swal.fire({
        icon: "info",
        title: "Límite de Atenciones Alcanzado",
        text: "El carnet oficial MINSA contempla 9 atenciones prenatales.",
      });
      return;
    }

    const nextVisitNum = visitsList.length + 1;
    const gestAgeAtVisit = calculateGestationalAge(baselineData.fum, todayStr);

    // Próxima cita en 4 semanas por defecto
    const nextAppt = new Date();
    nextAppt.setDate(nextAppt.getDate() + 28);
    const nextApptStr = nextAppt.toISOString().split("T")[0];

    const newVisit: PrenatalVisitItem = {
      visitNumber: nextVisitNum,
      visitDate: todayStr,
      visitTime: "11:00",
      gestationalAgeWeeks: gestAgeAtVisit.weeks,
      gestationalAgeDays: gestAgeAtVisit.days,
      maternalWeightKg: baselineData.usualWeightKg,
      temperature: 36.5,
      bloodPressure: "110/70",
      maternalPulse: 76,
      uterineHeightCm: gestAgeAtVisit.weeks >= 13 ? gestAgeAtVisit.weeks - 2 : 0,
      fetusSituation: gestAgeAtVisit.weeks >= 28 ? "L" : "NA",
      fetusPresentation: gestAgeAtVisit.weeks >= 28 ? "C" : "NA",
      fetusPosition: gestAgeAtVisit.weeks >= 28 ? "D" : "NA",
      fetalHeartRate: gestAgeAtVisit.weeks >= 12 ? 140 : 0,
      fetalMovements: gestAgeAtVisit.weeks >= 20 ? "++" : "NA",
      proteinuria: "-",
      edema: "SE",
      tendonReflex: "+",
      ironFolicAcidGiven: gestAgeAtVisit.weeks >= 14,
      calciumGiven: gestAgeAtVisit.weeks >= 20,
      counselingGiven: "NUT / ITS",
      nextAppointmentDate: nextApptStr,
      attendingDoctorName: `${doctorProfile.doctorTitle || "Dr."} ${doctorProfile.fullName}`,
      notes: `Atención prenatal N° ${nextVisitNum}. Evolución materna y fetal adecuada.`,
    };

    setVisitsList([...visitsList, newVisit]);
  };

  const handleDeleteVisit = (index: number) => {
    Swal.fire({
      title: `¿Eliminar Atención N° ${index + 1}?`,
      text: "Esta acción quitará el registro de la matriz prenatal.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        const updated = visitsList.filter((_, idx) => idx !== index);
        // Renumerar visitNumber
        const renumbered = updated.map((v, i) => ({ ...v, visitNumber: i + 1 }));
        setVisitsList(renumbered);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl my-4 flex flex-col max-h-[94vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Oficial */}
        <div className="bg-gradient-to-r from-primary via-[#0B5877] to-primary-dark text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Baby className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-heading font-extrabold tracking-tight">
                  Carnet de Control Prenatal Oficial (MINSA / CLAP)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/20 text-white border border-white/30">
                  {risksReport.riskCategory}
                </span>
              </div>
              <p className="text-xs text-slate-200">
                Gestante: <strong>{patient.lastName}, {patient.firstName}</strong> &bull; DNI {patient.dni} &bull; {patient.age} años
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const saved = handleSaveCard();
                if (onPrintRequested && saved) {
                  onPrintRequested(saved);
                }
              }}
              className="px-3.5 py-1.5 rounded-xl bg-secondary hover:bg-secondary-hover text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Carnet (2 Págs)</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Barra de Pestañas y Alerta Rápida */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("visits")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "visits"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Matriz de 9 Atenciones ({visitsList.length}/9)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("baseline")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "baseline"
                  ? "bg-primary text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Ficha Basal & Naegele</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("risks")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === "risks"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Alertas de Riesgo ({risksReport.warningFlags.length})</span>
            </button>
          </div>

          {/* Widget de Cálculo Naegele en Tiempo Real */}
          <div className="flex items-center gap-3 text-xs bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-2xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 font-sans block">FUM:</span>
              <strong className="text-slate-800">{baselineData.fum}</strong>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-slate-400 font-sans block">EG Actual:</span>
              <strong className="text-primary font-bold">{currentGestAge.formatted}</strong>
            </div>
            <div className="border-l border-slate-200 pl-2">
              <span className="text-[10px] text-secondary font-sans font-bold block">FPP Naegele:</span>
              <strong className="text-slate-900">{baselineData.fpp}</strong>
            </div>
          </div>
        </div>

        {/* Contenido de Pestañas */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* =========================================================================
              PESTAÑA 1: MATRIZ DE 9 ATENCIONES PRENATALES
              ========================================================================= */}
          {activeTab === "visits" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900">
                    Control Longitudinal de Atenciones Prenatales (Norma Técnica MINSA)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Registre las medidas antropométricas, fetales y de laboratorio en cada visita.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQuickVisit}
                  disabled={visitsList.length >= 9}
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Registrar Atención N° {visitsList.length + 1}</span>
                </button>
              </div>

              {/* Tabla de Matriz */}
              <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                        <th className="p-3 w-44">Parámetro</th>
                        {Array.from({ length: 9 }).map((_, idx) => (
                          <th
                            key={idx}
                            className={`p-3 text-center min-w-[110px] border-l border-slate-200 ${
                              idx < visitsList.length ? "bg-primary/10 text-primary font-extrabold" : "text-slate-400"
                            }`}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span>Atención {idx + 1}</span>
                              {idx < visitsList.length && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteVisit(idx)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                  title="Eliminar atención"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
                      {/* Fecha */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Fecha de Atención</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.visitDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].visitDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-xs text-center border rounded px-1 py-0.5 w-24 font-mono"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Edad Gestacional */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Edad Gestacional</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono font-bold text-primary">
                              {v ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    value={v.gestationalAgeWeeks}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].gestationalAgeWeeks = parseInt(e.target.value, 10) || 0;
                                      setVisitsList(updated);
                                    }}
                                    className="w-10 text-center border rounded py-0.5 text-xs font-bold"
                                  />
                                  <span>sem</span>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Peso Madre */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Peso Madre (kg)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="number"
                                  step="0.1"
                                  value={v.maternalWeightKg}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].maternalWeightKg = parseFloat(e.target.value) || 0;
                                    setVisitsList(updated);
                                  }}
                                  className="w-14 text-center border rounded py-0.5 text-xs"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Presión Arterial */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Presión Arterial</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          const isHigh = v && parseInt(v.bloodPressure.split("/")[1] || "0", 10) >= 90;
                          return (
                            <td key={idx} className={`p-2 text-center border-l border-slate-100 font-mono ${isHigh ? "bg-red-50" : ""}`}>
                              {v ? (
                                <input
                                  type="text"
                                  value={v.bloodPressure}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].bloodPressure = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  placeholder="110/70"
                                  className={`w-16 text-center border rounded py-0.5 text-xs font-bold ${
                                    isHigh ? "border-red-500 text-red-700 bg-red-100" : ""
                                  }`}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Altura Uterina */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Altura Uterina (cm)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="number"
                                  value={v.uterineHeightCm}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].uterineHeightCm = parseInt(e.target.value, 10) || 0;
                                    setVisitsList(updated);
                                  }}
                                  className="w-12 text-center border rounded py-0.5 text-xs"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* FCF (Latidos/min) */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">F.C.F. Fetal (lpm)</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          const isFcfAbnormal = v && v.fetalHeartRate > 0 && (v.fetalHeartRate < 120 || v.fetalHeartRate > 160);
                          return (
                            <td key={idx} className={`p-2 text-center border-l border-slate-100 font-mono ${isFcfAbnormal ? "bg-red-50" : ""}`}>
                              {v ? (
                                <input
                                  type="number"
                                  value={v.fetalHeartRate || ""}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].fetalHeartRate = parseInt(e.target.value, 10) || 0;
                                    setVisitsList(updated);
                                  }}
                                  placeholder="140"
                                  className={`w-14 text-center border rounded py-0.5 text-xs font-bold ${
                                    isFcfAbnormal ? "border-red-500 text-red-700 bg-red-100" : "text-emerald-700"
                                  }`}
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Mov. Fetales & Proteinuria */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Proteinuria / Edema</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-1.5 text-center border-l border-slate-100">
                              {v ? (
                                <div className="flex items-center justify-center gap-1 text-[10px] font-mono">
                                  <select
                                    value={v.proteinuria}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].proteinuria = e.target.value as any;
                                      setVisitsList(updated);
                                    }}
                                    className={`px-1 py-0.5 border rounded text-[10px] font-bold ${
                                      v.proteinuria !== "-" && v.proteinuria !== "NSH"
                                        ? "bg-red-100 text-red-800 border-red-300"
                                        : "bg-white text-slate-700 border-slate-200"
                                    }`}
                                    title="Proteinuria (Tira reactiva / Examen de Orina)"
                                  >
                                    <option value="-">Prot: -</option>
                                    <option value="+">Prot: +</option>
                                    <option value="++">Prot: ++</option>
                                    <option value="+++">Prot: +++</option>
                                    <option value="NSH">Prot: NSH</option>
                                  </select>

                                  <select
                                    value={v.edema}
                                    onChange={(e) => {
                                      const updated = [...visitsList];
                                      updated[idx].edema = e.target.value as any;
                                      setVisitsList(updated);
                                    }}
                                    className={`px-1 py-0.5 border rounded text-[10px] font-bold ${
                                      v.edema !== "SE" && v.edema !== "-"
                                        ? "bg-amber-100 text-amber-800 border-amber-300"
                                        : "bg-white text-slate-700 border-slate-200"
                                    }`}
                                    title="Edema (Examen físico)"
                                  >
                                    <option value="SE">SE</option>
                                    <option value="+">Ed: +</option>
                                    <option value="++">Ed: ++</option>
                                    <option value="+++">Ed: +++</option>
                                  </select>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Suplementación Hierro / Calcio */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Fierro / Calcio</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 text-[10px]">
                              {v ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <label className="flex items-center gap-0.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={v.ironFolicAcidGiven}
                                      onChange={(e) => {
                                        const updated = [...visitsList];
                                        updated[idx].ironFolicAcidGiven = e.target.checked;
                                        setVisitsList(updated);
                                      }}
                                      className="rounded text-primary"
                                    />
                                    <span>Fe</span>
                                  </label>
                                  <label className="flex items-center gap-0.5 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={v.calciumGiven}
                                      onChange={(e) => {
                                        const updated = [...visitsList];
                                        updated[idx].calciumGiven = e.target.checked;
                                        setVisitsList(updated);
                                      }}
                                      className="rounded text-primary"
                                    />
                                    <span>Ca</span>
                                  </label>
                                </div>
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>

                      {/* Próxima Cita */}
                      <tr>
                        <td className="p-2.5 font-bold text-slate-700 bg-slate-50">Próxima Cita</td>
                        {Array.from({ length: 9 }).map((_, idx) => {
                          const v = visitsList[idx];
                          return (
                            <td key={idx} className="p-2 text-center border-l border-slate-100 font-mono">
                              {v ? (
                                <input
                                  type="date"
                                  value={v.nextAppointmentDate}
                                  onChange={(e) => {
                                    const updated = [...visitsList];
                                    updated[idx].nextAppointmentDate = e.target.value;
                                    setVisitsList(updated);
                                  }}
                                  className="text-[11px] text-center border rounded px-1 py-0.5 w-24 font-mono font-bold text-primary"
                                />
                              ) : (
                                <span className="text-slate-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 2: FICHA BASAL & CALCULADORA DE NAEGELE
              ========================================================================= */}
          {activeTab === "baseline" && (
            <div className="space-y-4">
              {/* Bloque FUM y Naegele */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-amber-700" />
                    Cálculo Obstétrico & Regla de Naegele (FUM + 7d - 3m + 1a)
                  </h4>
                  <span className="text-xs text-amber-900 font-mono font-bold">
                    40 semanas estándar (280 días)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Fecha de Última Menstruación (FUM) *
                    </label>
                    <input
                      type="date"
                      value={baselineData.fum}
                      onChange={(e) => handleFumChange(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">
                      Edad Gestacional Actual
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-white border border-slate-200 font-mono font-bold text-primary text-xs">
                      {currentGestAge.formatted} ({currentGestAge.totalDays} días)
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-secondary-dark">
                      Fecha Probable de Parto (FPP Naegele)
                    </label>
                    <div className="px-3 py-2 rounded-lg bg-primary text-white font-mono font-extrabold text-xs">
                      {baselineData.fpp || "Ingrese FUM"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Antecedentes Obstétricos G_ P____ */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-heading font-extrabold text-xs uppercase tracking-wider text-slate-800">
                  Fórmula Obstétrica & Paridad
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Gestas</label>
                    <input
                      type="number"
                      value={baselineData.gestas}
                      onChange={(e) => setBaselineData({ ...baselineData, gestas: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Abortos</label>
                    <input
                      type="number"
                      value={baselineData.abortos}
                      onChange={(e) => setBaselineData({ ...baselineData, abortos: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold text-red-600"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Vaginales</label>
                    <input
                      type="number"
                      value={baselineData.partosVaginales}
                      onChange={(e) => setBaselineData({ ...baselineData, partosVaginales: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Cesáreas</label>
                    <input
                      type="number"
                      value={baselineData.cesareas}
                      onChange={(e) => setBaselineData({ ...baselineData, cesareas: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold text-amber-700"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Nac. Vivos</label>
                    <input
                      type="number"
                      value={baselineData.nacidosVivos}
                      onChange={(e) => setBaselineData({ ...baselineData, nacidosVivos: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Nac. Muertos</label>
                    <input
                      type="number"
                      value={baselineData.nacidosMuertos}
                      onChange={(e) => setBaselineData({ ...baselineData, nacidosMuertos: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block">Viven</label>
                    <input
                      type="number"
                      value={baselineData.viven}
                      onChange={(e) => setBaselineData({ ...baselineData, viven: parseInt(e.target.value, 10) || 0 })}
                      className="w-full px-2 py-1.5 text-xs text-center border rounded font-bold text-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Medidas Basales & Grupo Rh */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Peso Habitual (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={baselineData.usualWeightKg}
                    onChange={(e) => setBaselineData({ ...baselineData, usualWeightKg: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Talla (cm)</label>
                  <input
                    type="number"
                    value={baselineData.heightCm}
                    onChange={(e) => setBaselineData({ ...baselineData, heightCm: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3 py-2 text-xs rounded-lg border font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Grupo Sanguíneo</label>
                  <select
                    value={baselineData.bloodGroup}
                    onChange={(e) => setBaselineData({ ...baselineData, bloodGroup: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-white font-bold"
                  >
                    <option value="O">Grupo O</option>
                    <option value="A">Grupo A</option>
                    <option value="B">Grupo B</option>
                    <option value="AB">Grupo AB</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Factor Rh</label>
                  <select
                    value={baselineData.rhFactor}
                    onChange={(e) => setBaselineData({ ...baselineData, rhFactor: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border bg-white font-bold"
                  >
                    <option value="Rh (+)">Rh Positivo (+)</option>
                    <option value="Rh (-) No Sensibilizada">Rh Negativo (-) No Sensibilizada</option>
                    <option value="Rh (-) Sensibilizada">Rh Negativo (-) Sensibilizada (Alerta)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PESTAÑA 3: ALERTAS DE RIESGO OBSTÉTRICO
              ========================================================================= */}
          {activeTab === "risks" && (
            <div className="space-y-4">
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  risksReport.isHighRisk
                    ? "bg-red-50 border-red-300 text-red-950"
                    : "bg-emerald-50 border-emerald-300 text-emerald-950"
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-6 h-6 ${risksReport.isHighRisk ? "text-red-600" : "text-emerald-600"}`} />
                  <div>
                    <h3 className="font-heading font-extrabold text-sm">
                      {risksReport.riskCategory}
                    </h3>
                    <p className="text-xs">
                      {risksReport.isHighRisk
                        ? "Se detectaron factores que requieren vigilancia obstétrica estrecha y plan de parto especializado."
                        : "Embarazo de bajo riesgo sin factores clínicos de alarma detectados."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Criterios de Alerta */}
              <div className="space-y-2">
                <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-slate-700">
                  Criterios de Vigilancia Evaluados en esta Gestante:
                </h4>
                {risksReport.warningFlags.length > 0 ? (
                  risksReport.warningFlags.map((flag, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 flex items-center gap-2 text-xs text-amber-950"
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <strong>{flag}</strong>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500 italic">No hay factores de riesgo activos.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pie de Acciones */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            Médico Responsable: <strong>{doctorProfile.doctorTitle} {doctorProfile.fullName}</strong> &bull; CMP {doctorProfile.cmp}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cerrar
            </button>
            <button
              type="button"
              onClick={handleSaveCard}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Guardar Carnet Prenatal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

