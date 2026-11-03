"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Swal from "sweetalert2";
import {
  X,
  FileCheck2,
  Sparkles,
  Camera,
  Clock,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  User,
  ShieldCheck,
  AlertTriangle,
  Upload,
  BookOpen,
  Calendar,
  Layers,
  History,
  Trash2,
  RefreshCw,
  Info,
} from "lucide-react";
import { ColposcopyReport, ColposcopyImage, Patient } from "@/types/medical";
import { useMedicalStore } from "@/store/useMedicalStore";
import { CervicalClock } from "./CervicalClock";
import { compressImageFile } from "@/lib/imageCompressor";
import { uploadClinicalImageToSupabase } from "@/lib/supabaseStorage";

const colposcopySchema = z.object({
  patientId: z.string().min(1, "Debe seleccionar una paciente"),
  reportDate: z.string().min(10, "Fecha inválida (YYYY-MM-DD)"),
  // Evaluación General IFCPC
  adequateColposcopy: z.boolean().default(true),
  inadequateReason: z.string().optional(),
  squamocolumnarJunctionVisible: z.enum(["Visible", "No visible", "Parcialmente visible"]),
  transformationZoneType: z.enum(["Tipo 1", "Tipo 2", "Tipo 3"]),
  // Hallazgos Normales
  matureSquamousEpithelium: z.boolean().default(true),
  ectopy: z.boolean().default(false),
  nabothCyst: z.boolean().default(false),
  cryptOpenings: z.boolean().default(false),
  deciduosis: z.boolean().default(false),
  // Hallazgos Anormales Grado 1 (Menor)
  thinAcetowhiteEpithelium: z.boolean().default(false),
  irregularBorder: z.boolean().default(false),
  fineMosaic: z.boolean().default(false),
  finePunctation: z.boolean().default(false),
  // Hallazgos Anormales Grado 2 (Mayor)
  denseAcetowhiteEpithelium: z.boolean().default(false),
  rapidAcetowhite: z.boolean().default(false),
  thickenedGlands: z.boolean().default(false),
  coarseMosaic: z.boolean().default(false),
  coarsePunctation: z.boolean().default(false),
  sharpBorders: z.boolean().default(false),
  innerBorderSign: z.boolean().default(false),
  ridgeSign: z.boolean().default(false),
  // No Específicos
  leukoplakia: z.boolean().default(false),
  erosion: z.boolean().default(false),
  schillerTest: z.string().default("Negativo (Lugol Caoba)"),
  // Sospecha de Invasión
  atypicalVessels: z.boolean().default(false),
  fragileVessels: z.boolean().default(false),
  irregularSurface: z.boolean().default(false),
  exophyticLesion: z.boolean().default(false),
  necrosis: z.boolean().default(false),
  nodularTumor: z.boolean().default(false),
  // Hallazgos Varios
  congenitalTZ: z.boolean().default(false),
  condyloma: z.boolean().default(false),
  polyp: z.boolean().default(false),
  inflammation: z.boolean().default(false),
  stenosis: z.boolean().default(false),
  postTreatmentAnomaly: z.boolean().default(false),
  endometriosisFoci: z.boolean().default(false),
  otherFindings: z.string().optional(),
  // Biopsia y Diagnóstico
  cervicalBiopsyTaken: z.boolean().default(false),
  diagnosis: z.string().min(3, "El diagnóstico colposcópico es requerido"),
  planRecommendations: z.string().min(3, "Las recomendaciones son requeridas"),
  cie10Code: z.string().default("Z01.4"),
  doctorName: z.string().default("PATRICK JOSE JACINTO GOMERO"),
});

type ColposcopyFormData = z.infer<typeof colposcopySchema>;

interface ColposcopyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: ColposcopyReport | null;
  defaultPatientId?: string;
}

const DEFAULT_IMAGES: ColposcopyImage[] = [
  {
    url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=500&auto=format&fit=crop",
    caption: "Cérvix con SSF: Ectopia periorificial sin sangrado",
    timestamp: "11:15",
  },
  {
    url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=500&auto=format&fit=crop",
    caption: "Ácido acético al 5%: Evaluación acetoblanca",
    timestamp: "11:18",
  },
  {
    url: "https://images.unsplash.com/photo-1581595220892-b0739db3ba8c?q=80&w=500&auto=format&fit=crop",
    caption: "Zona de transformación ampliada",
    timestamp: "11:21",
  },
  {
    url: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?q=80&w=500&auto=format&fit=crop",
    caption: "Test de Schiller: Captación homogénea caoba",
    timestamp: "11:24",
  },
];

const CLINIC_DOCTORS = [
  "PATRICK JOSE JACINTO GOMERO",
  "JOSE LUIS CARRASCO PEREZ",
  "SCHEILER JOSE JACINTO GOMERO",
];

