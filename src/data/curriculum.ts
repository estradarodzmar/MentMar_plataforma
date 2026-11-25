import type {
  CurriculumLesson,
  CurriculumLevel,
  CurriculumModule,
  SimulatorKind,
} from '../types/mentmar';
import { generateDetailedLessonContent } from './lessonDetails';

export const EDU_IMAGES = {
  hardware: '/src/assets/images/edu_hardware_pc_1795568185860.jpg',
  cybersecurity: '/src/assets/images/edu_cyber_security_1795570208694.jpg',
  officeDocs: '/src/assets/images/edu_office_docs_1795570208834.jpg',
  excelAnalytics: '/src/assets/images/edu_excel_analytics_1795570209418.jpg',
  web: '/src/assets/images/edu_web_code_1795568186727.jpg',
  databasesMl: '/src/assets/images/edu_databases_ml_1795570209683.jpg',
  iot: '/src/assets/images/edu_arduino_iot_1795568186947.jpg',
  social: '/src/assets/images/edu_social_design_1795568187475.jpg',
  financeTime: '/src/assets/images/edu_finance_time_1795568187472.jpg',
  timeManagement: '/src/assets/images/edu_time_management_1795570210387.jpg',
  leadershipPitch: '/src/assets/images/edu_leadership_pitch_1795570210635.jpg',
} as const;

interface RawModuleSpec {
  id: string;
  title: string;
  axisTitle?: string;
  lessonRangeLabel: string;
  simulatorKind?: SimulatorKind;
  imageUrl?: string;
  lessons: string[];
}

function inferSimulator(levelId: string, moduleId: string, title: string): SimulatorKind {
  const lower = title.toLowerCase();
  if (moduleId === 'talleres-finanzas' || lower.includes('finanzas')) return 'finance';
  if (
    moduleId === 'talleres-tiempo' ||
    lower.includes('administración del tiempo') ||
    lower.includes('gestión del tiempo') ||
    lower.includes('calendarios digitales')
  ) {
    return 'time';
  }
  if (levelId === 'computacion-basica') {
    if (
      moduleId.includes('m5') ||
      moduleId.includes('m6') ||
      moduleId.includes('m10') ||
      lower.includes('excel') ||
      lower.includes('fórmula') ||
      lower.includes('presupuesto') ||
      lower.includes('métricas') ||
      lower.includes('hoja de cálculo')
    ) {
      return 'excel';
    }
    if (
      moduleId === 'm12' &&
      (lower.includes('exposición') || lower.includes('presentación formal') || lower.includes('planteamiento'))
    ) {
      return 'social';
    }
    return 'computo';
  }
  if (levelId === 'programacion-web') return 'web';
  if (levelId === 'programacion-avanzada') {
    if (moduleId.includes('m5') || lower.includes('arduino') || lower.includes('iot') || lower.includes('sensor')) {
      return 'iot';
    }
    return 'web';
  }
  if (levelId === 'tecnologia-social') return 'social';
  return 'time';
}

function resolveLessonImage(
  levelId: string,
  moduleId: string,
  cleanTitle: string,
  modImageUrl: string | undefined,
  defaultImage: string
): string {
  const lower = cleanTitle.toLowerCase();

  // Refinamientos específicos por tema de lección
  if (lower.includes('seguridad bancaria') || lower.includes('phishing') || lower.includes('https') || lower.includes('contraseñas') || lower.includes('ciberacoso') || lower.includes('privacidad')) {
    return EDU_IMAGES.cybersecurity;
  }
  if (lower.includes('calendario') || lower.includes('tiempo') || lower.includes('pomodoro') || lower.includes('time-blocking') || lower.includes('eisenhower')) {
    return EDU_IMAGES.timeManagement;
  }
  if (lower.includes('excel') || lower.includes('hoja de cálculo') || lower.includes('presupuesto') || lower.includes('métricas') || lower.includes('gráficos estadísticos')) {
    return EDU_IMAGES.excelAnalytics;
  }
  if (lower.includes('oratoria') || lower.includes('pitch') || lower.includes('exposición') || lower.includes('storytelling') || lower.includes('defensa final') || lower.includes('lenguaje corporal')) {
    return EDU_IMAGES.leadershipPitch;
  }
  if (lower.includes('sql') || lower.includes('base de datos') || lower.includes('bases de datos') || lower.includes('machine learning') || lower.includes('aprendizaje automático') || lower.includes('regresión')) {
    return EDU_IMAGES.databasesMl;
  }
  if (lower.includes('arduino') || lower.includes('sensor') || lower.includes('iot') || lower.includes('pwm')) {
    return EDU_IMAGES.iot;
  }

  if (modImageUrl) return modImageUrl;

  if (levelId === 'computacion-basica') {
    if (moduleId === 'm1') return EDU_IMAGES.hardware;
    if (moduleId === 'm2') return EDU_IMAGES.cybersecurity;
    if (moduleId === 'm5' || moduleId === 'm6' || moduleId === 'm10') return EDU_IMAGES.excelAnalytics;
    return EDU_IMAGES.officeDocs;
  }

  return defaultImage;
}

function buildLesson(
  levelId: string,
  mod: RawModuleSpec,
  indexInLevel: number,
  rawTitle: string,
  defaultImage: string
): CurriculumLesson {
  const cleanTitle = rawTitle.replace(/^Lección\s+\d+:\s*/i, '').replace(/^Taller\s+\d+:\s*/i, '').trim();
  const sim = mod.simulatorKind || inferSimulator(levelId, mod.id, cleanTitle);
  const imageUrl = resolveLessonImage(levelId, mod.id, cleanTitle, mod.imageUrl, defaultImage);
  const lessonId = `${levelId}-${mod.id}-l${indexInLevel + 1}`;

  const details = generateDetailedLessonContent({
    lessonId,
    levelId,
    moduleId: mod.id,
    moduleTitle: mod.title,
    cleanTitle,
  });

  return {
    id: lessonId,
    number: indexInLevel + 1,
    title: cleanTitle,
    moduleId: mod.id,
    moduleTitle: mod.title,
    axisTitle: mod.axisTitle,
    levelId,
    durationMinutes: 25,
    simulatorKind: sim,
    summary: details.summary,
    learningObjectives: details.learningObjectives,
    whatIs: details.whatIs,
    purpose: details.purpose,
    whereUsed: details.whereUsed,
    howToDo: details.howToDo,
    mistakesToAvoid: details.mistakesToAvoid,
    visualReference: details.visualReference,
    readingBody: details.readingBody,
    keyConcepts: details.keyConcepts,
    stepByStepGuide: details.stepByStepGuide,
    practicalExample: details.practicalExample,
    commonMistake: details.commonMistake,
    organizerTitle: details.organizerTitle,
    organizerNodes: details.organizerNodes,
    multimediaTitle: details.multimediaTitle,
    multimediaSteps: details.multimediaSteps,
    imageUrl,
    imageCaption: details.imageCaption,
    practiceQuestions: details.practiceQuestions,
  };
}

