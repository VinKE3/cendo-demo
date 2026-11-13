"use client";

import React, { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import {
  X,
  Pill,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  Calendar,
  AlertCircle,
  FileText,
  Clock,
  ShieldCheck,
  Send,
  Printer,
  ChevronDown,
  Search,
  MessageCircle,
} from "lucide-react";
import {
  Patient,
  DoctorProfile,
  MedicalPrescription,
  PrescriptionItem,
  PrescriptionRoute,
  MedicationVademecum,
} from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { generatePrescriptionWhatsAppUrl } from "@/lib/whatsappShare";

interface PrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  prescriptionToEdit?: MedicalPrescription | null;
  onSavedAndPrint?: (prescription: MedicalPrescription) => void;
}

// Plantillas de posología clínica en 1 clic
const CLINICAL_DOSAGE_PRESETS = [
  {
    label: "Óvulo Vaginal x 7 Noches",
    badge: "Vía Vaginal",
    route: "Vía Vaginal",
    dosage: "1 óvulo",
    frequency: "Cada 24 horas por las noches antes de dormir",
    duration: "Por 7 días continuos",
    instructions: "Introducir profundamente en la vagina al acostarse. Abstinencia sexual durante el tratamiento.",
    quantity: "1 caja x 7 óvulos",
  },
  {
    label: "Óvulo Vaginal x 10 Noches",
    badge: "Vía Vaginal",
    route: "Vía Vaginal",
    dosage: "1 óvulo",
    frequency: "Cada 24 horas por las noches antes de dormir",
    duration: "Por 10 días continuos",
    instructions: "Introducir profundamente. No ingerir bebidas alcohólicas durante el tratamiento.",
    quantity: "1 caja x 10 óvulos",
  },
  {
    label: "Antibiótico Oral c/12h x 7 días",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 tableta / cápsula",
    frequency: "Cada 12 horas después de los alimentos",
    duration: "Por 7 días continuos sin suspender",
    instructions: "Tomar con abundante agua después de las comidas. Completar el tratamiento.",
    quantity: "14 tabletas / cápsulas",
  },
  {
    label: "Doxiciclina c/12h x 14 días (EPI / Cervicitis)",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 cápsula (100 mg)",
    frequency: "Cada 12 horas con las comidas",
    duration: "Por 14 días continuos",
    instructions: "Tomar con un vaso lleno de agua en posición erguida para evitar irritación esofágica.",
    quantity: "28 cápsulas",
  },
  {
    label: "Analgésico / AINE c/8h condicional al dolor",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 tableta (550 mg)",
    frequency: "Cada 8 a 12 horas con alimentos",
    duration: "Por 3 a 5 días condicional al dolor",
    instructions: "Tomar siempre con las comidas. Suspender cuando el dolor pélvico o dismenorrea ceda.",
    quantity: "10 a 20 tabletas",
  },
  {
    label: "Antimicótico Dosis Única (Fluconazol)",
    badge: "Vía Oral",
    route: "Vía Oral",
    dosage: "1 cápsula (150 mg)",
    frequency: "Dosis única vía oral",
    duration: "Dosis única (Repetir a las 72h si persiste)",
    instructions: "Tomar con o sin alimentos.",
    quantity: "1 o 2 cápsulas",
  },
  {
    label: "Ungüento Vulvar c/8h x 7 días",
    badge: "Vía Tópica",
    route: "Vía Tópica",
    dosage: "Aplicar capa delgada",
    frequency: "Cada 8 horas (3 veces al día)",
    duration: "Por 7 días continuos",
    instructions: "Aplicar en la zona vulvar limpia y seca tras el aseo con jabón neutro.",
    quantity: "1 tubo ungüento",
  },
];

const COMMON_DIAGNOSES = [
  { code: "N76.0", label: "Vaginitis aguda / Vaginosis bacteriana" },
  { code: "N72", label: "Cervicitis / Ectopia periorificial inflamatoria" },
  { code: "B37.3", label: "Candidiasis vulvovaginal aguda" },
  { code: "N80.0", label: "Endometriosis del útero (Adenomiosis)" },
  { code: "N80.1", label: "Endometriosis de ovario" },
  { code: "N94.6", label: "Dismenorrea no especificada / Dolor pélvico" },
  { code: "Z01.4", label: "Examen ginecológico preventivo de rutina" },
];