export function ColposcopyModal({
  isOpen,
  onClose,
  initialData,
  defaultPatientId,
}: ColposcopyModalProps) {
  const {
    patients,
    backgrounds,
    clinicalCheckups,
    doctorProfile,
    addColposcopyReport,
    updateColposcopyReport,
  } = useMedicalStore();

  const isEditing = Boolean(initialData);

  // Estados de acordeón estilo SANNA
  const [openSections, setOpenSections] = useState({
    general: true,
    normal: false,
    abnormal: true,
    invasion: false,
    biopsy: true,
    photos: true,
    diagnosis: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Horas del reloj de biopsia
  const [biopsyHours, setBiopsyHours] = useState<string[]>([]);

  // Imágenes colposcópicas con información de compresión y almacenamiento
  const [images, setImages] = useState<ColposcopyImage[]>(DEFAULT_IMAGES);
  const [compressionInfo, setCompressionInfo] = useState<
    Record<number, { originalKb: number; compressedKb: number; ratio: number; isRemote?: boolean }>
  >({});

  // Drawer de antecedentes clínicos de la paciente
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Detección de borrador guardado en localStorage
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ColposcopyFormData>({
    resolver: zodResolver(colposcopySchema),
    defaultValues: {
      patientId: defaultPatientId || (patients[0]?.id || ""),
      reportDate: new Date().toISOString().split("T")[0],
      adequateColposcopy: true,
      inadequateReason: "",
      squamocolumnarJunctionVisible: "Visible",
      transformationZoneType: "Tipo 1",
      matureSquamousEpithelium: true,
      ectopy: false,
      nabothCyst: false,
      cryptOpenings: false,
      deciduosis: false,
      thinAcetowhiteEpithelium: false,
      irregularBorder: false,
      fineMosaic: false,
      finePunctation: false,
      denseAcetowhiteEpithelium: false,
      rapidAcetowhite: false,
      thickenedGlands: false,
      coarseMosaic: false,
      coarsePunctation: false,
      sharpBorders: false,
      innerBorderSign: false,
      ridgeSign: false,
      leukoplakia: false,
      erosion: false,
      schillerTest: "Negativo (Lugol Caoba)",
      atypicalVessels: false,
      fragileVessels: false,
      irregularSurface: false,
      exophyticLesion: false,
      necrosis: false,
      nodularTumor: false,
      congenitalTZ: false,
      condyloma: false,
      polyp: false,
      inflammation: false,
      stenosis: false,
      postTreatmentAnomaly: false,
      endometriosisFoci: false,
      otherFindings: "",
      cervicalBiopsyTaken: false,
      diagnosis: "Colposcopía adecuada. Zona de transformación Tipo 1. Epitelio escamoso maduro, sin hallazgos colposcópicos de displasia cervical.",
      planRecommendations: "Control citológico preventivo (Papanicolaou) anual.",
      cie10Code: "Z01.4",
      doctorName: "PATRICK JOSE JACINTO GOMERO",
    },
  });

  const watchPatientId = watch("patientId");
  const watchAdequate = watch("adequateColposcopy");
  const watchBiopsyTaken = watch("cervicalBiopsyTaken");

  // Paciente seleccionada y sus antecedentes clínicos
  const selectedPatient = patients.find((p) => p.id === watchPatientId);
  const patientBg = selectedPatient ? backgrounds[selectedPatient.id] : null;
  const patientCheckups = selectedPatient
    ? clinicalCheckups.filter((c) => c.patientId === selectedPatient.id)
    : [];

  // Clave para guardar borrador en localStorage
  const draftKey = `cendo_draft_colpo_${watchPatientId || "general"}`;

  // Verificar borrador existente al abrir modal
  useEffect(() => {
    if (isOpen && !initialData) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        setHasSavedDraft(true);
      } else {
        setHasSavedDraft(false);
      }
    }
  }, [isOpen, initialData, draftKey]);

  // Cargar datos para edición o nuevo
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset({
          patientId: initialData.patientId,
          reportDate: initialData.reportDate,
          adequateColposcopy: initialData.adequateColposcopy,
          inadequateReason: initialData.inadequateReason || "",
          squamocolumnarJunctionVisible: initialData.squamocolumnarJunctionVisible,
          transformationZoneType: initialData.transformationZoneType,
          matureSquamousEpithelium: initialData.matureSquamousEpithelium,
          ectopy: initialData.ectopy,
          nabothCyst: initialData.nabothCyst || false,
          cryptOpenings: initialData.cryptOpenings || false,
          deciduosis: initialData.deciduosis || false,
          thinAcetowhiteEpithelium: initialData.thinAcetowhiteEpithelium,
          irregularBorder: initialData.irregularBorder,
          fineMosaic: initialData.fineMosaic,
          finePunctation: initialData.finePunctation,
          denseAcetowhiteEpithelium: initialData.denseAcetowhiteEpithelium,
          rapidAcetowhite: initialData.rapidAcetowhite || false,
          thickenedGlands: initialData.thickenedGlands || false,
          coarseMosaic: initialData.coarseMosaic,
          coarsePunctation: initialData.coarsePunctation,
          sharpBorders: initialData.sharpBorders || false,
          innerBorderSign: initialData.innerBorderSign || false,
          ridgeSign: initialData.ridgeSign || false,
          leukoplakia: initialData.leukoplakia || false,
          erosion: initialData.erosion || false,
          schillerTest: initialData.schillerTest,
          atypicalVessels: initialData.atypicalVessels,
          fragileVessels: initialData.fragileVessels || false,
          irregularSurface: initialData.irregularSurface || false,
          exophyticLesion: initialData.exophyticLesion || false,
          necrosis: initialData.necrosis || false,
          nodularTumor: initialData.nodularTumor || false,
          congenitalTZ: initialData.congenitalTZ || false,
          condyloma: initialData.condyloma || false,
          polyp: initialData.polyp || false,
          inflammation: initialData.inflammation || false,
          stenosis: initialData.stenosis || false,
          postTreatmentAnomaly: initialData.postTreatmentAnomaly || false,
          endometriosisFoci: initialData.endometriosisFoci || false,
          otherFindings: initialData.otherFindings || "",
          cervicalBiopsyTaken: initialData.cervicalBiopsyTaken,
          diagnosis: initialData.diagnosis,
          planRecommendations: initialData.planRecommendations,
          cie10Code: initialData.cie10Code,
          doctorName: initialData.doctorName || "PATRICK JOSE JACINTO GOMERO",
        });
        setBiopsyHours(initialData.biopsyClockHours || []);
        setImages(
          initialData.images && initialData.images.length > 0
            ? initialData.images
            : DEFAULT_IMAGES
        );
      } else {
        reset({
          patientId: defaultPatientId || (patients[0]?.id || ""),
          reportDate: new Date().toISOString().split("T")[0],
          adequateColposcopy: true,
          inadequateReason: "",
          squamocolumnarJunctionVisible: "Visible",
          transformationZoneType: "Tipo 1",
          matureSquamousEpithelium: true,
          ectopy: false,
          nabothCyst: false,
          cryptOpenings: false,
          deciduosis: false,
          thinAcetowhiteEpithelium: false,
          irregularBorder: false,
          fineMosaic: false,
          finePunctation: false,
          denseAcetowhiteEpithelium: false,
          rapidAcetowhite: false,
          thickenedGlands: false,
          coarseMosaic: false,
          coarsePunctation: false,
          sharpBorders: false,
          innerBorderSign: false,
          ridgeSign: false,
          leukoplakia: false,
          erosion: false,
          schillerTest: "Negativo (Lugol Caoba)",
          atypicalVessels: false,
          fragileVessels: false,
          irregularSurface: false,
          exophyticLesion: false,
          necrosis: false,
          nodularTumor: false,
          congenitalTZ: false,
          condyloma: false,
          polyp: false,
          inflammation: false,
          stenosis: false,
          postTreatmentAnomaly: false,
          endometriosisFoci: false,
          otherFindings: "",
          cervicalBiopsyTaken: false,
          diagnosis:
            "Colposcopía adecuada. Zona de transformación Tipo 1. Epitelio escamoso maduro, sin hallazgos colposcópicos de displasia cervical.",
          planRecommendations: "Control citológico preventivo (Papanicolaou) anual.",
          cie10Code: "Z01.4",
          doctorName: "PATRICK JOSE JACINTO GOMERO",
        });
        setBiopsyHours([]);
        setImages(DEFAULT_IMAGES);
      }
    }
  }, [isOpen, initialData, defaultPatientId, patients, reset]);

  // Guardado de borrador automático (debounced)
  const formValues = watch();
  const draftTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || isEditing) return;

    if (draftTimerRef.current) {
      clearTimeout(draftTimerRef.current);
    }

    draftTimerRef.current = setTimeout(() => {
      try {
        const payload = {
          formData: formValues,
          biopsyHours,
          images,
          savedAt: new Date().toLocaleTimeString(),
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));
      } catch {
        // Ignorar si el almacenamiento local está lleno
      }
    }, 1500);

    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, [formValues, biopsyHours, images, isOpen, isEditing, draftKey]);

  // Restaurar borrador guardado
  const handleRestoreDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed.formData) {
        reset(parsed.formData);
      }
      if (parsed.biopsyHours) {
        setBiopsyHours(parsed.biopsyHours);
      }
      if (parsed.images) {
        setImages(parsed.images);
      }
      setHasSavedDraft(false);
      Swal.fire({
        icon: "success",
        title: "Borrador Restaurado",
        text: `Se recuperó el borrador guardado a las ${parsed.savedAt || "última sesión"}.`,
        timer: 1500,
        showConfirmButton: false,
        confirmButtonColor: "#0A4D68",
      });
    } catch {
      Swal.fire({
        icon: "error",
        title: "No se pudo restaurar",
        text: "El borrador está dañado o no es compatible.",
        confirmButtonColor: "#0A4D68",
      });
    }
  };

  // Descartar borrador
  const handleDiscardDraft = () => {
    localStorage.removeItem(draftKey);
    setHasSavedDraft(false);
  };

  // BOTÓN MÁGICO 1: Marcar Normales por Defecto
  const handleSetNormalDefaults = () => {
    setValue("adequateColposcopy", true);
    setValue("inadequateReason", "");
    setValue("squamocolumnarJunctionVisible", "Visible");
    setValue("transformationZoneType", "Tipo 1");
    setValue("matureSquamousEpithelium", true);
    setValue("ectopy", false);
    setValue("nabothCyst", false);
    setValue("cryptOpenings", false);
    setValue("deciduosis", false);
    setValue("thinAcetowhiteEpithelium", false);
    setValue("irregularBorder", false);
    setValue("fineMosaic", false);
    setValue("finePunctation", false);
    setValue("denseAcetowhiteEpithelium", false);
    setValue("rapidAcetowhite", false);
    setValue("thickenedGlands", false);
    setValue("coarseMosaic", false);
    setValue("coarsePunctation", false);
    setValue("sharpBorders", false);
    setValue("innerBorderSign", false);
    setValue("ridgeSign", false);
    setValue("leukoplakia", false);
    setValue("erosion", false);
    setValue("schillerTest", "Negativo (Lugol Caoba)");
    setValue("atypicalVessels", false);
    setValue("fragileVessels", false);
    setValue("irregularSurface", false);
    setValue("exophyticLesion", false);
    setValue("necrosis", false);
    setValue("nodularTumor", false);
    setValue("congenitalTZ", false);
    setValue("condyloma", false);
    setValue("polyp", false);
    setValue("inflammation", false);
    setValue("stenosis", false);
    setValue("postTreatmentAnomaly", false);
    setValue("endometriosisFoci", false);
    setValue("cervicalBiopsyTaken", false);
    setValue("cie10Code", "Z01.4");
    setValue(
      "diagnosis",
      "Colposcopía adecuada. Zona de transformación Tipo 1. Epitelio escamoso maduro, sin hallazgos colposcópicos de displasia cervical."
    );
    setValue("planRecommendations", "Control citológico preventivo (Papanicolaou) anual.");
    setBiopsyHours([]);

    Swal.fire({
      icon: "success",
      title: "Parámetros Normales Aplicados",
      text: "Se marcaron todos los hallazgos fisiológicos normales por defecto. Active únicamente los hallazgos patológicos positivos.",
      confirmButtonColor: "#0A4D68",
      timer: 1600,
      showConfirmButton: false,
    });
  };

  // PLANTILLAS CLÍNICAS RÁPIDAS
  const handleApplyPreset = (presetType: "normal" | "liebg" | "lieag" | "cervicitis") => {
    if (presetType === "normal") {
      handleSetNormalDefaults();
    } else if (presetType === "liebg") {
      setValue("adequateColposcopy", true);
      setValue("squamocolumnarJunctionVisible", "Visible");
      setValue("transformationZoneType", "Tipo 1");
      setValue("matureSquamousEpithelium", true);
      setValue("thinAcetowhiteEpithelium", true);
      setValue("fineMosaic", true);
      setValue("finePunctation", false);
      setValue("denseAcetowhiteEpithelium", false);
      setValue("coarseMosaic", false);
      setValue("coarsePunctation", false);
      setValue("schillerTest", "Positivo (Yodo negativo)");
      setValue("cervicalBiopsyTaken", true);
      setValue("cie10Code", "N87.0");
      setValue(
        "diagnosis",
        "Hallazgos colposcópicos anormales Grado 1 (menor): Epitelio acetoblanco tenue y mosaico fino en labio anterior. Compatible con LIE de bajo grado (L-SIL / NIC 1)."
      );
      setValue(
        "planRecommendations",
        "Biopsia de cérvix dirigida. Control citológico y colposcópico en 6 meses según informe anatomopatológico. Reforzar uso de preservativo."
      );
      setBiopsyHours(["12"]);
    } else if (presetType === "lieag") {
      setValue("adequateColposcopy", true);
      setValue("squamocolumnarJunctionVisible", "Visible");
      setValue("transformationZoneType", "Tipo 2");
      setValue("matureSquamousEpithelium", false);
      setValue("denseAcetowhiteEpithelium", true);
      setValue("rapidAcetowhite", true);
      setValue("coarseMosaic", true);
      setValue("coarsePunctation", true);
      setValue("sharpBorders", true);
      setValue("ridgeSign", true);
      setValue("schillerTest", "Positivo (Yodo negativo)");
      setValue("cervicalBiopsyTaken", true);
      setValue("cie10Code", "N87.2");
      setValue(
        "diagnosis",
        "Hallazgos colposcópicos anormales Grado 2 (mayor): Epitelio acetoblanco denso de aparición rápida, mosaico y punteado grueso con signo de cresta. Sospecha de LIE de alto grado (H-SIL / NIC 2-3)."
      );
      setValue(
        "planRecommendations",
        "Biopsia cervical dirigida urgente (horas 12 y 6) con pinza Tischler + estudio histopatológico. Valorar conización LEEP según resultado."
      );
      setBiopsyHours(["12", "6"]);
    } else if (presetType === "cervicitis") {
      setValue("adequateColposcopy", true);
      setValue("squamocolumnarJunctionVisible", "Visible");
      setValue("transformationZoneType", "Tipo 1");
      setValue("ectopy", true);
      setValue("inflammation", true);
      setValue("schillerTest", "Moteado / Captación parcial");
      setValue("cervicalBiopsyTaken", false);
      setValue("cie10Code", "N72");
      setValue(
        "diagnosis",
        "Ectopia cervical periorificial con signos de cervicitis inflamatoria moderada. Sin signos colposcópicos de displasia."
      );
      setValue(
        "planRecommendations",
        "Tratamiento médico antiinflamatorio tópico / óvulos vaginales. Control ginecológico en 3 meses posterior al tratamiento."
      );
      setBiopsyHours([]);
    }

    Swal.fire({
      icon: "success",
      title: "Plantilla Diagnóstica Cargada",
      text: "Se autocompletaron los criterios y la recomendación sugerida.",
      confirmButtonColor: "#0A4D68",
      timer: 1400,
      showConfirmButton: false,
    });
  };

  // Subida de fotos con compresión automática en Canvas y almacenamiento en Supabase
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      Swal.fire({
        icon: "warning",
        title: "Archivo No Válido",
        text: "Por favor seleccione una imagen (JPEG, PNG, WebP).",
        confirmButtonColor: "#0A4D68",
      });
      return;
    }

    try {
      // 1. Compresión inteligente en canvas cliente (reduce de ~5 MB a ~180 KB)
      const compressed = await compressImageFile(file, {
        maxWidth: 1280,
        maxHeight: 960,
        quality: 0.82,
      });

      // 2. Subida automática al bucket 'clinical-images' de Supabase
      const storageResult = await uploadClinicalImageToSupabase(compressed.dataUrl, {
        folder: "colposcopia",
        prefix: `colpo_${watchPatientId || "paciente"}`,
      });

      const finalUrl = storageResult.isRemote ? storageResult.url : compressed.dataUrl;

      setImages((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          url: finalUrl,
        };
        return updated;
      });

      setCompressionInfo((prev) => ({
        ...prev,
        [index]: {
          originalKb: compressed.originalSizeKb,
          compressedKb: compressed.compressedSizeKb,
          ratio: compressed.compressionRatio,
          isRemote: storageResult.isRemote,
        },
      }));
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al procesar la foto",
        text: "No se pudo comprimir la imagen en el navegador.",
        confirmButtonColor: "#0A4D68",
      });
    }
  };

  if (!isOpen) return null;

  const onSubmit = async (data: ColposcopyFormData) => {
    try {
      if (data.cervicalBiopsyTaken && biopsyHours.length === 0) {
        await Swal.fire({
          icon: "warning",
          title: "Indique las Horas de Biopsia",
          text: "Marcó que se tomó biopsia dirigida de cérvix. Por favor haga clic en el Reloj Cervical en al menos una hora (ej. 12:00 o 6:00) para ubicar el sitio anatómico.",
          confirmButtonColor: "#0A4D68",
        });
        return;
      }

      const reportPayload = {
        patientId: data.patientId,
        reportDate: data.reportDate,
        adequateColposcopy: data.adequateColposcopy,
        inadequateReason: data.inadequateReason,
        squamocolumnarJunctionVisible: data.squamocolumnarJunctionVisible,
        transformationZoneType: data.transformationZoneType,
        matureSquamousEpithelium: data.matureSquamousEpithelium,
        ectopy: data.ectopy,
        nabothCyst: data.nabothCyst,
        cryptOpenings: data.cryptOpenings,
        deciduosis: data.deciduosis,
        thinAcetowhiteEpithelium: data.thinAcetowhiteEpithelium,
        irregularBorder: data.irregularBorder,
        fineMosaic: data.fineMosaic,
        finePunctation: data.finePunctation,
        denseAcetowhiteEpithelium: data.denseAcetowhiteEpithelium,
        rapidAcetowhite: data.rapidAcetowhite,
        thickenedGlands: data.thickenedGlands,
        coarseMosaic: data.coarseMosaic,
        coarsePunctation: data.coarsePunctation,
        sharpBorders: data.sharpBorders,
        innerBorderSign: data.innerBorderSign,
        ridgeSign: data.ridgeSign,
        leukoplakia: data.leukoplakia,
        erosion: data.erosion,
        schillerTest: data.schillerTest,
        atypicalVessels: data.atypicalVessels,
        fragileVessels: data.fragileVessels,
        irregularSurface: data.irregularSurface,
        exophyticLesion: data.exophyticLesion,
        necrosis: data.necrosis,
        nodularTumor: data.nodularTumor,
        congenitalTZ: data.congenitalTZ,
        condyloma: data.condyloma,
        polyp: data.polyp,
        inflammation: data.inflammation,
        stenosis: data.stenosis,
        postTreatmentAnomaly: data.postTreatmentAnomaly,
        endometriosisFoci: data.endometriosisFoci,
        otherFindings: data.otherFindings,
        cervicalBiopsyTaken: data.cervicalBiopsyTaken,
        biopsyClockHours: data.cervicalBiopsyTaken ? biopsyHours : [],
        images,
        diagnosis: data.diagnosis.trim(),
        planRecommendations: data.planRecommendations.trim(),
        cie10Code: data.cie10Code,
        doctorName: data.doctorName,
      };

      if (isEditing && initialData) {
        updateColposcopyReport(initialData.id, reportPayload);

        await Swal.fire({
          icon: "success",
          title: "Informe Actualizado",
          text: "El informe de colposcopía se actualizó exitosamente.",
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      } else {
        addColposcopyReport(reportPayload);

        // Limpiar borrador tras guardar
        localStorage.removeItem(draftKey);

        await Swal.fire({
          icon: "success",
          title: "Informe Generado",
          text: "Informe de colposcopía IFCPC guardado en la historia clínica.",
          confirmButtonColor: "#0A4D68",
          timer: 1600,
          showConfirmButton: false,
        });
      }

      onClose();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error al guardar",
        text: "Ocurrió un inconveniente al registrar el informe colposcópico.",
        confirmButtonColor: "#EF4444",
      });
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-5xl rounded-2xl border border-border shadow-2xl overflow-hidden cursor-default transition-all my-6 flex flex-col max-h-[92vh]"
      >
        {/* Cabecera del Modal con Acciones Rápidas */}
        <div className="p-4 sm:p-5 border-b border-border bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-extrabold text-heading text-base">
                  {isEditing ? "Editar Informe de Colposcopía" : "+ Nueva Evaluación de Colposcopía"}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  IFCPC Río 2011 &bull; 59 Cols Excel
                </span>
              </div>
              <p className="text-xs text-muted">
                {selectedPatient
                  ? `Paciente: ${selectedPatient.lastName}, ${selectedPatient.firstName} (DNI ${selectedPatient.dni})`
                  : "Complete los hallazgos para generar el informe oficial CENDO"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Botón Ver Antecedentes / Historial */}
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="px-3 py-1.5 rounded-xl border border-border bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-2xs transition-all flex items-center gap-1.5"
              title="Consultar antecedentes gineco-obstétricos y chequeos previos de la paciente"
            >
              <BookOpen className="w-4 h-4 text-primary" />
              <span>{showHistoryDrawer ? "Ocultar Antecedentes" : "Ver Antecedentes"}</span>
            </button>

            {/* Botón Mágico Normales */}
            <button
              type="button"
              onClick={handleSetNormalDefaults}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
              title="Pone todos los hallazgos en normales/benignos con 1 clic"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Marcar Normales</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-muted hover:text-heading hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alerta de Borrador Recuperable */}
        {hasSavedDraft && !isEditing && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Borrador recuperable:</strong> Tiene cambios no guardados de una sesión anterior para esta paciente.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-2.5 py-1 rounded-lg bg-amber-700 hover:bg-amber-800 text-white font-bold text-[11px] transition-colors"
              >
                Restaurar Borrador
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-semibold text-[11px] transition-colors"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Drawer Lateral / Panel Plegable de Antecedentes */}
        {showHistoryDrawer && selectedPatient && (
          <div className="p-4 bg-teal-50/60 border-b border-teal-200/80 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-heading font-extrabold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-teal-700" />
                Resumen de Historia Clínica &bull; {selectedPatient.lastName}, {selectedPatient.firstName}
              </span>
              <span className="text-[10px] font-mono text-teal-700">
                DNI: {selectedPatient.dni} &bull; {selectedPatient.age} años
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs bg-white p-3 rounded-xl border border-teal-200/60 shadow-2xs">
              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">FUR / Ciclo</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientBg?.lastMenstrualPeriod || "No registra"}
                </strong>
                {patientBg?.lastMenstrualPeriod && (
                  <span className="text-[10px] text-teal-700 block font-semibold">
                    FUR registrada
                  </span>
                )}
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Paridad (G P)</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientBg?.obstetricFormula || "G0 P0000"}
                </strong>
                <span className="text-[10px] text-slate-500 block">
                  MAC: {patientBg?.contraceptiveMethod || "Ninguno"}
                </span>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Historial PAP</span>
                <strong className="text-amber-800 block mt-0.5 font-bold">
                  {patientBg?.papHistory || "Sin antecedentes"}
                </strong>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Historial Test VPH</span>
                <strong className="text-indigo-800 block mt-0.5 font-bold">
                  {patientBg?.vphTestHistory || "Sin registro"}
                </strong>
              </div>

              <div>
                <span className="text-[9px] uppercase font-bold text-slate-500 block">Último Chequeo</span>
                <strong className="text-slate-900 block mt-0.5">
                  {patientCheckups[0]?.checkupDate || "Sin chequeos"}
                </strong>
                {patientCheckups[0]?.breastUltrasoundBirads && (
                  <span className="text-[10px] font-bold text-primary block">
                    {patientCheckups[0].breastUltrasoundBirads}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Formulario Acordeón con Scroll */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Fila Inicial: Datos de la Cita & Plantillas Rápidas */}
          <div className="p-4 rounded-xl bg-slate-50 border border-border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Selector de Paciente */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Paciente Evaluada <span className="text-status-alert">*</span>
                </label>
                <select
                  {...register("patientId")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.lastName}, {p.firstName} (DNI: {p.dni})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de Cita */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Fecha de Procedimiento <span className="text-status-alert">*</span>
                </label>
                <input
                  type="date"
                  {...register("reportDate")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Médico Evaluador */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-heading uppercase tracking-wider block">
                  Médico Evaluador
                </label>
                <select
                  {...register("doctorName")}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-heading focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {CLINIC_DOCTORS.map((doc) => (
                    <option key={doc} value={doc}>
                      DR. {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Barra de Plantillas Diagnósticas con 1 Clic */}
            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Cargar Plantilla Diagnóstica:
              </span>
              <button
                type="button"
                onClick={() => handleApplyPreset("normal")}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-200 transition-colors"
              >
                1. Normal (Sin LIE)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("liebg")}
                className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-colors"
              >
                2. LIE-BG (NIC 1)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("lieag")}
                className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-bold border border-rose-200 transition-colors"
              >
                3. LIE-AG (NIC 2-3)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("cervicitis")}
                className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-[11px] font-bold border border-sky-200 transition-colors"
              >
                4. Cervicitis / Ectropion
              </button>
            </div>
          </div>

          {/* ACORDEÓN 1: Criterios Generales IFCPC Río 2011 */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("general")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-800 font-bold text-xs flex items-center justify-center">
                  1
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Evaluación General IFCPC Río de Janeiro 2011
                </span>
              </div>
              {openSections.general ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.general && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Adecuada */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Adecuación Colposcópica
                    </label>
                    <select
                      {...register("adequateColposcopy", {
                        setValueAs: (v) => v === "true" || v === true,
                      })}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="true">Adecuada</option>
                      <option value="false">Inadecuada</option>
                    </select>
                  </div>

                  {/* UEC */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Unión Escamocolumnar (UEC)
                    </label>
                    <select
                      {...register("squamocolumnarJunctionVisible")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Visible">Visible</option>
                      <option value="Parcialmente visible">Parcialmente visible</option>
                      <option value="No visible">No visible</option>
                    </select>
                  </div>

                  {/* Tipo de ZT */}
                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Tipo de Zona de Transformación
                    </label>
                    <select
                      {...register("transformationZoneType")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="Tipo 1">Tipo 1 (Completamente ectocervical)</option>
                      <option value="Tipo 2">Tipo 2 (Componente endocervical visible)</option>
                      <option value="Tipo 3">Tipo 3 (Componente endocervical no visible)</option>
                    </select>
                  </div>
                </div>

                {!watchAdequate && (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                      Motivo de Examen Inadecuado (Columna 19 del Excel maestro):
                    </label>
                    <input
                      type="text"
                      {...register("inadequateReason")}
                      placeholder="Ej. Inflamación severa, sangrado abundante, atrofia severa..."
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-xs text-heading focus:outline-none"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACORDEÓN 2: Hallazgos Normales (Cols 22 a 26 de Excel) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("normal")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center">
                  2
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Hallazgos Colposcópicos Normales (Cols 22-26 de Excel)
                </span>
              </div>
              {openSections.normal ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.normal && (
              <div className="p-4 space-y-3 text-xs border-t border-border">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("matureSquamousEpithelium")}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Epitelio Escamoso Maduro</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("ectopy")}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Epitelio Columnar / Ectopia</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("nabothCyst")}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Quistes de Naboth</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("cryptOpenings")}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Criptas / Aberturas Glandulares</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("deciduosis")}
                      className="w-4 h-4 rounded text-teal-600 accent-teal-600"
                    />
                    <span className="text-[11px] font-medium text-heading">Deciduosis en el Embarazo</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 3: Hallazgos Anormales (Grado 1, Grado 2, No Específicos & Schiller) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("abnormal")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center">
                  3
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Hallazgos Anormales Grado 1, Grado 2 y Test de Schiller (Cols 27-41)
                </span>
              </div>
              {openSections.abnormal ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.abnormal && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                {/* Grado 1 */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                    Grado 1 (Menor):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("thinAcetowhiteEpithelium")}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Acetoblanco Tenue</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("irregularBorder")}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Borde Irregular</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("fineMosaic")}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Mosaico Fino</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-amber-200/60 bg-amber-50/30 hover:bg-amber-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("finePunctation")}
                        className="w-4 h-4 rounded text-amber-600 accent-amber-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Punteado Fino</span>
                    </label>
                  </div>
                </div>

                {/* Grado 2 */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block">
                    Grado 2 (Mayor):
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("denseAcetowhiteEpithelium")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Acetoblanco Denso</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("rapidAcetowhite")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Aparición Rápida</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("coarseMosaic")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Mosaico Grueso</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("coarsePunctation")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Punteado Grueso</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("sharpBorders")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Bordes Delimitados</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("innerBorderSign")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Signo Borde Interno</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("ridgeSign")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Signo de Cresta</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-red-200/60 bg-red-50/30 hover:bg-red-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("thickenedGlands")}
                        className="w-4 h-4 rounded text-red-600 accent-red-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Glándulas Engrosadas</span>
                    </label>
                  </div>
                </div>

                {/* No específicos & Schiller */}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("leukoplakia")}
                      className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                    />
                    <span className="text-[11px] font-medium text-heading">Leucoplasia (Queratosis)</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("erosion")}
                      className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                    />
                    <span className="text-[11px] font-medium text-heading">Erosión</span>
                  </label>

                  <div className="space-y-1">
                    <label className="font-bold text-heading uppercase tracking-wider block text-[10px]">
                      Test de Schiller (Lugol)
                    </label>
                    <select
                      {...register("schillerTest")}
                      className="w-full px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold focus:outline-none"
                    >
                      <option value="Negativo (Lugol Caoba)">Negativo (Lugol Caoba)</option>
                      <option value="Positivo (Yodo negativo)">Positivo (Yodo negativo)</option>
                      <option value="Moteado / Captación parcial">Moteado / Captación parcial</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 4: Sospecha de Invasión & Hallazgos Varios (Cols 42-57 de Excel) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("invasion")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-rose-100 text-rose-800 font-bold text-xs flex items-center justify-center">
                  4
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Sospecha de Invasión & Hallazgos Varios (Cols 42-57)
                </span>
              </div>
              {openSections.invasion ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.invasion && (
              <div className="p-4 space-y-3 text-xs border-t border-border">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 block">
                    Criterios de Sospecha de Invasión:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("atypicalVessels")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Vasos Atípicos</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("fragileVessels")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Vasos Delgados / Frágiles</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("irregularSurface")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Superficie Irregular</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("exophyticLesion")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Lesión Exofítica</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("necrosis")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Necrosis / Ulceración</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-rose-200/60 hover:bg-rose-50/30 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("nodularTumor")}
                        className="w-4 h-4 rounded text-rose-600 accent-rose-600"
                      />
                      <span className="text-[11px] font-medium text-heading">Tumoración Nodular</span>
                    </label>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block">
                    Hallazgos Varios:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("congenitalTZ")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">ZT Congénita</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("condyloma")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Condiloma</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("polyp")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Pólipo Cervical</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("inflammation")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Inflamación</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("stenosis")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Estenosis</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("postTreatmentAnomaly")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Anomalía Post-Trat.</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 rounded-lg border border-border hover:bg-slate-50 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register("endometriosisFoci")}
                        className="w-4 h-4 rounded text-slate-700 accent-slate-700"
                      />
                      <span className="text-[11px] font-medium text-heading">Foco de Endometriosis</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 5: Biopsia Dirigida & Reloj Cervical */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("biopsy")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-red-100 text-red-800 font-bold text-xs flex items-center justify-center">
                  5
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Mapeo de Biopsia de Cérvix & Reloj de Cuadrantes (SVG)
                </span>
              </div>
              {openSections.biopsy ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.biopsy && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("cervicalBiopsyTaken")}
                      className="w-5 h-5 rounded text-red-600 accent-red-600"
                    />
                    <span className="font-bold text-heading text-sm">
                      Se realizó toma de Biopsia de Cérvix dirigida (Columna 58 de Excel)
                    </span>
                  </label>

                  {watchBiopsyTaken && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                      Pinza Tischler
                    </span>
                  )}
                </div>

                {watchBiopsyTaken ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-border flex flex-col items-center justify-center space-y-2">
                    <p className="text-xs font-bold text-heading text-center">
                      Haga clic en las horas anatómicas (1 a 12) para indicar los sitios exactos de biopsia:
                    </p>
                    <CervicalClock
                      selectedHours={biopsyHours}
                      onChange={setBiopsyHours}
                      interactive={true}
                      size="md"
                    />
                    {biopsyHours.length > 0 && (
                      <p className="text-xs font-bold text-primary">
                        Horas seleccionadas: {biopsyHours.map((h) => `${h}:00`).join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted italic bg-slate-50 p-3 rounded-xl border border-dashed border-border">
                    No se indicó biopsia en este examen. Active la casilla superior para desplegar el reloj anatómico interactivo.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ACORDEÓN 6: Fotografías Digitales con Compresión en Canvas */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("photos")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center">
                  6
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Registro Fotográfico Colposcópico (Compresión Automática en Canvas)
                </span>
              </div>
              {openSections.photos ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.photos && (
              <div className="p-4 space-y-3 text-xs border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-muted">
                    4 tomas clínicas. Las imágenes pesadas se comprimen automáticamente a ~180 KB para que el PDF no pese 32 MB:
                  </p>
                  <span className="text-[10px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    Compresión bicúbica activa
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="group rounded-xl border border-border overflow-hidden bg-slate-100 flex flex-col justify-between shadow-2xs hover:border-primary/40 transition-all"
                    >
                      <div className="aspect-4/3 relative bg-slate-200 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.url}
                          alt={img.caption}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white font-mono text-[9px] font-bold">
                          Foto #{idx + 1}
                        </span>

                        {compressionInfo[idx] && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-950/85 text-emerald-300 font-mono text-[8px] font-bold flex items-center gap-1 backdrop-blur-xs">
                            {compressionInfo[idx].isRemote ? "☁️ Supabase" : "⚡ Local"} -{compressionInfo[idx].ratio}%
                          </span>
                        )}

                        {/* Botón de Reemplazo / Subida de Foto */}
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white cursor-pointer backdrop-blur-[1px]">
                          <Upload className="w-5 h-5 drop-shadow" />
                          <span className="text-[10px] font-semibold">Cambiar Foto</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(idx, e)}
                          />
                        </label>
                      </div>
                      <div className="p-2 space-y-1 bg-white">
                        <label className="text-[9px] font-bold text-muted uppercase block">
                          Epígrafe:
                        </label>
                        <input
                          type="text"
                          value={img.caption}
                          onChange={(e) => {
                            const newImages = [...images];
                            newImages[idx].caption = e.target.value;
                            setImages(newImages);
                          }}
                          className="w-full text-[10px] font-semibold text-heading bg-transparent border-b border-border/80 focus:outline-none focus:border-primary"
                          placeholder="Descripción clínica..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ACORDEÓN 7: Diagnóstico, Recomendaciones y CIE-10 (Col 59 de Excel) */}
          <div className="rounded-xl border border-border bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => toggleSection("diagnosis")}
              className="w-full p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                  7
                </span>
                <span className="text-xs font-heading font-extrabold text-heading uppercase tracking-wider">
                  Diagnóstico Colposcópico (Columna 59 de Excel) & Conducta
                </span>
              </div>
              {openSections.diagnosis ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
            </button>

            {openSections.diagnosis && (
              <div className="p-4 space-y-4 text-xs border-t border-border">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                      Código CIE-10
                    </label>
                    <input
                      type="text"
                      {...register("cie10Code")}
                      className="w-full px-3 py-2 rounded-xl border border-border bg-white text-xs font-mono font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                      Diagnóstico Colposcópico Conclusivo <span className="text-status-alert">*</span>
                    </label>
                    <textarea
                      rows={2}
                      {...register("diagnosis")}
                      placeholder="Conclusiones diagnósticas del examen..."
                      className={`w-full px-3 py-2 rounded-xl border bg-white text-xs font-medium text-heading focus:outline-none focus:ring-2 resize-none ${
                        errors.diagnosis
                          ? "border-status-alert focus:ring-status-alert/20"
                          : "border-border focus:ring-primary/20"
                      }`}
                    />
                    {errors.diagnosis && (
                      <p className="text-[11px] text-status-alert flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        <span>{errors.diagnosis.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-heading block">
                    Conducta y Recomendaciones Terapéuticas <span className="text-status-alert">*</span>
                  </label>
                  <textarea
                    rows={2}
                    {...register("planRecommendations")}
                    placeholder="Plan de manejo, control o tratamiento..."
                    className={`w-full px-3 py-2 rounded-xl border bg-white text-xs font-medium text-heading focus:outline-none focus:ring-2 resize-none ${
                      errors.planRecommendations
                        ? "border-status-alert focus:ring-status-alert/20"
                        : "border-border focus:ring-primary/20"
                    }`}
                  />
                  {errors.planRecommendations && (
                    <p className="text-[11px] text-status-alert flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{errors.planRecommendations.message}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botones de Envío */}
          <div className="pt-3 border-t border-border flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border bg-surface text-xs font-semibold text-muted hover:text-heading hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Check className="w-4 h-4 text-secondary" />
              <span>{isEditing ? "Guardar Cambios de Informe" : "Emitir Informe de Colposcopía"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
