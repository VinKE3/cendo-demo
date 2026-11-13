const { execSync } = require('child_process');
const fs = require('fs');

let code = execSync('git show HEAD:src/lib/whatsappShare.ts').toString('utf8');

code = code.replace(
  '  PrenatalCard,',
  '  PrenatalCard,\n  PatientDocument,'
);

const newFunction = `
export function generateDocumentWhatsAppUrl(
  patient: Patient,
  doc: PatientDocument,
  doctor: DoctorProfile
): string {
  const targetPhone = cleanPhoneForWhatsApp(patient.phone);

  const message = [
    \`👋 *Estimada \${patient.firstName} \${patient.lastName}*,\`,
    \`\`,
    \`Le saluda el consultorio del *\${doctor.doctorTitle} \${doctor.fullName}* (\${doctor.clinicName}).\`,
    \`\`,
    \`📂 Le compartimos el documento / informe médico registrado en su expediente clínico:\`,
    \`📋 *Documento:* \${doc.title}\`,
    \`🏷 *Tipo:* \${doc.documentType}\`,
    \`🗓 *Fecha:* \${doc.createdAt.split("T")[0]}\`,
    doc.notes ? \`📝 *Observación / Resumen:* \${doc.notes}\` : null,
    \`\`,
    \`🔗 *Puede visualizar o descargar su documento en el siguiente enlace oficial:*\`,
    \`\${doc.fileUrl}\`,
    \`\`,
    \`🏥 *Sede de Atención:* \${doctor.clinicAddress}\`,
    \`📞 *Central de Consultas:* \${doctor.phone}\`,
    \`\`,
    \`_CENDO - Archivo Digital Clínico Seguro._\`,
  ]
    .filter(Boolean)
    .join("\\n");

  const encodedText = encodeURIComponent(message);
  return \`https://wa.me/\${targetPhone}?text=\${encodedText}\`;
}
`;

code = code.trim() + '\n' + newFunction;
fs.writeFileSync('src/lib/whatsappShare.ts', code, 'utf8');
console.log('✓ src/lib/whatsappShare.ts cleanly updated!');

