"use client";

import React from "react";
import Link from "next/link";
import { Users, Plus, Search, Eye, ArrowRight } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";

export default function PacientesPage() {
  const patients = useMedicalStore((state) => state.patients);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Directorio de Pacientes
          </h1>
          <p className="text-xs text-muted">
            Registro y fichas clínicas gineco-obstétricas de CENDO
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        <div className="divide-y divide-border">
          {patients.map((p) => (
            <div
              key={p.id}
              className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 p-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent-soft text-primary font-bold flex items-center justify-center shrink-0">
                  {p.firstName[0]}
                  {p.lastName[0]}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-heading text-base">
                    {p.lastName}, {p.firstName}
                  </h3>
                  <p className="text-xs text-muted font-mono">
                    DNI: <span className="font-semibold text-heading">{p.dni}</span> &bull; {p.age} años &bull; {p.phone}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{p.address}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Link
                  href={`/pacientes/${p.id}`}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Ver Historia Clínica</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

