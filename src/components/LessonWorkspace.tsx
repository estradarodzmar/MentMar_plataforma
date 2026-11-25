import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Code2,
  Compass,
  Copy,
  Cpu,
  FileCode2,
  GraduationCap,
  HelpCircle,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  ListChecks,
  Pause,
  Play,
  Sparkles,
  Users,
  Volume2,
  Wrench,
} from 'lucide-react';
import { decryptNoteE2EE, encryptNoteE2EE } from '../lib/cryptoSecurity';
import type {
  CurriculumLesson,
  LessonProgressRecord,
  TeacherMaterialRecord,
} from '../types/mentmar';
import { InteractiveSimulator, SecurityBadgeInline } from './InteractiveSimulators';

interface LessonWorkspaceProps {
  lesson: CurriculumLesson;
  userUid: string | null;
  existingProgress?: LessonProgressRecord;
  teacherMaterials: TeacherMaterialRecord[];
  onCompleteLesson: (lesson: CurriculumLesson, score: number, encryptedNotes: string) => Promise<void>;
  onPrevLesson?: () => void;
  onNextLesson?: () => void;
  onRequireAuth: () => void;
}

function buildLessonStructuredJson(lesson: CurriculumLesson) {
  return {
    id: lesson.id,
    number: lesson.number,
    title: lesson.title,
    moduleTitle: lesson.moduleTitle,
    durationMinutes: lesson.durationMinutes,
    learningObjectives: lesson.learningObjectives,
    estructuraAutodidacta: {
      queEs: {
        definicionTecnica: lesson.whatIs.definition,
        analogiaCotidiana: lesson.whatIs.analogy,
      },
      paraQueSirve: {
        propositoFuncional: lesson.purpose.functionalGoal,
        problemaConcreto: lesson.purpose.problemSolved,
      },
      dondeSeEmplea: {
        industria: lesson.whereUsed.industry,
        escuela: lesson.whereUsed.school,
        comunidad: lesson.whereUsed.community,
      },
      comoSeHace: {
        pasos: lesson.howToDo.steps,
        ejemploTitulo: lesson.howToDo.exampleTitle,
        codigoOConfiguracion: lesson.howToDo.codeOrConfig,
        conclusionPractica: lesson.howToDo.takeaway,
      },
      erroresAEvitar: lesson.mistakesToAvoid,
    },
    coherenciaVisual: {
      altTextAccesible: lesson.visualReference.altText,
      busquedasLibresDeDerechos: lesson.visualReference.searchTerms,
    },
    organizadorConceptual: {
      titulo: lesson.organizerTitle,
      etapas: lesson.organizerNodes,
    },
    capsulaMultimedia: {
      titulo: lesson.multimediaTitle,
      pasos: lesson.multimediaSteps,
    },
    practica: lesson.practiceQuestions,
  };
}