function buildModules(levelId: string, specs: RawModuleSpec[], defaultImage: string): CurriculumModule[] {
  let runningIdx = 0;
  return specs.map((spec) => {
    const lessons = spec.lessons.map((title) => {
      const lesson = buildLesson(levelId, spec, runningIdx, title, defaultImage);
      runningIdx += 1;
      return lesson;
    });
    return {
      id: spec.id,
      title: spec.title,
      axisTitle: spec.axisTitle,
      lessonRangeLabel: spec.lessonRangeLabel,
      lessons,
    };
  });
}

// ==========================================
// 1. COMPUTACIÓN BÁSICA (144 Lecciones)
// ==========================================
const COMPUTACION_MODULES: RawModuleSpec[] = [
  {
    id: 'm1',
    axisTitle: 'EJE 1: Fundamentos de Cómputo, Sistemas Operativos y Seguridad Digital',
    title: 'Módulo 1: Hardware, Periféricos y Sistema Operativo',
    lessonRangeLabel: 'Lecciones 1 a 12',
    simulatorKind: 'computo',
    lessons: [
      'Componentes físicos de una computadora (CPU, memoria RAM, almacenamiento, periféricos de entrada y salida).',
      'Procedimientos correctos de encendido, apagado, reinicio y reposo de un equipo de cómputo.',
      'Ergonomía digital, higiene postural, acomodo del espacio de trabajo y cuidado del equipo.',
      'Dominio del mouse/trackpad: clics, doble clic, clic derecho, arrastrar, soltar y desplazar.',
      'Estructura del teclado: bloques alfanumérico, de control, navegación y numérico.',
      'Ejercicios de mecanografía básica y atajos de teclado esenciales (Ctrl + C, Ctrl + V, Ctrl + Z, Alt + Tab).',
      'El entorno del Sistema Operativo: escritorio, barra de tareas, menú de inicio y ventanas.',
      'Concepto de archivos, tipos de extensiones (.docx, .xlsx, .pdf, .jpg) y concepto de carpetas.',
      'Estructura jerárquica de directorios: paso a paso para crear, renombrar y organizar carpetas.',
      'Operaciones con archivos: mover, copiar, duplicar, eliminar y recuperar de la Papelera de Reciclaje.',
      'Herramientas de búsqueda interna de archivos y organización en unidades externas (USB/Disco externo).',
      'Compresión y descompresión de carpetas (.ZIP) para el envío eficiente de información.',
    ],
  },
  {
    id: 'm2',
    axisTitle: 'EJE 1: Fundamentos de Cómputo, Sistemas Operativos y Seguridad Digital',
    title: 'Módulo 2: Navegación, Seguridad en Internet e Identidad Digital',
    lessonRangeLabel: 'Lecciones 13 a 24',
    simulatorKind: 'computo',
    imageUrl: EDU_IMAGES.cybersecurity,
    lessons: [
      'Arquitectura de internet, funcionamiento de los navegadores (Edge, Chrome, Firefox) y motores de búsqueda.',
      'Búsqueda efectiva de información: palabras clave, operadores lógicos y filtrado de resultados.',
      'Evaluación crítica de fuentes de información y detección de Fake News en la web.',
      'Estructura de un sitio web seguro: protocolo HTTPS, certificados SSL y candado de seguridad.',
      'Creación de contraseñas robustas y seguras (patrones de complejidad y autenticación en dos pasos).',
      'Prevención de amenazas digitales: Phishing, virus, malware y ventanas emergentes engañosas.',
      'Ciudadanía Digital: concepto de huella digital, reputación en línea y rastro de datos personal.',
      'Normas de convivencia digital (Netiquette) en redes sociales, foros y comunidades virtuales.',
      'Identificación, prevención y actuación ante el ciberacoso (cyberbullying) y el grooming.',
      'Gestión de la privacidad en perfiles digitales e hiperconexión responsable.',
      'Habilidades blandas: pensamiento crítico aplicado al consumo y filtrado de medios digitales.',
      'Evaluación práctica del Eje 1: Configuración de un entorno seguro de trabajo y organización de directorios.',
    ],
  },
  {
    id: 'm3',
    axisTitle: 'EJE 2: Procesamiento de Texto Profesional con Microsoft Word',
    title: 'Módulo 3: Formato, Estructura y Maquetación de Documentos',
    lessonRangeLabel: 'Lecciones 25 a 36',
    simulatorKind: 'computo',
    lessons: [
      'Interfaz de Microsoft Word: cinta de opciones, barra de estado, reglas y modos de visualización.',
      'Creación de un documento desde cero, guardado inicial (.docx) y exportación directa a PDF.',
      'Formato de texto básico: fuente, tamaño, color, negrita, cursiva, subrayado y efectos de texto.',
      'Alineación de párrafos, sangrías (de primera línea y francesa) e interlineados.',
      'Listas ordenadas y desordenadas: configuración de viñetas simples, compuestas y multinivel.',
      'Configuración de página: márgenes, orientación (vertical/horizontal) y tamaño de papel.',
      'Inserción y ajuste de objetos visuales: imágenes, formas geométricas y cuadros de texto.',
      'Manipulación de imágenes: corte, ajuste de texto envolvente, alineación y brillo/contraste.',
      'Encabezados, pies de página y numeración automática de páginas en un documento.',
      'Inserción y edición de tablas: filas, columnas, combinación de celdas, bordes y sombreados.',
      'Ortografía y gramática: uso del corrector automático, diccionario y sinónimos en Word.',
      'Elaboración paso a paso de documentos administrativos básicos: oficios, solicitudes y cartas formales.',
    ],
  },
  {
    id: 'm4',
    axisTitle: 'EJE 2: Procesamiento de Texto Profesional con Microsoft Word',
    title: 'Módulo 4: Automatización de Documentos Extensos y Colaboración',
    lessonRangeLabel: 'Lecciones 37 a 48',
    simulatorKind: 'computo',
    lessons: [
      'Uso de los Estilos de Título (Título 1, Título 2, Normal) para estructurar un documento largo.',
      'Generación automática de Tablas de Contenido (índices) a partir de los estilos aplicados.',
      'Insertar saltos de página y saltos de sección para manejar distintos formatos en un solo archivo.',
      'Insertar notas al pie de página, citas textuales y bibliografía en formato APA.',
      'Inserción de marca de agua, bordes de página y color de fondo en documentos institucionales.',
      'Automatización mediante Plantillas prediseñadas (curriculum vitae, informes, boletines).',
      'Combinación de correspondencia I: creación de una carta modelo e integración con lista de origen.',
      'Combinación de correspondencia II: impresión masiva y generación de etiquetas de envío.',
      'Control de cambios y revisión: insertar comentarios, rastrear ediciones y aceptar/rechazar cambios.',
      'Edición simultánea de documentos en la nube usando Word Web / Google Docs.',
      'Habilidades blandas: comunicación escrita asertiva, claridad de redacción y síntesis de ideas.',
      'Evaluación práctica del Eje 2: Redacción, maquetación e indexación de un informe técnico completo.',
    ],
  },
  {
    id: 'm5',
    axisTitle: 'EJE 3: Hojas de Cálculo y Análisis de Datos con Microsoft Excel',
    title: 'Módulo 5: Estructura de Datos y Operaciones Fundamentales',
    lessonRangeLabel: 'Lecciones 49 a 60',
    simulatorKind: 'excel',
    imageUrl: EDU_IMAGES.excelAnalytics,
    lessons: [
      'Interfaz de Microsoft Excel: filas, columnas, celdas, barra de fórmulas y hojas de trabajo.',
      'Tipos de datos en Excel: texto, números, fechas, porcentajes y valores lógicos.',
      'Formato de celdas: bordes, rellenos, alineación, ajuste de texto y combinación de celdas.',
      'Formatos numéricos específicos: moneda, contabilidad, fecha corta/larga, hora y porcentaje.',
      'Operaciones matemáticas elementales: suma (+), resta (-), multiplicación (*) y división (/).',
      'Construcción paso a paso de la primera fórmula manual con referencias directas (=A1+B1).',
      'Referencias relativas y uso del controlador de rellenado para arrastrar fórmulas en serie.',
      'Concepto y aplicación de Referencias Absolutas ($A$1) para fijar celdas en cálculos.',
      'Función SUMA y PROMEDIO: sintaxis, selección de rangos de celdas y autosuma.',
      'Funciones de conteo básico: CONTAR, CONTARA, CONTAR.BLANCO.',
      'Funciones de posición extrema: MAX y MIN para análisis rápido de rangos.',
      'Ordenamiento alfabético, numérico y cronológico de listas de datos simples.',
    ],
  },
  {
    id: 'm6',
    axisTitle: 'EJE 3: Hojas de Cálculo y Análisis de Datos con Microsoft Excel',
    title: 'Módulo 6: Funciones Intermedias, Gráficos y Análisis de Información',
    lessonRangeLabel: 'Lecciones 61 a 72',
    simulatorKind: 'excel',
    imageUrl: EDU_IMAGES.excelAnalytics,
    lessons: [
      'Filtrado de datos: aplicación de autofiltros por texto, número, color y condición.',
      'Inserción y diseño de tablas oficiales de Excel (beneficios de estructurar rangos como tabla).',
      'Función Lógica SI básica: evaluación de condiciones sencillas para la toma de decisiones.',
      'Funciones condicionadas: CONTAR.SI y SUMAR.SI para resumir datos filtrados.',
      'Formato condicional I: reglas para resaltar celdas según valores (mayor que, menor que, duplicados).',
      'Formato condicional II: escalas de color, barras de datos y conjuntos de íconos.',
      'Creación de gráficos estadísticos I: gráficos de columnas, barras y pastel (análisis de partes).',
      'Creación de gráficos estadísticos II: gráficos de líneas y áreas para tendencias en el tiempo.',
      'Edición avanzada de gráficos: títulos, leyendas, etiquetas de datos y personalización de ejes.',
      'Preparación de hojas para impresión: área de impresión, ajustar a una página y repetir filas superior.',
      'Habilidades blandas: pensamiento lógico-matemático, interpretación analítica de datos e integridad numérica.',
      'Evaluación práctica del Eje 3: Construcción de una plantilla de control presupuestario con fórmulas y gráficos.',
    ],
  },
  {
    id: 'm7',
    axisTitle: 'EJE 4: Presentaciones Digitales Efectivas y Oratoria Visual con PowerPoint',
    title: 'Módulo 7: Principios de Diseño Visual y Maquetación de Diapositivas',
    lessonRangeLabel: 'Lecciones 73 a 84',
    simulatorKind: 'computo',
    lessons: [
      'Interfaz de Microsoft PowerPoint: área de trabajo, clasificador de diapositivas y panel de notas.',
      'Reglas de síntesis de información: regla 6x6, jerarquía visual y economía del texto.',
      'Creación de diapositivas, selección de diseños (título, dos objetos, en blanco) y duplicación.',
      'Aplicación de Temas de diseño estándar y personalización de paletas de color y fuentes.',
      'Formato y alineación de textos: cuadros de texto, márgenes internos y distribución limpia.',
      'Manejo del contraste visual: relación correcta entre colores de fondo y tipografía para legibilidad.',
      'Inserción de imágenes, vectores e íconos representativos para sustituir bloques de texto.',
      'Inserción y formato de formas geométricas para crear diagramas conceptuales manuales.',
      'Diagramas SmartArt I: listas jerárquicas, ciclos y procesos paso a paso.',
      'Diagramas SmartArt II: organigramas institucionales y esquemas de relación.',
      'Inserción e integración de tablas y gráficos estadísticos importados desde Excel.',
      'Alineación, distribución equitativa y agrupación de múltiples objetos en la diapositiva.',
    ],
  },
  {
    id: 'm8',
    axisTitle: 'EJE 4: Presentaciones Digitales Efectivas y Oratoria Visual con PowerPoint',
    title: 'Módulo 8: Multimedia, Animación y Técnicas de Exposición',
    lessonRangeLabel: 'Lecciones 85 a 96',
    simulatorKind: 'computo',
    lessons: [
      'Transiciones entre diapositivas: aplicación de efectos sutiles de cambio de página.',
      'Animación de objetos I: efectos de entrada y énfasis para controlar el ritmo de lectura.',
      'Animación de objetos II: efectos de salida, trayectorias personalizadas y panel de animación.',
      'Inserción y configuración de archivos de audio (música de fondo o narraciones).',
      'Inserción de clips de video (locales o desde plataformas web) y configuración de reproducción.',
      'Botones de acción e hipervínculos para crear presentaciones interactivas y navegables.',
      'Configuración de la presentación: uso de la Vista del Presentador, notas privadas y temporizador.',
      'Exportación de presentaciones a formato PDF, imágenes (.JPG) o video autónomo (.MP4).',
      'Herramientas alternativas en la nube: uso básico de Google Slides o Canvas interactivos.',
      'Habilidades blandas: dominio del lenguaje corporal, contacto visual, volumen y modulación de la voz.',
      'Manejo de la ansiedad escénica y estructuración de la narrativa (Storytelling aplicado).',
      'Evaluación práctica del Eje 4: Exposición oral apoyada en una presentación digital diseñada por el alumno.',
    ],
  },
  {
    id: 'm9',
    axisTitle: 'EJE 5: Creación de Formularios, Recolección de Datos y Automatización',
    title: 'Módulo 9: Diseño y Estructuración de Formularios Digitales',
    lessonRangeLabel: 'Lecciones 97 a 108',
    simulatorKind: 'computo',
    lessons: [
      'Introducción a las plataformas de formularios en la nube (Microsoft Forms y Google Forms).',
      'Estructura de una encuesta o examen: título informativo, descripción y objetivo del instrumento.',
      'Preguntas de opción múltiple y selección única (casos de uso e impacto de las opciones).',
      'Preguntas con casillas de verificación (selección múltiple) y listas desplegables.',
      'Preguntas de respuesta corta y párrafos de texto libre para recolección cualitativa.',
      'Preguntas de evaluación de satisfacción: escala Likert y valoración por estrellas/puntuación.',
      'Organización por secciones: división de formularios largos en múltiples páginas secuenciales.',
      'Lógica de ramificación (saltos condicionales según la respuesta elegida por el usuario).',
      'Configuración de parámetros: preguntas obligatorias, restricción de una respuesta por persona y fechas.',
      'Personalización estética: encabezados personalizados, temas de color y estilos tipográficos.',
      'Creación de cuestionarios autoevaluables: asignación de claves de respuesta y puntajes automáticos.',
      'Retroalimentación automática para respuestas correctas e incorrectas en tiempo real.',
    ],
  },
  {
    id: 'm10',
    axisTitle: 'EJE 5: Creación de Formularios, Recolección de Datos y Automatización',
    title: 'Módulo 10: Distribución, Análisis de Respuestas e Integración',
    lessonRangeLabel: 'Lecciones 109 a 120',
    simulatorKind: 'excel',
    imageUrl: EDU_IMAGES.excelAnalytics,
    lessons: [
      'Opciones de publicación: generación de enlaces, códigos QR e incrustación en sitios web.',
      'Configuración de privacidad del formulario: acceso público vs. restrictivo (solo usuarios de una organización).',
      'Visualización en tiempo real del panel de resultados e interpretación de gráficos generados.',
      'Exportación de respuestas recabadas hacia hojas de cálculo (Excel / Google Sheets).',
      'Limpieza y depuración básica de la base de datos obtenida mediante el formulario.',
      'Análisis de métricas simples: promedios, modas y porcentajes de participación.',
      'Elaboración de reportes ejecutivos basados en los resultados del formulario.',
      'Buenas prácticas éticas en la recolección de datos: consentimiento informado y aviso de privacidad.',
      'Casos de aplicación práctica: encuestas de satisfacción, registro a eventos y evaluaciones de clima.',
      'Habilidades blandas: diseño centrado en el usuario, empatía en la formulación de preguntas y síntesis.',
      'Trabajo en equipo: coautoría y edición colaborativa en el diseño de un formulario compartido.',
      'Evaluación práctica del Eje 5: Creación, aplicación y reporte analítico de una encuesta digital completa.',
    ],
  },
  {
    id: 'm11',
    axisTitle: 'EJE 6: Comunicación Digital, Trabajo en la Nube y Proyecto Integrador Final',
    title: 'Módulo 11: Comunicación Institucional y Productividad en la Nube',
    lessonRangeLabel: 'Lecciones 121 a 132',
    simulatorKind: 'computo',
    lessons: [
      'Correo electrónico institucional (Outlook / Gmail): configuración de cuenta y estructura de la interfaz.',
      'Redacción formal de emails: asunto claro, saludo institucional, cuerpo del mensaje, despedida y firma digital.',
      'Gestión de la bandeja de entrada: uso de carpetas, etiquetas, marcado de prioridad y archivo.',
      'Envío correcto de archivos adjuntos (límites de peso, compresión y enlaces a la nube).',
      'Uso de la copia abierta (CC) y copia oculta (CCO) respetando la privacidad de los destinatarios.',
      'Almacenamiento en la nube (OneDrive / Google Drive): carga de archivos y estructura de la unidad.',
      'Gestión de permisos de uso compartido: nivel lector, comentador y editor de archivos en la nube.',
      'Creación y gestión de enlaces públicos y privados para la entrega de tareas o reportes.',
      'Plataformas de videoconferencia (Teams / Meet): unirse a una sala, uso del micrófono y cámara.',
      'Herramientas de la videollamada: compartir pantalla, chat en vivo, uso del alzar la mano y fondos virtuales.',
      'Calendarios digitales: agendar reuniones, configurar recordatorios y gestionar el tiempo personal.',
      'Habilidades blandas: puntualidad digital, adaptabilidad tecnológica y etiqueta en llamadas virtuales.',
    ],
  },
  {
    id: 'm12',
    axisTitle: 'EJE 6: Comunicación Digital, Trabajo en la Nube y Proyecto Integrador Final',
    title: 'Módulo 12: Proyecto Integrador Anual y Habilidades Blandas Laborales',
    lessonRangeLabel: 'Lecciones 133 a 144',
    lessons: [
      'Planteamiento del Proyecto Integrador: definición de un caso práctico de negocio o comunidad.',
      'Planeación del proyecto mediante listas de control (checklists) y distribución de fases.',
      'FASE 1 - Redacción del documento ejecutivo del proyecto en Microsoft Word (uso de estilos e índices).',
      'FASE 1 (Cont.): Inserción de tablas de costos y referencias bibliográficas en el documento de Word.',
      'FASE 2 - Creación de la hoja de cálculo del proyecto en Excel (presupuesto, fórmulas y gráficos).',
      'FASE 2 (Cont.): Integración del análisis numérico de Excel dentro del reporte de Word.',
      'FASE 3 - Creación del formulario digital para capturar retroalimentación del público objetivo.',
      'FASE 4 - Diseño de la presentación ejecutiva en PowerPoint síntesis del proyecto.',
      'FASE 4 (Cont.): Incorporación de gráficos interactivos y multimedia en la presentación final.',
      'Ensayo y pulido de la exposición: aplicación de técnicas de oratoria, control de tiempo y voz.',
      'Presentación formal del Proyecto Integrador Anual y defensa del portafolio digital de evidencias.',
      'Cierre del curso: evaluación final de competencias, retroalimentación global y plan de mejora continua.',
    ],
  },
];

