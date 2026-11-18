"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface TablePaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newPageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string; // e.g. "pacientes", "citas", "registros"
  className?: string;
}

export function TablePagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 15, 25, 50],
  itemLabel = "registros",
  className = "",
}: TablePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // If no items at all, don't display pagination bar
  if (totalItems === 0) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate pagination buttons with smart truncation
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  const pages = getPageNumbers();

  const handlePrev = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 pb-1 text-xs text-slate-600 select-none ${className}`}
    >
      {/* Selector de cantidad por página & Contador */}
      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 rounded-xl px-2.5 py-1 shadow-2xs">
            <span className="text-slate-500 text-[11px] font-medium">Mostrar:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value);
                onPageSizeChange(newSize);
                onPageChange(1);
              }}
              className="bg-transparent font-bold text-heading text-xs cursor-pointer focus:outline-none pr-1"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-white text-slate-800">
                  {opt}
                </option>
              ))}
            </select>
            <span className="text-slate-500 text-[11px]">por pág.</span>
          </div>
        )}

        <div className="text-slate-600 text-xs">
          Mostrando <strong className="text-heading font-bold">{startItem}</strong> -{" "}
          <strong className="text-heading font-bold">{endItem}</strong> de{" "}
          <strong className="text-heading font-bold">{totalItems}</strong> {itemLabel}
        </div>
      </div>

      {/* Controles de Navegación */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        {/* Ir al inicio (si hay más de 4 páginas) */}
        {totalPages > 4 && (
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            title="Primera página"
            className="p-1.5 rounded-lg border border-slate-200 bg-surface text-slate-500 hover:text-heading hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Anterior */}
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentPage === 1}
          title="Página anterior"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-surface text-slate-600 hover:text-heading hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1 px-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 h-7 flex items-center justify-center text-slate-400 font-mono text-xs select-none"
                >
                  &hellip;
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-2xs"
                    : "border border-slate-200 bg-surface text-slate-700 hover:bg-slate-100 hover:text-heading"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Siguiente */}
        <button
          type="button"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          title="Página siguiente"
          className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-surface text-slate-600 hover:text-heading hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <span className="hidden xs:inline">Siguiente</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        {/* Ir al final (si hay más de 4 páginas) */}
        {totalPages > 4 && (
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            title="Última página"
            className="p-1.5 rounded-lg border border-slate-200 bg-surface text-slate-500 hover:text-heading hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
