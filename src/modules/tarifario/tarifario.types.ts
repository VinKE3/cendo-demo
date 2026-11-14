/**
 * CENDO - MÓDULO TARIFARIO Y PROCEDIMIENTOS
 * Tipos de datos e interfaces para el catálogo oficial de prestaciones médicas.
 */

export type TariffCategory =
  | "Consulta"
  | "Procedimiento"
  | "Ecografía"
  | "Laboratorio"
  | "Paquete";

export interface ProcedureTariff {
  id: string;
  code: string;
  name: string;
  category: TariffCategory;
  description: string;
  price: number;
  active: boolean;
  createdAt?: string;
}

export type CreateTariffInput = Omit<ProcedureTariff, "id" | "createdAt">;
export type UpdateTariffInput = Partial<CreateTariffInput>;