// ==========================================
// 2. PROGRAMACIÓN Y DESARROLLO WEB (72 Lecciones)
// ==========================================
const PROGRAMACION_WEB_MODULES: RawModuleSpec[] = [
  {
    id: 'pw-m1',
    title: 'Módulo 1: Lógica Computacional y Algorítmica',
    lessonRangeLabel: 'Lecciones 1 a 12',
    lessons: [
      '¿Qué es la programación? Pensamiento computacional y su aplicación en la vida real.',
      'Concepto de algoritmo: características, entrada, proceso y salida de datos.',
      'Representación de algoritmos mediante diagramas de flujo (simbología estándar).',
      'Introducción al entorno de pseudocódigo (PSeInt): interfaz y estructura general de un programa.',
      'Variables y constantes: concepto, declaración y reglas de asignación de nombres.',
      'Tipos de datos fundamentales: numéricos (enteros y reales), texto (caracteres/cadenas) y lógicos (booleanos).',
      'Operadores aritméticos y jerarquía de operaciones en programación.',
      'Operadores relacionales y lógicos (AND, OR, NOT) para la toma de decisiones.',
      'Comandos de entrada y salida de información por consola (Leer y Escribir).',
      'Resolución de problemas secuenciales paso a paso en PSeInt.',
      'Habilidades blandas: tolerancia a la frustración y depuración metódica de errores (debugging).',
      'Evaluación práctica del Módulo 1: Diseño y simulación de un algoritmo secuencial complejo.',
    ],
  },
  {
    id: 'pw-m2',
    title: 'Módulo 2: Estructuras de Control y Lógica Avanzada',
    lessonRangeLabel: 'Lecciones 13 a 24',
    lessons: [
      'Estructuras condicionales simples y dobles (Si / Entonces / Si No).',
      'Estructuras condicionales anidadas y selección múltiple (Según / Casos).',
      'Introducción a los bucles o ciclos: concepto de repetición controlada.',
      'Estructura repetitiva Mientras (evaluación previa).',
      'Estructura repetitiva Repetir - Hasta Que (evaluación posterior).',
      'Estructura repetitiva Para / Hasta (con contador o incremento definido).',
      'Introducción a los arreglos unidimensionales (vectores o listas): concepto y almacenamiento.',
      'Operaciones básicas con vectores: llenado, recorrido y búsqueda de elementos.',
      'Introducción a las funciones y subprocesos modulares (modularización de código).',
      'Buenas prácticas de redacción de código: indentación, comentarios legibles y nomenclatura clara.',
      'Habilidades blandas: trabajo en equipo y revisión de código por pares (code review).',
      'Evaluación práctica del Módulo 2: Creación de un sistema lógico interactivo en pseudocódigo con menús y validaciones.',
    ],
  },
  {
    id: 'pw-m3',
    title: 'Módulo 3: Estructura Web con HTML5',
    lessonRangeLabel: 'Lecciones 25 a 36',
    lessons: [
      'Introducción a la arquitectura de la Web: cliente, servidor, protocolos y editores de código (VS Code).',
      'Estructura base de un documento HTML5 (<!DOCTYPE html>, <html>, <head>, <body>).',
      'Etiquetas de texto fundamentales: títulos (<h1> a <h6>), párrafos (<p>), saltos de línea y énfasis (<strong>, <em>).',
      'Inserción de recursos multimedia: imágenes (<img>) y rutas de archivos (absolutas vs. relativas).',
      'Enlaces e hipervínculos (<a>): navegación interna, externa y apertura en pestañas nuevas.',
      'Listas en HTML: ordenadas (<ol>), desordenadas (<ul>) y de definición.',
      'Tablas de datos en HTML: filas, columnas, encabezados y atributos básicos de estructura (<table>, <tr>, <td>, <th>).',
      'Formularios web I: elementos de entrada de texto, botones, etiquetas (<label>, <input>, <button>).',
      'Formularios web II: controles avanzados (áreas de texto, selección desplegable y casillas de verificación).',
      'Semántica web moderna: etiquetas estructurales (<header>, <nav>, <main>, <section>, <article>, <footer>).',
      'Accesibilidad web básica (a11y): uso de texto alternativo (alt) y contraste estructural.',
      'Evaluación práctica del Módulo 3: Maquetación y estructuración de una página web estática semántica.',
    ],
  },
  {
    id: 'pw-m4',
    title: 'Módulo 4: Estilado y Maquetación con CSS3',
    lessonRangeLabel: 'Lecciones 37 a 48',
    lessons: [
      'Introducción a CSS: formas de aplicar estilos (en línea, internos y hojas de estilo externas).',
      'Selectores CSS fundamentales: selectores de etiqueta, clase (.) y ID (#).',
      'Propiedades de texto y fuentes: familias tipográficas, tamaños, pesos, alineación y colores.',
      'El Modelo de Caja (Box Model): contenido, relleno (padding), borde (border) y margen (margin).',
      'Dimensionamiento de elementos: unidades relativas y absolutas (px, %, em, rem, vh, vw).',
      'Propiedades de fondo: colores sólidos, imágenes de fondo y gradientes.',
      'Posicionamiento y visualización: propiedades display (block, inline, inline-block, none).',
      'Maquetación moderna con Flexbox I: contenedores flexibles, dirección y alineación de elementos (justify-content, align-items).',
      'Maquetación moderna con Flexbox II: distribución avanzada y envoltura de elementos (flex-wrap, gap).',
      'Diseño responsivo (Mobile-First): introducción a las consultas de medios (@media queries).',
      'Habilidades blandas: sensibilidad estética, diseño centrado en la experiencia de usuario (UX) y empatía digital.',
      'Evaluación práctica del Módulo 4: Estilado completo y adaptación responsiva de la página web creada en el Módulo 3.',
    ],
  },
  {
    id: 'pw-m5',
    title: 'Módulo 5: Interactividad Dinámica con JavaScript',
    lessonRangeLabel: 'Lecciones 49 a 60',
    lessons: [
      'Introducción a JavaScript: ¿Qué es y dónde se ejecuta? Conexión de scripts con HTML.',
      'Variables y tipos de datos en JS (let, const, var).',
      'Funciones en JavaScript: declaración, parámetros y retorno de valores.',
      'Manipulación del DOM (Document Object Model): selección de elementos mediante getElementById y querySelector.',
      'Modificación dinámica de contenido y estilos de elementos HTML desde JavaScript.',
      'Eventos en JavaScript: detección de clics, movimientos del mouse y envío de formularios (addEventListener).',
      'Estructuras condicionales y ciclos en JavaScript aplicados al DOM.',
      'Arreglos y objetos en JavaScript: almacenamiento y manipulación de datos estructurados.',
      'Creación de una pequeña aplicación interactiva (ej. lista de tareas pendientes o contador dinámico).',
      'Introducción a la depuración de código utilizando las Herramientas de Desarrollador del Navegador (DevTools).',
      'Habilidades blandas: pensamiento lógico aplicado a la resolución interactiva de interfaces.',
      'Evaluación práctica del Módulo 5: Desarrollo de una interfaz web con comportamiento dinámico e interactivo mediante JS.',
    ],
  },
  {
    id: 'pw-m6',
    title: 'Módulo 6: Introducción a la Programación con Python y Proyecto Integrador',
    lessonRangeLabel: 'Lecciones 61 a 72',
    lessons: [
      'Introducción a Python: características, instalación del entorno e intérprete interactivo.',
      'Variables, asignación y operaciones básicas de entrada/salida (print() e input()).',
      'Estructuras condicionales en Python (if, elif, else) y bloques de indentación.',
      'Bucles e iteraciones en Python (while y bucles for con rangos).',
      'Estructuras de datos integradas: Listas y Tuplas en Python.',
      'Estructuras de datos avanzadas: Diccionarios (pares clave-valor).',
      'Definición de funciones y reutilización de código en Python (def).',
      'Manejo básico de excepciones y errores de ejecución (try / except).',
      'Planteamiento del Proyecto Integrador de Programación: diseño de un software o aplicación web unificada.',
      'Desarrollo del núcleo lógico del proyecto en Python y conexión con la interfaz web.',
      'Pruebas de integración, corrección de errores finales y documentación del código fuente.',
      'Presentación y defensa final del proyecto integrador de programación ante el grupo.',
    ],
  },
];

