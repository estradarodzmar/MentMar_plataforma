import React, { useEffect, useMemo, useRef, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  Bell,
  BookOpen,
  ChevronDown,
  LogOut,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  User as UserIcon,
  X,
} from 'lucide-react';
import {
  AuthModal,
  ProfileOnboardingModal,
  TwoFactorChallengeModal,
} from './components/AuthOnboardingModal';
import { CertificatesView } from './components/CertificatesView';
import { AboutMentMarView, CommunityView } from './components/CommunityAndAbout';
import { CoursesExplorer } from './components/CoursesExplorer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StudentDashboard } from './components/StudentDashboard';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ALL_LESSONS, CURRICULUM_LEVELS } from './data/curriculum';
import { evaluateStudentBadges, type EvaluatedBadge } from './data/badges';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  testFirestoreConnection,
} from './lib/firebase';
import {
  computeStudentLeaderboardStats,
  type StudentLeaderboardStats,
} from './lib/leaderboard';
import type {
  AcademicGrade,
  CertificateRecord,
  ClassroomRecord,
  CommunityPostRecord,
  CurriculumLesson,
  EnrollmentRecord,
  JournalConfidence,
  JournalEntryRecord,
  LeaderboardEntry,
  LessonProgressRecord,
  MaterialType,
  NotificationRecord,
  TeacherMaterialRecord,
  UserBadgeRecord,
  UserProfile,
  UserRole,
} from './types/mentmar';

type AppPage = 'inicio' | 'panel' | 'cursos' | 'constancias' | 'comunidad' | 'acerca';

const ADMIN_EMAIL = 'margaritarodriguezg77@gmail.com';

const DEFAULT_LEVEL = CURRICULUM_LEVELS[0];
const DEFAULT_LESSON = DEFAULT_LEVEL.modules[0].lessons[0];

interface ParsedRoute {
  page: AppPage;
  levelId: string;
  lessonId: string;
  isLessonPage: boolean;
}

function parseRouteFromPath(pathname: string): ParsedRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/panel') {
    return { page: 'panel', levelId: DEFAULT_LEVEL.id, lessonId: DEFAULT_LESSON.id, isLessonPage: false };
  }
  if (clean === '/constancias') {
    return { page: 'constancias', levelId: DEFAULT_LEVEL.id, lessonId: DEFAULT_LESSON.id, isLessonPage: false };
  }
  if (clean === '/comunidad') {
    return { page: 'comunidad', levelId: DEFAULT_LEVEL.id, lessonId: DEFAULT_LESSON.id, isLessonPage: false };
  }
  if (clean === '/acerca') {
    return { page: 'acerca', levelId: DEFAULT_LEVEL.id, lessonId: DEFAULT_LESSON.id, isLessonPage: false };
  }

  const lessonMatch = clean.match(/^\/cursos\/([^/]+)\/leccion\/([^/]+)$/);
  if (lessonMatch) {
    const rawLevelId = decodeURIComponent(lessonMatch[1]);
    const rawLessonId = decodeURIComponent(lessonMatch[2]);
    const matchedLesson = ALL_LESSONS.find((l) => l.id === rawLessonId);
    if (matchedLesson) {
      return {
        page: 'cursos',
        levelId: matchedLesson.levelId,
        lessonId: matchedLesson.id,
        isLessonPage: true,
      };
    }
    const matchedLevel = CURRICULUM_LEVELS.find((l) => l.id === rawLevelId) || DEFAULT_LEVEL;
    return {
      page: 'cursos',
      levelId: matchedLevel.id,
      lessonId: matchedLevel.modules[0].lessons[0].id,
      isLessonPage: false,
    };
  }

  const levelMatch = clean.match(/^\/cursos\/([^/]+)$/);
  if (levelMatch) {
    const rawLevelId = decodeURIComponent(levelMatch[1]);
    const matchedLevel = CURRICULUM_LEVELS.find((l) => l.id === rawLevelId) || DEFAULT_LEVEL;
    return {
      page: 'cursos',
      levelId: matchedLevel.id,
      lessonId: matchedLevel.modules[0].lessons[0].id,
      isLessonPage: false,
    };
  }

  if (clean === '/cursos') {
    return {
      page: 'cursos',
      levelId: DEFAULT_LEVEL.id,
      lessonId: DEFAULT_LESSON.id,
      isLessonPage: false,
    };
  }

  return {
    page: 'inicio',
    levelId: DEFAULT_LEVEL.id,
    lessonId: DEFAULT_LESSON.id,
    isLessonPage: false,
  };
}

function buildPathForPage(target: AppPage, levelId?: string): string {
  switch (target) {
    case 'panel':
      return '/panel';
    case 'constancias':
      return '/constancias';
    case 'comunidad':
      return '/comunidad';
    case 'acerca':
      return '/acerca';
    case 'cursos':
      return levelId ? `/cursos/${encodeURIComponent(levelId)}` : '/cursos';
    default:
      return '/';
  }
}

