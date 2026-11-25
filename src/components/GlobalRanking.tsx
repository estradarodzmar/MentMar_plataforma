import React from 'react';
import { ArrowRight, Award, Crown, Medal, Sparkles, Trophy } from 'lucide-react';
import type { LeaderboardEntry } from '../types/mentmar';

interface GlobalRankingProps {
  entries: LeaderboardEntry[];
  currentUid: string;
  currentDisplayName: string;
  currentAcademicGrade: string;
  currentPoints: number;
  currentCompletedCount: number;
  currentAverageScore: number;
  onStartPractice: () => void;
}

function getRankVisual(position: number) {
  if (position === 1) {
    return {
      rowClass:
        'border-amber-200 dark:border-amber-800/80 bg-amber-50/50 dark:bg-amber-950/20',
      badgeClass: 'bg-amber-500 text-white',
      barClass: 'bg-amber-500',
      icon: <Crown className="w-4 h-4" />,
    };
  }
  if (position === 2) {
    return {
      rowClass:
        'border-slate-300 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-800/50',
      badgeClass: 'bg-slate-500 text-white',
      barClass: 'bg-slate-500 dark:bg-slate-400',
      icon: <Medal className="w-4 h-4" />,
    };
  }
  if (position === 3) {
    return {
      rowClass:
        'border-orange-200 dark:border-orange-900/70 bg-orange-50/45 dark:bg-orange-950/20',
      badgeClass: 'bg-orange-600 text-white',
      barClass: 'bg-orange-500',
      icon: <Award className="w-4 h-4" />,
    };
  }
  return {
    rowClass:
      'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/35',
    badgeClass:
      'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    barClass: 'bg-sky-700 dark:bg-sky-500',
    icon: null,
  };
}

export function GlobalRanking({
  entries,
  currentUid,
  currentDisplayName,
  currentAcademicGrade,
  currentPoints,
  currentCompletedCount,
  currentAverageScore,
  onStartPractice,
}: GlobalRankingProps) {
  const sortedTop10 = [...entries]
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.completedCount !== a.completedCount) return b.completedCount - a.completedCount;
      return b.averageScore - a.averageScore;
    })
    .slice(0, 10);

  const leaderPoints = Math.max(150, sortedTop10[0]?.points ?? 0, currentPoints);
  const myTop10Index = sortedTop10.findIndex((entry) => entry.uid === currentUid);
  const tenthPlacePoints = sortedTop10.length === 10 ? sortedTop10[9].points : 0;
  const pointsToTop10 =
    myTop10Index === -1 && sortedTop10.length === 10
      ? Math.max(1, tenthPlacePoints - currentPoints + 1)
      : 0;

  return (
    <section className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-sky-700 dark:text-sky-400" />
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">
              Ranking Global · Top 10 Estudiantes
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Competencia sana en tiempo real. Cada lección completada otorga 50 pts base más tu puntaje de práctica (hasta 150 pts por lección).
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80">
          <div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {myTop10Index !== -1 ? `Tu lugar actual: #${myTop10Index + 1}` : 'Tu puntaje acumulado'}
            </p>
            <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
              {currentPoints.toLocaleString('es-MX')} pts
            </p>
          </div>
          <button
            type="button"
            onClick={onStartPractice}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-700 hover:bg-sky-800 text-white transition-colors whitespace-nowrap"
          >
            Sumar puntos
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {sortedTop10.length === 0 ? (
        <div className="py-8 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
          <Sparkles className="w-6 h-6 mx-auto text-sky-700 dark:text-sky-400" />
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            El Ranking Global está listo para despegar
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Completa una lección y resuelve su práctica para encabezar la tabla de posiciones de MentMar.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTop10.map((entry, idx) => {
            const rank = idx + 1;
            const isCurrentUser = entry.uid === currentUid;
            const visual = getRankVisual(rank);
            const barPct = Math.max(6, Math.min(100, Math.round((entry.points / leaderPoints) * 100)));

            return (
              <div
                key={entry.uid}
                className={`p-3.5 sm:px-4 rounded-xl border transition-colors ${
                  isCurrentUser
                    ? 'border-sky-400 dark:border-sky-600 bg-sky-50/75 dark:bg-sky-950/35'
                    : visual.rowClass
                }`}
              >
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-mono text-xs font-bold tabular-nums ${visual.badgeClass}`}
                      aria-label={`Posición ${rank}`}
                    >
                      {visual.icon ? visual.icon : `#${rank}`}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {entry.displayName}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-sky-700 text-white">
                            Tú
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {entry.academicGrade}
                        </span>
                      </div>

                      <div className="h-1.5 w-full max-w-sm rounded-full bg-slate-200/80 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isCurrentUser ? 'bg-sky-700 dark:bg-sky-400' : visual.barClass
                          }`}
                          style={{ width: `${barPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 ml-12 sm:ml-0">
                    <div className="text-right">
                      <p className="text-xs font-mono tabular-nums font-medium text-slate-700 dark:text-slate-300">
                        {entry.completedCount} lecc.
                      </p>
                      <p className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                        {entry.averageScore}% prom.
                      </p>
                    </div>

                    <div className="text-right min-w-[82px]">
                      <p className="text-sm sm:text-base font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
                        {entry.points.toLocaleString('es-MX')} pts
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                        Posición #{rank}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {myTop10Index === -1 && sortedTop10.length > 0 && (
        <div className="p-3.5 sm:px-4 rounded-xl border border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/40 dark:bg-sky-950/20 flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Tu progreso personal: {currentDisplayName} ({currentAcademicGrade})
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {currentCompletedCount} lecciones completadas · {currentAverageScore}% promedio
              {pointsToTop10 > 0
                ? ` · Te faltan ${pointsToTop10.toLocaleString('es-MX')} pts para entrar al Top 10.`
                : ' · Completa más lecciones para escalar posiciones.'}
            </p>
          </div>
          <span className="text-sm font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
            {currentPoints.toLocaleString('es-MX')} pts
          </span>
        </div>
      )}
    </section>
  );
}