// ==========================================
// 3. PROGRAMACIÓN INTERMEDIA Y AVANZADA (72 Lecciones)
// ==========================================
const PROGRAMACION_AVANZADA_MODULES: RawModuleSpec[] = [
  {
    id: 'pa-m1',
    title: 'Módulo 1: Programación Orientada a Objetos y Fundamentos en C++',
    lessonRangeLabel: 'Lecciones 1 a 12',
    imageUrl: EDU_IMAGES.web,
    lessons: [
      'Introducción a C++: entorno de desarrollo (Dev-C++, VS Code), estructura de un programa y compilación.',
      'Tipos de datos avanzados, operadores y manejo de entradas/salidas (cin / cout).',
      'Estructuras de control de flujo avanzadas en C++ (switch, bucles anidados).',
      'Funciones en C++: paso de parámetros por valor y por referencia.',
      'Introducción a la Programación Orientada a Objetos (POO): Clases y Objetos.',
      'Atributos, métodos y constructores/destructores en C++.',
      'Los 4 pilares de la POO I: Encapsulamiento y métodos de acceso (Getters y Setters).',
      'Los 4 pilares de la POO II: Herencia simple y multinivel entre clases.',
      'Los 4 pilares de la POO III: Polimorfismo y sobrecarga de funciones/operadores.',
      'Punteros y gestión dinámica de memoria en C++.',
      'Habilidades blandas: resolución lógica bajo presión y optimización de código eficiente.',
      'Evaluación práctica del Módulo 1: Desarrollo de un sistema de gestión de inventarios basado en consola usando POO en C++.',
    ],
  },
  {
    id: 'pa-m2',
    title: 'Módulo 2: Desarrollo Robusto y Aplicaciones de Escritorio con Java',
    lessonRangeLabel: 'Lecciones 13 a 24',
    imageUrl: EDU_IMAGES.web,
    lessons: [
      'Arquitectura de Java: JVM, JDK, JRE y configuración del entorno (NetBeans / IntelliJ / Eclipse).',
      'Sintaxis fundamental de Java, variables y estructuras de control.',
      'POO en Java: Creación de clases, herencia, clases abstractas e interfaces.',
      'Manejo de excepciones en Java (try, catch, finally, throws) para control de errores.',
      'Colecciones en Java: Listas (ArrayList), Conjuntos (HashSet) y Mapas (HashMap).',
      'Introducción a la interfaz gráfica de usuario (GUI) con Java Swing / JavaFX.',
      'Componentes visuales básicos: botones, etiquetas, campos de texto y paneles contenedores.',
      'Gestión de eventos de usuario en interfaces Java (ActionListeners).',
      'Conexión de aplicaciones Java con archivos locales (lectura y escritura de datos).',
      'Buenas prácticas de refactorización y documentación de código en Java (Javadoc).',
      'Habilidades blandas: trabajo colaborativo mediante control de versiones (Git y GitHub básico).',
      'Evaluación práctica del Módulo 2: Creación de una aplicación de escritorio con interfaz gráfica y persistencia en archivos.',
    ],
  },
  {
    id: 'pa-m3',
    title: 'Módulo 3: Ecosistema C# y Desarrollo de Aplicaciones',
    lessonRangeLabel: 'Lecciones 25 a 36',
    imageUrl: EDU_IMAGES.web,
    lessons: [
      'Introducción a C# y el ecosistema .NET: sintaxis base y tipos de datos fuertemente tipados.',
      'Programación Orientada a Objetos en C#: propiedades automáticas, modificadores de acceso y espacios de nombres.',
      'Colecciones genéricas avanzadas (List<T>, Dictionary<TKey, TValue>) en C#.',
      'Introducción a LINQ (Language Integrated Query) para consulta de datos en memoria.',
      'Desarrollo de aplicaciones de escritorio con Windows Forms: diseño de formularios y controles.',
      'Programación de eventos en WinForms: validación de entradas de usuario y navegación entre ventanas.',
      'Introducción al desarrollo de aplicaciones móviles multiplataforma (conceptos de arquitectura y frameworks modernos).',
      'Ciclo de vida de una aplicación móvil y diseño adaptable de pantallas (responsive UI).',
      'Consumo básico de APIs y servicios web desde aplicaciones C#.',
      'Pruebas unitarias básicas y depuración de software en entornos .NET.',
      'Habilidades blandas: adaptabilidad tecnológica y pensamiento orientado al diseño de experiencias de usuario.',
      'Evaluación práctica del Módulo 3: Desarrollo de un prototipo funcional de aplicación conectada.',
    ],
  },
  {
    id: 'pa-m4',
    title: 'Módulo 4: Bases de Datos Relacionales y No Relacionales',
    lessonRangeLabel: 'Lecciones 37 a 48',
    imageUrl: EDU_IMAGES.databasesMl,
    lessons: [
      'Introducción a las Bases de Datos: sistemas gestores (SGBD) y modelo relacional.',
      'Diseño de esquemas relacionales: tablas, registros, campos, llaves primarias y llaves foráneas.',
      'Normalización de bases de datos (1FN, 2FN, 3FN) para evitar redundancias.',
      'Lenguaje SQL (Structured Query Language): comandos de definición de datos (CREATE, ALTER, DROP).',
      'Consultas básicas en SQL (SELECT, WHERE, ORDER BY, LIMIT).',
      'Manipulación de datos en SQL (INSERT, UPDATE, DELETE).',
      'Consultas avanzadas I: funciones de agregación (SUM, AVG, COUNT) y agrupamientos (GROUP BY).',
      'Consultas avanzadas II: uniones de tablas (INNER JOIN, LEFT JOIN, RIGHT JOIN).',
      'Creación de Vistas, Procedimientos Almacenados y Disparadores (Triggers).',
      'Introducción a Bases de Datos No Relacionales (NoSQL): diferencias con SQL y modelos basados en documentos (MongoDB).',
      'Habilidades blandas: ética en el manejo de datos personales y seguridad de la información.',
      'Evaluación práctica del Módulo 4: Diseño y consulta de una base de datos completa para un sistema de comercio electrónico.',
    ],
  },
  {
    id: 'pa-m5',
    title: 'Módulo 5: Internet de las Cosas (IoT) con Arduino IDE',
    lessonRangeLabel: 'Lecciones 49 a 60',
    simulatorKind: 'iot',
    imageUrl: EDU_IMAGES.iot,
    lessons: [
      'Introducción al Hardware Libre: arquitectura de la placa Arduino y entorno de Arduino IDE.',
      'Sintaxis básica basada en C/C++ para Arduino (setup() y loop()).',
      'Pines digitales: configuración de entradas y salidas para encendido de LEDs y lectura de botones.',
      'Pines analógicos: lectura de voltajes y conversión analógica-digital (ADC).',
      'Modulación por Ancho de Pulsos (PWM): control de intensidad lumínica y velocidad de motores.',
      'Lectura de sensores físicos (temperatura, humedad, ultrasonido, luz).',
      'Control de actuadores: servomotores, motores de corriente continua y pantallas LCD.',
      'Comunicación serial: envío y recepción de datos entre Arduino y la computadora a través del Monitor Serie.',
      'Introducción a la conectividad IoT: módulos Wi-Fi (ESP8266 / ESP32) integrados con Arduino IDE.',
      'Publicación de datos de sensores hacia plataformas en la nube o servidores locales.',
      'Habilidades blandas: paciencia, experimentación física y resolución sistemática de fallas de hardware (troubleshooting).',
      'Evaluación práctica del Módulo 5: Prototipo físico de estación meteorológica o sistema domótico automatizado.',
    ],
  },
  {
    id: 'pa-m6',
    title: 'Módulo 6: Introducción al Machine Learning y Proyecto Integrador Avanzado',
    lessonRangeLabel: 'Lecciones 61 a 72',
    imageUrl: EDU_IMAGES.databasesMl,
    lessons: [
      'Introducción al Aprendizaje Automático (Machine Learning): conceptos, aplicaciones y diferencias con la programación tradicional.',
      'Preparación del entorno de Machine Learning en Python: librerías esenciales (NumPy y Pandas para análisis de datos).',
      'Visualización de datos estadísticos aplicados al aprendizaje automático (Matplotlib y Seaborn).',
      'Preprocesamiento de datos: limpieza, manejo de valores nulos y normalización de conjuntos de datos.',
      'Aprendizaje Supervisado I: Regresión Lineal para predicción de valores numéricos.',
      'Aprendizaje Supervisado II: Algoritmos de Clasificación básica (K-Nearest Neighbors y Árboles de Decisión).',
      'Evaluación de modelos predictivos: matriz de confusión, precisión, sensibilidad y error.',
      'Planteamiento del Proyecto Integrador Avanzado: integración de bases de datos, lógica de software y hardware o modelos predictivos.',
      'Desarrollo del núcleo del proyecto integrador (integrando los lenguajes y herramientas vistas en los módulos).',
      'Pruebas de integración, optimización de rendimiento y depuración general del sistema desarrollado.',
      'Documentación técnica profesional del software/hardware desarrollado y preparación de la defensa.',
      'Presentación y defensa final del Proyecto Integrador Avanzado ante el comité evaluador.',
    ],
  },
];

