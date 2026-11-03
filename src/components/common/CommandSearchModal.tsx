"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Receipt,
  Pill,
  Users,
  ArrowRight,
  ExternalLink,
  Tag,
  Building2,
  Calendar,
  Sparkles,
  Command,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";

interface CommandSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "all" | "tariff" | "vademecum" | "patients";
}

export function CommandSearchModal({
  isOpen,
  onClose,
  initialTab = "all",
}: CommandSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "tariff" | "vademecum" | "patients">(initialTab);

  const { tariffItems, vademecumItems, patients } = useMedicalStore();

  // Enfocar input al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      setActiveTab(initialTab);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, initialTab]);

  // Manejador de teclado: ESC para cerrar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtrado reactivo en tiempo real (<20ms)
  const normalizedQuery = searchTerm.trim().toLowerCase();

  const filteredTariff = useMemo(() => {
    if (!normalizedQuery) return tariffItems;
    return tariffItems.filter(
      (item) =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.code.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery) ||
        item.description.toLowerCase().includes(normalizedQuery)
    );
  }, [tariffItems, normalizedQuery]);

  const filteredVademecum = useMemo(() => {
    if (!normalizedQuery) return vademecumItems;
    return vademecumItems.filter((med) => {
      const matchGeneric = med.genericName.toLowerCase().includes(normalizedQuery);
      const matchGroup = med.therapeuticGroup.toLowerCase().includes(normalizedQuery);
      const matchBrand = med.commercialBrands.some((b) =>
        b.brandName.toLowerCase().includes(normalizedQuery) ||
        b.laboratory.toLowerCase().includes(normalizedQuery)
      );
      return matchGeneric || matchGroup || matchBrand;
    });
  }, [vademecumItems, normalizedQuery]);

  const filteredPatients = useMemo(() => {
    if (!normalizedQuery) return patients;
    return patients.filter(
      (p) =>
        p.dni.includes(normalizedQuery) ||
        p.firstName.toLowerCase().includes(normalizedQuery) ||
        p.lastName.toLowerCase().includes(normalizedQuery)
    );
  }, [patients, normalizedQuery]);

  const totalResults =
    (activeTab === "all" || activeTab === "tariff" ? filteredTariff.length : 0) +
    (activeTab === "all" || activeTab === "vademecum" ? filteredVademecum.length : 0) +
    (activeTab === "all" || activeTab === "patients" ? filteredPatients.length : 0);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        className="bg-surface w-full max-w-3xl rounded-2xl border border-border shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all transform scale-100 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del Buscador */}
        <div className="p-4 border-b border-border bg-slate-50/50 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-soft text-primary flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por procedimiento, fármaco, marca comercial o DNI..."
              className="w-full bg-transparent text-sm sm:text-base font-medium text-heading placeholder:text-muted focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-muted bg-white border border-border rounded-md shadow-2xs">
              ESC para salir
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Pestañas de Filtrado */}
        <div className="px-4 py-2 border-b border-border bg-surface flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === "all"
                ? "bg-primary text-white font-semibold"
                : "text-muted hover:text-heading hover:bg-slate-100"
            }`}
          >
            <span>Todos los Resultados</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                activeTab === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {filteredTariff.length + filteredVademecum.length + filteredPatients.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("tariff")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === "tariff"
                ? "bg-amber-600 text-white font-semibold"
                : "text-muted hover:text-heading hover:bg-slate-100"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Tarifario ({filteredTariff.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("vademecum")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === "vademecum"
                ? "bg-indigo-600 text-white font-semibold"
                : "text-muted hover:text-heading hover:bg-slate-100"
            }`}
          >
            <Pill className="w-3.5 h-3.5" />
            <span>Vademécum & Marcas ({filteredVademecum.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("patients")}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shrink-0 ${
              activeTab === "patients"
                ? "bg-sky-600 text-white font-semibold"
                : "text-muted hover:text-heading hover:bg-slate-100"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Pacientes ({filteredPatients.length})</span>
          </button>
        </div>

        {/* Lista de Resultados con Scroll */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 divide-y divide-border">
          {totalResults === 0 && (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-muted flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-heading">
                No se encontraron resultados para &ldquo;{searchTerm}&rdquo;
              </p>
              <p className="text-xs text-muted max-w-sm mx-auto">
                Pruebe buscando por nombre de procedimiento (ej. &ldquo;colposcopía&rdquo;), principio activo (ej. &ldquo;dienogest&rdquo;), marca (ej. &ldquo;visannette&rdquo;) o DNI.
              </p>
            </div>
          )}

          {/* SECCIÓN 1: TARIFARIO MÉDICO */}
          {(activeTab === "all" || activeTab === "tariff") && filteredTariff.length > 0 && (
            <div className="pt-3 first:pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <Receipt className="w-3.5 h-3.5" />
                  Procedimientos y Exámenes Médicos ({filteredTariff.length})
                </span>
                <span className="text-[11px] font-normal text-muted">Precios en Soles (S/)</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredTariff.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-border hover:border-amber-400/60 bg-white hover:bg-amber-50/20 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                          {item.code}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-muted font-medium">
                          {item.category}
                        </span>
                        <h4 className="text-sm font-heading font-bold text-heading group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                      </div>
                      <p className="text-xs text-muted leading-relaxed line-clamp-1">
                        {item.description}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-base font-mono font-extrabold text-heading tabular-nums text-primary">
                        {formatCurrency(item.price)}
                      </p>
                      <span className="text-[10px] text-status-normal font-medium flex items-center justify-end gap-1">
                        Vigente CENDO
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 2: VADEMÉCUM (GENÉRICO -> MARCAS / PRECIOS) */}
          {(activeTab === "all" || activeTab === "vademecum") && filteredVademecum.length > 0 && (
            <div className="pt-4 first:pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-indigo-700">
                  <Pill className="w-3.5 h-3.5" />
                  Vademécum Ginecológico: Principio Activo &rarr; Marcas ({filteredVademecum.length})
                </span>
                <span className="text-[11px] font-normal text-muted">Costos Farmacias Perú</span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredVademecum.map((med) => (
                  <div
                    key={med.id}
                    className="p-3.5 rounded-xl border border-border bg-white hover:border-indigo-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-heading font-extrabold text-heading">
                            {med.genericName}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-muted rounded">
                            ATC: {med.atcCode}
                          </span>
                        </div>
                        <p className="text-xs text-muted font-medium mt-0.5">
                          {med.therapeuticGroup}
                        </p>
                      </div>
                      <span className="text-[11px] text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md shrink-0">
                        {med.commercialBrands.length} marcas referenciales
                      </span>
                    </div>

                    {/* Desglose de Marcas Comerciales y Precios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                      {med.commercialBrands.map((brand) => (
                        <div
                          key={brand.brandName}
                          className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 hover:bg-indigo-50/40 hover:border-indigo-200 transition-colors flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-heading">
                                {brand.brandName}
                              </span>
                              <span className="text-[10px] font-semibold text-muted">
                                {brand.laboratory}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted line-clamp-1 mt-0.5">
                              {brand.presentation}
                            </p>
                          </div>
                          <div className="mt-2 pt-1.5 border-t border-slate-200 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-muted">Ref. Boticas</span>
                            <span className="font-mono font-bold text-heading tabular-nums text-indigo-900">
                              {formatCurrency(brand.referencePricePen)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500 italic bg-slate-50/60 p-2 rounded-md">
                      <strong>Indicación:</strong> {med.indications}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECCIÓN 3: PACIENTES */}
          {(activeTab === "all" || activeTab === "patients") && filteredPatients.length > 0 && (
            <div className="pt-4 first:pt-0 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-muted uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-sky-700">
                  <Users className="w-3.5 h-3.5" />
                  Directorio de Pacientes ({filteredPatients.length})
                </span>
                <span className="text-[11px] font-normal text-muted">Acceso directo a historia</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredPatients.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onClose();
                      router.push(`/pacientes/${p.id}`);
                    }}
                    className="p-3 rounded-xl border border-border hover:border-sky-400 bg-white hover:bg-sky-50/30 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-accent-soft text-primary font-bold flex items-center justify-center shrink-0">
                        {p.firstName[0]}
                        {p.lastName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-heading font-bold text-heading group-hover:text-primary transition-colors flex items-center gap-2">
                          <span>
                            {p.lastName}, {p.firstName}
                          </span>
                          <span className="text-[11px] font-mono text-muted bg-slate-100 px-1.5 py-0.5 rounded">
                            DNI: {p.dni}
                          </span>
                        </h4>
                        <p className="text-xs text-muted">
                          {p.age} años &bull; {p.phone} &bull; {p.civilStatus}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 font-semibold text-xs group-hover:bg-primary group-hover:text-white transition-all flex items-center gap-1">
                      <span>Ver Ficha</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Pie del Buscador */}
        <div className="p-3 border-t border-border bg-slate-50 flex items-center justify-between text-xs text-muted">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-border font-mono text-[10px] shadow-2xs">
                Ctrl
              </kbd>
              +
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-border font-mono text-[10px] shadow-2xs">
                K
              </kbd>
              <span className="ml-1 text-[11px]">Buscador global</span>
            </span>
            <span className="hidden sm:inline text-slate-400">&bull;</span>
            <span className="hidden sm:inline text-[11px]">
              Dr. Patrick José Jacinto Gomero (CENDO)
            </span>
          </div>
          <span className="font-medium text-primary text-[11px]">
            {totalResults} resultado(s)
          </span>
        </div>
      </div>
    </div>
  );
}

