export type UserRole = 'student' | 'teacher';

export type AcademicGrade =
  | 'Primaria'
  | 'Secundaria'
  | 'Preparatoria / Bachillerato'
  | 'Universidad'
  | 'Posgrado / Docente';

export type MaterialType =
  | 'lectura'
  | 'organizador'
  | 'multimedia'
  | 'simulador'
  | 'imagen'
  | 'ejercicio';

export type SimulatorKind =
  | 'computo'
  | 'excel'
  | 'web'
  | 'iot'
  | 'social'
  | 'finance'
  | 'time';

export const FIELD_LIMITS = {
  DISPLAY_NAME_MAX: 120,
  ACADEMIC_GRADE_MAX: 80,
  EMAIL_MAX: 200,
  NOTES_MAX: 4000,
  MATERIAL_TITLE_MAX: 180,
  MATERIAL_MODULE_MAX: 160,
  MATERIAL_DESC_MAX: 1000,
  MATERIAL_CONTENT_MAX: 8000,
  RESOURCE_URL_MAX: 500,
  POST_TITLE_MAX: 160,
  POST_BODY_MAX: 3000,
  CLASSROOM_NAME_MAX: 140,
  CLASSROOM_CODE_MAX: 40,
} as const;

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  academicGrade: string;
  twoFactorEnabled: boolean;
  twoFactorSecretEnc: string;
  pushEnabled: boolean;
  teacherCodeJoined?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EnrollmentRecord {
  uid: string;
  studentName: string;
  academicGrade: string;
  role: UserRole;
  teacherUid: string;
  classroomCode: string;
  completedCount: number;
  totalMinutes: number;
  averageScore: number;
  levelProgress: Record<string, number>;
  weeklyMinutes: number[];
  lastLessonId: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface LessonProgressRecord {
  uid: string;
  lessonId: string;
  levelId: string;
  status: 'in_progress' | 'completed';
  score: number;
  encryptedNotes: string;
  completedAt?: unknown;
  updatedAt?: unknown;
}

export interface CertificateRecord {
  id: string;
  uid: string;
  studentName: string;
  academicGrade: string;
  levelId: string;
  levelTitle: string;
  totalLessons: number;
  score: number;
  verificationCode: string;
  pdfDataBase64?: string;
  fileSizeBytes?: number;
  issuedAt?: unknown;
}

export type BadgeCategory = 'milestone' | 'mastery' | 'specialization' | 'workshop';

export interface UserBadgeRecord {
  id: string;
  uid: string;
  badgeId: string;
  title: string;
  category: BadgeCategory;
  unlockedAt?: unknown;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  academicGrade: string;
  points: number;
  completedCount: number;
  averageScore: number;
  updatedAt?: unknown;
}

export type JournalConfidence = 'dominado' | 'en_practica' | 'repasar';

export interface JournalEntryRecord {
  id: string;
  uid: string;
  entryDate: string;
  levelId: string;
  levelTitle: string;
  lessonId: string;
  lessonTitle: string;
  confidence: JournalConfidence;
  encryptedContent: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface TeacherMaterialRecord {
  id: string;
  authorUid: string;
  authorName: string;
  levelId: string;
  moduleTitle: string;
  lessonTitle: string;
  materialType: MaterialType;
  description: string;
  content: string;
  resourceUrl: string;
  durationMinutes: number;
  isPublished: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface CommunityPostRecord {
  id: string;
  authorUid: string;
  authorName: string;
  authorRole: UserRole;
  academicGrade: string;
  levelTag: string;
  title: string;
  body: string;
  likesCount: number;
  isPublished: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface NotificationRecord {
  id: string;
  uid: string;
  title: string;
  message: string;
  category: 'progress' | 'certificate' | 'calendar' | 'material' | 'security';
  read: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ClassroomRecord {
  id: string;
  code: string;
  name: string;
  teacherUid: string;
  teacherName: string;
  gradeLevel: string;
  isActive: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface PracticeQuestion {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface OrganizerNode {
  title: string;
  detail: string;
}

export interface LessonMistakeFix {
  mistake: string;
  whyItHappens: string;
  solution: string;
}

export interface LessonVisualReference {
  altText: string;
  searchTerms: {
    unsplash: string;
    pexels: string;
    wikimedia: string;
  };
  caption: string;
}

export interface CurriculumLesson {
  id: string;
  number: number;
  title: string;
  moduleId: string;
  moduleTitle: string;
  axisTitle?: string;
  levelId: string;
  durationMinutes: number;
  simulatorKind: SimulatorKind;
  summary: string;
  learningObjectives: string[];
  whatIs: {
    definition: string;
    analogy: string;
  };
  purpose: {
    functionalGoal: string;
    problemSolved: string;
  };
  whereUsed: {
    industry: string;
    school: string;
    community: string;
  };
  howToDo: {
    steps: string[];
    exampleTitle: string;
    codeOrConfig: string;
    takeaway: string;
  };
  mistakesToAvoid: LessonMistakeFix[];
  visualReference: LessonVisualReference;
  readingBody: string[];
  keyConcepts: { term: string; detail: string }[];
  stepByStepGuide: string[];
  practicalExample: {
    title: string;
    snippetOrCase: string;
    takeaway: string;
  };
  commonMistake: string;
  organizerTitle: string;
  organizerNodes: OrganizerNode[];
  multimediaTitle: string;
  multimediaSteps: { timeLabel: string; heading: string; explanation: string }[];
  imageUrl: string;
  imageCaption: string;
  practiceQuestions: PracticeQuestion[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  axisTitle?: string;
  lessonRangeLabel: string;
  lessons: CurriculumLesson[];
}

export interface CurriculumLevel {
  id: string;
  shortTitle: string;
  title: string;
  totalLabel: string;
  focus: string;
  evaluationMethod: string;
  imageUrl: string;
  simulatorKind: SimulatorKind;
  modules: CurriculumModule[];
}