// ==========================================
// 4. TECNOLOGÍA COMO SOLUCIÓN A PROBLEMÁTICAS SOCIALES (20 Lecciones)
// ==========================================
const TECNOLOGIA_SOCIAL_MODULES: RawModuleSpec[] = [
  {
    id: 'ts-m1',
    title: 'Módulo 1: Diagnóstico y Mapeo de Problemáticas Sociales con Datos',
    lessonRangeLabel: 'Lecciones 1 a 5',
    lessons: [
      '¿Qué es una problemática social y cómo se cruza con la tecnología y la innovación?',
      'Mapeo de necesidades comunitarias y técnicas de recolección de datos primarios.',
      'Uso de bases de datos abiertas, repositorios públicos y estadísticas oficiales para fundamentar causas.',
      'Herramientas digitales de visualización de datos para evidenciar brechas sociales.',
      'Priorización de problemáticas y formulación de árboles de problemas y objetivos tecnológicos.',
    ],
  },
  {
    id: 'ts-m2',
    title: 'Módulo 2: Diseño Centrado en el Usuario y Metodologías Ágiles',
    lessonRangeLabel: 'Lecciones 6 a 10',
    lessons: [
      'Introducción al Design Thinking (Pensamiento de Diseño) aplicado a contextos sociales.',
      'Técnicas de empatía: entrevistas comunitarias, mapas de empatía y definición de personas.',
      'Ideación creativa y prototipado rápido de soluciones (de bocetos en papel a maquetas digitales).',
      'Introducción a las metodologías ágiles (Scrum/Kanban) adaptadas a proyectos comunitarios.',
      'Herramientas de prototipado sin código (No-Code) y plataformas web accesibles para prototipos rápidos.',
    ],
  },
  {
    id: 'ts-m3',
    title: 'Módulo 3: Emprendimiento Social y Gestión de Recursos Tecnológicos',
    lessonRangeLabel: 'Lecciones 11 a 15',
    lessons: [
      'Modelos de negocio de impacto social (Canvas Social y diseño de propuestas de valor).',
      'Financiamiento colaborativo, búsqueda de subvenciones y estrategias de Crowdfunding.',
      'Estrategias de transferencia tecnológica y adopción digital en comunidades diversas.',
      'Gestión de datos y automatización para la administración eficiente de iniciativas sociales.',
      'Comunicación de impacto y storytelling digital para visibilizar causas sociales.',
    ],
  },
  {
    id: 'ts-m4',
    title: 'Módulo 4: Inclusión, Evaluación de Impacto y Sostenibilidad',
    lessonRangeLabel: 'Lecciones 16 a 20',
    lessons: [
      'Inclusión digital y perspectiva de género en el desarrollo tecnológico (cierre de brechas).',
      'Indicadores de impacto social y definición de métricas clave de éxito (KPIs sociales).',
      'Ética, privacidad de datos y responsabilidad en proyectos dirigidos a sectores vulnerables.',
      'Escalabilidad, mantenimiento y sostenibilidad a largo plazo de soluciones tecnológicas comunitarias.',
      'Presentación, defensa y validación final del proyecto tecnológico de impacto social.',
    ],
  },
];

