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
  Microscope,
  Scissors,
  Layers,
  Activity,
  Settings,
  FileText,
  FileCheck2,
} from "lucide-react";
import {
  LabOrder,
  LabOrderItem,
  LabCategory,
  Patient,
  LabOrderTemplate,
  LabTemplateType,
  LabSpecimenDetails,
} from "@/types/medical";
import { useMedicalStore, INITIAL_DOCTOR } from "@/store/useMedicalStore";
import { validateLabOrderInput } from "@/modules/laboratorio";
import { Cie10Autocomplete } from "@/components/common/Cie10Autocomplete";
import { getPeruDateString } from "@/lib/utils";
import { LabTemplatesManagerModal } from "./LabTemplatesManagerModal";

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
  { id: "cat-biopsia-cervix", name: "Biopsia de Cérvix / Endocérvix (Estudio Histopatológico)", category: "Ginecología & Marcadores", sampleType: "Tejido en formol al 10%", notes: "Fijación inmediata en formol tamponado al 10%. Indicar hora y cuadrante." },
  { id: "cat-biopsia-endometrio", name: "Biopsia de Endometrio / Legrado Biópsico", category: "Ginecología & Marcadores", sampleType: "Tejido en formol al 10%", notes: "Fijación inmediata en formol tamponado al 10%." },
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
    name: "Envío Muestras Patología (Biopsia / PAP)",
    description: "Biopsia de Cérvix + PAP ThinPrep + VPH PCR (Formato de Anatomía Patológica)",
    testIds: ["cat-biopsia-cervix", "cat-pap", "cat-vph"],
    diagnosis: "Muestra de tejido y citología para estudio de Anatomía Patológica",
    cie10: "R87.6",
  },
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
    backgrounds,
    labTemplates,
    addLabOrder,
    updateLabOrder,
  } = useMedicalStore();

  const [selectedItems, setSelectedItems] = useState<LabOrderItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("Todos");

  // Estados para plantillas de muestra (PAP, Patología, Tru-Cut, ITS, Líquido Peritoneal)
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [selectedTemplateType, setSelectedTemplateType] = useState<LabTemplateType>("GENERAL");
  const [selectedTemplateTitle, setSelectedTemplateTitle] = useState<string>("");
  const [specimenDetails, setSpecimenDetails] = useState<LabSpecimenDetails>({
    sampleObtainedAt: getPeruDateString(),
    fixative: "Formol tamponado 10%",
    containerCount: 1,
    anatomicalSite: "",
    cervixAspect: "",
    fur: "",
    parity: "",
    mac: "",
    clinicalObservations: "",
  });

  const todayStr = getPeruDateString();

  // Lista unificada de médicos disponibles asegurando al Director Médico
  const availableDoctors = React.useMemo(() => {
    const list = doctorsList && doctorsList.length > 0 ? [...doctorsList] : [];
    if (doctorProfile && !list.some((d) => d.id === doctorProfile.id || d.email === doctorProfile.email)) {
      list.unshift(doctorProfile);
    }
    if (list.length === 0 && INITIAL_DOCTOR) {
      list.push(INITIAL_DOCTOR);
    }
    return list;
  }, [doctorsList, doctorProfile]);

  const resolveDoctorId = React.useCallback(
    (candidateId?: string, candidateName?: string): string => {
      if (!availableDoctors.length) return "doc-patrick-jacinto";

      // 1. Coincidencia exacta por ID
      if (candidateId) {
        const byId = availableDoctors.find((d) => d.id === candidateId);
        if (byId) return byId.id;
      }

      // 2. Si candidateId es el alias inicial "doc-patrick-jacinto" o vacío
      if (candidateId === "doc-patrick-jacinto" || !candidateId) {
        const patrick = availableDoctors.find(
          (d) =>
            d.id === "doc-patrick-jacinto" ||
            d.fullName.toLowerCase().includes("patrick") ||
            d.email.toLowerCase().includes("cendo")
        );
        if (patrick) return patrick.id;
      }

      // 3. Coincidencia por nombre de médico
      if (candidateName) {
        const clean = candidateName.replace(/^dr\.?\s+/i, "").toLowerCase().trim();
        const byName = availableDoctors.find(
          (d) =>
            d.fullName.toLowerCase().includes(clean) ||
            clean.includes(d.fullName.toLowerCase())
        );
        if (byName) return byName.id;
      }

      // 4. Fallback al médico activo o al primero
      return doctorProfile?.id || availableDoctors[0]?.id || "doc-patrick-jacinto";
    },
    [availableDoctors, doctorProfile]
  );

  const defaultDoctorId = resolveDoctorId(doctorProfile?.id, doctorProfile?.fullName);

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
  const watchDiagnosis = watch("diagnosis") || "";
  const watchCie10 = watch("cie10Code") || "";

  // Cargar datos en edición o modo nuevo
  useEffect(() => {
    if (initialData) {
      const resolvedDocId = resolveDoctorId(initialData.doctorId, initialData.doctorName);
      reset({
        patientId: initialData.patientId,
        doctorId: resolvedDocId,
        orderDate: initialData.orderDate || todayStr,
        diagnosis: initialData.diagnosis || "",
        cie10Code: initialData.cie10Code || "Z01.4",
        urgency: initialData.urgency || "Rutina",
        customTests: initialData.customTests || "",
        patientInstructions: initialData.patientInstructions || "",
      });
      setSelectedItems(initialData.items || []);
      setSelectedTemplateType(initialData.templateType || "GENERAL");
      setSelectedTemplateTitle(initialData.templateTitle || "");
      if (initialData.specimenDetails) {
        setSpecimenDetails(initialData.specimenDetails);
      } else {
        setSpecimenDetails({
          sampleObtainedAt: initialData.orderDate || todayStr,
          fixative: "Formol tamponado 10%",
          containerCount: 1,
          anatomicalSite: "",
          cervixAspect: "",
          fur: "",
          parity: "",
          mac: "",
          clinicalObservations: "",
        });
      }
    } else {
      const pid = defaultPatientId || (patients.length > 0 ? patients[0].id : "");
      const bg = pid ? backgrounds[pid] : undefined;
      reset({
        patientId: pid,
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
      setSelectedTemplateType("GENERAL");
      setSelectedTemplateTitle("");
      setSpecimenDetails({
        sampleObtainedAt: todayStr,
        fixative: "Formol tamponado 10%",
        containerCount: 1,
        anatomicalSite: "",
        cervixAspect: "",
        fur: bg?.lastMenstrualPeriod || "",
        parity: bg?.obstetricFormula || "",
        mac: bg?.contraceptiveMethod || "",
        clinicalObservations: "",
      });
    }
  }, [initialData, defaultPatientId, isOpen, defaultDoctorId, todayStr, reset, patients, backgrounds]);

  // Si cambia la paciente seleccionada en modo nuevo, autocompletar antecedentes
  useEffect(() => {
    if (selectedPatientId && !initialData) {
      const bg = backgrounds[selectedPatientId];
      if (bg) {
        setSpecimenDetails((prev) => ({
          ...prev,
          fur: prev.fur || bg.lastMenstrualPeriod || "",
          parity: prev.parity || bg.obstetricFormula || "",
          mac: prev.mac || bg.contraceptiveMethod || "",
        }));
      }
    }
  }, [selectedPatientId, backgrounds, initialData]);

  if (!isOpen) return null;

  const currentPatient = patients.find((p) => p.id === selectedPatientId);
  const currentDoctor =
    availableDoctors.find((d) => d.id === selectedDoctorId) ||
    doctorProfile ||
    availableDoctors[0];

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

  const applyLabTemplate = (tmpl: LabOrderTemplate) => {
    setSelectedTemplateType(tmpl.templateType);
    setSelectedTemplateTitle(tmpl.title);

    const packItems: LabOrderItem[] = (tmpl.defaultTests || []).map((tName, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      category: (tmpl.category as LabCategory) || "Ginecología & Marcadores",
      testName: tName,
      sampleType: tmpl.sampleType,
      notes: tmpl.clinicalNotes,
    }));

    setSelectedItems(packItems);
    setValue("diagnosis", tmpl.suggestedDiagnosis);
    if (tmpl.cie10Code) {
      setValue("cie10Code", tmpl.cie10Code);
    }
    setValue("patientInstructions", tmpl.clinicalNotes);

    const bg = selectedPatientId ? backgrounds[selectedPatientId] : undefined;

    let defaultSite = "";
    if (tmpl.templateType === "PAP") defaultSite = "Exocérvix y canal endocervical (cepillado)";
    else if (tmpl.templateType === "BIOPSIA") defaultSite = "Labio anterior / posterior de cérvix o endometrio";
    else if (tmpl.templateType === "TRUCUT") defaultSite = "Mama (indicar lado, cuadrante y radio horario)";
    else if (tmpl.templateType === "ITS") defaultSite = "Hisopado endocervical y vaginal profundo";
    else if (tmpl.templateType === "PERITONEAL") defaultSite = "Fondo de saco de Douglas / Corredera parietocólica";

    setSpecimenDetails((prev) => ({
      ...prev,
      sampleObtainedAt: prev.sampleObtainedAt || todayStr,
      fixative: tmpl.fixativeTransport || prev.fixative || "Formol tamponado 10%",
      anatomicalSite: prev.anatomicalSite || defaultSite,
      containerCount: prev.containerCount || 1,
      fur: prev.fur || bg?.lastMenstrualPeriod || "",
      parity: prev.parity || bg?.obstetricFormula || "",
      mac: prev.mac || bg?.contraceptiveMethod || "",
      clinicalObservations: prev.clinicalObservations || tmpl.clinicalNotes || "",
    }));

    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "success",
      title: `Formato oficial aplicado: ${tmpl.title.split("(")[0].trim()}`,
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
      templateType: selectedTemplateType,
      templateTitle: selectedTemplateTitle || undefined,
      specimenDetails: selectedTemplateType !== "GENERAL" ? specimenDetails : undefined,
    };

    const validation = validateLabOrderInput(payload);
    if (!validation.success) {
      Swal.fire({
        icon: "warning",
        title: "Orden Incompleta",
        text: validation.error,
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    let saved: LabOrder;
    if (initialData) {
      updateLabOrder(initialData.id, payload);
      saved = { ...initialData, ...payload, updatedAt: new Date().toISOString() };
      Swal.fire({
        icon: "success",
        title: "Orden de Laboratorio Actualizada",
        text: "Los análisis solicitados y datos de muestra se guardaron correctamente.",
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
                  {availableDoctors.map((doc) => (
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

            {/* Formatos Oficiales & Fichas de Envío de Muestras (PAP, Patología, Tru-Cut, ITS, Líquido Peritoneal) */}
            <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-heading font-extrabold text-purple-950 flex items-center gap-1.5">
                    <Microscope className="w-4 h-4 text-purple-600" /> Formatos Oficiales de Envío & Citología / Patología
                  </span>
                  <span className="text-[10px] bg-purple-200/80 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                    Dr. Patrick Jacinto
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateManagerOpen(true)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white hover:bg-purple-100/50 border border-purple-300 px-2.5 py-1 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
                >
                  <Settings className="w-3.5 h-3.5 text-purple-600" />
                  <span>Administrar Plantillas ({labTemplates.length})</span>
                </button>
              </div>

              {/* Botones de Plantilla Rápida */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateType("GENERAL");
                    setSelectedTemplateTitle("");
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                    selectedTemplateType === "GENERAL"
                      ? "bg-purple-700 text-white shadow-xs"
                      : "bg-white border border-purple-200 text-slate-700 hover:bg-purple-100/40"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Análisis Clínicos Generales</span>
                </button>

                {labTemplates.map((tmpl) => {
                  const isSelected = selectedTemplateType === tmpl.templateType;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => applyLabTemplate(tmpl)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs ${
                        isSelected
                          ? "bg-purple-700 text-white shadow-xs"
                          : "bg-white border border-purple-200 text-slate-700 hover:bg-purple-100/40"
                      }`}
                    >
                      {tmpl.templateType === "PAP" && <Microscope className="w-3.5 h-3.5 text-purple-500" />}
                      {tmpl.templateType === "BIOPSIA" && <Scissors className="w-3.5 h-3.5 text-emerald-500" />}
                      {tmpl.templateType === "TRUCUT" && <Layers className="w-3.5 h-3.5 text-pink-500" />}
                      {tmpl.templateType === "ITS" && <Activity className="w-3.5 h-3.5 text-amber-500" />}
                      {tmpl.templateType === "PERITONEAL" && <FlaskConical className="w-3.5 h-3.5 text-teal-500" />}
                      {tmpl.templateType === "CUSTOM" && <Sparkles className="w-3.5 h-3.5 text-blue-500" />}
                      <span>{tmpl.title.split("(")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha de Remisión de Muestras (visible si se seleccionó formato especializado) */}
            {selectedTemplateType !== "GENERAL" && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-slate-50 to-purple-50/40 border border-purple-300 shadow-2xs space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-purple-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-purple-700" />
                    <span className="text-xs font-heading font-extrabold text-slate-800 uppercase tracking-wide">
                      Ficha Oficial de Remisión de Muestra a Patología / Citología
                    </span>
                  </div>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 border border-purple-200 font-mono">
                    {selectedTemplateTitle || selectedTemplateType}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Sitio Anatómico */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Sitio Anatómico Exacto / Pieza Remitida <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={specimenDetails.anatomicalSite}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, anatomicalSite: e.target.value })
                      }
                      placeholder="Ej. Exocérvix y canal endocervical / Labio anterior radio 12h / Mama der. CSE"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                    />
                  </div>

                  {/* N° Frascos y Hora de Obtención */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">N° Frascos</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={specimenDetails.containerCount || 1}
                        onChange={(e) =>
                          setSpecimenDetails({
                            ...specimenDetails,
                            containerCount: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-slate-700">Fecha Toma</label>
                      <input
                        type="date"
                        value={specimenDetails.sampleObtainedAt || todayStr}
                        onChange={(e) =>
                          setSpecimenDetails({
                            ...specimenDetails,
                            sampleObtainedAt: e.target.value,
                          })
                        }
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Fijador / Medio de Transporte */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">
                      Fijador / Medio de Transporte de la Muestra
                    </label>
                    <input
                      type="text"
                      value={specimenDetails.fixative}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, fixative: e.target.value })
                      }
                      placeholder="Ej. Formol tamponado al 10% / Vial PreservCyt ThinPrep / Medio molecular PCR"
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                    />
                  </div>

                  {/* Aspecto Macroscópico */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-700">Aspecto de Lesión</label>
                    <input
                      type="text"
                      value={specimenDetails.cervixAspect || ""}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, cervixAspect: e.target.value })
                      }
                      placeholder="Ej. Ectropión sangrante, lesión exofítica friable..."
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                    />
                  </div>
                </div>

                {/* Antecedentes Ginecológicos para Correlación Patológica */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      FUR (Fecha Última Regla)
                    </label>
                    <input
                      type="text"
                      value={specimenDetails.fur || ""}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, fur: e.target.value })
                      }
                      placeholder="YYYY-MM-DD o 'Menopausia'"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Paridad (Fórmula Obstétrica)
                    </label>
                    <input
                      type="text"
                      value={specimenDetails.parity || ""}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, parity: e.target.value })
                      }
                      placeholder="Ej. G0 P0000 / G2 P1011"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500">
                      Anticonceptivo Actual (MAC)
                    </label>
                    <input
                      type="text"
                      value={specimenDetails.mac || ""}
                      onChange={(e) =>
                        setSpecimenDetails({ ...specimenDetails, mac: e.target.value })
                      }
                      placeholder="Ej. DIU Mirena / ACO / Preservativo / Ninguno"
                      className="w-full px-2.5 py-1 text-xs rounded border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                    />
                  </div>
                </div>

                {/* Observaciones Clínicas para Patología */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-700">
                    Observaciones Clínicas & Antecedentes Relevantes para el Patólogo
                  </label>
                  <textarea
                    rows={2}
                    value={specimenDetails.clinicalObservations || ""}
                    onChange={(e) =>
                      setSpecimenDetails({
                        ...specimenDetails,
                        clinicalObservations: e.target.value,
                      })
                    }
                    placeholder="Indicar sospecha clínica, colposcopía previa, biopsias anteriores, etc."
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 bg-white"
                  />
                </div>
              </div>
            )}

            {/* 2. Diagnóstico Presuntivo & CIE-10 (Feedback Dr. Patrick) */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <Cie10Autocomplete
                diagnosis={watchDiagnosis}
                cie10Code={watchCie10}
                onChange={(d, c) => {
                  setValue("diagnosis", d);
                  setValue("cie10Code", c);
                }}
                label="Diagnóstico Presuntivo / Motivo de Solicitud"
                required
              />
              {errors.diagnosis && (
                <p className="text-[11px] text-red-600 mt-1">{errors.diagnosis.message}</p>
              )}
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

        {/* Modal de Administración de Plantillas */}
        <LabTemplatesManagerModal
          isOpen={isTemplateManagerOpen}
          onClose={() => setIsTemplateManagerOpen(false)}
          onSelectTemplate={(tmpl) => {
            applyLabTemplate(tmpl);
            setIsTemplateManagerOpen(false);
          }}
        />
      </div>
    </div>
  );
}

