import type {
  BadgeCategory,
  CertificateRecord,
  EnrollmentRecord,
  LessonProgressRecord,
  UserBadgeRecord,
} from '../types/mentmar';

export type BadgeIconKey =
  | 'compass'
  | 'flame'
  | 'rocket'
  | 'trophy'
  | 'crown'
  | 'star'
  | 'award'
  | 'laptop'
  | 'code'
  | 'cpu'
  | 'wallet'
  | 'clock'
  | 'heart'
  | 'graduation';

export type BadgeAccent = 'sky' | 'emerald' | 'amber' | 'indigo';

export interface BadgeEvaluationContext {
  completedCount: number;
  averageScore: number;
  levelProgress: Record<string, number>;
  completedLessonIds: Set<string>;
  perfectScoreCount: number;
  certificatesCount: number;
}

export interface BadgeDefinition {
  id: string;
  title: string;
  description: string;
  criteriaLabel: string;
  category: BadgeCategory;
  categoryLabel: string;
  icon: BadgeIconKey;
  accent: BadgeAccent;
  targetLevelId: string;
  targetCount: number;
  evaluate: (ctx: BadgeEvaluationContext) => {
    unlocked: boolean;
    current: number;
  };
}

export interface EvaluatedBadge extends BadgeDefinition {
  unlocked: boolean;
  current: number;
  progressPct: number;
  unlockedAt?: unknown;
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'primer-paso-stem',
    title: 'Primer Paso STEM',
    description: 'Completaste tu primera lección autodidacta en MentMar y encendiste tu ruta tecnológica.',
    criteriaLabel: 'Completa 1 lección en cualquier nivel',
    category: 'milestone',
    categoryLabel: 'Progreso',
    icon: 'compass',
    accent: 'sky',
    targetLevelId: 'computacion-basica',
    targetCount: 1,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 1,
      current: Math.min(1, ctx.completedCount),
    }),
  },
  {
    id: 'despegue-digital',
    title: 'Despegue Digital',
    description: 'Superaste tus primeras 5 lecciones con práctica verificada y apuntes en bitácora.',
    criteriaLabel: 'Completa 5 lecciones',
    category: 'milestone',
    categoryLabel: 'Progreso',
    icon: 'flame',
    accent: 'amber',
    targetLevelId: 'computacion-basica',
    targetCount: 5,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 5,
      current: Math.min(5, ctx.completedCount),
    }),
  },
  {
    id: 'explorador-constante',
    title: 'Explorador Constante',
    description: 'Sostienes un ritmo sólido con 15 lecciones completadas en distintos módulos.',
    criteriaLabel: 'Completa 15 lecciones',
    category: 'milestone',
    categoryLabel: 'Progreso',
    icon: 'rocket',
    accent: 'sky',
    targetLevelId: 'programacion-web',
    targetCount: 15,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 15,
      current: Math.min(15, ctx.completedCount),
    }),
  },
  {
    id: 'coleccionista-saber',
    title: 'Coleccionista del Saber',
    description: 'Alcanzaste 30 lecciones completadas consolidando hábitos reales de aprendizaje autodidacta.',
    criteriaLabel: 'Completa 30 lecciones',
    category: 'milestone',
    categoryLabel: 'Progreso',
    icon: 'trophy',
    accent: 'indigo',
    targetLevelId: 'programacion-web',
    targetCount: 30,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 30,
      current: Math.min(30, ctx.completedCount),
    }),
  },
  {
    id: 'maestro-autodidacta',
    title: 'Maestro Autodidacta',
    description: 'Superaste 60 lecciones completas demostrando constancia y dominio técnico sostenido.',
    criteriaLabel: 'Completa 60 lecciones',
    category: 'milestone',
    categoryLabel: 'Progreso',
    icon: 'crown',
    accent: 'amber',
    targetLevelId: 'programacion-avanzada',
    targetCount: 60,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 60,
      current: Math.min(60, ctx.completedCount),
    }),
  },
  {
    id: 'precision-100',
    title: 'Precisión 100%',
    description: 'Obtuviste calificación perfecta de 100% en los ejercicios de práctica de una lección.',
    criteriaLabel: 'Logra 100% en 1 práctica',
    category: 'mastery',
    categoryLabel: 'Excelencia',
    icon: 'star',
    accent: 'emerald',
    targetLevelId: 'computacion-basica',
    targetCount: 1,
    evaluate: (ctx) => ({
      unlocked: ctx.perfectScoreCount >= 1,
      current: Math.min(1, ctx.perfectScoreCount),
    }),
  },
  {
    id: 'excelencia-academica',
    title: 'Excelencia Académica',
    description: 'Mantienes un promedio general igual o superior a 90% tras completar al menos 5 lecciones.',
    criteriaLabel: 'Promedio >= 90% con 5+ lecciones',
    category: 'mastery',
    categoryLabel: 'Excelencia',
    icon: 'award',
    accent: 'emerald',
    targetLevelId: 'computacion-basica',
    targetCount: 5,
    evaluate: (ctx) => ({
      unlocked: ctx.completedCount >= 5 && ctx.averageScore >= 90,
      current: ctx.averageScore >= 90 ? Math.min(5, ctx.completedCount) : Math.min(4, ctx.completedCount),
    }),
  },
  {
    id: 'arquitecto-computo',
    title: 'Arquitecto de Cómputo',
    description: 'Dominas fundamentos de hardware, seguridad web y productividad en Computación Básica.',
    criteriaLabel: 'Completa 5 lecciones en Computación Básica',
    category: 'specialization',
    categoryLabel: 'Especialidad',
    icon: 'laptop',
    accent: 'sky',
    targetLevelId: 'computacion-basica',
    targetCount: 5,
    evaluate: (ctx) => {
      const n = ctx.levelProgress['computacion-basica'] || 0;
      return { unlocked: n >= 5, current: Math.min(5, n) };
    },
  },
  {
    id: 'creador-web',
    title: 'Creador Web y Lógica',
    description: 'Construiste bases firmes en algorítmica PSeInt, HTML5, CSS3, JavaScript o Python.',
    criteriaLabel: 'Completa 5 lecciones en Programación y Web',
    category: 'specialization',
    categoryLabel: 'Especialidad',
    icon: 'code',
    accent: 'indigo',
    targetLevelId: 'programacion-web',
    targetCount: 5,
    evaluate: (ctx) => {
      const n = ctx.levelProgress['programacion-web'] || 0;
      return { unlocked: n >= 5, current: Math.min(5, n) };
    },
  },
  {
    id: 'ingeniero-iot-datos',
    title: 'Ingeniero IoT y Datos',
    description: 'Avanzaste en POO (C++/Java/C#), SQL, Arduino IoT o Machine Learning aplicado.',
    criteriaLabel: 'Completa 5 lecciones en Programación Avanzada',
    category: 'specialization',
    categoryLabel: 'Especialidad',
    icon: 'cpu',
    accent: 'indigo',
    targetLevelId: 'programacion-avanzada',
    targetCount: 5,
    evaluate: (ctx) => {
      const n = ctx.levelProgress['programacion-avanzada'] || 0;
      return { unlocked: n >= 5, current: Math.min(5, n) };
    },
  },
  {
    id: 'estratega-financiero',
    title: 'Estratega Financiero Tech',
    description: 'Completaste las 4 sesiones del Taller de Herramientas Tech para Finanzas Personales.',
    criteriaLabel: 'Completa las 4 sesiones de Finanzas',
    category: 'workshop',
    categoryLabel: 'Talleres',
    icon: 'wallet',
    accent: 'emerald',
    targetLevelId: 'talleres-stem',
    targetCount: 4,
    evaluate: (ctx) => {
      const finIds = [
        'talleres-stem-talleres-finanzas-l1',
        'talleres-stem-talleres-finanzas-l2',
        'talleres-stem-talleres-finanzas-l3',
        'talleres-stem-talleres-finanzas-l4',
      ];
      const count = finIds.filter((id) => ctx.completedLessonIds.has(id)).length;
      return { unlocked: count >= 4, current: count };
    },
  },
  {
    id: 'domador-del-tiempo',
    title: 'Domador del Tiempo',
    description: 'Completaste las 4 sesiones de Time-Blocking, Eisenhower, Pomodoro y automatización.',
    criteriaLabel: 'Completa las 4 sesiones de Tiempo',
    category: 'workshop',
    categoryLabel: 'Talleres',
    icon: 'clock',
    accent: 'sky',
    targetLevelId: 'talleres-stem',
    targetCount: 4,
    evaluate: (ctx) => {
      const timeIds = [
        'talleres-stem-talleres-tiempo-l5',
        'talleres-stem-talleres-tiempo-l6',
        'talleres-stem-talleres-tiempo-l7',
        'talleres-stem-talleres-tiempo-l8',
      ];
      const count = timeIds.filter((id) => ctx.completedLessonIds.has(id)).length;
      return { unlocked: count >= 4, current: count };
    },
  },
  {
    id: 'agente-impacto-social',
    title: 'Agente de Impacto Social',
    description: 'Diseñas soluciones tecnológicas centradas en necesidades reales de tu comunidad.',
    criteriaLabel: 'Completa 3 lecciones en Tecnología Social',
    category: 'specialization',
    categoryLabel: 'Especialidad',
    icon: 'heart',
    accent: 'emerald',
    targetLevelId: 'tecnologia-social',
    targetCount: 3,
    evaluate: (ctx) => {
      const n = ctx.levelProgress['tecnologia-social'] || 0;
      return { unlocked: n >= 3, current: Math.min(3, n) };
    },
  },
  {
    id: 'graduado-mentmar',
    title: 'Graduado con Constancia',
    description: 'Concluiste al 100% un nivel curricular y generaste tu constancia oficial en PDF.',
    criteriaLabel: 'Obtén 1 constancia oficial en PDF',
    category: 'mastery',
    categoryLabel: 'Excelencia',
    icon: 'graduation',
    accent: 'amber',
    targetLevelId: 'computacion-basica',
    targetCount: 1,
    evaluate: (ctx) => ({
      unlocked: ctx.certificatesCount >= 1,
      current: Math.min(1, ctx.certificatesCount),
    }),
  },
];

