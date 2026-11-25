import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Compass,
  FolderPlus,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  TrendingUp,
} from 'lucide-react';
import type { CurriculumLesson, SimulatorKind } from '../types/mentmar';

function getAutodidactChallenge(lesson?: CurriculumLesson): string {
  if (!lesson) return 'Modifica los parámetros en vivo para comprobar el comportamiento del sistema.';
  const lower = lesson.title.toLowerCase();
  if (lesson.simulatorKind === 'computo') {
    if (lesson.moduleId === 'm2' || lower.includes('https') || lower.includes('phishing') || lower.includes('contraseñ')) {
      return 'Prueba direcciones HTTP sospechosas vs. HTTPS y evalúa la fortaleza de una contraseña propia.';
    }
    if (lesson.moduleId === 'm3' || lesson.moduleId === 'm4' || lower.includes('word') || lower.includes('documento')) {
      return 'Organiza tu jerarquía de carpetas del proyecto y valida la estructura de entrega formal.';
    }
    return 'Crea una estructura de carpetas ordenada por módulo y verifica enlaces seguros antes de guardar archivos.';
  }
  if (lesson.simulatorKind === 'excel') {
    if (lower.includes('si') || lower.includes('contar.si') || lower.includes('sumar.si')) {
      return 'Edita los montos de la tabla y prueba las fórmulas condicionales =SI(...), =CONTAR.SI(...) y =SUMAR.SI(...).';
    }
    if (lower.includes('promedio') || lower.includes('max') || lower.includes('min') || lower.includes('métricas')) {
      return 'Cambia los valores numéricos de la columna B y compara el efecto inmediato en =PROMEDIO(B1:B4) y =MAX(B1:B4).';
    }
    return 'Modifica los conceptos y montos de la hoja de cálculo y valida en tiempo real el resultado de la fórmula activa.';
  }
  if (lesson.simulatorKind === 'web') {
    if (lower.includes('sql') || lower.includes('base de datos')) {
      return 'Ejecuta la consulta interactiva del ejemplo o ajusta el código HTML/JS para filtrar registros en vivo.';
    }
    if (lower.includes('python') || lower.includes('machine learning') || lower.includes('regresión')) {
      return 'Prueba los datos de entrada en el simulador interactivo y observa la salida calculada paso a paso.';
    }
    if (lower.includes('flexbox') || lower.includes('css')) {
      return 'Modifica propiedades como gap, padding o background en el editor para ver el cambio instantáneo.';
    }
    return 'Edita el código del tema en el panel izquierdo y comprueba el resultado al instante en la vista previa.';
  }
  if (lesson.simulatorKind === 'iot') {
    return 'Ajusta el pin digital, el ciclo PWM y el sensor ultrasónico para observar cómo cambia el Monitor Serie.';
  }
  if (lesson.simulatorKind === 'finance') {
    return 'Ajusta tu ingreso mensual, porcentaje de ahorro (meta mínima 20%), rendimiento anual y años para comparar el efecto compuesto.';
  }
  if (lesson.simulatorKind === 'time') {
    return 'Inicia un bloque Pomodoro de 25 minutos y clasifica tus 3 actividades prioritarias en la Matriz de Eisenhower.';
  }
  return 'Define la problemática real, la solución propuesta y ajusta los beneficiarios para proyectar el impacto anual.';
}

