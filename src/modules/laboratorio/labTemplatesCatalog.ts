/**
 * Catálogo Maestro de Plantillas y Formatos Oficiales de Envío de Muestras
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

import { LabOrderTemplate } from "./laboratorio.types";

export const INITIAL_LAB_TEMPLATES: LabOrderTemplate[] = [
  {
    id: "tmpl-pap-cervicovaginal",
    title: "Citología Cervicovaginal / Papanicolaou (ThinPrep & Convencional)",
    category: "Citología & Cérvix",
    templateType: "PAP",
    sampleType: "Exocérvix y cepillado endocervical en medio líquido PreservCyt / Frotis fijado",
    fixativeTransport: "Vial PreservCyt ThinPrep / Spray fijador citológico en lámina portaobjetos",
    suggestedDiagnosis: "Despistaje ginecológico preventivo / Sospecha de lesión intraepitelial",
    cie10Code: "Z01.4",
    defaultTests: [
      "Citología en Base Líquida (ThinPrep Pap Test)",
      "Evaluación citomorfológica según Sistema Bethesda 2014",
      "Identificación de flora bacteriana / agentes infecciosos (Döderlein, Gardnerella, Cándida, Trichomonas)",
      "Evaluación hormonal del frotis citológico (trofismo epitelial)",
    ],
    clinicalNotes: "Abstinencia sexual 48 horas previas. Sin sangrado menstrual activo. No haber aplicado óvulos ni duchas vaginales 48 horas antes de la toma de muestra.",
    isOfficial: true,
  },
  {
    id: "tmpl-biopsia-patologia",
    title: "Biopsia Quirúrgica / Histopatología (Cérvix, Endometrio, Cono LEEP, Pólipos)",
    category: "Anatomía Patológica",
    templateType: "BIOPSIA",
    sampleType: "Tejido en cuña cervical / Fragmentos endometriales / Pieza quirúrgica LEEP",
    fixativeTransport: "Formol neutro tamponado al 10% (volumen formol:tejido mínimo 10:1) en frasco hermético estéril",
    suggestedDiagnosis: "Displasia cervical moderada / Pólipo / Hiperplasia endometrial",
    cie10Code: "N87.1",
    defaultTests: [
      "Estudio histopatológico con inclusión en parafina y tinción Hematoxilina-Eosina (H&E)",
      "Evaluación de márgenes quirúrgicos endocervicales y ectocervicales",
      "Evaluación de profundidad estromal y compromiso vascular o linfático",
      "Inmunohistoquímica p16 / Ki-67 en caso de displasia sospechosa de alto grado",
    ],
    clinicalNotes: "Rotulación clara del frasco con nombres, DNI, fecha y cuadrante/hora de reloj de toma. Fijación inmediata en formol tamponado para evitar autólisis celular.",
    isOfficial: true,
  },
  {
    id: "tmpl-biopsia-trucut-mama",
    title: "Biopsia Mamaria Percutánea con Aguja Gruesa (Tru-Cut Core Biopsy)",
    category: "Patología Mamaria",
    templateType: "TRUCUT",
    sampleType: "Cilindros tisulares mamarios (calibre 14G / 16G, 3 a 5 fragmentos intactos)",
    fixativeTransport: "Formol neutro tamponado al 10% con inmersión inmediata",
    suggestedDiagnosis: "Nódulo / Masa mamaria sospechosa (BI-RADS 4/5)",
    cie10Code: "N63",
    defaultTests: [
      "Estudio histopatológico estándar con tinción H&E de cilindros mamarios",
      "Clasificación histológica (Carcinoma ductal infiltrante, lobulillar, fibroadenoma, etc.)",
      "Grado histológico de Nottingham / Bloom-Richardson",
      "Panel de Inmunohistoquímica Mamaria: Receptores de Estrógeno (RE), Progesterona (RP), HER2 y Ki-67 (en caso de malignidad)",
    ],
    clinicalNotes: "Indicar radio horario (horas 1 a 12), distancia al pezón en cm, cuadrante y mama (Izquierda/Derecha). Acompañar informe ecográfico BI-RADS.",
    isOfficial: true,
  },
  {
    id: "tmpl-panel-its-pcr",
    title: "Panel Molecular de ITS Multiplex por PCR en Tiempo Real (7 Patógenos)",
    category: "Biología Molecular",
    templateType: "ITS",
    sampleType: "Hisopado endocervical / vaginal profundo en medio de transporte molecular (o primera fracción de orina)",
    fixativeTransport: "Tubo con medio de lisis y transporte molecular para ADN/ARN a 2°C - 8°C",
    suggestedDiagnosis: "Cervicitis mucopurulenta / Síndrome de flujo vaginal recidivante / ITS",
    cie10Code: "A56.0",
    defaultTests: [
      "Chlamydia trachomatis por PCR en tiempo real",
      "Neisseria gonorrhoeae por PCR en tiempo real",
      "Mycoplasma genitalium por PCR en tiempo real",
      "Mycoplasma hominis por PCR en tiempo real",
      "Ureaplasma urealyticum / Ureaplasma parvum por PCR en tiempo real",
      "Trichomonas vaginalis por PCR en tiempo real",
      "Herpes Simplex Virus Tipo 1 y Tipo 2 (HSV-1 / HSV-2) por PCR",
    ],
    clinicalNotes: "Muestra recolectada sin lubricante ni antisépticos previos. Transporte refrigerado con cadena de frío garantizada.",
    isOfficial: true,
  },
  {
    id: "tmpl-liquido-peritoneal",
    title: "Estudio Citoquímico, Bloque Celular y Marcadores de Líquido Peritoneal",
    category: "Fluidos Corporales & Laparoscopía",
    templateType: "PERITONEAL",
    sampleType: "Líquido peritoneal / lavado peritoneal obtenido por laparoscopía o paracentesis (20-50 mL)",
    fixativeTransport: "Frasco estéril con heparina (evita coágulos) para citología + tubo seco estéril para bioquímica",
    suggestedDiagnosis: "Endometriosis pélvica profunda / Ascitis en estudio / Masa pélvica",
    cie10Code: "N80.3",
    defaultTests: [
      "Examen citoquímico: Recuento celular total y diferencial, Glucosa, Proteínas totales, Albúmina, LDH, GASA",
      "Citología oncológica con técnica de Bloque Celular (Cell Block) para células atípicas",
      "Marcador tumoral CA-125 cuantitativo en líquido peritoneal",
      "Frotis con tinción Gram y cultivo aerobio/anaerobio + antibiograma",
      "Tinción de Ziehl-Neelsen / GeneXpert para Mycobacterium tuberculosis en fluido peritoneal",
    ],
    clinicalNotes: "Envío inmediato al laboratorio dentro de las 2 horas post-punción. Indicar sospecha clínica de endometriosis pélvica o masa ovárica.",
    isOfficial: true,
  },
];
