/**
 * CENDO - MÓDULO VADEMÉCUM
 * Tipos de datos e interfaces para fármacos y marcas comerciales en Perú.
 */

export interface CommercialBrand {
  brandName: string;
  laboratory: string;
  presentation: string;
  referencePricePen: number;
}

export interface MedicationVademecum {
  id: string;
  genericName: string;
  atcCode: string;
  therapeuticGroup: string;
  commercialBrands: CommercialBrand[];
  indications: string;
  contraindications: string;
  createdAt?: string;
}

export type CreateMedicationInput = Omit<MedicationVademecum, "id" | "createdAt">;
export type UpdateMedicationInput = Partial<CreateMedicationInput>;