// 1. Simulador de Computación Básica (Seguridad HTTPS + Contraseñas + Directorios)
function ComputoSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const lower = (lesson?.title || '').toLowerCase();
  const isSecurityTopic =
    lesson?.moduleId === 'm2' ||
    lower.includes('seguridad') ||
    lower.includes('https') ||
    lower.includes('phishing') ||
    lower.includes('contraseñ');

  const [urlInput, setUrlInput] = useState('https://mentmar.edu.mx/campus');
  const [passwordTest, setPasswordTest] = useState('MentMar#2026!');
  const [folders, setFolders] = useState<string[]>([
    '01_Documentos_Word',
    '02_Hojas_Excel',
    '03_Presentaciones',
  ]);
  const [newFolder, setNewFolder] = useState('');

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    if (lesson?.moduleId === 'm2' || t.includes('phishing') || t.includes('https')) {
      setUrlInput('http://login-verify.premio-gratis.xyz');
      setFolders(['Evidencias_Seguridad', 'Respaldo_2FA', 'Fuentes_Verificadas']);
    } else if (lesson?.moduleId === 'm3' || lesson?.moduleId === 'm4' || t.includes('word')) {
      setUrlInput('https://mentmar.edu.mx/guias-word');
      setFolders(['Cartas_Formales', 'Informes_APA', 'Plantillas_DOCX']);
    } else if (lesson?.moduleId === 'm7' || lesson?.moduleId === 'm8' || t.includes('powerpoint')) {
      setUrlInput('https://mentmar.edu.mx/oratoria-visual');
      setFolders(['Diapositivas_Pitch', 'Recursos_PNG', 'Exportacion_PDF']);
    } else if (lesson?.moduleId === 'm9' || t.includes('formulario')) {
      setUrlInput('https://forms.mentmar.edu.mx/encuesta');
      setFolders(['Encuestas_2026', 'Respuestas_CSV', 'Reportes_Eje5']);
    } else if (lesson?.moduleId === 'm11' || t.includes('correo') || t.includes('nube')) {
      setUrlInput('https://drive.mentmar.edu.mx/compartido');
      setFolders(['Correos_Institucionales', 'Carpeta_Nube_Lectura', 'Minutas_Teams']);
    } else {
      setUrlInput('https://mentmar.edu.mx/campus');
      setFolders(['01_Sistema_Operativo', '02_Practicas_Clase', '03_Respaldo_ZIP']);
    }
  }, [lesson?.id, lesson?.moduleId, lesson?.title]);

  const isHttps = urlInput.trim().toLowerCase().startsWith('https://');
  const hasSuspiciousChars = /@|login-verify|free-prize|premio-gratis|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(
    urlInput.toLowerCase()
  );

  const pwdScore = useMemo(() => {
    let score = 0;
    if (passwordTest.length >= 12) score += 1;
    if (/[A-Z]/.test(passwordTest) && /[a-z]/.test(passwordTest)) score += 1;
    if (/\d/.test(passwordTest)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordTest)) score += 1;
    return score;
  }, [passwordTest]);

  const handleAddFolder = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = newFolder.trim().replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚ ]/g, '');
    if (!cleaned || folders.length >= 8) return;
    setFolders((prev) => [...prev, cleaned]);
    setNewFolder('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {isSecurityTopic
              ? 'Inspector de URL, SSL y Contraseña Segura'
              : 'Inspector de Enlaces Seguros y Certificados'}
          </h4>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {lesson?.moduleId?.toUpperCase() || 'Módulo'}
          </span>
        </div>

        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Prueba una dirección web (ej. http://banco-falso.xyz o https://mentmar.edu.mx)
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="mt-1.5 w-full px-3 py-2 text-sm font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
        </label>

        <div
          className={`p-3.5 rounded-lg border flex items-start gap-3 ${
            isHttps && !hasSuspiciousChars
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
          }`}
        >
          {isHttps && !hasSuspiciousChars ? (
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          )}
          <div className="text-xs space-y-1">
            <p className="font-semibold">
              {isHttps && !hasSuspiciousChars
                ? 'Conexión cifrada HTTPS verificada'
                : 'Alerta de seguridad: enlace sin cifrado o sospechoso'}
            </p>
            <p className="opacity-85">
              {isHttps && !hasSuspiciousChars
                ? 'El protocolo HTTPS protege tus contraseñas y formularios en tránsito mediante TLS.'
                : 'Nunca ingreses contraseñas ni datos bancarios en sitios HTTP o dominios con señales de phishing.'}
            </p>
          </div>
        </div>

        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 pt-1">
          Evaluador de contraseña robusta ({pwdScore}/4 criterios)
          <input
            type="text"
            value={passwordTest}
            onChange={(e) => setPasswordTest(e.target.value)}
            className="mt-1.5 w-full px-3 py-1.5 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
          <span className="block mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            {pwdScore >= 4
              ? '● Fortaleza alta: cumple longitud (12+), mayúsculas/minúsculas, números y símbolos.'
              : '▲ Mejorable: agrega símbolos, números y al menos 12 caracteres.'}
          </span>
        </label>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Organizador Jerárquico de Carpetas
          </h4>
          <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
            {folders.length}/8 carpetas
          </span>
        </div>
        <form onSubmit={handleAddFolder} className="flex gap-2">
          <input
            type="text"
            value={newFolder}
            onChange={(e) => setNewFolder(e.target.value)}
            placeholder="Nueva carpeta (ej. Evidencias_2026)"
            className="flex-1 px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-600"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors whitespace-nowrap shrink-0"
          >
            <FolderPlus className="w-4 h-4" />
            Crear
          </button>
        </form>
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {folders.map((folder, i) => (
            <div
              key={`${folder}-${i}`}
              className="flex items-center justify-between px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <span className="font-mono text-slate-700 dark:text-slate-200">
                /Mi_Equipo/{folder}
              </span>
              <button
                type="button"
                onClick={() => setFolders((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-slate-400 hover:text-rose-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Simulador de Hoja de Cálculo Excel (adaptado al tema actual)
function ExcelSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const [rows, setRows] = useState([
    { item: 'Internet y datos', amount: 450 },
    { item: 'Material de estudio', amount: 320 },
    { item: 'Transporte escolar', amount: 380 },
    { item: 'Fondo de ahorro', amount: 500 },
  ]);
  const [formula, setFormula] = useState('=SUMA(B1:B4)');

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    if (t.includes('encuesta') || t.includes('métricas') || lesson?.moduleId === 'm10') {
      setRows([
        { item: 'Satisfacción Módulo 1 (1–100)', amount: 94 },
        { item: 'Satisfacción Módulo 2 (1–100)', amount: 88 },
        { item: 'Satisfacción Módulo 3 (1–100)', amount: 96 },
        { item: 'Satisfacción Módulo 4 (1–100)', amount: 90 },
      ]);
      setFormula('=PROMEDIO(B1:B4)');
    } else if (t.includes('si') || t.includes('contar.si') || t.includes('sumar.si')) {
      setRows([
        { item: 'Licencia software educativo', amount: 650 },
        { item: 'Componentes Arduino', amount: 480 },
        { item: 'Impresión de prototipo', amount: 220 },
        { item: 'Dominio web proyecto', amount: 390 },
      ]);
      setFormula('=SUMAR.SI(B1:B4,">400")');
    } else if (t.includes('max') || t.includes('min')) {
      setRows([
        { item: 'Semana 1 (Ventas)', amount: 1200 },
        { item: 'Semana 2 (Ventas)', amount: 1850 },
        { item: 'Semana 3 (Ventas)', amount: 980 },
        { item: 'Semana 4 (Ventas)', amount: 2140 },
      ]);
      setFormula('=MAX(B1:B4)');
    } else if (t.includes('promedio')) {
      setRows([
        { item: 'Examen Parcial 1', amount: 86 },
        { item: 'Práctica de Laboratorio', amount: 95 },
        { item: 'Proyecto Integrador', amount: 92 },
        { item: 'Exposición Final', amount: 91 },
      ]);
      setFormula('=PROMEDIO(B1:B4)');
    } else {
      setRows([
        { item: 'Internet y datos', amount: 450 },
        { item: 'Material de estudio', amount: 320 },
        { item: 'Transporte escolar', amount: 380 },
        { item: 'Fondo de ahorro', amount: 500 },
      ]);
      setFormula('=SUMA(B1:B4)');
    }
  }, [lesson?.id, lesson?.moduleId, lesson?.title]);

  const evaluatedResult = useMemo(() => {
    const clean = formula.trim().toUpperCase();
    const nums = rows.map((r) => Number(r.amount) || 0);
    const sum = nums.reduce((a, b) => a + b, 0);
    const avg = nums.length ? sum / nums.length : 0;
    const max = Math.max(...nums);
    const min = Math.min(...nums);

    if (clean === '=SUMA(B1:B4)') return { value: `${sum.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, note: 'Suma total de B1 a B4' };
    if (clean === '=PROMEDIO(B1:B4)') return { value: `${avg.toFixed(2)}`, note: 'Promedio aritmético de B1 a B4' };
    if (clean === '=MAX(B1:B4)') return { value: `${max.toLocaleString('es-MX')}`, note: 'Valor máximo del rango' };
    if (clean === '=MIN(B1:B4)') return { value: `${min.toLocaleString('es-MX')}`, note: 'Valor mínimo del rango' };
    if (clean.startsWith('=SUMAR.SI(')) {
      const filteredSum = nums.filter((n) => n > 400).reduce((a, b) => a + b, 0);
      return { value: `${filteredSum.toLocaleString('es-MX')}`, note: 'Suma de celdas > 400' };
    }
    if (clean.startsWith('=CONTAR.SI(')) {
      const count = nums.filter((n) => n > 400).length;
      return { value: `${count} registros`, note: 'Conteo de celdas > 400' };
    }
    if (clean.startsWith('=SI(')) {
      return {
        value: sum > 1500 ? 'Meta alcanzada' : 'Dentro de rango',
        note: 'Evaluación condicional SI',
      };
    }
    return { value: 'Prueba las fórmulas sugeridas arriba', note: 'Sintaxis disponible' };
  }, [formula, rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-mono font-semibold px-2.5 py-1.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
          fx
        </span>
        <input
          type="text"
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-1.5 text-sm font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
        />
        {[
          '=SUMA(B1:B4)',
          '=PROMEDIO(B1:B4)',
          '=MAX(B1:B4)',
          '=SUMAR.SI(B1:B4,">400")',
          '=CONTAR.SI(B1:B4,">400")',
          '=SI(B1>400)',
        ].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setFormula(preset)}
            className={`px-2.5 py-1.5 text-xs font-mono rounded-md border transition-colors ${
              formula === preset
                ? 'bg-sky-700 text-white border-sky-700'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-sky-500'
            }`}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 font-mono w-12">Fila</th>
              <th className="px-3 py-2">Columna A (Concepto)</th>
              <th className="px-3 py-2 text-right">Columna B (Valor numérico)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 font-mono text-xs text-slate-400">{idx + 1}</td>
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.item}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, item: val } : r)));
                    }}
                    className="w-full bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none"
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    value={row.amount}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, amount: val } : r)));
                    }}
                    className="w-28 text-right font-mono tabular-nums bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </td>
              </tr>
            ))}
            <tr className="bg-sky-50/70 dark:bg-sky-950/30 font-semibold">
              <td className="px-3 py-2.5 font-mono text-xs text-sky-700 dark:text-sky-400">B5</td>
              <td className="px-3 py-2.5 text-slate-800 dark:text-slate-200">
                Resultado ({evaluatedResult.note})
              </td>
              <td className="px-3 py-2.5 text-right font-mono tabular-nums text-sky-800 dark:text-sky-300">
                {evaluatedResult.value}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 3. Simulador de Programación y Web en vivo (alineado al lenguaje/tema de la lección)
function getTopicStarterCode(lesson?: CurriculumLesson): { filename: string; code: string } {
  const title = (lesson?.title || '').toLowerCase();
  const mod = lesson?.moduleId || '';

  if (mod === 'pw-m1' || mod === 'pw-m2' || mod === 'tal-m4' || title.includes('algoritmo') || title.includes('pseint')) {
    return {
      filename: 'algoritmo_logica.html',
      code: `<div style="font-family: sans-serif; padding: 16px;">
  <h3 style="color: #0369a1; margin: 0 0 8px;">Simulador de Lógica Algorítmica</h3>
  <p style="font-size: 13px; color: #334155;">Entrada: calificación = <input id="cal" type="number" value="85" style="width:60px; padding:4px;" />
  <button onclick="const c=Number(document.getElementById('cal').value); document.getElementById('out').textContent = c>=70 ? 'SI c>=70 ENTONCES: Aprobado ('+c+')' : 'SINO: Requiere repaso ('+c+')';" style="background:#0369a1;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Ejecutar Si/Entonces</button></p>
  <pre id="out" style="background:#0f172a;color:#38bdf8;padding:10px;border-radius:8px;font-size:12px;">Presiona Ejecutar para evaluar la condición.</pre>
</div>`,
    };
  }
  if (mod === 'pw-m4' || title.includes('css') || title.includes('flexbox') || title.includes('box model')) {
    return {
      filename: 'estilos_flexbox.html',
      code: `<style>
  .contenedor { display: flex; gap: 12px; padding: 16px; font-family: sans-serif; }
  .tarjeta { flex: 1; padding: 14px; border-radius: 10px; border: 1px solid #bae6fd; background: #f0f9ff; }
</style>
<div class="contenedor">
  <div class="tarjeta"><strong>Bloque Flexbox 1</strong><p style="font-size:12px;">Edita gap o padding en &lt;style&gt;.</p></div>
  <div class="tarjeta"><strong>Bloque Flexbox 2</strong><p style="font-size:12px;">Diseño adaptable automático.</p></div>
</div>`,
    };
  }
  if (mod === 'pw-m5' || title.includes('javascript') || title.includes('dom') || title.includes('evento')) {
    return {
      filename: 'interactividad_dom.html',
      code: `<div style="font-family: sans-serif; padding: 16px;">
  <h3 style="color:#0369a1;margin:0 0 8px;">Manipulación del DOM en JavaScript</h3>
  <p style="font-size:13px;">Contador de clics: <strong id="cnt">0</strong></p>
  <button id="btn" style="background:#0369a1;color:#fff;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;">Incrementar con EventListener</button>
</div>
<script>
  let n = 0;
  document.getElementById('btn').addEventListener('click', () => {
    n += 1;
    document.getElementById('cnt').textContent = n;
  });
</script>`,
    };
  }
  if (mod === 'pw-m6' || title.includes('python')) {
    return {
      filename: 'practica_python.html',
      code: `<div style="font-family: sans-serif; padding: 16px;">
  <h3 style="color:#0369a1;margin:0 0 8px;">Práctica Interactiva de Python</h3>
  <pre style="background:#0f172a;color:#e2e8f0;padding:10px;border-radius:8px;font-size:12px;">def calcular_promedio(notas):
    return sum(notas) / len(notas)</pre>
  <button onclick="const r=(90+85+95)/3; document.getElementById('py').textContent='Salida >>> Promedio: ' + r.toFixed(1);" style="background:#059669;color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;">Simular ejecución Python</button>
  <p id="py" style="font-family:monospace;font-size:12px;color:#0369a1;margin-top:8px;"></p>
</div>`,
    };
  }
  if (mod === 'pa-m4' || title.includes('sql') || title.includes('base de datos')) {
    return {
      filename: 'consulta_sql.html',
      code: `<div style="font-family: sans-serif; padding: 14px;">
  <h3 style="color:#0369a1;margin:0 0 6px;">Simulador de Consulta SQL</h3>
  <code style="display:block;background:#0f172a;color:#38bdf8;padding:8px;border-radius:6px;font-size:12px;margin-bottom:8px;">SELECT nombre, promedio FROM alumnos WHERE promedio >= 85;</code>
  <button onclick="document.getElementById('sqlres').innerHTML='<li>Ana López — 94%</li><li>Carlos Ruiz — 89%</li>';" style="background:#0369a1;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Ejecutar SELECT</button>
  <ul id="sqlres" style="font-size:13px;color:#1e293b;margin-top:8px;"></ul>
</div>`,
    };
  }
  if (mod === 'pa-m6' || title.includes('machine learning') || title.includes('regresión')) {
    return {
      filename: 'modelo_ml.html',
      code: `<div style="font-family: sans-serif; padding: 14px;">
  <h3 style="color:#0369a1;margin:0 0 6px;">Predictor Lineal (y = 8x + 42)</h3>
  <label style="font-size:13px;">Horas de estudio (x): <input id="hrs" type="number" value="5" style="width:55px;padding:4px;" /></label>
  <button onclick="const x=Number(document.getElementById('hrs').value); const y=Math.min(100,8*x+42); document.getElementById('pred').textContent='Calificación predicha (y): '+y+'%';" style="background:#0369a1;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Predecir</button>
  <p id="pred" style="font-weight:600;color:#059669;margin-top:8px;font-size:13px;"></p>
</div>`,
    };
  }
  if (mod === 'pa-m1' || mod === 'pa-m2' || mod === 'pa-m3') {
    return {
      filename: 'poo_clases.html',
      code: `<div style="font-family: sans-serif; padding: 14px;">
  <h3 style="color:#0369a1;margin:0 0 6px;">Simulador de Clases y Objetos (POO)</h3>
  <pre style="background:#0f172a;color:#e2e8f0;padding:8px;border-radius:6px;font-size:12px;">class Estudiante { nombre; grado; completarLeccion(); }</pre>
  <button onclick="const est={nombre:'Sofía',nivel:'Avanzado',puntos:95}; document.getElementById('poo').textContent='Instancia creada: '+JSON.stringify(est);" style="background:#0369a1;color:#fff;border:none;padding:6px 12px;border-radius:6px;cursor:pointer;">Instanciar Objeto</button>
  <p id="poo" style="font-family:monospace;font-size:12px;color:#0369a1;margin-top:8px;"></p>
</div>`,
    };
  }
  return {
    filename: 'index.html',
    code: `<div style="font-family: sans-serif; padding: 16px;">
  <h2 style="color: #0369a1; margin: 0 0 8px;">${lesson?.title || 'Mi Primer Prototipo MentMar'}</h2>
  <p style="color: #334155; font-size: 14px;">Edita esta estructura HTML5 semántica o presiona el botón de prueba.</p>
  <button onclick="document.getElementById('msg').textContent='¡Ejecución verificada correctamente!'" style="background: #0369a1; color: white; border: none; padding: 8px 14px; border-radius: 6px; cursor: pointer;">
    Probar Interactividad
  </button>
  <p id="msg" style="margin-top: 10px; font-weight: 600; color: #059669;"></p>
</div>`,
  };
}

function WebCodeSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const starter = useMemo(() => getTopicStarterCode(lesson), [lesson]);
  const [code, setCode] = useState(starter.code);

  useEffect(() => {
    setCode(starter.code);
  }, [starter]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="font-mono flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> {starter.filename}
          </span>
          <button
            type="button"
            onClick={() => setCode(starter.code)}
            className="text-sky-700 dark:text-sky-400 hover:underline font-medium"
          >
            Restaurar plantilla del tema
          </button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={9}
          spellCheck={false}
          className="w-full p-3 text-xs font-mono rounded-xl bg-slate-900 text-slate-100 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>
      <div className="space-y-2">
        <span className="block text-xs text-slate-500 dark:text-slate-400 font-medium">
          Vista Previa en Tiempo Real
        </span>
        <iframe
          title="Vista previa código web"
          srcDoc={code}
          sandbox="allow-scripts"
          className="w-full h-56 rounded-xl bg-white border border-slate-200 dark:border-slate-700"
        />
      </div>
    </div>
  );
}

// 4. Simulador IoT Arduino
function IotArduinoSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const [ledOn, setLedOn] = useState(true);
  const [pwmValue, setPwmValue] = useState(180);
  const [distanceCm, setDistanceCm] = useState(42);

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    if (t.includes('pwm')) {
      setLedOn(true);
      setPwmValue(128);
      setDistanceCm(55);
    } else if (t.includes('ultrasonido') || t.includes('sensor')) {
      setLedOn(true);
      setPwmValue(220);
      setDistanceCm(18);
    } else {
      setLedOn(true);
      setPwmValue(180);
      setDistanceCm(42);
    }
  }, [lesson?.id, lesson?.title]);

  const alertActive = distanceCm < 25;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-sky-400">Arduino UNO · Simulador de Pines</span>
          <span className="text-xs font-mono text-slate-400">5V / GND</span>
        </div>

        <div className="flex items-center gap-5 p-4 rounded-lg bg-slate-950 border border-slate-800">
          <div
            className="w-12 h-12 rounded-full border-2 border-slate-700 transition-all duration-200 flex items-center justify-center"
            style={{
              backgroundColor: ledOn
                ? `rgba(14, 165, 233, ${Math.max(0.15, pwmValue / 255)})`
                : '#1e293b',
              boxShadow: ledOn
                ? `0 0 ${Math.round((pwmValue / 255) * 28)}px rgba(56, 189, 248, 0.85)`
                : 'none',
            }}
          >
            <span className="text-[10px] font-mono font-bold text-white">D13</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              LED Digital / PWM: {ledOn ? `ENCENDIDO (${pwmValue}/255)` : 'APAGADO'}
            </p>
            <p className="text-xs text-slate-400 font-mono">
              analogWrite(9, {ledOn ? pwmValue : 0});
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300">Pin Digital 13</span>
            <button
              type="button"
              onClick={() => setLedOn((v) => !v)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                ledOn ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300'
              }`}
            >
              {ledOn ? 'HIGH (5V)' : 'LOW (0V)'}
            </button>
          </div>

          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Ciclo de Trabajo PWM (Pin 9)</span>
              <span className="font-mono tabular-nums">{pwmValue} / 255</span>
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={pwmValue}
              onChange={(e) => setPwmValue(Number(e.target.value))}
              className="w-full accent-sky-500"
            />
          </label>

          <label className="block space-y-1">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Sensor Ultrasónico HC-SR04 (Distancia)</span>
              <span className="font-mono tabular-nums">{distanceCm} cm</span>
            </div>
            <input
              type="range"
              min={5}
              max={200}
              value={distanceCm}
              onChange={(e) => setDistanceCm(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
          </label>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Monitor Serie (9600 baudios)
          </h4>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              alertActive
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}
          >
            {alertActive ? '▲ Proximidad Crítica' : '● Lectura Nominal'}
          </span>
        </div>
        <pre className="p-3.5 rounded-lg bg-slate-900 text-emerald-400 text-xs font-mono leading-relaxed overflow-x-auto">
{`void loop() {
  long duracion = pulseIn(ECHO, HIGH);
  int distancia = ${distanceCm}; // cm medidos
  analogWrite(9, ${ledOn ? pwmValue : 0});
  Serial.println("Distancia: ${distanceCm} cm | Estado: ${alertActive ? 'ALERTA' : 'OK'}");
}`}
        </pre>
      </div>
    </div>
  );
}

// 5. Simulador de Tecnología Social y Oratoria (Canvas de Impacto + Pitch)
function SocialCanvasSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const [problem, setProblem] = useState('Brecha de acceso a mentoría STEM en secundaria rural');
  const [beneficiaries, setBeneficiaries] = useState(120);
  const [solution, setSolution] = useState('Clubes semanales con guías offline y mentoría local');

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    if (t.includes('pitch') || t.includes('oratoria') || t.includes('storytelling')) {
      setProblem('Jóvenes con ideas tecnológicas sólidas que no logran comunicarlas en 60 segundos');
      setSolution('Narrativa de 3 actos: Dolor real + Demostración en vivo + Impacto medible');
      setBeneficiaries(250);
    } else if (t.includes('inclusión') || t.includes('género') || t.includes('empatía')) {
      setProblem('Baja participación de mujeres y jóvenes de comunidades rurales en programación');
      setSolution('Mentoría entre pares con proyectos aplicados a problemáticas de su comunidad');
      setBeneficiaries(180);
    } else {
      setProblem('Brecha de acceso a mentoría STEM en secundaria rural');
      setSolution('Clubes semanales con guías offline y mentoría local');
      setBeneficiaries(120);
    }
  }, [lesson?.id, lesson?.title]);

  const estimatedAnnualHours = beneficiaries * 24;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Constructor de Canvas Social y Propuesta de Valor
        </h4>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Problemática Comunitaria Detectada
          <input
            type="text"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Solución Tecnológica Propuesta
          <input
            type="text"
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            className="mt-1 w-full px-3 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
          />
        </label>
        <label className="block text-xs font-medium text-slate-600 dark:text-slate-400">
          Jóvenes Beneficiados Estimados ({beneficiaries})
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={beneficiaries}
            onChange={(e) => setBeneficiaries(Number(e.target.value))}
            className="mt-2 w-full accent-sky-600"
          />
        </label>
      </div>
      <div className="p-5 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs font-medium text-sky-800 dark:text-sky-300">
            Proyección de Impacto (KPIs)
          </p>
          <p className="mt-2 text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {estimatedAnnualHours.toLocaleString('es-MX')} h
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            horas formativas anuales proyectadas para {beneficiaries} participantes.
          </p>
        </div>
        <div className="text-xs text-slate-700 dark:text-slate-300 border-t border-sky-200 dark:border-sky-800 pt-3">
          <strong>Validación MVP:</strong> {solution}
        </div>
      </div>
    </div>
  );
}

// 6. Simulador de Finanzas Personales (50/30/20 + Interés Compuesto)
function FinanceSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const [monthlyIncome, setMonthlyIncome] = useState(8000);
  const [savingsPct, setSavingsPct] = useState(20);
  const [annualRate, setAnnualRate] = useState(9);
  const [years, setYears] = useState(5);

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    if (t.includes('50/30/20')) {
      setMonthlyIncome(6000);
      setSavingsPct(20);
      setAnnualRate(9);
      setYears(3);
    } else if (t.includes('interés compuesto')) {
      setMonthlyIncome(10000);
      setSavingsPct(25);
      setAnnualRate(10);
      setYears(10);
    } else {
      setMonthlyIncome(8000);
      setSavingsPct(20);
      setAnnualRate(9);
      setYears(5);
    }
  }, [lesson?.id, lesson?.title]);

  const needs = Math.round(monthlyIncome * 0.5);
  const savings = Math.round((monthlyIncome * savingsPct) / 100);
  const wants = Math.max(0, monthlyIncome - needs - savings);

  const projection = useMemo(() => {
    const monthlyRate = annualRate / 100 / 12;
    const points: { year: number; total: number; contributed: number }[] = [];
    let balance = 0;
    let contributed = 0;
    for (let y = 1; y <= years; y++) {
      for (let m = 0; m < 12; m++) {
        balance = (balance + savings) * (1 + monthlyRate);
        contributed += savings;
      }
      points.push({ year: y, total: Math.round(balance), contributed: Math.round(contributed) });
    }
    return points;
  }, [savings, annualRate, years]);

  const finalPoint = projection[projection.length - 1] || { total: 0, contributed: 0 };
  const maxVal = Math.max(1, finalPoint.total);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Calculadora 50/30/20 e Interés Compuesto
          </h4>
          <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-400" />
        </div>

        <label className="block space-y-1">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Ingreso Mensual (MXN)</span>
            <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              ${monthlyIncome.toLocaleString('es-MX')}
            </span>
          </div>
          <input
            type="range"
            min={2000}
            max={40000}
            step={500}
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(Number(e.target.value))}
            className="w-full accent-sky-700"
          />
        </label>

        <label className="block space-y-1">
          <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
            <span>Porcentaje de Ahorro / Inversión</span>
            <span className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              {savingsPct}% (${savings.toLocaleString('es-MX')}/mes)
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={45}
            step={1}
            value={savingsPct}
            onChange={(e) => setSavingsPct(Number(e.target.value))}
            className="w-full accent-emerald-600"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-1">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Rendimiento anual ({annualRate}%)
            </span>
            <input
              type="range"
              min={2}
              max={15}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
              className="w-full accent-sky-700"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Horizonte ({years} años)
            </span>
            <input
              type="range"
              min={1}
              max={15}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full accent-sky-700"
            />
          </label>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400">Necesidades (50%)</p>
            <p className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              ${needs.toLocaleString('es-MX')}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Personales</p>
            <p className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              ${wants.toLocaleString('es-MX')}
            </p>
          </div>
          <div>
            <p className="text-slate-500 dark:text-slate-400">Ahorro</p>
            <p className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
              ${savings.toLocaleString('es-MX')}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Capital acumulado en {years} años
            </p>
            <p className="text-2xl font-bold font-mono tabular-nums text-sky-700 dark:text-sky-400">
              ${finalPoint.total.toLocaleString('es-MX')} MXN
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 dark:text-slate-400">Ganancia por interés</p>
            <p className="text-sm font-semibold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
              +${(finalPoint.total - finalPoint.contributed).toLocaleString('es-MX')}
            </p>
          </div>
        </div>

        <div className="h-36 flex items-end gap-2 pt-4">
          {projection.map((pt) => {
            const totalH = Math.max(8, Math.round((pt.total / maxVal) * 100));
            const contribH = Math.max(6, Math.round((pt.contributed / maxVal) * 100));
            return (
              <div key={pt.year} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="w-full relative flex items-end justify-center h-full">
                  <div
                    className="w-full max-w-[26px] rounded-t bg-sky-600/85 dark:bg-sky-500/85 transition-all duration-200 relative"
                    style={{ height: `${totalH}%` }}
                    title={`Año ${pt.year}: $${pt.total.toLocaleString('es-MX')}`}
                  >
                    <div
                      className="w-full bg-slate-300 dark:bg-slate-600 rounded-t absolute bottom-0 left-0"
                      style={{ height: `${Math.min(100, Math.round((contribH / totalH) * 100))}%` }}
                    />
                  </div>
                </div>
                <span className="text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  A{pt.year}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// 7. Simulador de Administración del Tiempo (Pomodoro + Matriz de Eisenhower)
function TimeSimulator({ lesson }: { lesson?: CurriculumLesson }) {
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');
  const [tasks, setTasks] = useState([
    { id: '1', label: 'Entregar práctica de Python', quadrant: 'Urgente e Importante' },
    { id: '2', label: 'Planificar proyecto social STEM', quadrant: 'Importante (No Urgente)' },
    { id: '3', label: 'Revisar redes sin objetivo', quadrant: 'Eliminar / Limitar' },
  ]);
  const [newTask, setNewTask] = useState('');
  const [quadrant, setQuadrant] = useState('Urgente e Importante');

  useEffect(() => {
    const t = (lesson?.title || '').toLowerCase();
    setRunning(false);
    setMode('focus');
    setSecondsLeft(25 * 60);
    if (t.includes('time-blocking') || t.includes('calendario')) {
      setTasks([
        { id: '1', label: 'Bloque 09:00 Estudio técnico profundo', quadrant: 'Importante (No Urgente)' },
        { id: '2', label: 'Bloque 11:00 Correos y entregas', quadrant: 'Delegar / Programar' },
        { id: '3', label: 'Bloque colchón 15 min imprevistos', quadrant: 'Urgente e Importante' },
      ]);
    } else if (t.includes('eisenhower')) {
      setTasks([
        { id: '1', label: 'Q1: Entrega que cierra hoy', quadrant: 'Urgente e Importante' },
        { id: '2', label: 'Q2: Curso autodidacta MentMar', quadrant: 'Importante (No Urgente)' },
        { id: '3', label: 'Q4: Distractores en notificaciones', quadrant: 'Eliminar / Limitar' },
      ]);
    } else {
      setTasks([
        { id: '1', label: 'Ciclo Pomodoro: Repasar lección actual', quadrant: 'Urgente e Importante' },
        { id: '2', label: 'Pausa activa de 5 min sin pantalla', quadrant: 'Importante (No Urgente)' },
        { id: '3', label: 'Silenciar notificaciones no esenciales', quadrant: 'Eliminar / Limitar' },
      ]);
    }
  }, [lesson?.id, lesson?.title]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const mins = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secs = String(secondsLeft % 60).padStart(2, '0');

  const switchMode = (nextMode: 'focus' | 'break') => {
    setRunning(false);
    setMode(nextMode);
    setSecondsLeft(nextMode === 'focus' ? 25 * 60 : 5 * 60);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || tasks.length >= 6) return;
    setTasks((prev) => [...prev, { id: String(Date.now()), label: newTask.trim(), quadrant }]);
    setNewTask('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-700 dark:text-sky-400" />
            Temporizador Pomodoro en Vivo
          </h4>
          <div className="flex gap-1 p-0.5 bg-slate-200/70 dark:bg-slate-800 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => switchMode('focus')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                mode === 'focus'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Enfoque (25m)
            </button>
            <button
              type="button"
              onClick={() => switchMode('break')}
              className={`px-2.5 py-1 rounded-md font-medium ${
                mode === 'break'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Pausa (5m)
            </button>
          </div>
        </div>

        <div className="py-4 text-center">
          <p className="text-5xl font-bold font-mono tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
            {mins}:{secs}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {mode === 'focus' ? 'Bloque de concentración profunda' : 'Descanso visual y estiramiento'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 transition-colors"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? 'Pausar' : 'Iniciar bloque'}
          </button>
          <button
            type="button"
            onClick={() => switchMode(mode)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>
      </div>

      <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-3">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Clasificador Eisenhower de Prioridades
        </h4>
        <form onSubmit={addTask} className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Nueva actividad académica o personal..."
              className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-sky-700 text-white hover:bg-sky-800 shrink-0"
            >
              Agregar
            </button>
          </div>
          <select
            value={quadrant}
            onChange={(e) => setQuadrant(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
          >
            <option>Urgente e Importante</option>
            <option>Importante (No Urgente)</option>
            <option>Delegar / Programar</option>
            <option>Eliminar / Limitar</option>
          </select>
        </form>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {tasks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs"
            >
              <span className="text-slate-800 dark:text-slate-200 truncate">{t.label}</span>
              <span className="text-[11px] text-sky-700 dark:text-sky-400 whitespace-nowrap shrink-0 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {t.quadrant}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function InteractiveSimulator({
  kind,
  lesson,
}: {
  kind: SimulatorKind;
  lesson?: CurriculumLesson;
}) {
  const challenge = getAutodidactChallenge(lesson);

  let simulatorView: React.ReactNode;
  switch (kind) {
    case 'excel':
      simulatorView = <ExcelSimulator lesson={lesson} />;
      break;
    case 'web':
      simulatorView = <WebCodeSimulator lesson={lesson} />;
      break;
    case 'iot':
      simulatorView = <IotArduinoSimulator lesson={lesson} />;
      break;
    case 'social':
      simulatorView = <SocialCanvasSimulator lesson={lesson} />;
      break;
    case 'finance':
      simulatorView = <FinanceSimulator lesson={lesson} />;
      break;
    case 'time':
      simulatorView = <TimeSimulator lesson={lesson} />;
      break;
    case 'computo':
    default:
      simulatorView = <ComputoSimulator lesson={lesson} />;
      break;
  }

  return (
    <div className="space-y-4">
      {lesson && (
        <div className="p-4 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 flex items-start gap-3">
          <Compass className="w-4 h-4 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-slate-900 dark:text-slate-100">
              Reto autodidacta · {lesson.title}
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{challenge}</p>
          </div>
        </div>
      )}
      {simulatorView}
    </div>
  );
}

export function SecurityBadgeInline() {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
      <Lock className="w-3.5 h-3.5 text-sky-700 dark:text-sky-400" />
      Notas protegidas con cifrado AES-GCM en tu navegador
    </span>
  );
}
