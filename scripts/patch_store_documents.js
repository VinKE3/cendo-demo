const fs = require('fs');

let code = fs.readFileSync('src/store/useMedicalStore.ts', 'utf8');

// 1. Add to MedicalStoreState interface
const interfaceTarget = `  deletePrenatalVisit: (cardId: string, visitIndex: number) => void;

  // Reset a datos iniciales`;

const interfaceReplacement = `  deletePrenatalVisit: (cardId: string, visitIndex: number) => void;

  // Repositorio de Documentos y Exámenes Externos en PDF (Etapa B)
  patientDocuments: PatientDocument[];
  addPatientDocument: (doc: PatientDocument) => void;
  deletePatientDocument: (id: string) => Promise<void>;
  getDocumentsByPatientId: (patientId: string) => PatientDocument[];

  // Reset a datos iniciales`;

if (!code.includes('patientDocuments: PatientDocument[];')) {
  code = code.replace(interfaceTarget, interfaceReplacement);
}

// 2. Add to deletePatient cascade
const cascadeTarget = `            labOrders: state.labOrders.filter((l) => l.patientId !== id),
            prenatalCards: state.prenatalCards.filter((c) => c.patientId !== id),`;

const cascadeReplacement = `            labOrders: state.labOrders.filter((l) => l.patientId !== id),
            prenatalCards: state.prenatalCards.filter((c) => c.patientId !== id),
            patientDocuments: (state.patientDocuments || []).filter((d) => d.patientId !== id),`;

if (!code.includes('patientDocuments: (state.patientDocuments || []).filter')) {
  code = code.replace(cascadeTarget, cascadeReplacement);
}

// 3. Add methods to store body after deletePrenatalVisit
const methodsTarget = `      deletePrenatalVisit: (cardId, visitIndex) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id !== cardId) return card;
            const updatedVisits = (card.visits || []).filter((_, idx) => idx !== visitIndex);
            return {
              ...card,
              visits: updatedVisits,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // RESET`;

const methodsReplacement = `      deletePrenatalVisit: (cardId, visitIndex) => {
        set((state) => ({
          prenatalCards: (state.prenatalCards || []).map((card) => {
            if (card.id !== cardId) return card;
            const updatedVisits = (card.visits || []).filter((_, idx) => idx !== visitIndex);
            return {
              ...card,
              visits: updatedVisits,
              updatedAt: new Date().toISOString(),
            };
          }),
        }));
      },

      // REPOSITORIO DE DOCUMENTOS Y EXÁMENES EXTERNOS EN PDF (ETAPA B)
      patientDocuments: INITIAL_DOCUMENTS,
      addPatientDocument: (doc) => {
        set((state) => ({
          patientDocuments: [doc, ...(state.patientDocuments || [])],
        }));
        syncDocumentToSupabase(doc);
      },
      deletePatientDocument: async (id) => {
        const doc = (get().patientDocuments || []).find((d) => d.id === id);
        set((state) => ({
          patientDocuments: (state.patientDocuments || []).filter((d) => d.id !== id),
        }));
        await deleteDocumentFromSupabase(id, doc?.filePath);
      },
      getDocumentsByPatientId: (patientId) => {
        return (get().patientDocuments || []).filter((d) => d.patientId === patientId);
      },

      // RESET`;

if (!code.includes('addPatientDocument: (doc) =>')) {
  code = code.replace(methodsTarget, methodsReplacement);
}

// 4. Update resetToSeedData
const resetTarget = `          labOrders: INITIAL_LAB_ORDERS,
          prenatalCards: INITIAL_PRENATAL_CARDS,
          tariffItems: INITIAL_TARIFF,`;

const resetReplacement = `          labOrders: INITIAL_LAB_ORDERS,
          prenatalCards: INITIAL_PRENATAL_CARDS,
          patientDocuments: INITIAL_DOCUMENTS,
          tariffItems: INITIAL_TARIFF,`;

if (!code.includes('patientDocuments: INITIAL_DOCUMENTS,\n          tariffItems: INITIAL_TARIFF,')) {
  code = code.replace(resetTarget, resetReplacement);
}

// 5. Update migrate to version 4
const migrateTarget = `      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          return {
            ...(persistedState || {}),
            doctorsList: INITIAL_DOCTORS,
            doctorProfile: INITIAL_DOCTOR,
            patients: INITIAL_PATIENTS,
            backgrounds: INITIAL_BACKGROUNDS,
            colposcopyReports: INITIAL_COLPOSCOPY,
            clinicalCheckups: INITIAL_CHECKUPS,
            prescriptions: INITIAL_PRESCRIPTIONS,
            labOrders: INITIAL_LAB_ORDERS,
            prenatalCards: INITIAL_PRENATAL_CARDS,
            tariffItems: persistedState?.tariffItems || INITIAL_TARIFF,
            vademecumItems: persistedState?.vademecumItems || INITIAL_VADEMECUM,
          };
        }
        return persistedState;
      },`;

const migrateReplacement = `      version: 4,
      migrate: (persistedState: any, version: number) => {
        if (version < 4) {
          return {
            ...(persistedState || {}),
            doctorsList: INITIAL_DOCTORS,
            doctorProfile: INITIAL_DOCTOR,
            patients: INITIAL_PATIENTS,
            backgrounds: INITIAL_BACKGROUNDS,
            colposcopyReports: INITIAL_COLPOSCOPY,
            clinicalCheckups: INITIAL_CHECKUPS,
            prescriptions: INITIAL_PRESCRIPTIONS,
            labOrders: INITIAL_LAB_ORDERS,
            prenatalCards: INITIAL_PRENATAL_CARDS,
            patientDocuments: INITIAL_DOCUMENTS,
            tariffItems: persistedState?.tariffItems || INITIAL_TARIFF,
            vademecumItems: persistedState?.vademecumItems || INITIAL_VADEMECUM,
          };
        }
        return persistedState;
      },`;

code = code.replace(migrateTarget, migrateReplacement);

fs.writeFileSync('src/store/useMedicalStore.ts', code, 'utf8');
console.log('✓ Successfully patched src/store/useMedicalStore.ts with full PatientDocuments support!');