function buildLessonMarkdown(lesson: CurriculumLesson): string {
  const lines: string[] = [
    `# Lección ${lesson.number}: ${lesson.title}`,
    `**Módulo:** ${lesson.moduleTitle} | **Duración:** ${lesson.durationMinutes} min`,
    '',
    `## Objetivos de aprendizaje`,
    ...lesson.learningObjectives.map((o) => `- ${o}`),
    '',
    `## 1. ¿Qué es?`,
    lesson.whatIs.definition,
    `> **Analogía intuitiva:** ${lesson.whatIs.analogy}`,
    '',
    `## 2. ¿Para qué sirve?`,
    lesson.purpose.functionalGoal,
    `**Problema concreto que resuelve:** ${lesson.purpose.problemSolved}`,
    '',
    `## 3. ¿Dónde se emplea?`,
    `- **Industria:** ${lesson.whereUsed.industry}`,
    `- **Escuela:** ${lesson.whereUsed.school}`,
    `- **Comunidad:** ${lesson.whereUsed.community}`,
    '',
    `## 4. ¿Cómo se hace?`,
    ...lesson.howToDo.steps.map((s, idx) => `${idx + 1}. ${s}`),
    '',
    `### ${lesson.howToDo.exampleTitle}`,
    '```',
    lesson.howToDo.codeOrConfig,
    '```',
    `*Conclusión:* ${lesson.howToDo.takeaway}`,
    '',
    `## 5. ¿Qué errores evitar?`,
    ...lesson.mistakesToAvoid.flatMap((m, idx) => [
      `### Error ${idx + 1}: ${m.mistake}`,
      `- **Por qué ocurre:** ${m.whyItHappens}`,
      `- **Cómo solucionarlo:** ${m.solution}`,
    ]),
    '',
    `## Coherencia Visual e Imágenes Reales de Referencia`,
    `- **Etiqueta alt accesible:** \`${lesson.visualReference.altText}\``,
    `- **Unsplash:** ${lesson.visualReference.searchTerms.unsplash}`,
    `- **Pexels:** ${lesson.visualReference.searchTerms.pexels}`,
    `- **Wikimedia Commons:** ${lesson.visualReference.searchTerms.wikimedia}`,
  ];
  return lines.join('\n');
}