const QUICK_INDICATIONS = [
  "Aseo de la zona íntima con agua tibia y jabón con pH neutro o ácido (tipo Lactacyd).",
  "Abstinencia sexual estricta durante el período de tratamiento con óvulos vaginales.",
  "No consumir bebidas alcohólicas mientras dure el tratamiento farmacológico.",
  "Usar ropa interior de algodón holgada y evitar prendas íntimas sintéticas o ajustadas.",
  "Evitar duchas vaginales, desodorantes íntimos o protectores diarios perfumados.",
  "Control ginecológico post-tratamiento en 14 días para reevaluación clínica.",
];

export function PrescriptionModal({
  isOpen,
  onClose,
  patient,
  prescriptionToEdit,
  onSavedAndPrint,
}: PrescriptionModalProps) {
  const { vademecumItems, doctorProfile, addPrescription, updatePrescription } =
    useMedicalStore();

  const isEditing = Boolean(prescriptionToEdit);

  // Form State
  const [prescriptionDate, setPrescriptionDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [diagnosis, setDiagnosis] = useState<string>("");
  const [cie10Code, setCie10Code] = useState<string>("");
  const [items, setItems] = useState<PrescriptionItem[]>([]);
  const [generalIndications, setGeneralIndications] = useState<string>("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState<string>("");

  // Sub-formulario para agregar un medicamento
  const [searchVademecum, setSearchVademecum] = useState<string>("");
  const [selectedMedication, setSelectedMedication] = useState<string>("");
  const [selectedPresentation, setSelectedPresentation] = useState<string>("");
  const [selectedRoute, setSelectedRoute] = useState<string>("Vía Vaginal");
  const [selectedDosage, setSelectedDosage] = useState<string>("1 óvulo");
  const [selectedFrequency, setSelectedFrequency] = useState<string>(
    "Cada 24 horas por las noches antes de dormir"
  );
  const [selectedDuration, setSelectedDuration] = useState<string>("Por 7 días continuos");
  const [selectedInstructions, setSelectedInstructions] = useState<string>("");
  const [selectedQuantity, setSelectedQuantity] = useState<string>("1 caja");

  // Filtro de Vademécum
  const filteredVademecum = useMemo(() => {
    if (!searchVademecum.trim()) return vademecumItems;
    const term = searchVademecum.toLowerCase();
    return vademecumItems.filter(
      (v) =>
        v.genericName.toLowerCase().includes(term) ||
        v.therapeuticGroup.toLowerCase().includes(term) ||
        v.commercialBrands.some((b) => b.brandName.toLowerCase().includes(term))
    );
  }, [vademecumItems, searchVademecum]);

  // Cargar datos al abrir o editar
  useEffect(() => {
    if (prescriptionToEdit) {
      setPrescriptionDate(prescriptionToEdit.prescriptionDate);
      setDiagnosis(prescriptionToEdit.diagnosis);
      setCie10Code(prescriptionToEdit.cie10Code || "");
      setItems(prescriptionToEdit.items || []);
      setGeneralIndications(prescriptionToEdit.generalIndications || "");
      setNextAppointmentDate(prescriptionToEdit.nextAppointmentDate || "");
    } else {
      setPrescriptionDate(new Date().toISOString().split("T")[0]);
      setDiagnosis("Vaginitis aguda / Ectopia periorificial");
      setCie10Code("N76.0");
      setItems([]);
      setGeneralIndications(
        "Aseo íntimo con jabón neutro. Abstinencia sexual durante el tratamiento. Control en 14 días."
      );
      setNextAppointmentDate("");
    }
  }, [prescriptionToEdit, isOpen]);

  if (!isOpen) return null;

  // Aplicar sugerencia de dosificación en 1 clic
  const handleApplyPreset = (preset: (typeof CLINICAL_DOSAGE_PRESETS)[0]) => {
    setSelectedRoute(preset.route);
    setSelectedDosage(preset.dosage);
    setSelectedFrequency(preset.frequency);
    setSelectedDuration(preset.duration);
    setSelectedInstructions(preset.instructions);
    setSelectedQuantity(preset.quantity);
  };

  // Seleccionar un fármaco del vademécum
  const handleSelectVademecum = (item: MedicationVademecum, brandIndex = 0) => {
    const brand = item.commercialBrands[brandIndex];
    const name = brand
      ? `${brand.brandName} (${item.genericName})`
      : item.genericName;
    const pres = brand ? brand.presentation : "Presentación médica";

    setSelectedMedication(name);
    setSelectedPresentation(pres);

    // Sugerencia inteligente automática según el fármaco
    if (item.genericName.toLowerCase().includes("metronidazol") || item.genericName.toLowerCase().includes("clindamicina")) {
      handleApplyPreset(CLINICAL_DOSAGE_PRESETS[0]); // Óvulos x 7 noches
    } else if (item.genericName.toLowerCase().includes("doxiciclina")) {
      handleApplyPreset(CLINICAL_DOSAGE_PRESETS[3]); // Doxiciclina x 14 días
    } else if (item.genericName.toLowerCase().includes("naproxeno")) {
      handleApplyPreset(CLINICAL_DOSAGE_PRESETS[4]); // AINE c/8h
    } else if (item.genericName.toLowerCase().includes("fluconazol")) {
      handleApplyPreset(CLINICAL_DOSAGE_PRESETS[5]); // Dosis única
    } else if (item.genericName.toLowerCase().includes("mupirocina")) {
      handleApplyPreset(CLINICAL_DOSAGE_PRESETS[6]); // Ungüento
    }
  };

  // Agregar medicamento a la receta
  const handleAddItem = () => {
    if (!selectedMedication.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta Medicamento",
        text: "Seleccione un fármaco del vademécum o ingrese el nombre comercial/genérico.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicationName: selectedMedication.trim(),
      presentation: selectedPresentation.trim() || "Caja / Frasco estándar",
      route: selectedRoute,
      dosage: selectedDosage.trim() || "1 unidad",
      frequency: selectedFrequency.trim() || "Según indicación médica",
      duration: selectedDuration.trim() || "7 días",
      instructions: selectedInstructions.trim() || undefined,
      quantity: selectedQuantity.trim() || undefined,
    };

    setItems([...items, newItem]);

    // Limpiar sub-formulario
    setSelectedMedication("");
    setSelectedPresentation("");
    setSelectedInstructions("");
  };

  // Remover medicamento de la receta
  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  // Guardar receta
  const handleSave = (andPrint = false) => {
    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Receta Vacía",
        text: "Debe agregar al menos un medicamento a la receta médica.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    let savedPrescription: MedicalPrescription;

    if (isEditing && prescriptionToEdit) {
      updatePrescription(prescriptionToEdit.id, {
        prescriptionDate,
        diagnosis,
        cie10Code,
        items,
        generalIndications,
        nextAppointmentDate,
        doctorName: doctorProfile.fullName,
        doctorCmp: doctorProfile.cmp,
        doctorRne: doctorProfile.rne,
      });
      savedPrescription = {
        ...prescriptionToEdit,
        prescriptionDate,
        diagnosis,
        cie10Code,
        items,
        generalIndications,
        nextAppointmentDate,
      };
    } else {
      savedPrescription = addPrescription({
        patientId: patient.id,
        doctorId: doctorProfile.id,
        doctorName: doctorProfile.fullName,
        doctorCmp: doctorProfile.cmp,
        doctorRne: doctorProfile.rne,
        prescriptionDate,
        diagnosis,
        cie10Code,
        items,
        generalIndications,
        nextAppointmentDate,
      });
    }

    if (andPrint && onSavedAndPrint) {
      onSavedAndPrint(savedPrescription);
      onClose();
      return;
    }

    Swal.fire({
      icon: "success",
      title: isEditing ? "Receta Actualizada" : "Receta Médica Emitida",
      html: `
        <div class="text-left text-xs text-slate-700 space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
          <p><strong>Paciente:</strong> ${patient.lastName}, ${patient.firstName}</p>
          <p><strong>Médico Emisor:</strong> ${doctorProfile.doctorTitle} ${doctorProfile.fullName} (CMP ${doctorProfile.cmp})</p>
          <p><strong>Medicamentos Prescritos:</strong> ${items.length} fármaco(s)</p>
          <p class="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
            La receta médica está lista para imprimirse o compartirse por WhatsApp.
          </p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "📲 Enviar por WhatsApp a la Paciente",
      cancelButtonText: "Cerrar",
      confirmButtonColor: "#059669",
      cancelButtonColor: "#0A4D68",
    }).then((res) => {
      if (res.isConfirmed) {
        const url = generatePrescriptionWhatsAppUrl(patient, savedPrescription, doctorProfile);
        window.open(url, "_blank");
      }
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-4xl my-6 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Cabecera del Modal */}
        <div className="bg-gradient-to-r from-[#062c3d] to-[#0A4D68] px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-secondary border border-white/10 shrink-0">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-heading font-extrabold text-white">
                  {isEditing ? "Modificar Receta Médica" : "Recetario Médico Inteligente (RP/)"}
                </h2>
                <span className="text-[10px] bg-secondary text-white font-bold px-2 py-0.5 rounded-full">
                  Vademécum CENDO
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Paciente: <strong>{patient.lastName}, {patient.firstName}</strong> (DNI: {patient.dni} &bull; {patient.age} años)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo del Modal con Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Fila 1: Datos de Emisión y Diagnóstico CIE-10 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-3 space-y-1">
              <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                Fecha de Emisión:
              </label>
              <input
                type="date"
                value={prescriptionDate}
                onChange={(e) => setPrescriptionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-6 space-y-1">
              <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                Diagnóstico Conclusivo / Motivo de Prescripción:
              </label>
              <input
                type="text"
                list="diag-suggestions"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="ej. Vaginitis mixta aguda"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <datalist id="diag-suggestions">
                {COMMON_DIAGNOSES.map((d) => (
                  <option key={d.code} value={d.label}>
                    CIE-10: {d.code}
                  </option>
                ))}
              </datalist>
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="font-bold text-heading uppercase text-[10px] tracking-wider block">
                Código CIE-10:
              </label>
              <input
                type="text"
                value={cie10Code}
                onChange={(e) => setCie10Code(e.target.value)}
                placeholder="ej. N76.0"
                className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Fila 2: Buscador y Selector del Vademécum CENDO */}
          <div className="p-4 rounded-xl border border-primary/20 bg-accent-soft/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary uppercase tracking-wide flex items-center gap-1.5">
                <Search className="w-4 h-4 text-secondary" />
                1. Seleccionar Medicamento del Vademécum Clínico CENDO
              </span>
              <span className="text-[11px] text-muted">
                Precios e información de farmacia integrados
              </span>
            </div>

            {/* Buscador de Fármacos */}
            <div className="relative">
              <Search className="w-4 h-4 text-muted absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por genérico o marca comercial (ej. Metronidazol, Ginedazol, Vagitrol, Naproxeno, Mupirocina)..."
                value={searchVademecum}
                onChange={(e) => setSearchVademecum(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-white text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Chips Rápidos de Fármacos Frecuentes */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {vademecumItems.slice(0, 6).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectVademecum(item, 0)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary font-medium text-[11px] shrink-0 transition-all cursor-pointer shadow-2xs"
                >
                  {item.commercialBrands[0]?.brandName || item.genericName}
                </button>
              ))}
            </div>

            {/* Lista Rápida Desplegable si hay búsqueda */}
            {searchVademecum.trim() && (
              <div className="max-h-36 overflow-y-auto bg-white rounded-xl border border-border divide-y divide-slate-100 shadow-sm">
                {filteredVademecum.map((item) => (
                  <div key={item.id} className="p-2 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{item.genericName}</span>
                      <span className="text-[10px] text-primary">{item.therapeuticGroup}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {item.commercialBrands.map((b, idx) => (
                        <button
                          key={b.brandName}
                          type="button"
                          onClick={() => {
                            handleSelectVademecum(item, idx);
                            setSearchVademecum("");
                          }}
                          className="px-2 py-0.5 rounded bg-slate-100 hover:bg-primary hover:text-white text-[10px] font-semibold text-slate-700 transition-colors cursor-pointer"
                        >
                          {b.brandName} ({b.presentation}) - Ref: S/ {b.referencePricePen.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fila 3: Configurador de Posología y Selector de Dosis en 1 Clic */}
          <div className="p-4 rounded-xl bg-white border border-border shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-heading uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-secondary" />
                2. Pautas y Posología Clínica Sugerida en 1 Clic
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Autocompletado Rápido
              </span>
            </div>

            {/* Presets en 1 Clic */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CLINICAL_DOSAGE_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p)}
                  className="p-2 rounded-xl border border-slate-200 hover:border-primary hover:bg-accent-soft/40 text-left transition-all group cursor-pointer"
                >
                  <span className="text-[9.5px] font-mono font-bold text-primary block">
                    {p.badge}
                  </span>
                  <span className="text-[11px] font-bold text-heading group-hover:text-primary transition-colors block leading-tight mt-0.5">
                    {p.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Inputs Detallados del Medicamento Seleccionado */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2 border-t border-slate-100">
              <div className="sm:col-span-5 space-y-1">
                <label className="font-semibold text-slate-700">Fármaco / Principio Activo *</label>
                <input
                  type="text"
                  placeholder="ej. Ginedazol (Metronidazol + Miconazol)"
                  value={selectedMedication}
                  onChange={(e) => setSelectedMedication(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-semibold text-slate-700">Presentación Comercial</label>
                <input
                  type="text"
                  placeholder="ej. Caja x 10 óvulos vaginales"
                  value={selectedPresentation}
                  onChange={(e) => setSelectedPresentation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700">Vía de Administración</label>
                <select
                  value={selectedRoute}
                  onChange={(e) => setSelectedRoute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Vía Vaginal">Vía Vaginal</option>
                  <option value="Vía Oral">Vía Oral</option>
                  <option value="Vía Tópica">Vía Tópica</option>
                  <option value="Vía Intramuscular">Vía Intramuscular</option>
                  <option value="Otra">Otra</option>
                </select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700">Dosis Unitaria</label>
                <input
                  type="text"
                  placeholder="ej. 1 óvulo / 1 tableta"
                  value={selectedDosage}
                  onChange={(e) => setSelectedDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-5 space-y-1">
                <label className="font-semibold text-slate-700">Frecuencia / Horario</label>
                <input
                  type="text"
                  placeholder="ej. Cada 24 horas por las noches"
                  value={selectedFrequency}
                  onChange={(e) => setSelectedFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-4 space-y-1">
                <label className="font-semibold text-slate-700">Duración del Tratamiento</label>
                <input
                  type="text"
                  placeholder="ej. Por 7 días continuos"
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-9 space-y-1">
                <label className="font-semibold text-slate-700">Indicaciones Especiales para la Paciente</label>
                <input
                  type="text"
                  placeholder="ej. Introducir profundamente al acostarse. Abstinencia sexual durante el tratamiento."
                  value={selectedInstructions}
                  onChange={(e) => setSelectedInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-slate-700">Cantidad Total a Despachar</label>
                <input
                  type="text"
                  placeholder="ej. 1 caja"
                  value={selectedQuantity}
                  onChange={(e) => setSelectedQuantity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-[#07394E] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 text-secondary" />
                <span>Agregar Medicamento a la Receta</span>
              </button>
            </div>
          </div>

          {/* Fila 4: Lista de Medicamentos Prescritos (RP/) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-heading uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                3. Medicamentos Prescritos en esta Receta ({items.length})
              </span>
              <span className="text-[11px] font-mono text-muted">Símbolo RP/</span>
            </div>

            {items.length === 0 ? (
              <div className="p-8 rounded-xl border-2 border-dashed border-slate-200 text-center text-slate-400 bg-slate-50/50">
                <Pill className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-xs">No hay medicamentos en la receta aún.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Seleccione un fármaco del vademécum y presione &quot;Agregar Medicamento&quot;.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        #{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-heading font-bold text-heading text-xs">
                            {item.medicationName}
                          </p>
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white border border-slate-200 text-slate-600">
                            {item.presentation}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-accent-soft text-primary">
                            {item.route}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs mt-1">
                          <strong>Dosis:</strong> {item.dosage} &bull; <strong>Frecuencia:</strong> {item.frequency} &bull; <strong>Duración:</strong> {item.duration}
                        </p>
                        {item.instructions && (
                          <p className="text-[11px] text-slate-500 italic mt-0.5">
                            Indicación: {item.instructions}
                          </p>
                        )}
                        {item.quantity && (
                          <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                            Cantidad: {item.quantity}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar de la receta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Fila 5: Indicaciones Generales y Próximo Control */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <span className="text-xs font-bold text-heading uppercase tracking-wide block">
              4. Indicaciones Generales y Cuidados Médicos
            </span>

            {/* Chips de Indicaciones Rápidas */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {QUICK_INDICATIONS.map((ind) => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => {
                    const current = generalIndications.trim();
                    if (!current.includes(ind)) {
                      setGeneralIndications(current ? `${current}\n• ${ind}` : `• ${ind}`);
                    }
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-primary text-slate-600 hover:text-primary text-[10px] font-medium transition-colors cursor-pointer"
                >
                  + {ind.slice(0, 38)}...
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={generalIndications}
              onChange={(e) => setGeneralIndications(e.target.value)}
              placeholder="Indicaciones higiénicas, dietéticas, reposo o advertencias clínicas..."
              className="w-full p-3 rounded-xl border border-border bg-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20"
            />

            <div className="flex items-center gap-3">
              <label className="font-semibold text-slate-700 whitespace-nowrap">
                Próxima Cita de Control:
              </label>
              <input
                type="date"
                value={nextAppointmentDate}
                onChange={(e) => setNextAppointmentDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Footer con Botones de Acción */}
        <div className="p-4 bg-slate-50 border-t border-border flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Firma y Sello Oficial: <strong>{doctorProfile.doctorTitle} {doctorProfile.fullName}</strong> (CMP {doctorProfile.cmp})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-heading text-xs font-bold transition-colors cursor-pointer"
            >
              Solo Guardar
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-5 py-2 rounded-xl bg-primary hover:bg-[#07394E] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-secondary" />
              <span>Guardar e Imprimir / PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