// ==========================================
// 5. TALLERES INTEGRALES + FINANZAS PERSONALES + ADMINISTRACIÓN DEL TIEMPO
// ==========================================
const TALLERES_MODULES: RawModuleSpec[] = [
  {
    id: 'talleres-finanzas',
    title: 'Taller Especializado: Herramientas Tech para Finanzas Personales',
    lessonRangeLabel: 'Sesiones 1 a 4',
    simulatorKind: 'finance',
    imageUrl: EDU_IMAGES.financeTime,
    lessons: [
      'Finanzas Personales Digitales: regla 50/30/20 en hojas de cálculo y control inteligente de gastos.',
      'Aplicaciones móviles de registro financiero, presupuestos automatizados y alertas de saldo.',
      'Interés compuesto, metas de ahorro programado y simuladores de inversión responsable.',
      'Seguridad bancaria digital: prevención de fraudes en línea, pagos sin contacto y protección de cuentas.',
    ],
  },
  {
    id: 'talleres-tiempo',
    title: 'Taller Especializado: Tecnología para la Administración del Tiempo',
    lessonRangeLabel: 'Sesiones 5 a 8',
    simulatorKind: 'time',
    imageUrl: EDU_IMAGES.timeManagement,
    lessons: [
      'Time-Blocking digital: diseño de bloques de enfoque en Google Calendar y Outlook.',
      'Matriz de Eisenhower automatizada y priorización de tareas en Notion, Trello o Todoist.',
      'Técnica Pomodoro con temporizadores inteligentes y mitigación de distracciones digitales.',
      'Flujos de automatización personal, recordatorios multidispositivo y balance estudio-bienestar.',
    ],
  },
  {
    id: 'tal-m1',
    title: 'Módulo 1: Comunicación Técnica y Propósito',
    lessonRangeLabel: 'Talleres 1 y 4',
    simulatorKind: 'social',
    imageUrl: EDU_IMAGES.leadershipPitch,
    lessons: [
      'Taller 1: De la línea de código al escenario: Cómo presentar tu prototipo técnico con propósito.',
      'Taller 4: Storytelling para tecnólogos: Cuenta la historia detrás de tu app.',
    ],
  },
  {
    id: 'tal-m2',
    title: 'Módulo 2: Trabajo en Equipo y Dirección Ágil',
    lessonRangeLabel: 'Talleres 2 y 5',
    simulatorKind: 'time',
    imageUrl: EDU_IMAGES.leadershipPitch,
    lessons: [
      'Taller 2: Trabajo en equipo bajo presión: Liderazgo y desarrollo ágil para hackathons.',
      'Taller 5: Liderazgo juvenil en STEM: Guía a tu equipo hacia el MVP.',
    ],
  },
  {
    id: 'tal-m3',
    title: 'Módulo 3: Empatía Digital y Resiliencia',
    lessonRangeLabel: 'Talleres 3 y 6',
    simulatorKind: 'social',
    imageUrl: EDU_IMAGES.leadershipPitch,
    lessons: [
      'Taller 3: Empatía digital: Diseñando tecnología accesible e inclusiva.',
      'Taller 6: Resiliencia ante el bug: Inteligencia emocional frente a la frustración del código.',
    ],
  },
  {
    id: 'tal-m4',
    title: 'Módulo 4: Pensamiento Lógico y Algorítmico',
    lessonRangeLabel: 'Talleres 7 y 8',
    simulatorKind: 'web',
    imageUrl: EDU_IMAGES.web,
    lessons: [
      'Taller 7: Primeros pasos en la lógica: Del pensamiento computacional a la solución.',
      'Taller 8: Resolución de problemas algorítmicos: Rompiendo desafíos paso a paso.',
    ],
  },
  {
    id: 'tal-m5',
    title: 'Módulo 5: Habilidades Blandas, Liderazgo y Bienestar',
    lessonRangeLabel: 'Talleres 9 y 10',
    simulatorKind: 'time',
    imageUrl: EDU_IMAGES.leadershipPitch,
    lessons: [
      'Taller 9: El poder de la voz propia: Inteligencia emocional y liderazgo femenino en STEM.',
      'Taller 10: Gestión del tiempo y autoconocimiento para jóvenes líderes.',
    ],
  },
  {
    id: 'tal-m6',
    title: 'Módulo 6: Pitch y Oratoria de Alto Impacto',
    lessonRangeLabel: 'Talleres 11 y 12',
    simulatorKind: 'social',
    imageUrl: EDU_IMAGES.leadershipPitch,
    lessons: [
      'Taller 11: El arte del Elevator Pitch: Vende tu idea de innovación social en 60 segundos.',
      'Taller 12: Presencia escénica y oratoria: Conecta con tu audiencia y haz que tu voz importe.',
    ],
  },
];

