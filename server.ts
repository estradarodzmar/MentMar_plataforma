import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth, type DecodedIdToken } from 'firebase-admin/auth';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.resolve(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8')) as {
  projectId: string;
  firestoreDatabaseId?: string;
};

// Initialize Firebase Admin with projectId only (used strictly for verifyIdToken, no IAM needed)
const adminApp = getApps().length
  ? getApp()
  : initializeApp({ projectId: firebaseConfig.projectId });
const adminAuth = getAuth(adminApp);

interface AuthenticatedRequest extends Request {
  user?: DecodedIdToken;
  idToken?: string;
}

async function requireFirebaseAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Falta el token de autenticación Bearer.' });
    return;
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Token vacío.' });
    return;
  }
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    if (!decoded.email_verified) {
      res.status(403).json({ error: 'El correo electrónico debe estar verificado.' });
      return;
    }
    req.user = decoded;
    req.idToken = token;
    next();
  } catch {
    res.status(401).json({ error: 'Token de sesión inválido o expirado.' });
  }
}

function sanitizeText(val: unknown, maxLen: number): string {
  if (typeof val !== 'string') return '';
  return val.replace(/[\r\n\t]+/g, ' ').trim().slice(0, maxLen);
}

function sanitizeId(val: unknown): string {
  const str = sanitizeText(val, 100);
  return /^[a-zA-Z0-9_\-]+$/.test(str) ? str : '';
}

function csvSafeCell(val: unknown): string {
  const cleaned = String(val ?? '')
    .replace(/[\r\n]+/g, ' ')
    .replace(/"/g, '""');
  const neutralized = /^[=+\-@\t]/.test(cleaned.trimStart()) ? `'${cleaned}` : cleaned;
  return `"${neutralized}"`;
}

function loadLocalLogoBase64(): string | null {
  try {
    const logoPath = path.resolve(
      __dirname,
      'public/assets/aistudio/LOGOMENTMAR__2__57edb856.png'
    );
    if (!fs.existsSync(logoPath)) return null;
    const buffer = fs.readFileSync(logoPath);
    return `data:image/png;base64,${buffer.toString('base64')}`;
  } catch {
    return null;
  }
}

async function buildMinimalistCertificatePdf(params: {
  studentName: string;
  academicGrade: string;
  levelId: string;
  levelTitle: string;
  totalLessons: number;
  score: number;
  verificationCode: string;
}): Promise<string> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Minimalist alabaster canvas
  doc.setFillColor(250, 251, 253);
  doc.rect(0, 0, width, height, 'F');

  // Subtle architectural framing lines
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.rect(12, 12, width - 24, height - 24);

  // Thin cobalt top stripe
  doc.setFillColor(3, 105, 161);
  doc.rect(12, 12, width - 24, 2.2, 'F');

  // Minimalist corner accents
  doc.setDrawColor(3, 105, 161);
  doc.setLineWidth(0.9);
  doc.line(18, 22, 34, 22);
  doc.line(18, 22, 18, 38);
  doc.line(width - 34, 22, width - 18, 22);
  doc.line(width - 18, 22, width - 18, 38);

  // MentMar Logo
  const logoBase64 = loadLocalLogoBase64();
  if (logoBase64) {
    doc.addImage(logoBase64, 'PNG', width / 2 - 11, 20, 22, 22, undefined, 'FAST');
  }

  // Typography hierarchy
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text('ECOSISTEMA EDUCATIVO DIGITAL MENTMAR', width / 2, 49, { align: 'center' });

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text('CONSTANCIA DE APROVECHAMIENTO', width / 2, 63, { align: 'center' });

  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.6);
  doc.line(width / 2 - 36, 68, width / 2 + 36, 68);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text('Se otorga el presente reconocimiento académico a', width / 2, 81, { align: 'center' });

  doc.setTextColor(3, 105, 161);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text(params.studentName.toUpperCase(), width / 2, 95, { align: 'center' });

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.35);
  doc.line(width / 2 - 80, 100, width / 2 + 80, 100);

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Grado académico: ${params.academicGrade}`, width / 2, 108, { align: 'center' });

  doc.setFontSize(11.5);
  doc.text(
    'Por haber completado satisfactoriamente el plan curricular, prácticas y simulaciones del nivel:',
    width / 2,
    120,
    { align: 'center' }
  );

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16.5);
  doc.text(params.levelTitle, width / 2, 132, { align: 'center' });

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(
    `${params.totalLessons} lecciones acreditadas  ·  Evaluación final: ${params.score}%`,
    width / 2,
    142,
    { align: 'center' }
  );

  const issuedDate = new Date().toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.setFontSize(9.5);
  doc.text(`Apaseo el Grande, Guanajuato, México  ·  ${issuedDate}`, width / 2, 152, {
    align: 'center',
  });

  // Signature
  doc.setDrawColor(148, 163, 184);
  doc.setLineWidth(0.4);
  doc.line(width / 2 - 48, 174, width / 2 + 48, 174);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('Lic. Ing. Margarita Estrada Rodríguez', width / 2, 180, { align: 'center' });
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Fundadora y Directora Académica · MentMar', width / 2, 185, { align: 'center' });

  // QR Verification
  try {
    const qrUrl = await QRCode.toDataURL(
      `https://mentmar.edu.mx/verificar/${params.verificationCode}`,
      {
        margin: 1,
        width: 120,
        color: { dark: '#0F172A', light: '#FAFBFC' },
      }
    );
    doc.addImage(qrUrl, 'PNG', width - 44, height - 44, 22, 22, undefined, 'FAST');
  } catch {
    // Fallback without QR
  }

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8.5);
  doc.text(`Folio de verificación: ${params.verificationCode}`, 22, height - 20);

  const dataUri = doc.output('datauristring');
  const commaIdx = dataUri.indexOf(',');
  return commaIdx !== -1 ? dataUri.slice(commaIdx + 1) : dataUri;
}

