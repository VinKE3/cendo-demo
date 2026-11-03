"use client";

import React, { useState } from "react";
import {
  Pill,
  Search,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Sparkles,
  AlertTriangle,
  Info,
} from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";
import { VademecumModal } from "@/components/vademecum/VademecumModal";
import { MedicationVademecum } from "@/types/medical";

export default function VademecumPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState<MedicationVademecum | null>(null);

  const { vademecumItems, deleteVademecumItem } = useMedicalStore();

  const filtered = vademecumItems.filter((med) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const matchGeneric = med.genericName.toLowerCase().includes(q);
    const matchGroup = med.therapeuticGroup.toLowerCase().includes(q);
    const matchAtc = med.atcCode.toLowerCase().includes(q);
    const matchBrand = med.commercialBrands.some(
      (b) =>
        b.brandName.toLowerCase().includes(q) ||
        b.laboratory.toLowerCase().includes(q) ||
        b.presentation.toLowerCase().includes(q)
    );
    return matchGeneric || matchGroup || matchAtc || matchBrand;
  });

  const handleOpenCreate = () => {
    setSelectedMed(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med: MedicationVademecum) => {
    setSelectedMed(med);
    setIsModalOpen(true);
  };

  const handleDelete = (med: MedicationVademecum) => {
    Swal.fire({
      title: "¿Eliminar fármaco?",
      text: `¿Desea retirar "${med.genericName}" y todas sus marcas del vademécum?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, retirar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deleteVademecumItem(med.id);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El medicamento ha sido retirado del vademécum.",
          confirmButtonColor: "#0A4D68",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs text-indigo-800 font-semibold mb-1.5">
            <Pill className="w-3.5 h-3.5 text-indigo-600" />
            Vademécum Ginecológico Especializado CENDO
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Vademécum y Precios en Farmacias Perú
          </h1>
          <p className="text-xs text-muted">
            Principios activos, marcas comerciales de laboratorios en Perú y costos referenciales al paciente (S/)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>Nuevo Medicamento / Marcas</span>
        </button>
      </div>

      {/* Buscador reactivo */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por principio activo (ej. Dienogest, Mupirocina), marca (ej. Visannette, Bactroban) o laboratorio (ej. Bayer, Roemmers)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
        />
      </div>

      {/* Grilla de Medicamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((med) => (
          <div
            key={med.id}
            className="p-5 rounded-2xl bg-surface border border-border shadow-xs hover:border-indigo-300/80 transition-all flex flex-col justify-between space-y-4 group"
          >
            {/* Cabecera del Medicamento */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      ATC: {med.atcCode}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold text-[11px]">
                      {med.commercialBrands.length} marcas
                    </span>
                  </div>
                  <h3 className="text-base font-heading font-extrabold text-heading">
                    {med.genericName}
                  </h3>
                  <p className="text-xs text-muted font-medium">
                    {med.therapeuticGroup}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleOpenEdit(med)}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-slate-100 transition-colors"
                    title="Editar fármaco y marcas"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(med)}
                    className="p-1.5 rounded-lg text-muted hover:text-status-alert hover:bg-red-50 transition-colors"
                    title="Eliminar fármaco"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lista de Marcas Comerciales Disponibles */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-muted">
                  <span className="flex items-center gap-1 text-slate-600">
                    <Building2 className="w-3 h-3 text-indigo-600" />
                    Marcas Comerciales Disponibles en Farmacias Perú
                  </span>
                  <span>Ref. Boticas</span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {med.commercialBrands.map((b, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200 flex items-center justify-between text-xs hover:bg-indigo-50/30 hover:border-indigo-200 transition-colors"
                    >
                      <div>
                        <p className="font-bold text-heading flex items-center gap-1.5">
                          <span>{b.brandName}</span>
                          <span className="font-normal text-muted text-[11px]">
                            &bull; {b.laboratory}
                          </span>
                        </p>
                        <p className="text-[10px] text-muted">{b.presentation}</p>
                      </div>
                      <span className="font-mono font-extrabold text-indigo-900 text-sm tabular-nums shrink-0 ml-2">
                        {formatCurrency(b.referencePricePen)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Indicaciones y Contraindicaciones Clínicas */}
            <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <p className="text-slate-700 leading-relaxed">
                  <strong className="text-heading">Indicación médica:</strong>{" "}
                  {med.indications}
                </p>
                {med.contraindications && (
                  <p className="text-amber-800 text-[11px] pt-1 border-t border-slate-200 flex items-start gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Contraindicación:</strong> {med.contraindications}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center rounded-2xl bg-surface border border-border space-y-2">
            <Pill className="w-8 h-8 text-muted mx-auto" />
            <p className="text-sm font-semibold text-heading">
              No se encontraron medicamentos en el vademécum
            </p>
            <p className="text-xs text-muted">
              Pruebe buscando por principio activo, marca comercial o cree un nuevo fármaco.
            </p>
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Fármaco */}
      <VademecumModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedMed}
      />
    </div>
  );
}
