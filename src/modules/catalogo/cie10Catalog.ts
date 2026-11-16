/**
 * CENDO - Catálogo Especializado de Diagnósticos Gineco-Obstétricos & CIE-10
 * Base de datos clínica estructurada para autocompletado bidireccional (Nombre <-> Código).
 */

export type Cie10Category =
  | "ENDOMETRIOSIS"
  | "PATOLOGIA_CERVICAL"
  | "GINECOLOGIA_GENERAL"
  | "CLIMATERIO"
  | "MAMA"
  | "PRENATAL"
  | "PREVENTIVO"
  | "OTRO";

export interface Cie10Item {
  id?: string;
  code: string;
  name: string;
  category: Cie10Category;
  keywords: string[];
  isFavorite?: boolean;
  createdAt?: string;
}

export const CIE10_CATEGORY_LABELS: Record<Cie10Category, string> = {
  ENDOMETRIOSIS: "Endometriosis & Dolor Pélvico",
  PATOLOGIA_CERVICAL: "Patología Cervical & VPH",
  GINECOLOGIA_GENERAL: "Ginecología General & Miomas",
  CLIMATERIO: "Climaterio & Menopausia",
  MAMA: "Mastología & Patología Mamaria",
  PRENATAL: "Control Prenatal & Obstetricia",
  PREVENTIVO: "Chequeo Preventivo & Anticoncepción",
  OTRO: "Otros Diagnósticos Clínicos",
};

