"use client";

import React, { useState } from "react";
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  Star,
  RotateCcw,
  Tag,
  CheckCircle2,
  Layers,
  Activity,
  HeartPulse,
} from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  Cie10Item,
  Cie10Category,
  CIE10_CATEGORY_LABELS,
} from "@/modules/catalogo/cie10Catalog";
import { Cie10Modal } from "@/components/cie10/Cie10Modal";

export default function Cie10Page() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<Cie10Item | null>(null);

  const {
    cie10Catalog,
    deleteCie10Item,
    toggleCie10Favorite,
    resetCie10Catalog,
  } = useMedicalStore();

  const handleOpenCreate = () => {
    setItemToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: Cie10Item) => {
    setItemToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = (item: Cie10Item) => {
    Swal.fire({
      title: `¿Eliminar código ${item.code}?`,
      text: `Se retirará "${item.name}" del catálogo activo de autocompletado.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deleteCie10Item(item.code);
        Swal.fire({
          icon: "success",
          title: "Eliminado",
          text: `El código ${item.code} fue retirado del catálogo.`,
          timer: 1400,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleResetCatalog = () => {
    Swal.fire({
      title: "¿Restablecer Catálogo Oficial?",
      text: "Esto volverá a cargar la lista predeterminada oficial MINSA/FIGO con los diagnósticos ginecológicos y obstétricos habituales.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0A4D68",
      confirmButtonText: "Sí, restablecer",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        resetCie10Catalog();
        Swal.fire({
          icon: "success",
          title: "Catálogo Restablecido",
          text: "Se restauró la lista base oficial con éxito.",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  // Filtrado de la lista
  const filteredItems = (cie10Catalog || []).filter((item) => {
    if (showOnlyFavorites && !item.isFavorite) return false;
    if (selectedCategory !== "ALL" && item.category !== selectedCategory) return false;

    const q = search.trim().toLowerCase();
    if (!q) return true;

    const matchCode = item.code.toLowerCase().includes(q);
    const matchName = item.name.toLowerCase().includes(q);
    const matchCategory = item.category.toLowerCase().includes(q);
    const matchKeywords = item.keywords
      ? item.keywords.some((k) => k.toLowerCase().includes(q))
      : false;

    return matchCode || matchName || matchCategory || matchKeywords;
  });

  const favoritesCount = (cie10Catalog || []).filter((i) => i.isFavorite).length;

  const getCategoryColor = (cat: Cie10Category) => {
    switch (cat) {
      case "ENDOMETRIOSIS":
        return "bg-rose-50 text-rose-800 border-rose-200";
      case "PATOLOGIA_CERVICAL":
        return "bg-purple-50 text-purple-800 border-purple-200";
      case "PRENATAL":
        return "bg-teal-50 text-teal-800 border-teal-200";
      case "MAMA":
        return "bg-pink-50 text-pink-800 border-pink-200";
      case "CLIMATERIO":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "PREVENTIVO":
        return "bg-emerald-50 text-emerald-800 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-primary/10 text-primary border border-primary/20">
              CENDO &bull; Nomenclatura Clínica
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-heading font-black text-heading mt-1">
            Catálogo Maestro CIE-10 (Ginecología & Obstetricia)
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Gestión de diagnósticos clínicos codificados para consultas médicas, informes colposcópicos y carnet prenatal.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleResetCatalog}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Restaurar códigos oficiales MINSA / FIGO"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Restablecer Oficial</span>
          </button>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-sm shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nuevo Diagnóstico CIE-10</span>
          </button>
        </div>
      </div>

      {/* Tarjetas KPI Superiores */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Diagnósticos en Catálogo
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-heading">
              {cie10Catalog?.length || 0}
            </span>
            <span className="text-xs text-muted font-bold">códigos</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold block">
            &bull; Listos para autocompletar
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Diagnósticos Favoritos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-amber-600">
              {favoritesCount}
            </span>
            <span className="text-xs text-muted font-bold">en 1 clic</span>
          </div>
          <span className="text-[10px] text-amber-700 font-semibold block">
            &bull; Botones rápidos en consulta
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Especialidades Médicas
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-heading font-black text-heading">
              {Object.keys(CIE10_CATEGORY_LABELS).length}
            </span>
            <span className="text-xs text-muted font-bold">categorías</span>
          </div>
          <span className="text-[10px] text-primary font-semibold block">
            &bull; Ginecología, ARO y Mama
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-1">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Integración de Módulos
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-heading font-extrabold text-teal-800">
              100% Sincronizado
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold block">
            &bull; Consulta, Colpo, Eco & CPN
          </span>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código CIE-10 (ej: N80.1), nombre o palabras clave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-heading focus:bg-white focus:border-primary focus:outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Limpiar
              </button>
            )}
          </div>

          {/* Toggle Solo Favoritos */}
          <button
            type="button"
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shrink-0 ${
              showOnlyFavorites
                ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showOnlyFavorites ? "fill-white" : "text-amber-500"}`} />
            <span>Solo Favoritos ({favoritesCount})</span>
          </button>
        </div>

        {/* Chips de Categorías */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === "ALL"
                ? "bg-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Todas ({cie10Catalog.length})
          </button>

          {Object.entries(CIE10_CATEGORY_LABELS).map(([catKey, catLabel]) => {
            const count = cie10Catalog.filter((i) => i.category === catKey).length;
            const isSelected = selectedCategory === catKey;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setSelectedCategory(catKey)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isSelected
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{catLabel.split("&")[0].trim()}</span>
                <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? "bg-white/20" : "bg-white"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabla de Diagnósticos */}
      <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <th className="p-3.5 w-12 text-center">Fav</th>
                <th className="p-3.5 w-28">Código CIE-10</th>
                <th className="p-3.5">Diagnóstico Clínico & Palabras Clave</th>
                <th className="p-3.5 w-48">Especialidad</th>
                <th className="p-3.5 w-24 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-xs">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.code} className="hover:bg-slate-50/70 transition-colors">
                    {/* Favorito */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => toggleCie10Favorite(item.code)}
                        className="p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        title={item.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            item.isFavorite
                              ? "text-amber-500 fill-amber-500"
                              : "text-slate-300 hover:text-slate-400"
                          }`}
                        />
                      </button>
                    </td>

                    {/* Código */}
                    <td className="p-3 font-mono font-bold">
                      <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-black">
                        {item.code}
                      </span>
                    </td>

                    {/* Nombre y Palabras Clave */}
                    <td className="p-3 space-y-1">
                      <div className="font-bold text-slate-900 text-xs leading-snug">
                        {item.name}
                      </div>
                      {item.keywords && item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.map((kw, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Categoría */}
                    <td className="p-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryColor(
                          item.category
                        )}`}
                      >
                        {CIE10_CATEGORY_LABELS[item.category] || item.category}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                          title="Editar diagnóstico"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar diagnóstico"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700">No se encontraron diagnósticos</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Pruebe con otro término de búsqueda o haga clic en <strong>"+ Nuevo Diagnóstico CIE-10"</strong> para registrarlo.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para Crear / Editar */}
      <Cie10Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        itemToEdit={itemToEdit}
      />
    </div>
  );
}
