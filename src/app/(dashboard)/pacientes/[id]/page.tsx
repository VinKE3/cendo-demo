"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, User, Calendar, Phone, Mail, MapPin, Activity, FileCheck2 } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function FichaPacientePage() {
  const params = useParams();
  const patientId = params.id as string;
  const { getPatientById, getBackground, getColposcopyByPatientId, getCheckupsByPatientId } =
    useMedicalStore();

  const patient = getPatientById(patientId) || useMedicalStore((s) => s.patients[0]);
  const bg = getBackground(patient?.id || "");
  const colpos = getColposcopyByPatientId(patient?.id || "");
  const checkups = getCheckupsByPatientId(patient?.id || "");

  if (!patient) {
    return (
      <div className="py-12 text-center space-y-3">
        <p className="text-sm font-semibold text-heading">Paciente no encontrada</p>
        <Link href="/pacientes" className="text-xs text-primary underline">
          Volver al directorio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/pacientes"
          className="p-2 rounded-xl bg-surface border border-border text-muted hover:text-heading hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            {patient.lastName}, {patient.firstName}
          </h1>
          <p className="text-xs text-muted font-mono">
            DNI: {patient.dni} &bull; {patient.age} años &bull; {patient.civilStatus} &bull; {patient.occupation}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Datos Personales */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
            Datos de Filiación
          </h3>
          <div className="space-y-2 text-xs">
            <p><strong className="text-heading">Teléfono:</strong> {patient.phone}</p>
            <p><strong className="text-heading">Email:</strong> {patient.email}</p>
            <p><strong className="text-heading">Dirección:</strong> {patient.address}</p>
            <p><strong className="text-heading">Fecha Nac:</strong> {patient.birthDate}</p>
          </div>
        </div>

        {/* Antecedentes Gineco-Obstétricos */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
            Antecedentes Gineco-Obstétricos
          </h3>
          <div className="space-y-1.5 text-xs">
            <p><strong className="text-heading">Fórmula Obstétrica:</strong> <span className="font-mono font-bold text-primary">{bg?.obstetricFormula}</span></p>
            <p><strong className="text-heading">MAC Actual:</strong> {bg?.contraceptiveMethod}</p>
            <p><strong className="text-heading">FUR:</strong> {bg?.lastMenstrualPeriod}</p>
            <p><strong className="text-heading">Menarquia:</strong> {bg?.menarche} años &bull; <strong className="text-heading">IRS:</strong> {bg?.sexualDebutAge} años</p>
            <p><strong className="text-heading">Historial PAP:</strong> {bg?.papHistory}</p>
            <p><strong className="text-heading">Test VPH:</strong> {bg?.vphTestHistory}</p>
          </div>
        </div>

        {/* Informes Realizados */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3">
          <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-muted">
            Atenciones Registradas
          </h3>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
              <p className="font-bold text-emerald-900">Colposcopía Digital</p>
              <p className="text-[11px] text-emerald-800">
                {colpos[0]?.reportDate} - {colpos[0]?.diagnosis}
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-sky-50 border border-sky-200">
              <p className="font-bold text-sky-900">Chequeo Ginecológico</p>
              <p className="text-[11px] text-sky-800">
                {checkups[0]?.checkupDate} - Mama BI-RADS 2 / TV Normal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

