/**
 * Módulo de Colposcopía IFCPC 2011 - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export type SCJVisibility = "Visible" | "No visible" | "Parcialmente visible";
export type TZType = "Tipo 1" | "Tipo 2" | "Tipo 3";
export type CervicalClockHour = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12";

export interface ColposcopyImage {
  url: string;
  caption: string;
  timestamp: string;
}

export interface ColposcopyReport {
  id: string;
  patientId: string;
  reportDate: string; // YYYY-MM-DD
  adequateColposcopy: boolean;
  inadequateReason?: string;
  squamocolumnarJunctionVisible: SCJVisibility;
  transformationZoneType: TZType;
  // Normales IFCPC
  matureSquamousEpithelium: boolean;
  ectopy: boolean;
  nabothCyst?: boolean;
  cryptOpenings?: boolean;
  deciduosis?: boolean;
  // Anormales Grado 1 (Menor)
  thinAcetowhiteEpithelium: boolean;
  irregularBorder: boolean;
  fineMosaic: boolean;
  finePunctation: boolean;
  // Anormales Grado 2 (Mayor)
  denseAcetowhiteEpithelium: boolean;
  coarseMosaic: boolean;
  coarsePunctation: boolean;
  rapidAcetowhite?: boolean;
  thickenedGlands?: boolean;
  sharpBorders?: boolean;
  innerBorderSign?: boolean;
  ridgeSign?: boolean;
  // No Específicos, Invasión & Varios
  leukoplakia?: boolean;
  erosion?: boolean;
  atypicalVessels: boolean;
  fragileVessels?: boolean;
  irregularSurface?: boolean;
  exophyticLesion?: boolean;
  necrosis?: boolean;
  nodularTumor?: boolean;
  congenitalTZ?: boolean;
  condyloma?: boolean;
  polyp?: boolean;
  inflammation?: boolean;
  stenosis?: boolean;
  postTreatmentAnomaly?: boolean;
  endometriosisFoci?: boolean;
  otherFindings?: string;
  schillerTest: string;
  cervicalBiopsyTaken: boolean;
  biopsyClockHours: string[]; // ["11", "1"]
  images: ColposcopyImage[];
  diagnosis: string;
  planRecommendations: string;
  cie10Code: string;
  doctorName: string;
  createdAt?: string;
}

export interface CreateColposcopyInput {
  id?: string;
  patientId: string;
  reportDate: string;
  adequateColposcopy?: boolean;
  inadequateReason?: string;
  squamocolumnarJunctionVisible?: SCJVisibility;
  transformationZoneType?: TZType;
  matureSquamousEpithelium?: boolean;
  ectopy?: boolean;
  nabothCyst?: boolean; cryptOpenings?: boolean; deciduosis?: boolean;
  thinAcetowhiteEpithelium?: boolean; irregularBorder?: boolean;
  fineMosaic?: boolean; finePunctation?: boolean;
  denseAcetowhiteEpithelium?: boolean; coarseMosaic?: boolean; coarsePunctation?: boolean;
  rapidAcetowhite?: boolean; thickenedGlands?: boolean; sharpBorders?: boolean;
  innerBorderSign?: boolean; ridgeSign?: boolean;
  leukoplakia?: boolean; erosion?: boolean; atypicalVessels?: boolean;
  fragileVessels?: boolean; irregularSurface?: boolean; exophyticLesion?: boolean;
  necrosis?: boolean; nodularTumor?: boolean; congenitalTZ?: boolean;
  condyloma?: boolean; polyp?: boolean; inflammation?: boolean; stenosis?: boolean;
  postTreatmentAnomaly?: boolean; endometriosisFoci?: boolean;
  otherFindings?: string;
  schillerTest?: string;
  cervicalBiopsyTaken?: boolean;
  biopsyClockHours?: string[];
  images?: ColposcopyImage[];
  diagnosis: string;
  planRecommendations: string;
  cie10Code?: string;
  doctorName?: string;
}

export type UpdateColposcopyInput = Partial<CreateColposcopyInput>;
