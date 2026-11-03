"use client";

import React, { useState } from "react";
import { Pill, Search, Tag, Building2 } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";

export default function VademecumPage() {
  const [search, setSearch] = useState("");
  const vademecumItems = useMedicalStore((state) => state.vademecumItems);

  const filtered = vademecumItems.filter((med) => {
    const q = search.toLowerCase();
    const matchGeneric = med.genericName.toLowerCase().includes(q);
    const matchGroup = med.therapeuticGroup.toLowerCase().includes(q);
    const matchBrand = med.commercialBrands.some((b) =>
      b.brandName.toLowerCase().includes(q) || b.laboratory.toLowerCase().includes(q)
    );
    return matchGeneric || matchGroup || matchBrand;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Vademécum Ginecológico y Costos
          </h1>
          <p className="text-xs text-muted">
            Principios activos, marcas comerciales de laboratorios en Perú y precios referenciales en farmacias (S/)
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por principio activo (ej. Mupirocina, Dienogest) o marca (ej. Visannette, Bactroban)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((med) => (
          <div
            key={med.id}
            className="p-5 rounded-2xl bg-surface border border-border shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-muted bg-slate-100 px-1.5 py-0.5 rounded">
                  ATC: {med.atcCode}
                </span>
                <h3 className="text-base font-heading font-extrabold text-heading mt-1">
                  {med.genericName}
                </h3>
                <p className="text-xs text-muted font-medium">{med.therapeuticGroup}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-xs shrink-0">
                {med.commercialBrands.length} marcas
              </span>
            </div>

            {/* Marcas y Precios */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase font-bold text-muted">
                Marcas Comerciales Disponibles en Perú
              </p>
              <div className="space-y-1.5">
                {med.commercialBrands.map((b) => (
                  <div
                    key={b.brandName}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-heading">
                        {b.brandName}{" "}
                        <span className="font-normal text-muted text-[11px]">
                          ({b.laboratory})
                        </span>
                      </p>
                      <p className="text-[10px] text-muted">{b.presentation}</p>
                    </div>
                    <span className="font-mono font-bold text-heading tabular-nums text-indigo-900 text-sm">
                      {formatCurrency(b.referencePricePen)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-slate-500 italic bg-slate-50/50 p-2.5 rounded-xl">
              <strong>Indicación clínica:</strong> {med.indications}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

