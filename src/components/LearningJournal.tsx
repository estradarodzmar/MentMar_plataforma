import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Lock,
  NotebookPen,
  Save,
  Trash2,
} from 'lucide-react';
import { ALL_LESSONS, CURRICULUM_LEVELS } from '../data/curriculum';
import { decryptNoteE2EE, encryptNoteE2EE } from '../lib/cryptoSecurity';
import type {
  JournalConfidence,
  JournalEntryRecord,
  LessonProgressRecord,
} from '../types/mentmar';

interface LearningJournalProps {
  uid: string;
  entries: JournalEntryRecord[];
  lessonProgressMap: Record<string, LessonProgressRecord>;
  onSaveEntry: (payload: {
    id?: string;
    entryDate: string;
    levelId: string;
    levelTitle: string;
    lessonId: string;
    lessonTitle: string;
    confidence: JournalConfidence;
    encryptedContent: string;
  }) => Promise<void>;
  onDeleteEntry: (entryId: string) => Promise<void>;
  onOpenLesson: (levelId: string, lessonId: string) => void;
  onNavigateLevel: (levelId: string) => void;
}

interface CompletedTargetOption {
  key: string;
  levelId: string;
  levelTitle: string;
  lessonId: string;
  lessonTitle: string;
  label: string;
  isCompletedLesson: boolean;
}

const CONFIDENCE_OPTIONS: {
  value: JournalConfidence;
  label: string;
  badgeClass: string;
}[] = [
  {
    value: 'dominado',
    label: 'Dominado',
    badgeClass:
      'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  {
    value: 'en_practica',
    label: 'En práctica',
    badgeClass:
      'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
  },
  {
    value: 'repasar',
    label: 'Por repasar',
    badgeClass:
      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  },
];

