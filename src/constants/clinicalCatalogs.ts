/**
 * CENDO - CATÁLOGOS CLÍNICOS MAESTROS & RESOLVEDORES DE IDENTIDAD
 * Centro de Endometriosis y Ginecología
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 *
 * Arquitectura de Normalización Profesional:
 * - Cada entidad clínica posee un ID canónico inmutable y un Label formal estandarizado.
 * - Array de alias para retrocompatibilidad con registros existentes en Supabase Cloud
 *   (evita campos en blanco en <select> ante discrepancias históricas de mayúsculas/minúsculas).
 * - Funciones de resolución bidireccional (Texto libre / Alias -> ID / Label Canónico).
 */

export interface CatalogItem<TId extends string = string> {
  id: TId;
  label: string;
  shortLabel?: string;
  aliases: string[];
  alert?: boolean; // Para campos que requieren alerta visual médica (ej. Analfabeta, Soltera en CPN)
}

// ============================================================================
// 1. GRADO DE INSTRUCCIÓN (MINSA / CLAP / FILIACIÓN)
// ============================================================================
export type EducationLevelId =
  | "POSTGRADO"
  | "SUPERIOR_UNIV_COMP"
  | "SUPERIOR_UNIV_INCOMP"
  | "SUPERIOR_TEC_COMP"
  | "SUPERIOR_TEC_INCOMP"
  | "SECUNDARIA_COMP"
  | "SECUNDARIA_INCOMP"
  | "PRIMARIA_COMP"
  | "PRIMARIA_INCOMP"
  | "SIN_INSTRUCCION";

export const EDUCATION_LEVEL_CATALOG: CatalogItem<EducationLevelId>[] = [
  {
    id: "SUPERIOR_UNIV_COMP",
    label: "Superior Universitaria Completa",
    shortLabel: "Superior Univ.",
    aliases: [
      "superior universitaria completa",
      "superior universitaria",
      "superior univ",
      "universitaria completa",
      "universitaria",
      "universidad",
      "licenciatura",
      "superior",
    ],
  },
  {
    id: "SUPERIOR_UNIV_INCOMP",
    label: "Superior Universitaria Incompleta",
    shortLabel: "Univ. Incompleta",
    aliases: [
      "superior universitaria incompleta",
      "universitaria incompleta",
      "univ incompleta",
    ],
  },
  {
    id: "SUPERIOR_TEC_COMP",
    label: "Superior Técnica Completa",
    shortLabel: "Superior Técnica",
    aliases: [
      "superior técnica completa",
      "superior tecnica completa",
      "superior técnica",
      "superior tecnica",
      "superior no univ",
      "superior no univ.",
      "técnica completa",
      "tecnica completa",
      "instituto",
    ],
  },
  {
    id: "SUPERIOR_TEC_INCOMP",
    label: "Superior Técnica Incompleta",
    shortLabel: "Técnica Incompleta",
    aliases: [
      "superior técnica incompleta",
      "superior tecnica incompleta",
      "técnica incompleta",
      "tecnica incompleta",
    ],
  },
  {
    id: "POSTGRADO",
    label: "Posgrado / Maestría",
    shortLabel: "Posgrado",
    aliases: [
      "posgrado / maestría",
      "posgrado",
      "postgrado",
      "maestria",
      "maestría",
      "doctorado",
      "phd",
      "especialidad",
    ],
  },
  {
    id: "SECUNDARIA_COMP",
    label: "Secundaria Completa",
    shortLabel: "Secundaria Comp.",
    aliases: [
      "secundaria completa",
      "secundaria",
    ],
  },
  {
    id: "SECUNDARIA_INCOMP",
    label: "Secundaria Incompleta",
    shortLabel: "Secundaria Incomp.",
    aliases: [
      "secundaria incompleta",
    ],
  },
  {
    id: "PRIMARIA_COMP",
    label: "Primaria Completa",
    shortLabel: "Primaria Comp.",
    aliases: [
      "primaria completa",
      "primaria",
    ],
  },
  {
    id: "PRIMARIA_INCOMP",
    label: "Primaria Incompleta",
    shortLabel: "Primaria Incomp.",
    aliases: [
      "primaria incompleta",
    ],
  },
  {
    id: "SIN_INSTRUCCION",
    label: "Sin Instrucción",
    shortLabel: "Sin Instrucción",
    aliases: [
      "sin instrucción",
      "sin instruccion",
      "analfabeta",
      "ninguna",
      "ninguno",
    ],
    alert: true,
  },
];

