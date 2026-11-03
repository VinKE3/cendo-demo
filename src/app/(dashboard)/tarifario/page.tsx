"use client";

import React, { useState } from "react";
import {
  Receipt,
  Search,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Tag,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import { formatCurrency } from "@/lib/utils";
import { TariffModal } from "@/components/tarifario/TariffModal";
import { ProcedureTariff } from "@/types/medical";

export default function TarifarioPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProcedureTariff | null>(null);

  const { tariffItems, deleteTariffItem, updateTariffItem } = useMedicalStore();

  const categories = ["all", "Consulta", "Procedimiento", "Ecografía", "Laboratorio", "Paquete"];

  const filtered = tariffItems.filter((item) => {
    const matchCat = filterCategory === "all" || item.category === filterCategory;
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.code.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  const handleOpenCreate = () => {
    setSelectedItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ProcedureTariff) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: ProcedureTariff) => {
    Swal.fire({
      title: "¿Eliminar tarifa?",
      text: `¿Está seguro de eliminar "${item.name}" (${item.code}) del catálogo oficial?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deleteTariffItem(item.id);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: "El procedimiento ha sido retirado del tarifario.",
          confirmButtonColor: "#0A4D68",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleToggleActive = (item: ProcedureTariff) => {
    updateTariffItem(item.id, { active: !item.active });
  };

  return (
    <div className="space-y-6">
      {/* Cabecera y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs text-amber-800 font-semibold mb-1.5">
            <Receipt className="w-3.5 h-3.5 text-amber-600" />
            Tarifario Oficial &bull; Sede Miraflores
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Tarifario Médico CENDO
          </h1>
          <p className="text-xs text-muted">
            Catálogo oficial de precios para consultas ginecológicas, ecografías, colposcopía y procedimientos (S/)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>Nuevo Procedimiento / Examen</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar por código (ej. GIN-001) o nombre de examen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const count =
              cat === "all"
                ? tariffItems.length
                : tariffItems.filter((t) => t.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                  filterCategory === cat
                    ? "bg-primary text-white"
                    : "bg-surface text-muted hover:text-heading border border-border"
                }`}
              >
                <span>{cat === "all" ? "Todos" : cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterCategory === cat ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Tarifas con CRUD */}
      <div className="rounded-2xl bg-surface border border-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 text-muted uppercase font-bold text-[10px]">
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Procedimiento / Examen</th>
                <th className="py-3 px-4">Categoría</th>
                <th className="py-3 px-4">Descripción Clínica</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4 text-right">Precio Oficial</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors group">
                  {/* Código */}
                  <td className="py-3.5 px-4 font-mono font-bold text-primary whitespace-nowrap">
                    {item.code}
                  </td>

                  {/* Nombre */}
                  <td className="py-3.5 px-4 font-bold text-heading">
                    {item.name}
                  </td>

                  {/* Categoría */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold ${
                        item.category === "Procedimiento"
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : item.category === "Ecografía"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : item.category === "Laboratorio"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : item.category === "Paquete"
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {item.category}
                    </span>
                  </td>

                  {/* Descripción */}
                  <td className="py-3.5 px-4 text-muted max-w-sm">
                    <p className="line-clamp-2 leading-relaxed">
                      {item.description || "Sin descripción adicional"}
                    </p>
                  </td>

                  {/* Estado Activo / Inactivo con Toggle */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(item)}
                      title="Clic para cambiar estado"
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-colors ${
                        item.active
                          ? "bg-emerald-50 text-status-normal hover:bg-emerald-100"
                          : "bg-slate-100 text-muted hover:bg-slate-200"
                      }`}
                    >
                      {item.active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-status-normal" />
                          <span>Activo</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-muted" />
                          <span>Inactivo</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Precio Oficial */}
                  <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm text-primary tabular-nums whitespace-nowrap">
                    {formatCurrency(item.price)}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-slate-100 transition-colors"
                        title="Editar tarifa"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 rounded-lg text-muted hover:text-status-alert hover:bg-red-50 transition-colors"
                        title="Eliminar tarifa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center space-y-2">
                    <Receipt className="w-8 h-8 text-muted mx-auto" />
                    <p className="text-sm font-semibold text-heading">
                      No se encontraron procedimientos en el tarifario
                    </p>
                    <p className="text-xs text-muted">
                      Pruebe ajustando el término de búsqueda o seleccionando otra categoría.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Crear / Editar Tarifa */}
      <TariffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedItem}
      />
    </div>
  );
}