function MentMarApp() {
  const initialRoute = useMemo(
    () =>
      typeof window !== 'undefined'
        ? parseRouteFromPath(window.location.pathname)
        : {
            page: 'inicio' as AppPage,
            levelId: DEFAULT_LEVEL.id,
            lessonId: DEFAULT_LESSON.id,
            isLessonPage: false,
          },
    []
  );

  const [page, setPage] = useState<AppPage>(initialRoute.page);
  const [selectedLevelId, setSelectedLevelId] = useState<string>(initialRoute.levelId);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(initialRoute.lessonId);
  const [isLessonRoute, setIsLessonRoute] = useState<boolean>(initialRoute.isLessonPage);

  // Navigation UI States
  const [coursesDropdownOpen, setCoursesDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth & Profile State
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [twoFactorVerifiedSession, setTwoFactorVerifiedSession] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Real-time Firestore Data
  const [myEnrollment, setMyEnrollment] = useState<EnrollmentRecord | null>(null);
  const [lessonProgressMap, setLessonProgressMap] = useState<Record<string, LessonProgressRecord>>({});
  const [teacherEnrollments, setTeacherEnrollments] = useState<EnrollmentRecord[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [userBadges, setUserBadges] = useState<UserBadgeRecord[]>([]);
  const [badgesLoaded, setBadgesLoaded] = useState(false);
  const [enrollmentLoaded, setEnrollmentLoaded] = useState(false);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntryRecord[]>([]);
  const [materials, setMaterials] = useState<TeacherMaterialRecord[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPostRecord[]>([]);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomRecord[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const syncedBadgeKeysRef = useRef<Set<string>>(new Set());
  const lastSyncedLeaderboardRef = useRef<string>('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => setToastMessage(null), 4000);
  };

  // Automatic OS Dark Mode
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = (matchesDark: boolean) => {
      document.documentElement.classList.toggle('dark', matchesDark);
    };
    applyTheme(media.matches);
    const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  // Browser History API Back/Forward sync
  useEffect(() => {
    const handlePopState = () => {
      const parsed = parseRouteFromPath(window.location.pathname);
      setPage(parsed.page);
      setSelectedLevelId(parsed.levelId);
      setSelectedLessonId(parsed.lessonId);
      setIsLessonRoute(parsed.isLessonPage);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dynamic document.title per section and independent lesson page
  useEffect(() => {
    if (page === 'cursos') {
      const level = CURRICULUM_LEVELS.find((l) => l.id === selectedLevelId) || DEFAULT_LEVEL;
      const lesson = ALL_LESSONS.find((l) => l.id === selectedLessonId);
      if (isLessonRoute && lesson) {
        document.title = `Lección ${lesson.number}: ${lesson.title} · ${level.shortTitle} | MentMar`;
      } else {
        document.title = `${level.shortTitle} | Cursos MentMar`;
      }
      return;
    }
    const titleMap: Record<Exclude<AppPage, 'cursos'>, string> = {
      inicio: 'MentMar · Plataforma Educativa STEM y Liderazgo',
      panel: 'Mi Panel | MentMar',
      constancias: 'Mis Constancias | MentMar',
      comunidad: 'Comunidad | MentMar',
      acerca: 'Acerca de MentMar | MentMar',
    };
    document.title = titleMap[page];
  }, [page, selectedLevelId, selectedLessonId, isLessonRoute]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCoursesDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  // Test Firestore connection on boot + Auth Listener
  useEffect(() => {
    testFirestoreConnection();
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setAuthReady(true);
      if (!user) {
        setUserProfile(null);
        setNeedsOnboarding(false);
        setTwoFactorVerifiedSession(false);
        setMyEnrollment(null);
        setLessonProgressMap({});
        setCertificates([]);
        setUserBadges([]);
        setBadgesLoaded(false);
        setEnrollmentLoaded(false);
        setLessonsLoaded(false);
        setLeaderboard([]);
        setJournalEntries([]);
        syncedBadgeKeysRef.current.clear();
        lastSyncedLeaderboardRef.current = '';
        setNotifications([]);
        setTeacherEnrollments([]);
      }
    });
    return () => unsub();
  }, []);

  // Public / Published Firestore Streams (Materials & Community)
  useEffect(() => {
    const qMat = query(
      collection(db, 'materials'),
      where('isPublished', '==', true),
      limit(60)
    );
    const unsubMat = onSnapshot(
      qMat,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as TeacherMaterialRecord);
        setMaterials(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'materials')
    );

    const qPosts = query(
      collection(db, 'communityPosts'),
      where('isPublished', '==', true),
      limit(40)
    );
    const unsubPosts = onSnapshot(
      qPosts,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as CommunityPostRecord);
        setCommunityPosts(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'communityPosts')
    );

    return () => {
      unsubMat();
      unsubPosts();
    };
  }, []);

  // Authenticated User Profile & Progress Streams
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setUserProfile(data);
          setNeedsOnboarding(false);
          if (!data.twoFactorEnabled) {
            setTwoFactorVerifiedSession(true);
          }
        } else {
          setUserProfile(null);
          setNeedsOnboarding(true);
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const unsubEnrollment = onSnapshot(
      doc(db, 'enrollments', uid),
      (snap) => {
        setMyEnrollment(snap.exists() ? (snap.data() as EnrollmentRecord) : null);
        setEnrollmentLoaded(true);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `enrollments/${uid}`)
    );

    const qLessonProg = query(
      collection(db, 'enrollments', uid, 'lessonProgress'),
      where('uid', '==', uid)
    );
    const unsubLessons = onSnapshot(
      qLessonProg,
      (snap) => {
        const map: Record<string, LessonProgressRecord> = {};
        snap.docs.forEach((d) => {
          const item = d.data() as LessonProgressRecord;
          map[item.lessonId] = item;
        });
        setLessonProgressMap(map);
        setLessonsLoaded(true);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `enrollments/${uid}/lessonProgress`)
    );

    const qCerts = query(
      collection(db, 'users', uid, 'certificates'),
      where('uid', '==', uid)
    );
    const unsubCerts = onSnapshot(
      qCerts,
      (snap) => {
        setCertificates(snap.docs.map((d) => d.data() as CertificateRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/certificates`)
    );

    const qBadges = query(
      collection(db, 'users', uid, 'badges'),
      where('uid', '==', uid)
    );
    const unsubBadges = onSnapshot(
      qBadges,
      (snap) => {
        const list = snap.docs.map((d) => d.data() as UserBadgeRecord);
        list.forEach((b) => syncedBadgeKeysRef.current.add(`${uid}:${b.badgeId || b.id}`));
        setUserBadges(list);
        setBadgesLoaded(true);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/badges`)
    );

    const qNotifs = query(
      collection(db, 'notifications'),
      where('uid', '==', uid),
      limit(25)
    );
    const unsubNotifs = onSnapshot(
      qNotifs,
      (snap) => {
        setNotifications(snap.docs.map((d) => d.data() as NotificationRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    const qClassrooms = query(
      collection(db, 'classrooms'),
      where('isActive', '==', true),
      limit(30)
    );
    const unsubClass = onSnapshot(
      qClassrooms,
      (snap) => {
        setClassrooms(snap.docs.map((d) => d.data() as ClassroomRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'classrooms')
    );

    const qLeaderboard = query(
      collection(db, 'leaderboard'),
      where('points', '>=', 0),
      orderBy('points', 'desc'),
      limit(10)
    );
    const unsubLeaderboard = onSnapshot(
      qLeaderboard,
      (snap) => {
        setLeaderboard(snap.docs.map((d) => d.data() as LeaderboardEntry));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'leaderboard')
    );

    const qJournal = query(
      collection(db, 'users', uid, 'journalEntries'),
      where('uid', '==', uid)
    );
    const unsubJournal = onSnapshot(
      qJournal,
      (snap) => {
        setJournalEntries(snap.docs.map((d) => d.data() as JournalEntryRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/journalEntries`)
    );

    return () => {
      unsubProfile();
      unsubEnrollment();
      unsubLessons();
      unsubCerts();
      unsubBadges();
      unsubNotifs();
      unsubClass();
      unsubLeaderboard();
      unsubJournal();
    };
  }, [authReady, firebaseUser]);

  // Teacher Real-Time Student Monitoring Stream
  useEffect(() => {
    if (!authReady || !firebaseUser || !userProfile || userProfile.role !== 'teacher') {
      setTeacherEnrollments([]);
      return;
    }

    const isAdmin = firebaseUser.email === ADMIN_EMAIL;
    const qEnroll = isAdmin
      ? query(collection(db, 'enrollments'), orderBy('completedCount', 'desc'), limit(100))
      : query(collection(db, 'enrollments'), where('teacherUid', '==', firebaseUser.uid));

    const unsubTeacher = onSnapshot(
      qEnroll,
      (snap) => {
        setTeacherEnrollments(snap.docs.map((d) => d.data() as EnrollmentRecord));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enrollments')
    );

    return () => unsubTeacher();
  }, [authReady, firebaseUser, userProfile]);

  // Helper: Send In-App + Browser Push Notification
  const triggerNotification = async (
    targetUid: string,
    title: string,
    message: string,
    category: NotificationRecord['category']
  ) => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    try {
      await setDoc(doc(db, 'notifications', id), {
        id,
        uid: targetUid,
        title: title.slice(0, 140),
        message: message.slice(0, 500),
        category,
        read: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (
        userProfile?.pushEnabled &&
        typeof Notification !== 'undefined' &&
        Notification.permission === 'granted'
      ) {
        new Notification(`MentMar · ${title}`, { body: message });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `notifications/${id}`);
    }
  };

  // Persist newly unlocked badges into users/{uid}/badges
  const persistUnlockedBadges = async (
    targetUid: string,
    badgesToSave: EvaluatedBadge[],
    notify: boolean
  ) => {
    const savedBadges: EvaluatedBadge[] = [];
    for (const badge of badgesToSave) {
      const syncKey = `${targetUid}:${badge.id}`;
      if (syncedBadgeKeysRef.current.has(syncKey)) continue;
      syncedBadgeKeysRef.current.add(syncKey);

      try {
        await setDoc(doc(db, 'users', targetUid, 'badges', badge.id), {
          id: badge.id,
          uid: targetUid,
          badgeId: badge.id,
          title: badge.title.slice(0, 120),
          category: badge.category,
          unlockedAt: serverTimestamp(),
        });
        savedBadges.push(badge);
      } catch (err) {
        syncedBadgeKeysRef.current.delete(syncKey);
        handleFirestoreError(err, OperationType.CREATE, `users/${targetUid}/badges/${badge.id}`);
      }
    }

    if (notify && savedBadges.length > 0) {
      const titles = savedBadges.map((b) => b.title).join(', ');
      await triggerNotification(
        targetUid,
        '¡Nueva insignia desbloqueada!',
        savedBadges.length === 1
          ? `Desbloqueaste la insignia "${titles}" en Mi Panel.`
          : `Desbloqueaste ${savedBadges.length} insignias: ${titles}.`,
        'progress'
      );
    }

    return savedBadges;
  };

  // Backfill historical achievements into users/{uid}/badges once profile & streams are ready
  useEffect(() => {
    if (
      !authReady ||
      !firebaseUser ||
      !userProfile ||
      userProfile.role !== 'student' ||
      !badgesLoaded ||
      !enrollmentLoaded ||
      !lessonsLoaded
    ) {
      return;
    }
    const uid = firebaseUser.uid;
    const persistedIds = new Set(userBadges.map((b) => b.badgeId || b.id));
    const evaluated = evaluateStudentBadges(
      myEnrollment,
      lessonProgressMap,
      certificates,
      userBadges
    );
    const missing = evaluated.filter(
      (b) => b.unlocked && !persistedIds.has(b.id) && !syncedBadgeKeysRef.current.has(`${uid}:${b.id}`)
    );
    if (missing.length > 0) {
      void persistUnlockedBadges(uid, missing, false);
    }
  }, [
    authReady,
    firebaseUser,
    userProfile,
    badgesLoaded,
    enrollmentLoaded,
    lessonsLoaded,
    myEnrollment,
    lessonProgressMap,
    certificates,
    userBadges,
  ]);

  // Helper: Sync student points to Global Ranking (/leaderboard/{uid})
  const syncLeaderboardEntry = async (
    targetUid: string,
    displayName: string,
    academicGrade: string,
    stats: StudentLeaderboardStats
  ) => {
    const safeName = displayName.trim().slice(0, 120);
    const safeGrade = academicGrade.trim().slice(0, 80);
    if (safeName.length < 2 || safeGrade.length < 2) return;

    const completedCount = Math.max(0, Math.min(500, Math.round(stats.completedCount)));
    const averageScore = Math.max(0, Math.min(100, Math.round(stats.averageScore)));
    const points = Math.max(0, Math.min(completedCount * 150, Math.round(stats.points)));

    const signature = `${targetUid}|${safeName}|${safeGrade}|${points}|${completedCount}|${averageScore}`;
    if (lastSyncedLeaderboardRef.current === signature) return;
    lastSyncedLeaderboardRef.current = signature;

    try {
      await setDoc(doc(db, 'leaderboard', targetUid), {
        uid: targetUid,
        displayName: safeName,
        academicGrade: safeGrade,
        points,
        completedCount,
        averageScore,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      lastSyncedLeaderboardRef.current = '';
      handleFirestoreError(err, OperationType.WRITE, `leaderboard/${targetUid}`);
    }
  };

  // Keep signed-in student synced in Global Ranking (including historical progress)
  useEffect(() => {
    if (
      !authReady ||
      !firebaseUser ||
      !userProfile ||
      userProfile.role !== 'student' ||
      !enrollmentLoaded ||
      !lessonsLoaded
    ) {
      return;
    }
    const stats = computeStudentLeaderboardStats(myEnrollment, lessonProgressMap);
    const existingEntry = leaderboard.find((e) => e.uid === firebaseUser.uid);
    const matchesExisting =
      existingEntry &&
      existingEntry.displayName === userProfile.displayName.trim().slice(0, 120) &&
      existingEntry.academicGrade === userProfile.academicGrade.trim().slice(0, 80) &&
      existingEntry.points === stats.points &&
      existingEntry.completedCount === stats.completedCount &&
      existingEntry.averageScore === stats.averageScore;

    if (!matchesExisting) {
      void syncLeaderboardEntry(
        firebaseUser.uid,
        userProfile.displayName,
        userProfile.academicGrade,
        stats
      );
    }
  }, [
    authReady,
    firebaseUser,
    userProfile,
    enrollmentLoaded,
    lessonsLoaded,
    myEnrollment,
    lessonProgressMap,
    leaderboard,
  ]);

  // Onboarding Profile Save
  const handleSaveOnboarding = async (data: {
    displayName: string;
    role: UserRole;
    academicGrade: AcademicGrade;
    classroomCode: string;
  }) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    let resolvedTeacherUid = '';
    let resolvedCode = data.classroomCode || 'MENTMAR-GENERAL';

    if (data.classroomCode) {
      try {
        const snap = await getDocs(
          query(collection(db, 'classrooms'), where('code', '==', data.classroomCode), limit(1))
        );
        if (!snap.empty) {
          resolvedTeacherUid = (snap.docs[0].data() as ClassroomRecord).teacherUid;
        }
      } catch {
        // Fallback if code not found
      }
    }

    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        email: firebaseUser.email || 'usuario@mentmar.edu.mx',
        displayName: data.displayName.slice(0, 120),
        role: data.role,
        academicGrade: data.academicGrade,
        twoFactorEnabled: false,
        twoFactorSecretEnc: '',
        pushEnabled: false,
        teacherCodeJoined: resolvedCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      await setDoc(doc(db, 'enrollments', uid), {
        uid,
        studentName: data.displayName.slice(0, 120),
        academicGrade: data.academicGrade,
        role: data.role,
        teacherUid: resolvedTeacherUid,
        classroomCode: resolvedCode,
        completedCount: 0,
        totalMinutes: 0,
        averageScore: 0,
        levelProgress: {},
        weeklyMinutes: [0, 0, 0, 0, 0, 0, 0],
        lastLessonId: CURRICULUM_LEVELS[0].modules[0].lessons[0].id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      if (data.role === 'student') {
        await syncLeaderboardEntry(uid, data.displayName, data.academicGrade, {
          points: 0,
          completedCount: 0,
          averageScore: 0,
        });
      }

      await triggerNotification(
        uid,
        'Bienvenido a MentMar',
        `Tu cuenta de ${data.role === 'teacher' ? 'Docente' : 'Alumno'} (${data.academicGrade}) está lista.`,
        'progress'
      );
      navigateToPage('panel');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}`);
    }
  };

  // Complete Lesson & Sync Progress
  const handleCompleteLesson = async (
    lesson: CurriculumLesson,
    score: number,
    encryptedNotes: string
  ) => {
    if (!firebaseUser || !userProfile) return;
    const uid = firebaseUser.uid;
    const progRef = doc(db, 'enrollments', uid, 'lessonProgress', lesson.id);
    const existing = lessonProgressMap[lesson.id];

    try {
      if (existing) {
        await updateDoc(progRef, {
          status: 'completed',
          score,
          encryptedNotes: encryptedNotes.slice(0, 4000),
          updatedAt: serverTimestamp(),
        });
      } else {
        await setDoc(progRef, {
          uid,
          lessonId: lesson.id,
          levelId: lesson.levelId,
          status: 'completed',
          score,
          encryptedNotes: encryptedNotes.slice(0, 4000),
          completedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }

      const updatedMap = {
        ...lessonProgressMap,
        [lesson.id]: {
          uid,
          lessonId: lesson.id,
          levelId: lesson.levelId,
          status: 'completed' as const,
          score,
          encryptedNotes,
        },
      };

      const completedItems = Object.values(updatedMap).filter((p) => p.status === 'completed');
      const levelProgress: Record<string, number> = {};
      completedItems.forEach((p) => {
        levelProgress[p.levelId] = (levelProgress[p.levelId] || 0) + 1;
      });
      const avgScore =
        completedItems.length > 0
          ? Math.round(completedItems.reduce((a, b) => a + b.score, 0) / completedItems.length)
          : score;

      const dayIdx = (new Date().getDay() + 6) % 7;
      const weekly = [...(myEnrollment?.weeklyMinutes || [0, 0, 0, 0, 0, 0, 0])];
      if (!existing) {
        weekly[dayIdx] = (weekly[dayIdx] || 0) + lesson.durationMinutes;
      }

      const nextCompletedCount = completedItems.length;
      const nextTotalMinutes = existing
        ? myEnrollment?.totalMinutes || lesson.durationMinutes
        : (myEnrollment?.totalMinutes || 0) + lesson.durationMinutes;

      await updateDoc(doc(db, 'enrollments', uid), {
        completedCount: nextCompletedCount,
        totalMinutes: nextTotalMinutes,
        averageScore: avgScore,
        levelProgress,
        weeklyMinutes: weekly,
        lastLessonId: lesson.id,
        updatedAt: serverTimestamp(),
      });

      const persistedBadgeIds = new Set(userBadges.map((b) => b.badgeId || b.id));
      const nextEnrollmentSnapshot: EnrollmentRecord = {
        uid,
        studentName: myEnrollment?.studentName || userProfile.displayName,
        academicGrade: myEnrollment?.academicGrade || userProfile.academicGrade,
        role: userProfile.role,
        teacherUid: myEnrollment?.teacherUid || '',
        classroomCode: myEnrollment?.classroomCode || userProfile.teacherCodeJoined || '',
        completedCount: nextCompletedCount,
        totalMinutes: nextTotalMinutes,
        averageScore: avgScore,
        levelProgress,
        weeklyMinutes: weekly,
        lastLessonId: lesson.id,
      };

      if (userProfile.role === 'student') {
        const nextStats = computeStudentLeaderboardStats(nextEnrollmentSnapshot, updatedMap);
        await syncLeaderboardEntry(
          uid,
          userProfile.displayName,
          userProfile.academicGrade,
          nextStats
        );
      }

      const evaluatedBadges = evaluateStudentBadges(
        nextEnrollmentSnapshot,
        updatedMap,
        certificates,
        userBadges
      );
      const newlyUnlocked = evaluatedBadges.filter(
        (b) => b.unlocked && !persistedBadgeIds.has(b.id)
      );

      if (newlyUnlocked.length > 0) {
        const saved = await persistUnlockedBadges(uid, newlyUnlocked, true);
        if (saved.length > 0) {
          const badgeTitles = saved.map((b) => b.title).join(', ');
          showToast(
            `Lección "${lesson.title}" guardada (${score}%). ¡Insignia desbloqueada: ${badgeTitles}!`
          );
        } else {
          showToast(`Lección "${lesson.title}" guardada (${score}%).`);
        }
      } else {
        showToast(`Lección "${lesson.title}" guardada (${score}%).`);
      }

      if (!existing) {
        await triggerNotification(
          uid,
          'Avance registrado',
          `Completaste "${lesson.title}" con ${score}%.`,
          'progress'
        );
      }

      // Auto-generate PDF certificate when 100% of a level's lessons are completed
      const levelObj = CURRICULUM_LEVELS.find((l) => l.id === lesson.levelId);
      if (levelObj) {
        const totalInLevel = levelObj.modules.reduce((acc, m) => acc + m.lessons.length, 0);
        if (
          (levelProgress[levelObj.id] || 0) >= totalInLevel &&
          !certificates.some((c) => c.levelId === levelObj.id)
        ) {
          await handleIssueCertificate(levelObj.id, levelObj.title, totalInLevel, avgScore);
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `enrollments/${uid}/lessonProgress/${lesson.id}`);
    }
  };

  // Issue Certificate via Backend PDF Service + Save into users/{uid}/certificates ("Mis Constancias")
  const handleIssueCertificate = async (
    levelId: string,
    levelTitle: string,
    totalLessons: number,
    score: number
  ) => {
    if (!firebaseUser || !userProfile) return;
    const token = await firebaseUser.getIdToken();
    const resp = await fetch('/api/certificates/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        levelId,
        levelTitle,
        totalLessons,
        score,
        studentName: userProfile.displayName,
        academicGrade: userProfile.academicGrade,
      }),
    });

    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.error || 'No se pudo generar la constancia PDF en el backend.');
    }

    const payload = (await resp.json()) as {
      persistedOnServer: boolean;
      certificate: CertificateRecord;
    };

    if (!payload.persistedOnServer) {
      try {
        await setDoc(doc(db, 'users', firebaseUser.uid, 'certificates', payload.certificate.id), {
          ...payload.certificate,
          issuedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(
          err,
          OperationType.CREATE,
          `users/${firebaseUser.uid}/certificates/${payload.certificate.id}`
        );
      }
    }

    await triggerNotification(
      firebaseUser.uid,
      '¡Constancia PDF generada!',
      `Tu Constancia de ${levelTitle} se guardó en "Mis Constancias".`,
      'certificate'
    );
    showToast('Constancia PDF generada y guardada en "Mis Constancias".');
  };

  // Daily Learning Journal CRUD Handlers (users/{uid}/journalEntries)
  const handleSaveJournalEntry = async (payload: {
    id?: string;
    entryDate: string;
    levelId: string;
    levelTitle: string;
    lessonId: string;
    lessonTitle: string;
    confidence: JournalConfidence;
    encryptedContent: string;
  }) => {
    if (!firebaseUser || !userProfile) return;
    const uid = firebaseUser.uid;
    const entryId =
      payload.id || `journal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const entryRef = doc(db, 'users', uid, 'journalEntries', entryId);

    try {
      if (payload.id) {
        await updateDoc(entryRef, {
          entryDate: payload.entryDate.slice(0, 10),
          levelId: payload.levelId.slice(0, 64),
          levelTitle: payload.levelTitle.slice(0, 160),
          lessonId: payload.lessonId.slice(0, 128),
          lessonTitle: payload.lessonTitle.slice(0, 200),
          confidence: payload.confidence,
          encryptedContent: payload.encryptedContent.slice(0, 6000),
          updatedAt: serverTimestamp(),
        });
        showToast('Reflexión actualizada en tu Diario de Aprendizaje.');
      } else {
        await setDoc(entryRef, {
          id: entryId,
          uid,
          entryDate: payload.entryDate.slice(0, 10),
          levelId: payload.levelId.slice(0, 64),
          levelTitle: payload.levelTitle.slice(0, 160),
          lessonId: payload.lessonId.slice(0, 128),
          lessonTitle: payload.lessonTitle.slice(0, 200),
          confidence: payload.confidence,
          encryptedContent: payload.encryptedContent.slice(0, 6000),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        showToast('Reflexión guardada en tu Diario de Aprendizaje.');
      }
    } catch (err) {
      handleFirestoreError(
        err,
        payload.id ? OperationType.UPDATE : OperationType.CREATE,
        `users/${uid}/journalEntries/${entryId}`
      );
    }
  };

  const handleDeleteJournalEntry = async (entryId: string) => {
    if (!firebaseUser) return;
    const uid = firebaseUser.uid;
    try {
      await deleteDoc(doc(db, 'users', uid, 'journalEntries', entryId));
      showToast('Reflexión eliminada del Diario de Aprendizaje.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `users/${uid}/journalEntries/${entryId}`);
    }
  };

  // Security & Classroom Handlers
  const handleEnable2FA = async (secretBase32: string) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        twoFactorEnabled: true,
        twoFactorSecretEnc: secretBase32,
        updatedAt: serverTimestamp(),
      });
      setTwoFactorVerifiedSession(true);
      await triggerNotification(
        firebaseUser.uid,
        '2FA Activado',
        'Tu cuenta ahora solicita código TOTP de 6 dígitos al iniciar sesión.',
        'security'
      );
      showToast('Autenticación en dos pasos (2FA) activada.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleDisable2FA = async () => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        twoFactorEnabled: false,
        twoFactorSecretEnc: '',
        updatedAt: serverTimestamp(),
      });
      showToast('Autenticación 2FA desactivada.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleTogglePush = async (enabled: boolean) => {
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        pushEnabled: enabled,
        updatedAt: serverTimestamp(),
      });
      showToast(enabled ? 'Notificaciones push activadas.' : 'Notificaciones push silenciadas.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleJoinClassroomCode = async (code: string) => {
    if (!firebaseUser || !userProfile) return;
    const snap = await getDocs(
      query(collection(db, 'classrooms'), where('code', '==', code), limit(1))
    );
    if (snap.empty) {
      throw new Error('No existe un grupo activo con ese código.');
    }
    const classroom = snap.docs[0].data() as ClassroomRecord;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        displayName: userProfile.displayName,
        academicGrade: userProfile.academicGrade,
        teacherCodeJoined: classroom.code,
        updatedAt: serverTimestamp(),
      });
      await updateDoc(doc(db, 'enrollments', firebaseUser.uid), {
        studentName: userProfile.displayName,
        academicGrade: userProfile.academicGrade,
        teacherUid: classroom.teacherUid,
        classroomCode: classroom.code,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `enrollments/${firebaseUser.uid}`);
    }
  };

  const handleCreateClassroom = async (name: string, gradeLevel: string) => {
    if (!firebaseUser || !userProfile) return;
    const code = `MM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const id = `class-${Date.now()}`;
    try {
      await setDoc(doc(db, 'classrooms', id), {
        id,
        code,
        name: name.slice(0, 140),
        teacherUid: firebaseUser.uid,
        teacherName: userProfile.displayName,
        gradeLevel,
        isActive: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast(`Grupo "${name}" creado con código ${code}`);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `classrooms/${id}`);
    }
  };

  const handleUploadMaterial = async (data: {
    levelId: string;
    moduleTitle: string;
    lessonTitle: string;
    materialType: MaterialType;
    description: string;
    content: string;
    resourceUrl: string;
    durationMinutes: number;
  }) => {
    if (!firebaseUser || !userProfile) return;
    const id = `mat-${Date.now()}`;
    try {
      await setDoc(doc(db, 'materials', id), {
        id,
        authorUid: firebaseUser.uid,
        authorName: userProfile.displayName,
        levelId: data.levelId,
        moduleTitle: data.moduleTitle.slice(0, 160),
        lessonTitle: data.lessonTitle.slice(0, 180),
        materialType: data.materialType,
        description: data.description.slice(0, 1000),
        content: data.content.slice(0, 8000),
        resourceUrl: data.resourceUrl.slice(0, 500),
        durationMinutes: data.durationMinutes,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Material didáctico publicado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `materials/${id}`);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'materials', id));
      showToast('Material eliminado.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `materials/${id}`);
    }
  };

  const handleCreatePost = async (title: string, body: string, levelTag: string) => {
    if (!firebaseUser || !userProfile) return;
    const id = `post-${Date.now()}`;
    try {
      await setDoc(doc(db, 'communityPosts', id), {
        id,
        authorUid: firebaseUser.uid,
        authorName: userProfile.displayName,
        authorRole: userProfile.role,
        academicGrade: userProfile.academicGrade,
        levelTag,
        title: title.slice(0, 160),
        body: body.slice(0, 3000),
        likesCount: 0,
        isPublished: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      showToast('Publicación compartida en Comunidad.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `communityPosts/${id}`);
    }
  };

  const handleLikePost = async (post: CommunityPostRecord) => {
    try {
      await updateDoc(doc(db, 'communityPosts', post.id), {
        likesCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `communityPosts/${post.id}`);
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), {
        read: true,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  // Global Quick Search Results across 308+ lessons & teacher materials
  const quickSearchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return ALL_LESSONS.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.moduleTitle.toLowerCase().includes(q) ||
        l.levelId.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [searchQuery]);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const pushRoute = (path: string) => {
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.history.pushState(null, '', path);
    }
  };

  const navigateToLevel = (levelId: string) => {
    const lvl = CURRICULUM_LEVELS.find((l) => l.id === levelId) || DEFAULT_LEVEL;
    setSelectedLevelId(lvl.id);
    if (lvl.modules[0]?.lessons[0]) {
      setSelectedLessonId(lvl.modules[0].lessons[0].id);
    }
    setIsLessonRoute(false);
    setPage('cursos');
    pushRoute(`/cursos/${encodeURIComponent(lvl.id)}`);
    setCoursesDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToLesson = (levelId: string, lessonId: string) => {
    const lessonObj = ALL_LESSONS.find((l) => l.id === lessonId);
    const resolvedLevelId = lessonObj?.levelId || levelId;
    setSelectedLevelId(resolvedLevelId);
    setSelectedLessonId(lessonId);
    setIsLessonRoute(true);
    setPage('cursos');
    pushRoute(`/cursos/${encodeURIComponent(resolvedLevelId)}/leccion/${encodeURIComponent(lessonId)}`);
    setCoursesDropdownOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (target: AppPage) => {
    setPage(target);
    if (target === 'cursos') {
      setIsLessonRoute(false);
      pushRoute(buildPathForPage('cursos', selectedLevelId));
    } else {
      pushRoute(buildPathForPage(target));
    }
    setCoursesDropdownOpen(false);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const needs2FAChallenge = Boolean(
    firebaseUser &&
      userProfile?.twoFactorEnabled &&
      userProfile.twoFactorSecretEnc &&
      !twoFactorVerifiedSession
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar (3-Zone Contract + Clear Dropdown Navigation) */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Mark */}
          <button
            type="button"
            onClick={() => navigateToPage('inicio')}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0"
          >
            <img
              src="/assets/aistudio/LOGOMENTMAR__2__57edb856.png"
              alt="MentMar"
              className="w-8 h-8 object-contain"
            />
            <span>MentMar</span>
          </button>

          {/* Zone 2: Clean Single-Line Nav Links with Dropdown */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => navigateToPage('panel')}
              className={`hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                page === 'panel' ? 'text-sky-700 dark:text-sky-400' : ''
              }`}
            >
              Mi Panel
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCoursesDropdownOpen((o) => !o)}
                className={`inline-flex items-center gap-1 hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                  page === 'cursos' ? 'text-sky-700 dark:text-sky-400' : ''
                }`}
              >
                Cursos
                <ChevronDown className="w-4 h-4" />
              </button>
              {coursesDropdownOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 space-y-1 z-50">
                  {CURRICULUM_LEVELS.map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => navigateToLevel(lvl.id)}
                      className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                        {lvl.shortTitle}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {lvl.totalLabel}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigateToPage('constancias')}
              className={`hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                page === 'constancias' ? 'text-sky-700 dark:text-sky-400' : ''
              }`}
            >
              Mis Constancias
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('comunidad')}
              className={`hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                page === 'comunidad' ? 'text-sky-700 dark:text-sky-400' : ''
              }`}
            >
              Comunidad
            </button>
            <button
              type="button"
              onClick={() => navigateToPage('acerca')}
              className={`hover:text-sky-700 dark:hover:text-sky-400 transition-colors whitespace-nowrap shrink-0 ${
                page === 'acerca' ? 'text-sky-700 dark:text-sky-400' : ''
              }`}
            >
              Acerca de
            </button>
          </nav>

          {/* Zone 3: Primary Action + Mobile Menu */}
          <div className="flex items-center gap-3 shrink-0">
            {firebaseUser ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    aria-label="Notificaciones"
                    onClick={() => setNotifDrawerOpen((o) => !o)}
                    className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotifCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 px-1.5 text-[10px] font-mono font-bold rounded-full bg-sky-700 text-white">
                        {unreadNotifCount}
                      </span>
                    )}
                  </button>
                  {notifDrawerOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-3 space-y-2 z-50">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span>Notificaciones</span>
                        <button
                          type="button"
                          onClick={() => setNotifDrawerOpen(false)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          Cerrar
                        </button>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-500 py-3 text-center">
                          Sin notificaciones nuevas.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-60 overflow-y-auto">
                          {notifications.slice(0, 8).map((n) => (
                            <button
                              key={n.id}
                              type="button"
                              onClick={() => handleMarkNotificationRead(n.id)}
                              className={`w-full text-left p-2 rounded-lg text-xs ${
                                n.read
                                  ? 'bg-slate-50 dark:bg-slate-950/50 text-slate-500'
                                  : 'bg-sky-50 dark:bg-sky-950/40 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              <p className="font-semibold">{n.title}</p>
                              <p className="opacity-85">{n.message}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => navigateToPage('panel')}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 whitespace-nowrap shrink-0"
                >
                  <UserIcon className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
                  <span className="max-w-[110px] truncate">
                    {userProfile?.displayName || firebaseUser.email}
                  </span>
                </button>
                <button
                  type="button"
                  aria-label="Cerrar sesión"
                  onClick={() => signOut(auth)}
                  className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
              >
                Iniciar sesión
              </button>
            )}

            <button
              type="button"
              aria-label="Menú"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1">
            {[
              { id: 'panel' as AppPage, label: 'Mi Panel' },
              { id: 'cursos' as AppPage, label: 'Cursos y Talleres' },
              { id: 'constancias' as AppPage, label: 'Mis Constancias' },
              { id: 'comunidad' as AppPage, label: 'Comunidad' },
              { id: 'acerca' as AppPage, label: 'Acerca de MentMar' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => navigateToPage(item.id)}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Quick Search Bar in Top Workspace Strip */}
      <div className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 relative">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-2xl">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchQuery}
                onFocus={() => setSearchOpen(true)}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSearchOpen(true);
                }}
                placeholder="Búsqueda rápida: Python, Excel, Finanzas personales, Pomodoro, Arduino, HTML5..."
                className="w-full pl-9 pr-4 py-1.5 text-xs sm:text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
            <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400">
              320+ lecciones y talleres disponibles
            </span>
          </div>

          {searchOpen && quickSearchResults.length > 0 && (
            <div className="absolute left-4 right-4 sm:left-6 sm:max-w-2xl mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-2 z-30 space-y-1">
              <div className="flex items-center justify-between px-2 py-1 text-[11px] text-slate-400">
                <span>Resultados rápidos</span>
                <button type="button" onClick={() => setSearchOpen(false)}>
                  Cerrar
                </button>
              </div>
              {quickSearchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => {
                    navigateToLesson(res.levelId, res.id);
                    setSearchQuery('');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{res.title}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {res.moduleTitle}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl bg-slate-900 dark:bg-sky-700 text-white text-xs font-medium shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {page === 'inicio' && (
          <div className="space-y-16">
            {/* Hero */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
                <p className="text-xs font-medium text-sky-700 dark:text-sky-400">
                  Apaseo el Grande, Guanajuato · Ecosistema Educativo STEM
                </p>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance leading-[1.12]">
                  Aprende tecnología, programación y liderazgo con propósito social
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                  Recorre el plan curricular completo desde Computación Básica hasta Inteligencia Artificial e IoT, junto con talleres prácticos de Finanzas Personales y Administración del Tiempo. Obtén constancias oficiales en PDF.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => navigateToPage('cursos')}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800 transition-colors"
                  >
                    <BookOpen className="w-4 h-4" />
                    Explorar Cursos y Talleres
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      firebaseUser ? navigateToPage('panel') : setAuthModalOpen(true)
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-xl border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-900 transition-colors"
                  >
                    {firebaseUser ? 'Ir a Mi Panel' : 'Acceder con correo electrónico'}
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
                <img
                  src={CURRICULUM_LEVELS[1].imageUrl}
                  alt="Estudiantes desarrollando habilidades web y programación en MentMar"
                  referrerPolicy="no-referrer"
                  className="w-full h-64 lg:h-full object-cover"
                />
              </div>
            </section>

            {/* 4 Curriculum Levels + Specialized Workshops */}
            <section className="space-y-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                    Plan Curricular Anual y Talleres Especializados
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Cada lección incluye lecturas, organizadores gráficos, multimedia, simulador en vivo, imágenes reales y práctica fácil.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {CURRICULUM_LEVELS.map((lvl) => (
                  <article
                    key={lvl.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-sky-500/70 transition-colors"
                  >
                    <div>
                      <img
                        src={lvl.imageUrl}
                        alt={lvl.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-40 object-cover border-b border-slate-200 dark:border-slate-800"
                      />
                      <div className="p-5 space-y-2">
                        <div className="text-xs text-sky-700 dark:text-sky-400 font-medium">
                          {lvl.totalLabel} · {lvl.modules.length} módulos
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                          {lvl.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          {lvl.focus}
                        </p>
                      </div>
                    </div>
                    <div className="px-5 pb-5">
                      <button
                        type="button"
                        onClick={() => navigateToLevel(lvl.id)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-sky-700 hover:text-white transition-colors"
                      >
                        Entrar al nivel
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Quick Spotlight on the 2 Specialized Workshops */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  Taller Tech Especializado
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Herramientas Tech para Finanzas Personales
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Domina el presupuesto 50/30/20 en hojas de cálculo, apps de control financiero, simulador de interés compuesto y seguridad bancaria digital.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigateToLesson('talleres-stem', 'talleres-stem-talleres-finanzas-l1')
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Abrir simulador y taller de finanzas
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 dark:text-sky-400">
                  <Sparkles className="w-4 h-4" />
                  Taller Tech Especializado
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  Tecnología para la Administración del Tiempo
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Implementa Time-Blocking en calendarios en la nube, Matriz de Eisenhower digital y temporizador Pomodoro en vivo para estudiar sin agotamiento.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    navigateToLesson('talleres-stem', 'talleres-stem-talleres-tiempo-l5')
                  }
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-700 dark:text-sky-400 hover:underline"
                >
                  Abrir simulador Pomodoro y taller de tiempo
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </section>
          </div>
        )}

        {page === 'cursos' && (
          <CoursesExplorer
            selectedLevelId={selectedLevelId}
            selectedLessonId={selectedLessonId}
            isIndependentLessonPage={isLessonRoute}
            onSelectLevel={navigateToLevel}
            onSelectLesson={(lessonId) => navigateToLesson(selectedLevelId, lessonId)}
            onBackToLevelOverview={() => navigateToLevel(selectedLevelId)}
            lessonProgressMap={lessonProgressMap}
            teacherMaterials={materials}
            userUid={firebaseUser?.uid || null}
            onCompleteLesson={handleCompleteLesson}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {page === 'panel' && (
          <div>
            {!firebaseUser || !userProfile ? (
              <div className="max-w-lg mx-auto p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
                <ShieldCheck className="w-10 h-10 mx-auto text-sky-700 dark:text-sky-400" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Accede a tu Panel Personalizado
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Inicia sesión con tu correo electrónico y selecciona si eres Alumno o Docente junto con tu grado académico para sincronizar tu progreso en tiempo real.
                </p>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-5 py-2.5 text-sm font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800"
                >
                  Iniciar sesión ahora
                </button>
              </div>
            ) : userProfile.role === 'teacher' ? (
              <TeacherDashboard
                profile={userProfile}
                enrollments={teacherEnrollments}
                classrooms={classrooms}
                materials={materials}
                onCreateClassroom={handleCreateClassroom}
                onUploadMaterial={handleUploadMaterial}
                onDeleteMaterial={handleDeleteMaterial}
              />
            ) : (
              <StudentDashboard
                profile={userProfile}
                enrollment={myEnrollment}
                lessonProgressMap={lessonProgressMap}
                badges={userBadges}
                leaderboard={leaderboard}
                journalEntries={journalEntries}
                certificates={certificates}
                notifications={notifications}
                onEnable2FA={handleEnable2FA}
                onDisable2FA={handleDisable2FA}
                onTogglePush={handleTogglePush}
                onJoinClassroomCode={handleJoinClassroomCode}
                onMarkNotificationRead={handleMarkNotificationRead}
                onCreateCalendarNotification={async (title, whenIso) => {
                  await triggerNotification(
                    userProfile.uid,
                    'Sesión agendada',
                    `Se descargó el evento "${title}" (${whenIso || 'próxima sesión'}).`,
                    'calendar'
                  );
                }}
                onSaveJournalEntry={handleSaveJournalEntry}
                onDeleteJournalEntry={handleDeleteJournalEntry}
                onOpenLesson={navigateToLesson}
                onNavigateLevel={navigateToLevel}
                onNavigateCertificates={() => navigateToPage('constancias')}
              />
            )}
          </div>
        )}

        {page === 'constancias' && (
          <CertificatesView
            userProfile={userProfile}
            enrollment={myEnrollment}
            certificates={certificates}
            onIssueCertificate={handleIssueCertificate}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {page === 'comunidad' && (
          <CommunityView
            profile={userProfile}
            posts={communityPosts}
            onCreatePost={handleCreatePost}
            onLikePost={handleLikePost}
            onRequireAuth={() => setAuthModalOpen(true)}
          />
        )}

        {page === 'acerca' && <AboutMentMarView />}
      </main>

      {/* Exact Footer Requested */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/aistudio/LOGOMENTMAR__2__57edb856.png"
                alt="MentMar"
                className="w-8 h-8 object-contain"
              />
              <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                MentMar
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Un ecosistema digital donde el talento juvenil se transforma en liderazgo tecnológico. Apaseo el Grande, Guanajuato · México.
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-300 pt-2">
              © 2026 MentMar. Todos los derechos reservados
            </p>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              PLATAFORMA
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToPage('panel')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Mi Panel
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToPage('cursos')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Cursos
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToPage('comunidad')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Comunidad
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToPage('acerca')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Acerca de nosotros
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              NIVELES
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLevel('computacion-basica')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Computación Básica
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLevel('programacion-web')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Programación y Web
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLevel('programacion-avanzada')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Programación Avanzada
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateToLevel('tecnologia-social')}
                  className="hover:text-sky-700 dark:hover:text-sky-400"
                >
                  Tecnología Social
                </button>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => showToast('Sesión iniciada correctamente.')}
      />

      <ProfileOnboardingModal
        open={Boolean(firebaseUser && needsOnboarding)}
        initialName={firebaseUser?.displayName || ''}
        email={firebaseUser?.email || ''}
        onSave={handleSaveOnboarding}
      />

      <TwoFactorChallengeModal
        open={needs2FAChallenge}
        secretBase32={userProfile?.twoFactorSecretEnc || ''}
        email={userProfile?.email || ''}
        onVerified={() => setTwoFactorVerifiedSession(true)}
        onSignOut={() => signOut(auth)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MentMarApp />
    </ErrorBoundary>
  );
}
