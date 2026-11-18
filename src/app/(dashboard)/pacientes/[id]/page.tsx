"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  User,
  Calendar,
  Activity,
  FileCheck2,
  Edit2,
  Stethoscope,
  Pill,
  Printer,
  FlaskConical,
  Baby,
  Scissors,
  Receipt,
  FileCode,
  FileText,
} from "lucide-react";
import { useMedicalStore } from "@/store/useMedicalStore";
import {
  ColposcopyReport,
  ClinicalCheckup,
  MedicalPrescription,
  LabOrder,
  PrenatalCard,
  PatientDocument,
  MedicalConsultation,
  UltrasoundReport,
  MinorProcedureReport,
  ProcedureQuote,
} from "@/types/medical";
import {
  TabResumen,
  TabConsultas,
  TabColposcopia,
  TabEcografias,
  TabProcedimientos,
  TabControlPrenatal,
  TabRecetas,
  TabLaboratorioCotizaciones,
  TabDocumentosWord,
} from "@/components/pacientes/tabs";
import { PatientDetailModals } from "@/components/pacientes/PatientDetailModals";
import { calculateAge } from "@/lib/utils";

type PatientTab =
  | "resumen"
  | "consultas"
  | "colposcopia"
  | "ecografias"
  | "procedimientos"
  | "prenatal"
  | "recetas"
  | "laboratorio"
  | "documentos";

