const { createClient } = require('@supabase/supabase-js');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf-8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL\s*=\s*(.*)/)[1].trim();
const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY\s*=\s*(.*)/)[1].trim();
const supabase = createClient(url, key);

const PATIENT_UUIDS = {
  "pat-luciana-ramos": "10000000-0000-0000-0000-000000000001",
  "pat-fiorella-mendoza": "10000000-0000-0000-0000-000000000002",
  "pat-gabriela-paredes": "10000000-0000-0000-0000-000000000003",
  "pat-daniela-castro": "10000000-0000-0000-0000-000000000004",
  "pat-carmen-huaman": "10000000-0000-0000-0000-000000000005",
};

const DEMO_DOCS = [
  {
    id: "30000000-0000-0000-0000-000000000001",
    patientId: "pat-daniela-castro",
    patientName: "CASTRO VILLAVICENCIO, DANIELA PATRICIA",
    documentType: "PATOLOGIA",
    title: "Informe de Biopsia de Cérvix - Anatomía Patológica",
    fileName: "biopsia-cervical-daniela-castro.pdf",
    notes: "Biopsia a horas 1:00 y 7:00. Diagnóstico: Neoplasia Intraepitelial Cervical Grado 2 (NIC 2 / LIE-AG) con focos de NIC 3. Márgenes endocervicales libres de neoplasia.",
    createdAt: "2026-11-10T14:30:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000002",
    patientId: "pat-luciana-ramos",
    patientName: "RAMOS FIGUEROA, LUCIANA MARÍA",
    documentType: "PAP",
    title: "Citología Cervico-Vaginal PAP ThinPrep - Biolaq",
    fileName: "pap-thinprep-luciana-ramos.pdf",
    notes: "Frotis citológico satisfactorio. Negativo para lesión intraepitelial o malignidad (NILM). Flora bacilar Döderlein habitual.",
    createdAt: "2026-11-04T10:15:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000003",
    patientId: "pat-luciana-ramos",
    patientName: "RAMOS FIGUEROA, LUCIANA MARÍA",
    documentType: "VPH",
    title: "Panel Molecular VPH 23 Genotipos PCR - Biolaq",
    fileName: "vph-pcr-luciana-ramos.pdf",
    notes: "Prueba molecular de Reacción en Cadena de la Polimerasa (PCR) tiempo real: NEGATIVO para los 23 genotipos evaluados.",
    createdAt: "2026-11-04T10:20:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000004",
    patientId: "pat-fiorella-mendoza",
    patientName: "MENDOZA CHÁVEZ, FIORELLA BEATRÍZ",
    documentType: "LABORATORIO",
    title: "Batería Gestacional 1er Trimestre - Suiza Lab",
    fileName: "bateria-gestacional-fiorella-mendoza.pdf",
    notes: "Hemograma: Hb 12.8 g/dL. Glucosa: 84 mg/dL. Grupo O Rh (+). VDRL: No Reactivo. VIH: Negativo. Urocultivo: Sin desarrollo bacteriano.",
    createdAt: "2026-10-25T11:00:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000005",
    patientId: "pat-gabriela-paredes",
    patientName: "PAREDES NAVARRO, GABRIELA ALEJANDRA",
    documentType: "LABORATORIO",
    title: "Marcador Tumoral CA-125 & Perfil Inflamatorio - Laboratorios Roe",
    fileName: "ca125-gabriela-paredes.pdf",
    notes: "Antígeno Carbohidrato CA-125: 68.4 U/mL (Normal < 35 U/mL). Compatible con endometriosis ovárica bilateral severa.",
    createdAt: "2026-11-08T16:45:00Z",
  },
  {
    id: "30000000-0000-0000-0000-000000000006",
    patientId: "pat-carmen-huaman",
    patientName: "HUAMÁN SOTOMAYOR, CARMEN ROSA",
    documentType: "ECOGRAFIA",
    title: "Densitometría Ósea Dual (DEXA) - Columna Lumbar y Fémur",
    fileName: "densitometria-carmen-huaman.pdf",
    notes: "T-Score L1-L4: -1.8 (Osteopenia leve). Cuello Femoral T-score: -1.4. Sin signos de osteoporosis fracturaria.",
    createdAt: "2026-11-06T09:30:00Z",
  },
];

