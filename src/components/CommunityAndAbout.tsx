import React, { useState } from 'react';
import { Heart, MapPin, MessageSquarePlus, Send, Sparkles } from 'lucide-react';
import { CURRICULUM_LEVELS } from '../data/curriculum';
import { FOUNDER_SEMBLANZA, MENTMAR_ABOUT } from '../data/semblanza';
import type { CommunityPostRecord, UserProfile } from '../types/mentmar';

interface CommunityViewProps {
  profile: UserProfile | null;
  posts: CommunityPostRecord[];
  onCreatePost: (title: string, body: string, levelTag: string) => Promise<void>;
  onLikePost: (post: CommunityPostRecord) => Promise<void>;
  onRequireAuth: () => void;
}

export function CommunityView({
  profile,
  posts,
  onCreatePost,
  onLikePost,
  onRequireAuth,
}: CommunityViewProps) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [levelTag, setLevelTag] = useState(CURRICULUM_LEVELS[0].shortTitle);
  const [filterTag, setFilterTag] = useState('Todos');
  const [submitting, setSubmitting] = useState(false);

  const visiblePosts =
    filterTag === 'Todos' ? posts : posts.filter((p) => p.levelTag === filterTag);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      onRequireAuth();
      return;
    }
    if (title.trim().length < 3 || body.trim().length < 4) return;
    setSubmitting(true);
    try {
      await onCreatePost(title.trim(), body.trim(), levelTag);
      setTitle('');
      setBody('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
          Comunidad MentMar
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
          Espacio seguro para compartir avances de proyectos integradores, dudas técnicas y experiencias entre estudiantes y docentes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form
          onSubmit={handleSubmit}
          className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 h-fit"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            Compartir con la comunidad
          </h3>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Línea curricular
            <select
              value={levelTag}
              onChange={(e) => setLevelTag(e.target.value)}
              className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            >
              {CURRICULUM_LEVELS.map((l) => (
                <option key={l.id} value={l.shortTitle}>
                  {l.shortTitle}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Título de tu publicación
            <input
              type="text"
              required
              minLength={3}
              maxLength={160}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Mi primer proyecto en Python y Arduino"
              className="mt-1 w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            />
          </label>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Mensaje o aprendizaje
            <textarea
              rows={4}
              required
              minLength={4}
              maxLength={3000}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Comparte cómo resolviste un reto o qué herramienta te ayudó..."
              className="mt-1 w-full p-3 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium rounded-xl bg-sky-700 text-white hover:bg-sky-800 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            {profile ? (submitting ? 'Publicando...' : 'Publicar aporte') : 'Inicia sesión para publicar'}
          </button>
        </form>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap gap-1.5">
            {['Todos', ...CURRICULUM_LEVELS.map((l) => l.shortTitle)].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setFilterTag(tag)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  filterTag === tag
                    ? 'bg-sky-700 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {visiblePosts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
              <Sparkles className="w-7 h-7 mx-auto text-sky-700 dark:text-sky-400" />
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Sé la primera persona en compartir en esta categoría
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparte tus proyectos de computación, desarrollo web, finanzas o impacto social.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {visiblePosts.map((post) => (
                <article
                  key={post.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {post.authorName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{post.authorRole === 'teacher' ? 'Docente' : 'Alumno'}</span>
                      <span aria-hidden="true">·</span>
                      <span>{post.academicGrade}</span>
                    </div>
                    <span className="text-sky-700 dark:text-sky-400 font-medium">
                      {post.levelTag}
                    </span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {post.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                    {post.body}
                  </p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => (profile ? onLikePost(post) : onRequireAuth())}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-400"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="font-mono tabular-nums">{post.likesCount}</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AboutMentMarView() {
  return (
    <div className="space-y-16">
      {/* PARTE 1: MISIÓN, VISIÓN Y VALORES DE MENTMAR */}
      <section className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-sky-700 dark:text-sky-400 font-medium">
              <MapPin className="w-4 h-4" />
              <span>Acerca de MentMar · {MENTMAR_ABOUT.location}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-900 dark:text-slate-100 text-balance leading-tight">
              {MENTMAR_ABOUT.headline}
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
              {MENTMAR_ABOUT.summary}
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center gap-3">
              <img
                src="/assets/aistudio/LOGOMENTMAR__2__57edb856.png"
                alt="Logotipo oficial de MentMar"
                className="w-44 h-44 object-contain"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {MENTMAR_ABOUT.philosophyTag}
              </span>
            </div>
          </div>
        </div>

        {/* Misión y Visión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400">
              {MENTMAR_ABOUT.missionTitle}
            </h3>
            <blockquote className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              “{MENTMAR_ABOUT.missionQuote}”
            </blockquote>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {MENTMAR_ABOUT.missionBody}
            </p>
          </div>

          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-400">
              {MENTMAR_ABOUT.visionTitle}
            </h3>
            <blockquote className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              “{MENTMAR_ABOUT.visionQuote}”
            </blockquote>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">
              “{MENTMAR_ABOUT.philosophyQuote}”
            </p>
          </div>
        </div>

        {/* Valores / Pilares Estratégicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Valores y Pilares Estratégicos de MentMar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {MENTMAR_ABOUT.pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <span className="text-xs font-mono text-sky-700 dark:text-sky-400">
                  0{idx + 1}. Compromiso Institucional
                </span>
                <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                  {pillar.title}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics & Collaborators */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {MENTMAR_ABOUT.metrics.map((m, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/25 border border-sky-200/80 dark:border-sky-900/60 space-y-1"
            >
              <p className="text-2xl font-bold font-mono tabular-nums text-sky-800 dark:text-sky-300">
                {m.value}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">{m.label}</p>
            </div>
          ))}
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Programas, Foros y Organizaciones Colaboradoras
          </p>
          <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
            {MENTMAR_ABOUT.collaborators.join('  ·  ')}
          </p>
        </div>
      </section>

      {/* PARTE 2: SEMBLANZA DE LA FUNDADORA */}
      <section className="pt-10 border-t border-slate-200 dark:border-slate-800 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-4">
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <img
                src={FOUNDER_SEMBLANZA.photoUrl}
                alt="Lic. Ing. Margarita Estrada Rodríguez — Fundadora de MentMar"
                className="w-full aspect-[4/5] object-cover object-top"
              />
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-0.5">
                <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold">
                  {FOUNDER_SEMBLANZA.role}
                </p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {FOUNDER_SEMBLANZA.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {FOUNDER_SEMBLANZA.origin}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Semblanza Profesional · Referente Latinoamericana en Ciencia y Tecnología
              </p>
              <h3 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-slate-100">
                {FOUNDER_SEMBLANZA.name}
              </h3>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                {FOUNDER_SEMBLANZA.intro}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {FOUNDER_SEMBLANZA.bioParagraph}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {FOUNDER_SEMBLANZA.regionalImpact}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {FOUNDER_SEMBLANZA.sections.map((sec, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {sec.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {sec.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