export function LessonWorkspace({
  lesson,
  userUid,
  existingProgress,
  teacherMaterials,
  onCompleteLesson,
  onPrevLesson,
  onNextLesson,
  onRequireAuth,
}: LessonWorkspaceProps) {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [completedMediaSteps, setCompletedMediaSteps] = useState<Record<number, boolean>>({});
  const [isPlayingMedia, setIsPlayingMedia] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [showJsonPanel, setShowJsonPanel] = useState(false);
  const [copiedFormat, setCopiedFormat] = useState<'json' | 'md' | null>(null);

  // Reset per-lesson interaction state when lesson changes
  useEffect(() => {
    setAnswers({});
    setSubmittedQuiz(false);
    setActiveStepIdx(0);
    setCompletedMediaSteps({});
    setIsPlayingMedia(false);
    setImgError(false);
    setShowJsonPanel(false);
    setCopiedFormat(null);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [lesson.id]);

  // Decrypt saved notes whenever lesson or progress changes
  useEffect(() => {
    let active = true;
    if (userUid && existingProgress?.encryptedNotes) {
      decryptNoteE2EE(userUid, existingProgress.encryptedNotes).then((plain) => {
        if (active) setNotes(plain);
      });
    } else {
      setNotes('');
    }
    return () => {
      active = false;
    };
  }, [lesson.id, userUid, existingProgress?.encryptedNotes]);

  // Auto-advance multimedia explanation timeline when playing
  useEffect(() => {
    if (!isPlayingMedia) return;
    const timer = window.setInterval(() => {
      setActiveStepIdx((prev) => {
        if (prev >= lesson.multimediaSteps.length - 1) {
          setIsPlayingMedia(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isPlayingMedia, lesson.multimediaSteps.length]);

  const structuredJsonText = useMemo(
    () => JSON.stringify(buildLessonStructuredJson(lesson), null, 2),
    [lesson]
  );

  const speakExplanation = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.98;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeech = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  };

  const toggleMediaStepDone = (idx: number) => {
    setCompletedMediaSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const reviewedStepsCount = lesson.multimediaSteps.filter(
    (_, idx) => completedMediaSteps[idx]
  ).length;

  const correctCount = lesson.practiceQuestions.reduce((acc, q, idx) => {
    return acc + (answers[idx] === q.correctIndex ? 1 : 0);
  }, 0);
  const computedScore = Math.round((correctCount / lesson.practiceQuestions.length) * 100);

  const handleSaveAndComplete = async () => {
    if (!userUid) {
      onRequireAuth();
      return;
    }
    setSaving(true);
    try {
      const scoreToSave =
        Object.keys(answers).length === lesson.practiceQuestions.length
          ? computedScore
          : existingProgress?.score || 100;
      const encrypted = await encryptNoteE2EE(userUid, notes.slice(0, 1800));
      await onCompleteLesson(lesson, scoreToSave, encrypted);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyExport = (fmt: 'json' | 'md') => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) return;
    const text = fmt === 'json' ? structuredJsonText : buildLessonMarkdown(lesson);
    navigator.clipboard.writeText(text);
    setCopiedFormat(fmt);
    window.setTimeout(() => setCopiedFormat(null), 2400);
  };

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const levelTeacherMaterials = teacherMaterials.filter((m) => m.levelId === lesson.levelId);
  const isCompleted = existingProgress?.status === 'completed';

  const quickNavLinks: { id: string; label: string }[] = [
    { id: 'sec-que-es', label: '1. ¿Qué es?' },
    { id: 'sec-para-que', label: '2. ¿Para qué sirve?' },
    { id: 'sec-donde', label: '3. ¿Dónde se emplea?' },
    { id: 'sec-como', label: '4. ¿Cómo se hace?' },
    { id: 'sec-errores', label: '5. Qué errores evitar' },
    { id: 'sec-organizador', label: 'Mapa Conceptual' },
    { id: 'sec-multimedia', label: 'Cápsula Paso a Paso' },
    { id: 'sec-simulador', label: 'Simulador' },
    { id: 'sec-practica', label: 'Práctica' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
      {/* Lesson Header & Quick Section Index */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-sky-700 dark:text-sky-400">
              Lección {lesson.number}
            </span>
            <span aria-hidden="true">·</span>
            <span>{lesson.moduleTitle}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{lesson.durationMinutes} min</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                Completada ({existingProgress?.score ?? 100}%)
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">Pendiente de registro</span>
            )}
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100 text-balance">
          {lesson.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-4xl leading-relaxed">
          {lesson.summary}
        </p>

        {/* Quick Jump Anchors & Structured Output Controls */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
          <nav
            aria-label="Índice de la lección"
            className="flex flex-wrap items-center gap-1.5"
          >
            {quickNavLinks.map((lnk) => (
              <button
                key={lnk.id}
                type="button"
                onClick={() => scrollToSection(lnk.id)}
                className="px-2.5 py-1.5 text-[11px] font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-sky-700 hover:text-white dark:hover:bg-sky-700 transition-colors whitespace-nowrap"
              >
                {lnk.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyExport('md')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {copiedFormat === 'md' ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copiedFormat === 'md' ? 'Markdown copiado' : 'Copiar Markdown'}
            </button>
            <button
              type="button"
              onClick={() => setShowJsonPanel((v) => !v)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <FileCode2 className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              {showJsonPanel ? 'Ocultar JSON' : 'Ver JSON'}
            </button>
          </div>
        </div>

        {showJsonPanel && (
          <div className="mt-3 p-4 rounded-xl bg-slate-950 text-slate-100 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-mono text-sky-400">
                Salida estructurada JSON válido · {lesson.id}
              </span>
              <button
                type="button"
                onClick={() => handleCopyExport('json')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                {copiedFormat === 'json' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedFormat === 'json' ? 'Copiado' : 'Copiar JSON'}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-slate-300 max-h-72 overflow-auto whitespace-pre-wrap leading-relaxed">
              {structuredJsonText}
            </pre>
          </div>
        )}
      </div>

      {/* Full Deployed Lesson Content */}
      <div className="p-6 space-y-10">
        {/* 0. Objetivos + Imagen Real Coherente + Referencias Libres de Derechos */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Objetivos de aprendizaje autodidacta
              </h4>
              <ul className="space-y-2">
                {lesson.learningObjectives.map((obj, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <CheckCircle2 className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Coherencia Visual e Imágenes Reales de Referencia */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                Referencias visuales libres de derechos y accesibilidad (alt)
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong className="text-slate-800 dark:text-slate-200">Texto alternativo (alt):</strong>{' '}
                {lesson.visualReference.altText}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-700 dark:text-sky-400 block">
                    Unsplash
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 break-words">
                    {lesson.visualReference.searchTerms.unsplash}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-700 dark:text-sky-400 block">
                    Pexels
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 break-words">
                    {lesson.visualReference.searchTerms.pexels}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <span className="font-semibold text-sky-700 dark:text-sky-400 block">
                    Wikimedia Commons
                  </span>
                  <span className="font-mono text-slate-600 dark:text-slate-300 break-words">
                    {lesson.visualReference.searchTerms.wikimedia}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <figure className="lg:col-span-5 space-y-2.5">
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              {!imgError ? (
                <img
                  src={lesson.imageUrl}
                  alt={lesson.visualReference.altText}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-60 sm:h-68 object-cover"
                />
              ) : (
                <div className="h-60 flex flex-col items-center justify-center p-6 text-center text-slate-500 dark:text-slate-400">
                  <ImageIcon className="w-8 h-8 mb-2" />
                  <p className="text-xs font-medium">{lesson.visualReference.altText}</p>
                </div>
              )}
            </div>
            <figcaption className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {lesson.visualReference.caption}
            </figcaption>
          </figure>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 1. ¿QUÉ ES? (Definición técnica + analogía cotidiana intuitiva) */}
        <section id="sec-que-es" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              1. ¿Qué es?
            </h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Definición técnica clara
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {lesson.whatIs.definition}
              </p>
            </div>
            <div className="lg:col-span-5 p-5 rounded-xl bg-sky-50/60 dark:bg-sky-950/25 border border-sky-200 dark:border-sky-900/60 space-y-1.5">
              <p className="text-xs font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 shrink-0" />
                Analogía cotidiana intuitiva
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {lesson.whatIs.analogy}
              </p>
            </div>
          </div>
        </section>

        {/* 2. ¿PARA QUÉ SIRVE? (Propósito funcional + problema concreto que resuelve) */}
        <section id="sec-para-que" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              2. ¿Para qué sirve?
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Propósito funcional
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {lesson.purpose.functionalGoal}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Problema concreto que resuelve
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {lesson.purpose.problemSolved}
              </p>
            </div>
          </div>
        </section>

        {/* 3. ¿DÓNDE SE EMPLEA? (Industria, Escuela y Proyectos Comunitarios) */}
        <section id="sec-donde" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              3. ¿Dónde se emplea?
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                En la industria
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {lesson.whereUsed.industry}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" />
                En la escuela
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {lesson.whereUsed.school}
              </p>
            </div>
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                En proyectos comunitarios
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {lesson.whereUsed.community}
              </p>
            </div>
          </div>
        </section>

        {/* 4. ¿CÓMO SE HACE? (Guía paso a paso accionable + código/comandos/configuración real) */}
        <section id="sec-como" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              4. ¿Cómo se hace?
            </h4>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                <ListChecks className="w-4 h-4" />
                Guía práctica paso a paso accionable
              </p>
              <ol className="space-y-2.5">
                {lesson.howToDo.steps.map((step, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
                  >
                    <span className="font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400 shrink-0 mt-0.5">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="lg:col-span-6 p-5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-3">
              <p className="text-xs font-semibold text-sky-400 flex items-center gap-1.5">
                <Code2 className="w-4 h-4" />
                {lesson.howToDo.exampleTitle}
              </p>
              <pre className="text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto bg-slate-950/70 p-3.5 rounded-lg border border-slate-800">
                {lesson.howToDo.codeOrConfig}
              </pre>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-sky-300">Por qué funciona:</strong>{' '}
                {lesson.howToDo.takeaway}
              </p>
            </div>
          </div>
        </section>

        {/* 5. ¿QUÉ ERRORES EVITAR? (2 fallos típicos de principiantes + solución) */}
        <section id="sec-errores" className="scroll-mt-24 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              5. ¿Qué errores evitar?
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.mistakesToAvoid.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-xl bg-amber-50/60 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/60 space-y-2.5"
              >
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                  Fallo típico {idx + 1}: {item.mistake}
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Por qué ocurre:</strong> {item.whyItHappens}
                </p>
                <p className="text-xs text-emerald-900 dark:text-emerald-300 bg-white/80 dark:bg-slate-900/80 p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/50 leading-relaxed">
                  <strong>Cómo solucionarlo:</strong> {item.solution}
                </p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 6. Conceptos Clave y Organizador Conceptual Integrado */}
        <section id="sec-organizador" className="scroll-mt-24 space-y-6">
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Conceptos clave y herramientas del tema
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {lesson.keyConcepts.map((item, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1"
                >
                  <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                    {item.term}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                {lesson.organizerTitle}
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Secuencia conceptual de 4 etapas
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {lesson.organizerNodes.map((node, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <span className="text-[11px] font-mono font-semibold text-sky-700 dark:text-sky-400">
                    Etapa 0{i + 1}
                  </span>
                  <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {node.title}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {node.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 7. Cápsula Multimedia Explicativa Paso a Paso (Desplegada) */}
        <section id="sec-multimedia" className="scroll-mt-24 space-y-5">
          <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                Cápsula Explicativa Paso a Paso · Aprendizaje Autodidacta
              </p>
              <h4 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                {lesson.multimediaTitle}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                {reviewedStepsCount} de {lesson.multimediaSteps.length} pasos marcados como comprendidos
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const nextPlaying = !isPlayingMedia;
                  setIsPlayingMedia(nextPlaying);
                  if (nextPlaying) {
                    const fullNarration = lesson.multimediaSteps
                      .map((s, idx) => `Paso ${idx + 1}: ${s.heading}. ${s.explanation}`)
                      .join(' ');
                    speakExplanation(fullNarration);
                  } else {
                    stopSpeech();
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors"
              >
                {isPlayingMedia ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlayingMedia ? 'Pausar cápsula' : 'Reproducir cápsula completa'}
              </button>
              <button
                type="button"
                onClick={stopSpeech}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Detener audio
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {lesson.multimediaSteps.map((step, i) => {
              const isFocused = i === activeStepIdx;
              const isStepDone = Boolean(completedMediaSteps[i]);
              const pairedGuide = lesson.stepByStepGuide[i];
              const pairedConcept = lesson.keyConcepts[i];
              const pairedStage = lesson.organizerNodes[i];

              return (
                <article
                  key={i}
                  onClick={() => setActiveStepIdx(i)}
                  className={`p-5 rounded-xl border transition-colors space-y-3 cursor-pointer ${
                    isFocused
                      ? 'bg-sky-50/60 dark:bg-sky-950/30 border-sky-500 dark:border-sky-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 text-xs">
                      <span className="font-mono font-semibold text-sky-700 dark:text-sky-400">
                        Paso {String(i + 1).padStart(2, '0')}
                      </span>
                      <span aria-hidden="true" className="text-slate-400">·</span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {step.timeLabel}
                      </span>
                      {isFocused && (
                        <>
                          <span aria-hidden="true" className="text-slate-400">·</span>
                          <span className="font-medium text-sky-700 dark:text-sky-400">
                            Paso en enfoque
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsPlayingMedia(false);
                          setActiveStepIdx(i);
                          speakExplanation(`${step.heading}. ${step.explanation}`);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        Escuchar paso
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMediaStepDone(i);
                        }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          isStepDone
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                            : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {isStepDone ? 'Comprendido' : 'Marcar comprendido'}
                      </button>
                    </div>
                  </div>

                  <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {step.heading}
                  </h5>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {step.explanation}
                  </p>

                  {(pairedGuide || pairedConcept || pairedStage) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800 text-xs">
                      {pairedGuide && (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            Acción autodidacta sugerida
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {pairedGuide}
                          </p>
                        </div>
                      )}
                      {(pairedConcept || pairedStage) && (
                        <div className="space-y-0.5">
                          <p className="font-semibold text-sky-700 dark:text-sky-400">
                            {pairedConcept ? pairedConcept.term : pairedStage?.title}
                          </p>
                          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                            {pairedConcept ? pairedConcept.detail : pairedStage?.detail}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 8. Simulador Interactivo en Vivo (Desplegado) */}
        <section id="sec-simulador" className="scroll-mt-24 space-y-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Simulador Interactivo en Vivo
            </h4>
          </div>
          <InteractiveSimulator kind={lesson.simulatorKind} lesson={lesson} />
        </section>

        <hr className="border-slate-200 dark:border-slate-800" />

        {/* 9. Ejercicios Fáciles de Práctica + Bitácora E2EE + Progreso (Desplegado) */}
        <section id="sec-practica" className="scroll-mt-24 space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0" />
                <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Ejercicios Fáciles de Práctica y Registro
                </h4>
              </div>
              {submittedQuiz && (
                <span className="text-xs font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                  Resultado: {computedScore}% ({correctCount}/{lesson.practiceQuestions.length})
                </span>
              )}
            </div>

            {lesson.practiceQuestions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2.5"
              >
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {qIdx + 1}. {q.prompt}
                </p>
                <div className="space-y-1.5">
                  {q.options.map((opt, optIdx) => {
                    const selected = answers[qIdx] === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    let stateStyle =
                      'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300';
                    if (submittedQuiz && isCorrect) {
                      stateStyle =
                        'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200';
                    } else if (submittedQuiz && selected && !isCorrect) {
                      stateStyle =
                        'border-rose-400 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200';
                    } else if (selected) {
                      stateStyle =
                        'border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [qIdx]: optIdx,
                          }))
                        }
                        className={`w-full text-left px-3.5 py-2.5 text-xs rounded-lg border transition-colors ${stateStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {submittedQuiz && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <strong>Explicación:</strong> {q.explanation}
                  </p>
                )}
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setSubmittedQuiz(true)}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-sky-700 text-sky-700 dark:text-sky-400 dark:border-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40"
              >
                Verificar respuestas
              </button>
            </div>
          </div>

          {/* Encrypted Personal Notes */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Bitácora y apuntes personales de la lección
              </label>
              <SecurityBadgeInline />
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus notas o conclusiones aquí. Se cifran localmente antes de sincronizarse..."
              className="w-full p-3 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              disabled={saving}
              onClick={handleSaveAndComplete}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl bg-sky-700 hover:bg-sky-800 text-white transition-colors disabled:opacity-60"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saving
                ? 'Sincronizando progreso...'
                : isCompleted
                  ? 'Actualizar progreso y notas'
                  : 'Registrar lección completada'}
            </button>
            {!userUid && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Inicia sesión para guardar tu progreso en la nube.
              </span>
            )}
          </div>
        </section>

        {/* Teacher-Uploaded Materials for this Level */}
        {levelTeacherMaterials.length > 0 && (
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Materiales didácticos adicionales publicados por docentes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {levelTeacherMaterials.map((mat) => (
                <div
                  key={mat.id}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="capitalize font-medium text-sky-700 dark:text-sky-400">
                      {mat.materialType}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{mat.authorName}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{mat.durationMinutes} min</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {mat.lessonTitle}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{mat.description}</p>
                  <p className="text-xs text-slate-700 dark:text-slate-200 pt-1 whitespace-pre-line">
                    {mat.content}
                  </p>
                  {mat.resourceUrl && (
                    <a
                      href={mat.resourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline pt-1"
                    >
                      Abrir recurso externo
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lesson Navigation Footer */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
        <button
          type="button"
          disabled={!onPrevLesson}
          onClick={onPrevLesson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 disabled:opacity-40"
        >
          <ArrowLeft className="w-4 h-4" />
          Lección anterior
        </button>
        <button
          type="button"
          disabled={!onNextLesson}
          onClick={onNextLesson}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 disabled:opacity-40"
        >
          Siguiente lección
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
