import React, { useEffect, useState } from 'react';
import { Award, CheckCircle2, Download, ShieldCheck } from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { downloadCertificatePdf } from '../lib/pdfExport';
import type {
  CertificateRecord,
  EnrollmentRecord,
  UserProfile,
} from '../types/mentmar';

interface CertificatesViewProps {
  userProfile: UserProfile | null;
  enrollment: EnrollmentRecord | null;
  certificates: CertificateRecord[];
  onIssueCertificate: (levelId: string, levelTitle: string, totalLessons: number, score: number) => Promise<void>;
  onRequireAuth: () => void;
}

const LEVEL_CAPSTONE_QUESTIONS: Record<
  string,
  { question: string; options: string[]; correct: number }[]
> = {
  'computacion-basica': [
    {
      question: '¿Qué protocolo garantiza que la conexión web viaja cifrada mediante SSL/TLS?',
      options: ['HTTP', 'HTTPS', 'FTP'],
      correct: 1,
    },
    {
      question: 'En Excel, ¿qué símbolo fija una referencia absoluta de celda?',
      options: ['#', '$', '@'],
      correct: 1,
    },
    {
      question: '¿Qué combinación permite enviar un correo protegiendo la privacidad de destinatarios?',
      options: ['CCO (Copia Oculta)', 'CC (Copia Abierta)', 'Asunto'],
      correct: 0,
    },
  ],
  'programacion-web': [
    {
      question: '¿Qué etiqueta HTML5 define la estructura semántica de navegación principal?',
      options: ['<div>', '<nav>', '<span>'],
      correct: 1,
    },
    {
      question: '¿Qué propiedad CSS habilita un contenedor flexible moderno?',
      options: ['display: flex', 'float: center', 'position: block'],
      correct: 0,
    },
    {
      question: 'En Python, ¿qué palabra clave define una función reutilizable?',
      options: ['func', 'def', 'function'],
      correct: 1,
    },
  ],
  'programacion-avanzada': [
    {
      question: '¿Cuáles son pilares fundamentales de la Programación Orientada a Objetos?',
      options: [
        'Encapsulamiento, Herencia y Polimorfismo',
        'Tablas, Márgenes y Sangrías',
        'DNS, DHCP y HTTP',
      ],
      correct: 0,
    },
    {
      question: 'En SQL, ¿qué cláusula combina registros coincidentes entre dos tablas?',
      options: ['INNER JOIN', 'GROUP BY', 'ORDER BY'],
      correct: 0,
    },
    {
      question: 'En Arduino IDE, ¿qué función controla la intensidad de salida mediante PWM?',
      options: ['digitalRead()', 'analogWrite()', 'delay()'],
      correct: 1,
    },
  ],
  'tecnologia-social': [
    {
      question: '¿Cuál es la primera fase del Design Thinking aplicado a problemáticas sociales?',
      options: ['Empatizar', 'Vender', 'Compilar'],
      correct: 0,
    },
    {
      question: '¿Para qué sirven los KPIs sociales en un proyecto comunitario?',
      options: [
        'Medir el impacto real y verificar avances en la comunidad',
        'Aumentar la complejidad técnica sin usuarios',
        'Evitar el consentimiento informado',
      ],
      correct: 0,
    },
    {
      question: '¿Qué práctica ética es indispensable al recolectar datos comunitarios?',
      options: [
        'Consentimiento informado y aviso de privacidad',
        'Publicar datos sensibles sin permiso',
        'Ignorar la inclusión digital',
      ],
      correct: 0,
    },
  ],
  'talleres-stem': [
    {
      question: 'En finanzas personales, ¿cómo distribuye el presupuesto la regla 50/30/20?',
      options: [
        '50% necesidades, 30% gustos personales, 20% ahorro e inversión',
        '50% deudas, 30% ocio, 20% comisiones',
        '80% gastos fijos, 20% gastos hormiga',
      ],
      correct: 0,
    },
    {
      question: '¿Qué combina la técnica Pomodoro con el Time-Blocking?',
      options: [
        'Bloques agendados con ciclos de enfoque de 25 min y pausas breves',
        'Trabajar sin descanso durante 8 horas continuas',
        'Posponer tareas importantes hasta último momento',
      ],
      correct: 0,
    },
    {
      question: '¿Qué busca un Elevator Pitch de innovación social en 60 segundos?',
      options: [
        'Comunicar problema, solución e impacto con claridad y propósito',
        'Leer 50 páginas de código en voz alta',
        'Omitir quién se beneficia del proyecto',
      ],
      correct: 0,
    },
  ],
};

