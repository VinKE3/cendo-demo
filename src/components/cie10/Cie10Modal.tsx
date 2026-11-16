"use client";

import React, { useState, useEffect } from "react";
import { X, BookOpen, Sparkles, Hash, Tag, Star, CheckCircle } from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  Cie10Item,
  Cie10Category,
  CIE10_CATEGORY_LABELS,
} from "@/modules/catalogo/cie10Catalog";

interface Cie10ModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Cie10Item | null;
  initialCode?: string;
  initialName?: string;
}

export function Cie10Modal({
  isOpen,
  onClose,
  itemToEdit,
  initialCode = "",
  initialName = "",
}: Cie10ModalProps) {
  const { addCie10Item, updateCie10Item } = useMedicalStore();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Cie10Category>("GINECOLOGIA_GENERAL");
  const [keywordsText, setKeywordsText] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setCode(itemToEdit.code);
      setName(itemToEdit.name);
      setCategory(itemToEdit.category);
      setKeywordsText(itemToEdit.keywords ? itemToEdit.keywords.join(", ") : "");
      setIsFavorite(!!itemToEdit.isFavorite);
    } else {
      setCode(initialCode.toUpperCase());
      setName(initialName);
      setCategory("GINECOLOGIA_GENERAL");
      setKeywordsText("");
      setIsFavorite(false);
    }
  }, [itemToEdit, initialCode, initialName, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();

    if (!cleanCode) {
      Swal.fire({
        icon: "warning",
        title: "Código Requerido",
        text: "Debe ingresar el código CIE-10 (por ejemplo: N80.1 o O24.4).",
      });
      return;
    }

    if (!cleanName) {
      Swal.fire({
        icon: "warning",
        title: "Nombre Requerido",
        text: "Debe ingresar el nombre descriptivo del diagnóstico clínico.",
      });
      return;
    }

    const keywords = keywordsText
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);

    if (itemToEdit) {
      updateCie10Item(itemToEdit.code, {
        code: cleanCode,
        name: cleanName,
        category,
        keywords,
        isFavorite,
      });

      Swal.fire({
        icon: "success",
        title: "Diagnóstico Actualizado",
        text: `El código ${cleanCode} se actualizó correctamente en el catálogo.`,
        timer: 1500,
        showConfirmButton: false,
      });
    } else {
      addCie10Item({
        code: cleanCode,
        name: cleanName,
        category,
        keywords,
        isFavorite,
      });

      Swal.fire({
        icon: "success",
        title: "Diagnóstico Registrado",
        text: `El código ${cleanCode} ya está disponible para autocompletar en consultas y carnet prenatal.`,
        timer: 1600,
        showConfirmButton: false,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Cabecera */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
              <BookOpen className="w-4 h-4 text-secondary" />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-sm tracking-wide">
                {itemToEdit ? "Editar Diagnóstico CIE-10" : "Nuevo Diagnóstico CIE-10"}
              </h3>
              <p className="text-[11px] text-slate-200">
                Catálogo Clínico Gineco-Obstétrico &bull; CENDO
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Fila Código y Categoría */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-primary" />
                <span>Código CIE-10 *</span>
              </label>
              <input
                type="text"
                placeholder="Ej: O24.4 o N80.1"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-primary focus:bg-white focus:border-primary focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-800 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" />
                <span>Especialidad / Categoría *</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Cie10Category)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold focus:bg-white focus:border-primary focus:outline-none"
              >
                {Object.entries(CIE10_CATEGORY_LABELS).map(([catKey, catLabel]) => (
                  <option key={catKey} value={catKey}>
                    {catLabel}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre Clínico */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span>Nombre Clínico del Diagnóstico *</span>
            </label>
            <textarea
              rows={2}
              placeholder="Ej: Diabetes Mellitus Gestacional controlada con dieta / tratamiento médico"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:bg-white focus:border-primary focus:outline-none"
              required
            />
          </div>

          {/* Palabras Clave / Sinónimos */}
          <div className="space-y-1">
            <label className="font-bold text-slate-800 flex items-center justify-between">
              <span>Palabras Clave / Sinónimos de Búsqueda</span>
              <span className="text-[10px] text-slate-400 font-normal">Separar por comas</span>
            </label>
            <input
              type="text"
              placeholder="Ej: glucosa alta, sobrecarga oral, diabetes embarazo, dmg"
              value={keywordsText}
              onChange={(e) => setKeywordsText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:border-primary focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">
              Permite que al escribir cualquiera de estas palabras en la consulta, el código aparezca automáticamente.
            </p>
          </div>

          {/* Checkbox Favorito */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/90 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="isFavorite"
              checked={isFavorite}
              onChange={(e) => setIsFavorite(e.target.checked)}
              className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isFavorite" className="cursor-pointer space-y-0.5">
              <span className="font-bold text-amber-950 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                <span>Marcar como Diagnóstico Favorito (Acceso en 1 Clic)</span>
              </span>
              <p className="text-[11px] text-amber-800">
                Aparecerá en los botones rápidos de cabecera en el autocompletado de consultas médicas.
              </p>
            </label>
          </div>

          {/* Botones de acción */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all shadow-sm shadow-primary/20 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{itemToEdit ? "Guardar Cambios" : "Registrar en Catálogo"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