async function generateSamplePdf(doc) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Cabecera Institucional
  page.drawText('CENDO • CENTRO DE ENDOMETRIOSIS Y GINECOLOGÍA', {
    x: 50,
    y: 800,
    size: 14,
    font: fontBold,
    color: rgb(0.039, 0.302, 0.408), // #0A4D68 Primary
  });
  page.drawText('Dirección Médica: Dr. Patrick Jacinto Gomero • CMP 61693 / RNE 38657', {
    x: 50,
    y: 785,
    size: 9,
    font,
    color: rgb(0.4, 0.45, 0.5),
  });
  page.drawLine({
    start: { x: 50, y: 775 },
    end: { x: 545, y: 775 },
    thickness: 1.5,
    color: rgb(0.039, 0.302, 0.408),
  });

  // Título del Documento
  page.drawText(doc.title.toUpperCase(), {
    x: 50,
    y: 740,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.15, 0.2),
  });
  page.drawText(`Tipo de Examen: ${doc.documentType} • Fecha de Emisión: ${doc.createdAt.split('T')[0]}`, {
    x: 50,
    y: 724,
    size: 9,
    font,
    color: rgb(0.3, 0.35, 0.4),
  });

  // Caja de Paciente
  page.drawRectangle({
    x: 50,
    y: 650,
    width: 495,
    height: 55,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.8, 0.88, 0.95),
    borderWidth: 1,
  });
  page.drawText('PACIENTE:', { x: 65, y: 688, size: 8, font: fontBold, color: rgb(0.4, 0.45, 0.5) });
  page.drawText(doc.patientName, { x: 65, y: 672, size: 10, font: fontBold, color: rgb(0.05, 0.1, 0.15) });
  page.drawText('HISTORIAL CLÍNICO CENDO - ARCHIVO DIGITAL DE LABORATORIO', { x: 65, y: 658, size: 8, font, color: rgb(0.4, 0.45, 0.5) });

  // Detalle e Informe Clínico
  page.drawText('INFORME Y CONCLUSIONES DIAGNÓSTICAS:', {
    x: 50,
    y: 615,
    size: 10,
    font: fontBold,
    color: rgb(0.039, 0.302, 0.408),
  });

  // Word wrap simple para las notas
  const words = doc.notes.split(' ');
  let line = '';
  let yPos = 595;
  for (const w of words) {
    if ((line + w).length > 70) {
      page.drawText(line, { x: 50, y: yPos, size: 9.5, font, color: rgb(0.15, 0.2, 0.25) });
      line = w + ' ';
      yPos -= 16;
    } else {
      line += w + ' ';
    }
  }
  if (line) {
    page.drawText(line, { x: 50, y: yPos, size: 9.5, font, color: rgb(0.15, 0.2, 0.25) });
  }

  // Cuadro de Autenticación
  page.drawRectangle({
    x: 50,
    y: 200,
    width: 495,
    height: 70,
    color: rgb(0.98, 0.98, 0.99),
    borderColor: rgb(0.85, 0.85, 0.9),
    borderWidth: 1,
  });
  page.drawText('CERTIFICACIÓN Y ARCHIVO DIGITAL CENDO', { x: 65, y: 250, size: 8, font: fontBold, color: rgb(0.039, 0.302, 0.408) });
  page.drawText('Este documento forma parte del Repositorio Clínico Oficial de la paciente en CENDO.', { x: 65, y: 235, size: 8, font, color: rgb(0.3, 0.35, 0.4) });
  page.drawText(`Archivo: ${doc.fileName} • Identificador de Auditoría: ${doc.id}`, { x: 65, y: 220, size: 7.5, font, color: rgb(0.5, 0.55, 0.6) });

  // Pie de página
  page.drawLine({ start: { x: 50, y: 80 }, end: { x: 545, y: 80 }, thickness: 1, color: rgb(0.8, 0.85, 0.9) });
  page.drawText('CENDO - Av. Alfredo Benavides N° 2975, Of. 405, Miraflores, Lima | Tel: (01) 985 945 697', {
    x: 100,
    y: 65,
    size: 7.5,
    font,
    color: rgb(0.5, 0.55, 0.6),
  });

  return await pdfDoc.save();
}

async function runSeed() {
  console.log('--- SEMBRANDO DOCUMENTOS EN SUPABASE STORAGE & BASE DE DATOS ---');

  for (const doc of DEMO_DOCS) {
    const patientUuid = PATIENT_UUIDS[doc.patientId];
    console.log(`\nGenerando PDF para ${doc.patientName} (${doc.title})...`);
    const pdfBytes = await generateSamplePdf(doc);

    const storagePath = `${patientUuid}/${doc.fileName}`;
    console.log(`Subiendo a Storage lab-reports: ${storagePath}...`);

    const { data: uploadData, error: upErr } = await supabase.storage
      .from('lab-reports')
      .upload(storagePath, pdfBytes, {
        upsert: true,
        contentType: 'application/pdf',
      });

    if (upErr) {
      console.error('Error al subir PDF:', upErr.message);
      continue;
    }

    const { data: publicUrlData } = supabase.storage
      .from('lab-reports')
      .getPublicUrl(storagePath);

    console.log(`URL pública generada: ${publicUrlData.publicUrl}`);

    const { error: dbErr } = await supabase.from('patient_documents').upsert({
      id: doc.id,
      patient_id: patientUuid,
      document_type: doc.documentType,
      title: doc.title,
      file_url: publicUrlData.publicUrl,
      file_name: doc.fileName,
      file_size: pdfBytes.length,
      mime_type: 'application/pdf',
      notes: doc.notes,
      created_at: doc.createdAt,
    }, { onConflict: 'id' });

    if (dbErr) {
      console.error('Error al registrar en patient_documents:', dbErr.message);
    } else {
      console.log(`✓ Registrado exitosamente en tabla patient_documents.`);
    }
  }

  console.log('\n--- VERIFICACIÓN FINAL EN SUPABASE ---');
  const { data: allDocs, error: listErr } = await supabase.from('patient_documents').select('*');
  if (listErr) {
    console.error('Error listando documentos:', listErr.message);
  } else {
    console.log(`✓ Total de documentos registrados en Supabase: ${allDocs.length}`);
    console.table(allDocs.map(d => ({
      id: d.id,
      tipo: d.document_type,
      titulo: d.title,
      archivo: d.file_name,
      tamano_kb: Math.round((d.file_size || 0) / 1024),
    })));
  }
}

runSeed();

