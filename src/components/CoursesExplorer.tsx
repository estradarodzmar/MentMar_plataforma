import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Copy,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import type {
  CurriculumLesson,
  LessonProgressRecord,
  TeacherMaterialRecord,
} from '../types/mentmar';
import { LessonWorkspace } from './LessonWorkspace';

interface CoursesExplorerProps {
  selectedLevelId: string;
  selectedLessonId: string;
  isIndependentLessonPage?: boolean;
  onSelectLevel: (levelId: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onBackToLevelOverview?: () => void;
  lessonProgressMap: Record<string, LessonProgressRecord>;
  teacherMaterials: TeacherMaterialRecord[];
  userUid: string | null;
  onCompleteLesson: (lesson: CurriculumLesson, score: number, encryptedNotes: string) => Promise<void>;
  onRequireAuth: () => void;
}

export function CoursesExplorer({
  selectedLevelId,
  selectedLessonId,
  isIndependentLessonPage = false,
  onSelectLevel,
  onSelectLesson,
  onBackToLevelOverview,
  lessonProgressMap,
  teacherMaterials,
  userUid,
  onCompleteLesson,
  onRequireAuth,
}: CoursesExplorerProps) {
  const currentLevel =
    CURRICULUM_LEVELS.find((l) => l.id === selectedLevelId) || CURRICULUM_LEVELS[0];

  const allLevelLessons = useMemo(
    () => currentLevel.modules.flatMap((m) => m.lessons),
    [currentLevel]
  );

  const currentLessonIndex = Math.max(
    0,
    allLevelLessons.findIndex((l) => l.id === selectedLessonId)
  );
  const currentLesson = allLevelLessons[currentLessonIndex] || allLevelLessons[0];

  const [expandedModuleId, setExpandedModuleId] = useState<string>(
    currentLesson?.moduleId || currentLevel.modules[0].id
  );
  const [expandAllModules, setExpandAllModules] = useState<boolean>(true);
  const [moduleFilter, setModuleFilter] = useState('');
  const [showSyllabus, setShowSyllabus] = useState<boolean>(!isIndependentLessonPage);
  const [copiedUrl, setCopiedUrl] = useState(false);

  // Sync syllabus visibility when toggling between level overview and independent lesson route
  useEffect(() => {
    setShowSyllabus(!isIndependentLessonPage);
  }, [isIndependentLessonPage]);

  // Keep expanded module synchronized when changing lessons
  useEffect(() => {
    if (currentLesson?.moduleId) {
      setExpandedModuleId(currentLesson.moduleId);
    }
  }, [currentLesson?.moduleId]);

  const filteredModules = useMemo(() => {
    if (!moduleFilter.trim()) return currentLevel.modules;
    const q = moduleFilter.toLowerCase();
    return currentLevel.modules
      .map((m) => ({
        ...m,
        lessons: m.lessons.filter(
          (l) => l.title.toLowerCase().includes(q) || m.title.toLowerCase().includes(q)
        ),
      }))
      .filter((m) => m.lessons.length > 0);
  }, [currentLevel, moduleFilter]);

  const completedInLevel = allLevelLessons.filter(
    (l) => lessonProgressMap[l.id]?.status === 'completed'
  ).length;

  const handleCopyLessonUrl = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard?.writeText(window.location.href);
    setCopiedUrl(true);
    window.setTimeout(() => setCopiedUrl(false), 2200);
  };