async function persistUserCertificateViaFirestoreRest(params: {
  idToken: string;
  uid: string;
  certId: string;
  studentName: string;
  academicGrade: string;
  levelId: string;
  levelTitle: string;
  totalLessons: number;
  score: number;
  verificationCode: string;
  pdfDataBase64: string;
  fileSizeBytes: number;
}): Promise<{ ok: boolean; error?: string }> {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  const docPath = `projects/${firebaseConfig.projectId}/databases/${dbId}/documents/users/${params.uid}/certificates/${params.certId}`;
  const indexPath = `projects/${firebaseConfig.projectId}/databases/${dbId}/documents/certificates/${params.certId}`;
  const endpoint = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${dbId}/documents:commit`;

  const body = {
    writes: [
      {
        update: {
          name: docPath,
          fields: {
            id: { stringValue: params.certId },
            uid: { stringValue: params.uid },
            studentName: { stringValue: params.studentName },
            academicGrade: { stringValue: params.academicGrade },
            levelId: { stringValue: params.levelId },
            levelTitle: { stringValue: params.levelTitle },
            totalLessons: { integerValue: String(params.totalLessons) },
            score: { integerValue: String(params.score) },
            verificationCode: { stringValue: params.verificationCode },
            pdfDataBase64: { stringValue: params.pdfDataBase64 },
            fileSizeBytes: { integerValue: String(params.fileSizeBytes) },
          },
        },
        updateTransforms: [
          { fieldPath: 'issuedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
      {
        update: {
          name: indexPath,
          fields: {
            id: { stringValue: params.certId },
            uid: { stringValue: params.uid },
            studentName: { stringValue: params.studentName },
            academicGrade: { stringValue: params.academicGrade },
            levelId: { stringValue: params.levelId },
            levelTitle: { stringValue: params.levelTitle },
            totalLessons: { integerValue: String(params.totalLessons) },
            score: { integerValue: String(params.score) },
            verificationCode: { stringValue: params.verificationCode },
          },
        },
        updateTransforms: [
          { fieldPath: 'issuedAt', setToServerValue: 'REQUEST_TIME' },
        ],
      },
    ],
  };

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${params.idToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return { ok: false, error: `Firestore REST ${resp.status}: ${errText}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'mentmar-backend' });
  });

  // Backend PDF Certificate Generator & Persister into users/{uid}/certificates ("Mis Constancias")
  app.post(
    '/api/certificates/generate',
    requireFirebaseAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const uid = req.user!.uid;
        const idToken = req.idToken!;

        const levelId = sanitizeId(req.body?.levelId);
        const levelTitle = sanitizeText(req.body?.levelTitle, 160);
        const studentName = sanitizeText(
          req.body?.studentName || req.user?.name || req.user?.email || 'Estudiante MentMar',
          120
        );
        const academicGrade = sanitizeText(req.body?.academicGrade || 'General', 80);
        const totalLessons = Math.min(300, Math.max(1, Number(req.body?.totalLessons) || 1));
        const score = Math.min(100, Math.max(0, Math.round(Number(req.body?.score) || 0)));

        if (!levelId || !levelTitle || studentName.length < 2) {
          res.status(400).json({ error: 'Datos de constancia inválidos o incompletos.' });
          return;
        }

        const certId = `cert-${uid}-${levelId}`;
        const verificationCode = `MM-${levelId.slice(0, 4).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

        const pdfDataBase64 = await buildMinimalistCertificatePdf({
          studentName,
          academicGrade,
          levelId,
          levelTitle,
          totalLessons,
          score,
          verificationCode,
        });

        const fileSizeBytes = Buffer.byteLength(pdfDataBase64, 'base64');

        const persisted = await persistUserCertificateViaFirestoreRest({
          idToken,
          uid,
          certId,
          studentName,
          academicGrade,
          levelId,
          levelTitle,
          totalLessons,
          score,
          verificationCode,
          pdfDataBase64,
          fileSizeBytes,
        });

        res.json({
          persistedOnServer: persisted.ok,
          persistenceWarning: persisted.error || null,
          certificate: {
            id: certId,
            uid,
            studentName,
            academicGrade,
            levelId,
            levelTitle,
            totalLessons,
            score,
            verificationCode,
            pdfDataBase64,
            fileSizeBytes,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error al generar constancia PDF';
        res.status(500).json({ error: message });
      }
    }
  );

  // Backend Teacher Performance Report Export (PDF)
  app.post(
    '/api/reports/teacher-pdf',
    requireFirebaseAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const teacherName = sanitizeText(req.body?.teacherName || req.user?.email, 120);
        const classroomName = sanitizeText(req.body?.classroomName || 'Grupo MentMar', 140);
        const filterSummary = sanitizeText(req.body?.filterSummary || 'Todos los registros', 200);
        const rawRows = Array.isArray(req.body?.enrollments)
          ? req.body.enrollments
              .slice(0, 200)
              .filter((r: unknown): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
          : [];

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const width = doc.internal.pageSize.getWidth();

        doc.setFillColor(3, 105, 161);
        doc.rect(0, 0, width, 30, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text('MentMar · Reporte de Desempeño Académico', 16, 14);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9.5);
        const dateStr = new Date().toLocaleDateString('es-MX', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        doc.text(`Docente: ${teacherName}  ·  Grupo: ${classroomName}  ·  ${dateStr}`, 16, 22);

        doc.setTextColor(71, 85, 105);
        doc.setFontSize(9);
        doc.text(`Filtros aplicados: ${filterSummary}`, 16, 38);

        const total = rawRows.length;
        const avgScore =
          total > 0
            ? Math.round(
                rawRows.reduce((a: number, r: Record<string, unknown>) => a + (Number(r.averageScore) || 0), 0) /
                  total
              )
            : 0;
        const avgLessons =
          total > 0
            ? Math.round(
                rawRows.reduce((a: number, r: Record<string, unknown>) => a + (Number(r.completedCount) || 0), 0) /
                  total
              )
            : 0;

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(
          `Estudiantes: ${total}    ·    Lecciones promedio: ${avgLessons}    ·    Aprovechamiento: ${avgScore}%`,
          16,
          47
        );

        let y = 58;
        doc.setFillColor(241, 245, 249);
        doc.rect(16, y - 5, width - 32, 8, 'F');
        doc.setFontSize(9);
        doc.text('Estudiante', 18, y);
        doc.text('Grado', 74, y);
        doc.text('Grupo', 114, y);
        doc.text('Lecciones', 142, y);
        doc.text('Tiempo', 164, y);
        doc.text('Promedio', 182, y);

        y += 8;
        doc.setFont('helvetica', 'normal');

        if (rawRows.length === 0) {
          doc.setTextColor(100, 116, 139);
          doc.text('Sin estudiantes para los filtros seleccionados.', 18, y);
        } else {
          rawRows.forEach((row: Record<string, unknown>) => {
            if (y > 274) {
              doc.addPage();
              y = 20;
            }
            doc.setTextColor(15, 23, 42);
            doc.text(sanitizeText(row.studentName, 26), 18, y);
            doc.setTextColor(71, 85, 105);
            doc.text(sanitizeText(row.academicGrade, 18), 74, y);
            doc.text(sanitizeText(row.classroomCode, 12), 114, y);
            doc.text(String(Number(row.completedCount) || 0), 146, y);
            doc.text(`${Number(row.totalMinutes) || 0}m`, 165, y);
            doc.text(`${Number(row.averageScore) || 0}%`, 184, y);
            doc.setDrawColor(226, 232, 240);
            doc.line(16, y + 2.5, width - 16, y + 2.5);
            y += 7;
          });
        }

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="Reporte_MentMar_${new Date().toISOString().slice(0, 10)}.pdf"`
        );
        res.send(pdfBuffer);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error generando reporte PDF';
        res.status(500).json({ error: message });
      }
    }
  );

  // Backend Teacher Performance Report Export (CSV)
  app.post(
    '/api/reports/teacher-csv',
    requireFirebaseAuth,
    (req: AuthenticatedRequest, res: Response) => {
      const rawRows = Array.isArray(req.body?.enrollments)
        ? req.body.enrollments
            .slice(0, 500)
            .filter((r: unknown): r is Record<string, unknown> => Boolean(r) && typeof r === 'object')
        : [];
      const headers = [
        'Estudiante',
        'Grado Académico',
        'Código de Grupo',
        'Lecciones Completadas',
        'Minutos Totales',
        'Promedio (%)',
        'Última Lección',
      ];
      const csvRows = rawRows.map((row: Record<string, unknown>) =>
        [
          csvSafeCell(row.studentName),
          csvSafeCell(row.academicGrade),
          csvSafeCell(row.classroomCode),
          Number(row.completedCount) || 0,
          Number(row.totalMinutes) || 0,
          Number(row.averageScore) || 0,
          csvSafeCell(row.lastLessonId),
        ].join(',')
      );
      const csv = '\uFEFF' + [headers.join(','), ...csvRows].join('\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="Reporte_MentMar_${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    }
  );

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MentMar server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
