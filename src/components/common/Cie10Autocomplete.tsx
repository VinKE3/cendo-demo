"use client";

import React, { useState, useRef, useEffect } from "react";
import { Search, Sparkles, Check, Hash, BookOpen, Plus, Star } from "lucide-react";
import { searchCie10, getCie10ByCode, Cie10Item } from "@/modules/catalogo/cie10Catalog";
import { useMedicalStore } from "@/store/useMedicalStore";
import { Cie10Modal } from "@/components/cie10/Cie10Modal";

interface Cie10AutocompleteProps {
  diagnosis: string;
  cie10Code: string;
  onChange: (diagnosis: string, cie10Code: string) => void;
  label?: string;
  required?: boolean;
  className?: string;
}

const DEFAULT_QUICK_PRESETS = [
  { label: "Chequeo Preventivo (Z01.4)", code: "Z01.4", name: "Examen ginecológico general de rutina / Chequeo preventivo anual" },
  { label: "Endometriosis Ovárica (N80.1)", code: "N80.1", name: "Endometriosis ovárica (Endometrioma ovárico)" },
  { label: "Displasia Cervical NIC 2 (N87.1)", code: "N87.1", name: "Displasia cervical moderada / Neoplasia intraepitelial cervical NIC 2" },
  { label: "Vaginosis / Flujo (N76.0)", code: "N76.0", name: "Vaginitis aguda / Vaginosis bacteriana / Candidiasis" },
  { label: "Control Prenatal I (Z34.0)", code: "Z34.0", name: "Supervisión de primer embarazo normal (Control prenatal I Trimestre)" },
  { label: "Diabetes Gestacional (O24.4)", code: "O24.4", name: "Diabetes mellitus gestacional (DMG)" },
];

export function Cie10Autocomplete({
  diagnosis,
  cie10Code,
  onChange,
  label = "Diagnóstico Principal & Código CIE-10",
  required = false,
  className = "",
}: Cie10AutocompleteProps) {
  const { cie10Catalog } = useMedicalStore();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(diagnosis);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchTerm(diagnosis);
  }, [diagnosis]);

  // Cerrar dropdown al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = searchCie10(searchTerm, cie10Catalog, 8);

  // Chips dinámicos de favoritos
  const favoriteItems = (cie10Catalog || []).filter((i) => i.isFavorite).slice(0, 6);
  const quickPresets = favoriteItems.length > 0
    ? favoriteItems.map((f) => ({
        label: `${f.code} - ${f.name.split("/")[0].trim().slice(0, 26)}`,
        code: f.code,
        name: f.name,
      }))
    : DEFAULT_QUICK_PRESETS;

  const handleSelect = (item: Cie10Item) => {
    onChange(item.name, item.code);
    setSearchTerm(item.name);
    setIsOpen(false);
  };

  const handleCie10CodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCode = e.target.value.toUpperCase();
    const matched = getCie10ByCode(newCode, cie10Catalog);
    if (matched) {
      onChange(matched.name, matched.code);
      setSearchTerm(matched.name);
    } else {
      onChange(diagnosis, newCode);
    }
  };

  return (
    <div ref={containerRef} className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-heading flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsNewModalOpen(true)}
              className="text-[10px] font-bold text-primary hover:text-primary-dark hover:underline flex items-center gap-1 cursor-pointer transition-colors"
              title="Registrar un nuevo diagnóstico en el catálogo CIE-10"
            >
              <Plus className="w-3 h-3" />
              <span>+ Nuevo CIE-10</span>
            </button>
            <span className="text-[10px] text-muted font-mono hidden sm:inline">
              &bull; Escriba nombre o código
            </span>
          </div>
        </div>
      )}

      {/* Chips Rápidos de Diagnóstico / Favoritos */}
      <div className="flex flex-wrap gap-1 pb-1">
        {quickPresets.map((qp) => (
          <button
            key={qp.code}
            type="button"
            onClick={() => {
              onChange(qp.name, qp.code);
              setSearchTerm(qp.name);
              setIsOpen(false);
            }}
            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer border flex items-center gap-1 ${
              cie10Code === qp.code
                ? "bg-primary text-white border-primary shadow-2xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            }`}
          >
            <span>{qp.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 relative">
        {/* Input Diagnóstico / Nombre */}
        <div className="sm:col-span-9 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              onChange(e.target.value, cie10Code);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Escriba el diagnóstico (ej. Endometriosis, NIC 2, Miomatosis, Preeclampsia, Diabetes Gestacional)..."
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:border-primary focus:bg-white focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />

          {/* Menú Desplegable con Sugerencias */}
          {isOpen && results.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden max-h-60 overflow-y-auto animate-in fade-in duration-150">
              <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-bold uppercase">
                <span>Diagnósticos Sugeridos CENDO</span>
                <span className="font-mono">{results.length} coincidencias</span>
              </div>
              {results.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full px-3 py-2 text-left hover:bg-primary/5 border-b border-slate-100 last:border-none flex items-center justify-between gap-2 transition-colors cursor-pointer"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-[10px] text-muted">
                      Categoría: {item.category.replace(/_/g, " ")}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-emerald-100 text-emerald-800 shrink-0">
                    {item.code}
                  </span>
                </button>
              ))}
              <div className="p-2 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsNewModalOpen(true);
                  }}
                  className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>¿No encuentra el diagnóstico? Registrar nuevo código CIE-10</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Input Código CIE-10 */}
        <div className="sm:col-span-3 relative">
          <input
            type="text"
            value={cie10Code}
            onChange={handleCie10CodeChange}
            placeholder="CIE-10"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-extrabold text-primary uppercase focus:border-primary focus:bg-white focus:outline-none"
            title="Código CIE-10 oficial"
          />
          <Hash className="w-3.5 h-3.5 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* Modal para Crear Diagnóstico al vuelo */}
      <Cie10Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        initialCode={cie10Code}
        initialName={searchTerm}
      />
    </div>
  );
}
