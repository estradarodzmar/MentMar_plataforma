import type { EnrollmentRecord, LessonProgressRecord } from '../types/mentmar';

export const LESSON_BASE_POINTS = 50;
export const MAX_POINTS_PER_LESSON = 150;

export interface StudentLeaderboardStats {
  points: number;
  completedCount: number;
  averageScore: number;
}

export function computeStudentLeaderboardStats(
  enrollment: EnrollmentRecord | null,
  lessonProgressMap: Record<string, LessonProgressRecord>
): StudentLeaderboardStats {
  const completedItems = Object.values(lessonProgressMap).filter(
    (item) => item.status === 'completed'
  );

  if (completedItems.length > 0) {
    const cappedCount = Math.min(500, completedItems.length);
    const itemsSlice = completedItems.slice(0, cappedCount);
    const points = itemsSlice.reduce((sum, item) => {
      const clampedScore = Math.max(0, Math.min(100, Math.round(item.score || 0)));
      return sum + LESSON_BASE_POINTS + clampedScore;
    }, 0);
    const totalScore = itemsSlice.reduce(
      (sum, item) => sum + Math.max(0, Math.min(100, Math.round(item.score || 0))),
      0
    );
    const averageScore = Math.round(totalScore / itemsSlice.length);

    return {
      points: Math.min(points, cappedCount * MAX_POINTS_PER_LESSON),
      completedCount: cappedCount,
      averageScore,
    };
  }

  if (enrollment && enrollment.completedCount > 0) {
    const completedCount = Math.min(500, Math.max(0, Math.round(enrollment.completedCount)));
    const averageScore = Math.max(0, Math.min(100, Math.round(enrollment.averageScore || 0)));
    const points = Math.min(
      completedCount * MAX_POINTS_PER_LESSON,
      completedCount * (LESSON_BASE_POINTS + averageScore)
    );

    return {
      points,
      completedCount,
      averageScore,
    };
  }

  return {
    points: 0,
    completedCount: 0,
    averageScore: 0,
  };
}