export function resolveEducationLevel(input?: string | null): CatalogItem<EducationLevelId> {
  if (!input) return EDUCATION_LEVEL_CATALOG[0]; // Default: Superior Universitaria Completa
  const clean = input.trim().toLowerCase();

  // 1. Coincidencia exacta por ID
  const byId = EDUCATION_LEVEL_CATALOG.find((e) => e.id.toLowerCase() === clean);
  if (byId) return byId;

  // 2. Coincidencia exacta por Label
  const byLabel = EDUCATION_LEVEL_CATALOG.find((e) => e.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  // 3. Coincidencia por Alias
  const byAlias = EDUCATION_LEVEL_CATALOG.find((e) =>
    e.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  // 4. Heurísticas inteligentes
  if (clean.includes("post") || clean.includes("pos") || clean.includes("maestr") || clean.includes("doctor")) {
    return EDUCATION_LEVEL_CATALOG.find((e) => e.id === "POSTGRADO")!;
  }
  if (clean.includes("univ")) {
    return clean.includes("incomp")
      ? EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SUPERIOR_UNIV_INCOMP")!
      : EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SUPERIOR_UNIV_COMP")!;
  }
  if (clean.includes("téc") || clean.includes("tec")) {
    return clean.includes("incomp")
      ? EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SUPERIOR_TEC_INCOMP")!
      : EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SUPERIOR_TEC_COMP")!;
  }
  if (clean.includes("secund")) {
    return clean.includes("incomp")
      ? EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SECUNDARIA_INCOMP")!
      : EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SECUNDARIA_COMP")!;
  }
  if (clean.includes("primar")) {
    return clean.includes("incomp")
      ? EDUCATION_LEVEL_CATALOG.find((e) => e.id === "PRIMARIA_INCOMP")!
      : EDUCATION_LEVEL_CATALOG.find((e) => e.id === "PRIMARIA_COMP")!;
  }
  if (clean.includes("analfabeta") || clean.includes("sin inst")) {
    return EDUCATION_LEVEL_CATALOG.find((e) => e.id === "SIN_INSTRUCCION")!;
  }

  return EDUCATION_LEVEL_CATALOG[0];
}

// ============================================================================
// 2. ESTADO CIVIL
// ============================================================================
export type CivilStatusId =
  | "SOLTERA"
  | "CASADA"
  | "CONVIVIENTE"
  | "DIVORCIADA"
  | "VIUDA"
  | "OTRO";

export const CIVIL_STATUS_CATALOG: CatalogItem<CivilStatusId>[] = [
  {
    id: "SOLTERA",
    label: "Soltera",
    aliases: ["soltera", "soltero", "single"],
    alert: true, // En prenatal CLAP genera casilla de alerta
  },
  {
    id: "CASADA",
    label: "Casada",
    aliases: ["casada", "casado", "married"],
  },
  {
    id: "CONVIVIENTE",
    label: "Conviviente",
    aliases: ["conviviente", "union libre", "unión libre", "cohabitante", "concubina"],
  },
  {
    id: "DIVORCIADA",
    label: "Divorciada",
    aliases: ["divorciada", "divorciado", "separada", "separado"],
  },
  {
    id: "VIUDA",
    label: "Viuda",
    aliases: ["viuda", "viudo", "widow"],
  },
  {
    id: "OTRO",
    label: "Otro",
    aliases: ["otro", "otra", "no especifica"],
  },
];

export function resolveCivilStatus(input?: string | null): CatalogItem<CivilStatusId> {
  if (!input) return CIVIL_STATUS_CATALOG[0]; // Default: Soltera
  const clean = input.trim().toLowerCase();

  const byId = CIVIL_STATUS_CATALOG.find((c) => c.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = CIVIL_STATUS_CATALOG.find((c) => c.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = CIVIL_STATUS_CATALOG.find((c) =>
    c.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  return CIVIL_STATUS_CATALOG[0];
}

// ============================================================================
// 3. SEGURO MÉDICO / EPS
// ============================================================================
export type InsuranceId =
  | "SIS"
  | "ESSALUD"
  | "EPS_RIMAC"
  | "EPS_PACIFICO"
  | "EPS_MAPFRE"
  | "EPS_SANITAS"
  | "EPS_LA_POSITIVA"
  | "PARTICULAR"
  | "NO_APLICA";

export const INSURANCE_CATALOG: CatalogItem<InsuranceId>[] = [
  {
    id: "PARTICULAR",
    label: "Particular / Privado",
    shortLabel: "Particular",
    aliases: ["particular", "privado", "cuenta propia", "privada"],
  },
  {
    id: "EPS_RIMAC",
    label: "Rímac Seguros / EPS",
    shortLabel: "Rímac EPS",
    aliases: ["rimac", "rímac", "rimac eps", "rímac eps", "rimac seguros"],
  },
  {
    id: "EPS_PACIFICO",
    label: "Pacífico Seguros / EPS",
    shortLabel: "Pacífico EPS",
    aliases: ["pacifico", "pacífico", "pacifico eps", "pacífico eps", "pacifico seguros"],
  },
  {
    id: "EPS_MAPFRE",
    label: "Mapfre EPS",
    shortLabel: "Mapfre",
    aliases: ["mapfre", "mapfre eps", "mapfre seguros"],
  },
  {
    id: "EPS_SANITAS",
    label: "Sanitas EPS",
    shortLabel: "Sanitas",
    aliases: ["sanitas", "sanitas eps"],
  },
  {
    id: "EPS_LA_POSITIVA",
    label: "La Positiva EPS",
    shortLabel: "La Positiva",
    aliases: ["la positiva", "la positiva eps", "positiva"],
  },
  {
    id: "ESSALUD",
    label: "EsSalud (Seguro Social)",
    shortLabel: "EsSalud",
    aliases: ["essalud", "es salud", "seguro social", "ipss"],
  },
  {
    id: "SIS",
    label: "SIS (Seguro Integral de Salud)",
    shortLabel: "SIS",
    aliases: ["sis", "seguro integral", "seguro integral de salud"],
  },
  {
    id: "NO_APLICA",
    label: "No Aplica / Sin Seguro",
    shortLabel: "No Aplica",
    aliases: ["no aplica", "ninguno", "sin seguro"],
  },
];

export function resolveInsurance(input?: string | null): CatalogItem<InsuranceId> {
  if (!input) return INSURANCE_CATALOG[0]; // Particular por defecto en clínica privada
  const clean = input.trim().toLowerCase();

  const byId = INSURANCE_CATALOG.find((s) => s.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = INSURANCE_CATALOG.find((s) => s.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = INSURANCE_CATALOG.find((s) =>
    s.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  return INSURANCE_CATALOG[0];
}

// ============================================================================
// 4. MÉTODOS ANTICONCEPTIVOS (MAC - ANTECEDENTES & CLAP)
// ============================================================================
export type ContraceptiveId =
  | "NINGUNO"
  | "NINGUNO_EMBARAZO"
  | "NINGUNO_INACTIVA"
  | "PRESERVATIVO"
  | "ACO_COMBINADOS"
  | "ACO_PROGESTAGENO"
  | "INYECTABLE_MENSUAL"
  | "INYECTABLE_TRIMESTRAL"
  | "IMPLANTE_SUBDERMICO"
  | "DIU_COBRE"
  | "DIU_HORMONAL"
  | "PARCHE"
  | "ANILLO"
  | "LIGADURA"
  | "VASECTOMIA"
  | "RITMO"
  | "MELA"
  | "AOE"
  | "OTRO";

export const CONTRACEPTIVE_CATALOG: CatalogItem<ContraceptiveId>[] = [
  {
    id: "NINGUNO",
    label: "Ninguno",
    aliases: ["ninguno", "ninguna", "no usa", "niega uso", "sin mac"],
  },
  {
    id: "NINGUNO_EMBARAZO",
    label: "Ninguno (Embarazo deseado y planificado)",
    aliases: ["embarazo deseado", "deseo gestacional", "buscando embarazo", "embarazo planificado"],
  },
  {
    id: "NINGUNO_INACTIVA",
    label: "Ninguno (Sin vida sexual activa)",
    aliases: ["sin vida sexual", "inactiva", "abstinencia", "no activa"],
  },
  {
    id: "PRESERVATIVO",
    label: "Preservativo / Condón masculino",
    aliases: ["preservativo", "condon", "condón", "preservativo de barrera", "barrera"],
  },
  {
    id: "ACO_COMBINADOS",
    label: "Anticonceptivos orales combinados",
    aliases: ["aco", "orales combinados", "pastillas", "pildoras", "anticonceptivos orales"],
  },
  {
    id: "ACO_PROGESTAGENO",
    label: "Anticonceptivos de progestágeno solo (Minipíldora)",
    aliases: ["minipíldora", "minipildora", "progestageno", "desogestrel"],
  },
  {
    id: "INYECTABLE_MENSUAL",
    label: "Inyectable mensual",
    aliases: ["inyectable mensual", "ampolla mensual", "mesigyna", "novafem"],
  },
  {
    id: "INYECTABLE_TRIMESTRAL",
    label: "Inyectable trimestral (Depo-Provera)",
    aliases: ["inyectable trimestral", "depo-provera", "depoprovera", "ampolla trimestral", "medroxiprogesterona"],
  },
  {
    id: "IMPLANTE_SUBDERMICO",
    label: "Implante subdérmico (Jadelle / Implanon)",
    aliases: ["implante", "implante subdérmico", "implante subdermico", "jadelle", "implanon", "nexplanon"],
  },
  {
    id: "DIU_COBRE",
    label: "DIU T de Cobre (TCu 380A)",
    aliases: ["diu", "t de cobre", "diu cobre", "tcu 380a", "diu de cobre"],
  },
  {
    id: "DIU_HORMONAL",
    label: "DIU Hormonal (Mirena / Kyleena)",
    aliases: ["diu hormonal", "mirena", "kyleena", "siu", "levonorgestrel diu"],
  },
  {
    id: "PARCHE",
    label: "Parche transdérmico",
    aliases: ["parche", "parche transdérmico", "evra"],
  },
  {
    id: "ANILLO",
    label: "Anillo vaginal",
    aliases: ["anillo", "anillo vaginal", "nuvaring"],
  },
  {
    id: "LIGADURA",
    label: "Ligadura de trompas",
    aliases: ["ligadura", "ligadura de trompas", "salpingoclasia", "quirúrgico", "btb"],
  },
  {
    id: "VASECTOMIA",
    label: "Vasectomía (pareja)",
    aliases: ["vasectomía", "vasectomia"],
  },
  {
    id: "RITMO",
    label: "Método del ritmo / Abstinencia periódica",
    aliases: ["ritmo", "ogino-knaus", "calendario", "abstinencia periodica"],
  },
  {
    id: "MELA",
    label: "Método de lactancia y amenorrea (MELA)",
    aliases: ["mela", "lactancia", "amenorrea lactancia"],
  },
  {
    id: "AOE",
    label: "Anticoncepción oral de emergencia (AOE)",
    aliases: ["aoe", "pastilla del día siguiente", "emergencia"],
  },
  {
    id: "OTRO",
    label: "Otro método",
    aliases: ["otro", "otro método", "otros"],
  },
];

export function resolveContraceptive(input?: string | null): CatalogItem<ContraceptiveId> {
  if (!input) return CONTRACEPTIVE_CATALOG[0]; // Ninguno
  const clean = input.trim().toLowerCase();

  const byId = CONTRACEPTIVE_CATALOG.find((m) => m.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = CONTRACEPTIVE_CATALOG.find((m) => m.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = CONTRACEPTIVE_CATALOG.find((m) =>
    m.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  // Si no coincide con ninguno estándar, es un método personalizado ("OTRO")
  const custom = CONTRACEPTIVE_CATALOG.find((m) => m.id === "OTRO")!;
  return { ...custom, label: input.trim() };
}

// ============================================================================
// 5. PARÁMETROS DE PROCEDIMIENTOS MENORES & QUIRÚRGICOS
// ============================================================================

export type AnesthesiaTypeId = "LOCAL_LIDOCAINA" | "SEDACION" | "SIN_ANESTESIA" | "TOPICA";
export const ANESTHESIA_CATALOG: CatalogItem<AnesthesiaTypeId>[] = [
  {
    id: "LOCAL_LIDOCAINA",
    label: "Local (Lidocaína 2%)",
    aliases: ["local", "lidocaina", "lidocaína", "local (lidocaína 2%)"],
  },
  {
    id: "SEDACION",
    label: "Sedación",
    aliases: ["sedacion", "sedación", "anestesia general", "sedacion endovenosa"],
  },
  {
    id: "TOPICA",
    label: "Tópica",
    aliases: ["topica", "tópica", "gel lidocaina", "spray"],
  },
  {
    id: "SIN_ANESTESIA",
    label: "Sin Anestesia",
    aliases: ["sin anestesia", "ninguna", "no requiere"],
  },
];

export function resolveAnesthesia(input?: string | null): CatalogItem<AnesthesiaTypeId> {
  if (!input) return ANESTHESIA_CATALOG[0];
  const clean = input.trim().toLowerCase();

  const byId = ANESTHESIA_CATALOG.find((a) => a.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = ANESTHESIA_CATALOG.find((a) => a.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = ANESTHESIA_CATALOG.find((a) =>
    a.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  return ANESTHESIA_CATALOG[0];
}

export type BleedingAmountId = "MINIMO" | "ESCASO" | "MODERADO";
export const BLEEDING_CATALOG: CatalogItem<BleedingAmountId>[] = [
  {
    id: "MINIMO",
    label: "Mínimo (< 10 ml)",
    aliases: ["minimo", "mínimo", "mínimo (< 10 ml)", "< 10 ml", "despreciable"],
  },
  {
    id: "ESCASO",
    label: "Escaso",
    aliases: ["escaso", "10-30 ml", "leve"],
  },
  {
    id: "MODERADO",
    label: "Moderado",
    aliases: ["moderado", "30-50 ml"],
  },
];

export function resolveBleeding(input?: string | null): CatalogItem<BleedingAmountId> {
  if (!input) return BLEEDING_CATALOG[0];
  const clean = input.trim().toLowerCase();

  const byId = BLEEDING_CATALOG.find((b) => b.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = BLEEDING_CATALOG.find((b) => b.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = BLEEDING_CATALOG.find((b) =>
    b.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  return BLEEDING_CATALOG[0];
}

export type HemostasisMethodId = "MONSEL" | "ELECTROCOAGULACION" | "COMPRESION" | "SUTURA";
export const HEMOSTASIS_CATALOG: CatalogItem<HemostasisMethodId>[] = [
  {
    id: "MONSEL",
    label: "Solución de Monsel",
    aliases: ["monsel", "solución de monsel", "solucion de monsel", "subsulfato férrico"],
  },
  {
    id: "ELECTROCOAGULACION",
    label: "Electrocoagulación",
    aliases: ["electrocoagulación", "electrocoagulacion", "cauterio", "bipolar", "monopolar"],
  },
  {
    id: "COMPRESION",
    label: "Compresión",
    aliases: ["compresión", "compresion", "taponamiento", "presión directa"],
  },
  {
    id: "SUTURA",
    label: "Sutura",
    aliases: ["sutura", "catgut", "vicryl", "punto hemostático"],
  },
];

export function resolveHemostasis(input?: string | null): CatalogItem<HemostasisMethodId> {
  if (!input) return HEMOSTASIS_CATALOG[0];
  const clean = input.trim().toLowerCase();

  const byId = HEMOSTASIS_CATALOG.find((h) => h.id.toLowerCase() === clean);
  if (byId) return byId;

  const byLabel = HEMOSTASIS_CATALOG.find((h) => h.label.toLowerCase() === clean);
  if (byLabel) return byLabel;

  const byAlias = HEMOSTASIS_CATALOG.find((h) =>
    h.aliases.some((alias) => alias === clean || clean.includes(alias))
  );
  if (byAlias) return byAlias;

  return HEMOSTASIS_CATALOG[0];
}

// ============================================================================
// 6. ADAPTADORES OFICIALES PARA CARNET PRENATAL MINSA / CLAP
// ============================================================================

export function toPrenatalEducationLevel(
  input?: string | null
): "Analfabeta" | "Primaria" | "Secundaria" | "Superior No Univ" | "Superior Univ" {
  const item = resolveEducationLevel(input);
  switch (item.id) {
    case "SIN_INSTRUCCION":
      return "Analfabeta";
    case "PRIMARIA_COMP":
    case "PRIMARIA_INCOMP":
      return "Primaria";
    case "SECUNDARIA_COMP":
    case "SECUNDARIA_INCOMP":
      return "Secundaria";
    case "SUPERIOR_TEC_COMP":
    case "SUPERIOR_TEC_INCOMP":
      return "Superior No Univ";
    case "POSTGRADO":
    case "SUPERIOR_UNIV_COMP":
    case "SUPERIOR_UNIV_INCOMP":
    default:
      return "Superior Univ";
  }
}

export function toPrenatalCivilStatus(
  input?: string | null
): "Soltera" | "Casada" | "Conviviente" | "Otro" {
  const item = resolveCivilStatus(input);
  switch (item.id) {
    case "CASADA":
      return "Casada";
    case "CONVIVIENTE":
      return "Conviviente";
    case "SOLTERA":
      return "Soltera";
    case "DIVORCIADA":
    case "VIUDA":
    case "OTRO":
    default:
      return "Otro";
  }
}

export function toPrenatalInsuranceType(
  input?: string | null
): "SIS" | "ESSALUD" | "PRIVADO" | "No Aplica" {
  const item = resolveInsurance(input);
  switch (item.id) {
    case "SIS":
      return "SIS";
    case "ESSALUD":
      return "ESSALUD";
    case "NO_APLICA":
      return "No Aplica";
    case "PARTICULAR":
    case "EPS_RIMAC":
    case "EPS_PACIFICO":
    case "EPS_MAPFRE":
    case "EPS_SANITAS":
    case "EPS_LA_POSITIVA":
    default:
      return "PRIVADO";
  }
}

