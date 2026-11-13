"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  FileCheck2,
  Edit2,
  Plus,
  Clock,
  Sparkles,
  AlertTriangle,
  FileText,
  Stethoscope,
  ShieldCheck,
  MessageCircle,
  Pill,
  Printer,
  Trash2,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import { PatientModal } from "@/components/pacientes/PatientModal";
import { PatientBackgroundModal } from "@/components/pacientes/PatientBackgroundModal";
import { ColposcopyModal } from "@/components/colposcopia/ColposcopyModal";
import { CheckupModal } from "@/components/chequeos/CheckupModal";
import { PrescriptionModal } from "@/components/recetas/PrescriptionModal";
import { PrescriptionPrintView } from "@/components/export/PrescriptionPrintView";
import { printHtmlElement } from "@/lib/pdfGenerator";
import { Patient, ColposcopyReport, ClinicalCheckup, MedicalPrescription } from "@/types/medical";
import {
  generateColposcopyWhatsAppUrl,
  generateCheckupWhatsAppUrl,
  generatePrescriptionWhatsAppUrl,
} from "@/lib/whatsappShare";

export default function FichaPacientePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isColpoModalOpen, setIsColpoModalOpen] = useState(false);
  const [editingColpo, setEditingColpo] = useState<ColposcopyReport | null>(null);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState<ClinicalCheckup | null>(null);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<MedicalPrescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<MedicalPrescription | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const {
    getPatientById,
    getBackground,
    getColposcopyByPatientId,
    getCheckupsByPatientId,
    getPrescriptionsByPatientId,
    deletePrescription,
    doctorProfile,
  } = useMedicalStore();

  const patient = getPatientById(patientId);
  const bg = getBackground(patientId);
  const colpos = getColposcopyByPatientId(patientId);
  const checkups = getCheckupsByPatientId(patientId);
  const prescriptions = getPrescriptionsByPatientId(patientId);

  // Calculadora Automática de Semanas / Días de Amenorrea por FUR
  const furCalculation = useMemo(() => {
    if (!bg?.lastMenstrualPeriod) return null;
    const furDate = new Date(bg.lastMenstrualPeriod + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - furDate.getTime();
    if (diffTime < 0) return null;

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return {
      days: diffDays,
      weeks,
      remainingDays,
      text: `${weeks} sem ${remainingDays} d (${diffDays} días de amenorrea)`,
    };
  }, [bg?.lastMenstrualPeriod]);

  if (!patient) {
    return (
      <div className="py-16 text-center space-y-4">
        <User className="w-12 h-12 mx-auto text-muted" />
        <h2 className="text-lg font-heading font-bold text-heading">
          Paciente no encontrada
        </h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          La historia clínica solicitada no existe o fue eliminada del sistema.
        </p>
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Pacientes</span>
        </Link>
      </div>
    );
  }

  const patientFullName = `${patient.lastName}, ${patient.firstName}`;

  return (
    <div className="space-y-6">
      {/* 1. Barra Superior de Navegación y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/pacientes"
            className="p-2.5 rounded-xl bg-surface border border-border text-muted hover:text-heading hover:bg-slate-100 transition-colors shadow-2xs"
            title="Volver a la lista de pacientes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-heading font-extrabold text-heading">
                {patient.lastName}, {patient.firstName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-soft text-primary border border-primary/20">
                DNI {patient.dni}
              </span>
            </div>
            <p className="text-xs text-muted font-mono mt-0.5">
              Historia Clínica CENDO &bull; {patient.age} años &bull; {patient.civilStatus} &bull; {patient.occupation || "Sin ocupación registrada"}
            </p>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-heading hover:bg-slate-100 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted" />
            <span>Editar Datos</span>
          </button>

          <button
            onClick={() => {
              setEditingColpo(null);
              setIsColpoModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <FileCheck2 className="w-3.5 h-3.5 text-secondary" />
            <span>+ Nueva Colposcopía</span>
          </button>

          <button
            onClick={() => {
              setEditingCheckup(null);
              setIsCheckupModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Nuevo Chequeo / Eco</span>
          </button>

          <button
            onClick={() => {
              setEditingPrescription(null);
              setIsPrescriptionModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Pill className="w-3.5 h-3.5 text-emerald-600" />
            <span>+ Emitir Receta</span>
          </button>
        </div>
      </div>

      {/* 2. Cuadrícula Principal: Datos Personales + Antecedentes Gineco-Obstétricos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna 1: Datos de Filiación y Contacto */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-muted flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Datos de Filiación
            </h3>
            <button
              onClick={() => setIsPatientModalOpen(true)}
              className="text-[11px] text-primary font-semibold hover:underline"
            >
              Editar
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-muted block text-[10px] uppercase font-bold">Fecha de Nacimiento</span>
              <p className="font-mono font-bold text-heading mt-0.5">
                {patient.birthDate} ({patient.age} años cumplidos)
              </p>
            </div>

            <div>
              <span className="text-muted block text-[10px] uppercase font-bold">Teléfono / WhatsApp</span>
              <p className="font-mono font-bold text-heading mt-0.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-muted" />
                {patient.phone}
              </p>
            </div>

            {patient.email && (
              <div>
                <span className="text-muted block text-[10px] uppercase font-bold">Correo Electrónico</span>
                <p className="text-heading font-medium mt-0.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-muted" />
                  {patient.email}
                </p>
              </div>
            )}

            <div>
              <span className="text-muted block text-[10px] uppercase font-bold">Dirección</span>
              <p className="text-heading font-medium mt-0.5 flex items-start gap-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                <span>{patient.address || "No especificada"}</span>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/80">
              <div>
                <span className="text-muted block text-[10px] uppercase font-bold">Estado Civil</span>
                <p className="font-semibold text-heading mt-0.5">{patient.civilStatus}</p>
              </div>
              <div>
                <span className="text-muted block text-[10px] uppercase font-bold">Ocupación</span>
                <p className="font-semibold text-heading mt-0.5 truncate">{patient.occupation || "No refiere"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna 2 y 3: Antecedentes Gineco-Obstétricos Persistentes */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-muted flex items-center gap-2">
                <Activity className="w-4 h-4 text-secondary" />
                Antecedentes Gineco-Obstétricos Persistentes
              </h3>
              <p className="text-[11px] text-muted">
                Historial obstétrico, método anticonceptivo, FUR y antecedentes patológicos
              </p>
            </div>

            <button
              onClick={() => setIsBgModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-accent-soft text-primary font-semibold text-xs hover:bg-sky-100 transition-colors flex items-center gap-1"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Fórmula Obstétrica */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                Fórmula Obstétrica
              </span>
              <p className="font-mono font-extrabold text-lg text-primary">
                {bg?.obstetricFormula || "G0 P0000"}
              </p>
              <p className="text-[10px] text-muted">Gestas &bull; Término/Prem/Aborto/Vivos</p>
            </div>

            {/* MAC Actual */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                MAC Actual
              </span>
              <p className="font-bold text-heading text-sm">
                {bg?.contraceptiveMethod || "Ninguno"}
              </p>
              <p className="text-[10px] text-muted">Método Anticonceptivo</p>
            </div>

            {/* FUR y Amenorrea Calculada */}
            <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
              <span className="text-[10px] text-amber-900 uppercase font-bold block flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-700" />
                FUR (Última Regla)
              </span>
              <p className="font-mono font-bold text-sm text-heading">
                {bg?.lastMenstrualPeriod || "No especificada"}
              </p>
              {furCalculation && (
                <p className="text-[10px] font-bold text-amber-800 bg-white/80 px-1.5 py-0.5 rounded">
                  {furCalculation.text}
                </p>
              )}
            </div>
          </div>

          {/* Menarquia, IRS y Parejas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">Menarquia</span>
              <p className="font-mono font-bold text-heading mt-0.5">
                {bg?.menarche ? `${bg.menarche} años` : "No precisa"}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">IRS (Inicio Sex.)</span>
              <p className="font-mono font-bold text-heading mt-0.5">
                {bg?.sexualDebutAge ? `${bg.sexualDebutAge} años` : "No precisa"}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-muted block text-[10px] uppercase font-bold">N° Parejas Sex.</span>
              <p className="font-mono font-bold text-heading mt-0.5">
                {bg?.sexualPartnersCount ?? "No precisa"}
              </p>
            </div>
          </div>

          {/* Historial Citológico PAP y VPH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                Historial Papanicolaou (PAP)
              </span>
              <p className="font-medium text-heading leading-snug">
                {bg?.papHistory || "Sin antecedentes citológicos registrados"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                Historial Test Molecular VPH
              </span>
              <p className="font-medium text-heading leading-snug">
                {bg?.vphTestHistory || "No realizado previamente"}
              </p>
            </div>
          </div>

          {/* Alergias, Cirugías y Familiares */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Alergias Medicamentosas
              </span>
              <p className="font-semibold text-heading">
                {bg?.medicalAllergies || "Niega alergias"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                Cirugías Previas
              </span>
              <p className="text-heading font-medium leading-snug">
                {bg?.surgeriesHistory || "Niega intervenciones"}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">
                Antecedentes Familiares
              </span>
              <p className="text-heading font-medium leading-snug">
                {bg?.familyHistory || "Sin antecedentes oncológicos o miomatosos"}
              </p>
            </div>
          </div>

          {bg?.notes && (
            <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
              <span className="text-[10px] text-muted uppercase font-bold block">Notas Adicionales:</span>
              <p className="text-slate-700 italic mt-0.5">{bg.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Atenciones y Exámenes Realizados de esta Paciente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Colposcopías de la Paciente */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-bold text-sm text-heading">
                Informes de Colposcopía ({colpos.length})
              </h3>
            </div>
            <button
              onClick={() => {
                setEditingColpo(null);
                setIsColpoModalOpen(true);
              }}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Evaluación</span>
            </button>
          </div>

          <div className="space-y-3">
            {colpos.length > 0 ? (
              colpos.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      ID: {c.id}
                    </span>
                    <span className="text-xs font-mono font-semibold text-muted">
                      {c.reportDate}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-heading leading-snug">
                    {c.diagnosis}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted pt-1 border-t border-slate-200">
                    <span>ZT: <strong>{c.transformationZoneType}</strong></span>
                    <span>&bull;</span>
                    <span>Schiller: <strong>{c.schillerTest}</strong></span>
                    <span>&bull;</span>
                    <span>Biopsia: <strong>{c.cervicalBiopsyTaken ? "Sí" : "No"}</strong></span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    {patient && (
                      <button
                        onClick={() => {
                          const url = generateColposcopyWhatsAppUrl(patient, c, doctorProfile);
                          window.open(url, "_blank");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        title="Enviar resumen por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingColpo(c);
                        setIsColpoModalOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <Link
                      href="/colposcopia"
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Ver en Colposcopía &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1">
                <FileCheck2 className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs font-semibold text-heading">Sin evaluaciones colposcópicas</p>
                <p className="text-[11px] text-muted">
                  Inicie una nueva evaluación para esta paciente cuando corresponda.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chequeos y Ecografías de la Paciente */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="font-heading font-bold text-sm text-heading">
                Chequeos y Ecografías ({checkups.length})
              </h3>
            </div>
            <button
              onClick={() => {
                setEditingCheckup(null);
                setIsCheckupModalOpen(true);
              }}
              className="text-xs text-indigo-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Chequeo</span>
            </button>
          </div>

          <div className="space-y-3">
            {checkups.length > 0 ? (
              checkups.map((chk) => (
                <div
                  key={chk.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-100 text-indigo-800">
                      ID: {chk.id}
                    </span>
                    <span className="text-xs font-mono font-semibold text-muted">
                      {chk.checkupDate}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-heading leading-snug">
                    {chk.conclusions || chk.reasonForConsultation}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted pt-1 border-t border-slate-200">
                    <span>Mama: <strong>{chk.breastUltrasoundBirads}</strong></span>
                    <span>&bull;</span>
                    <span>Útero: <strong>{chk.uterusMeasurements}</strong></span>
                    <span>&bull;</span>
                    <span>Endometrio: <strong>{chk.endometriumThicknessMm} mm</strong></span>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    {patient && (
                      <button
                        onClick={() => {
                          const url = generateCheckupWhatsAppUrl(patient, chk, doctorProfile);
                          window.open(url, "_blank");
                        }}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                        title="Enviar conclusiones por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setEditingCheckup(chk);
                        setIsCheckupModalOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-indigo-700 transition-colors cursor-pointer"
                    >
                      Editar
                    </button>
                    <Link
                      href="/chequeos"
                      className="text-xs font-semibold text-indigo-700 hover:underline"
                    >
                      Ver en Chequeos &rarr;
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1">
                <Activity className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs font-semibold text-heading">Sin chequeos registrados</p>
                <p className="text-[11px] text-muted">
                  Registre ecografías de mama o transvaginales para la paciente.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Recetas Médicas Emitidas para la Paciente */}
        <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-emerald-600" />
              <h3 className="font-heading font-bold text-sm text-heading">
                Recetas Médicas Emitidas ({prescriptions.length})
              </h3>
            </div>
            <button
              onClick={() => {
                setEditingPrescription(null);
                setIsPrescriptionModalOpen(true);
              }}
              className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Receta</span>
            </button>
          </div>

          <div className="space-y-3">
            {prescriptions.length > 0 ? (
              prescriptions.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-emerald-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      REC-{rec.id.replace("rec-", "").slice(0, 8)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-muted">
                      {rec.prescriptionDate}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-heading leading-snug">
                    {rec.diagnosis || "Sin diagnóstico especificado"}
                  </p>

                  {/* Medicamentos Prescritos */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-200">
                    {rec.items.map((item, idx) => (
                      <div key={item.id} className="text-xs text-slate-700 flex items-start gap-1.5">
                        <span className="font-bold text-emerald-700 font-mono text-[11px] shrink-0">
                          {idx + 1}.
                        </span>
                        <div>
                          <strong>{item.medicationName}</strong>: {item.dosage} &bull; {item.frequency} &bull; {item.duration}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        const url = generatePrescriptionWhatsAppUrl(patient, rec, doctorProfile);
                        window.open(url, "_blank");
                      }}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      title="Enviar receta por WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      onClick={() => {
                        setViewingPrescription(rec);
                        setIsPrintModalOpen(true);
                      }}
                      className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Ver / Imprimir</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingPrescription(rec);
                        setIsPrescriptionModalOpen(true);
                      }}
                      className="text-xs font-semibold text-slate-700 hover:text-primary transition-colors cursor-pointer"
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => {
                        Swal.fire({
                          title: "¿Eliminar Receta?",
                          text: "Esta acción no se puede deshacer.",
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#EF4444",
                          confirmButtonText: "Sí, eliminar",
                          cancelButtonText: "Cancelar",
                        }).then((res) => {
                          if (res.isConfirmed) {
                            deletePrescription(rec.id);
                          }
                        });
                      }}
                      className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center space-y-1">
                <Pill className="w-8 h-8 text-muted mx-auto" />
                <p className="text-xs font-semibold text-heading">Sin recetas médicas emitidas</p>
                <p className="text-[11px] text-muted">
                  Emita una receta médica conectada al vademécum con selección de dosis en 1 clic.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales de Edición */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        initialData={patient}
      />

      <PatientBackgroundModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        patientId={patient.id}
        patientName={patientFullName}
        initialData={bg}
      />

      {/* Modales de Colposcopía y Chequeo integrados */}
      <ColposcopyModal
        isOpen={isColpoModalOpen}
        onClose={() => setIsColpoModalOpen(false)}
        initialData={editingColpo}
        defaultPatientId={patient.id}
      />

      <CheckupModal
        isOpen={isCheckupModalOpen}
        onClose={() => setIsCheckupModalOpen(false)}
        initialData={editingCheckup}
        defaultPatientId={patient.id}
      />

      {/* Modal de Receta Médica Inteligente */}
      <PrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        patient={patient}
        prescriptionToEdit={editingPrescription}
        onSavedAndPrint={(savedRec) => {
          setViewingPrescription(savedRec);
          setIsPrintModalOpen(true);
        }}
      />

      {/* Modal de Previsualización e Impresión de Receta */}
      {isPrintModalOpen && viewingPrescription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-primary px-6 py-4 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-secondary" />
                <h3 className="text-base font-heading font-bold">
                  Previsualización de Receta Médica Oficial (RP/)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = generatePrescriptionWhatsAppUrl(patient, viewingPrescription, doctorProfile);
                    window.open(url, "_blank");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => printHtmlElement("prescription-print-sheet", `Receta_${patient.lastName}_${patient.firstName}`)}
                  className="px-4 py-1.5 rounded-lg bg-secondary hover:bg-secondary-hover text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-8 overflow-y-auto bg-slate-100 flex justify-center flex-1">
              <PrescriptionPrintView
                prescription={viewingPrescription}
                patient={patient}
                doctor={doctorProfile}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
