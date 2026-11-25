import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import { GraduationCap, KeyRound, Mail, ShieldCheck, UserCheck, X } from 'lucide-react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { verifyTotpCode } from '../lib/cryptoSecurity';
import type { AcademicGrade, UserRole } from '../types/mentmar';

const ACADEMIC_GRADES: AcademicGrade[] = [
  'Primaria',
  'Secundaria',
  'Preparatoria / Bachillerato',
  'Universidad',
  'Posgrado / Docente',
];

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<'google' | 'email'>('google');
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo iniciar sesión con Google.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (displayName.trim()) {
          await updateProfile(cred.user, { displayName: displayName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess();
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes('operation-not-allowed')) {
        setErrorMsg(
          'El proveedor Correo/Contraseña debe habilitarse en Firebase Console (Authentication > Sign-in method). Puedes usar "Correo Google" de inmediato.'
        );
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Accede a MentMar
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inicia sesión con tu correo para guardar tu progreso, notas cifradas y constancias.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => {
              setTab('google');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              tab === 'google'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Correo Google (Recomendado)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('email');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-md font-medium transition-colors ${
              tab === 'email'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Correo y Contraseña
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
            {errorMsg}
          </div>
        )}

        {tab === 'google' ? (
          <div className="space-y-3">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium transition-colors disabled:opacity-60"
            >
              <Mail className="w-4 h-4" />
              {loading ? 'Conectando...' : 'Continuar con correo electrónico (Google)'}
            </button>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              Sincronización en tiempo real entre dispositivos · Compatible con 2FA
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                Nombre completo
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
                />
              </label>
            )}
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Correo electrónico
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </label>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
              Contraseña
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium transition-colors"
            >
              {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
            <button
              type="button"
              onClick={() => setIsRegister((v) => !v)}
              className="w-full text-xs text-sky-700 dark:text-sky-400 hover:underline"
            >
              {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿Primera vez? Regístrate aquí'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

interface OnboardingModalProps {
  open: boolean;
  initialName: string;
  email: string;
  onSave: (data: {
    displayName: string;
    role: UserRole;
    academicGrade: AcademicGrade;
    classroomCode: string;
  }) => Promise<void>;
}

export function ProfileOnboardingModal({
  open,
  initialName,
  email,
  onSave,
}: OnboardingModalProps) {
  const [displayName, setDisplayName] = useState(initialName || email.split('@')[0] || '');
  const [role, setRole] = useState<UserRole>('student');
  const [academicGrade, setAcademicGrade] = useState<AcademicGrade>('Preparatoria / Bachillerato');
  const [classroomCode, setClassroomCode] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayName.trim().length < 2) {
      setError('Ingresa tu nombre completo (mínimo 2 caracteres).');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave({
        displayName: displayName.trim(),
        role,
        academicGrade,
        classroomCode: classroomCode.trim().toUpperCase(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-400">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Completa tu perfil académico
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{email}</p>
          </div>
        </div>

        {error && (
          <p className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-200">
            {error}
          </p>
        )}

        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          Nombre completo (aparecerá en tus constancias)
          <input
            type="text"
            required
            maxLength={120}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </label>

        <div className="space-y-2">
          <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Selecciona tu perfil en MentMar
          </span>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                role === 'student'
                  ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <p className="text-sm font-semibold">Soy Alumno</p>
              <p className="text-xs opacity-80 mt-0.5">
                Avanza por niveles, usa simuladores y obtén constancias.
              </p>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`p-3.5 rounded-xl border text-left transition-colors ${
                role === 'teacher'
                  ? 'border-sky-600 bg-sky-50/70 dark:bg-sky-950/40 text-sky-900 dark:text-sky-100'
                  : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              <p className="text-sm font-semibold">Soy Docente</p>
              <p className="text-xs opacity-80 mt-0.5">
                Sube materiales, monitorea alumnos en tiempo real y exporta reportes.
              </p>
            </button>
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          Grado académico
          <select
            value={academicGrade}
            onChange={(e) => setAcademicGrade(e.target.value as AcademicGrade)}
            className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          >
            {ACADEMIC_GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>

        {role === 'student' && (
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Código de grupo de tu docente (opcional)
            <input
              type="text"
              maxLength={40}
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value)}
              placeholder="Ej. MENTMAR-2026"
              className="mt-1.5 w-full px-3 py-2 text-sm font-mono uppercase rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium transition-colors"
        >
          <UserCheck className="w-4 h-4" />
          {saving ? 'Guardando perfil...' : 'Ingresar a la plataforma'}
        </button>
      </form>
    </div>
  );
}

interface TwoFactorChallengeProps {
  open: boolean;
  secretBase32: string;
  email: string;
  onVerified: () => void;
  onSignOut: () => void;
}

export function TwoFactorChallengeModal({
  open,
  secretBase32,
  email,
  onVerified,
  onSignOut,
}: TwoFactorChallengeProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  if (!open) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setChecking(true);
    setError('');
    const ok = await verifyTotpCode(secretBase32, code);
    setChecking(false);
    if (ok) {
      onVerified();
    } else {
      setError('Código de 6 dígitos incorrecto o expirado. Verifica tu app autenticadora.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
      <form
        onSubmit={handleVerify}
        className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-4"
      >
        <div className="flex items-center gap-3 text-sky-700 dark:text-sky-400">
          <ShieldCheck className="w-6 h-6" />
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Verificación en dos pasos (2FA)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
              {email}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Ingresa el código temporal de 6 dígitos generado por tu aplicación autenticadora.
        </p>
        {error && (
          <p className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-xs text-rose-700 dark:text-rose-200">
            {error}
          </p>
        )}
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          placeholder="000000"
          className="w-full text-center tracking-[0.4em] text-xl font-mono py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        />
        <button
          type="submit"
          disabled={checking || code.length !== 6}
          className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-sm font-medium disabled:opacity-50"
        >
          <KeyRound className="w-4 h-4" />
          {checking ? 'Verificando...' : 'Verificar acceso'}
        </button>
        <button
          type="button"
          onClick={onSignOut}
          className="w-full text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          Cerrar sesión
        </button>
      </form>
    </div>
  );
}