export function buildBadgeContext(
  enrollment: EnrollmentRecord | null,
  lessonProgressMap: Record<string, LessonProgressRecord>,
  certificates: CertificateRecord[]
): BadgeEvaluationContext {
  const completedItems = Object.values(lessonProgressMap).filter((p) => p.status === 'completed');
  const completedLessonIds = new Set(completedItems.map((p) => p.lessonId));

  // Derive levelProgress cleanly from lessonProgressMap OR fallback to enrollment summary
  const derivedLevelProgress: Record<string, number> = {
    ...(enrollment?.levelProgress || {}),
  };
  if (completedItems.length > 0) {
    const countsByLevel: Record<string, number> = {};
    completedItems.forEach((item) => {
      countsByLevel[item.levelId] = (countsByLevel[item.levelId] || 0) + 1;
    });
    Object.entries(countsByLevel).forEach(([lvlId, count]) => {
      derivedLevelProgress[lvlId] = Math.max(derivedLevelProgress[lvlId] || 0, count);
    });
  }

  const completedCount = Math.max(enrollment?.completedCount ?? 0, completedItems.length);
  const averageScore =
    completedItems.length > 0
      ? Math.round(completedItems.reduce((a, b) => a + b.score, 0) / completedItems.length)
      : enrollment?.averageScore ?? 0;

  const perfectScoreCount = completedItems.filter((p) => p.score >= 100).length;

  return {
    completedCount,
    averageScore,
    levelProgress: derivedLevelProgress,
    completedLessonIds,
    perfectScoreCount,
    certificatesCount: certificates.length,
  };
}

export function evaluateStudentBadges(
  enrollment: EnrollmentRecord | null,
  lessonProgressMap: Record<string, LessonProgressRecord>,
  certificates: CertificateRecord[],
  persistedBadges: UserBadgeRecord[]
): EvaluatedBadge[] {
  const ctx = buildBadgeContext(enrollment, lessonProgressMap, certificates);
  const persistedById = new Map(persistedBadges.map((b) => [b.badgeId || b.id, b]));

  return BADGE_CATALOG.map((def) => {
    const persisted = persistedById.get(def.id);
    const result = def.evaluate(ctx);
    const unlocked = Boolean(persisted) || result.unlocked;
    const current = unlocked ? def.targetCount : Math.min(def.targetCount, result.current);
    const progressPct = Math.min(100, Math.round((current / def.targetCount) * 100));

    return {
      ...def,
      unlocked,
      current,
      progressPct,
      unlockedAt: persisted?.unlockedAt,
    };
  });
}
