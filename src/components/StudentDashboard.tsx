import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  Award,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Cpu,
  Crown,
  Flame,
  GraduationCap,
  Heart,
  KeyRound,
  Laptop,
  Lock,
  Rocket,
  ShieldCheck,
  Star,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import {
  evaluateStudentBadges,
  type BadgeAccent,
  type BadgeIconKey,
} from '../data/badges';
import { buildTotpUri, generateBase32Secret, verifyTotpCode } from '../lib/cryptoSecurity';
import { computeStudentLeaderboardStats } from '../lib/leaderboard';
import { downloadStudySessionIcs } from '../lib/pdfExport';
import { GlobalRanking } from './GlobalRanking';
import { LearningJournal } from './LearningJournal';
import type {
  CertificateRecord,
  EnrollmentRecord,
  JournalConfidence,
  JournalEntryRecord,
  LeaderboardEntry,
  LessonProgressRecord,
  NotificationRecord,
  UserBadgeRecord,
  UserProfile,
} from '../types/mentmar';

interface StudentDashboardProps {
  profile: UserProfile;
  enrollment: EnrollmentRecord | null;
  lessonProgressMap: Record<string, LessonProgressRecord>;
  badges: UserBadgeRecord[];
  leaderboard: LeaderboardEntry[];
  journalEntries: JournalEntryRecord[];
  certificates: CertificateRecord[];
  notifications: NotificationRecord[];
  onEnable2FA: (secretBase32: string) => Promise<void>;
  onDisable2FA: () => Promise<void>;
  onTogglePush: (enabled: boolean) => Promise<void>;
  onJoinClassroomCode: (code: string) => Promise<void>;
  onMarkNotificationRead: (id: string) => Promise<void>;
  onCreateCalendarNotification: (title: string, whenIso: string) => Promise<void>;
  onSaveJournalEntry: (payload: {
    id?: string;
    entryDate: string;
    levelId: string;
    levelTitle: string;
    lessonId: string;
    lessonTitle: string;
    confidence: JournalConfidence;
    encryptedContent: string;
  }) => Promise<void>;
  onDeleteJournalEntry: (entryId: string) => Promise<void>;
  onOpenLesson: (levelId: string, lessonId: string) => void;
  onNavigateLevel: (levelId: string) => void;
  onNavigateCertificates: () => void;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function renderBadgeIcon(icon: BadgeIconKey, className: string) {
  switch (icon) {
    case 'compass':
      return <Compass className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'rocket':
      return <Rocket className={className} />;
    case 'trophy':
      return <Trophy className={className} />;
    case 'crown':
      return <Crown className={className} />;
    case 'star':
      return <Star className={className} />;
    case 'laptop':
      return <Laptop className={className} />;
    case 'code':
      return <Code2 className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'wallet':
      return <Wallet className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'graduation':
      return <GraduationCap className={className} />;
    default:
      return <Award className={className} />;
  }
}

const ACCENT_STYLES: Record<
  BadgeAccent,
  { card: string; iconWrap: string; label: string }
> = {
  sky: {
    card: 'border-sky-200 dark:border-sky-800/80 bg-sky-50/50 dark:bg-sky-950/25',
    iconWrap: 'bg-sky-700 text-white',
    label: 'text-sky-700 dark:text-sky-400',
  },
  emerald: {
    card: 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/25',
    iconWrap: 'bg-emerald-600 text-white',
    label: 'text-emerald-700 dark:text-emerald-400',
  },
  amber: {
    card: 'border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/25',
    iconWrap: 'bg-amber-600 text-white',
    label: 'text-amber-700 dark:text-amber-400',
  },
  indigo: {
    card: 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/25',
    iconWrap: 'bg-indigo-600 text-white',
    label: 'text-indigo-700 dark:text-indigo-400',
  },
};

function formatBadgeDate(val: unknown): string {
  if (!val) return '';
  let d: Date | null = null;
  if (val instanceof Date) d = val;
  else if (typeof val === 'string' || typeof val === 'number') d = new Date(val);
  else if (typeof val === 'object') {
    const obj = val as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof obj.toDate === 'function') d = obj.toDate();
    else if (typeof obj.seconds === 'number') d = new Date(obj.seconds * 1000);
    else if (typeof obj._seconds === 'number') d = new Date(obj._seconds * 1000);
  }
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function StudentDashboard({
  profile,
  enrollment,
  lessonProgressMap,
  badges,
  leaderboard,
  journalEntries,
  certificates,
  notifications,
  onEnable2FA,
  onDisable2FA,
  onTogglePush,
  onJoinClassroomCode,
  onMarkNotificationRead,
  onCreateCalendarNotification,
  onSaveJournalEntry,
  onDeleteJournalEntry,
  onOpenLesson,
  onNavigateLevel,
  onNavigateCertificates,
}: StudentDashboardProps) {
  const [classroomInput, setClassroomInput] = useState(enrollment?.classroomCode || '');
  const [classroomMsg, setClassroomMsg] = useState('');
  const [pendingSecret, setPendingSecret] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [totpVerifyInput, setTotpVerifyInput] = useState('');
  const [totpError, setTotpError] = useState('');
  const [sessionTitle, setSessionTitle] = useState('Sesión de práctica MentMar');
  const [sessionDatetime, setSessionDatetime] = useState('');
  const [badgeFilter, setBadgeFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const evaluatedBadges = useMemo(
    () => evaluateStudentBadges(enrollment, lessonProgressMap, certificates, badges),
    [enrollment, lessonProgressMap, certificates, badges]
  );
  const leaderboardStats = useMemo(
    () => computeStudentLeaderboardStats(enrollment, lessonProgressMap),
    [enrollment, lessonProgressMap]
  );
  const unlockedBadgesCount = evaluatedBadges.filter((b) => b.unlocked).length;
  const visibleBadges = useMemo(() => {
    const sorted = [...evaluatedBadges].sort((a, b) => Number(b.unlocked) - Number(a.unlocked));
    if (badgeFilter === 'unlocked') return sorted.filter((b) => b.unlocked);
    if (badgeFilter === 'locked') return sorted.filter((b) => !b.unlocked);
    return sorted;
  }, [evaluatedBadges, badgeFilter]);

  useEffect(() => {
    if (!pendingSecret) {
      setQrDataUrl('');
      return;
    }
    const uri = buildTotpUri(profile.email, pendingSecret);
    QRCode.toDataURL(uri, { width: 180, margin: 1 }).then(setQrDataUrl).catch(() => setQrDataUrl(''));
  }, [pendingSecret, profile.email]);

  const weeklyMinutes = enrollment?.weeklyMinutes || [0, 0, 0, 0, 0, 0, 0];
  const maxWeekly = Math.max(30, ...weeklyMinutes);

  const handleStart2FA = () => {
    setPendingSecret(generateBase32Secret(20));
    setTotpVerifyInput('');
    setTotpError('');
  };

  const handleConfirm2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingSecret) return;
    const valid = await verifyTotpCode(pendingSecret, totpVerifyInput);
    if (!valid) {
      setTotpError('Código incorrecto. Verifica la hora de tu dispositivo e intenta de nuevo.');
      return;
    }
    await onEnable2FA(pendingSecret);
    setPendingSecret(null);
    setTotpVerifyInput('');
  };

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassroomMsg('');
    try {
      await onJoinClassroomCode(classroomInput.trim().toUpperCase());
      setClassroomMsg('Vinculación al grupo docente actualizada en tiempo real.');
    } catch (err) {
      setClassroomMsg(err instanceof Error ? err.message : 'No se encontró ese código de grupo.');
    }
  };

  const handlePushToggle = async () => {
    if (!profile.pushEnabled && typeof Notification !== 'undefined') {
      await Notification.requestPermission();
    }
    await onTogglePush(!profile.pushEnabled);
  };

  const handleScheduleStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    downloadStudySessionIcs(
      sessionTitle,
      'Bloque de estudio programado en la plataforma MentMar.',
      sessionDatetime,
      45
    );
    await onCreateCalendarNotification(sessionTitle, sessionDatetime);
  };

  return (
    <div className="space-y-8">
      {/* Summary Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mi Panel de Aprendizaje · {profile.academicGrade}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            Hola, {profile.displayName}
          </h2>
        </div>
        <button
          type="button"
          onClick={onNavigateCertificates}
          className="px-4 py-2 text-xs font-medium rounded-xl bg-sky-700 hover:bg-sky-800 text-white transition-colors"
        >
          Ver Mis Constancias ({certificates.length})
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Lecciones completadas</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {enrollment?.completedCount ?? 0}
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Tiempo invertido</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {enrollment?.totalMinutes ?? 0} min
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Promedio de prácticas</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
            {enrollment?.averageScore ?? 0}%
          </p>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Insignias logradas</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {unlockedBadgesCount}/{evaluatedBadges.length}
          </p>
        </div>
        <div className="col-span-2 md:col-span-1 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Constancias obtenidas</p>
          <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
            {certificates.length}
          </p>
        </div>
      </div>

      {/* Unlockable Badges Showcase */}
      <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
                Mis Insignias y Logros Desbloqueables
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completa lecciones, domina talleres y mantén tu promedio para desbloquear todas las insignias STEM ({unlockedBadgesCount} de {evaluatedBadges.length} obtenidas).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            {[
              { id: 'all' as const, label: `Todas (${evaluatedBadges.length})` },
              { id: 'unlocked' as const, label: `Desbloqueadas (${unlockedBadgesCount})` },
              {
                id: 'locked' as const,
                label: `Por desbloquear (${evaluatedBadges.length - unlockedBadgesCount})`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBadgeFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  badgeFilter === tab.id
                    ? 'bg-white dark:bg-slate-800 text-sky-700 dark:text-sky-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Global Badges Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-300 font-medium">
              Colección de logros MentMar
            </span>
            <span className="font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
              {Math.round((unlockedBadgesCount / evaluatedBadges.length) * 100)}%
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-sky-700 dark:bg-sky-500 transition-all duration-300"
              style={{
                width: `${Math.round((unlockedBadgesCount / evaluatedBadges.length) * 100)}%`,
              }}
            />
          </div>
        </div>

        {visibleBadges.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {badgeFilter === 'unlocked'
              ? 'Aún no desbloqueas insignias. Completa tu primera lección para obtener "Primer Paso STEM".'
              : '¡Felicidades! Ya desbloqueaste todas las insignias disponibles.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleBadges.map((badge) => {
              const accent = ACCENT_STYLES[badge.accent];
              const unlockedDate = formatBadgeDate(badge.unlockedAt);
              return (
                <article
                  key={badge.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition-colors ${
                    badge.unlocked
                      ? accent.card
                      : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          badge.unlocked
                            ? accent.iconWrap
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {badge.unlocked ? (
                          renderBadgeIcon(badge.icon, 'w-5 h-5')
                        ) : (
                          <Lock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="text-right text-[11px]">
                        <span
                          className={`font-semibold block ${
                            badge.unlocked
                              ? accent.label
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          {badge.unlocked ? 'Desbloqueada' : badge.categoryLabel}
                        </span>
                        {badge.unlocked && unlockedDate && (
                          <span className="font-mono tabular-nums text-[10px] text-slate-500 dark:text-slate-400">
                            {unlockedDate}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4
                        className={`text-sm font-semibold ${
                          badge.unlocked
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {badge.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {badge.unlocked ? badge.description : badge.criteriaLabel}
                      </p>
                    </div>
                  </div>

                  {badge.unlocked ? (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 flex items-center justify-between text-[11px]">
                      <span className={`inline-flex items-center gap-1 font-medium ${accent.label}`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Logro obtenido
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        {badge.categoryLabel}
                      </span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800/70 space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          {badge.current} / {badge.targetCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => onNavigateLevel(badge.targetLevelId)}
                          className="font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                        >
                          Ir a practicar
                        </button>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-sky-600 dark:bg-sky-500 transition-all"
                          style={{ width: `${badge.progressPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Global Top 10 Student Leaderboard */}
      <GlobalRanking
        entries={leaderboard}
        currentUid={profile.uid}
        currentDisplayName={profile.displayName}
        currentAcademicGrade={profile.academicGrade}
        currentPoints={leaderboardStats.points}
        currentCompletedCount={leaderboardStats.completedCount}
        currentAverageScore={leaderboardStats.averageScore}
        onStartPractice={() =>
          onNavigateLevel(CURRICULUM_LEVELS[0].id)
        }
      />

      {/* Progress by Level + Weekly Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Avance por línea curricular
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Sincronizado en tiempo real
            </span>
          </div>
          <div className="space-y-4">
            {CURRICULUM_LEVELS.map((level) => {
              const total = level.modules.reduce((a, m) => a + m.lessons.length, 0);
              const done = enrollment?.levelProgress?.[level.id] || 0;
              const pct = Math.min(100, Math.round((done / total) * 100));
              return (
                <div key={level.id} className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => onNavigateLevel(level.id)}
                      className="font-medium text-slate-800 dark:text-slate-200 hover:text-sky-700 dark:hover:text-sky-400 text-left"
                    >
                      {level.title}
                    </button>
                    <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                      {done}/{total} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-sky-700 dark:bg-sky-500 transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Actividad semanal
            </h3>
            <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-400" />
          </div>
          <div className="h-44 flex items-end gap-2 pt-4">
            {weeklyMinutes.map((mins, idx) => {
              const heightPct = Math.max(8, Math.round((mins / maxWeekly) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    {mins}m
                  </span>
                  <div
                    className="w-full max-w-[28px] rounded-t-md bg-sky-700/85 dark:bg-sky-500/85 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {WEEK_DAYS[idx]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Learning Journal */}
      <LearningJournal
        uid={profile.uid}
        entries={journalEntries}
        lessonProgressMap={lessonProgressMap}
        onSaveEntry={onSaveJournalEntry}
        onDeleteEntry={onDeleteJournalEntry}
        onOpenLesson={onOpenLesson}
        onNavigateLevel={onNavigateLevel}
      />

      {/* Security (2FA + E2EE), Classroom Link, Calendar & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2FA & E2EE Security Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-sky-700 dark:text-sky-400" />
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Seguridad 2FA y Cifrado de Extremo a Extremo
              </h3>
            </div>
            <span
              className={`text-xs font-medium ${
                profile.twoFactorEnabled
                  ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {profile.twoFactorEnabled ? '2FA Activo' : '2FA Pendiente'}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Tus apuntes y reflexiones se cifran localmente con AES-GCM de 256 bits antes de enviarse a la nube. Activa la autenticación de dos factores (TOTP) para proteger tu perfil.
          </p>

          {!profile.twoFactorEnabled && !pendingSecret && (
            <button
              type="button"
              onClick={handleStart2FA}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800"
            >
              <KeyRound className="w-4 h-4" />
              Configurar autenticación en dos pasos (2FA)
            </button>
          )}

          {pendingSecret && (
            <form onSubmit={handleConfirm2FA} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                1. Escanea el código QR en Google Authenticator o Authy (o ingresa la clave manual):
              </p>
              <div className="flex flex-wrap items-center gap-4">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Código QR para 2FA"
                    className="w-28 h-28 rounded-lg border border-slate-200 dark:border-slate-700 bg-white p-1"
                  />
                )}
                <div className="space-y-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 block">Clave secreta Base32:</span>
                  <code className="block font-mono text-xs bg-white dark:bg-slate-900 px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 select-all">
                    {pendingSecret}
                  </code>
                </div>
              </div>
              {totpError && (
                <p className="text-xs text-rose-600 dark:text-rose-400">{totpError}</p>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={totpVerifyInput}
                  onChange={(e) => setTotpVerifyInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Código 6 dígitos"
                  className="px-3 py-2 text-sm font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-40"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Activar 2FA
                </button>
                <button
                  type="button"
                  onClick={() => setPendingSecret(null)}
                  className="px-3 py-2 text-xs text-slate-500"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          {profile.twoFactorEnabled && (
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <Lock className="w-3.5 h-3.5" />
                Protección TOTP habilitada en tu cuenta
              </span>
              <button
                type="button"
                onClick={onDisable2FA}
                className="text-rose-600 dark:text-rose-400 hover:underline"
              >
                Desactivar 2FA
              </button>
            </div>
          )}
        </div>

        {/* Classroom Join + Calendar & Push Notifications */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <form onSubmit={handleJoinClass} className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
              Vincular con tu docente (Código de Grupo)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={classroomInput}
                onChange={(e) => setClassroomInput(e.target.value)}
                placeholder="Ej. MENTMAR-2026"
                className="flex-1 px-3 py-2 text-xs font-mono uppercase rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-medium rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
              >
                Vincular
              </button>
            </div>
            {classroomMsg && (
              <p className="text-xs text-sky-700 dark:text-sky-400">{classroomMsg}</p>
            )}
          </form>

          <form onSubmit={handleScheduleStudy} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Agenda de Estudio (Google / Outlook .ICS)
              </span>
              <button
                type="button"
                onClick={handlePushToggle}
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  profile.pushEnabled
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                {profile.pushEnabled ? 'Push activas' : 'Activar Push'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                className="flex-1 min-w-[160px] px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
              <input
                type="datetime-local"
                value={sessionDatetime}
                onChange={(e) => setSessionDatetime(e.target.value)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
              <button
                type="submit"
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800"
              >
                Exportar .ICS
              </button>
            </div>
          </form>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Notificaciones recientes
              </p>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start justify-between gap-2 text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-200">{n.title}</p>
                      <p className="text-slate-500 dark:text-slate-400">{n.message}</p>
                    </div>
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => onMarkNotificationRead(n.id)}
                        className="text-sky-700 dark:text-sky-400 shrink-0"
                        title="Marcar como leída"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
