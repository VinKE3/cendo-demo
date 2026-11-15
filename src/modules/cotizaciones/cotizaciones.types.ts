/**
 * Módulo de Cotizaciones y Presupuestos - Definiciones de Tipos
 * Centro de Endometriosis y Ginecología (CENDO)
 * Director Médico: Dr. Patrick José Jacinto Gomero (CMP 61693 | RNE 38657)
 */

export interface QuoteItem {
  procedureId: string;
  code: string;
  name: string;
  category: string;
  regularPrice: number;
  discountPercent?: number;
  finalPrice: number;
}

export interface ProcedureQuote {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  doctorName: string;
  quoteDate: string; // YYYY-MM-DD
  validityDays: number;
  items: QuoteItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export interface CreateQuoteInput {
  id?: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  quoteDate?: string;
  validityDays?: number;
  items: QuoteItem[];
  paymentTerms?: string;
  notes?: string;
}

export type UpdateQuoteInput = Partial<CreateQuoteInput>;

export interface QuoteTotals {
  subtotal: number;
  discountTotal: number;
  total: number;
}
