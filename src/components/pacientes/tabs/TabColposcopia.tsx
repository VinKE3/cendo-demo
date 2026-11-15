"use client";

import React from "react";
import Link from "next/link";
import { FileCheck2, Activity, Plus, MessageCircle } from "lucide-react";
import { Patient, ColposcopyReport, ClinicalCheckup, DoctorProfile } from "@/types/medical";
import { generateColposcopyWhatsAppUrl, generateCheckupWhatsAppUrl } from "@/lib/whatsappShare";

interface TabColposcopiaProps {
  patient: Patient;
  colpos: ColposcopyReport[];
  checkups: ClinicalCheckup[];
  doctorProfile?: DoctorProfile | null;
  onOpenNewColpo: () => void;
  onEditColpo: (colpo: ColposcopyReport) => void;
  onOpenNewCheckup: () => void;
  onEditCheckup: (chk: ClinicalCheckup) => void;
}

export function TabColposcopia({
  patient,
  colpos,
  checkups,
  doctorProfile,
  onOpenNewColpo,
  onEditColpo,
  onOpenNewCheckup,
  onEditCheckup,
}: TabColposcopiaProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Colposcopías IFCPC 2011 */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-heading font-bold text-sm text-heading">
              Informes de Colposcopía ({colpos.length})
            </h3>
          </div>
          <button
            onClick={onOpenNewColpo}
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
                  <button
                    onClick={() => onEditColpo(c)}
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

      {/* Chequeos Rápidos */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            <h3 className="font-heading font-bold text-sm text-heading">
              Chequeos Rápidos ({checkups.length})
            </h3>
          </div>
          <button
            onClick={onOpenNewCheckup}
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
                  <button
                    onClick={() => onEditCheckup(chk)}
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
                Registre chequeos ginecológicos rápidos para la paciente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