export default function FichaPacientePage() {
  const params = useParams();
  const patientId = params.id as string;

  const [activeTab, setActiveTab] = useState<PatientTab>("resumen");

  // Estados de Modales
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [isColpoModalOpen, setIsColpoModalOpen] = useState(false);
  const [editingColpo, setEditingColpo] = useState<ColposcopyReport | null>(null);
  const [viewingColpo, setViewingColpo] = useState<ColposcopyReport | null>(null);
  const [isColpoPrintOpen, setIsColpoPrintOpen] = useState(false);
  const [isCheckupModalOpen, setIsCheckupModalOpen] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState<ClinicalCheckup | null>(null);
  const [viewingCheckup, setViewingCheckup] = useState<ClinicalCheckup | null>(null);
  const [isCheckupPrintOpen, setIsCheckupPrintOpen] = useState(false);
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<MedicalPrescription | null>(null);
  const [viewingPrescription, setViewingPrescription] = useState<MedicalPrescription | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [editingLabOrder, setEditingLabOrder] = useState<LabOrder | null>(null);
  const [viewingLabOrder, setViewingLabOrder] = useState<LabOrder | null>(null);
  const [isLabPrintModalOpen, setIsLabPrintModalOpen] = useState(false);
  const [isPrenatalModalOpen, setIsPrenatalModalOpen] = useState(false);
  const [prenatalInitialTab, setPrenatalInitialTab] = useState<"basal" | "consultas" | "aro">("basal");
  const [viewingPrenatalCard, setViewingPrenatalCard] = useState<PrenatalCard | null>(null);
  const [isPrenatalPrintModalOpen, setIsPrenatalPrintModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [selectedDocToView, setSelectedDocToView] = useState<PatientDocument | null>(null);
  const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);
  const [editingConsultation, setEditingConsultation] = useState<MedicalConsultation | null>(null);
  const [viewingConsultation, setViewingConsultation] = useState<MedicalConsultation | null>(null);
  const [isConsultationPrintOpen, setIsConsultationPrintOpen] = useState(false);
  const [isUltrasoundModalOpen, setIsUltrasoundModalOpen] = useState(false);
  const [editingUltrasound, setEditingUltrasound] = useState<UltrasoundReport | null>(null);
  const [viewingUltrasound, setViewingUltrasound] = useState<UltrasoundReport | null>(null);
  const [isUltrasoundPrintOpen, setIsUltrasoundPrintOpen] = useState(false);
  const [isMinorProcModalOpen, setIsMinorProcModalOpen] = useState(false);
  const [editingMinorProc, setEditingMinorProc] = useState<MinorProcedureReport | null>(null);
  const [viewingMinorProc, setViewingMinorProc] = useState<MinorProcedureReport | null>(null);
  const [isMinorProcPrintOpen, setIsMinorProcPrintOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [viewingQuote, setViewingQuote] = useState<ProcedureQuote | null>(null);
  const [isQuotePrintOpen, setIsQuotePrintOpen] = useState(false);
  const [isWordHistoryModalOpen, setIsWordHistoryModalOpen] = useState(false);
  const [isCompleteHistoryPrintOpen, setIsCompleteHistoryPrintOpen] = useState(false);

  const {
    getPatientById,
    getBackground,
    getColposcopyByPatientId,
    getCheckupsByPatientId,
    getPrescriptionsByPatientId,
    deletePrescription,
    getLabOrdersByPatientId,
    deleteLabOrder,
    getPrenatalCardByPatientId,
    getConsultationsByPatientId,
    deleteConsultation,
    getUltrasoundsByPatientId,
    deleteUltrasoundReport,
    getMinorProceduresByPatientId,
    deleteMinorProcedure,
    getQuotesByPatientId,
    deleteQuote,
    getWordHistoriesByPatientId,
    deleteWordHistory,
    getDocumentsByPatientId,
    doctorProfile,
  } = useMedicalStore();

  const patient = getPatientById(patientId);
  const bg = getBackground(patientId);
  const colpos = getColposcopyByPatientId(patientId);
  const checkups = getCheckupsByPatientId(patientId);
  const prescriptions = getPrescriptionsByPatientId(patientId);
  const labOrders = getLabOrdersByPatientId(patientId);
  const prenatalCard = getPrenatalCardByPatientId(patientId);
  const consultations = getConsultationsByPatientId(patientId);
  const ultrasoundReports = getUltrasoundsByPatientId(patientId);
  const minorProcedures = getMinorProceduresByPatientId(patientId);
  const quotes = getQuotesByPatientId(patientId);
  const wordHistories = getWordHistoriesByPatientId(patientId);
  const patientDocuments = getDocumentsByPatientId(patientId);

  // Calculadora de Amenorrea por FUR
  const furCalculation = useMemo(() => {
    if (!bg?.lastMenstrualPeriod) return null;
    const furDate = new Date(bg.lastMenstrualPeriod + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - furDate.getTime();
    if (diffTime < 0) return null;

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const remainingDays = diffDays % 7;

    return {
      days: diffDays,
      weeks,
      remainingDays,
      text: `${weeks} sem ${remainingDays} d (${diffDays} días de amenorrea)`,
    };
  }, [bg?.lastMenstrualPeriod]);

  if (!patient) {
    return (
      <div className="py-16 text-center space-y-4">
        <User className="w-12 h-12 mx-auto text-muted" />
        <h2 className="text-lg font-heading font-bold text-heading">
          Paciente no encontrada
        </h2>
        <p className="text-xs text-muted max-w-sm mx-auto">
          La historia clínica solicitada no existe o fue eliminada del sistema.
        </p>
        <Link
          href="/pacientes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Directorio de Pacientes</span>
        </Link>
      </div>
    );
  }

  const tabList: { id: PatientTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "resumen", label: "Resumen & Antecedentes", icon: <User className="w-4 h-4" /> },
    { id: "consultas", label: "Consultas", icon: <Stethoscope className="w-4 h-4" />, count: consultations.length },
    { id: "colposcopia", label: "Colposcopía", icon: <FileCheck2 className="w-4 h-4" />, count: colpos.length },
    { id: "ecografias", label: "Ecografías", icon: <Activity className="w-4 h-4" />, count: ultrasoundReports.length },
    { id: "procedimientos", label: "Procedimientos", icon: <Scissors className="w-4 h-4" />, count: minorProcedures.length },
    { id: "prenatal", label: "Control Prenatal", icon: <Baby className="w-4 h-4" />, count: prenatalCard ? (prenatalCard.visits?.length || 1) : 0 },
    { id: "recetas", label: "Recetas", icon: <Pill className="w-4 h-4" />, count: prescriptions.length },
    { id: "laboratorio", label: "Laboratorio & Cotiz.", icon: <FlaskConical className="w-4 h-4" />, count: labOrders.length + quotes.length },
    { id: "documentos", label: "Resultados & Exámenes", icon: <FileText className="w-4 h-4" />, count: patientDocuments.length + wordHistories.length },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Encabezado Patronímico y Acciones de Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface p-5 rounded-2xl border border-border shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/pacientes"
            className="p-2.5 rounded-xl bg-slate-50 border border-border text-muted hover:text-heading hover:bg-slate-100 transition-colors shadow-2xs"
            title="Volver a la lista de pacientes"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-heading font-extrabold text-heading">
                {patient.lastName}, {patient.firstName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-accent-soft text-primary border border-primary/20">
                DNI {patient.dni}
              </span>
              {prenatalCard && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                  <Baby className="w-3 h-3 text-amber-600" />
                  <span>Gestante (Control Prenatal)</span>
                </span>
              )}
            </div>
            <p className="text-xs text-muted font-mono mt-0.5">
              Historia Clínica CENDO &bull; {patient.age && patient.age > 0 ? patient.age : (patient.birthDate ? calculateAge(patient.birthDate) : 25)} años &bull; {patient.civilStatus} &bull; {patient.occupation || "Profesional independiente"} &bull; Tel: {patient.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPatientModalOpen(true)}
            className="px-3 py-2 rounded-xl border border-border bg-white text-xs font-semibold text-heading hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5 text-muted" />
            <span>Editar Paciente</span>
          </button>

          <button
            onClick={() => setIsCompleteHistoryPrintOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-primary text-white hover:bg-primary-hover text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-secondary" />
            <span>HC Modelo CENDO</span>
          </button>
        </div>
      </div>

      {/* 2. Barra de Navegación por Pestañas Clínicas Especializadas */}
      <div className="bg-surface rounded-2xl border border-border shadow-xs p-1.5 flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        {tabList.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-heading hover:bg-slate-100"
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={`px-1.5 py-0.2 rounded-full font-mono text-[10px] font-bold ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Contenido Dinámico de la Pestaña Activa */}
      <div>
        {activeTab === "resumen" && (
          <TabResumen
            patient={patient}
            bg={bg}
            furCalculation={furCalculation}
            prenatalCard={prenatalCard}
            doctorProfile={doctorProfile}
            onOpenEditPatient={() => setIsPatientModalOpen(true)}
            onOpenEditBackground={() => setIsBgModalOpen(true)}
            onOpenPrenatalModal={(tab) => {
              setPrenatalInitialTab(tab || (prenatalCard ? "consultas" : "basal"));
              setIsPrenatalModalOpen(true);
            }}
            onOpenPrenatalPrint={(card) => {
              setViewingPrenatalCard(card);
              setIsPrenatalPrintModalOpen(true);
            }}
          />
        )}

        {activeTab === "consultas" && (
          <TabConsultas
            patient={patient}
            consultations={consultations}
            doctorProfile={doctorProfile}
            onOpenNewConsultation={() => {
              setEditingConsultation(null);
              setIsConsultationModalOpen(true);
            }}
            onEditConsultation={(cons) => {
              setEditingConsultation(cons);
              setIsConsultationModalOpen(true);
            }}
            onPrintConsultation={(cons) => {
              setViewingConsultation(cons);
              setIsConsultationPrintOpen(true);
            }}
            onDeleteConsultation={(id) => deleteConsultation(id)}
          />
        )}

        {activeTab === "colposcopia" && (
          <TabColposcopia
            patient={patient}
            colpos={colpos}
            checkups={checkups}
            doctorProfile={doctorProfile}
            onOpenNewColpo={() => {
              setEditingColpo(null);
              setIsColpoModalOpen(true);
            }}
            onEditColpo={(colpo) => {
              setEditingColpo(colpo);
              setIsColpoModalOpen(true);
            }}
            onPrintColpo={(colpo) => {
              setViewingColpo(colpo);
              setIsColpoPrintOpen(true);
            }}
            onOpenNewCheckup={() => {
              setEditingCheckup(null);
              setIsCheckupModalOpen(true);
            }}
            onEditCheckup={(chk) => {
              setEditingCheckup(chk);
              setIsCheckupModalOpen(true);
            }}
            onPrintCheckup={(chk) => {
              setViewingCheckup(chk);
              setIsCheckupPrintOpen(true);
            }}
          />
        )}

        {activeTab === "ecografias" && (
          <TabEcografias
            patient={patient}
            ultrasoundReports={ultrasoundReports}
            doctorProfile={doctorProfile}
            onOpenNewUltrasound={() => {
              setEditingUltrasound(null);
              setIsUltrasoundModalOpen(true);
            }}
            onEditUltrasound={(echo) => {
              setEditingUltrasound(echo);
              setIsUltrasoundModalOpen(true);
            }}
            onPrintUltrasound={(echo) => {
              setViewingUltrasound(echo);
              setIsUltrasoundPrintOpen(true);
            }}
            onDeleteUltrasound={(id) => deleteUltrasoundReport(id)}
          />
        )}

        {activeTab === "procedimientos" && (
          <TabProcedimientos
            patient={patient}
            minorProcedures={minorProcedures}
            doctorProfile={doctorProfile}
            onOpenNewMinorProc={() => {
              setEditingMinorProc(null);
              setIsMinorProcModalOpen(true);
            }}
            onEditMinorProc={(proc) => {
              setEditingMinorProc(proc);
              setIsMinorProcModalOpen(true);
            }}
            onPrintMinorProc={(proc) => {
              setViewingMinorProc(proc);
              setIsMinorProcPrintOpen(true);
            }}
            onDeleteMinorProc={(id) => deleteMinorProcedure(id)}
          />
        )}

        {activeTab === "prenatal" && (
          <TabControlPrenatal
            patient={patient}
            prenatalCard={prenatalCard}
            doctorProfile={doctorProfile}
            onOpenPrenatalModal={(tab) => {
              setPrenatalInitialTab(tab || "basal");
              setIsPrenatalModalOpen(true);
            }}
            onOpenPrenatalPrint={(card) => {
              setViewingPrenatalCard(card);
              setIsPrenatalPrintModalOpen(true);
            }}
          />
        )}

        {activeTab === "recetas" && (
          <TabRecetas
            patient={patient}
            prescriptions={prescriptions}
            doctorProfile={doctorProfile}
            onOpenNewPrescription={() => {
              setEditingPrescription(null);
              setIsPrescriptionModalOpen(true);
            }}
            onEditPrescription={(rec) => {
              setEditingPrescription(rec);
              setIsPrescriptionModalOpen(true);
            }}
            onPrintPrescription={(rec) => {
              setViewingPrescription(rec);
              setIsPrintModalOpen(true);
            }}
            onDeletePrescription={(id) => deletePrescription(id)}
          />
        )}

        {activeTab === "laboratorio" && (
          <TabLaboratorioCotizaciones
            patient={patient}
            labOrders={labOrders}
            quotes={quotes}
            doctorProfile={doctorProfile}
            onOpenNewLabOrder={() => {
              setEditingLabOrder(null);
              setIsLabModalOpen(true);
            }}
            onEditLabOrder={(ord) => {
              setEditingLabOrder(ord);
              setIsLabModalOpen(true);
            }}
            onPrintLabOrder={(ord) => {
              setViewingLabOrder(ord);
              setIsLabPrintModalOpen(true);
            }}
            onDeleteLabOrder={(id) => deleteLabOrder(id)}
            onOpenNewQuote={() => setIsQuoteModalOpen(true)}
            onPrintQuote={(quote) => {
              setViewingQuote(quote);
              setIsQuotePrintOpen(true);
            }}
            onDeleteQuote={(id) => deleteQuote(id)}
            onOpenUploadDocModal={() => setIsUploadDocModalOpen(true)}
          />
        )}

        {activeTab === "documentos" && (
          <TabDocumentosWord
            patient={patient}
            wordHistories={wordHistories}
            doctorProfile={doctorProfile}
            onOpenWordModal={() => setIsWordHistoryModalOpen(true)}
            onDeleteWordHistory={(id) => deleteWordHistory(id)}
            onOpenUploadDocModal={() => setIsUploadDocModalOpen(true)}
            onViewDocument={(doc) => {
              setSelectedDocToView(doc);
              setIsDocViewerOpen(true);
            }}
          />
        )}
      </div>

      {/* 4. Modales y Vistas de Impresión de la Paciente */}
      <PatientDetailModals
        patient={patient}
        bg={bg}
        doctorProfile={doctorProfile}
        consultations={consultations}
        isPatientModalOpen={isPatientModalOpen}
        setIsPatientModalOpen={setIsPatientModalOpen}
        isBgModalOpen={isBgModalOpen}
        setIsBgModalOpen={setIsBgModalOpen}
        isColpoModalOpen={isColpoModalOpen}
        setIsColpoModalOpen={setIsColpoModalOpen}
        editingColpo={editingColpo}
        viewingColpo={viewingColpo}
        setViewingColpo={setViewingColpo}
        isColpoPrintOpen={isColpoPrintOpen}
        setIsColpoPrintOpen={setIsColpoPrintOpen}
        isCheckupModalOpen={isCheckupModalOpen}
        setIsCheckupModalOpen={setIsCheckupModalOpen}
        editingCheckup={editingCheckup}
        viewingCheckup={viewingCheckup}
        setViewingCheckup={setViewingCheckup}
        isCheckupPrintOpen={isCheckupPrintOpen}
        setIsCheckupPrintOpen={setIsCheckupPrintOpen}
        isPrescriptionModalOpen={isPrescriptionModalOpen}
        setIsPrescriptionModalOpen={setIsPrescriptionModalOpen}
        editingPrescription={editingPrescription}
        viewingPrescription={viewingPrescription}
        setViewingPrescription={setViewingPrescription}
        isPrintModalOpen={isPrintModalOpen}
        setIsPrintModalOpen={setIsPrintModalOpen}
        isLabModalOpen={isLabModalOpen}
        setIsLabModalOpen={setIsLabModalOpen}
        editingLabOrder={editingLabOrder}
        viewingLabOrder={viewingLabOrder}
        setViewingLabOrder={setViewingLabOrder}
        isLabPrintModalOpen={isLabPrintModalOpen}
        setIsLabPrintModalOpen={setIsLabPrintModalOpen}
        isPrenatalModalOpen={isPrenatalModalOpen}
        setIsPrenatalModalOpen={setIsPrenatalModalOpen}
        prenatalInitialTab={prenatalInitialTab}
        viewingPrenatalCard={viewingPrenatalCard}
        setViewingPrenatalCard={setViewingPrenatalCard}
        isPrenatalPrintModalOpen={isPrenatalPrintModalOpen}
        setIsPrenatalPrintModalOpen={setIsPrenatalPrintModalOpen}
        isUploadDocModalOpen={isUploadDocModalOpen}
        setIsUploadDocModalOpen={setIsUploadDocModalOpen}
        isDocViewerOpen={isDocViewerOpen}
        setIsDocViewerOpen={setIsDocViewerOpen}
        selectedDocToView={selectedDocToView}
        setSelectedDocToView={setSelectedDocToView}
        isWordHistoryModalOpen={isWordHistoryModalOpen}
        setIsWordHistoryModalOpen={setIsWordHistoryModalOpen}
        isConsultationModalOpen={isConsultationModalOpen}
        setIsConsultationModalOpen={setIsConsultationModalOpen}
        editingConsultation={editingConsultation}
        viewingConsultation={viewingConsultation}
        setViewingConsultation={setViewingConsultation}
        isConsultationPrintOpen={isConsultationPrintOpen}
        setIsConsultationPrintOpen={setIsConsultationPrintOpen}
        isUltrasoundModalOpen={isUltrasoundModalOpen}
        setIsUltrasoundModalOpen={setIsUltrasoundModalOpen}
        editingUltrasound={editingUltrasound}
        viewingUltrasound={viewingUltrasound}
        setViewingUltrasound={setViewingUltrasound}
        isUltrasoundPrintOpen={isUltrasoundPrintOpen}
        setIsUltrasoundPrintOpen={setIsUltrasoundPrintOpen}
        isMinorProcModalOpen={isMinorProcModalOpen}
        setIsMinorProcModalOpen={setIsMinorProcModalOpen}
        editingMinorProc={editingMinorProc}
        viewingMinorProc={viewingMinorProc}
        setViewingMinorProc={setViewingMinorProc}
        isMinorProcPrintOpen={isMinorProcPrintOpen}
        setIsMinorProcPrintOpen={setIsMinorProcPrintOpen}
        isQuoteModalOpen={isQuoteModalOpen}
        setIsQuoteModalOpen={setIsQuoteModalOpen}
        viewingQuote={viewingQuote}
        setViewingQuote={setViewingQuote}
        isQuotePrintOpen={isQuotePrintOpen}
        setIsQuotePrintOpen={setIsQuotePrintOpen}
        isCompleteHistoryPrintOpen={isCompleteHistoryPrintOpen}
        setIsCompleteHistoryPrintOpen={setIsCompleteHistoryPrintOpen}
      />
    </div>
  );
}