export const CURRICULUM_LEVELS: CurriculumLevel[] = [
  {
    id: 'computacion-basica',
    shortTitle: 'Computación Básica',
    title: 'Computación Básica y Competencias Digitales',
    totalLabel: '144 Lecciones',
    focus: 'Alfabetización digital, suite de ofimática (Word, Excel, PowerPoint, Forms), productividad en la nube e identidad digital.',
    evaluationMethod: 'Evaluación por ejes y Proyecto Integrador Anual.',
    imageUrl: EDU_IMAGES.hardware,
    simulatorKind: 'computo',
    modules: buildModules('computacion-basica', COMPUTACION_MODULES, EDU_IMAGES.hardware),
  },
  {
    id: 'programacion-web',
    shortTitle: 'Programación y Web',
    title: 'Programación y Desarrollo Web',
    totalLabel: '72 Lecciones',
    focus: 'Lógica algorítmica (PSeInt), desarrollo web (HTML5, CSS3, JavaScript) e iniciación en Python.',
    evaluationMethod: 'Prototipado web dinámico y defensa de proyecto.',
    imageUrl: EDU_IMAGES.web,
    simulatorKind: 'web',
    modules: buildModules('programacion-web', PROGRAMACION_WEB_MODULES, EDU_IMAGES.web),
  },
  {
    id: 'programacion-avanzada',
    shortTitle: 'Programación Avanzada',
    title: 'Programación Intermedia y Avanzada',
    totalLabel: '72 Lecciones',
    focus: 'POO (C++, Java, C#), bases de datos SQL/NoSQL, IoT (Arduino IDE) e IA/Machine Learning.',
    evaluationMethod: 'Desarrollo de sistemas completos y comité evaluador.',
    imageUrl: EDU_IMAGES.iot,
    simulatorKind: 'iot',
    modules: buildModules('programacion-avanzada', PROGRAMACION_AVANZADA_MODULES, EDU_IMAGES.iot),
  },
  {
    id: 'tecnologia-social',
    shortTitle: 'Tecnología Social',
    title: 'Tecnología como Solución a Problemáticas Sociales',
    totalLabel: '20 Lecciones',
    focus: 'Design Thinking, metodologías ágiles, emprendimiento social, indicadores KPI e impacto comunitario.',
    evaluationMethod: 'Validación de proyectos sociales de impacto.',
    imageUrl: EDU_IMAGES.social,
    simulatorKind: 'social',
    modules: buildModules('tecnologia-social', TECNOLOGIA_SOCIAL_MODULES, EDU_IMAGES.social),
  },
  {
    id: 'talleres-stem',
    shortTitle: 'Talleres STEM, Finanzas y Tiempo',
    title: 'Talleres Integrales: Liderazgo STEM, Finanzas Personales y Administración del Tiempo',
    totalLabel: '20 Sesiones y Talleres',
    focus: 'Herramientas tech para finanzas personales, tecnología para administración del tiempo, oratoria, storytelling, liderazgo y ética.',
    evaluationMethod: 'Simulaciones prácticas, Pitch y dinámicas grupales.',
    imageUrl: EDU_IMAGES.financeTime,
    simulatorKind: 'finance',
    modules: buildModules('talleres-stem', TALLERES_MODULES, EDU_IMAGES.financeTime),
  },
];

export const ALL_LESSONS: CurriculumLesson[] = CURRICULUM_LEVELS.flatMap((lvl) =>
  lvl.modules.flatMap((mod) => mod.lessons)
);
