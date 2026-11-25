import React, { useMemo, useState } from 'react';
import {
  BarChart3,
  Calendar,
  Code2,
  Copy,
  FileSpreadsheet,
  FileText,
  Filter,
  PlusCircle,
  Trash2,
  TrendingUp,
  Upload,
  Users,
} from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { auth } from '../lib/firebase';
import {
  downloadStudySessionIcs,
  downloadWeeklyReportCsv,
  downloadWeeklyReportPdf,
} from '../lib/pdfExport';
import type {
  ClassroomRecord,
  EnrollmentRecord,
  MaterialType,
  TeacherMaterialRecord,
  UserProfile,
} from '../types/mentmar';

interface TeacherDashboardProps {
  profile: UserProfile;
  enrollments: EnrollmentRecord[];
  classrooms: ClassroomRecord[];
  materials: TeacherMaterialRecord[];
  onCreateClassroom: (name: string, gradeLevel: string) => Promise<void>;
  onUploadMaterial: (data: {
    levelId: string;
    moduleTitle: string;
    lessonTitle: string;
    materialType: MaterialType;
    description: string;
    content: string;
    resourceUrl: string;
    durationMinutes: number;
  }) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
}

const WEEK_DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const PAGE_SIZE = 10;

const KNOWN_ACADEMIC_GRADES = [
  'Primaria',
  'Secundaria',
  'Preparatoria / Bachillerato',
  'Universidad',
  'Posgrado / Docente',
];

function parseEnrollmentDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return Number.isNaN(val.getTime()) ? null : val;
  if (typeof val === 'object' && val !== null) {
    const rec = val as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof rec.toDate === 'function') {
      const d = rec.toDate();
      return Number.isNaN(d.getTime()) ? null : d;
    }
    const secs = typeof rec.seconds === 'number' ? rec.seconds : rec._seconds;
    if (typeof secs === 'number') {
      const d = new Date(secs * 1000);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  if (typeof val === 'string' || typeof val === 'number') {
    const d = new Date(val);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function formatEnrollmentDate(val: unknown): string {
  const d = parseEnrollmentDate(val);
  if (!d) return 'Reciente';
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

type DatePreset = 'all' | 'today' | '7d' | '30d' | 'year' | 'custom';

export function TeacherDashboard({
  profile,
  enrollments,
  classrooms,
  materials,
  onCreateClassroom,
  onUploadMaterial,
  onDeleteMaterial,
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState<'monitoreo' | 'materiales' | 'integraciones'>('monitoreo');
  const [searchStudent, setSearchStudent] = useState('');
  const [gradeFilter, setGradeFilter] = useState('Todos');
  const [classroomFilter, setClassroomFilter] = useState('Todos');
  const [levelFilter, setLevelFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'optimal' | 'support'>('all');
  const [regDatePreset, setRegDatePreset] = useState<DatePreset>('all');
  const [regDateFrom, setRegDateFrom] = useState('');
  const [regDateTo, setRegDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'completed' | 'score' | 'minutes' | 'recent' | 'oldest'>('completed');
  const [currentPage, setCurrentPage] = useState(1);

  const [className, setClassName] = useState('');
  const [classGrade, setClassGrade] = useState('Preparatoria / Bachillerato');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [exportingType, setExportingType] = useState<'pdf' | 'csv' | null>(null);

  // Material Upload Form State
  const [matLevelId, setMatLevelId] = useState(CURRICULUM_LEVELS[0].id);
  const [matModule, setMatModule] = useState(CURRICULUM_LEVELS[0].modules[0].title);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState<MaterialType>('lectura');
  const [matDesc, setMatDesc] = useState('');
  const [matContent, setMatContent] = useState('');
  const [matUrl, setMatUrl] = useState('');
  const [matDuration, setMatDuration] = useState(20);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');

  const myClassrooms = classrooms.filter((c) => c.teacherUid === profile.uid);
  const primaryClassroomName = myClassrooms[0]?.name || 'Grupo General MentMar';

  const uniqueClassroomCodes = useMemo(() => {
    const set = new Set<string>();
    myClassrooms.forEach((c) => set.add(c.code));
    enrollments.forEach((e) => {
      if (e.classroomCode) set.add(e.classroomCode);
    });
    return Array.from(set);
  }, [myClassrooms, enrollments]);

  const availableGrades = useMemo(() => {
    const set = new Set<string>(KNOWN_ACADEMIC_GRADES);
    enrollments.forEach((e) => {
      if (e.academicGrade) set.add(e.academicGrade);
    });
    return Array.from(set);
  }, [enrollments]);

  const handleDatePresetChange = (preset: DatePreset) => {
    setRegDatePreset(preset);
    setCurrentPage(1);
    const now = new Date();
    const toIso = now.toISOString().slice(0, 10);
    if (preset === 'all') {
      setRegDateFrom('');
      setRegDateTo('');
    } else if (preset === 'today') {
      setRegDateFrom(toIso);
      setRegDateTo(toIso);
    } else if (preset === '7d') {
      const from = new Date(now.getTime() - 7 * 86400000);
      setRegDateFrom(from.toISOString().slice(0, 10));
      setRegDateTo(toIso);
    } else if (preset === '30d') {
      const from = new Date(now.getTime() - 30 * 86400000);
      setRegDateFrom(from.toISOString().slice(0, 10));
      setRegDateTo(toIso);
    } else if (preset === 'year') {
      setRegDateFrom(`${now.getFullYear()}-01-01`);
      setRegDateTo(toIso);
    }
  };

  const resetAllFilters = () => {
    setSearchStudent('');
    setGradeFilter('Todos');
    setClassroomFilter('Todos');
    setLevelFilter('Todos');
    setStatusFilter('all');
    setRegDatePreset('all');
    setRegDateFrom('');
    setRegDateTo('');
    setSortBy('completed');
    setCurrentPage(1);
  };

  const hasActiveFilters =
    Boolean(searchStudent.trim()) ||
    gradeFilter !== 'Todos' ||
    classroomFilter !== 'Todos' ||
    levelFilter !== 'Todos' ||
    statusFilter !== 'all' ||
    regDatePreset !== 'all' ||
    Boolean(regDateFrom) ||
    Boolean(regDateTo);

  const filteredEnrollments = useMemo(() => {
    const fromTime = regDateFrom ? new Date(`${regDateFrom}T00:00:00`).getTime() : null;
    const toTime = regDateTo ? new Date(`${regDateTo}T23:59:59.999`).getTime() : null;

    const list = enrollments.filter((e) => {
      const matchesSearch =
        !searchStudent.trim() ||
        e.studentName.toLowerCase().includes(searchStudent.toLowerCase()) ||
        e.classroomCode.toLowerCase().includes(searchStudent.toLowerCase()) ||
        e.academicGrade.toLowerCase().includes(searchStudent.toLowerCase());
      const matchesGrade = gradeFilter === 'Todos' || e.academicGrade === gradeFilter;
      const matchesClass = classroomFilter === 'Todos' || e.classroomCode === classroomFilter;
      const matchesLevel =
        levelFilter === 'Todos' || (e.levelProgress?.[levelFilter] || 0) > 0;
      const needsSupport = e.completedCount < 3 || e.averageScore < 70;
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'optimal' && !needsSupport) ||
        (statusFilter === 'support' && needsSupport);

      let matchesDate = true;
      if (fromTime !== null || toTime !== null) {
        const regDate = parseEnrollmentDate(e.createdAt);
        if (!regDate) {
          matchesDate = false;
        } else {
          const ts = regDate.getTime();
          if (fromTime !== null && ts < fromTime) matchesDate = false;
          if (toTime !== null && ts > toTime) matchesDate = false;
        }
      }

      return (
        matchesSearch &&
        matchesGrade &&
        matchesClass &&
        matchesLevel &&
        matchesStatus &&
        matchesDate
      );
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'score') return b.averageScore - a.averageScore;
      if (sortBy === 'minutes') return b.totalMinutes - a.totalMinutes;
      if (sortBy === 'recent') {
        const ta = parseEnrollmentDate(a.createdAt)?.getTime() || 0;
        const tb = parseEnrollmentDate(b.createdAt)?.getTime() || 0;
        return tb - ta;
      }
      if (sortBy === 'oldest') {
        const ta = parseEnrollmentDate(a.createdAt)?.getTime() || Number.MAX_SAFE_INTEGER;
        const tb = parseEnrollmentDate(b.createdAt)?.getTime() || Number.MAX_SAFE_INTEGER;
        return ta - tb;
      }
      return b.completedCount - a.completedCount;
    });
  }, [
    enrollments,
    searchStudent,
    gradeFilter,
    classroomFilter,
    levelFilter,
    statusFilter,
    regDateFrom,
    regDateTo,
    sortBy,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredEnrollments.length / PAGE_SIZE));
  const paginatedEnrollments = filteredEnrollments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Real-time Analytics & Chart Aggregations
  const analytics = useMemo(() => {
    const total = filteredEnrollments.length;
    const avgScore =
      total > 0
        ? Math.round(filteredEnrollments.reduce((acc, e) => acc + e.averageScore, 0) / total)
        : 0;
    const avgLessons =
      total > 0
        ? Math.round(filteredEnrollments.reduce((acc, e) => acc + e.completedCount, 0) / total)
        : 0;
    const totalMinutes = filteredEnrollments.reduce((acc, e) => acc + e.totalMinutes, 0);

    let optimalCount = 0;
    let progressCount = 0;
    let supportCount = 0;
    filteredEnrollments.forEach((e) => {
      if (e.completedCount >= 3 && e.averageScore >= 80) optimalCount += 1;
      else if (e.completedCount >= 2 && e.averageScore >= 65) progressCount += 1;
      else supportCount += 1;
    });

    const levelAverages = CURRICULUM_LEVELS.map((lvl) => {
      const totalLessons = lvl.modules.reduce((a, m) => a + m.lessons.length, 0);
      const sumDone = filteredEnrollments.reduce(
        (acc, e) => acc + (e.levelProgress?.[lvl.id] || 0),
        0
      );
      const avgPct =
        total > 0 ? Math.min(100, Math.round((sumDone / (total * totalLessons)) * 100)) : 0;
      return { id: lvl.id, label: lvl.shortTitle, avgPct, sumDone };
    });

    const weeklyCohortMinutes = [0, 0, 0, 0, 0, 0, 0];
    filteredEnrollments.forEach((e) => {
      (e.weeklyMinutes || []).forEach((m, idx) => {
        if (idx < 7) weeklyCohortMinutes[idx] += m;
      });
    });

    return {
      total,
      avgScore,
      avgLessons,
      totalMinutes,
      optimalCount,
      progressCount,
      supportCount,
      levelAverages,
      weeklyCohortMinutes,
    };
  }, [filteredEnrollments]);

  const myMaterials = materials.filter((m) => m.authorUid === profile.uid);

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    window.setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className.trim()) return;
    await onCreateClassroom(className.trim(), classGrade);
    setClassName('');
  };

  const handleExportPdf = async () => {
    setExportingType('pdf');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sin sesión');
      const dateFilterLabel =
        regDateFrom || regDateTo
          ? `Registro: ${regDateFrom || 'inicio'} a ${regDateTo || 'hoy'}`
          : 'Registro: Todas las fechas';
      const filterSummary = `Grado: ${gradeFilter} · ${dateFilterLabel} · Grupo: ${classroomFilter} · Nivel: ${levelFilter}`;
      const resp = await fetch('/api/reports/teacher-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacherName: profile.displayName,
          classroomName: primaryClassroomName,
          filterSummary,
          enrollments: filteredEnrollments,
        }),
      });
      if (!resp.ok) throw new Error('Error de servidor PDF');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_MentMar_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      downloadWeeklyReportPdf(profile.displayName, primaryClassroomName, filteredEnrollments);
    } finally {
      setExportingType(null);
    }
  };

  const handleExportCsv = async () => {
    setExportingType('csv');
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('Sin sesión');
      const resp = await fetch('/api/reports/teacher-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enrollments: filteredEnrollments }),
      });
      if (!resp.ok) throw new Error('Error de servidor CSV');
      const blob = await resp.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Reporte_MentMar_${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      downloadWeeklyReportCsv(filteredEnrollments);
    } finally {
      setExportingType(null);
    }
  };

  const handlePublishMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadNotice('');
    try {
      await onUploadMaterial({
        levelId: matLevelId,
        moduleTitle: matModule,
        lessonTitle: matTitle.trim(),
        materialType: matType,
        description: matDesc.trim(),
        content: matContent.trim(),
        resourceUrl: matUrl.trim(),
        durationMinutes: Number(matDuration) || 20,
      });
      setMatTitle('');
      setMatDesc('');
      setMatContent('');
      setMatUrl('');
      setUploadNotice('Material didáctico publicado y sincronizado para todos tus alumnos.');
    } finally {
      setUploading(false);
    }
  };

  const selectedLevelObj =
    CURRICULUM_LEVELS.find((l) => l.id === matLevelId) || CURRICULUM_LEVELS[0];

  const maxWeekly = Math.max(30, ...analytics.weeklyCohortMinutes);
  const donutTotal = Math.max(1, analytics.total);
  const optAngle = (analytics.optimalCount / donutTotal) * 360;
  const progAngle = (analytics.progressCount / donutTotal) * 360;

  return (
    <div className="space-y-8">
      {/* Header + Export Actions */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Panel de Control Docente · {profile.academicGrade}
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100 mt-1">
            Analítica y Monitoreo en Tiempo Real
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={exportingType === 'pdf'}
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <FileText className="w-4 h-4" />
            {exportingType === 'pdf' ? 'Generando PDF...' : 'Exportar Reporte PDF'}
          </button>
          <button
            type="button"
            disabled={exportingType === 'csv'}
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0 disabled:opacity-60"
          >
            <FileSpreadsheet className="w-4 h-4" />
            {exportingType === 'csv' ? 'Generando CSV...' : 'Exportar CSV'}
          </button>
          <button
            type="button"
            onClick={() =>
              downloadStudySessionIcs(
                `Mentoría grupal ${primaryClassroomName}`,
                'Sesión semanal de seguimiento y proyecto integrador MentMar.',
                '',
                60
              )
            }
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 whitespace-nowrap shrink-0"
          >
            <Calendar className="w-4 h-4" />
            Agendar en Calendario
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
        {[
          { id: 'monitoreo', label: 'Avance de Alumnos y Gráficas' },
          { id: 'materiales', label: 'Subir Material Didáctico' },
          { id: 'integraciones', label: 'Esquema API y Datos Escalables' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'monitoreo' && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Estudiantes filtrados</p>
              <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {analytics.total}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Promedio de lecciones</p>
              <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                {analytics.avgLessons}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Aprovechamiento medio</p>
              <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
                {analytics.avgScore}%
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-xs text-slate-500 dark:text-slate-400">Tiempo total acumulado</p>
              <p className="mt-2 text-2xl font-bold font-mono tabular-nums text-emerald-700 dark:text-emerald-400">
                {analytics.totalMinutes} min
              </p>
            </div>
          </div>

          {/* 3 Real-Time Graphical Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Avance por Línea Curricular */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  Avance por nivel curricular
                </h3>
              </div>
              <div className="space-y-3">
                {analytics.levelAverages.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 dark:text-slate-300 truncate pr-2">
                        {item.label}
                      </span>
                      <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                        {item.avgPct}% ({item.sumDone} lec.)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-sky-700 dark:bg-sky-500 transition-all duration-300"
                        style={{ width: `${Math.max(item.sumDone > 0 ? 4 : 0, item.avgPct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 2: Distribución de Desempeño (Donut SVG) */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Distribución de desempeño del grupo
              </h3>
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 shrink-0">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background:
                        analytics.total === 0
                          ? 'rgb(226 232 240)'
                          : `conic-gradient(#059669 0deg ${optAngle}deg, #0284c7 ${optAngle}deg ${optAngle + progAngle}deg, #d97706 ${optAngle + progAngle}deg 360deg)`,
                    }}
                  />
                  <div className="absolute inset-3.5 rounded-full bg-white dark:bg-slate-900 flex flex-col items-center justify-center">
                    <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {analytics.avgScore}%
                    </span>
                    <span className="text-[10px] text-slate-500">media</span>
                  </div>
                </div>
                <div className="space-y-2 text-xs flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                      ● Ritmo óptimo
                    </span>
                    <span className="font-mono tabular-nums">{analytics.optimalCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sky-700 dark:text-sky-400 font-medium">
                      ● En progreso
                    </span>
                    <span className="font-mono tabular-nums">{analytics.progressCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      ▲ Seguimiento
                    </span>
                    <span className="font-mono tabular-nums">{analytics.supportCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Tendencia Semanal del Grupo */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Minutos de estudio semanal (Cohorte)
                </h3>
                <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              </div>
              <div className="h-32 flex items-end gap-2 pt-2">
                {analytics.weeklyCohortMinutes.map((mins, idx) => {
                  const pct = Math.max(8, Math.round((mins / maxWeekly) * 100));
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
                    >
                      <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {mins}m
                      </span>
                      <div
                        className="w-full max-w-[24px] rounded-t bg-sky-700/85 dark:bg-sky-500/85 transition-all"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">
                        {WEEK_DAYS[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Classroom Code Manager */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                  Tus grupos y códigos de vinculación
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparte el código de grupo con tus alumnos para visualizar su avance en tiempo real.
                </p>
              </div>
              <form onSubmit={handleCreateGroup} className="flex flex-wrap gap-2">
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="Nombre del grupo (ej. 3°A Web)"
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option>Primaria</option>
                  <option>Secundaria</option>
                  <option>Preparatoria / Bachillerato</option>
                  <option>Universidad</option>
                </select>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Crear grupo
                </button>
              </form>
            </div>

            {myClassrooms.length > 0 && (
              <div className="flex flex-wrap gap-3">
                {myClassrooms.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</p>
                      <p className="text-slate-500 dark:text-slate-400">{c.gradeLevel}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCode(c.code)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono text-sky-700 dark:text-sky-400"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedCode === c.code ? 'Copiado' : c.code}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Multi-Filter Controls + Scalable Paginated Students Table */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                Progreso en vivo del alumnado
              </h3>
              <div className="flex items-center gap-3">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-medium text-sky-700 dark:text-sky-400 hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
                <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  Mostrando {paginatedEnrollments.length} de {filteredEnrollments.length}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <input
                type="text"
                value={searchStudent}
                onChange={(e) => {
                  setSearchStudent(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Buscar estudiante o grupo..."
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                  Grado:
                </span>
                <select
                  aria-label="Filtrar por grado académico"
                  value={gradeFilter}
                  onChange={(e) => {
                    setGradeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="Todos">Todos los grados</option>
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>
              <select
                aria-label="Filtrar por grupo"
                value={classroomFilter}
                onChange={(e) => {
                  setClassroomFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              >
                <option value="Todos">Grupo: Todos</option>
                {uniqueClassroomCodes.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar por nivel"
                value={levelFilter}
                onChange={(e) => {
                  setLevelFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              >
                <option value="Todos">Nivel: Todos</option>
                {CURRICULUM_LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.shortTitle}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              <label className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                  Registro:
                </span>
                <select
                  aria-label="Filtrar por fecha de registro"
                  value={regDatePreset}
                  onChange={(e) => handleDatePresetChange(e.target.value as DatePreset)}
                  className="w-full bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none"
                >
                  <option value="all">Todas las fechas</option>
                  <option value="today">Hoy</option>
                  <option value="7d">Últimos 7 días</option>
                  <option value="30d">Últimos 30 días</option>
                  <option value="year">Este año</option>
                  <option value="custom">Rango personalizado</option>
                </select>
              </label>

              <label className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                  Desde:
                </span>
                <input
                  type="date"
                  aria-label="Fecha de registro desde"
                  value={regDateFrom}
                  onChange={(e) => {
                    setRegDateFrom(e.target.value);
                    setRegDatePreset('custom');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </label>

              <label className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap shrink-0">
                  Hasta:
                </span>
                <input
                  type="date"
                  aria-label="Fecha de registro hasta"
                  value={regDateTo}
                  onChange={(e) => {
                    setRegDateTo(e.target.value);
                    setRegDatePreset('custom');
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent font-mono tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </label>

              <select
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as typeof statusFilter);
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              >
                <option value="all">Estado: Todos</option>
                <option value="optimal">Ritmo óptimo</option>
                <option value="support">Requiere seguimiento</option>
              </select>

              <select
                aria-label="Ordenar estudiantes"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              >
                <option value="completed">Ordenar: Lecciones</option>
                <option value="score">Ordenar: Promedio</option>
                <option value="minutes">Ordenar: Tiempo</option>
                <option value="recent">Ordenar: Registro más reciente</option>
                <option value="oldest">Ordenar: Registro más antiguo</option>
              </select>
            </div>

            {paginatedEnrollments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
                No se encontraron estudiantes con los filtros actuales. Comparte un código de grupo arriba para monitorear a tus estudiantes en tiempo real.
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                      <tr>
                        <th className="py-2.5 pr-4">Alumno</th>
                        <th className="py-2.5 pr-4">Grado académico</th>
                        <th className="py-2.5 pr-4">Grupo</th>
                        <th className="py-2.5 pr-4">Fecha de registro</th>
                        <th className="py-2.5 pr-4 text-right">Lecciones</th>
                        <th className="py-2.5 pr-4 text-right">Tiempo</th>
                        <th className="py-2.5 pr-4 text-right">Promedio</th>
                        <th className="py-2.5 text-right">Analítica Predictiva</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
                      {paginatedEnrollments.map((st) => {
                        const needsSupport = st.completedCount < 3 || st.averageScore < 70;
                        return (
                          <tr
                            key={st.uid}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                          >
                            <td className="py-3 pr-4 font-medium text-slate-900 dark:text-slate-100">
                              {st.studentName}
                            </td>
                            <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">
                              {st.academicGrade}
                            </td>
                            <td className="py-3 pr-4 font-mono text-slate-500 dark:text-slate-400">
                              {st.classroomCode || 'General'}
                            </td>
                            <td className="py-3 pr-4 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                              {formatEnrollmentDate(st.createdAt)}
                            </td>
                            <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-800 dark:text-slate-200">
                              {st.completedCount}
                            </td>
                            <td className="py-3 pr-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                              {st.totalMinutes} min
                            </td>
                            <td className="py-3 pr-4 text-right font-mono tabular-nums font-semibold text-sky-700 dark:text-sky-400">
                              {st.averageScore}%
                            </td>
                            <td className="py-3 text-right">
                              <span
                                className={`inline-flex items-center gap-1 font-medium ${
                                  needsSupport
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-700 dark:text-emerald-400'
                                }`}
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                {needsSupport ? 'Requiere seguimiento' : 'Ritmo óptimo'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2 text-xs">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="font-mono tabular-nums text-slate-500">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'materiales' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <form
            onSubmit={handlePublishMaterial}
            className="lg:col-span-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Upload className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              Publicar nuevo material didáctico
            </h3>
            {uploadNotice && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-800 dark:text-emerald-200">
                {uploadNotice}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Nivel curricular
                <select
                  value={matLevelId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    setMatLevelId(nextId);
                    const lvl = CURRICULUM_LEVELS.find((l) => l.id === nextId);
                    if (lvl?.modules[0]) setMatModule(lvl.modules[0].title);
                  }}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  {CURRICULUM_LEVELS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.shortTitle}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Módulo destino
                <select
                  value={matModule}
                  onChange={(e) => setMatModule(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  {selectedLevelObj.modules.map((m) => (
                    <option key={m.id} value={m.title}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="sm:col-span-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Título del material
                <input
                  type="text"
                  required
                  minLength={3}
                  maxLength={180}
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="Ej. Guía visual de Flexbox para móviles"
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
              </label>

              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Tipo de recurso
                <select
                  value={matType}
                  onChange={(e) => setMatType(e.target.value as MaterialType)}
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                >
                  <option value="lectura">Lectura</option>
                  <option value="organizador">Organizador Gráfico</option>
                  <option value="multimedia">Multimedia</option>
                  <option value="simulador">Simulador / Práctica</option>
                  <option value="imagen">Imagen Explicativa</option>
                  <option value="ejercicio">Ejercicio Fácil</option>
                </select>
              </label>
            </div>

            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Descripción breve
              <input
                type="text"
                required
                minLength={4}
                maxLength={1000}
                value={matDesc}
                onChange={(e) => setMatDesc(e.target.value)}
                placeholder="Objetivo de aprendizaje del material..."
                className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </label>

            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Contenido didáctico o instrucciones
              <textarea
                rows={4}
                required
                minLength={4}
                maxLength={8000}
                value={matContent}
                onChange={(e) => setMatContent(e.target.value)}
                placeholder="Escribe la lectura, pasos del ejercicio o explicación multimedia..."
                className="mt-1 w-full p-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="sm:col-span-2 block text-xs font-medium text-slate-700 dark:text-slate-300">
                Enlace externo (video, Drive, PDF o imagen, opcional)
                <input
                  type="url"
                  maxLength={500}
                  value={matUrl}
                  onChange={(e) => setMatUrl(e.target.value)}
                  placeholder="https://..."
                  className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
              </label>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Duración (min)
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={matDuration}
                  onChange={(e) => setMatDuration(Number(e.target.value))}
                  className="mt-1 w-full px-3 py-2 text-xs font-mono rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2.5 text-xs font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800 transition-colors"
            >
              {uploading ? 'Publicando...' : 'Publicar material en la plataforma'}
            </button>
          </form>

          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Tus materiales publicados ({myMaterials.length})
            </h3>
            {myMaterials.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Los materiales que subas aparecerán aquí y dentro de las lecciones correspondientes.
              </p>
            ) : (
              <div className="space-y-3 max-h-[460px] overflow-y-auto">
                {myMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="capitalize font-medium text-sky-700 dark:text-sky-400">
                        {m.materialType} · {m.durationMinutes} min
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(m.id)}
                        className="text-slate-400 hover:text-rose-600"
                        title="Eliminar material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {m.lessonTitle}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {m.moduleTitle}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'integraciones' && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-sky-700 dark:text-sky-400" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Esquema Escalable e Interoperabilidad Modular (JSON / API)
            </h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
            La arquitectura separa las colecciones en documentos indexados (`/enrollments/{'{uid}'}`, subcolecciones `/lessonProgress/{'{lessonId}'}`, y `/users/{'{uid}'}/certificates/{'{certId}'}`) para escalar sin límites de tamaño por documento y exportar datos limpios a sistemas escolares externos.
          </p>
          <pre className="p-4 rounded-xl bg-slate-900 text-sky-300 text-xs font-mono overflow-x-auto max-h-64">
{JSON.stringify(
  {
    platform: 'MentMar',
    exportedAt: new Date().toISOString(),
    teacher: profile.displayName,
    classroom: primaryClassroomName,
    totalStudents: filteredEnrollments.length,
    records: filteredEnrollments.map((e) => ({
      uid: e.uid,
      studentName: e.studentName,
      academicGrade: e.academicGrade,
      classroomCode: e.classroomCode,
      registeredAt: parseEnrollmentDate(e.createdAt)?.toISOString() || null,
      completedCount: e.completedCount,
      averageScore: e.averageScore,
      totalMinutes: e.totalMinutes,
    })),
  },
  null,
  2
)}
          </pre>
        </div>
      )}
    </div>
  );
}