export function CertificatesView({
  userProfile,
  enrollment,
  certificates,
  onIssueCertificate,
  onRequireAuth,
}: CertificatesViewProps) {
  const [activeExamLevelId, setActiveExamLevelId] = useState<string | null>(null);
  const [examAnswers, setExamAnswers] = useState<Record<number, number>>({});
  const [examError, setExamError] = useState('');
  const [issuing, setIssuing] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  const openPreview = (cert: CertificateRecord) => {
    if (!cert.pdfDataBase64) {
      downloadCertificatePdf(cert);
      return;
    }
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
    }
    const binary = atob(cert.pdfDataBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    setPreviewPdfUrl(URL.createObjectURL(blob));
  };

  const closePreview = () => {
    if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    setPreviewPdfUrl(null);
  };

  const handleOpenExam = (levelId: string) => {
    if (!userProfile) {
      onRequireAuth();
      return;
    }
    setActiveExamLevelId(levelId);
    setExamAnswers({});
    setExamError('');
  };

  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExamLevelId) return;
    const level = CURRICULUM_LEVELS.find((l) => l.id === activeExamLevelId);
    const questions = LEVEL_CAPSTONE_QUESTIONS[activeExamLevelId] || [];
    if (!level || questions.length === 0) return;

    const correct = questions.reduce(
      (acc, q, idx) => acc + (examAnswers[idx] === q.correct ? 1 : 0),
      0
    );
    const score = Math.round((correct / questions.length) * 100);
    if (score < 66) {
      setExamError(
        `Obtuviste ${score}%. Se requiere al menos 67% para acreditar y emitir tu constancia oficial.`
      );
      return;
    }

    setIssuing(true);
    setExamError('');
    try {
      const totalLessons = level.modules.reduce((a, m) => a + m.lessons.length, 0);
      await onIssueCertificate(level.id, level.title, totalLessons, score);
      setActiveExamLevelId(null);
    } catch (err) {
      setExamError(err instanceof Error ? err.message : 'No se pudo emitir la constancia.');
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Mis Constancias de Aprovechamiento
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
          Cada nivel acreditado genera en el servidor un documento PDF minimalista y elegante guardado directamente en tu perfil. Puedes previsualizarlo y volver a descargarlo cuando lo necesites.
        </p>
      </div>

      {/* Issued Certificates */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Constancias emitidas ({certificates.length})
        </h3>
        {certificates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <Award className="w-8 h-8 mx-auto text-sky-700 dark:text-sky-400" />
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Aún no has emitido constancias en tu historial
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Completa las lecciones de cualquier nivel o presenta su evaluación integradora abajo para generar y guardar tu primera constancia en PDF.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {certificates.map((cert) => (
              <article
                key={cert.id}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-5 relative overflow-hidden"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-mono">{cert.verificationCode}</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {cert.fileSizeBytes
                        ? `PDF guardado (${Math.round(cert.fileSizeBytes / 1024)} KB)`
                        : 'Verificada'}
                    </span>
                  </div>
                  <div className="flex items-start gap-3">
                    <img
                      src="/assets/aistudio/LOGOMENTMAR__2__57edb856.png"
                      alt="Logo MentMar"
                      className="w-10 h-10 object-contain shrink-0 rounded"
                    />
                    <div>
                      <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                        Constancia de Aprovechamiento
                      </p>
                      <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {cert.levelTitle}
                      </h4>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p>
                      Otorgada a: <strong className="text-slate-900 dark:text-slate-100">{cert.studentName}</strong>
                    </p>
                    <p>
                      {cert.academicGrade} · {cert.totalLessons} lecciones · Promedio{' '}
                      <span className="font-mono tabular-nums font-semibold">{cert.score}%</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {cert.pdfDataBase64 && (
                    <button
                      type="button"
                      onClick={() => openPreview(cert)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Previsualizar PDF
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => downloadCertificatePdf(cert)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl bg-sky-700 hover:bg-sky-800 text-white transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Descargar PDF
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Inline PDF Preview Modal */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[85vh]">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Vista previa de Constancia Oficial (PDF)
              </span>
              <button
                type="button"
                onClick={closePreview}
                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
              >
                Cerrar
              </button>
            </div>
            <iframe
              title="Vista previa Constancia PDF"
              src={previewPdfUrl}
              className="flex-1 w-full bg-slate-100"
            />
          </div>
        </div>
      )}

      {/* Level Certification / Capstone Assessment */}
      <section className="space-y-4">
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Acreditación por nivel curricular
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CURRICULUM_LEVELS.map((level) => {
            const totalLessons = level.modules.reduce((a, m) => a + m.lessons.length, 0);
            const completedInLevel = enrollment?.levelProgress?.[level.id] || 0;
            const pct = Math.min(100, Math.round((completedInLevel / totalLessons) * 100));
            const alreadyIssued = certificates.find((c) => c.levelId === level.id);

            return (
              <div
                key={level.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>{level.totalLabel}</span>
                    <span className="font-mono tabular-nums">{pct}% avance</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {level.title}
                  </h4>
                  <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-700 dark:bg-sky-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {alreadyIssued ? (
                  <button
                    type="button"
                    onClick={() => downloadCertificatePdf(alreadyIssued)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Volver a descargar PDF
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenExam(level.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90"
                  >
                    <Award className="w-4 h-4" />
                    Acreditar y generar constancia
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Capstone Quiz Modal */}
      {activeExamLevelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4">
          <form
            onSubmit={handleSubmitExam}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Evaluación Integradora de Certificación
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Responde correctamente para emitir tu Constancia de Aprovechamiento oficial en PDF.
            </p>
            {examError && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-200">
                {examError}
              </div>
            )}
            {(LEVEL_CAPSTONE_QUESTIONS[activeExamLevelId] || []).map((q, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {idx + 1}. {q.question}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => (
                    <label
                      key={optIdx}
                      className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        checked={examAnswers[idx] === optIdx}
                        onChange={() => setExamAnswers((prev) => ({ ...prev, [idx]: optIdx }))}
                        required
                      />
                      <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveExamLevelId(null)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={issuing}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800"
              >
                {issuing ? 'Emitiendo constancia...' : 'Validar y emitir constancia'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
