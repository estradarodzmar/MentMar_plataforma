import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'Ocurrió un error inesperado en la plataforma.',
    };
  }

  render() {
    if (this.state.hasError) {
      let friendly = this.state.message;
      if (friendly.startsWith('{') && friendly.includes('operationType')) {
        try {
          const parsed = JSON.parse(friendly);
          friendly = `Error de sincronización (${parsed.operationType} en ${parsed.path || 'datos'}): verifica tus permisos o sesión activa.`;
        } catch {
          // keep original
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-3 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Se interrumpió la vista actual
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {friendly}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Recargar plataforma
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
