"use client";

import React, { useState } from "react";
import { Receipt, Search, Plus, Tag, CheckCircle2 } from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";

export default function TarifarioPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const tariffItems = useMedicalStore((state) => state.tariffItems);

  const categories = ["all", "Consulta", "Procedimiento", "Ecografía", "Laboratorio", "Paquete"];

  const filtered = tariffItems.filter((item) => {
    const matchCat = filterCategory === "all" || item.category === filterCategory;
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Tarifario Médico CENDO
          </h1>
          <p className="text-xs text-muted">
            Catálogo oficial de precios para consultas, ecografías, colposcopía y procedimientos (S/)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por código o nombre de examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
                filterCategory === cat
                  ? "bg-primary text-white"
                  : "bg-surface text-muted hover:text-heading border border-border"
              }`}
            >
              {cat === "all" ? "Todos" : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Tarifas */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-muted uppercase font-bold text-[10px]">
                <th className="py-3 px-3">Código</th>
                <th className="py-3 px-3">Nombre del Procedimiento</th>
                <th className="py-3 px-3">Categoría</th>
                <th className="py-3 px-3">Descripción Clínica</th>
                <th className="py-3 px-3 text-right">Precio Oficial</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-3 font-mono font-bold text-primary">{item.code}</td>
                  <td className="py-3.5 px-3 font-semibold text-heading">{item.name}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-muted font-medium text-[11px]">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-muted max-w-xs">{item.description}</td>
                  <td className="py-3.5 px-3 text-right font-mono font-bold text-sm text-heading tabular-nums text-primary">
                    {formatCurrency(item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