function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatEntryDateLabel(isoDate: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es-MX', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function LearningJournal({
  uid,
  entries,
  lessonProgressMap,
  onSaveEntry,
  onDeleteEntry,
  onOpenLesson,
  onNavigateLevel,
}: LearningJournalProps) {
  const completedLessons = useMemo(() => {
    const completedIds = new Set(
      Object.values(lessonProgressMap)
        .filter((item) => item.status === 'completed')
        .map((item) => item.lessonId)
    );
    return ALL_LESSONS.filter((lesson) => completedIds.has(lesson.id));
  }, [lessonProgressMap]);

  const targetOptions = useMemo<CompletedTargetOption[]>(() => {
    const levelMap = new Map(CURRICULUM_LEVELS.map((lvl) => [lvl.id, lvl]));

    if (completedLessons.length > 0) {
      const options: CompletedTargetOption[] = [];
      const seenLevels = new Set<string>();

      completedLessons.forEach((lesson) => {
        const lvl = levelMap.get(lesson.levelId);
        const levelTitle = lvl?.shortTitle || lesson.levelId;
        if (!seenLevels.has(lesson.levelId)) {
          seenLevels.add(lesson.levelId);
          options.push({
            key: `${lesson.levelId}::course-summary`,
            levelId: lesson.levelId,
            levelTitle,
            lessonId: `${lesson.levelId}-resumen`,
            lessonTitle: `Curso completo / avances en ${levelTitle}`,
            label: `${levelTitle} · Reflexión general del curso`,
            isCompletedLesson: false,
          });
        }
        const score = lessonProgressMap[lesson.id]?.score;
        options.push({
          key: `${lesson.levelId}::${lesson.id}`,
          levelId: lesson.levelId,
          levelTitle,
          lessonId: lesson.id,
          lessonTitle: `Lección ${lesson.number}: ${lesson.title}`,
          label: `${levelTitle} · Lección ${lesson.number}: ${lesson.title}${
            typeof score === 'number' ? ` (${score}%)` : ''
          }`,
          isCompletedLesson: true,
        });
      });

      return options;
    }

    return CURRICULUM_LEVELS.map((lvl) => ({
      key: `${lvl.id}::general`,
      levelId: lvl.id,
      levelTitle: lvl.shortTitle,
      lessonId: `${lvl.id}-inicial`,
      lessonTitle: `Inicio de ruta: ${lvl.shortTitle}`,
      label: `${lvl.shortTitle} · Reflexión inicial`,
      isCompletedLesson: false,
    }));
  }, [completedLessons, lessonProgressMap]);

  const [selectedTargetKey, setSelectedTargetKey] = useState<string>(
    () => targetOptions[0]?.key || ''
  );
  const [entryDate, setEntryDate] = useState<string>(getTodayIsoDate);
  const [confidence, setConfidence] = useState<JournalConfidence>('dominado');
  const [plainText, setPlainText] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [decryptedMap, setDecryptedMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!targetOptions.some((opt) => opt.key === selectedTargetKey) && targetOptions[0]) {
      setSelectedTargetKey(targetOptions[0].key);
    }
  }, [targetOptions, selectedTargetKey]);

  useEffect(() => {
    let active = true;
    const decodeAll = async () => {
      const next: Record<string, string> = {};
      await Promise.all(
        entries.map(async (entry) => {
          next[entry.id] = await decryptNoteE2EE(uid, entry.encryptedContent);
        })
      );
      if (active) {
        setDecryptedMap(next);
      }
    };
    void decodeAll();
    return () => {
      active = false;
    };
  }, [entries, uid]);

  const sortedEntries = useMemo(() => {
    const filtered =
      levelFilter === 'all'
        ? entries
        : entries.filter((item) => item.levelId === levelFilter);

    return [...filtered].sort((a, b) => {
      if (b.entryDate !== a.entryDate) return b.entryDate.localeCompare(a.entryDate);
      return b.id.localeCompare(a.id);
    });
  }, [entries, levelFilter]);

  const uniqueDaysCount = useMemo(
    () => new Set(entries.map((e) => e.entryDate)).size,
    [entries]
  );

  const linkedCoursesCount = useMemo(
    () => new Set(entries.map((e) => e.levelId)).size,
    [entries]
  );

  const handleResetComposer = () => {
    setEditingEntryId(null);
    setEntryDate(getTodayIsoDate());
    setConfidence('dominado');
    setPlainText('');
    setFormError('');
    if (targetOptions[0]) {
      setSelectedTargetKey(targetOptions[0].key);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const trimmed = plainText.trim();
    if (trimmed.length < 8) {
      setFormError('Escribe al menos 8 caracteres para guardar una reflexión significativa.');
      return;
    }

    const chosenTarget =
      targetOptions.find((opt) => opt.key === selectedTargetKey) || targetOptions[0];
    if (!chosenTarget) {
      setFormError('Selecciona un curso o lección para vincular tu reflexión.');
      return;
    }

    setSaving(true);
    try {
      const encryptedContent = await encryptNoteE2EE(uid, trimmed.slice(0, 3500));
      if (!encryptedContent || encryptedContent.length > 6000) {
        setFormError('La reflexión excede el límite permitido. Resume un poco tu texto.');
        setSaving(false);
        return;
      }

      await onSaveEntry({
        id: editingEntryId || undefined,
        entryDate,
        levelId: chosenTarget.levelId.slice(0, 64),
        levelTitle: chosenTarget.levelTitle.slice(0, 160),
        lessonId: chosenTarget.lessonId.slice(0, 128),
        lessonTitle: chosenTarget.lessonTitle.slice(0, 200),
        confidence,
        encryptedContent,
      });

      handleResetComposer();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'No se pudo guardar tu reflexión diaria.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStartEdit = (entry: JournalEntryRecord) => {
    setEditingEntryId(entry.id);
    setEntryDate(entry.entryDate);
    setConfidence(entry.confidence);
    setPlainText(decryptedMap[entry.id] || '');
    setFormError('');
    const matchedOption =
      targetOptions.find(
        (opt) => opt.levelId === entry.levelId && opt.lessonId === entry.lessonId
      ) || targetOptions.find((opt) => opt.levelId === entry.levelId);
    if (matchedOption) {
      setSelectedTargetKey(matchedOption.key);
    }
  };

  const handleConfirmDelete = async (entryId: string) => {
    await onDeleteEntry(entryId);
    setConfirmDeleteId(null);
    if (editingEntryId === entryId) {
      handleResetComposer();
    }
  };

  return (
    <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
      {/* Header & Summary */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <NotebookPen className="w-5 h-5 text-sky-700 dark:text-sky-400" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Diario de Aprendizaje
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registra reflexiones diarias sobre lo que aprendiste hoy y vincúlalas a tus cursos y lecciones completadas (cifrado AES-GCM 256).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Reflexiones: </span>
            <span className="font-mono tabular-nums font-bold text-slate-900 dark:text-slate-100">
              {entries.length}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Días activos: </span>
            <span className="font-mono tabular-nums font-bold text-sky-700 dark:text-sky-400">
              {uniqueDaysCount}
            </span>
          </div>
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400">Cursos vinculados: </span>
            <span className="font-mono tabular-nums font-bold text-emerald-700 dark:text-emerald-400">
              {linkedCoursesCount}
            </span>
          </div>
        </div>
      </div>

      {completedLessons.length === 0 && (
        <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Aún no terminas lecciones en la plataforma. Completa una lección para vincular tus reflexiones directamente a tus temas terminados, o comienza con una reflexión inicial.
          </p>
          <button
            type="button"
            onClick={() => onNavigateLevel(CURRICULUM_LEVELS[0].id)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-700 hover:bg-sky-800 text-white whitespace-nowrap"
          >
            Ir a cursos
          </button>
        </div>
      )}

      {/* Composer + Saved Reflections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Reflection Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-5 p-5 rounded-xl bg-slate-50/80 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-4 h-fit"
        >
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {editingEntryId ? 'Editar reflexión' : 'Nueva reflexión diaria'}
            </h4>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              <Lock className="w-3 h-3" />
              E2EE privada
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="space-y-1">
              <label
                htmlFor="journal-date"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                Fecha de aprendizaje
              </label>
              <input
                id="journal-date"
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="journal-course"
                className="block text-xs font-medium text-slate-700 dark:text-slate-300"
              >
                {completedLessons.length > 0
                  ? 'Curso o lección completada'
                  : 'Curso de referencia'}
              </label>
              <select
                id="journal-course"
                value={selectedTargetKey}
                onChange={(e) => setSelectedTargetKey(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
              >
                {targetOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Nivel de comprensión
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {CONFIDENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfidence(opt.value)}
                  className={`py-2 px-2 text-xs font-medium rounded-lg border transition-colors ${
                    confidence === opt.value
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label
              htmlFor="journal-content"
              className="block text-xs font-medium text-slate-700 dark:text-slate-300"
            >
              ¿Qué aprendiste hoy y cómo lo aplicarías?
            </label>
            <textarea
              id="journal-content"
              rows={5}
              required
              maxLength={3500}
              value={plainText}
              onChange={(e) => setPlainText(e.target.value)}
              placeholder="Ej. Hoy comprendí cómo usar estructuras condicionales if/else para validar un presupuesto. Me resultó claro el paso a paso y quiero aplicarlo en mi proyecto escolar..."
              className="w-full px-3 py-2.5 text-xs leading-relaxed rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>Mínimo 8 caracteres</span>
              <span className="font-mono tabular-nums">{plainText.length}/3500</span>
            </div>
          </div>

          {formError && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{formError}</p>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-medium rounded-xl bg-sky-700 hover:bg-sky-800 disabled:opacity-60 text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving
                ? 'Guardando...'
                : editingEntryId
                  ? 'Actualizar reflexión'
                  : 'Guardar reflexión diaria'}
            </button>
            {editingEntryId && (
              <button
                type="button"
                onClick={handleResetComposer}
                className="py-2.5 px-3 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Reflections History List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Bitácora de reflexiones ({sortedEntries.length})
            </h4>
            <select
              aria-label="Filtrar reflexiones por curso"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
            >
              <option value="all">Todos los cursos</option>
              {CURRICULUM_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.shortTitle}
                </option>
              ))}
            </select>
          </div>

          {sortedEntries.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
              <BookOpen className="w-6 h-6 mx-auto text-slate-400" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {entries.length === 0
                  ? 'Tu Diario de Aprendizaje está esperando tu primera nota'
                  : 'No hay reflexiones registradas para este curso'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Escribir brevemente qué aprendiste al terminar cada sesión mejora la retención y te ayuda a preparar mejores proyectos.
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {sortedEntries.map((entry) => {
                const confMeta =
                  CONFIDENCE_OPTIONS.find((c) => c.value === entry.confidence) ||
                  CONFIDENCE_OPTIONS[0];
                const isActualLesson = ALL_LESSONS.some((l) => l.id === entry.lessonId);
                const contentText = decryptedMap[entry.id];

                return (
                  <article
                    key={entry.id}
                    className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span className="inline-flex items-center gap-1 font-mono tabular-nums text-slate-600 dark:text-slate-300 font-medium">
                            <CalendarDays className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                            {formatEntryDateLabel(entry.entryDate)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded border text-[11px] font-medium ${confMeta.badgeClass}`}
                          >
                            {confMeta.label}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 text-xs">
                          <span className="inline-flex items-center gap-1 font-semibold text-sky-700 dark:text-sky-400">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            {entry.levelTitle}
                          </span>
                          <span className="text-slate-400">·</span>
                          <button
                            type="button"
                            onClick={() =>
                              isActualLesson
                                ? onOpenLesson(entry.levelId, entry.lessonId)
                                : onNavigateLevel(entry.levelId)
                            }
                            className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 font-medium text-left"
                          >
                            <span>{entry.lessonTitle}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(entry)}
                          title="Editar reflexión"
                          aria-label="Editar reflexión"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-sky-700 dark:hover:text-sky-400 hover:bg-white dark:hover:bg-slate-900"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {confirmDeleteId === entry.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleConfirmDelete(entry.id)}
                              className="px-2 py-1 text-[11px] font-medium rounded bg-rose-600 text-white hover:bg-rose-700"
                            >
                              Borrar
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-800"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            title="Eliminar reflexión"
                            aria-label="Eliminar reflexión"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white dark:hover:bg-slate-900"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                      {contentText === undefined
                        ? 'Descifrando reflexión...'
                        : contentText || 'No se pudo descifrar el contenido en este dispositivo.'}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
