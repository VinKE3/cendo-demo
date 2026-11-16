/**
 * CENDO - Catálogo Especializado de Diagnósticos Gineco-Obstétricos & CIE-10
 * Base de datos clínica estructurada para autocompletado bidireccional (Nombre <-> Código).
 */

export interface Cie10Item {
  code: string;
  name: string;
  category: "ENDOMETRIOSIS" | "PATOLOGIA_CERVICAL" | "GINECOLOGIA_GENERAL" | "CLIMATERIO" | "MAMA" | "PRENATAL" | "PREVENTIVO";
  keywords: string[];
}

export const CIE10_GYN_CATALOG: Cie10Item[] = [
  // --- ENDOMETRIOSIS Y DOLOR PÉLVICO ---
  {
    code: "N80.0",
    name: "Endometriosis del útero (Adenomiosis)",
    category: "ENDOMETRIOSIS",
    keywords: ["adenomiosis", "utero", "miometrio", "dolor", "endometrio"],
  },
  {
    code: "N80.1",
    name: "Endometriosis ovárica (Endometrioma ovárico)",
    category: "ENDOMETRIOSIS",
    keywords: ["endometrioma", "quiste de chocolate", "ovario", "adherencias"],
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
  },
  {
    code: "N87.1",
    name: "Displasia cervical moderada / Neoplasia intraepitelial cervical NIC 2",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["nic 2", "lie-ag", "alto grado", "leep", "cono"],
  },
  {
    code: "N87.2",
    name: "Displasia cervical severa / Neoplasia intraepitelial cervical NIC 3",
    category: "PATOLOGIA_CERVICAL",
    keywords: ["nic 3", "carcinoma in situ", "cis", "alto grado"],
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
    code: "D25.9",
    name: "Leiomioma del útero, no especificado (Miomatosis uterina)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["miomas", "fibroma", "utero aumentado"],
  },
  {
    code: "N84.0",
    name: "Pólipo endometrial (Pólipo del cuerpo del útero)",
    category: "GINECOLOGIA_GENERAL",
    keywords: ["polipo", "endometrio", "engrosamiento endometrial"],
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

  // --- CLIMATERIO Y MENOPAUSIA ---
  {
    code: "N95.1",
    name: "Estados menopáusicos y climatéricos / Síndrome climatérico",
    category: "CLIMATERIO",
    keywords: ["menopausia", "bochornos", "climaterio", "sudoracion"],
  },
  {
    code: "N95.2",
    name: "Vaginitis atrófica posmenopáusica / Atrofia urogenital",
    category: "CLIMATERIO",
    keywords: ["sequedad", "atrofia", "dispareunia", "estriol"],
  },

  // --- PATOLOGÍA MAMARIA ---
  {
    code: "N60.1",
    name: "Mastopatía fibroquística difusa (Displasia mamaria BI-RADS 2)",
    category: "MAMA",
    keywords: ["mama", "mastodinia", "dolor mamario", "fibroquistica", "birads 2"],
  },
  {
    code: "D24",
    name: "Tumor benigno de mama (Fibroadenoma de mama)",
    category: "MAMA",
    keywords: ["fibroadenoma", "nodulo mamario", "benigno"],
  },

  // --- CONTROL PRENATAL Y EMBARAZO ---
  {
    code: "Z34.0",
    name: "Supervisión de primer embarazo normal (Control prenatal I Trimestre)",
    category: "PRENATAL",
    keywords: ["embarazo", "gestacion", "primer trimestre", "prenatal"],
  },
  {
    code: "Z34.8",
    name: "Supervisión de otros embarazos normales (Control prenatal II y III Trimestre)",
    category: "PRENATAL",
    keywords: ["embarazo", "segundo trimestre", "tercer trimestre", "gestante"],
  },
  {
    code: "O21.0",
    name: "Hiperémesis gravídica leve / Emesis gravídica",
    category: "PRENATAL",
    keywords: ["nauseas", "vomitos", "embarazo", "emesis"],
  },
  {
    code: "O14.0",
    name: "Preeclampsia leve a moderada",
    category: "PRENATAL",
    keywords: ["preeclampsia", "hipertension", "proteinuria", "presion alta"],
  },

  // --- PREVENTIVO Y PLANIFICACIÓN FAMILIAR ---
  {
    code: "Z01.4",
    name: "Examen ginecológico general de rutina / Chequeo preventivo anual",
    category: "PREVENTIVO",
    keywords: ["chequeo", "rutina", "anual", "preventivo", "pap", "sano"],
  },
  {
    code: "Z30.0",
    name: "Consejería y asesoramiento general sobre anticoncepción",
    category: "PREVENTIVO",
    keywords: ["anticonceptivos", "planificacion", "larc", "pildoras"],
  },
  {
    code: "Z30.1",
    name: "Inserción de método anticonceptivo (DIU / SIU / Implante subdérmico)",
    category: "PREVENTIVO",
    keywords: ["diu", "mirena", "jadelle", "implanon", "cobre", "t de cobre"],
  },
];

/**
 * Busca diagnósticos por texto (nombre, código o palabras clave).
 */
export function searchCie10(query: string, limit = 8): Cie10Item[] {
  if (!query || !query.trim()) {
    return CIE10_GYN_CATALOG.slice(0, limit);
  }

  const clean = query.trim().toLowerCase();

  return CIE10_GYN_CATALOG.filter((item) => {
    if (item.code.toLowerCase().includes(clean)) return true;
    if (item.name.toLowerCase().includes(clean)) return true;
    return item.keywords.some((kw) => kw.toLowerCase().includes(clean));
  }).slice(0, limit);
}

/**
 * Obtiene el diagnóstico exacto por código CIE-10.
 */
export function getCie10ByCode(code: string): Cie10Item | undefined {
  const clean = code.trim().toUpperCase();
  return CIE10_GYN_CATALOG.find((item) => item.code.toUpperCase() === clean);
}