  return (
    <div className="space-y-6">
      {/* Level Selector Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {CURRICULUM_LEVELS.map((lvl) => (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onSelectLevel(lvl.id)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              lvl.id === currentLevel.id
                ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {lvl.shortTitle}
          </button>
        ))}
      </div>

      {/* Independent Lesson Page Breadcrumb & Controls OR Level Summary Banner */}
      {isIndependentLessonPage && currentLesson ? (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {onBackToLevelOverview && (
              <button
                type="button"
                onClick={onBackToLevelOverview}
                className="inline-flex items-center gap-1.5 font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                {currentLevel.shortTitle}
              </button>
            )}
            <span aria-hidden="true">/</span>
            <span className="truncate max-w-[240px] sm:max-w-xs">{currentLesson.moduleTitle}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              Lección {currentLesson.number} de {allLevelLessons.length}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSyllabus((s) => !s)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
            >
              {showSyllabus ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  Ocultar temario
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5" />
                  Cambiar lección (Temario)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCopyLessonUrl}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 whitespace-nowrap shrink-0"
            >
              <Copy className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
              {copiedUrl ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium text-sky-700 dark:text-sky-400">
                {currentLevel.totalLabel}
              </span>
              <span aria-hidden="true">·</span>
              <span>{currentLevel.evaluationMethod}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {completedInLevel}/{allLevelLessons.length} completadas
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {currentLevel.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              {currentLevel.focus}
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2">
              {currentLesson && (
                <button
                  type="button"
                  onClick={() => onSelectLesson(currentLesson.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors"
                >
                  Abrir lección {currentLesson.number} en página independiente
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowSyllabus((s) => !s)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {showSyllabus ? 'Ocultar temario' : 'Mostrar temario'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-4">
            <img
              src={currentLesson?.imageUrl || currentLevel.imageUrl}
              alt={currentLesson?.title || currentLevel.title}
              referrerPolicy="no-referrer"
              className="w-full h-36 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
            />
          </div>
        </div>
      )}

      {/* Workspace: Collapsible Module Tree (Left) + Lesson Stage (Right or Full-Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {showSyllabus && (
          <aside className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 lg:sticky lg:top-24">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Temario ({currentLevel.modules.length} módulos)
              </h3>
              <button
                type="button"
                onClick={() => setExpandAllModules((prev) => !prev)}
                className="text-[11px] font-medium text-sky-700 dark:text-sky-400 hover:underline whitespace-nowrap shrink-0"
              >
                {expandAllModules ? 'Contraer módulos' : 'Desplegar todos'}
              </button>
            </div>

            <input
              type="text"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              placeholder="Filtrar lección en este nivel..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100"
            />

            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredModules.map((mod) => {
                const isOpen =
                  expandAllModules || expandedModuleId === mod.id || Boolean(moduleFilter.trim());
                const isSpecialWorkshop =
                  mod.id === 'talleres-finanzas' || mod.id === 'talleres-tiempo';

                return (
                  <div
                    key={mod.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (expandAllModules) {
                          setExpandAllModules(false);
                          setExpandedModuleId(mod.id);
                        } else {
                          setExpandedModuleId(isOpen ? '' : mod.id);
                        }
                      }}
                      className="w-full flex items-start justify-between gap-2 p-3 text-left bg-slate-50/70 dark:bg-slate-950/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors"
                    >
                      <div className="space-y-0.5">
                        {mod.axisTitle && (
                          <p className="text-[10px] font-medium text-sky-700 dark:text-sky-400">
                            {mod.axisTitle}
                          </p>
                        )}
                        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {isSpecialWorkshop && (
                            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                          )}
                          {mod.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {mod.lessonRangeLabel}
                        </p>
                      </div>
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                        {mod.lessons.map((lesson) => {
                          const active = currentLesson?.id === lesson.id;
                          const done = lessonProgressMap[lesson.id]?.status === 'completed';
                          return (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => onSelectLesson(lesson.id)}
                              className={`w-full flex items-start gap-2.5 px-3 py-2.5 text-left text-xs transition-colors ${
                                active
                                  ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-800 dark:text-sky-200 font-medium'
                                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                              }`}
                            >
                              <span className="font-mono tabular-nums text-[11px] text-slate-400 shrink-0 mt-0.5">
                                {String(lesson.number).padStart(2, '0')}
                              </span>
                              <span className="flex-1 leading-snug">{lesson.title}</span>
                              {done && (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        <div className={showSyllabus ? 'lg:col-span-8' : 'lg:col-span-12'}>
          {currentLesson && (
            <LessonWorkspace
              lesson={currentLesson}
              userUid={userUid}
              existingProgress={lessonProgressMap[currentLesson.id]}
              teacherMaterials={teacherMaterials}
              onCompleteLesson={onCompleteLesson}
              onPrevLesson={
                currentLessonIndex > 0
                  ? () => {
                      const prev = allLevelLessons[currentLessonIndex - 1];
                      onSelectLesson(prev.id);
                    }
                  : undefined
              }
              onNextLesson={
                currentLessonIndex < allLevelLessons.length - 1
                  ? () => {
                      const next = allLevelLessons[currentLessonIndex + 1];
                      onSelectLesson(next.id);
                    }
                  : undefined
              }
              onRequireAuth={onRequireAuth}
            />
          )}
        </div>
      </div>
    </div>
  );
}
