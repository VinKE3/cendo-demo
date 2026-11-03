"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Sparkles,
} from "lucide-react";
import Swal from "sweetalert2";
import { useMedicalStore } from "@/store/useMedicalStore";
import { PatientModal } from "@/components/pacientes/PatientModal";
import { Patient } from "@/types/medical";

export default function PacientesPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { patients, deletePatient } = useMedicalStore();

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      p.dni.toLowerCase().includes(q) ||
      p.firstName.toLowerCase().includes(q) ||
      p.lastName.toLowerCase().includes(q) ||
      (p.phone && p.phone.toLowerCase().includes(q)) ||
      (p.occupation && p.occupation.toLowerCase().includes(q))
    );
  });

  const handleOpenCreate = () => {
    setSelectedPatient(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setSelectedPatient(p);
    setIsModalOpen(true);
  };

  const handleDelete = (p: Patient) => {
    Swal.fire({
      title: "¿Eliminar paciente?",
      html: `
        <div class="text-left text-xs space-y-1">
          <p>¿Está seguro de eliminar del sistema a <strong>${p.lastName}, ${p.firstName}</strong> (DNI: ${p.dni})?</p>
          <p class="text-red-600 font-semibold mt-2">Esta acción borrará también sus antecedentes, informes colposcópicos y chequeos asociados.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#64748B",
      confirmButtonText: "Sí, eliminar historia",
      cancelButtonText: "Cancelar",
    }).then((res) => {
      if (res.isConfirmed) {
        deletePatient(p.id);
        Swal.fire({
          icon: "success",
          title: "Paciente Eliminada",
          text: "La historia clínica ha sido retirada del sistema.",
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200/80 text-xs text-sky-800 font-semibold mb-1.5">
            <Users className="w-3.5 h-3.5 text-sky-600" />
            Directorio de Pacientes CENDO &bull; Miraflores
          </div>
          <h1 className="text-2xl font-heading font-extrabold text-heading">
            Directorio y Fichas Clínicas
          </h1>
          <p className="text-xs text-muted">
            Registro y gestión de historias clínicas gineco-obstétricas ({patients.length} pacientes registradas)
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-secondary" />
          <span>+ Registrar Nueva Paciente</span>
        </button>
      </div>

      {/* Buscador de Pacientes */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Buscar por DNI (ej. 72961954), apellidos (ej. Herrera), nombres o teléfono..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-xs text-heading placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-2xs"
        />
      </div>

      {/* Listado de Pacientes */}
      <div className="p-6 rounded-2xl bg-surface border border-border shadow-xs space-y-4">
        {filtered.length > 0 ? (
          <div className="divide-y divide-border">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-xl transition-all group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary font-heading font-extrabold text-sm flex items-center justify-center shrink-0">
                    {p.firstName[0]}
                    {p.lastName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-heading text-base group-hover:text-primary transition-colors">
                        {p.lastName}, {p.firstName}
                      </h3>
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-800">
                        DNI {p.dni}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted mt-1">
                      <span className="font-semibold text-heading">
                        {p.age} años
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted" />
                        {p.phone}
                      </span>
                      {p.email && (
                        <>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted" />
                            {p.email}
                          </span>
                        </>
                      )}
                      <span>&bull;</span>
                      <span className="font-medium text-slate-700">
                        {p.civilStatus} &bull; {p.occupation || "Ocupación no especificada"}
                      </span>
                    </div>

                    {p.address && (
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted shrink-0" />
                        <span className="truncate">{p.address}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => handleOpenEdit(p)}
                    className="p-2 rounded-lg border border-border bg-surface text-muted hover:text-heading hover:bg-slate-100 transition-colors"
                    title="Editar filiación"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(p)}
                    className="p-2 rounded-lg border border-border bg-surface text-muted hover:text-status-alert hover:bg-red-50 transition-colors"
                    title="Eliminar paciente"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/pacientes/${p.id}`}
                    className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover shadow-2xs transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Historia</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center space-y-2">
            <Users className="w-8 h-8 text-muted mx-auto" />
            <p className="text-sm font-semibold text-heading">
              No se encontraron pacientes
            </p>
            <p className="text-xs text-muted max-w-sm mx-auto">
              {search
                ? `No hay coincidencias para "${search}". Pruebe con otro DNI o apellido.`
                : "Aún no hay pacientes registradas en la base de datos."}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Crear / Editar Paciente */}
      <PatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedPatient}
      />
    </div>
  );
}