export const CIE10_GYN_CATALOG: Cie10Item[] = [
  // --- ENDOMETRIOSIS Y DOLOR PÉLVICO ---
  {
    code: "N80.0",
    name: "Endometriosis del útero (Adenomiosis)",
    category: "ENDOMETRIOSIS",
    keywords: ["adenomiosis", "utero", "miometrio", "dolor", "endometrio"],
    isFavorite: true,
  },
  {
    code: "N80.1",
    name: "Endometriosis ovárica (Endometrioma ovárico)",
    category: "ENDOMETRIOSIS",
    keywords: ["endometrioma", "quiste de chocolate", "ovario", "adherencias"],
    isFavorite: true,
  },
  {
    code: "N80.2",
    name: "Endometriosis de la trompa de Falopio",
    category: "ENDOMETRIOSIS",
    keywords: ["trompa", "salpinge", "obstruccion tubarica"],
  },
  {
    code: "N80.3",
    name: "Endometriosis del peritoneo pélvico y tabique rectovaginal",
    category: "ENDOMETRIOSIS",
    keywords: ["profunda", "peritoneo", "rectovaginal", "douglas", "infiltrativa"],
    isFavorite: true,
  },
  {
    code: "N80.8",
    name: "Otras endometriosis (Vesical, intestinal, cicatriz quirúrgica)",
    category: "ENDOMETRIOSIS",
    keywords: ["vejiga", "intestino", "cicatriz", "cesarea"],
  },
  {
    code: "N80.9",
    name: "Endometriosis, no especificada",
    category: "ENDOMETRIOSIS",
    keywords: ["pelvica", "dolor pelvico"],
  },
  {
    code: "N94.6",
    name: "Dismenorrea no especificada (Dolor menstrual severo)",
    category: "ENDOMETRIOSIS",
    keywords: ["dismenorrea", "colicos", "regla", "menstruacion dolorosa"],
    isFavorite: true,
  },
  {
    code: "R10.2",
    name: "Dolor pélvico crónico y perineal",
    category: "ENDOMETRIOSIS",
    keywords: ["dolor pelvico cronico", "pelviperitonitis", "algias"],
  },

  // --- PATOLOGÍA CERVICAL & COLPOSCOPÍA ---
  {
    code: "N87.0",
    name: "Displasia cervical leve / Neoplasia intraepitelial cervical NIC 1",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["nic 1", "lie-bg", "bajo grado", "vph", "displasia leve", "cervix"],
    isFavorite: true,
  },
  {
    code: "N87.1",
    name: "Displasia cervical moderada / Neoplasia intraepitelial cervical NIC 2",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["nic 2", "lie-ag", "alto grado", "leep", "cono"],
    isFavorite: true,
  },
  {
    code: "N87.2",
    name: "Displasia cervical severa / Neoplasia intraepitelial cervical NIC 3",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["nic 3", "carcinoma in situ", "cis", "alto grado"],
    isFavorite: true,
  },
  {
    code: "N87.9",
    name: "Displasia del cuello uterino, no especificada",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["lesion escamosa", "pap anormal", "citologia anormal"],
  },
  {
    code: "A63.0",
    name: "Verrugas anogenitales / Infección genital por VPH (Condilomas)",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["vph", "condiloma", "papiloma", "verrugas"],
    isFavorite: true,
  },
  {
    code: "N72",
    name: "Cervicitis / Ectropion con inflamación del cuello uterino",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["ectropion", "inflamacion", "cervicitis", "ulcera cervical"],
  },
  {
    code: "N84.1",
    name: "Pólipo del cuello del útero (Pólipo endocervical)",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["polipo", "endocervix", "sangrado intermenstrual"],
  },

  // --- GINECOLOGÍA GENERAL & INFECCIOSAS ---
  {
    code: "D25.0",
    name: "Mioma uterino submucoso",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["mioma", "submucoso", "histeroscopia", "hemorragia"],
  },
  {
    code: "D25.1",
    name: "Mioma uterino intramural",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["mioma intramural", "miomatosis", "utero miomatoso"],
  },
  {
    code: "D25.2",
    name: "Mioma uterino subseroso",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["mioma subseroso", "compresion pelvica"],
  },
  {
    code: "D25.9",
    name: "Leiomioma del útero, no especificado (Miomatosis uterina)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["miomas", "fibroma", "utero aumentado"],
    isFavorite: true,
  },
  {
    code: "N84.0",
    name: "Pólipo endometrial (Pólipo del cuerpo del útero)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["polipo", "endometrio", "engrosamiento endometrial"],
    isFavorite: true,
  },
  {
    code: "N85.0",
    name: "Hiperplasia endometrial",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["hiperplasia", "pipelle", "sangrado posmenopausico"],
  },
  {
    code: "E28.2",
    name: "Síndrome de ovario poliquístico (SOP)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["sop", "ovarios poliquisticos", "resistencia insulina", "irregularidad"],
    isFavorite: true,
  },
  {
    code: "N83.2",
    name: "Quiste ovárico no especificado (Quiste simple / folicular)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["quiste", "anexo", "quiste folicular", "quiste hemorragico"],
  },
  {
    code: "N76.0",
    name: "Vaginitis aguda / Vaginosis bacteriana / Candidiasis",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["flujo", "candidiasis", "gardnerella", "prurito", "infeccion vaginal"],
    isFavorite: true,
  },
  {
    code: "N92.0",
    name: "Menorragia / Sangrado uterino anormal con ciclo regular",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["sangrado abundante", "hemorragia uterina", "anemia"],
  },
  {
    code: "N92.1",
    name: "Metrorragia / Sangrado uterino anormal intermenstrual e irregular",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["spotting", "sangrado irregular", "goteo"],
  },
  {
    code: "N91.2",
    name: "Amenorrea no especificada (Ausencia de menstruación)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["retraso menstrual", "amenorrea", "falta de regla"],
  },
  {
    code: "N70.9",
    name: "Salpingitis y ooforitis, no especificada (Enfermedad Inflamatoria Pélvica)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["epi", "salpingitis", "anexitis", "dolor pelvico"],
  },

  // --- CLIMATERIO Y MENOPAUSIA ---
  {
    code: "N95.1",
    name: "Estados menopáusicos y climatéricos / Síndrome climatérico",
    category: "CLIMATERIO",
    keywords: ["bochornos", "calores", "menopausia", "trh"],
    isFavorite: true,
  },
  {
    code: "N95.2",
    name: "Vaginitis atrófica posmenopáusica (Síndrome genitourinario de la menopausia)",
    category: "CLIMATERIO",
    keywords: ["resequedad", "atrofia", "dispareunia", "laser"],
  },
  {
    code: "M81.0",
    name: "Osteoporosis posmenopáusica",
    category: "CLIMATERIO",
    keywords: ["densitometria", "hueso", "calcio", "fractura"],
  },

  // --- MASTOLOGÍA Y PATOLOGÍA MAMARIA ---
  {
    code: "N60.1",
    name: "Mastopatía fibroquística difusa / Condición fibroquística de la mama",
    category: "MAMA",
    keywords: ["quistes de mama", "mastodinia", "dolor mamario"],
    isFavorite: true,
  },
  {
    code: "D24",
    name: "Tumor benigno de la mama (Fibroadenoma mamario)",
    category: "MAMA",
    keywords: ["fibroadenoma", "nodulo mamario", "benigno"],
    isFavorite: true,
  },
  {
    code: "N64.4",
    name: "Mastodinia / Dolor mamario cíclico o acíclico",
    category: "MAMA",
    keywords: ["dolor mamario", "congestion", "senos"],
  },

  // --- CONTROL PRENATAL Y OBSTETRICIA ---
  {
    code: "Z34.0",
    name: "Supervisión de primer embarazo normal (Control prenatal I Trimestre)",
    category: "PRENATAL",
    keywords: ["embarazo", "gestacion", "primer trimestre", "prenatal"],
    isFavorite: true,
  },
  {
    code: "Z34.8",
    name: "Supervisión de otros embarazos normales (Control prenatal II y III Trimestre)",
    category: "PRENATAL",
    keywords: ["embarazo", "segundo trimestre", "tercer trimestre", "gestante"],
    isFavorite: true,
  },
  {
    code: "Z35.9",
    name: "Supervisión de embarazo de alto riesgo (ARO), no especificado",
    category: "PRENATAL",
    keywords: ["alto riesgo", "aro", "gestante aro", "vigilancia especializada"],
    isFavorite: true,
  },
  {
    code: "O24.4",
    name: "Diabetes mellitus gestacional (DMG)",
    category: "PRENATAL",
    keywords: ["diabetes gestacional", "glucosa alta", "sobrecarga oral", "embarazo"],
    isFavorite: true,
  },
  {
    code: "O14.0",
    name: "Preeclampsia leve a moderada",
    category: "PRENATAL",
    keywords: ["preeclampsia", "hipertension", "proteinuria", "presion alta"],
    isFavorite: true,
  },
  {
    code: "O14.1",
    name: "Preeclampsia severa",
    category: "PRENATAL",
    keywords: ["preeclampsia severa", "criterios de severidad", "emergencia obstetrica"],
  },
  {
    code: "O13",
    name: "Hipertensión gestacional (Inducida por el embarazo, sin proteinuria)",
    category: "PRENATAL",
    keywords: ["hipertension gestacional", "presion alta"],
  },
  {
    code: "O20.0",
    name: "Amenaza de aborto",
    category: "PRENATAL",
    keywords: ["sangrado primer trimestre", "hematoma subcorionico", "amenaza"],
    isFavorite: true,
  },
  {
    code: "O60.0",
    name: "Amenaza de parto pretérmino (< 37 semanas)",
    category: "PRENATAL",
    keywords: ["parto prematuro", "contracciones antes de tiempo", "cervicometria"],
  },
  {
    code: "O00.9",
    name: "Embarazo ectópico, no especificado",
    category: "PRENATAL",
    keywords: ["ectopico", "trompa", "beta hcg"],
  },
  {
    code: "O21.0",
    name: "Hiperémesis gravídica leve / Emesis gravídica",
    category: "PRENATAL",
    keywords: ["nauseas", "vomitos", "embarazo", "emesis"],
  },
  {
    code: "O99.0",
    name: "Anemia que complica el embarazo, el parto y el puerperio",
    category: "PRENATAL",
    keywords: ["anemia gestacional", "hemoglobina baja", "hierro"],
    isFavorite: true,
  },
  {
    code: "O44.0",
    name: "Placenta previa completa / parcial sin hemorragia",
    category: "PRENATAL",
    keywords: ["placenta previa", "insercion baja"],
  },
  {
    code: "O42.9",
    name: "Ruptura prematura de membranas (RPM)",
    category: "PRENATAL",
    keywords: ["perdida de liquido", "rpm", "amniorrexis"],
  },
  {
    code: "Z39.2",
    name: "Seguimiento postparto de rutina / Control de puerperio",
    category: "PRENATAL",
    keywords: ["puerperio", "postparto", "cesarea control", "lactancia"],
  },

  // --- PREVENTIVO Y PLANIFICACIÓN FAMILIAR ---
  {
    code: "Z01.4",
    name: "Examen ginecológico general de rutina / Chequeo preventivo anual",
    category: "PREVENTIVO",
    keywords: ["chequeo", "rutina", "anual", "preventivo", "pap", "sano"],
    isFavorite: true,
  },
  {
    code: "Z30.0",
    name: "Consejería y asesoramiento general sobre anticoncepción",
    category: "PREVENTIVO",
    keywords: ["anticonceptivos", "planificacion", "larc", "pildoras"],
    isFavorite: true,
  },
  {
    code: "Z30.1",
    name: "Inserción de método anticonceptivo (DIU / SIU / Implante subdérmico)",
    category: "PREVENTIVO",
    keywords: ["diu", "mirena", "jadelle", "implanon", "cobre", "t de cobre"],
    isFavorite: true,
  },
  {
    code: "Z30.5",
    name: "Supervisión del uso de dispositivo intrauterino (Control de DIU / SIU)",
    category: "PREVENTIVO",
    keywords: ["control diu", "hilos diu", "ecografia diu"],
  },

  // --- OTROS / TRANSMISIÓN SEXUAL / INMUNIDAD ---
  {
    code: "A51.9",
    name: "Sífilis precoz o no especificada (Reactividad VDRL / RPR)",
    category: "OTRO",
    keywords: ["sifilis", "vdrl", "rpr", "treponema", "penicilina"],
  },
  {
    code: "B20",
    name: "Infección por virus de la inmunodeficiencia humana (VIH / TARGA)",
    category: "OTRO",
    keywords: ["vih", "prueba rapida vih", "elisa"],
  },
  {
    code: "B18.1",
    name: "Hepatitis viral tipo B crónica sin agente delta",
    category: "OTRO",
    keywords: ["hepatitis b", "hbsag", "tamizaje"],
  },
  {
    code: "E03.9",
    name: "Hipotiroidismo, no especificado",
    category: "OTRO",
    keywords: ["tiroides", "tsh", "levotiroxina"],
  },
];

/**
 * Busca diagnósticos por texto (nombre, código o palabras clave).
 */
export function searchCie10(query: string, catalog?: Cie10Item[], limit = 8): Cie10Item[] {
  const list = catalog && catalog.length > 0 ? catalog : CIE10_GYN_CATALOG;
  if (!query || !query.trim()) {
    return list.slice(0, limit);
  }

  const clean = query.trim().toLowerCase();

  return list.filter((item) => {
    if (item.code.toLowerCase().includes(clean)) return true;
    if (item.name.toLowerCase().includes(clean)) return true;
    return item.keywords.some((kw) => kw.toLowerCase().includes(clean));
  }).slice(0, limit);
}

/**
 * Obtiene el diagnóstico exacto por código CIE-10.
 */
export function getCie10ByCode(code: string, catalog?: Cie10Item[]): Cie10Item | undefined {
  const list = catalog && catalog.length > 0 ? catalog : CIE10_GYN_CATALOG;
  const clean = code.trim().toUpperCase();
  return list.find((item) => item.code.toUpperCase() === clean);
}
