import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import type { CertificateRecord, EnrollmentRecord } from '../types/mentmar';

function loadImageAsDataUrl(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function downloadStoredPdfBase64(base64: string, filename: string): void {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export async function downloadCertificatePdf(cert: CertificateRecord): Promise<void> {
  if (cert.pdfDataBase64) {
    downloadStoredPdfBase64(
      cert.pdfDataBase64,
      `Constancia_MentMar_${cert.levelId}_${cert.studentName.replace(/\s+/g, '_')}.pdf`
    );
    return;
  }
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Elegant light alabaster backdrop
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, width, height, 'F');

  // Outer institutional cobalt frame & inner hairline gold/emerald frame
  doc.setDrawColor(3, 105, 161);
  doc.setLineWidth(1.4);
  doc.rect(10, 10, width - 20, height - 20);

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.4);
  doc.rect(14, 14, width - 28, height - 28);

  // Top cobalt accent header band
  doc.setFillColor(3, 105, 161);
  doc.rect(14, 14, width - 28, 3, 'F');

  // Logo if available
  const logoData = await loadImageAsDataUrl('/assets/aistudio/LOGOMENTMAR__2__57edb856.png');
  if (logoData) {
    doc.addImage(logoData, 'PNG', width / 2 - 14, 21, 28, 28);
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('ECOSISTEMA EDUCATIVO DIGITAL MENTMAR', width / 2, 54, { align: 'center' });

  doc.setTextColor(3, 105, 161);
  doc.setFontSize(26);
  doc.text('CONSTANCIA DE APROVECHAMIENTO', width / 2, 68, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.text('Se otorga el presente reconocimiento académico a:', width / 2, 82, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(cert.studentName.toUpperCase(), width / 2, 96, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(width / 2 - 75, 100, width / 2 + 75, 100);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Grado académico registrado: ${cert.academicGrade}`, width / 2, 108, { align: 'center' });

  doc.setFontSize(12);
  doc.text(
    'Por haber completado satisfactoriamente el plan de estudios, prácticas y simulaciones del nivel:',
    width / 2,
    120,
    { align: 'center' }
  );

  doc.setTextColor(3, 105, 161);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(17);
  doc.text(cert.levelTitle, width / 2, 132, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    `${cert.totalLessons} lecciones y talleres acreditados  ·  Promedio de evaluación: ${cert.score}%`,
    width / 2,
    142,
    { align: 'center' }
  );

  const issuedLabel = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Apaseo el Grande, Guanajuato, México  ·  ${issuedLabel}`, width / 2, 152, {
    align: 'center',
  });

  // Signature block
  doc.setDrawColor(100, 116, 139);
  doc.line(width / 2 - 45, 174, width / 2 + 45, 174);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Lic. Ing. Margarita Estrada Rodríguez', width / 2, 180, { align: 'center' });
  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Fundadora y Directora Académica de MentMar', width / 2, 185, { align: 'center' });

  // QR Verification
  try {
    const qrUrl = await QRCode.toDataURL(`https://mentmar.edu.mx/verificar/${cert.verificationCode}`, {
      margin: 1,
      width: 140,
      color: { dark: '#0F172A', light: '#F8FAFC' },
    });
    doc.addImage(qrUrl, 'PNG', width - 48, height - 48, 24, 24);
  } catch {
    // Fallback without QR image
  }

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Folio de verificación: ${cert.verificationCode}`, 24, height - 22);

  doc.save(`Constancia_MentMar_${cert.levelId}_${cert.studentName.replace(/\s+/g, '_')}.pdf`);
}

export function downloadWeeklyReportPdf(
  teacherName: string,
  classroomName: string,
  enrollments: EnrollmentRecord[]
): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const width = doc.internal.pageSize.getWidth();

  doc.setFillColor(3, 105, 161);
  doc.rect(0, 0, width, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MentMar — Reporte Analítico Semanal Docente', 16, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Docente: ${teacherName}  ·  Grupo: ${classroomName}  ·  ${dateStr}`, 16, 22);

  const totalStudents = enrollments.length;
  const avgCompleted =
    totalStudents > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.completedCount, 0) / totalStudents)
      : 0;
  const avgScore =
    totalStudents > 0
      ? Math.round(enrollments.reduce((acc, e) => acc + e.averageScore, 0) / totalStudents)
      : 0;
  const totalMinutes = enrollments.reduce((acc, e) => acc + e.totalMinutes, 0);

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Resumen Ejecutivo de Desempeño', 16, 40);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(51, 65, 85);
  doc.text(`Alumnos monitoreados: ${totalStudents}`, 16, 48);
  doc.text(`Promedio de lecciones completadas: ${avgCompleted}`, 75, 48);
  doc.text(`Calificación promedio: ${avgScore}%`, 148, 48);
  doc.text(`Tiempo total acumulado en plataforma: ${totalMinutes} min`, 16, 55);

  // Table Header
  let y = 68;
  doc.setFillColor(241, 245, 249);
  doc.rect(16, y - 5, width - 32, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Alumno', 18, y);
  doc.text('Grado', 74, y);
  doc.text('Lecciones', 115, y);
  doc.text('Minutos', 143, y);
  doc.text('Promedio', 170, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  if (enrollments.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.text('Sin alumnos inscritos en este grupo todavía.', 18, y);
  } else {
    enrollments.slice(0, 28).forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.setTextColor(15, 23, 42);
      doc.text(item.studentName.slice(0, 28), 18, y);
      doc.setTextColor(71, 85, 105);
      doc.text(item.academicGrade.slice(0, 20), 74, y);
      doc.text(String(item.completedCount), 118, y);
      doc.text(`${item.totalMinutes} m`, 144, y);
      doc.text(`${item.averageScore}%`, 172, y);
      doc.setDrawColor(226, 232, 240);
      doc.line(16, y + 2.5, width - 16, y + 2.5);
      y += 7;
    });
  }

  doc.save(`Reporte_Semanal_MentMar_${new Date().toISOString().slice(0, 10)}.pdf`);
}

