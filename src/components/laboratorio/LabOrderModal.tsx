"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Calendar,
  User,
  Stethoscope,
  Info,
} from "lucide-react";
import { LabOrder, LabOrderItem, LabCategory, Patient } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";

const labOrderSchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  doctorId: z.string().min(1, "Debe seleccionar un médico"),
  orderDate: z.string().min(10, "Fecha inválida (YYYY-MM-DD)"),
  diagnosis: z.string().min(3, "El diagnóstico presuntivo es requerido"),
  cie10Code: z.string().default("Z01.4"),
  urgency: z.enum(["Rutina", "Prioritario", "Urgente"]).default("Rutina"),
  customTests: z.string().optional(),
  patientInstructions: z.string().optional(),
});

type LabOrderFormData = z.infer<typeof labOrderSchema>;

interface LabOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: LabOrder | null;
  defaultPatientId?: string;
  onOrderSaved?: (savedOrder: LabOrder) => void;
}

interface CatalogTest {
  id: string;
  name: string;
  category: LabCategory;
  sampleType: string;
  notes?: string;
}

const TESTS_CATALOG: CatalogTest[] = [
  // Ginecología & Marcadores
  { id: "cat-ca125", name: "CA-125 (Marcador Ovárico / Endometriosis)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa", notes: "Ayuno de 8 horas" },
  { id: "cat-pap", name: "Papanicolaou en Base Líquida (ThinPrep)", category: "Ginecología & Marcadores", sampleType: "Muestra cervical", notes: "Abstinencia sexual 48h previas" },
  { id: "cat-vph", name: "Panel Tipificación VPH 23 Genotipos (PCR)", category: "Ginecología & Marcadores", sampleType: "Muestra endocervical", notes: "Sin óvulos 48h previas" },
  { id: "cat-he4", name: "HE-4 + Índice ROMA (Riesgo Ovárico)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa", notes: "Ayuno 8 horas" },
  { id: "cat-ca199", name: "CA 19-9 (Marcador Gastrointestinal / Ovárico)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa" },
  { id: "cat-cea", name: "Antígeno Carcinoembrionario (CEA)", category: "Ginecología & Marcadores", sampleType: "Sangre venosa" },
  { id: "cat-cult-vag", name: "Cultivo de Secreción Vaginal + Antibiograma", category: "Ginecología & Marcadores", sampleType: "Hisopado vaginal", notes: "Sin aseo profundo matutino" },
  { id: "cat-frotis", name: "Frotis en Fresco / Tinción Gram Vaginal", category: "Ginecología & Marcadores", sampleType: "Hisopado vaginal" },
  { id: "cat-chlamydia", name: "Chlamydia trachomatis por PCR en tiempo real", category: "Ginecología & Marcadores", sampleType: "Muestra endocervical" },
  { id: "cat-mycoplasma", name: "Cultivo Mycoplasma hominis / Ureaplasma", category: "Ginecología & Marcadores", sampleType: "Hisopado vaginal" },

  // Perfil Hormonal & Ovárico
  { id: "cat-amh", name: "Hormona Antimülleriana (AMH - Reserva Ovárica)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa" },
  { id: "cat-fsh", name: "FSH (Hormona Folículo Estimulante)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 2-4 del ciclo menstrual" },
  { id: "cat-lh", name: "LH (Hormona Luteinizante)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 2-4 del ciclo menstrual" },
  { id: "cat-e2", name: "Estradiol Sérico (E2)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 2-4 del ciclo menstrual" },
  { id: "cat-prl", name: "Prolactina Sérica", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Reposo de 30 min previo a la punción" },
  { id: "cat-prog", name: "Progesterona Sérica", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Día 21 del ciclo (fase lútea)" },
  { id: "cat-testo", name: "Testosterona Total y Libre (Perfil SOP)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa" },
  { id: "cat-dheas", name: "DHEA-Sulfato (DHEA-S)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa" },
  { id: "cat-tsh", name: "Perfil Tiroideo Completo (TSH, T4 libre, T3 libre)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Ayuno matutino" },
  { id: "cat-anti-tpo", name: "Anticuerpos Anti-TPO y Anti-Tiroglobulina", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa" },
  { id: "cat-insulina", name: "Insulina Basal + HOMA-IR (Resistencia a la Insulina)", category: "Perfil Hormonal & Ovárico", sampleType: "Sangre venosa", notes: "Ayuno estricto de 10-12 horas" },

  // Hematología & Bioquímica
  { id: "cat-hemo", name: "Hemograma Completo Automatizado + Plaquetas + VSG", category: "Hematología & Bioquímica", sampleType: "Sangre con EDTA", notes: "Ayuno de 8 horas" },
  { id: "cat-glu", name: "Glucosa en Ayunas", category: "Hematología & Bioquímica", sampleType: "Sangre venosa", notes: "Ayuno de 8 a 10 horas" },
  { id: "cat-lipid", name: "Perfil Lipídico Completo (Colesterol, HDL, LDL, Triglicéridos)", category: "Hematología & Bioquímica", sampleType: "Sangre venosa", notes: "Ayuno estricto 12 horas" },
  { id: "cat-crea", name: "Creatinina y Úrea Sérica", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },
  { id: "cat-hep", name: "Perfil Hepático (TGO, TGP, Bilirrubinas, Fosfatasa Alcalina)", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },
  { id: "cat-coag", name: "Perfil de Coagulación (TP, TTPA, Fibrinógeno, INR)", category: "Hematología & Bioquímica", sampleType: "Sangre con Citrato", notes: "Pre-quirúrgico" },
  { id: "cat-grupo", name: "Grupo Sanguíneo y Factor Rh", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },
  { id: "cat-ferri", name: "Ferritina Sérica y Hierro Sérico", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },
  { id: "cat-vitd", name: "Vitamina D (25-Hidroxivitamina D)", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },
  { id: "cat-pcr", name: "Proteína C Reactiva Ultrasensible (PCR-us)", category: "Hematología & Bioquímica", sampleType: "Sangre venosa" },

  // Perfil Prenatal & Gestacional
  { id: "cat-bhcg-cuant", name: "Subunidad Beta hCG Cuantitativa (Gestación / Control)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-vdrl", name: "Serología Sífilis (VDRL / RPR Cuantitativo)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-vih", name: "Tamizaje VIH 1/2 (Anticuerpos + Antígeno p24 de 4ta Gen)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-hbsag", name: "Tamizaje Hepatitis B (HBsAg Antígeno de Superficie)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-torch", name: "Perfil TORCH (Toxoplasma, Rubeola, CMV, Herpes IgG/IgM)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa" },
  { id: "cat-coombs", name: "Test de Coombs Indirecto", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa", notes: "Gestantes Rh negativo" },
  { id: "cat-ttg", name: "Test de Tolerancia Oral a la Glucosa 75g (24-28 sem)", category: "Perfil Prenatal / Gestacional", sampleType: "Sangre venosa", notes: "Ayuno 8 horas" },

  // Orina & Función Renal
  { id: "cat-ego", name: "Examen Completo de Orina (EGO) Automatizado", category: "Orina & Función Renal", sampleType: "Orina matutina", notes: "Higiene genital previa" },
  { id: "cat-uro", name: "Urocultivo con Antibiograma Automatizado", category: "Orina & Función Renal", sampleType: "Orina chorro medio", notes: "Frasco estéril matutino" },
];

const PRESET_PACKS = [
  {
    name: "Chequeo Ginecológico CENDO",
    description: "PAP ThinPrep + VPH PCR + CA-125 + Hemograma + Urocultivo",
    testIds: ["cat-ca125", "cat-pap", "cat-vph", "cat-hemo", "cat-uro"],
    diagnosis: "Examen ginecológico preventivo y despistaje oncológico",
    cie10: "Z01.4",
  },
  {
    name: "Descarte Endometriosis",
    description: "CA-125 + CA 19-9 + Hemograma + PCR-us + Ferritina",
    testIds: ["cat-ca125", "cat-ca199", "cat-hemo", "cat-pcr", "cat-ferri"],
    diagnosis: "Dolor pélvico crónico y sospecha de endometriosis",
    cie10: "N80.9",
  },
  {
    name: "Fertilidad & Reserva Ovárica",
    description: "AMH + FSH + LH + Estradiol + Prolactina + Perfil Tiroideo",
    testIds: ["cat-amh", "cat-fsh", "cat-lh", "cat-e2", "cat-prl", "cat-tsh"],
    diagnosis: "Evaluación de reserva ovárica y estudio de fertilidad",
    cie10: "N97.9",
  },
  {
    name: "Control Prenatal 1er Trimestre",
    description: "Hemograma + Grupo/Rh + Glucosa + VDRL + VIH + HBsAg + Toxoplasma + Urocultivo",
    testIds: ["cat-hemo", "cat-grupo", "cat-glu", "cat-vdrl", "cat-vih", "cat-hbsag", "cat-torch", "cat-uro"],
    diagnosis: "Supervisión de embarazo normal - Primer trimestre (MINSA)",
    cie10: "Z34.8",
  },
  {
    name: "Pre-Quirúrgico Ginecológico",
    description: "Hemograma + Coagulación (TP/INR) + Glucosa + Úrea/Creatinina + Grupo/Rh + EGO",
    testIds: ["cat-hemo", "cat-coag", "cat-glu", "cat-crea", "cat-grupo", "cat-ego"],
    diagnosis: "Evaluación pre-quirúrgica para procedimiento ginecológico",
    cie10: "Z01.8",
  },
];

const INSTRUCTION_PRESETS = [
  "Ayuno de 8 a 10 horas antes de la toma de muestra.",
  "Abstinencia sexual estricta de 48 horas previas.",
  "No aplicar óvulos, cremas ni duchas vaginales 48 horas antes.",
  "Entregar la primera orina de la mañana en frasco estéril (chorro medio).",
  "Acudir con ropa cómoda y en reposo físico relativo de 30 minutos.",
];

export function LabOrderModal({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
  onOrderSaved,
}: LabOrderModalProps) {
  const {
    patients,
    doctorsList,
    doctorProfile,
    addLabOrder,
    updateLabOrder,
  } = useMedicalStore();

  const [selectedItems, setSelectedItems] = useState<LabOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Todos");

  const todayStr = new Date().toISOString().split("T")[0];

  const defaultDoctorId = doctorProfile?.id || doctorsList[0]?.id || "doc-patrick-jacinto";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<LabOrderFormData>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      patientId: defaultPatientId || initialData?.patientId || "",
      doctorId: defaultDoctorId,
      orderDate: todayStr,
      diagnosis: "",
      cie10Code: "Z01.4",
      urgency: "Rutina",
      customTests: "",
      patientInstructions:
        "Ayuno de 8 a 10 horas. Abstinencia sexual y no aplicar óvulos vaginales 48 horas antes de la toma de muestra. Entregar primera orina de la mañana con aseo previo.",
    },
  });

  const selectedPatientId = watch("patientId");
  const selectedDoctorId = watch("doctorId");

  // Cargar datos en edición o modo nuevo
  useEffect(() => {
    if (initialData) {
      reset({
        patientId: initialData.patientId,
        doctorId: initialData.doctorId || defaultDoctorId,
        orderDate: initialData.orderDate || todayStr,
        diagnosis: initialData.diagnosis || "",
        cie10Code: initialData.cie10Code || "Z01.4",
        urgency: initialData.urgency || "Rutina",
        customTests: initialData.customTests || "",
        patientInstructions: initialData.patientInstructions || "",
      });
      setSelectedItems(initialData.items || []);
    } else {
      reset({
        patientId: defaultPatientId || (patients.length > 0 ? patients[0].id : ""),
        doctorId: defaultDoctorId,
        orderDate: todayStr,
        diagnosis: "",
        cie10Code: "Z01.4",
        urgency: "Rutina",
        customTests: "",
        patientInstructions:
          "Ayuno de 8 a 10 horas. Abstinencia sexual y no aplicar óvulos vaginales 48 horas antes de la toma de muestra. Entregar primera orina de la mañana con aseo previo.",
      });
      setSelectedItems([]);
    }
  }, [initialData, defaultPatientId, isOpen, defaultDoctorId, todayStr, reset, patients]);

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const currentDoctor = doctorsList.find((d) => d.id === selectedDoctorId) || doctorProfile;

  const toggleTest = (test: CatalogTest) => {
    const isAlreadySelected = selectedItems.some((item) => item.testName === test.name);
    if (isAlreadySelected) {
      setSelectedItems(selectedItems.filter((item) => item.testName !== test.name));
    } else {
      setSelectedItems([
        ...selectedItems,
        {
          id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          category: test.category,
          testName: test.name,
          sampleType: test.sampleType,
          notes: test.notes,
        },
      ]);
    }
  };

  const applyPresetPack = (pack: typeof PRESET_PACKS[0]) => {
    const packItems: LabOrderItem[] = pack.testIds.map((testId) => {
      const found = TESTS_CATALOG.find((t) => t.id === testId);
      return {
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        category: found?.category || "Ginecología & Marcadores",
        testName: found?.name || testId,
        sampleType: found?.sampleType || "Muestra biológica",
        notes: found?.notes,
      };
    });

    setSelectedItems(packItems);
    setValue("diagnosis", pack.diagnosis);
    setValue("cie10Code", pack.cie10);

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Paquete cargado: ${pack.name}`,
      showConfirmButton: false,
      timer: 2000,
    });
  };

  const removeSelectedItem = (id: string) => {
    setSelectedItems(selectedItems.filter((i) => i.id !== id));
  };

  const addInstructionChip = (chip: string) => {
    const current = watch("patientInstructions") || "";
    if (!current.includes(chip)) {
      const updated = current ? `${current} ${chip}` : chip;
      setValue("patientInstructions", updated);
    }
  };

  const onSubmit = (data: LabOrderFormData) => {
    if (selectedItems.length === 0 && (!data.customTests || data.customTests.trim().length === 0)) {
      Swal.fire({
        icon: "warning",
        title: "Sin exámenes seleccionados",
        text: "Debe seleccionar al menos un examen de laboratorio o escribir análisis adicionales.",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    const doctorNameFormatted = currentDoctor
      ? `${currentDoctor.doctorTitle || "Dr."} ${currentDoctor.fullName}`
      : "Dr. Patrick José Jacinto Gomero";

    const payload = {
      patientId: data.patientId,
      doctorId: data.doctorId,
      doctorName: doctorNameFormatted,
      doctorCmp: currentDoctor?.cmp || "61693",
      doctorRne: currentDoctor?.rne || "38657",
      orderDate: data.orderDate,
      diagnosis: data.diagnosis,
      cie10Code: data.cie10Code,
      urgency: data.urgency,
      items: selectedItems,
      customTests: data.customTests || "",
      patientInstructions: data.patientInstructions || "",
    };

    let saved: LabOrder;
    if (initialData) {
      updateLabOrder(initialData.id, payload);
      saved = { ...initialData, ...payload, updatedAt: new Date().toISOString() };
      Swal.fire({
        icon: "success",
        title: "Orden de Laboratorio Actualizada",
        text: "Los análisis solicitados se guardaron correctamente.",
        timer: 1800,
        showConfirmButton: false,
      });
    } else {
      saved = addLabOrder(payload);
      Swal.fire({
        icon: "success",
        title: "Orden de Laboratorio Emitida",
        text: `Se generó la orden con ${selectedItems.length} análisis solicitados.`,
        timer: 1800,
        showConfirmButton: false,
      });
    }

    if (onOrderSaved) {
      onOrderSaved(saved);
    }
    onClose();
  };

  // Filtrado de exámenes
  const filteredTests = TESTS_CATALOG.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (test.sampleType && test.sampleType.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesTab = activeTab === "Todos" || test.category === activeTab;

    return matchesSearch && matchesTab;
  });

  const categories = [
    "Todos",
    "Ginecología & Marcadores",
    "Perfil Hormonal & Ovárico",
    "Hematología & Bioquímica",
    "Perfil Prenatal / Gestacional",
    "Orina & Función Renal",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-4 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabecera Institucional CENDO */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FlaskConical className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base font-heading font-extrabold tracking-tight">
                {initialData ? "Editar Orden de Laboratorio Clínico" : "Nueva Orden de Laboratorio Clínico"}
              </h2>
              <p className="text-xs text-white/80">
                CENDO &bull; Solicitud de Exámenes Especializados & Despacho a Laboratorio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. Datos de Paciente, Médico y Fecha */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              {/* Paciente */}
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" /> Paciente
                </label>
                <select
                  {...register("patientId")}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  <option value="">-- Seleccionar Paciente --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-[11px] text-red-600">{errors.patientId.message}</p>
                )}
                {currentPatient && (
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Edad: {currentPatient.age} años &bull; Tel: {currentPatient.phone}
                  </p>
                )}
              </div>

              {/* Médico Solicitante */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-primary" /> Médico Solicitante
                </label>
                <select
                  {...register("doctorId")}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
                >
                  {doctorsList.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.doctorTitle || "Dr."} {doc.fullName} (CMP {doc.cmp})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha y Urgencia */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-primary" /> Fecha / Urgencia
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="date"
                    {...register("orderDate")}
                    className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                  />
                  <select
                    {...register("urgency")}
                    className="w-full px-1.5 py-2 text-xs font-bold rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white text-slate-800"
                  >
                    <option value="Rutina">Rutina</option>
                    <option value="Prioritario">Prioritario</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Diagnóstico Presuntivo & CIE-10 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-3 space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Diagnóstico Presuntivo / Motivo de Solicitud *
                </label>
                <input
                  type="text"
                  {...register("diagnosis")}
                  placeholder="Ej: Evaluación de dolor pélvico crónico y descarte de endometriosis"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                {errors.diagnosis && (
                  <p className="text-[11px] text-red-600">{errors.diagnosis.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Código CIE-10</label>
                <input
                  type="text"
                  {...register("cie10Code")}
                  placeholder="Z01.4"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono font-bold uppercase"
                />
              </div>
            </div>

            {/* 3. Paquetes Rápidos en 1 Clic */}
            <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-heading font-extrabold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" /> Plantillas de Paneles Frecuentes (1 Clic)
                </span>
                <span className="text-[10px] text-amber-800 font-medium">
                  Carga automática de análisis e indicaciones
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PACKS.map((pack, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPresetPack(pack)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 hover:border-amber-500 hover:bg-amber-100/50 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs group"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 group-hover:scale-110 transition-transform" />
                    <span>{pack.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Selector de Análisis por Categoría y Buscador */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wider">
                    Catálogo de Análisis de Laboratorio
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                    {selectedItems.length} seleccionados
                  </span>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar análisis (ej. CA-125, VPH, AMH)..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Pestañas de Categoría */}
              <div className="flex flex-wrap gap-1 border-b border-slate-200 pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeTab === cat
                        ? "bg-primary text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grilla de Exámenes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-1 bg-slate-50/50 rounded-xl border border-slate-200">
                {filteredTests.map((test) => {
                  const isChecked = selectedItems.some((item) => item.testName === test.name);
                  return (
                    <div
                      key={test.id}
                      onClick={() => toggleTest(test)}
                      className={`p-2 rounded-lg border cursor-pointer transition-all flex items-start gap-2 select-none ${
                        isChecked
                          ? "bg-primary/10 border-primary shadow-2xs"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Manejado por onClick del contenedor
                        className="mt-0.5 rounded text-primary focus:ring-primary pointer-events-none"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold leading-tight ${isChecked ? "text-primary" : "text-slate-800"}`}>
                          {test.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-500">
                          <span className="font-mono text-slate-600">{test.sampleType}</span>
                          {test.notes && <span>&bull; {test.notes}</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. Lista de Análisis Seleccionados */}
            {selectedItems.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Resumen de Análisis que saldrán en la Orden Oficial ({selectedItems.length}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedItems([])}
                    className="text-[11px] text-red-600 hover:underline font-semibold"
                  >
                    Quitar todos
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedItems.map((item) => (
                    <span
                      key={item.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-primary/30 text-primary font-semibold text-xs shadow-2xs"
                    >
                      <FlaskConical className="w-3 h-3 text-primary/70 shrink-0" />
                      <span>{item.testName}</span>
                      <button
                        type="button"
                        onClick={() => removeSelectedItem(item.id)}
                        className="ml-1 text-slate-400 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Exámenes Adicionales (Texto Libre) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-primary" /> Exámenes Complementarios no Listados (Campo Libre)
              </label>
              <input
                type="text"
                {...register("customTests")}
                placeholder="Ej: Vitamina B12, Perfil celíaco, Dosaje de Cortisol matutino..."
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* 7. Indicaciones y Preparación de la Paciente */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" /> Indicaciones de Preparación para la Paciente
                </label>
                <span className="text-[10px] text-slate-500">Haga clic para agregar:</span>
              </div>

              {/* Chips rápidos de preparación */}
              <div className="flex flex-wrap gap-1.5">
                {INSTRUCTION_PRESETS.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => addInstructionChip(chip)}
                    className="px-2 py-0.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10.5px] font-medium transition-colors border border-slate-200"
                  >
                    + {chip}
                  </button>
                ))}
              </div>

              <textarea
                {...register("patientInstructions")}
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary/20 font-sans"
                placeholder="Indicaciones para la paciente (ayuno, abstinencia, fecha de entrega)..."
              />
            </div>
          </div>

          {/* Pie de Acciones */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-600">
              Médico: <strong>{currentDoctor?.doctorTitle || "Dr."} {currentDoctor?.fullName}</strong> &bull; CMP {currentDoctor?.cmp}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition-all shadow-md shadow-primary/20 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>{initialData ? "Actualizar Orden" : "Emitir Orden de Laboratorio"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

