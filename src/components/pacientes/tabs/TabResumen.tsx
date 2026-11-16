"use client";

import React from "react";
import {
  User,
  Activity,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Shield,
  AlertTriangle,
  Baby,
  MessageCircle,
  Printer,
} from "lucide-react";
import { Patient, PatientBackground, PrenatalCard, DoctorProfile } from "@/types/medical";
import { generatePrenatalWhatsAppUrl } from "@/lib/whatsappShare";
import { calculateAge } from "@/lib/utils";

interface TabResumenProps {
  patient: Patient;
  bg?: PatientBackground;
  furCalculation: { text: string; weeks: number; days: number } | null;
  prenatalCard?: PrenatalCard | null;
  doctorProfile?: DoctorProfile | null;
  onOpenEditPatient: () => void;
  onOpenEditBackground: () => void;
  onOpenPrenatalModal: () => void;
  onOpenPrenatalPrint: (card: PrenatalCard) => void;
}

export function TabResumen({
  patient,
  bg,
  furCalculation,
  prenatalCard,
  doctorProfile,
  onOpenEditPatient,
  onOpenEditBackground,
  onOpenPrenatalModal,
  onOpenPrenatalPrint,
}: TabResumenProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna 1: Filiación */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-heading font-extrabold text-xs uppercase tracking-wider text-muted flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Datos de Filiación
          </h3>
          <button
            onClick={onOpenEditPatient}
            className="text-[11px] text-primary font-semibold hover:underline"
          >
            Editar
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <span className="text-muted block text-[10px] uppercase font-bold">Fecha de Nacimiento</span>
            <p className="font-mono font-bold text-heading mt-0.5">
              {patient.birthDate} ({patient.age && patient.age > 0 ? patient.age : (patient.birthDate ? calculateAge(patient.birthDate) : 25)} años cumplidos)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted block text-[10px] uppercase font-bold">Lugar Nacimiento</span>
              <p className="font-medium text-heading mt-0.5 truncate">{patient.birthPlace || "Lima, Perú"}</p>
            </div>
            <div>
              <span className="text-muted block text-[10px] uppercase font-bold">Religión</span>
              <p className="font-medium text-heading mt-0.5 truncate">{patient.religion || "Católica"}</p>
            </div>
          </div>

          <div>
            <span className="text-muted block text-[10px] uppercase font-bold">Grado de Instrucción</span>
            <p className="font-semibold text-heading mt-0.5">{patient.educationLevel || "Superior Universitaria"}</p>
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
              <p className="font-semibold text-heading mt-0.5 truncate">{patient.occupation || "Profesional independiente"}</p>
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
              Historial obstétrico, método anticonceptivo, FUR y antecedentes patológicos (Modelo CENDO)
            </p>
          </div>

          <button
            onClick={onOpenEditBackground}
            className="px-3 py-1.5 rounded-lg bg-accent-soft text-primary font-semibold text-xs hover:bg-sky-100 transition-colors flex items-center gap-1"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">Fórmula Obstétrica</span>
            <p className="font-mono font-extrabold text-lg text-primary">{bg?.obstetricFormula || "G0 P0000"}</p>
            <p className="text-[10px] text-muted">Gestas &bull; Término/Prem/Aborto/Vivos</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">MAC Actual</span>
            <p className="font-bold text-heading text-sm">{bg?.contraceptiveMethod || "Ninguno"}</p>
            <p className="text-[10px] text-muted">Método Anticonceptivo</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
            <span className="text-[10px] text-amber-900 uppercase font-bold block flex items-center gap-1">
              <Calendar className="w-3 h-3 text-amber-700" />
              FUR (Última Regla)
            </span>
            <p className="font-mono font-bold text-sm text-heading">{bg?.lastMenstrualPeriod || "No especificada"}</p>
            {furCalculation && (
              <p className="text-[10px] font-bold text-amber-800 bg-white/80 px-1.5 py-0.5 rounded">
                {furCalculation.text}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-muted block text-[10px] uppercase font-bold">Menarquia</span>
            <p className="font-mono font-bold text-heading mt-0.5">{bg?.menarche ? `${bg.menarche} años` : "No precisa"}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-muted block text-[10px] uppercase font-bold">R/C (Régimen Cat.)</span>
            <p className="font-mono font-bold text-heading mt-0.5">{bg?.catamenialRegimen || "28/4"}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-muted block text-[10px] uppercase font-bold">IRS (Inicio Sex.)</span>
            <p className="font-mono font-bold text-heading mt-0.5">{bg?.sexualDebutAge ? `${bg.sexualDebutAge} años` : "No precisa"}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-muted block text-[10px] uppercase font-bold">NPS (N° Parejas)</span>
            <p className="font-mono font-bold text-heading mt-0.5">{bg?.sexualPartnersCount ?? "No precisa"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">ITS</span>
            <p className="font-medium text-heading leading-snug">{bg?.stiHistory || "Niega ITS"}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">Historial PAP</span>
            <p className="font-medium text-heading leading-snug">{bg?.papHistory || "Sin citología previa"}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] text-muted uppercase font-bold block">Historial VPH</span>
            <p className="font-medium text-heading leading-snug">{bg?.vphTestHistory || "No realizado"}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-border space-y-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary">
              Antecedentes Patológicos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Diabetes</span>
              <p className="font-medium text-heading mt-0.5">{bg?.hasDiabetes || "Niega"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Hipertensión</span>
              <p className="font-medium text-heading mt-0.5">{bg?.hasHypertension || "Niega"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-muted uppercase font-bold block">Asma</span>
              <p className="font-medium text-heading mt-0.5">{bg?.hasAsthma || "Niega"}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-200 space-y-1">
              <span className="text-[10px] text-rose-800 uppercase font-bold block flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                Alergias Medicamentosas
              </span>
              <p className="font-semibold text-rose-950">{bg?.medicalAllergies || "Niega alergias"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">Cirugías Previas</span>
              <p className="text-heading font-medium leading-snug">{bg?.surgeriesHistory || "Niega intervenciones"}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] text-muted uppercase font-bold block">Antecedentes Familiares</span>
              <p className="text-heading font-medium leading-snug">{bg?.familyHistory || "Sin antecedentes directos"}</p>
            </div>
          </div>
        </div>

        {/* Carnet Prenatal Card */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 space-y-2 mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Baby className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                    Carnet de Control Prenatal (MINSA / CLAP)
                  </span>
                  {prenatalCard && (
                    <span className="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-mono text-[9px] font-bold">
                      {prenatalCard.visits.length} de 9 atenciones
                    </span>
                  )}
                </div>
                <p className="text-[10.5px] text-amber-800">
                  {prenatalCard
                    ? `FUM: ${prenatalCard.baseline.fum} • FPP Naegele: ${prenatalCard.baseline.fpp}`
                    : "Esta paciente puede ser evaluada con el carnet perinatal de 9 atenciones oficiales."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              {prenatalCard && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const url = generatePrenatalWhatsAppUrl(patient, prenatalCard, doctorProfile);
                      window.open(url, "_blank");
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    title="Enviar resumen prenatal por WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenPrenatalPrint(prenatalCard)}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir</span>
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={onOpenPrenatalModal}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
              >
                <Baby className="w-3.5 h-3.5" />
                <span>{prenatalCard ? "Abrir Carnet" : "+ Iniciar Carnet"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