function csvSafeCell(val: unknown): string {
  const cleaned = String(val ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/"/g, '""');
  const neutralized = /^[=+\-@\t]/.test(cleaned.trimStart()) ? `'${cleaned}` : cleaned;
  return `"${neutralized}"`;
}

function parseDateSafe(val: unknown): string {
  if (!val) return '';
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? '' : val.toISOString().slice(0, 10);
  if (typeof val === 'object' && val !== null) {
    const rec = val as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof rec.toDate === 'function') {
      const d = rec.toDate();
      return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }
    const secs = typeof rec.seconds === 'number' ? rec.seconds : rec._seconds;
    if (typeof secs === 'number') {
      return new Date(secs * 1000).toISOString().slice(0, 10);
    }
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  }
  return '';
}

export function downloadWeeklyReportCsv(enrollments: EnrollmentRecord[]): void {
  const headers = [
    'Alumno',
    'Grado Académico',
    'Código de Grupo',
    'Fecha de Registro',
    'Lecciones Completadas',
    'Minutos Totales',
    'Promedio (%)',
    'Última Lección',
  ];
  const rows = enrollments.map((e) => [
    csvSafeCell(e.studentName),
    csvSafeCell(e.academicGrade),
    csvSafeCell(e.classroomCode),
    csvSafeCell(parseDateSafe(e.createdAt) || 'Reciente'),
    e.completedCount,
    e.totalMinutes,
    e.averageScore,
    csvSafeCell(e.lastLessonId),
  ]);
  const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Analitica_MentMar_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadStudySessionIcs(
  title: string,
  description: string,
  startIsoLocal: string,
  durationMinutes = 45
): void {
  const start = startIsoLocal ? new Date(startIsoLocal) : new Date(Date.now() + 86400000);
  const end = new Date(start.getTime() + durationMinutes * 60000);
  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//MentMar//Plataforma Educativa STEM//ES',
    'BEGIN:VEVENT',
    `UID:mentmar-${Date.now()}@mentmar.edu.mx`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, '\\n')}`,
    'LOCATION:MentMar Plataforma Digital',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `MentMar_Sesion_${Date.now()}.ics`;
  link.click();
  URL.revokeObjectURL(url);
}
