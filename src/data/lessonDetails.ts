import type {
  LessonMistakeFix,
  LessonVisualReference,
  OrganizerNode,
  PracticeQuestion,
} from '../types/mentmar';
import { buildGranularPedagogy } from './topicPedagogy';

export interface DetailedLessonContent {
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
  imageCaption: string;
  practiceQuestions: PracticeQuestion[];
}

interface ModuleKnowledgeProfile {
  domainLabel: string;
  tools: string;
  contextIntro: string;
  conceptPairs: { term: string; detail: string }[];
  workflowSteps: string[];
  exampleTemplate: (topic: string, subitems: string[]) => {
    title: string;
    snippetOrCase: string;
    takeaway: string;
  };
  commonPitfall: string;
  organizerPattern: (topic: string) => OrganizerNode[];
  quizPool: (topic: string, subitems: string[]) => PracticeQuestion[];
}

function extractSubitems(title: string): string[] {
  const parenMatch = title.match(/\(([^)]+)\)/g);
  const items: string[] = [];
  if (parenMatch) {
    parenMatch.forEach((m) => {
      const inner = m.slice(1, -1);
      inner.split(/[,;/]/).forEach((part) => {
        const clean = part.trim();
        if (clean.length >= 2) items.push(clean);
      });
    });
  }
  const afterColon = title.includes(':') ? title.split(':').slice(1).join(':') : title;
  afterColon.split(/[,;]/).forEach((segment) => {
    const clean = segment.replace(/\([^)]*\)/g, '').trim();
    if (clean.length >= 3 && !items.includes(clean)) {
      items.push(clean);
    }
  });
  return items.slice(0, 5);
}

function cleanMainTopic(title: string): string {
  return title.split(':')[0].replace(/\([^)]*\)/g, '').trim();
}

// ============================================================
// CURATED DEEP-DIVES FOR SPECIALIZED WORKSHOPS & KEY LESSONS
// ============================================================
type ExactTopicContent = Omit<
  DetailedLessonContent,
  'whatIs' | 'purpose' | 'whereUsed' | 'howToDo' | 'mistakesToAvoid' | 'visualReference'
>;

const EXACT_TOPIC_DETAILS: Array<{
  match: (lessonId: string, title: string) => boolean;
  build: (title: string) => ExactTopicContent;
}> = [
  {
    match: (id) => id.startsWith('talleres-stem-talleres-finanzas-l1'),
    build: () => ({
      summary:
        'Aprende a construir un presupuesto inteligente con la regla 50/30/20 en hojas de cálculo automatizadas para controlar gastos fijos, variables y metas de ahorro.',
      learningObjectives: [
        'Clasificar tus ingresos mensuales reales aplicando la distribución 50% necesidades, 30% estilo de vida y 20% ahorro.',
        'Estructurar una plantilla de flujo de caja en Excel o Google Sheets con fórmulas automáticas y alertas visuales.',
        'Detectar gastos hormiga acumulados y reasignarlos hacia tu fondo de emergencia.',
      ],
      readingBody: [
        'La administración financiera personal comienza con visibilidad: no puedes optimizar lo que no registras. La regla 50/30/20 propuesta por Elizabeth Warren ofrece un marco claro para dividir tu ingreso neto mensual: 50% para necesidades esenciales (vivienda, alimentación básica, transporte, servicios e internet educativo), 30% para deseos o bienestar personal (entretenimiento, salidas, suscripciones no esenciales) y 20% intocable para ahorro, fondo de emergencia o inversión productiva.',
        'Al trasladar esta regla a una hoja de cálculo digital, automatizas el cálculo del margen disponible antes de gastar. Usando fórmulas como =SUMA(rango), =SUMAR.SI(categoria,"Necesidad",monto) y formato condicional, la hoja te avisa automáticamente en tono ámbar o rojo cuando una categoría rebasa su techo porcentual.',
        'En jóvenes estudiantes o emprendedores STEM, el primer reto suele ser el gasto hormiga: compras pequeñas diarias de $30 a $60 MXN que en 30 días superan $1,500 MXN sin generar valor duradero. Registrar cada movimiento en menos de 15 segundos desde el celular transforma por completo la capacidad de ahorro.',
      ],
      keyConcepts: [
        { term: '50% Necesidades', detail: 'Gastos indispensables para vivir y estudiar sin los cuales no puedes operar.' },
        { term: '30% Estilo de vida', detail: 'Consumo discrecional flexible que puedes ajustar primero ante imprevistos.' },
        { term: '20% Ahorro / Inversión', detail: 'Se separa el día que recibes tu ingreso ("págate a ti primero"), nunca al final del mes.' },
        { term: '=SUMAR.SI()', detail: 'Fórmula de Excel/Sheets para totalizar gastos automáticamente por categoría.' },
      ],
      stepByStepGuide: [
        'Calcula tu ingreso neto mensual disponible (becas, mesada, trabajos o ingresos por proyectos).',
        'Crea columnas en tu hoja de cálculo: Fecha, Concepto, Categoría (Necesidad / Deseo / Ahorro), Monto y Porcentaje.',
        'Calcula los topes objetivo multiplicando tu ingreso por 0.50, 0.30 y 0.20 en un bloque resumen superior.',
        'Configura formato condicional para resaltar en alerta cualquier rubro que exceda su presupuesto asignado.',
        'Prueba tus propios números en el Simulador de Finanzas Personales de la pestaña correspondiente.',
      ],
      practicalExample: {
        title: 'Presupuesto real con ingreso de $6,000 MXN/mes',
        snippetOrCase:
          'Ingreso: $6,000 -> Necesidades (50%): $3,000 | Deseos (30%): $1,800 | Ahorro (20%): $1,200.\nFórmula en Excel: =SUMAR.SI(C2:C40,"Necesidad",D2:D40) / $B$1',
        takeaway:
          'Separar $1,200 MXN el primer día del mes garantiza $14,400 MXN de respaldo anual sin sacrificar tu estabilidad diaria.',
      },
      commonMistake:
        'Ahorrar "lo que sobre al final de la quincena" en lugar de apartar el 20% desde el primer día; casi siempre termina en $0 ahorrado.',
      organizerTitle: 'Flujo del Presupuesto Digital 50/30/20',
      organizerNodes: [
        { title: '1. Ingreso Neto', detail: 'Define cuánto dinero real entra al mes después de descuentos.' },
        { title: '2. Separación 20%', detail: 'Transfiere primero el ahorro a una subcuenta o meta separada.' },
        { title: '3. Topes 50 / 30', detail: 'Asigna límites claros a gastos esenciales y gustos.' },
        { title: '4. Auditoría Semanal', detail: 'Revisa desviaciones con fórmulas y ajusta la siguiente semana.' },
      ],
      multimediaTitle: 'Guía Visual: Tu Presupuesto Automatizado en 5 Minutos',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:40',
          heading: 'Diagnóstico del ingreso y gastos hormiga',
          explanation: 'Cómo identificar fugas silenciosas de dinero durante una semana normal de clases o trabajo.',
        },
        {
          timeLabel: '01:40 – 03:40',
          heading: 'Armado de la plantilla 50/30/20 con SUMAR.SI',
          explanation: 'Construcción en vivo de la tabla con referencias absolutas ($B$1) y barras visuales de progreso.',
        },
        {
          timeLabel: '03:40 – 05:00',
          heading: 'Regla de oro del corte semanal',
          explanation: 'Hábito de revisión de 5 minutos cada domingo para mantener las finanzas bajo control sin estrés.',
        },
      ],
      imageCaption: 'Análisis digital de presupuesto 50/30/20 y métricas financieras personales.',
      practiceQuestions: [
        {
          prompt: 'Según la regla 50/30/20, si percibes $8,000 MXN al mes, ¿cuánto debes destinar al bloque de ahorro e inversión?',
          options: ['$1,600 MXN (20%)', '$4,000 MXN (50%)', '$800 MXN (10%)'],
          correctIndex: 0,
          explanation: 'El 20% de $8,000 equivale a $1,600 MXN destinados de forma prioritaria a ahorro o inversión.',
        },
        {
          prompt: '¿Qué función de hoja de cálculo suma únicamente los gastos etiquetados como "Necesidad"?',
          options: ['=CONTAR()', '=SUMAR.SI()', '=ALEATORIO()'],
          correctIndex: 1,
          explanation: 'SUMAR.SI evalúa el criterio de categoría y suma exclusivamente las filas coincidentes.',
        },
        {
          prompt: '¿Cuál es el mejor momento del mes para apartar tu porcentaje de ahorro?',
          options: [
            'En cuanto recibes el ingreso ("págate a ti primero")',
            'El último día del mes si sobró efectivo',
            'Solo en meses con aguinaldo',
          ],
          correctIndex: 0,
          explanation: 'Automatizar el apartado al inicio evita que el gasto corriente consuma tus metas.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-finanzas-l2'),
    build: () => ({
      summary:
        'Configura aplicaciones móviles de registro financiero, etiquetas de categorías y alertas automáticas de límite de gasto en tiempo real.',
      learningObjectives: [
        'Seleccionar herramientas móviles seguras para registrar ingresos y egresos en segundos.',
        'Configurar límites por categoría (transporte, alimentos, tecnología) con alertas tempranas al 80%.',
        'Separar cuentas operativas de cuentas de ahorro mediante apartados digitales.',
      ],
      readingBody: [
        'Llevar el control financiero únicamente en la computadora suele fallar porque los gastos ocurren en la calle, la escuela o en compras digitales desde el teléfono. Las aplicaciones de finanzas personales (y formularios rápidos vinculados a Google Sheets) resuelven la fricción permitiendo registrar cada gasto en menos de tres toques.',
        'Una buena configuración incluye categorías simples (máximo 6 a 8), recordatorios diarios de cierre y alertas automáticas cuando alcanzas el 80% del presupuesto mensual de una categoría. Además, muchas cuentas digitales modernas en México ofrecen "apartados" o "cajitas" sin comisión para aislar dinero destinado a colegiaturas, hardware o emergencias.',
        'La seguridad es inseparable de la comodidad: nunca entregues contraseñas bancarias a aplicaciones no reguladas que prometen sincronización automática sin estándares oficiales; prefiere registro manual ágil o integraciones bancarias verificadas.',
      ],
      keyConcepts: [
        { term: 'Fricción cero', detail: 'Atajo o widget en pantalla principal para anotar un gasto al instante.' },
        { term: 'Alerta al 80%', detail: 'Notificación preventiva antes de agotar el presupuesto de una categoría.' },
        { term: 'Apartados digitales', detail: 'Subcuentas virtuales dentro de tu banco para evitar gastar dinero etiquetado.' },
        { term: 'Conciliación semanal', detail: 'Comparar tus registros de la app contra los movimientos reales de tu estado de cuenta.' },
      ],
      stepByStepGuide: [
        'Define 6 categorías principales: Alimentación, Transporte, Educación/Tech, Salud, Ocio y Ahorro.',
        'Configura un acceso rápido en tu teléfono (app financiera o formulario vinculado a tu hoja de cálculo).',
        'Establece un recordatorio diario a las 21:00 horas para validar que no falte ningún ticket del día.',
        'Activa notificaciones de movimientos bancarios en tiempo real en la app oficial de tu banco.',
      ],
      practicalExample: {
        title: 'Sistema de 3 sobres digitales para estudiantes',
        snippetOrCase:
          'Cuenta principal (gasto semanal) + Apartado "Equipo/Cursos" ($400/mes) + Apartado "Emergencias" ($500/mes).',
        takeaway:
          'Cuando el dinero está en apartados separados, tu saldo visible diario refleja solo lo que realmente puedes gastar.',
      },
      commonMistake:
        'Crear 30 subcategorías demasiado específicas; el exceso de detalle abruma y hace que abandones el registro a la segunda semana.',
      organizerTitle: 'Arquitectura de Control Financiero Móvil',
      organizerNodes: [
        { title: '1. Captura Inmediata', detail: 'Registra monto y categoría al momento del pago.' },
        { title: '2. Etiquetado Simple', detail: 'Usa máximo 6–8 categorías claras.' },
        { title: '3. Alertas de Techo', detail: 'Recibe aviso preventivo al llegar al 80%.' },
        { title: '4. Conciliación', detail: 'Verifica saldo real cada domingo.' },
      ],
      multimediaTitle: 'Apps y Alertas Financieras sin Riesgos',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'Por qué fallan los registros tradicionales',
          explanation: 'El secreto está en reducir a 10 segundos el tiempo entre pagar y anotar el movimiento.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Diseño de categorías y alertas al 80%',
          explanation: 'Cómo estructurar límites realistas que te den libertad sin culpas.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Privacidad y permisos en apps financieras',
          explanation: 'Qué permisos revisar y por qué nunca compartir tu NIP o token bancario.',
        },
      ],
      imageCaption: 'Control móvil de presupuestos personales y alertas inteligentes de saldo.',
      practiceQuestions: [
        {
          prompt: '¿Por qué conviene limitar tus categorías de gastos en una app financiera a entre 6 y 8?',
          options: [
            'Para reducir fricción y sostener el hábito de registro a largo plazo',
            'Porque las apps prohíben más de 8 filas',
            'Para ocultar gastos importantes',
          ],
          correctIndex: 0,
          explanation: 'La simplicidad asegura constancia: entre menos pasos tome registrar, mayor éxito tendrás.',
        },
        {
          prompt: '¿Qué práctica representa un riesgo grave al usar una app financiera de terceros?',
          options: [
            'Entregar tu contraseña bancaria completa a sitios no verificados',
            'Activar notificaciones de movimientos en tu banco oficial',
            'Usar apartados de ahorro dentro de tu cuenta',
          ],
          correctIndex: 0,
          explanation: 'Nunca debes compartir credenciales bancarias privadas con apps externas no reguladas.',
        },
        {
          prompt: '¿Para qué sirve configurar una alerta al 80% del presupuesto de ocio?',
          options: [
            'Para frenar o ajustar el gasto a tiempo antes de quedarte sin saldo',
            'Para gastar más rápido el 20% restante',
            'Para eliminar tu fondo de emergencia',
          ],
          correctIndex: 0,
          explanation: 'Las alertas preventivas permiten corregir decisiones antes de caer en déficit.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-finanzas-l3'),
    build: () => ({
      summary:
        'Comprende el poder matemático del interés compuesto, la diferencia entre ahorrar e invertir y cómo proyectar metas reales en el simulador.',
      learningObjectives: [
        'Calcular el crecimiento exponencial mediante la fórmula del interés compuesto VF = VP × (1 + r)^n.',
        'Evaluar el efecto del tiempo y la constancia de aportaciones mensuales en metas a mediano y largo plazo.',
        'Comparar instrumentos regulados de bajo riesgo frente a la inflación.',
      ],
      readingBody: [
        'Guardar dinero en efectivo bajo el colchón pierde poder adquisitivo cada año debido a la inflación. Si la inflación anual es de 4.5%, lo que hoy cuesta $1,000 MXN costará aproximadamente $1,045 MXN el próximo año. Invertir consiste en poner tu ahorro a trabajar en instrumentos regulados para que al menos conserve y multiplique su valor real.',
        'El motor detrás de las finanzas inteligentes es el interés compuesto: a diferencia del interés simple (donde solo el capital inicial genera rendimientos), en el interés compuesto los rendimientos generados se reinvierten y producen nuevos rendimientos periodo tras periodo. Su fórmula es VF = VP × (1 + r)^n, y con aportaciones periódicas constantes el crecimiento forma una curva exponencial.',
        'Para estudiantes jóvenes, el recurso más valioso no es tener mucho capital inicial, sino tener más años de horizonte (`n`). Empezar aportando $500 MXN mensuales a los 18 años produce un resultado drásticamente superior que aportar el doble empezando a los 35.',
      ],
      keyConcepts: [
        { term: 'VF = VP × (1 + r)^n', detail: 'Valor Futuro igual a Valor Presente por uno más la tasa elevada al número de periodos.' },
        { term: 'Inflación', detail: 'Aumento sostenido de precios que reduce el poder de compra del dinero inactivo.' },
        { term: 'Tasa Real', detail: 'Rendimiento neto aproximado después de restar la inflación anual.' },
        { term: 'Instrumentos Regulados', detail: 'Opciones supervisadas (ej. CETES, SOFIPOS reguladas o fondos indexados) frente a fraudes.' },
      ],
      stepByStepGuide: [
        'Define una meta concreta con monto y fecha (ej. comprar laptop profesional en 24 meses o fondo de estudios).',
        'Abre el Simulador de Finanzas Personales en la pestaña "Simulador" de esta lección.',
        'Ajusta tu ahorro mensual y prueba tasas conservadoras (8%–11% anual) a distintos plazos (12, 36 y 60 meses).',
        'Observa qué porcentaje del monto final proviene de tus aportaciones y qué porcentaje proviene de los intereses ganados.',
      ],
      practicalExample: {
        title: 'Simulación: $800 MXN al mes al 10% anual durante 5 años',
        snippetOrCase:
          'Aportación total de tu bolsillo: $800 × 60 meses = $48,000 MXN.\nCon capitalización mensual al 10% anual: ≈ $61,950 MXN (+$13,950 MXN de rendimiento compuesto).',
        takeaway:
          'La constancia mensual y la reinversión automática convierten pequeños montos en patrimonio tangible.',
      },
      commonMistake:
        'Caer en esquemas que prometen rendimientos garantizados irreales (ej. "10% semanal sin riesgo"); siempre verifica que la institución esté regulada por la CNBV/CONDUSEF.',
      organizerTitle: 'Ciclo del Interés Compuesto',
      organizerNodes: [
        { title: '1. Capital Inicial', detail: 'Aportación base + ahorro mensual constante.' },
        { title: '2. Tasa Regulada', detail: 'Rendimiento superior a la inflación en entidad supervisada.' },
        { title: '3. Reinversión', detail: 'Los intereses generados se suman al capital.' },
        { title: '4. Efecto Tiempo', detail: 'A mayor plazo, la curva exponencial acelera.' },
      ],
      multimediaTitle: 'El Poder Exponencial del Interés Compuesto',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'Inflación vs. dinero inmóvil',
          explanation: 'Por qué el dinero sin rendimiento pierde valor de compra cada año.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Interés simple contra interés compuesto',
          explanation: 'Comparativa visual de crecimiento lineal frente a crecimiento exponencial año con año.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Cómo detectar fraudes financieros',
          explanation: 'Señales de alerta de esquemas piramidales y verificación de instituciones reguladas.',
        },
      ],
      imageCaption: 'Proyección exponencial de ahorro e interés compuesto en el tiempo.',
      practiceQuestions: [
        {
          prompt: '¿Qué diferencia al interés compuesto del interés simple?',
          options: [
            'Los intereses ganados se reinvierten y generan nuevos intereses sobre intereses',
            'Solo se cobra comisión bancaria una vez',
            'El capital nunca cambia con el tiempo',
          ],
          correctIndex: 0,
          explanation: 'La reinversión continua de rendimientos es lo que produce el crecimiento exponencial.',
        },
        {
          prompt: 'Si una inversión ofrece 9% anual y la inflación es de 4.5%, ¿qué ocurre con tu poder adquisitivo?',
          options: [
            'Crece en términos reales porque el rendimiento supera a la inflación',
            'Pierdes la mitad de tu capital',
            'Se congela exactamente igual',
          ],
          correctIndex: 0,
          explanation: 'Cuando el rendimiento supera la inflación, tu tasa real es positiva.',
        },
        {
          prompt: '¿Cuál es una señal clara de posible fraude financiero?',
          options: [
            'Prometer rendimientos altísimos "garantizados" en días sin regulación oficial',
            'Mostrar términos, comisiones y registro ante autoridad financiera',
            'Explicar claramente los riesgos y plazos del instrumento',
          ],
          correctIndex: 0,
          explanation: 'Ninguna inversión legítima promete retornos desproporcionados garantizados sin riesgo.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-finanzas-l4'),
    build: () => ({
      summary:
        'Blinda tus cuentas y tarjetas digitales aplicando autenticación 2FA, tarjetas virtuales dinámicas y detección de fraudes financieros (phishing, smishing y vishing).',
      learningObjectives: [
        'Identificar ataques de ingeniería social bancaria como phishing, smishing (SMS) y vishing (llamadas falsas).',
        'Utilizar tarjetas digitales con CVV dinámico para compras en línea y desactivar compras internacionales cuando no se usen.',
        'Configurar límites por transacción y autenticación biométrica o TOTP en tus cuentas.',
      ],
      readingBody: [
        'La digitalización financiera agiliza pagos, transferencias SPEI y compras educativas, pero también exige higiene de ciberseguridad bancaria. Más del 80% de los fraudes financieros actuales no ocurren por "hackeos" matemáticos complejos, sino por ingeniería social: engañar al usuario para que entregue su código SMS, contraseña o apruebe una compra falsa.',
        'Los tres vectores principales son el Phishing (correos apócrifos imitando a tu banco con enlaces urgentes de "cuenta bloqueada"), Smishing (mensajes SMS falsos sobre paquetes retenidos o cargos no reconocidos) y Vishing (llamadas telefónicas donde un supuesto ejecutivo pide validar un código de seguridad que en realidad autoriza una transferencia).',
        'Las defensas técnicas clave incluyen: activar alertas instantáneas de cada movimiento, usar exclusivamente tarjetas digitales con CVV dinámico que caduca en minutos para compras web, establecer topes diarios de retiro/transferencia y habilitar 2FA basado en app TOTP o biometría.',
      ],
      keyConcepts: [
        { term: 'CVV Dinámico', detail: 'Código de seguridad de 3 dígitos que cambia cada pocos minutos para proteger compras en línea.' },
        { term: 'Smishing / Vishing', detail: 'Estafas por SMS o llamada telefónica haciéndose pasar por personal bancario.' },
        { term: 'Apagado Temporal', detail: 'Bloqueo preventivo de tarjetas desde la app oficial mientras no realizas compras.' },
        { term: '2FA Bancario', detail: 'Doble verificación que impide operar tu cuenta aunque alguien robe tu contraseña.' },
      ],
      stepByStepGuide: [
        'Revisa el dominio exacto de cualquier correo financiero; nunca hagas clic en enlaces urgentes: abre la app oficial directamente.',
        'Para compras por internet, genera una tarjeta digital con CVV dinámico en lugar de usar los números de tu tarjeta física.',
        'Configura el límite máximo por compra en línea y apaga temporalmente tu tarjeta física si no la utilizas.',
        'Nunca dictes por teléfono códigos OTP o claves que lleguen por SMS: ningún banco real los solicita.',
      ],
      practicalExample: {
        title: 'Protocolo ante SMS sospechoso de "cargo no reconocido"',
        snippetOrCase:
          '1) NO abras el enlace del SMS.\n2) Cierra el mensaje y abre manualmente la app oficial de tu banco.\n3) Revisa tus movimientos reales; si hubiera duda, llama al número impreso al reverso de tu tarjeta.',
        takeaway:
          'Romper la urgencia artificial del atacante y verificar siempre por el canal oficial neutraliza prácticamente cualquier estafa.',
      },
      commonMistake:
        'Usar la tarjeta de débito física con el saldo de toda tu cuenta para suscripciones o páginas desconocidas en lugar de tarjeta digital con límite bajo.',
      organizerTitle: 'Escudo de Seguridad Bancaria Digital',
      organizerNodes: [
        { title: '1. Tarjeta Digital', detail: 'Usa CVV dinámico y topes de monto en compras web.' },
        { title: '2. Canal Oficial', detail: 'Ignora enlaces en SMS/correos; entra directo a tu app.' },
        { title: '3. Cero Códigos', detail: 'Jamás compartas NIP, contraseñas ni códigos por llamada.' },
        { title: '4. Monitoreo', detail: 'Activa notificaciones inmediatas de cada movimiento.' },
      ],
      multimediaTitle: 'Cómo Reconocer y Frenar Fraudes Bancarios',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'Anatomía de un mensaje de Smishing y Vishing',
          explanation: 'Frases de urgencia artificial y dominios clonados que delatan a un estafador.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Tarjetas virtuales con CVV temporal y topes',
          explanation: 'Cómo aislar tus ahorros principales cuando compras software, libros o cursos en línea.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Qué hacer en los primeros 5 minutos ante un robo',
          explanation: 'Bloqueo inmediato en app, cambio de claves y levantamiento de folio de aclaración.',
        },
      ],
      imageCaption: 'Protección de operaciones digitales con verificación en dos pasos y tarjetas virtuales.',
      practiceQuestions: [
        {
          prompt: 'Recibes una llamada del supuesto departamento de fraudes pidiendo el código de 6 dígitos que acaba de llegar a tu SMS. ¿Qué debes hacer?',
          options: [
            'Colgar inmediatamente y verificar en la app oficial del banco sin compartir el código',
            'Leer el código rápido para evitar cargos',
            'Enviar captura de pantalla del mensaje',
          ],
          correctIndex: 0,
          explanation: 'Los bancos nunca piden códigos OTP por llamada; entregar ese código autoriza al estafador.',
        },
        {
          prompt: '¿Qué ventaja ofrece una tarjeta digital con CVV dinámico al comprar en internet?',
          options: [
            'El código caduca tras unos minutos, impidiendo cargos posteriores si el sitio sufre una filtración',
            'Elimina el costo de tus compras',
            'No requiere tener saldo',
          ],
          correctIndex: 0,
          explanation: 'Al expirar el CVV dinámico rápidamente, los datos capturados dejan de servir.',
        },
        {
          prompt: '¿Cuál es la forma segura de verificar un aviso de "cuenta suspendida" recibido por correo?',
          options: [
            'Abrir directamente la aplicación oficial o escribir manualmente la dirección oficial del banco',
            'Pulsar el botón rojo dentro del correo recibido',
            'Responder el correo con tu número de tarjeta',
          ],
          correctIndex: 0,
          explanation: 'Entrar por tu propio marcador o app oficial evita caer en sitios clonados.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-tiempo-l5'),
    build: () => ({
      summary:
        'Implementa Time-Blocking en Google Calendar u Outlook para transformar listas interminables de pendientes en bloques concretos de estudio y trabajo profundo.',
      learningObjectives: [
        'Aplicar el principio de Time-Blocking asignando hora de inicio, fin y objetivo verificable a cada tarea importante.',
        'Diferenciar bloques de trabajo profundo (Deep Work) de bloques administrativos o de descanso.',
        'Integrar calendarios digitales y archivos .ICS para sincronizar entregas entre computadora y móvil.',
      ],
      readingBody: [
        'Las listas de tareas tradicionales ("To-Do lists") suelen fracasar porque ignoran el tiempo real que toma cada actividad: puedes anotar 15 pendientes imposibles de cumplir en 4 horas y terminar el día frustrado. El Time-Blocking resuelve este problema obligándote a asignar cada tarea prioritaria a un espacio físico en tu calendario.',
        'En herramientas como Google Calendar o Microsoft Outlook, cada bloque responde a tres preguntas: qué harás exactamente, cuánto tiempo durará y cuándo descansará tu mente. Reservar bloques de 60 a 90 minutos sin notificaciones para estudio de programación, matemáticas o proyectos creativos ("trabajo profundo") multiplica la retención frente a estudiar en fragmentos distraídos.',
        'Un calendario realista siempre incluye "bloques colchón" (15 a 30 minutos de holgura al día) para absorber imprevistos sin derrumbar toda la agenda de la semana.',
      ],
      keyConcepts: [
        { term: 'Time-Blocking', detail: 'Técnica de reservar bloques horarios específicos en el calendario para cada actividad clave.' },
        { term: 'Trabajo Profundo', detail: 'Bloques de alta concentración sin redes sociales ni multitarea.' },
        { term: 'Bloque Colchón', detail: 'Margen diario reservado para imprevistos, traslados o retrasos.' },
        { term: 'Archivo .ICS', detail: 'Estándar universal de eventos importable en Google Calendar, Apple Calendar y Outlook.' },
      ],
      stepByStepGuide: [
        'Lista tus 3 prioridades académicas o profesionales de la semana antes de llenar el calendario.',
        'Bloquea primero horarios fijos inamovibles (clases, sueño, comidas, traslados).',
        'Asigna bloques de 50–90 minutos en tus horas de mayor energía mental para tareas técnicas complejas.',
        'Agrupa tareas rápidas (responder correos, subir archivos) en un solo bloque administrativo de 30 minutos.',
        'Activa un recordatorio 10 minutos antes de iniciar cada bloque y usa el botón "Agendar en Calendario" de MentMar.',
      ],
      practicalExample: {
        title: 'Bloque matutino de alto rendimiento (09:00 – 11:00)',
        snippetOrCase:
          '09:00–10:15 · [Profundo] Resolver práctica de Flexbox y JavaScript (sin notificaciones)\n10:15–10:30 · Pausa activa / hidratación\n10:30–11:00 · [Admin] Revisar correos y subir entregables',
        takeaway:
          'Separar creación técnica de tareas administrativas evita cambiar de contexto mental cada 5 minutos.',
      },
      commonMistake:
        'Llenar el 100% del calendario bloque tras bloque sin dejar pausas ni margen para imprevistos; al primer retraso se abandona toda la planeación.',
      organizerTitle: 'Método Time-Blocking Semanal',
      organizerNodes: [
        { title: '1. Prioridades', detail: 'Elige máximo 3 metas clave por día.' },
        { title: '2. Bloques Profundos', detail: 'Asigna horario fijo en tu pico de energía.' },
        { title: '3. Bloques Colchón', detail: 'Deja holgura para imprevistos reales.' },
        { title: '4. Revisión Nocturna', detail: 'Ajusta el calendario del día siguiente en 5 min.' },
      ],
      multimediaTitle: 'De Lista Caótica a Calendario con Time-Blocking',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'Por qué las listas sin horario generan procrastinación',
          explanation: 'Cómo la ambigüedad temporal hace que pospongamos lo importante por lo fácil.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Código de colores y bloques en Google Calendar / Outlook',
          explanation: 'Organización visual entre estudio técnico, bienestar, clases y descansos.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Cómo replanificar sin culpa cuando surge un imprevisto',
          explanation: 'Uso de bloques colchón y regla de ajuste rápido.',
        },
      ],
      imageCaption: 'Organización visual de bloques de estudio y proyectos mediante calendarios digitales.',
      practiceQuestions: [
        {
          prompt: '¿Qué problema principal resuelve el Time-Blocking frente a una lista tradicional de tareas?',
          options: [
            'Obliga a asignar tiempo realista y horario específico a cada actividad',
            'Elimina la necesidad de dormir',
            'Multiplica las horas del día a 30',
          ],
          correctIndex: 0,
          explanation: 'Al poner la tarea en el calendario compruebas cuánto tiempo cabe realmente en tu día.',
        },
        {
          prompt: '¿Para qué sirve incluir un "bloque colchón" diario en tu agenda?',
          options: [
            'Absorber imprevistos sin arruinar el resto de tu planificación',
            'Revisar redes sociales durante el bloque de examen',
            'Evitar tomar notas en clase',
          ],
          correctIndex: 0,
          explanation: 'El margen de holgura hace sostenible la planificación ante retrasos reales.',
        },
        {
          prompt: '¿En qué horario conviene colocar las tareas cognitivas más exigentes (programación, análisis)?',
          options: [
            'En tus bloques de mayor energía y menor interrupción',
            'Al final de la noche con fatiga extrema',
            'Entre notificaciones constantes de mensajería',
          ],
          correctIndex: 0,
          explanation: 'Alinear la dificultad de la tarea con tu pico de energía reduce errores y tiempo de ejecución.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-tiempo-l6'),
    build: () => ({
      summary:
        'Aplica la Matriz de Eisenhower automatizada en Notion, Trello o Todoist para distinguir lo urgente de lo importante y evitar vivir apagando incendios.',
      learningObjectives: [
        'Clasificar cualquier pendiente en los 4 cuadrantes de Eisenhower: Hacer, Programar, Delegar o Eliminar.',
        'Construir tableros visuales Kanban (Por hacer / En proceso / Hecho) en plataformas en la nube.',
        'Reducir tareas del cuadrante de crisis mediante planificación anticipada.',
      ],
      readingBody: [
        'No todas las tareas merecen tu energía inmediata. Dwight Eisenhower popularizó una distinción vital: lo importante tiene un impacto directo en tus metas a mediano/largo plazo, mientras que lo urgente exige atención inmediata (frecuentemente por fechas límite ajenas o falta de prevención). Confundir ambos ejes provoca jornadas agotadoras sin avance real.',
        'La Matriz de Eisenhower cruza ambos criterios en 4 cuadrantes: Q1 (Importante y Urgente -> Hacer hoy), Q2 (Importante y No Urgente -> Programar en calendario, donde nacen los proyectos reales y el aprendizaje), Q3 (No Importante y Urgente -> Delegar o automatizar) y Q4 (No Importante y No Urgente -> Eliminar).',
        'En herramientas digitales como Notion, Trello o Todoist puedes crear etiquetas o vistas Kanban que ordenan tus tareas automáticamente por cuadrante, evitando que las urgencias triviales sepulten tu crecimiento profesional.',
      ],
      keyConcepts: [
        { term: 'Cuadrante 1 (Crisis)', detail: 'Importante y urgente: entregas de hoy o fallas críticas que resolver ya.' },
        { term: 'Cuadrante 2 (Estrategia)', detail: 'Importante pero no urgente: estudiar tecnología, salud y proyectos de futuro.' },
        { term: 'Cuadrante 3 (Ruido)', detail: 'Urgente pero poco importante: interrupciones o favores ajenos delegables.' },
        { term: 'Tablero Kanban', detail: 'Flujo visual en columnas (Pendiente -> En curso -> Terminado) para limitar trabajo simultáneo.' },
      ],
      stepByStepGuide: [
        'Vacía todos tus pendientes mentales en una bandeja de entrada única en Todoist, Trello o Notion.',
        'Asigna a cada tarea dos etiquetas o propiedades: ¿Es Importante? y ¿Es Urgente?',
        'Ejecuta primero máximo 2 tareas del Q1 y agenda en tu calendario las del Q2.',
        'Elimina sin remordimiento tareas Q4 que solo consumen atención.',
      ],
      practicalExample: {
        title: 'Clasificación real de un estudiante STEM',
        snippetOrCase:
          'Q1 (Hacer hoy): Entregar práctica que cierra hoy a las 23:59.\nQ2 (Agendar): Avanzar 45 min en proyecto integrador de Python.\nQ3 (Acotar): Responder chat grupal en bloque de 15 min.\nQ4 (Eliminar): Scroll infinito sin objetivo.',
        takeaway:
          'Mientras más tiempo inviertas en el Cuadrante 2, menos emergencias aparecerán en el Cuadrante 1.',
      },
      commonMistake:
        'Tratar cada notificación de chat o correo como Cuadrante 1 urgente, interrumpiendo el estudio importante del Cuadrante 2.',
      organizerTitle: 'Los 4 Cuadrantes de Eisenhower Digital',
      organizerNodes: [
        { title: 'Q1 · Hacer Ahora', detail: 'Urgente + Importante (entregas críticas).' },
        { title: 'Q2 · Planificar', detail: 'No Urgente + Importante (crecimiento real).' },
        { title: 'Q3 · Delegar/Acotar', detail: 'Urgente + No Importante (interrupciones).' },
        { title: 'Q4 · Eliminar', detail: 'Ni Urgente ni Importante (distractores).' },
      ],
      multimediaTitle: 'Priorización Inteligente con Matriz de Eisenhower',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'La trampa de vivir en lo urgente',
          explanation: 'Diferencia práctica entre actividad constante y progreso real.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Configuración en Notion / Trello / Todoist',
          explanation: 'Filtros automáticos para destacar tus 3 tareas de mayor impacto diario.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'El poder del Cuadrante 2',
          explanation: 'Cómo proteger tiempo semanal para proyectos STEM, lectura y bienestar.',
        },
      ],
      imageCaption: 'Tablero de priorización y flujo de tareas mediante Matriz de Eisenhower.',
      practiceQuestions: [
        {
          prompt: 'Aprender un nuevo módulo de programación con 3 semanas de anticipación pertenece al cuadrante:',
          options: [
            'Q2: Importante pero No Urgente (Programar)',
            'Q4: Ni Urgente ni Importante (Eliminar)',
            'Q3: Urgente pero No Importante',
          ],
          correctIndex: 0,
          explanation: 'El aprendizaje estratégico es de alto impacto (Importante) y se planifica antes de convertirse en crisis.',
        },
        {
          prompt: '¿Qué recomienda un tablero Kanban para evitar saturación mental?',
          options: [
            'Limitar la cantidad de tareas en la columna "En proceso" a la vez',
            'Empezar 20 tareas simultáneamente',
            'Borrar tareas sin completarlas',
          ],
          correctIndex: 0,
          explanation: 'Limitar el trabajo en curso (WIP) acelera el cierre de actividades con mayor calidad.',
        },
        {
          prompt: '¿Qué debes hacer con las actividades ubicadas en el Cuadrante 4?',
          options: [
            'Eliminarlas o reducirlas al mínimo porque no aportan valor ni urgencia real',
            'Hacerlas primero que tu proyecto final',
            'Convertirlas en tu prioridad principal',
          ],
          correctIndex: 0,
          explanation: 'El Cuadrante 4 agrupa distractores de bajo valor que restan tiempo al Cuadrante 2.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-tiempo-l7'),
    build: () => ({
      summary:
        'Domina la Técnica Pomodoro con temporizadores digitales y estrategias prácticas de desconexión para eliminar la fatiga cognitiva y vencer la procrastinación.',
      learningObjectives: [
        'Ejecutar ciclos de enfoque profundo de 25 minutos seguidos de 5 minutos de descanso real.',
        'Aplicar el principio de "arranque en 5 minutos" para superar la resistencia inicial ante tareas difíciles.',
        'Configurar modos de concentración en computadora y teléfono para blindar cada Pomodoro.',
      ],
      readingBody: [
        'Procrastinar rara vez es pereza; casi siempre es una respuesta emocional al estrés o a percibir una tarea como demasiado grande ("tengo que terminar todo el proyecto hoy"). La Técnica Pomodoro creada por Francesco Cirillo divide cualquier reto intimidante en un compromiso manejable: solo 25 minutos de atención plena a una única tarea.',
        'Durante esos 25 minutos, tu única regla es proteger el foco: teléfono en modo No Molestar fuera de la vista, pestañas irrelevantes cerradas y una hoja al lado para anotar pensamientos distractores sin actuar sobre ellos hasta que suene la alarma. Al terminar, tomas 5 minutos de descanso físico (estirarte, tomar agua, mirar a lo lejos; no scrollear redes sociales que saturan la atención).',
        'Después de 4 ciclos Pomodoro consecutivos, tomas una pausa larga de 15 a 20 minutos para consolidar memoria. Puedes practicar inmediatamente con el temporizador Pomodoro en vivo dentro de la pestaña Simulador de esta lección.',
      ],
      keyConcepts: [
        { term: 'Ciclo 25 / 5', detail: '25 minutos de ejecución sin interrupciones + 5 minutos de recuperación física.' },
        { term: 'Pausa Larga', detail: 'Descanso de 15–20 minutos cada 4 Pomodoros completados.' },
        { term: 'Lista de Distracciones', detail: 'Hoja rápida para anotar pendientes fugaces sin abandonar el ciclo activo.' },
        { term: 'Modo Concentración', detail: 'Bloqueo de notificaciones emergentes en SO y navegador durante el bloque.' },
      ],
      stepByStepGuide: [
        'Elige UNA sola tarea específica y medible (ej. "Completar Lección 4 y sus ejercicios").',
        'Activa el modo No Molestar en tus dispositivos y cierra redes sociales.',
        'Inicia el temporizador de 25 minutos en el Simulador de esta lección.',
        'Al sonar la campana, levántate 5 minutos lejos de la pantalla antes de iniciar el siguiente ciclo.',
      ],
      practicalExample: {
        title: 'Bloque de estudio de 2 horas con Pomodoro',
        snippetOrCase:
          'Pomodoro 1 (25m): Lectura + resumen técnico\nPausa (5m): Agua y estiramiento\nPomodoro 2 (25m): Práctica en simulador\nPausa (5m): Descanso visual\nPomodoro 3 (25m): Ejercicios y bitácora E2EE\nPausa larga (15m)',
        takeaway:
          'Dos horas estructuradas con pausas activas rinden más que cuatro horas de estudio fragmentado con el celular al lado.',
      },
      commonMistake:
        'Usar los 5 minutos de pausa para ver videos cortos o redes sociales; eso mantiene el cerebro sobreestimulado y dificulta regresar al segundo Pomodoro.',
      organizerTitle: 'Ciclo de Enfoque Pomodoro',
      organizerNodes: [
        { title: '1. Meta Única', detail: 'Define una sola tarea concreta antes de empezar.' },
        { title: '2. Foco 25 min', detail: 'Trabaja sin cambiar de pestaña ni revisar mensajes.' },
        { title: '3. Pausa Activa 5 min', detail: 'Despega la vista de la pantalla y respira.' },
        { title: '4. Ciclo x4', detail: 'Cada 4 bloques toma un descanso largo de 15–20 min.' },
      ],
      multimediaTitle: 'Neurociencia del Foco y Técnica Pomodoro',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'El costo oculto del cambio de contexto',
          explanation: 'Cada interrupción por notificación tarda varios minutos en restaurar la concentración profunda.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Anatomía perfecta de un ciclo 25/5',
          explanation: 'Cómo preparar tu escritorio digital, anotar distracciones y aprovechar las micropausas.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Adaptación para código y proyectos largos',
          explanation: 'Cuándo usar ciclos de 25/5 (arranque) vs. 50/10 (flujo continuo de programación).',
        },
      ],
      imageCaption: 'Gestión de ciclos de concentración y mitigación de distracciones digitales.',
      practiceQuestions: [
        {
          prompt: '¿Qué es lo más recomendable hacer durante los 5 minutos de descanso entre Pomodoros?',
          options: [
            'Levantarte, hidratarte y descansar la vista lejos de redes sociales',
            'Revisar 20 videos cortos en el teléfono',
            'Saltarte el descanso para terminar más rápido',
          ],
          correctIndex: 0,
          explanation: 'El descanso lejos de estímulos digitales rápidos permite que tu atención se recupere realmente.',
        },
        {
          prompt: 'Si durante un Pomodoro recuerdas que debes enviar un correo, ¿qué debes hacer?',
          options: [
            'Anotarlo rápido en tu hoja de pendientes y terminar el Pomodoro en curso',
            'Detener todo de inmediato para revisar la bandeja de entrada',
            'Abrir 5 pestañas nuevas mientras sigues leyendo',
          ],
          correctIndex: 0,
          explanation: 'Registrar la idea en papel libera la mente sin romper el bloque de concentración.',
        },
        {
          prompt: '¿Cada cuántos Pomodoros se recomienda tomar una pausa larga de 15 a 20 minutos?',
          options: ['Cada 4 Pomodoros', 'Cada 10 minutos', 'Nunca'],
          correctIndex: 0,
          explanation: 'Cada 4 ciclos (aprox. 2 horas) conviene un descanso prolongado para consolidar lo aprendido.',
        },
      ],
    }),
  },
  {
    match: (id) => id.startsWith('talleres-stem-talleres-tiempo-l8'),
    build: () => ({
      summary:
        'Diseña flujos de automatización personal, recordatorios multidispositivo y hábitos sostenibles para equilibrar el desempeño académico con tu bienestar físico y mental.',
      learningObjectives: [
        'Conectar recordatorios multidispositivo entre calendario, correo y listas de tareas.',
        'Reducir tareas repetitivas mediante plantillas reutilizables y reglas de automatización básicas.',
        'Establecer un ritual de cierre diario y límites saludables de desconexión digital.',
      ],
      readingBody: [
        'La verdadera productividad no consiste en hacer más cosas hasta el agotamiento, sino en liberar tu mente de recordar detalles repetitivos para dedicar tu energía a crear, aprender y descansar con tranquilidad. Cuando tu sistema de tareas, calendario y archivos está sincronizado entre celular y computadora, tu cerebro deja de cargar ansiedad por "lo que se me puede olvidar".',
        'Automatizar en lo cotidiano es más sencillo de lo que parece: usar plantillas de documentos para reportes semanales, configurar reglas de filtrado en correo, programar recordatorios recurrentes (ej. "respaldo de archivos cada viernes", "corte financiero cada domingo") y generar eventos .ICS sincronizados.',
        'Igualmente crítico es definir una hora de apagado digital ("sunset ritual"): cerrar pendientes del día en 5 minutos, dejar lista la primera tarea de mañana y desconectar pantallas antes de dormir para proteger la calidad del descanso y la memoria.',
      ],
      keyConcepts: [
        { term: 'Sincronización Multidispositivo', detail: 'Capturar una idea en el móvil y verla al instante en tu computadora.' },
        { term: 'Recurrencia Automática', detail: 'Eventos repetitivos semanales o mensuales que no vuelves a escribir manualmente.' },
        { term: 'Plantillas Personales', detail: 'Estructuras base de apuntes, correos o entregas listas para duplicar.' },
        { term: 'Ritual de Cierre', detail: 'Revisión de 5 minutos al final de la jornada para desconectar sin pendientes mentales.' },
      ],
      stepByStepGuide: [
        'Identifica 3 actividades que repites cada semana (entregas, repaso, respaldos o presupuesto).',
        'Configura recordatorios recurrentes automáticos en tu calendario digital para cada una.',
        'Crea una carpeta de "Plantillas" en tu nube con formatos listos de reportes, notas y correos.',
        'Establece un horario fijo de cierre de pantallas nocturno para cuidar tu descanso.',
      ],
      practicalExample: {
        title: 'Flujo semanal automatizado de estudiante MentMar',
        snippetOrCase:
          'Lunes 08:00 (recurrente): Plan semanal en 10 min\nMiércoles 18:00 (notificación): Avance de lecciones STEM\nViernes 17:00 (recurrente): Respaldo en nube + revisión de gastos\nDiario 22:00: Modo descanso en móvil',
        takeaway:
          'Cuando los hábitos clave tienen horario recurrente y respaldo en la nube, la constancia deja de depender de la fuerza de voluntad.',
      },
      commonMistake:
        'Instalar diez aplicaciones distintas de productividad que no se comunican entre sí, duplicando esfuerzos de captura.',
      organizerTitle: 'Sistema Sostenible de Productividad y Bienestar',
      organizerNodes: [
        { title: '1. Captura Única', detail: 'Centraliza tareas en un solo ecosistema sincronizado.' },
        { title: '2. Plantillas', detail: 'Reutiliza formatos en lugar de empezar de cero.' },
        { title: '3. Recurrencia', detail: 'Automatiza recordatorios semanales clave.' },
        { title: '4. Desconexión', detail: 'Protege sueño, salud y tiempo fuera de pantalla.' },
      ],
      multimediaTitle: 'Automatización Personal y Equilibrio Digital',
      multimediaSteps: [
        {
          timeLabel: '00:00 – 01:30',
          heading: 'Por qué el cerebro necesita un sistema externo confiable',
          explanation: 'Liberar memoria de trabajo reduce el estrés y mejora la creatividad.',
        },
        {
          timeLabel: '01:30 – 03:30',
          heading: 'Recordatorios recurrentes y plantillas en la nube',
          explanation: 'Cómo ahorrar horas al mes automatizando entregas y revisiones periódicas.',
        },
        {
          timeLabel: '03:30 – 05:00',
          heading: 'Higiene digital y descanso reparador',
          explanation: 'Límites saludables de pantalla para sostener un rendimiento constante todo el año.',
        },
      ],
      imageCaption: 'Sincronización multidispositivo, automatización de hábitos y bienestar digital.',
      practiceQuestions: [
        {
          prompt: '¿Qué beneficio aporta mantener un único sistema sincronizado entre móvil y computadora?',
          options: [
            'Evita olvidos, duplicidad de listas y reduce la ansiedad mental',
            'Hace más lento tu equipo',
            'Impide trabajar en equipo',
          ],
          correctIndex: 0,
          explanation: 'Centralizar pendientes en la nube garantiza acceso inmediato desde cualquier dispositivo.',
        },
        {
          prompt: '¿Para qué sirve un "ritual de cierre" al final de la jornada de estudio?',
          options: [
            'Dejar definida la primera tarea del día siguiente y descansar sin pendientes en mente',
            'Empezar un proyecto complejo a medianoche',
            'Borrar todos tus apuntes del día',
          ],
          correctIndex: 0,
          explanation: 'Cerrar ordenadamente facilita desconectar y arrancar el día siguiente sin fricción.',
        },
        {
          prompt: '¿Qué tarea conviene automatizar mediante recordatorio recurrente semanal?',
          options: [
            'Respaldo de archivos escolares y revisión de metas o finanzas',
            'Escribir manualmente cada mensaje personal',
            'Desinstalar tus herramientas cada lunes',
          ],
          correctIndex: 0,
          explanation: 'Las rutinas periódicas son ideales para recordatorios recurrentes automáticos.',
        },
      ],
    }),
  },
];

// ============================================================
// MODULE-LEVEL TECHNICAL KNOWLEDGE PROFILES (ALL 28 MODULES)
// ============================================================
const MODULE_PROFILES: Record<string, ModuleKnowledgeProfile> = {
  m1: {
    domainLabel: 'Arquitectura de Cómputo y Sistema Operativo',
    tools: 'Hardware PC/Laptop, Teclado, Mouse, Explorador de Archivos, Compresor ZIP',
    contextIntro:
      'El dominio físico y operativo de la computadora es la base de toda productividad digital. Entender cómo interactúan el hardware y el sistema operativo te permite trabajar con rapidez, proteger la vida útil del equipo y mantener tus documentos siempre localizables.',
    conceptPairs: [
      { term: 'CPU y RAM', detail: 'La CPU ejecuta instrucciones; la RAM almacena temporalmente los programas abiertos mientras trabajas.' },
      { term: 'Almacenamiento (SSD/HDD)', detail: 'Guarda archivos y sistema operativo de forma permanente incluso al apagar el equipo.' },
      { term: 'Rutas y Extensiones', detail: 'La extensión (.docx, .xlsx, .pdf, .zip) indica qué programa abre el archivo y su formato.' },
      { term: 'Atajos de Productividad', detail: 'Ctrl+C (copiar), Ctrl+V (pegar), Ctrl+Z (deshacer) y Alt+Tab (cambiar ventana) aceleran cada flujo.' },
    ],
    workflowSteps: [
      'Identifica los componentes físicos o elementos del escritorio involucrados en la tarea.',
      'Aplica el procedimiento o atajo correcto verificando respuesta visual en pantalla.',
      'Organiza tus archivos dentro de una estructura lógica de carpetas (Año > Materia > Actividad).',
      'Verifica integridad de guardado o respaldo antes de cerrar sesión o expulsar unidades USB.',
    ],
    exampleTemplate: (topic, subitems) => ({
      title: `Práctica aplicada: ${topic}`,
      snippetOrCase: `Estructura recomendada:\nDocumentos/MentMar/2026/${subitems[0] || 'Modulo_1'}/\n  ├── 01_Lecturas/\n  ├── 02_Practicas/\n  └── Entrega_Final.zip`,
      takeaway: 'Una jerarquía clara de carpetas evita pérdidas de archivos y ahorra minutos cada día.',
    }),
    commonPitfall:
      'Desconectar el equipo directamente de la corriente o retirar memorias USB sin expulsar de forma segura puede corromper archivos abiertos.',
    organizerPattern: (topic) => [
      { title: '1. Hardware / Interfaz', detail: `Reconoce los elementos físicos o del sistema para ${topic}.` },
      { title: '2. Acción Operativa', detail: 'Ejecuta el comando, clic o atajo con precisión.' },
      { title: '3. Organización', detail: 'Clasifica por carpetas, nombres claros y formato adecuado.' },
      { title: '4. Resguardo', detail: 'Verifica almacenamiento seguro y respaldo.' },
    ],
    quizPool: (topic) => [
      {
        prompt: `Al trabajar con "${topic}", ¿qué buena práctica garantiza el cuidado y orden del equipo?`,
        options: [
          'Seguir procedimientos ordenados del sistema operativo y nombrar archivos claramente',
          'Guardar todo en el escritorio sin carpetas ni nombres descriptivos',
          'Apagar el equipo desconectando el cable eléctrico directamente',
        ],
        correctIndex: 0,
        explanation: 'El orden en directorios y el uso correcto del sistema protegen información y hardware.',
      },
      {
        prompt: '¿Qué combinación de teclado permite deshacer inmediatamente una acción o borrado accidental?',
        options: ['Ctrl + Z', 'Ctrl + P', 'Alt + F4'],
        correctIndex: 0,
        explanation: 'Ctrl + Z revierte el último cambio en la mayoría de aplicaciones y exploradores de archivos.',
      },
      {
        prompt: '¿Qué indica la extensión al final del nombre de un archivo (por ejemplo .pdf o .zip)?',
        options: [
          'El tipo de formato y la aplicación compatible para abrirlo',
          'El color del monitor necesario',
          'La velocidad del procesador',
        ],
        correctIndex: 0,
        explanation: 'La extensión define la estructura interna del archivo y qué software puede procesarlo.',
      },
    ],
  },

  m2: {
    domainLabel: 'Navegación Crítica, Ciberseguridad y Ciudadanía Digital',
    tools: 'Navegadores Web (Chrome/Edge/Firefox), Buscadores, HTTPS/SSL, Gestor 2FA',
    contextIntro:
      'Navegar en internet de manera profesional requiere mucho más que escribir palabras en un buscador: implica filtrar fuentes confiables, verificar conexiones cifradas, blindar cuentas con contraseñas robustas y convivir con ética y criterio crítico.',
    conceptPairs: [
      { term: 'Protocolo HTTPS + Candado', detail: 'Cifra el tráfico entre tu navegador y el sitio web mediante certificados SSL/TLS.' },
      { term: 'Operadores de Búsqueda', detail: 'Comillas ("frase exacta"), signo menos (-excluir) y site:edu.mx afinan resultados.' },
      { term: 'Phishing e Ingeniería Social', detail: 'Correos o sitios falsos que imitan servicios reales para robar contraseñas.' },
      { term: 'Huella Digital y Netiquette', detail: 'Todo lo publicado deja rastro; la convivencia respetuosa protege tu reputación.' },
    ],
    workflowSteps: [
      'Formula búsquedas precisas usando comillas y filtros de fecha o dominio institucional.',
      'Contrasta al menos dos fuentes confiables antes de compartir cualquier noticia o dato.',
      'Verifica siempre la URL exacta y el candado HTTPS antes de ingresar credenciales.',
      'Activa contraseñas únicas de 12+ caracteres y autenticación en dos pasos (2FA).',
    ],
    exampleTemplate: (topic, subitems) => ({
      title: `Verificación segura: ${topic}`,
      snippetOrCase: `Búsqueda filtrada: "${subitems[0] || topic}" site:.edu.mx OR site:.gob.mx\nRevisión URL: https://banco-oficial.com  ✓  vs  http://banc0-alerta-urgente.xyz  ✗`,
      takeaway: 'Leer siempre el dominio raíz real antes de hacer clic previene la mayoría de fraudes web.',
    }),
    commonPitfall:
      'Reutilizar la misma contraseña corta en todas tus redes y plataformas escolares; si un sitio se filtra, todas tus cuentas quedan expuestas.',
    organizerPattern: (topic) => [
      { title: '1. Búsqueda Crítica', detail: `Filtra información verificada sobre ${topic}.` },
      { title: '2. Validación Técnica', detail: 'Confirma dominio auténtico y cifrado HTTPS.' },
      { title: '3. Protección Activa', detail: 'Aplica contraseñas robustas, 2FA y privacidad.' },
      { title: '4. Ética Digital', detail: 'Ejerce ciudadanía respetuosa y reporta riesgos.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué indica el protocolo HTTPS junto al ícono de candado en la barra del navegador?',
        options: [
          'Que la comunicación entre tu navegador y el servidor viaja cifrada',
          'Que todo el contenido publicado es automáticamente verdadero',
          'Que tu equipo no necesita antivirus ni contraseñas',
        ],
        correctIndex: 0,
        explanation: 'HTTPS cifra los datos en tránsito, aunque siempre debes verificar también el dominio real.',
      },
      {
        prompt: '¿Qué operador de búsqueda sirve para encontrar exactamente una frase completa sin alterar el orden?',
        options: ['Encerrar la frase entre comillas ("...")', 'Agregar muchos signos de exclamación', 'Escribir todo en mayúsculas'],
        correctIndex: 0,
        explanation: 'Las comillas fuerzan al buscador a coincidir exactamente con la cadena indicada.',
      },
      {
        prompt: 'Ante un caso de ciberacoso o intento de phishing, ¿cuál es la acción responsable?',
        options: [
          'Guardar evidencia (capturas), bloquear/reportar al agresor y avisar a un adulto o autoridad escolar',
          'Responder con insultos o compartir contraseñas',
          'Borrar el historial sin avisar a nadie',
        ],
        correctIndex: 0,
        explanation: 'Documentar evidencia, bloquear el contacto y reportar por canales formales detiene el riesgo.',
      },
    ],
  },

  m3: {
    domainLabel: 'Procesamiento de Texto Profesional (Microsoft Word)',
    tools: 'Microsoft Word, Cinta de Opciones, Estilos de Párrafo, Tablas y Exportación PDF',
    contextIntro:
      'Un documento profesional comunica autoridad antes de leer la primera palabra. Dominar márgenes, alineación, sangrías, tablas limpias, encabezados y exportación a PDF transforma trabajos escolares y oficios administrativos en entregables listos para cualquier institución.',
    conceptPairs: [
      { term: 'Sangría y Espaciado', detail: 'Controlan la respiración visual del párrafo sin usar espacios o Enter repetidos.' },
      { term: 'Ajuste Envolvente', detail: 'Permite integrar imágenes con el texto (Cuadrado, Estrecho, Arriba y abajo) sin desordenar.' },
      { term: 'Encabezado y Pie', detail: 'Repiten automáticamente logotipos, títulos y numeración en todas las páginas.' },
      { term: 'Exportación a PDF', detail: 'Congela tipografía y maquetación para que el documento se vea idéntico en cualquier dispositivo.' },
    ],
    workflowSteps: [
      'Configura desde el inicio tamaño de papel (Carta/A4), orientación y márgenes adecuados.',
      'Aplica tipografía legible, jerarquía clara de títulos e interlineado uniforme (1.15 o 1.5).',
      'Estructura datos comparativos mediante tablas reales con encabezados sombreados.',
      'Pasa el corrector ortográfico y exporta la versión final tanto en .docx editable como en .pdf.',
    ],
    exampleTemplate: (topic) => ({
      title: `Maquetación estándar: ${topic}`,
      snippetOrCase:
        'Fuente cuerpo: Calibri/Segoe UI 11 pt · Interlineado: 1.15 · Margen: 2.5 cm\nFormato entrega: Proyecto_MentMar_vFinal.pdf',
      takeaway: 'Usar herramientas nativas de formato (y nunca decenas de espacios manuales) mantiene el documento intacto al editarlo.',
    }),
    commonPitfall:
      'Alinear títulos o columnas presionando repetidamente la barra espaciadora o Enter; en cuanto cambias una línea o impresora, todo se descuadra.',
    organizerPattern: (topic) => [
      { title: '1. Página Base', detail: 'Define márgenes, tamaño de hoja y orientación.' },
      { title: '2. Tipografía y Párrafo', detail: `Aplica formato limpio al contenido de ${topic}.` },
      { title: '3. Objetos y Tablas', detail: 'Integra imágenes con ajuste y tablas ordenadas.' },
      { title: '4. Revisión y PDF', detail: 'Corrige ortografía y exporta en PDF profesional.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Para qué sirve exportar un documento terminado de Word a formato PDF?',
        options: [
          'Para preservar exactamente fuentes, márgenes y diseño al abrirlo en cualquier dispositivo',
          'Para eliminar todas las imágenes del archivo',
          'Para convertir el texto en hoja de cálculo',
        ],
        correctIndex: 0,
        explanation: 'PDF fija la maquetación visual independientemente de las fuentes instaladas en otro equipo.',
      },
      {
        prompt: '¿Qué herramienta permite que una imagen conviva ordenadamente junto a un párrafo sin empujar todo el texto?',
        options: ['Opciones de diseño / Ajuste de texto (ej. Cuadrado)', 'Presionar Enter veinte veces', 'Cambiar el tamaño de hoja a oficio'],
        correctIndex: 0,
        explanation: 'El ajuste envolvente controla cómo fluye el texto alrededor del objeto visual.',
      },
      {
        prompt: '¿Por qué es incorrecto usar múltiples espacios en blanco para centrar o tabular un texto?',
        options: [
          'Porque al cambiar de fuente, margen o dispositivo el documento se desalinea por completo',
          'Porque Word cobra por cada espacio',
          'Porque los espacios impiden guardar en .docx',
        ],
        correctIndex: 0,
        explanation: 'Siempre deben usarse herramientas de alineación, sangrías, tabuladores o tablas.',
      },
    ],
  },

  m4: {
    domainLabel: 'Automatización de Documentos Extensos y Colaboración',
    tools: 'Estilos de Word, Tablas de Contenido, Citas APA, Combinar Correspondencia, Word/Docs Nube',
    contextIntro:
      'Cuando redactas tesis, manuales técnicos o cartas para decenas de destinatarios, editar elemento por elemento es inviable. Las funciones de automatización de documentos largos (Estilos, Índices automáticos, Saltos de sección, APA y Control de cambios) ahorran horas de trabajo.',
    conceptPairs: [
      { term: 'Estilos (Título 1, Título 2)', detail: 'Etiquetan jerárquicamente los capítulos para generar índices automáticos en un clic.' },
      { term: 'Salto de Sección', detail: 'Permite cambiar orientación o numeración (romanos vs. arábigos) en partes distintas del mismo archivo.' },
      { term: 'Combinación de Correspondencia', detail: 'Conecta una carta modelo con una tabla de Excel para generar cientos de constancias o cartas personalizadas.' },
      { term: 'Control de Cambios', detail: 'Registra inserciones, eliminaciones y comentarios al revisar documentos en equipo.' },
    ],
    workflowSteps: [
      'Aplica Estilos Título 1 y Título 2 en vez de solo agrandar y poner negritas manualmente.',
      'Inserta la Tabla de Contenido automática y actualízala tras cualquier edición.',
      'Gestiona fuentes y citas bibliográficas con el gestor integrado en formato APA.',
      'Comparte el documento en la nube con permisos claros (lector, comentador o editor).',
    ],
    exampleTemplate: (topic) => ({
      title: `Automatización documental: ${topic}`,
      snippetOrCase:
        'Título 1: 1. Marco Teórico  ->  Título 2: 1.1 Antecedentes\nReferencias -> Tabla de contenido -> Actualizar toda la tabla.',
      takeaway: 'Si mueves una sección de la página 4 a la 12, el índice automático actualiza todos los números de página al instante.',
    }),
    commonPitfall:
      'Escribir el índice manualmente página por página; cualquier corrección posterior desincroniza toda la numeración.',
    organizerPattern: (topic) => [
      { title: '1. Estructura Jerárquica', detail: `Asigna Estilos Título 1/2 a ${topic}.` },
      { title: '2. Secciones y Citas', detail: 'Separa formatos con saltos y respalda con APA.' },
      { title: '3. Automatización', detail: 'Genera índices o combina correspondencia desde datos.' },
      { title: '4. Coedición Segura', detail: 'Usa control de cambios y permisos en la nube.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué requisito previo es indispensable para que Word genere automáticamente una Tabla de Contenido (índice)?',
        options: [
          'Haber aplicado Estilos de Título (Título 1, Título 2) a los encabezados del documento',
          'Cambiar el color del texto a azul manualmente',
          'Guardar el archivo como imagen JPG',
        ],
        correctIndex: 0,
        explanation: 'Word construye el índice leyendo la jerarquía asignada mediante Estilos de Título.',
      },
      {
        prompt: '¿Para qué sirve insertar un Salto de Sección (Página siguiente) en lugar de un Salto de Página simple?',
        options: [
          'Para aplicar encabezados, numeración u orientación horizontal independientes en una parte del archivo',
          'Para borrar la página anterior',
          'Para aumentar la velocidad de internet',
        ],
        correctIndex: 0,
        explanation: 'Los saltos de sección dividen el documento en bloques con configuración de página independiente.',
      },
      {
        prompt: '¿Qué función facilita enviar una misma carta personalizada a 80 estudiantes usando sus nombres desde Excel?',
        options: ['Combinación de correspondencia', 'Marca de agua', 'Sinónimos'],
        correctIndex: 0,
        explanation: 'Combinar correspondencia fusiona campos variables desde una lista de origen hacia una plantilla.',
      },
    ],
  },

  m5: {
    domainLabel: 'Hojas de Cálculo y Operaciones Fundamentales (Excel)',
    tools: 'Microsoft Excel / Google Sheets, Referencias Relativas/Absolutas ($A$1), Funciones Base',
    contextIntro:
      'Las hojas de cálculo son la herramienta universal para administrar datos, presupuestos, calificaciones e inventarios. La clave no está en usarlas como simples calculadoras estáticas, sino en construir fórmulas dinámicas basadas en referencias de celda.',
    conceptPairs: [
      { term: 'Celda y Rango', detail: 'Una celda (ej. B4) es la intersección de columna y fila; un rango (B4:B12) agrupa varias celdas.' },
      { term: 'Referencia Relativa vs $A$1', detail: 'Las relativas cambian al arrastrar; las absolutas ($A$1) fijan una celda constante (como IVA o tipo de cambio).' },
      { term: 'SUMA / PROMEDIO / MAX / MIN', detail: 'Funciones esenciales para resumir totales, medias y extremos de un rango.' },
      { term: 'CONTAR vs CONTARA', detail: 'CONTAR cuenta solo números; CONTARA cuenta cualquier celda no vacía (incluyendo texto).' },
    ],
    workflowSteps: [
      'Introduce encabezados claros en la fila 1 y respeta el tipo de dato adecuado por columna (número, fecha, moneda).',
      'Toda fórmula inicia obligatoriamente con el signo igual (=).',
      'Usa referencias de celda (=B2*C2) en vez de escribir números fijos dentro de la fórmula.',
      'Fija tasas o parámetros globales con F4 ($B$1) antes de usar el controlador de relleno.',
    ],
    exampleTemplate: (topic) => ({
      title: `Fórmula dinámica aplicada: ${topic}`,
      snippetOrCase:
        'Total venta: =B2*C2\nCon IVA fijo en celda $E$1: =D2*(1+$E$1)\nPromedio del grupo: =PROMEDIO(F2:F30)',
      takeaway: 'Si cambia el porcentaje en E1 o cualquier cantidad, toda la tabla se recalcula automáticamente sin errores manuales.',
    }),
    commonPitfall:
      'Escribir texto junto con números en la misma celda (ej. "$500 pesos"); eso convierte la celda en texto e impide que SUMA() la contabilice.',
    organizerPattern: (topic) => [
      { title: '1. Datos Limpios', detail: `Captura valores puros con formato numérico para ${topic}.` },
      { title: '2. Referencias', detail: 'Conecta celdas relativas y absolutas ($A$1).' },
      { title: '3. Funciones Base', detail: 'Aplica SUMA, PROMEDIO, CONTAR, MAX y MIN.' },
      { title: '4. Ordenamiento', detail: 'Clasifica registros alfabética o numéricamente.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué símbolo debe colocarse al inicio de cualquier fórmula o función en Excel?',
        options: ['Signo igual (=)', 'Signo de interrogación (?)', 'Asterisco (*)'],
        correctIndex: 0,
        explanation: 'El signo = indica a Excel que debe evaluar una expresión en lugar de mostrar texto literal.',
      },
      {
        prompt: 'Si arrastras la fórmula =B2*$E$1 hacia abajo a la fila 3, ¿cómo queda la fórmula?',
        options: ['=B3*$E$1', '=B3*$E$2', '=C2*$F$1'],
        correctIndex: 0,
        explanation: 'B2 es relativa y avanza a B3, mientras que $E$1 es absoluta y permanece fija.',
      },
      {
        prompt: '¿Qué función utilizarías para contar cuántas celdas contienen un número en el rango D2:D20?',
        options: ['=CONTAR(D2:D20)', '=SUMA(D2:D20)', '=MIN(D2:D20)'],
        correctIndex: 0,
        explanation: 'CONTAR devuelve la cantidad de celdas con valores numéricos en el rango indicado.',
      },
    ],
  },

  m6: {
    domainLabel: 'Análisis de Datos, Condicionales y Gráficos (Excel)',
    tools: 'Autofiltros, Tablas Oficiales, SI / CONTAR.SI / SUMAR.SI, Formato Condicional, Gráficos',
    contextIntro:
      'Convertir datos crudos en decisiones claras requiere filtrar ruido, aplicar lógica condicional y visualizar tendencias. Las tablas estructuradas, funciones condicionales y gráficos estadísticos permiten detectar patrones en segundos.',
    conceptPairs: [
      { term: 'Tabla Oficial (Ctrl+T)', detail: 'Estructura el rango con encabezados filtrables y expansión automática de fórmulas.' },
      { term: 'Función SI()', detail: '=SI(prueba_lógica, valor_si_verdadero, valor_si_falso) automatiza clasificaciones.' },
      { term: 'SUMAR.SI / CONTAR.SI', detail: 'Resúmenes condicionales por categoría, estado o rango numérico.' },
      { term: 'Elección de Gráfico', detail: 'Columnas comparan categorías; Líneas muestran evolución en el tiempo; Pastel muestra proporciones.' },
    ],
    workflowSteps: [
      'Convierte tu rango en Tabla oficial para habilitar filtros y referencias estructuradas.',
      'Aplica Formato Condicional para detectar alertas, valores máximos o duplicados visualmente.',
      'Resume totales por categoría usando CONTAR.SI y SUMAR.SI.',
      'Genera un gráfico limpio con título descriptivo, ejes claros y sin saturación visual.',
    ],
    exampleTemplate: (topic) => ({
      title: `Regla analítica aplicada: ${topic}`,
      snippetOrCase:
        'Estado alumno: =SI(D2>=70, "Aprobado", "Requiere apoyo")\nTotal aprobado: =CONTAR.SI(E2:E40, "Aprobado")',
      takeaway: 'Las decisiones operativas se automatizan mediante condiciones lógicas claras y verificables.',
    }),
    commonPitfall:
      'Usar gráficos de pastel con 12 o más categorías pequeñas; se vuelven ilegibles. Para comparar muchas categorías usa barras horizontales.',
    organizerPattern: (topic) => [
      { title: '1. Estructurar Tabla', detail: `Organiza y filtra registros para ${topic}.` },
      { title: '2. Lógica Condicional', detail: 'Aplica SI, CONTAR.SI y SUMAR.SI.' },
      { title: '3. Alerta Visual', detail: 'Resalta umbrales con formato condicional.' },
      { title: '4. Gráfico e Impresión', detail: 'Visualiza tendencias y ajusta área de impresión.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué evalúa correctamente la fórmula =SI(C2>=70,"Acreditado","Repaso") cuando C2 vale 65?',
        options: ['Devuelve "Repaso"', 'Devuelve "Acreditado"', 'Marca error de división'],
        correctIndex: 0,
        explanation: 'Como 65 >= 70 es falso, la función ejecuta el tercer argumento ("Repaso").',
      },
      {
        prompt: '¿Qué tipo de gráfico es más adecuado para mostrar la evolución mensual de ventas o calificaciones en el tiempo?',
        options: ['Gráfico de líneas', 'Gráfico circular (pastel)', 'Tabla sin formato'],
        correctIndex: 0,
        explanation: 'Los gráficos de líneas destacan tendencias continuas a lo largo de periodos temporales.',
      },
      {
        prompt: '¿Para qué sirve el Formato Condicional en Excel?',
        options: [
          'Cambiar automáticamente el color o ícono de celdas según reglas sobre su valor',
          'Traducir el libro a otro idioma',
          'Comprimir archivos en formato ZIP',
        ],
        correctIndex: 0,
        explanation: 'Permite identificar visualmente valores críticos, duplicados o metas cumplidas al instante.',
      },
    ],
  },

  m7: {
    domainLabel: 'Diseño Visual y Maquetación de Diapositivas (PowerPoint)',
    tools: 'Microsoft PowerPoint / Google Slides, Regla 6x6, SmartArt, Contraste, Alineación',
    contextIntro:
      'Una diapositiva no es un documento de Word proyectado en la pared: es un apoyo visual para que tu audiencia comprenda ideas clave en 3 segundos. La síntesis visual, el contraste tipográfico y el uso de diagramas limpios marcan la diferencia.',
    conceptPairs: [
      { term: 'Regla 6x6', detail: 'Máximo 6 líneas por diapositiva y alrededor de 6 palabras clave por línea.' },
      { term: 'Contraste y Jerarquía', detail: 'Texto oscuro sobre fondo claro (o viceversa) con tamaños claramente diferenciados.' },
      { term: 'SmartArt y Formas', detail: 'Transforman listas densas en procesos, ciclos y organigramas visuales.' },
      { term: 'Alineación y Distribución', detail: 'Herramientas automáticas para espaciar objetos simétricamente sin calcular al ojo.' },
    ],
    workflowSteps: [
      'Define una sola idea central por diapositiva antes de abrir el editor.',
      'Aplica un tema coherente con máximo 2 tipografías y 1 color de acento principal.',
      'Sustituye párrafos largos por diagramas, íconos o gráficos importados desde Excel.',
      'Alinea y agrupa elementos revisando que haya suficiente aire (espacio en blanco) alrededor.',
    ],
    exampleTemplate: (topic) => ({
      title: `Síntesis visual aplicada: ${topic}`,
      snippetOrCase:
        'Antes (bloque denso): 120 palabras explicando todo el proyecto.\nDespués (Regla 6x6): Título de impacto + Diagrama de 3 pasos + 1 gráfico limpio de resultados.',
      takeaway: 'Cuando la diapositiva respira visualmente, el público escucha al expositor en lugar de leer párrafos.',
    }),
    commonPitfall:
      'Colocar texto amarillo o azul claro sobre fondo blanco, o saturar la diapositiva con letras tamaño 12 pt ilegibles desde el fondo del aula.',
    organizerPattern: (topic) => [
      { title: '1. Síntesis 6x6', detail: `Reduce ${topic} a ideas clave concisas.` },
      { title: '2. Paleta y Contraste', detail: 'Asegura lectura clara desde cualquier distancia.' },
      { title: '3. Diagramación', detail: 'Convierte procesos en SmartArt, íconos o gráficos.' },
      { title: '4. Alineación Limpia', detail: 'Distribuye con márgenes y espacio en blanco.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué busca la "Regla 6x6" al diseñar diapositivas profesionales?',
        options: [
          'Evitar saturar la pantalla limitando líneas y palabras por viñeta para favorecer la síntesis',
          'Usar exactamente 6 colores neón en cada lámina',
          'Copiar 6 páginas de Word en una sola diapositiva',
        ],
        correctIndex: 0,
        explanation: 'La economía de texto mantiene la atención en el mensaje oral y refuerza la claridad visual.',
      },
      {
        prompt: '¿Por qué conviene insertar gráficos vinculados o exportados limpiamente desde Excel?',
        options: [
          'Para mostrar evidencia numérica comprensible al instante sin tablas enormes',
          'Para hacer más pesada la presentación innecesariamente',
          'Para ocultar los datos reales',
        ],
        correctIndex: 0,
        explanation: 'Un gráfico bien etiquetado resume decenas de filas en una lectura visual inmediata.',
      },
      {
        prompt: '¿Qué herramienta permite espaciar tres tarjetas horizontalmente a la misma distancia exacta?',
        options: ['Alinear -> Distribuir horizontalmente', 'Animación de rebote', 'Notas del orador'],
        correctIndex: 0,
        explanation: 'Las herramientas de alineación y distribución garantizan precisión milimétrica.',
      },
    ],
  },

  m8: {
    domainLabel: 'Multimedia, Animación Sutil y Oratoria Escénica',
    tools: 'Transiciones, Panel de Animación, Audio/Video, Vista del Presentador, Storytelling',
    contextIntro:
      'Las animaciones y recursos multimedia deben guiar el ritmo de la explicación, nunca distraer con efectos excesivos. Combinados con la Vista del Presentador, el lenguaje corporal y el Storytelling, convierten una exposición técnica en una comunicación memorable.',
    conceptPairs: [
      { term: 'Transición vs Animación', detail: 'La transición ocurre entre diapositivas; la animación controla cuándo aparece cada objeto.' },
      { term: 'Botones de Acción', detail: 'Hipervínculos internos para navegar hacia índices o secciones según preguntas del público.' },
      { term: 'Vista del Presentador', detail: 'Muestra tus notas privadas, reloj y siguiente lámina solo en tu pantalla.' },
      { term: 'Storytelling y Voz', detail: 'Narrativa con inicio, reto y solución respaldada por contacto visual y pausas.' },
    ],
    workflowSteps: [
      'Aplica una misma transición sobria (ej. Desvanecer o Empuje suave) en toda la presentación.',
      'Usa animaciones de entrada solo cuando reveles puntos paso a paso mientras hablas.',
      'Prueba clips de audio/video en el equipo final o expórtalos incrustados.',
      'Ensaya en voz alta con la Vista del Presentador cronometrando tu tiempo total.',
    ],
    exampleTemplate: (topic) => ({
      title: `Guion escénico: ${topic}`,
      snippetOrCase:
        'Min 0–1 (Gancho): Pregunta o caso real de la comunidad.\nMin 1–3 (Desarrollo): Demostración con láminas sincronizadas.\nMin 3–4 (Cierre): Llamado a la acción e impacto medible.',
      takeaway: 'Las notas privadas son tu red de seguridad, pero el contacto visual con tu audiencia construye confianza.',
    }),
    commonPitfall:
      'Leer textualmente toda la diapositiva dando la espalda al público o abusar de animaciones giratorias y sonidos estridentes.',
    organizerPattern: (topic) => [
      { title: '1. Ritmo Visual', detail: `Sincroniza animaciones sobrias para ${topic}.` },
      { title: '2. Multimedia Útil', detail: 'Integra audio, video o navegación interactiva.' },
      { title: '3. Control Técnico', detail: 'Prepara Vista del Presentador y respaldo PDF/MP4.' },
      { title: '4. Oratoria', detail: 'Proyecta voz clara, postura firme y storytelling.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué ventaja ofrece activar la "Vista del Presentador" durante una exposición con proyector?',
        options: [
          'El público ve solo la diapositiva limpia mientras tú ves tus notas, temporizador y siguiente lámina',
          'Muestra tus mensajes privados al público',
          'Elimina todas las imágenes de la presentación',
        ],
        correctIndex: 0,
        explanation: 'Separa la vista pública de tus notas privadas de apoyo y control de tiempo.',
      },
      {
        prompt: '¿Cuál es el criterio profesional al elegir animaciones y transiciones?',
        options: [
          'Usar efectos sutiles y consistentes que ayuden a dirigir la atención sin distraer',
          'Usar un efecto diferente y lento en cada palabra',
          'Agregar sonidos de explosión en cada clic',
        ],
        correctIndex: 0,
        explanation: 'La sobriedad mantiene el foco en tu argumento y evita fatiga visual.',
      },
      {
        prompt: '¿En qué formato conviene guardar una copia de respaldo si el equipo del auditorio no tiene PowerPoint?',
        options: ['PDF o video MP4 autónomo', 'Archivo temporal sin extensión', 'Captura borrosa'],
        correctIndex: 0,
        explanation: 'Exportar a PDF garantiza que siempre puedas proyectar sin depender de versiones de software.',
      },
    ],
  },

  m9: {
    domainLabel: 'Diseño y Estructuración de Formularios Digitales',
    tools: 'Microsoft Forms, Google Forms, Tipos de Reactivos, Ramificación Condicional, Autoevaluación',
    contextIntro:
      'Un formulario mal redactado produce datos confusos e inutilizables. Diseñar instrumentos digitales con preguntas precisas, secciones lógicas, saltos condicionales y calificación automática permite encuestar, registrar participantes o evaluar aprendizajes a gran escala.',
    conceptPairs: [
      { term: 'Selección Única vs Casillas', detail: 'Opción múltiple elige 1 respuesta; casillas de verificación permiten seleccionar varias.' },
      { term: 'Escala Likert', detail: 'Mide grado de acuerdo o satisfacción en niveles graduados (ej. 1 a 5).' },
      { term: 'Lógica de Ramificación', detail: 'Dirige al usuario a distintas secciones según su respuesta previa.' },
      { term: 'Clave de Respuesta', detail: 'Califica automáticamente cuestionarios y entrega retroalimentación inmediata.' },
    ],
    workflowSteps: [
      'Redacta un título claro y una descripción explicando objetivo, duración estimada y uso de datos.',
      'Elige el tipo de pregunta exacto según el análisis posterior que necesites.',
      'Divide formularios extensos en secciones temáticas e implementa ramificación condicional.',
      'Configura preguntas obligatorias, límites de respuesta y vista previa antes de difundir.',
    ],
    exampleTemplate: (topic) => ({
      title: `Estructura condicional: ${topic}`,
      snippetOrCase:
        'P1: ¿Has programado antes? (Sí / No)\n  -> Si "Sí": Salta a Sección 2 (Lenguajes y nivel)\n  -> Si "No": Salta a Sección 3 (Interés en taller introductorio)',
      takeaway: 'La ramificación evita que el usuario responda preguntas que no aplican a su perfil, aumentando la tasa de finalización.',
    }),
    commonPitfall:
      'Dejar todas las preguntas como "texto abierto" cuando después quieres graficar porcentajes; las respuestas libres tienen errores de ortografía que dificultan agrupar.',
    organizerPattern: (topic) => [
      { title: '1. Objetivo Claro', detail: `Define propósito e instrucciones de ${topic}.` },
      { title: '2. Tipos de Pregunta', detail: 'Combina opción múltiple, Likert y texto breve.' },
      { title: '3. Secciones y Saltos', detail: 'Aplica lógica condicional según perfil.' },
      { title: '4. Reglas y Claves', detail: 'Configura obligatoriedad y autoevaluación.' },
    ],
    quizPool: () => [
      {
        prompt: 'Si quieres calcular fácilmente porcentajes de edad o grado escolar de los encuestados, ¿qué tipo de pregunta conviene usar?',
        options: [
          'Opción múltiple / lista desplegable con categorías definidas',
          'Párrafo abierto sin validación',
          'Escala de estrellas',
        ],
        correctIndex: 0,
        explanation: 'Las opciones cerradas evitan variaciones de escritura y se grafican automáticamente con precisión.',
      },
      {
        prompt: '¿Qué permite la "lógica de ramificación" en Google Forms o Microsoft Forms?',
        options: [
          'Saltar a una sección específica dependiendo de la respuesta seleccionada por el usuario',
          'Cambiar el color de la pantalla aleatoriamente',
          'Borrar las respuestas anteriores',
        ],
        correctIndex: 0,
        explanation: 'Personaliza el recorrido del encuestado ocultando bloques irrelevantes para su caso.',
      },
      {
        prompt: '¿Para qué sirve configurar un formulario en modo "Cuestionario"?',
        options: [
          'Asignar puntajes, respuestas correctas y retroalimentación automática al instante',
          'Impedir que alguien abra el enlace',
          'Convertir el formulario en audio',
        ],
        correctIndex: 0,
        explanation: 'El modo cuestionario automatiza la evaluación formativa y entrega feedback inmediato.',
      },
    ],
  },

  m10: {
    domainLabel: 'Distribución, Ética y Análisis de Respuestas de Formularios',
    tools: 'Códigos QR, Permisos de Privacidad, Exportación Excel/Sheets, Limpieza de Datos, Aviso de Privacidad',
    contextIntro:
      'Publicar un formulario es apenas la mitad del trabajo. Distribuirlo de forma accesible (enlaces cortos y códigos QR), resguardar la privacidad de quienes responden, depurar la hoja de respuestas y redactar un reporte ejecutivo ético cierra el ciclo analítico.',
    conceptPairs: [
      { term: 'Acceso Público vs Restringido', detail: 'Restringir a usuarios verificados evita duplicados y respuestas externas en encuestas escolares.' },
      { term: 'Limpieza de Datos', detail: 'Eliminar duplicados, corregir espacios extra y estandarizar mayúsculas antes de calcular.' },
      { term: 'Consentimiento Informado', detail: 'Explicar para qué se usarán los datos antes de recopilar información personal.' },
      { term: 'Reporte Ejecutivo', detail: 'Síntesis con hallazgos clave, gráficos claros y recomendaciones accionables.' },
    ],
    workflowSteps: [
      'Define si el enlace será abierto o restringido a cuentas institucionales.',
      'Comparte mediante enlace verificado, código QR impreso o inserción web.',
      'Exporta las respuestas hacia Excel/Sheets y depura registros incompletos o duplicados.',
      'Calcula porcentajes, promedios y modas para construir tu reporte de conclusiones.',
    ],
    exampleTemplate: (topic) => ({
      title: `Ciclo ético y analítico: ${topic}`,
      snippetOrCase:
        'Aviso inicial: "Tus respuestas son confidenciales y se usarán únicamente con fines académicos."\nPost-cierre: Exportar CSV/XLSX -> Quitar duplicados -> CONTAR.SI() -> Reporte PDF.',
      takeaway: 'Datos limpios y obtenidos con transparencia ética producen reportes confiables y defendibles.',
    }),
    commonPitfall:
      'Publicar resultados individuales con nombres o correos sin anonimizar al presentar estadísticas grupales.',
    organizerPattern: (topic) => [
      { title: '1. Publicación Segura', detail: `Elige privacidad, enlace o QR para ${topic}.` },
      { title: '2. Ética y Aviso', detail: 'Solicita consentimiento informado visible.' },
      { title: '3. Exportación y Limpieza', detail: 'Depura respuestas en Excel o Sheets.' },
      { title: '4. Reporte Accionable', detail: 'Resume métricas y hallazgos clave.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué principio ético debe incluirse antes de recopilar datos personales en una encuesta?',
        options: [
          'Un aviso de privacidad y consentimiento informado explicando el uso de los datos',
          'Ocultar quién organiza la encuesta',
          'Publicar teléfonos personales en redes sociales',
        ],
        correctIndex: 0,
        explanation: 'Las personas tienen derecho a saber quién recaba sus datos y con qué finalidad.',
      },
      {
        prompt: 'Tras exportar las respuestas a Excel, ¿cuál es el primer paso recomendado antes de graficar?',
        options: [
          'Limpiar registros duplicados o inconsistentes y revisar formatos',
          'Borrar la mitad de las columnas al azar',
          'Cambiar todos los números por letras',
        ],
        correctIndex: 0,
        explanation: 'La depuración evita que errores de captura o duplicados distorsionen promedios y porcentajes.',
      },
      {
        prompt: '¿Qué ventaja tiene generar un código QR para una encuesta presencial o en cartel?',
        options: [
          'Permite abrir el formulario al instante desde la cámara móvil sin errores al teclear URLs largas',
          'Funciona sin internet aunque la página sea web',
          'Encripta el papel impreso',
        ],
        correctIndex: 0,
        explanation: 'El acceso por QR reduce fricción y evita errores de escritura en direcciones largas.',
      },
    ],
  },

  m11: {
    domainLabel: 'Comunicación Institucional y Productividad en la Nube',
    tools: 'Gmail/Outlook, CC/CCO, Google Drive/OneDrive, Google Meet/Teams, Google Calendar',
    contextIntro:
      'Trabajar en entornos académicos o empresariales modernos exige etiqueta digital impecable. Desde redactar un correo formal con copia oculta (CCO) hasta administrar permisos en la nube y dirigir videollamadas puntuales, cada detalle proyecta profesionalismo.',
    conceptPairs: [
      { term: 'Asunto + Firma Formal', detail: 'Un asunto descriptivo y firma con nombre/grado facilitan respuestas rápidas.' },
      { term: 'CC vs CCO', detail: 'CC es visible para todos; CCO (Copia Oculta) protege los correos de destinatarios masivos.' },
      { term: 'Permisos en la Nube', detail: 'Lector (solo ver), Comentador (sugerir) y Editor (modificar el documento).' },
      { term: 'Etiqueta en Videollamada', detail: 'Puntualidad, micrófono silenciado al escuchar y uso ordenado de "levantar la mano".' },
    ],
    workflowSteps: [
      'Redacta correos con asunto concreto, saludo formal, petición clara en 1–2 párrafos y despedida.',
      'Cuando envíes avisos a grupos externos, usa CCO para proteger la privacidad de las direcciones.',
      'Comparte archivos grandes mediante enlace en Drive/OneDrive configurando el permiso mínimo necesario.',
      'Agenda videollamadas en calendario incluyendo orden del día y recordatorios automáticos.',
    ],
    exampleTemplate: (topic) => ({
      title: `Comunicación profesional: ${topic}`,
      snippetOrCase:
        'Asunto: Entrega Proyecto Integrador – Módulo 11 – [Nombre Completo]\nAdjunto / Enlace Drive (Permiso: Lector o Comentador)\nDespedida + Firma institucional.',
      takeaway: 'Cuidar permisos y privacidad en cada envío evita fugas accidentales de información o ediciones no autorizadas.',
    }),
    commonPitfall:
      'Enviar un archivo confidencial con permiso "Cualquier persona con el enlace puede EDITAR" o escribir todo el mensaje dentro de la línea de Asunto.',
    organizerPattern: (topic) => [
      { title: '1. Mensaje Claro', detail: `Estructura asunto, cuerpo y firma para ${topic}.` },
      { title: '2. Privacidad CC/CCO', detail: 'Resguarda correos y datos de destinatarios.' },
      { title: '3. Nube y Permisos', detail: 'Controla niveles lector, comentador o editor.' },
      { title: '4. Reuniones Efectivas', detail: 'Coordina calendario y etiqueta en videollamadas.' },
    ],
    quizPool: () => [
      {
        prompt: 'Si envías un correo informativo a 40 padres de familia o clientes externos, ¿qué campo debes usar para proteger sus correos?',
        options: ['CCO (Copia Oculta)', 'CC (Copia Abierta)', 'Poner todos en el Asunto'],
        correctIndex: 0,
        explanation: 'CCO oculta las direcciones entre destinatarios y protege la privacidad de los contactos.',
      },
      {
        prompt: 'Si compartes un reporte en Google Drive para que solo puedan leerlo sin alterarlo, ¿qué permiso asignas?',
        options: ['Lector', 'Editor', 'Propietario absoluto'],
        correctIndex: 0,
        explanation: 'El rol de Lector permite visualizar o descargar según configuración sin modificar el original.',
      },
      {
        prompt: '¿Qué buena práctica evita ruido molesto en una videollamada grupal?',
        options: [
          'Mantener el micrófono silenciado mientras otros exponen y usar la función levantar la mano',
          'Dejar el micrófono abierto junto a música',
          'Compartir pantalla sin avisar ni tener permiso',
        ],
        correctIndex: 0,
        explanation: 'La etiqueta en videollamadas mantiene el audio limpio y respeta los turnos de palabra.',
      },
    ],
  },

  m12: {
    domainLabel: 'Proyecto Integrador Anual y Portafolio Digital',
    tools: 'Suite Completa (Word + Excel + Forms + PowerPoint + Nube), Checklist, Oratoria',
    contextIntro:
      'En este módulo integras todas las herramientas de ofimática y colaboración en un proyecto real de principio a fin: defines un caso comunitario o de negocio, redactas el informe ejecutivo en Word, calculas el presupuesto en Excel, validas con Forms y defiendes tu presentación en PowerPoint.',
    conceptPairs: [
      { term: 'Integración Multiplataforma', detail: 'Los números calculados en Excel alimentan el informe de Word y los gráficos de PowerPoint.' },
      { term: 'Checklist por Fases', detail: 'Divide un proyecto grande en hitos medibles con fechas de entrega.' },
      { term: 'Validación con Usuarios', detail: 'El formulario de retroalimentación aporta evidencia real de interés o mejora.' },
      { term: 'Defensa del Portafolio', detail: 'Presentación clara demostrando dominio técnico y valor social o económico.' },
    ],
    workflowSteps: [
      'Define el problema, público objetivo y alcance mediante un checklist por fases.',
      'Elabora el documento maestro en Word con estilos, tabla de costos y referencias.',
      'Construye el modelo financiero en Excel y captura encuestas de validación en Forms.',
      'Sintetiza hallazgos en PowerPoint y ensaya tu defensa oral cronometrada.',
    ],
    exampleTemplate: (topic) => ({
      title: `Arquitectura del Proyecto Integrador: ${topic}`,
      snippetOrCase:
        'Fase 1 (Word): Documento maestro con índice automático.\nFase 2 (Excel): Presupuesto 50/30/20 + gráfica de costos.\nFase 3 (Forms): Encuesta a 15 usuarios.\nFase 4 (PowerPoint): Pitch de 5 minutos.',
      takeaway: 'Un portafolio integrado demuestra que sabes conectar herramientas reales para resolver retos completos.',
    }),
    commonPitfall:
      'Dejar la integración de gráficos y el ensayo de la presentación para las últimas dos horas; ensayar revela fallas técnicas a tiempo.',
    organizerPattern: (topic) => [
      { title: '1. Planeación', detail: `Define caso real y checklist para ${topic}.` },
      { title: '2. Documentación y Datos', detail: 'Conecta Word técnico con modelos de Excel.' },
      { title: '3. Validación Social', detail: 'Recopila retroalimentación mediante Forms.' },
      { title: '4. Defensa Final', detail: 'Presenta portafolio con PowerPoint y oratoria.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuál es el propósito del Proyecto Integrador Anual en Computación Básica?',
        options: [
          'Aplicar coordinadamente Word, Excel, Forms, PowerPoint y la nube en un caso práctico real',
          'Memorizar definiciones aisladas sin usar las herramientas',
          'Eliminar toda evidencia digital al terminar el curso',
        ],
        correctIndex: 0,
        explanation: 'Integrar las herramientas demuestra competencia práctica real de nivel profesional.',
      },
      {
        prompt: '¿Qué ventaja aporta dividir el proyecto integrador en 4 fases con listas de control (checklists)?',
        options: [
          'Permite medir avances parciales y detectar retrasos antes de la entrega final',
          'Evita tener que hacer cálculos en Excel',
          'Reemplaza la presentación oral',
        ],
        correctIndex: 0,
        explanation: 'Las listas de control transforman proyectos complejos en hitos alcanzables.',
      },
      {
        prompt: '¿Por qué es clave ensayar la exposición antes de la defensa final?',
        options: [
          'Ajustar el tiempo de cada lámina, dominar la voz y comprobar que multimedia y gráficos funcionen',
          'Para hablar lo más rápido posible sin respirar',
          'Para leer toda la diapositiva de memoria',
        ],
        correctIndex: 0,
        explanation: 'El ensayo previo reduce nervios y asegura fluidez técnica frente al grupo.',
      },
    ],
  },

  // --- PROGRAMACIÓN Y WEB ---
  'pw-m1': {
    domainLabel: 'Lógica Computacional, Algoritmos y Pseudocódigo (PSeInt)',
    tools: 'Diagramas de Flujo, PSeInt, Variables, Tipos de Datos, Operadores Lógicos',
    contextIntro:
      'Antes de escribir código en cualquier lenguaje, todo programador aprende a pensar algorítmicamente: descomponer un problema en pasos finitos, ordenados y sin ambigüedades, identificando qué datos entran, cómo se transforman y qué resultado sale.',
    conceptPairs: [
      { term: 'Entrada -> Proceso -> Salida', detail: 'Todo algoritmo recibe datos, aplica reglas o cálculos y entrega un resultado verificable.' },
      { term: 'Variables y Constantes', detail: 'Espacios en memoria con nombre; las variables cambian en ejecución y las constantes permanecen fijas.' },
      { term: 'Tipos de Datos', detail: 'Entero (42), Real (3.14), Cadena ("Hola") y Lógico/Booleano (Verdadero/Falso).' },
      { term: 'AND / OR / NOT', detail: 'Operadores lógicos que combinan condiciones para tomar decisiones exactas.' },
    ],
    workflowSteps: [
      'Lee el problema completo e identifica claramente las variables de entrada y salida.',
      'Dibuja primero el diagrama de flujo (Inicio -> Leer -> Proceso -> Escribir -> Fin).',
      'Traduce la lógica a pseudocódigo en PSeInt respetando tipos de datos.',
      'Realiza una prueba de escritorio paso a paso con valores reales y casos límite.',
    ],
    exampleTemplate: (topic) => ({
      title: `Pseudocódigo en PSeInt: ${topic}`,
      snippetOrCase:
        'Algoritmo PromedioEstudiante\n  Definir c1, c2, prom Como Real;\n  Escribir "Ingresa 2 calificaciones:";\n  Leer c1, c2;\n  prom <- (c1 + c2) / 2;\n  Escribir "Promedio final: ", prom;\nFinAlgoritmo',
      takeaway: 'Respetar la jerarquía de paréntesis ((c1 + c2) / 2) evita errores lógicos silenciosos.',
    }),
    commonPitfall:
      'Olvidar paréntesis en operaciones matemáticas (escribir c1 + c2 / 2, donde primero divide c2 entre 2) o usar nombres de variables confusos como x1, x2.',
    organizerPattern: (topic) => [
      { title: '1. Análisis', detail: `Identifica entradas y salidas requeridas para ${topic}.` },
      { title: '2. Diagrama / Pseudocódigo', detail: 'Traza la secuencia lógica paso a paso en PSeInt.' },
      { title: '3. Tipos y Operadores', detail: 'Declara variables y aplica jerarquía exacta.' },
      { title: '4. Prueba de Escritorio', detail: 'Depura errores verificando valores reales.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué características obligatorias debe cumplir cualquier algoritmo bien diseñado?',
        options: [
          'Ser preciso (sin ambigüedad), definido (mismo resultado ante misma entrada) y finito (termina)',
          'Tener pasos aleatorios e infinitos',
          'Funcionar únicamente en inglés',
        ],
        correctIndex: 0,
        explanation: 'Precisión, determinismo y finitud son los tres pilares formales de todo algoritmo.',
      },
      {
        prompt: 'En la expresión A = 5 + 3 * 2, según la jerarquía de operadores aritméticos, ¿cuál es el resultado?',
        options: ['11', '16', '13'],
        correctIndex: 0,
        explanation: 'La multiplicación (3 * 2 = 6) tiene mayor precedencia que la suma (5 + 6 = 11).',
      },
      {
        prompt: 'Con el operador lógico AND (Y), ¿cuándo es verdadera la expresión (edad >= 18) AND (tieneCredencial)?',
        options: [
          'Únicamente cuando ambas condiciones son verdaderas al mismo tiempo',
          'Cuando al menos una es falsa',
          'Siempre es verdadera',
        ],
        correctIndex: 0,
        explanation: 'El operador lógico Y exige que todas las subcondiciones evaluadas se cumplan.',
      },
    ],
  },

  'pw-m2': {
    domainLabel: 'Estructuras de Control, Ciclos, Arreglos y Modularidad',
    tools: 'Condicionales Si/Según, Bucles Mientras/Repetir/Para, Vectores, Subprocesos',
    contextIntro:
      'Los programas reales rara vez corren en línea recta: deciden caminos según condiciones, repiten acciones cientos de veces mediante ciclos y agrupan datos en vectores o funciones reutilizables para mantener el código limpio.',
    conceptPairs: [
      { term: 'Si / Según', detail: 'Evalúan condiciones para bifurcar la ejecución o seleccionar entre múltiples opciones de menú.' },
      { term: 'Mientras vs Repetir-Hasta', detail: 'Mientras evalúa antes de entrar (0 o más veces); Repetir evalúa al final (al menos 1 vez).' },
      { term: 'Ciclo Para (For)', detail: 'Ideal cuando conoces exactamente cuántas iteraciones necesitas con un contador.' },
      { term: 'Vectores y Funciones', detail: 'Los arreglos almacenan colecciones indexadas; las funciones dividen el problema en piezas reutilizables.' },
    ],
    workflowSteps: [
      'Elige el ciclo adecuado: Para (cantidad fija), Mientras (condición previa) o Repetir (menús).',
      'Asegura siempre una instrucción que modifique la condición de salida para evitar bucles infinitos.',
      'Almacena series de datos en arreglos y recórrelos con un índice controlado.',
      'Extrae bloques repetidos a subprocesos/funciones con nombres claros y revisión por pares.',
    ],
    exampleTemplate: (topic) => ({
      title: `Control de flujo: ${topic}`,
      snippetOrCase:
        'Para i <- 1 Hasta 5 Con Paso 1 Hacer\n  Escribir "Elemento #", i;\nFinPara\nSi promedio >= 70 Entonces\n  Escribir "Acreditado";\nFinSi',
      takeaway: 'Modularizar código en funciones pequeñas facilita encontrar fallas y trabajar en equipo.',
    }),
    commonPitfall:
      'Crear un ciclo Mientras donde la variable de control nunca cambia dentro del bloque, congelando el programa en un bucle infinito.',
    organizerPattern: (topic) => [
      { title: '1. Decisión', detail: `Evalúa rutas con Si/Según en ${topic}.` },
      { title: '2. Iteración Segura', detail: 'Usa Mientras, Repetir o Para con salida garantizada.' },
      { title: '3. Arreglos', detail: 'Organiza colecciones en vectores indexados.' },
      { title: '4. Modularidad', detail: 'Divide en subprocesos limpios y comentados.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué estructura repetitiva garantiza ejecutarse al menos una vez antes de evaluar la condición de salida?',
        options: ['Repetir - Hasta Que (Do-While)', 'Mientras (While)', 'Condicional simple Si'],
        correctIndex: 0,
        explanation: 'Al evaluar la condición al final del bloque, el cuerpo siempre corre al menos una iteración.',
      },
      {
        prompt: '¿Por qué conviene dividir un programa grande en funciones o subprocesos?',
        options: [
          'Para reutilizar código, hacerlo más legible y facilitar la depuración en equipo',
          'Para duplicar las mismas líneas diez veces',
          'Para impedir el uso de variables',
        ],
        correctIndex: 0,
        explanation: 'La modularización reduce duplicidad y aísla responsabilidades concretas.',
      },
      {
        prompt: '¿Qué ocurre si olvidas incrementar el contador dentro de un bucle Mientras?',
        options: [
          'Se produce un bucle infinito y el programa no termina',
          'El programa adivina el número final',
          'Se convierte automáticamente en un arreglo',
        ],
        correctIndex: 0,
        explanation: 'Todo ciclo condicional necesita avanzar hacia un estado que vuelva falsa la condición de permanencia.',
      },
    ],
  },

  'pw-m3': {
    domainLabel: 'Estructura Web Semántica con HTML5',
    tools: 'VS Code, HTML5, Etiquetas Semánticas, Formularios, Tablas y Accesibilidad (a11y)',
    contextIntro:
      'HTML5 es el esqueleto semántico de toda página o aplicación web. Más allá de mostrar texto o imágenes, usar correctamente etiquetas como <header>, <nav>, <main>, <article>, formularios accesibles y atributos alt permite que buscadores y lectores de pantalla entiendan el sitio.',
    conceptPairs: [
      { term: '<!DOCTYPE html>', detail: 'Declara al navegador que el documento sigue el estándar moderno HTML5.' },
      { term: 'Etiquetas Semánticas', detail: '<header>, <nav>, <main>, <section> y <footer> describen el rol real del contenido.' },
      { term: 'Rutas Relativas vs Absolutas', detail: 'Relativas (./img/foto.jpg) vinculan archivos locales del proyecto; absolutas apuntan a URLs externas.' },
      { term: 'Accesibilidad (a11y)', detail: 'Atributos alt en imágenes y <label> en formularios hacen la web usable para todas las personas.' },
    ],
    workflowSteps: [
      'Crea la estructura base con <html lang="es">, <head> (charset UTF-8 y viewport) y <body>.',
      'Organiza el contenido usando encabezados jerárquicos (<h1> único por página, luego <h2>, <h3>).',
      'Enlaza imágenes con alt descriptivo y formularios con <label for="..."> asociados a cada <input>.',
      'Valida la estructura en el Simulador Web y revisa la vista previa en vivo.',
    ],
    exampleTemplate: (topic) => ({
      title: `Estructura HTML5 limpia: ${topic}`,
      snippetOrCase:
        '<main>\n  <article>\n    <h1>Taller MentMar</h1>\n    <img src="curso.jpg" alt="Estudiantes colaborando en laptop" />\n    <a href="#registro">Ir al registro</a>\n  </article>\n</main>',
      takeaway: 'Evitar usar <div> para todo y preferir etiquetas semánticas mejora accesibilidad y posicionamiento SEO.',
    }),
    commonPitfall:
      'Saltar del <h1> al <h4> solo para cambiar el tamaño de letra, o dejar imágenes sin atributo alt ni cierre adecuado.',
    organizerPattern: (topic) => [
      { title: '1. Esqueleto Base', detail: `Configura DOCTYPE, head y meta viewport para ${topic}.` },
      { title: '2. Semántica', detail: 'Estructura con header, nav, main, section y footer.' },
      { title: '3. Medios y Datos', detail: 'Integra imágenes, enlaces, listas, tablas o forms.' },
      { title: '4. Accesibilidad', detail: 'Valida atributos alt, labels y orden de títulos.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Para qué sirve el atributo alt="..." dentro de una etiqueta <img> en HTML5?',
        options: [
          'Proporciona texto alternativo para lectores de pantalla y si la imagen no logra cargar',
          'Aumenta la resolución de la fotografía',
          'Cambia el color de fondo de toda la página',
        ],
        correctIndex: 0,
        explanation: 'El atributo alt es esencial para accesibilidad visual y semántica web.',
      },
      {
        prompt: '¿Cuál etiqueta HTML5 representa el contenido principal único del documento?',
        options: ['<main>', '<br>', '<span>'],
        correctIndex: 0,
        explanation: '<main> envuelve el contenido central de la página diferenciándolo de encabezados y pies.',
      },
      {
        prompt: '¿Qué atributo en un enlace <a href="..."> especifica la dirección destino?',
        options: ['href', 'src', 'alt'],
        correctIndex: 0,
        explanation: 'href indica la referencia o URL del enlace, mientras que src se usa para recursos incrustados.',
      },
    ],
  },

  'pw-m4': {
    domainLabel: 'Estilado, Modelo de Caja y Diseño Responsivo (CSS3)',
    tools: 'CSS3, Selectores, Box Model, Unidades rem/%, Flexbox, Media Queries',
    contextIntro:
      'CSS3 da identidad visual, legibilidad y adaptabilidad móvil a la web. Comprender el Modelo de Caja (padding, border, margin), el flujo Flexbox y el diseño Mobile-First permite construir interfaces limpias tanto en un teléfono de 360px como en un monitor de escritorio.',
    conceptPairs: [
      { term: 'Selectores (.clase, #id)', detail: 'Las clases son reutilizables en múltiples elementos; los ID deben ser únicos.' },
      { term: 'Modelo de Caja', detail: 'Contenido -> padding (relleno interno) -> border (borde) -> margin (espacio externo).' },
      { term: 'Flexbox (display: flex)', detail: 'Distribuye y alinea tarjetas o barras de navegación con justify-content, align-items y gap.' },
      { term: '@media Queries', detail: 'Adaptan columnas y tamaños de texto según el ancho real de la pantalla.' },
    ],
    workflowSteps: [
      'Vincula una hoja de estilos externa (<link rel="stylesheet" href="styles.css">) al HTML.',
      'Aplica box-sizing: border-box para que padding y border no desborden tus anchos.',
      'Diseña primero para móvil (1 columna) y usa Flexbox/Grid + @media (min-width: 768px) para escritorio.',
      'Verifica contraste mínimo de texto (4.5:1) y prueba tus reglas en el Simulador Web.',
    ],
    exampleTemplate: (topic) => ({
      title: `Maquetación CSS3 moderna: ${topic}`,
      snippetOrCase:
        '.cards-grid {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 1rem;\n  justify-content: space-between;\n}\n@media (min-width: 768px) {\n  .card { flex: 1 1 30%; }\n}',
      takeaway: 'Combinar flex-wrap con gap elimina cálculos manuales de márgenes y mantiene la vista limpia en móviles.',
    }),
    commonPitfall:
      'Usar anchos fijos en píxeles (ej. width: 1200px) que provocan desbordamiento horizontal en teléfonos.',
    organizerPattern: (topic) => [
      { title: '1. Selectores y Cascada', detail: `Apunta con precisión a clases HTML en ${topic}.` },
      { title: '2. Box Model', detail: 'Controla padding, border, margin y unidades rem/%.' },
      { title: '3. Layout Flexbox', detail: 'Alinea y envuelve elementos con flex y gap.' },
      { title: '4. Mobile-First', detail: 'Adapta puntos de quiebre con @media queries.' },
    ],
    quizPool: () => [
      {
        prompt: 'En el Modelo de Caja de CSS, ¿qué propiedad controla el espacio INTERNO entre el contenido y el borde?',
        options: ['padding', 'margin', 'z-index'],
        correctIndex: 0,
        explanation: 'padding crea aire interior alrededor del contenido; margin crea separación hacia elementos externos.',
      },
      {
        prompt: '¿Qué par de propiedades Flexbox centra hijos horizontal y verticalmente dentro de un contenedor?',
        options: [
          'justify-content: center; align-items: center;',
          'float: center; clear: both;',
          'margin: 0; font-weight: bold;',
        ],
        correctIndex: 0,
        explanation: 'justify-content alinea sobre el eje principal y align-items sobre el eje transversal.',
      },
      {
        prompt: '¿Qué busca el enfoque "Mobile-First" en diseño responsivo?',
        options: [
          'Diseñar primero una experiencia clara en pantallas pequeñas e ir expandiendo el layout para escritorio',
          'Bloquear el acceso desde computadoras',
          'Usar fuentes de 8 píxeles',
        ],
        correctIndex: 0,
        explanation: 'Priorizar el móvil asegura legibilidad y simplicidad antes de aprovechar pantallas amplias.',
      },
    ],
  },

  'pw-m5': {
    domainLabel: 'Interactividad Dinámica y Manipulación del DOM (JavaScript)',
    tools: 'JavaScript ES6+, DOM (querySelector), addEventListener, Arrays/Objetos, DevTools',
    contextIntro:
      'JavaScript convierte páginas estáticas en aplicaciones vivas. A través del DOM (Document Object Model), puedes escuchar clics o envíos de formulario, validar datos al instante, actualizar listas dinámicas y depurar errores con la consola DevTools.',
    conceptPairs: [
      { term: 'const vs let', detail: 'Usa const por defecto para referencias que no reasignas; let para contadores o valores mutables.' },
      { term: 'querySelector()', detail: 'Selecciona cualquier elemento del HTML mediante selector CSS para leerlo o modificarlo.' },
      { term: 'addEventListener()', detail: 'Conecta eventos de usuario (click, submit, input) con funciones controladoras.' },
      { term: 'DevTools (F12)', detail: 'Consola e inspector para rastrear errores de sintaxis, variables y red.' },
    ],
    workflowSteps: [
      'Conecta tu script al final del <body> o con atributo defer para asegurar que el DOM ya exista.',
      'Captura referencias a botones, entradas y contenedores mediante querySelector.',
      'Implementa funciones puras y listeners de eventos evitando recargar la página (e.preventDefault()).',
      'Prueba cada interacción y revisa la consola DevTools ante cualquier error.',
    ],
    exampleTemplate: (topic) => ({
      title: `Interactividad DOM: ${topic}`,
      snippetOrCase:
        'const btn = document.querySelector("#btnEnviar");\nbtn.addEventListener("click", () => {\n  const msg = document.querySelector("#estado");\n  msg.textContent = "Actividad registrada correctamente";\n});',
      takeaway: 'Preferir textContent frente a innerHTML con datos de usuario previene fallos de seguridad XSS.',
    }),
    commonPitfall:
      'Usar innerHTML con entradas escritas por usuarios (riesgo de inyección) o olvidar e.preventDefault() en formularios.',
    organizerPattern: (topic) => [
      { title: '1. Estado y Variables', detail: `Define datos en const/let, arrays u objetos para ${topic}.` },
      { title: '2. Selección DOM', detail: 'Ubica nodos con getElementById o querySelector.' },
      { title: '3. Eventos', detail: 'Reacciona a clics e inputs con addEventListener.' },
      { title: '4. Depuración', detail: 'Valida flujo con DevTools y consola.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué método estándar conecta un evento de clic sobre un botón con una función en JavaScript?',
        options: ['elemento.addEventListener("click", fn)', 'elemento.style.click()', 'document.writeClick()'],
        correctIndex: 0,
        explanation: 'addEventListener permite adjuntar manejadores limpios y múltiples a cualquier evento del DOM.',
      },
      {
        prompt: '¿Por qué es más seguro modificar texto dinámico usando element.textContent en lugar de element.innerHTML?',
        options: [
          'Porque textContent inserta texto plano sin interpretar etiquetas HTML potencialmente peligrosas',
          'Porque textContent borra el archivo CSS',
          'Porque innerHTML no existe en navegadores modernos',
        ],
        correctIndex: 0,
        explanation: 'Evitar innerHTML con entradas no confiables previene vulnerabilidades de inyección de scripts (XSS).',
      },
      {
        prompt: '¿Qué diferencia a const de let en JavaScript moderno?',
        options: [
          'const declara una referencia constante que no puede reasignarse; let sí permite reasignación',
          'const solo funciona para números',
          'let solo existe dentro de HTML',
        ],
        correctIndex: 0,
        explanation: 'Usar const por defecto hace el código más predecible y evita reasignaciones accidentales.',
      },
    ],
  },

  'pw-m6': {
    domainLabel: 'Programación con Python y Proyecto Integrador Web',
    tools: 'Python 3, Condicionales/Ciclos, Listas/Tuplas/Diccionarios, Funciones def, try/except',
    contextIntro:
      'Python destaca por su sintaxis clara basada en indentación, lo que lo convierte en el lenguaje ideal para automatización, backend y ciencia de datos. En este cierre además unificas tus conocimientos web y lógicos en un proyecto integrador funcional.',
    conceptPairs: [
      { term: 'Indentación Significativa', detail: 'En Python los bloques de código (if, for, def) se delimitan con sangría de 4 espacios.' },
      { term: 'Listas vs Tuplas', detail: 'Listas [1, 2] son mutables; tuplas (1, 2) son inmutables.' },
      { term: 'Diccionarios {clave: valor}', detail: 'Permiten búsquedas instantáneas por nombre de atributo.' },
      { term: 'try / except', detail: 'Captura errores en tiempo de ejecución (ej. entrada no numérica) sin colapsar el programa.' },
    ],
    workflowSteps: [
      'Convierte entradas de input() al tipo correcto (int() o float()) antes de calcular.',
      'Organiza registros complejos usando listas de diccionarios.',
      'Encapsula lógica reutilizable dentro de funciones def con parámetros y return.',
      'Protege puntos críticos con bloques try/except y documenta pruebas finales.',
    ],
    exampleTemplate: (topic) => ({
      title: `Módulo Python limpio: ${topic}`,
      snippetOrCase:
        'def calcular_promedio(notas):\n  return sum(notas) / len(notas) if notas else 0\n\ntry:\n  valor = float(input("Ingresa nota: "))\nexcept ValueError:\n  print("Ingresa un número válido.")',
      takeaway: 'Validar entradas y manejar excepciones distingue un prototipo frágil de un software confiable.',
    }),
    commonPitfall:
      'Mezclar tabuladores y espacios en la indentación o intentar sumar un string devuelto por input() sin convertirlo antes a float/int.',
    organizerPattern: (topic) => [
      { title: '1. Sintaxis Clara', detail: `Aplica indentación y tipos de datos en ${topic}.` },
      { title: '2. Estructuras', detail: 'Domina listas, tuplas y diccionarios clave-valor.' },
      { title: '3. Funciones y Errores', detail: 'Modulariza con def y protege con try/except.' },
      { title: '4. Proyecto Integrador', detail: 'Prueba, documenta y defiende la solución final.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué estructura de datos en Python asocia pares clave-valor (por ejemplo {"nombre": "Ana", "promedio": 95})?',
        options: ['Diccionario (dict)', 'Tupla (tuple)', 'Entero (int)'],
        correctIndex: 0,
        explanation: 'Los diccionarios almacenan pares clave:valor para acceder rápidamente por identificador.',
      },
      {
        prompt: '¿Para qué sirve el bloque try / except en Python?',
        options: [
          'Capturar y manejar errores de ejecución de forma controlada sin detener bruscamente el programa',
          'Acelerar la velocidad de internet',
          'Declarar comentarios de una línea',
        ],
        correctIndex: 0,
        explanation: 'try/except permite responder con mensajes claros cuando ocurre una excepción prevista.',
      },
      {
        prompt: '¿Qué carácter o regla delimita los bloques de código dentro de un if o def en Python?',
        options: ['La indentación consistente (sangría de 4 espacios) tras dos puntos (:)', 'Etiquetas HTML', 'Signos de dólar'],
        correctIndex: 0,
        explanation: 'Python utiliza dos puntos y sangría uniforme para definir la jerarquía de bloques.',
      },
    ],
  },

  // --- PROGRAMACIÓN AVANZADA ---
  'pa-m1': {
    domainLabel: 'Programación Orientada a Objetos y Fundamentos en C++',
    tools: 'C++, Clases y Objetos, Encapsulamiento, Herencia, Polimorfismo, Punteros',
    contextIntro:
      'C++ combina alto rendimiento cercano al hardware con Programación Orientada a Objetos (POO). Modelar entidades reales como clases con atributos encapsulados, constructores, herencia y polimorfismo permite construir sistemas de software escalables y veloces.',
    conceptPairs: [
      { term: 'Clase vs Objeto', detail: 'La clase es el plano o molde; el objeto es una instancia concreta en memoria.' },
      { term: 'Encapsulamiento', detail: 'Protege atributos como private y controla cambios mediante getters/setters.' },
      { term: 'Herencia y Polimorfismo', detail: 'Reutiliza comportamiento de una clase base permitiendo métodos especializados.' },
      { term: 'Punteros y Referencias', detail: 'Permiten pasar grandes estructuras sin copiarlas y gestionar memoria dinámica.' },
    ],
    workflowSteps: [
      'Diseña primero los atributos (private) y responsabilidades públicas (public) de cada clase.',
      'Implementa constructores para inicializar objetos en un estado válido desde su creación.',
      'Evita duplicar lógica aplicando herencia y métodos virtuales cuando existan variantes.',
      'Libera memoria dinámica asignada o prefiere contenedores estándar (std::vector, smart pointers).',
    ],
    exampleTemplate: (topic) => ({
      title: `Diseño POO en C++: ${topic}`,
      snippetOrCase:
        'class Producto {\nprivate:\n  int stock;\npublic:\n  Producto(int s) : stock(s) {}\n  int getStock() const { return stock; }\n};',
      takeaway: 'Encapsular el estado interno impide que código externo deje valores inválidos como stock negativo.',
    }),
    commonPitfall:
      'Dejar punteros sin inicializar o sin liberar memoria con delete (fugas de memoria) y exponer todos los atributos como public.',
    organizerPattern: (topic) => [
      { title: '1. Abstracción', detail: `Modela entidades reales como clases en ${topic}.` },
      { title: '2. Encapsulamiento', detail: 'Protege atributos privados con métodos seguros.' },
      { title: '3. Herencia/Polimorfismo', detail: 'Extiende jerarquías sin duplicar código.' },
      { title: '4. Memoria y Eficiencia', detail: 'Optimiza paso por referencia y punteros.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué pilar de la POO oculta los detalles internos de una clase exponiendo únicamente métodos controlados?',
        options: ['Encapsulamiento', 'Compilación estática', 'Recursividad infinita'],
        correctIndex: 0,
        explanation: 'El encapsulamiento protege el estado interno mediante modificadores como private y getters/setters.',
      },
      {
        prompt: '¿Qué ocurre al pasar un parámetro por referencia (&) en C++ en lugar de por valor?',
        options: [
          'La función trabaja sobre la variable original en memoria sin hacer una copia completa',
          'Se elimina la variable original',
          'El código no compila',
        ],
        correctIndex: 0,
        explanation: 'El paso por referencia ahorra memoria y permite modificar el dato original cuando se necesita.',
      },
      {
        prompt: '¿Para qué sirve un constructor dentro de una clase C++?',
        options: [
          'Inicializar los atributos del objeto automáticamente al momento de crearlo',
          'Borrar el archivo fuente',
          'Traducir C++ a HTML',
        ],
        correctIndex: 0,
        explanation: 'El constructor garantiza que cada instancia nazca en un estado consistente.',
      },
    ],
  },

  'pa-m2': {
    domainLabel: 'Desarrollo Robusto y Aplicaciones de Escritorio con Java',
    tools: 'JVM/JDK, POO Java, Excepciones, Colecciones, Swing/JavaFX, Git/GitHub',
    contextIntro:
      'Java es uno de los pilares empresariales gracias a su portabilidad sobre la Máquina Virtual (JVM), su tipado estricto y su rico ecosistema de colecciones, manejo de excepciones y construcción de aplicaciones de escritorio con persistencia.',
    conceptPairs: [
      { term: 'JVM / JDK / JRE', detail: 'JDK incluye compilador y herramientas; la JVM ejecuta el bytecode en cualquier sistema operativo.' },
      { term: 'ArrayList / HashMap', detail: 'Estructuras dinámicas de Java Collections para listas y diccionarios eficientes.' },
      { term: 'Interfaces y Clases Abstractas', detail: 'Contratos claros que desacoplan qué hace un módulo de cómo lo implementa.' },
      { term: 'Git y GitHub', detail: 'Control de versiones distribuido para guardar historial y colaborar en ramas.' },
    ],
    workflowSteps: [
      'Estructura clases en paquetes lógicos aplicando herencia, interfaces y Javadoc.',
      'Maneja fallas previsibles (archivos inexistentes, entradas inválidas) con try/catch/finally.',
      'Conecta botones y formularios Swing/JavaFX mediante listeners desacoplados de la lógica.',
      'Registra avances frecuentes con commits descriptivos en Git.',
    ],
    exampleTemplate: (topic) => ({
      title: `Patrón robusto en Java: ${topic}`,
      snippetOrCase:
        'List<String> alumnos = new ArrayList<>();\ntry (BufferedReader br = new BufferedReader(new FileReader("datos.txt"))) {\n  alumnos.add(br.readLine());\n} catch (IOException e) {\n  System.err.println("Error de lectura: " + e.getMessage());\n}',
      takeaway: 'Usar try-with-resources cierra archivos automáticamente incluso si ocurre una excepción.',
    }),
    commonPitfall:
      'Capturar excepciones con un bloque catch vacío que oculta el error y hace imposible diagnosticar por qué falló la aplicación.',
    organizerPattern: (topic) => [
      { title: '1. Entorno JVM', detail: `Configura paquetes y clases limpias para ${topic}.` },
      { title: '2. Colecciones y POO', detail: 'Usa ArrayList, HashMap e interfaces.' },
      { title: '3. Resiliencia', detail: 'Controla fallos con try/catch y archivos locales.' },
      { title: '4. GUI y Git', detail: 'Conecta eventos visuales y versiona código.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué componente permite que el mismo programa compilado en Java (.class) corra en Windows, Linux y macOS?',
        options: ['La JVM (Java Virtual Machine)', 'El archivo CSS', 'Una hoja de Excel'],
        correctIndex: 0,
        explanation: 'La JVM interpreta o compila el bytecode específico para cada sistema operativo.',
      },
      {
        prompt: '¿Qué colección de Java es ideal para guardar pares únicos clave -> valor (ej. matrícula -> estudiante)?',
        options: ['HashMap', 'Array fijo de tamaño 1', 'Boolean'],
        correctIndex: 0,
        explanation: 'HashMap ofrece acceso promedio en tiempo constante O(1) mediante clave única.',
      },
      {
        prompt: '¿Para qué sirve el bloque finally dentro de un try/catch en Java?',
        options: [
          'Ejecutar código de limpieza siempre, haya ocurrido o no una excepción',
          'Ignorar errores de compilación',
          'Detener la JVM sin cerrar archivos',
        ],
        correctIndex: 0,
        explanation: 'finally asegura liberar recursos como conexiones o flujos de archivo.',
      },
    ],
  },

  'pa-m3': {
    domainLabel: 'Ecosistema C#, .NET y Aplicaciones Conectadas',
    tools: 'C# .NET, Genéricos List<T>, LINQ, WinForms, Consumo de APIs, Pruebas Unitarias',
    contextIntro:
      'C# sobre .NET ofrece productividad moderna con seguridad de tipos, propiedades automáticas, consultas LINQ en memoria y capacidad para desarrollar tanto software de escritorio como aplicaciones multiplataforma conectadas a servicios web.',
    conceptPairs: [
      { term: 'Propiedades Automáticas', detail: 'public string Nombre { get; set; } simplifica el encapsulamiento en C#.' },
      { term: 'LINQ', detail: 'Permite filtrar, ordenar y proyectar colecciones en memoria con sintaxis declarativa.' },
      { term: 'Consumo HTTP / JSON', detail: 'HttpClient conecta la aplicación con APIs REST para sincronizar datos reales.' },
      { term: 'Pruebas Unitarias', detail: 'Verifican automáticamente que cada método produzca los resultados esperados tras cambios.' },
    ],
    workflowSteps: [
      'Define modelos fuertemente tipados agrupados en namespaces ordenados.',
      'Consulta colecciones genéricas usando métodos LINQ (.Where, .OrderBy, .Select).',
      'Valida entradas de usuario en formularios antes de enviar peticiones HTTP asíncronas (async/await).',
      'Escribe pruebas unitarias básicas para proteger la lógica de negocio.',
    ],
    exampleTemplate: (topic) => ({
      title: `Consulta LINQ y Tipado en C#: ${topic}`,
      snippetOrCase:
        'var destacados = estudiantes\n  .Where(e => e.Promedio >= 85)\n  .OrderByDescending(e => e.Promedio)\n  .ToList();',
      takeaway: 'LINQ reemplaza bucles anidados largos por transformaciones declarativas fáciles de leer y probar.',
    }),
    commonPitfall:
      'Bloquear el hilo de la interfaz gráfica haciendo llamadas de red síncronas en lugar de usar async/await.',
    organizerPattern: (topic) => [
      { title: '1. Tipado .NET', detail: `Modela clases, propiedades y genéricos para ${topic}.` },
      { title: '2. Consultas LINQ', detail: 'Filtra y transforma colecciones en memoria.' },
      { title: '3. UI y APIs', detail: 'Valida eventos y consume servicios REST asíncronos.' },
      { title: '4. Calidad', detail: 'Asegura estabilidad con pruebas unitarias.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué permite hacer LINQ en C# sobre una colección List<T>?',
        options: [
          'Filtrar, ordenar y proyectar datos con expresiones declarativas limpias',
          'Dibujar placas electrónicas',
          'Sustituir el sistema operativo',
        ],
        correctIndex: 0,
        explanation: 'LINQ integra capacidades expresivas de consulta directamente en el lenguaje C#.',
      },
      {
        prompt: '¿Por qué es importante usar programación asíncrona (async/await) al consumir una API desde una app con interfaz gráfica?',
        options: [
          'Evita que la pantalla se congele mientras espera la respuesta de la red',
          'Reduce la resolución de pantalla',
          'Elimina la necesidad de usar JSON',
        ],
        correctIndex: 0,
        explanation: 'Mantener el hilo de UI libre garantiza una experiencia fluida durante operaciones de red.',
      },
      {
        prompt: '¿Qué protege una colección genérica como List<Estudiante> frente a listas sin tipo?',
        options: [
          'Garantiza en compilación que solo contenga objetos Estudiante válidos',
          'Permite mezclar cualquier tipo sin control',
          'Oculta los métodos de ordenamiento',
        ],
        correctIndex: 0,
        explanation: 'El tipado fuerte previene errores en tiempo de ejecución desde el momento de compilar.',
      },
    ],
  },

  'pa-m4': {
    domainLabel: 'Bases de Datos Relacionales (SQL) y No Relacionales (NoSQL)',
    tools: 'Modelo E-R, Normalización 1FN–3FN, SQL DDL/DML, JOINs, MongoDB/Firestore',
    contextIntro:
      'Toda aplicación escalable depende de un diseño sólido de datos. En este módulo dominas desde el modelado relacional normalizado con llaves primarias y foráneas hasta consultas SQL con JOINs, agregaciones y criterios para elegir cuándo usar NoSQL documental.',
    conceptPairs: [
      { term: 'PK y FK', detail: 'Primary Key identifica únicamente cada fila; Foreign Key vincula registros entre tablas.' },
      { term: 'Normalización (1FN–3FN)', detail: 'Elimina datos duplicados y anomalías de actualización separando entidades.' },
      { term: 'INNER / LEFT JOIN', detail: 'Combina filas relacionadas de distintas tablas en una sola consulta.' },
      { term: 'SQL vs NoSQL', detail: 'SQL destaca en relaciones rígidas y transacciones; NoSQL escala documentos flexibles.' },
    ],
    workflowSteps: [
      'Identifica entidades, atributos y cardinalidades (1:N, N:M) antes de crear tablas.',
      'Aplica 1FN, 2FN y 3FN asegurando columnas atómicas sin dependencias transitivas.',
      'Ejecuta consultas filtradas con WHERE, GROUP BY e INNER JOIN verificando índices.',
      'Aplica principios de privacidad y mínimo privilegio en el acceso a datos personales.',
    ],
    exampleTemplate: (topic) => ({
      title: `Consulta relacional SQL: ${topic}`,
      snippetOrCase:
        'SELECT a.nombre, COUNT(e.id) AS total_cursos\nFROM alumnos a\nINNER JOIN inscripciones e ON e.alumno_id = a.id\nGROUP BY a.id, a.nombre\nORDER BY total_cursos DESC;',
      takeaway: 'Siempre usa consultas parametrizadas en el backend para neutralizar inyecciones SQL.',
    }),
    commonPitfall:
      'Ejecutar UPDATE o DELETE sin cláusula WHERE, o concatenar texto del usuario directamente dentro de una cadena SQL.',
    organizerPattern: (topic) => [
      { title: '1. Modelado y 3FN', detail: `Define entidades, PK/FK y normalización en ${topic}.` },
      { title: '2. DDL y DML', detail: 'Crea tablas y manipula registros con seguridad.' },
      { title: '3. JOIN y Agregación', detail: 'Cruza tablas y calcula métricas GROUP BY.' },
      { title: '4. NoSQL y Ética', detail: 'Evalúa modelos documentales y protección de datos.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué función cumple una Llave Foránea (Foreign Key) en una base de datos relacional?',
        options: [
          'Garantizar la integridad referencial vinculando un registro con la llave primaria de otra tabla',
          'Cifrar toda la base de datos con SHA-256',
          'Eliminar automáticamente todas las filas cada noche',
        ],
        correctIndex: 0,
        explanation: 'Las llaves foráneas impiden registros huérfanos y conectan tablas de forma consistente.',
      },
      {
        prompt: '¿Qué cláusula SQL agrupa filas con el mismo valor para aplicar funciones como COUNT(), SUM() o AVG()?',
        options: ['GROUP BY', 'ORDER BY', 'ALTER TABLE'],
        correctIndex: 0,
        explanation: 'GROUP BY consolida registros por categoría para calcular agregaciones por grupo.',
      },
      {
        prompt: '¿Por qué es peligroso concatenar entradas de usuario directo en una consulta SQL?',
        options: [
          'Expone la base de datos a ataques de Inyección SQL (SQLi)',
          'Hace que la tabla ocupe menos memoria',
          'Impide usar SELECT',
        ],
        correctIndex: 0,
        explanation: 'Las consultas parametrizadas separan la lógica SQL de los datos evitando inyecciones.',
      },
    ],
  },

  'pa-m5': {
    domainLabel: 'Internet de las Cosas (IoT) y Hardware Libre con Arduino IDE',
    tools: 'Arduino UNO/ESP32, Arduino IDE, Pines Digitales/Analógicos, PWM, Sensores, Monitor Serie',
    contextIntro:
      'El Internet de las Cosas conecta el mundo físico con plataformas digitales. Programando microcontroladores con Arduino IDE lees sensores ambientales, accionas motores o LEDs mediante PWM y envías telemetría en tiempo real hacia la nube.',
    conceptPairs: [
      { term: 'setup() y loop()', detail: 'setup() configura pines una sola vez al encender; loop() ejecuta la lógica continuamente.' },
      { term: 'Digital vs Analógico (ADC)', detail: 'Digital lee/escribe HIGH o LOW; analógico mide voltajes continuos (0–1023).' },
      { term: 'PWM (analogWrite)', detail: 'Simula niveles intermedios de potencia para atenuar LEDs o variar velocidad.' },
      { term: 'Monitor Serie / Wi-Fi', detail: 'Permite depurar lecturas en PC y transmitir telemetría vía ESP8266/ESP32.' },
    ],
    workflowSteps: [
      'Verifica conexiones eléctricas en protoboard (polaridad y resistencias limitadoras) antes de energizar.',
      'Configura cada pin en setup() con pinMode(pin, INPUT/OUTPUT).',
      'Lee sensores o controla actuadores dentro de loop() evitando bloqueos largos con delay().',
      'Monitorea valores reales en Serial.println() antes de publicar a servidores IoT.',
    ],
    exampleTemplate: (topic) => ({
      title: `Sketch IoT en Arduino IDE: ${topic}`,
      snippetOrCase:
        'void setup() {\n  pinMode(9, OUTPUT);\n  Serial.begin(9600);\n}\nvoid loop() {\n  int luz = analogRead(A0);\n  analogWrite(9, map(luz, 0, 1023, 255, 0));\n  Serial.println(luz);\n}',
      takeaway: 'Siempre coloca resistencia de 220Ω–330Ω en serie con un LED para proteger el pin del microcontrolador.',
    }),
    commonPitfall:
      'Conectar LEDs o motores DC directamente sin resistencia o driver, o invertir polaridad VCC/GND quemando el sensor.',
    organizerPattern: (topic) => [
      { title: '1. Circuito Seguro', detail: `Valida polaridad y resistencias para ${topic}.` },
      { title: '2. setup() y Pines', detail: 'Declara entradas digitales, ADC o salidas PWM.' },
      { title: '3. Sensores y Actuadores', detail: 'Procesa lecturas físicas en loop().' },
      { title: '4. Telemetría IoT', detail: 'Depura por Serial y publica vía Wi-Fi.' },
    ],
    quizPool: () => [
      {
        prompt: 'En un programa de Arduino, ¿cuál es la diferencia entre setup() y loop()?',
        options: [
          'setup() corre una vez al iniciar; loop() se repite continuamente mientras la placa tenga energía',
          'loop() solo corre una vez al apagar la placa',
          'Ambos sirven únicamente para Wi-Fi',
        ],
        correctIndex: 0,
        explanation: 'setup() inicializa configuraciones y puertos; loop() mantiene el ciclo de control continuo.',
      },
      {
        prompt: '¿Para qué se utiliza la técnica PWM (Modulación por Ancho de Pulsos) en Arduino?',
        options: [
          'Regular gradualmente el brillo de un LED o la velocidad de un motor desde salidas digitales',
          'Aumentar la memoria RAM física de la placa',
          'Imprimir documentos de Word',
        ],
        correctIndex: 0,
        explanation: 'PWM conmuta rápidamente entre HIGH y LOW variando el ciclo de trabajo promedio.',
      },
      {
        prompt: '¿Qué componente es indispensable conectar en serie con un LED estándar en Arduino?',
        options: ['Una resistencia limitadora de corriente (ej. 220Ω o 330Ω)', 'Un cable HDMI', 'Una pila de 24V sin control'],
        correctIndex: 0,
        explanation: 'La resistencia evita exceso de corriente que dañaría tanto al LED como al pin digital.',
      },
    ],
  },

  'pa-m6': {
    domainLabel: 'Introducción al Machine Learning y Proyecto Integrador Avanzado',
    tools: 'Python, NumPy, Pandas, Matplotlib/Seaborn, Regresión Lineal, Clasificación, Métricas',
    contextIntro:
      'A diferencia de la programación clásica basada en reglas escritas a mano, el Machine Learning aprende patrones estadísticos directamente de datos históricos limpios. Aquí recorres el flujo completo: limpieza, análisis visual, entrenamiento, evaluación y defensa técnica.',
    conceptPairs: [
      { term: 'Pandas y NumPy', detail: 'Manipulación eficiente de matrices numéricas y tablas de datos (DataFrames).' },
      { term: 'Preprocesamiento', detail: 'Limpiar nulos, codificar categorías y normalizar escalas antes de entrenar.' },
      { term: 'Regresión vs Clasificación', detail: 'Regresión predice cantidades continuas; clasificación asigna categorías discretas.' },
      { term: 'Matriz de Confusión', detail: 'Evalúa aciertos, falsos positivos y falsos negativos sobre datos de prueba.' },
    ],
    workflowSteps: [
      'Explora tu conjunto de datos con Pandas (.head(), .describe(), .isna().sum()).',
      'Divide los datos en entrenamiento y prueba antes de normalizar para evitar fuga de datos.',
      'Entrena un modelo base interpretable (Regresión Lineal o Árbol de Decisión).',
      'Mide desempeño con métricas reales y documenta límites éticos del sistema.',
    ],
    exampleTemplate: (topic) => ({
      title: `Pipeline ML en Python: ${topic}`,
      snippetOrCase:
        'import pandas as pd\ndf = pd.read_csv("estudiantes.csv").dropna()\n# Separar variables X (horas_estudio) y objetivo y (puntaje)\n# Entrenar modelo sobre train y medir error/precisión en test.',
      takeaway: 'La calidad del preprocesamiento de datos impacta más el resultado que cambiar de algoritmo.',
    }),
    commonPitfall:
      'Evaluar la precisión del modelo con los mismos datos con los que fue entrenado (sobreajuste u overfitting).',
    organizerPattern: (topic) => [
      { title: '1. Datos y Limpieza', detail: `Depura nulos y normaliza variables para ${topic}.` },
      { title: '2. Exploración Visual', detail: 'Detecta correlaciones con Matplotlib/Seaborn.' },
      { title: '3. Entrenamiento', detail: 'Ajusta regresión o clasificación sobre train.' },
      { title: '4. Evaluación y Defensa', detail: 'Valida métricas en test y documenta el proyecto.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Por qué se dividen los datos en conjunto de entrenamiento (train) y de prueba (test)?',
        options: [
          'Para medir si el modelo generaliza bien ante datos nuevos que nunca ha visto',
          'Para borrar la mitad de la base de datos',
          'Para evitar usar Python',
        ],
        correctIndex: 0,
        explanation: 'Evaluar sobre datos no vistos revela si el modelo aprendió patrones reales o solo memorizó.',
      },
      {
        prompt: '¿Qué tipo de problema resuelve una Regresión Lineal supervisada?',
        options: [
          'Predecir un valor numérico continuo (como precio, temperatura o puntaje)',
          'Diseñar un botón HTML',
          'Enviar correos con copia oculta',
        ],
        correctIndex: 0,
        explanation: 'La regresión estima cantidades numéricas continuas a partir de variables de entrada.',
      },
      {
        prompt: '¿Qué librería de Python es el estándar para manipular tablas de datos (DataFrames)?',
        options: ['Pandas', 'PowerPoint', 'CSS3'],
        correctIndex: 0,
        explanation: 'Pandas facilita carga, limpieza, filtrado y transformación de datos tabulares.',
      },
    ],
  },

  // --- TECNOLOGÍA SOCIAL ---
  'ts-m1': {
    domainLabel: 'Diagnóstico y Mapeo de Problemáticas Sociales con Datos',
    tools: 'Datos Abiertos (INEGI/CONEVAL), Visualización de Brechas, Árbol de Problemas',
    contextIntro:
      'Innovar socialmente con tecnología comienza escuchando a la comunidad y respaldando el diagnóstico con evidencia real. Cruzar datos abiertos oficiales con encuestas locales permite atacar causas raíz y no solo síntomas visibles.',
    conceptPairs: [
      { term: 'Datos Primarios vs Abiertos', detail: 'Primarios se recaban en campo; abiertos provienen de fuentes oficiales públicas.' },
      { term: 'Árbol de Problemas', detail: 'Diagrama que conecta causas raíz (raíces), problema central (tronco) y efectos (ramas).' },
      { term: 'Brecha Digital', detail: 'Desigualdad en acceso a conectividad, dispositivos o competencias tecnológicas.' },
      { term: 'Visualización Clara', detail: 'Gráficos comparativos que muestran dónde se concentra la necesidad.' },
    ],
    workflowSteps: [
      'Delimita una problemática local concreta (educación, salud, agua, empleo juvenil o seguridad).',
      'Recopila estadísticas públicas verificables y complementa con entrevistas comunitarias.',
      'Construye un árbol de problemas convirtiendo cada causa en un objetivo tecnológico viable.',
      'Presenta el diagnóstico mediante gráficos comprensibles para cualquier ciudadano.',
    ],
    exampleTemplate: (topic) => ({
      title: `Diagnóstico comunitario: ${topic}`,
      snippetOrCase:
        'Problema central: Rezago en trámites y becas juveniles locales.\nCausa raíz: Falta de guía accesible en móvil y horarios dispersos.\nObjetivo tech: Portal ligero consultable con pocos datos móviles.',
      takeaway: 'La mejor tecnología social es simple, pertinente al contexto local y respaldada por datos reales.',
    }),
    commonPitfall:
      'Enamorarse de una tecnología de moda (ej. app pesada o blockchain) antes de preguntar qué necesita realmente la comunidad.',
    organizerPattern: (topic) => [
      { title: '1. Escucha Local', detail: `Mapea necesidades reales en torno a ${topic}.` },
      { title: '2. Evidencia Pública', detail: 'Respalda con bases de datos abiertas y encuestas.' },
      { title: '3. Causa Raíz', detail: 'Estructura el árbol de problemas y objetivos.' },
      { title: '4. Priorización', detail: 'Elige la solución de mayor impacto y viabilidad.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Por qué se construye un Árbol de Problemas antes de programar una solución social?',
        options: [
          'Para distinguir causas raíz de efectos visibles y enfocar la tecnología donde realmente resuelve el origen',
          'Para complicar el proyecto sin datos',
          'Para evitar hablar con la comunidad',
        ],
        correctIndex: 0,
        explanation: 'Atacar causas raíz genera soluciones duraderas en lugar de parches temporales.',
      },
      {
        prompt: '¿Qué ventaja aporta consultar repositorios públicos como INEGI o datos abiertos municipales?',
        options: [
          'Fundamentar la magnitud del problema con estadísticas oficiales verificables',
          'Inventar cifras sin respaldo',
          'Evitar el uso de gráficos',
        ],
        correctIndex: 0,
        explanation: 'La evidencia cuantitativa fortalece tanto el diseño como la búsqueda de apoyos.',
      },
      {
        prompt: '¿Qué error frecuente debes evitar al iniciar un proyecto de tecnología social?',
        options: [
          'Diseñar una solución asumiendo necesidades sin consultar a quienes viven el problema',
          'Validar tus hipótesis con datos reales',
          'Simplificar la interfaz para teléfonos básicos',
        ],
        correctIndex: 0,
        explanation: 'El diagnóstico participativo garantiza pertinencia y adopción real.',
      },
    ],
  },

  'ts-m2': {
    domainLabel: 'Design Thinking Social y Metodologías Ágiles',
    tools: 'Empatizar-Definir-Idear-Prototipar-Testear, Mapas de Empatía, Scrum/Kanban, No-Code',
    contextIntro:
      'El Design Thinking pone a las personas en el centro del proceso creativo. Al unirlo con entregas cortas tipo Scrum/Kanban y prototipos rápidos (desde papel hasta No-Code), validas si tu idea realmente funciona antes de invertir meses de desarrollo.',
    conceptPairs: [
      { term: 'Mapa de Empatía', detail: 'Herramienta para entender qué piensa, siente, ve y necesita el usuario comunitario.' },
      { term: 'Prototipo Rápido (MVP)', detail: 'Versión mínima funcional en papel o No-Code para probar hipótesis con usuarios reales.' },
      { term: 'Sprints Ágiles', detail: 'Ciclos cortos de 1–2 semanas con entregas visibles y retroalimentación constante.' },
      { term: 'Herramientas No-Code', detail: 'Plataformas visuales para validar flujos web o formularios sin programación extensa.' },
    ],
    workflowSteps: [
      'Realiza entrevistas abiertas escuchando sin juzgar ni vender tu idea prematuramente.',
      'Sintetiza hallazgos en un Mapa de Empatía y define el reto en una pregunta "¿Cómo podríamos...?".',
      'Dibuja bocetos de baja fidelidad o maquetas No-Code y pruébalos con 5 usuarios reales.',
      'Organiza mejoras por iteraciones semanales en un tablero Kanban.',
    ],
    exampleTemplate: (topic) => ({
      title: `Iteración centrada en usuario: ${topic}`,
      snippetOrCase:
        'Reto: ¿Cómo podríamos ayudar a adultos mayores a agendar citas locales sin confundirse?\nPrototipo v1: Formulario de 3 pasos con letra grande -> Prueba en campo -> Ajuste de botones.',
      takeaway: 'Fallar y corregir en un prototipo de 1 día cuesta cero; hacerlo tras 6 meses de código cuesta muchísimo.',
    }),
    commonPitfall:
      'Intentar defender el prototipo cuando el usuario no entiende cómo usarlo, en vez de agradecer el hallazgo y simplificar el diseño.',
    organizerPattern: (topic) => [
      { title: '1. Empatizar y Definir', detail: `Comprende al usuario detrás de ${topic}.` },
      { title: '2. Idear', detail: 'Explora múltiples soluciones antes de elegir una.' },
      { title: '3. Prototipar Rápido', detail: 'Construye maquetas en papel o No-Code.' },
      { title: '4. Iterar Ágilmente', detail: 'Valida con Scrum/Kanban en ciclos cortos.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuál es el objetivo principal de crear un prototipo rápido de baja fidelidad o No-Code?',
        options: [
          'Probar y validar rápidamente si la solución resuelve la necesidad real del usuario antes de programar de más',
          'Publicar la versión definitiva sin hacer pruebas',
          'Ocultar el proyecto al público',
        ],
        correctIndex: 0,
        explanation: 'Prototipar temprano acelera el aprendizaje y reduce costos de error.',
      },
      {
        prompt: 'En Design Thinking, ¿qué se busca durante una entrevista de empatía?',
        options: [
          'Escuchar experiencias reales, frustraciones y necesidades del usuario con mente abierta',
          'Convencer al entrevistado de que nuestra idea ya es perfecta',
          'Aplicar únicamente preguntas de sí/no',
        ],
        correctIndex: 0,
        explanation: 'La escucha genuina revela detalles invisibles desde el escritorio.',
      },
      {
        prompt: '¿Qué caracteriza a un flujo ágil tipo Kanban en proyectos comunitarios?',
        options: [
          'Visualizar tareas por estado (Por hacer, En curso, Listo) y entregar valor de forma continua',
          'Esperar un año entero para mostrar avances',
          'Evitar comunicarse entre integrantes',
        ],
        correctIndex: 0,
        explanation: 'La visibilidad del tablero mantiene alineado al equipo y facilita ajustes rápidos.',
      },
    ],
  },

  'ts-m3': {
    domainLabel: 'Emprendimiento Social y Gestión de Recursos Tecnológicos',
    tools: 'Canvas Social, Subvenciones/Crowdfunding, Transferencia Tecnológica, Storytelling',
    contextIntro:
      'Un proyecto social necesita un modelo sostenible para no desaparecer cuando termina el semestre. A través del Canvas Social, alianzas, financiamiento colaborativo y transferencia tecnológica empoderas a la comunidad para apropiarse de la herramienta.',
    conceptPairs: [
      { term: 'Canvas Social', detail: 'Integra propuesta de valor social, beneficiarios, aliados, costos e ingresos sostenibles.' },
      { term: 'Crowdfunding / Subvenciones', detail: 'Financiamiento colectivo transparente y convocatorias de impacto.' },
      { term: 'Transferencia Tecnológica', detail: 'Capacitar a la comunidad con manuales claros para que opere la solución con autonomía.' },
      { term: 'Storytelling de Impacto', detail: 'Narrativa que une historias humanas reales con cifras verificables.' },
    ],
    workflowSteps: [
      'Completa tu Canvas Social diferenciando entre usuario beneficiario y fuente de financiamiento.',
      'Automatiza registros administrativos básicos para transparentar cada peso invertido.',
      'Diseña guías accesibles de adopción digital adaptadas al nivel técnico de la comunidad.',
      'Prepara una narrativa de impacto combinando testimonios y evidencia cuantitativa.',
    ],
    exampleTemplate: (topic) => ({
      title: `Modelo de Impacto: ${topic}`,
      snippetOrCase:
        'Propuesta de valor: Capacitación STEM accesible.\nSostenibilidad: Becas financiadas por alianzas escolares + talleres corporativos.\nTransferencia: Guías paso a paso y mentoría local.',
      takeaway: 'La tecnología solo transforma una comunidad cuando las personas locales saben usarla y sostenerla.',
    }),
    commonPitfall:
      'Depender únicamente de una donación única sin planear costos de mantenimiento ni capacitación de operadores locales.',
    organizerPattern: (topic) => [
      { title: '1. Canvas Social', detail: `Define valor e impacto sostenible para ${topic}.` },
      { title: '2. Recursos', detail: 'Explora subvenciones, alianzas o crowdfunding.' },
      { title: '3. Adopción Local', detail: 'Transfiere conocimiento con capacitación accesible.' },
      { title: '4. Visibilidad', detail: 'Comunica logros con storytelling transparente.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué significa realizar una "transferencia tecnológica" efectiva en una comunidad?',
        options: [
          'Capacitar y acompañar a los usuarios locales para que dominen y aprovechen la herramienta por sí mismos',
          'Dejar un software complejo sin instrucciones ni soporte',
          'Cobrar sin explicar cómo funciona',
        ],
        correctIndex: 0,
        explanation: 'La autonomía de la comunidad es clave para que la innovación genere impacto permanente.',
      },
      {
        prompt: '¿Qué elemento distingue a un Canvas Social de un modelo de negocio tradicional?',
        options: [
          'Coloca explícitamente el impacto social/ambiental y los beneficiarios en el centro de la propuesta de valor',
          'Ignora los costos operativos',
          'Prohíbe medir resultados',
        ],
        correctIndex: 0,
        explanation: 'El Canvas Social equilibra viabilidad económica con transformación social medible.',
      },
      {
        prompt: '¿Qué combina un Storytelling de impacto convincente?',
        options: [
          'Una historia humana real respaldada por datos concretos de cambio',
          'Únicamente tecnicismos incomprensibles',
          'Promesas sin evidencia',
        ],
        correctIndex: 0,
        explanation: 'La empatía narrativa junto con cifras verificables inspira confianza en aliados y donantes.',
      },
    ],
  },

  'ts-m4': {
    domainLabel: 'Inclusión Digital, KPIs de Impacto y Sostenibilidad',
    tools: 'Accesibilidad e Inclusión de Género, KPIs Sociales, Privacidad Ética, Escalabilidad',
    contextIntro:
      'Medir si una iniciativa realmente mejoró la vida de las personas exige indicadores claros (KPIs sociales), diseño inclusivo con perspectiva de género y respeto absoluto a la privacidad de sectores vulnerables.',
    conceptPairs: [
      { term: 'Inclusión y Perspectiva de Género', detail: 'Diseñar espacios y herramientas libres de sesgos donde mujeres y grupos diversos lideren.' },
      { term: 'KPIs Sociales', detail: 'Métricas verificables (ej. % de permanencia, horas ahorradas, ingresos generados).' },
      { term: 'Ética y Privacidad', detail: 'Minimizar recolección de datos sensibles y proteger identidades vulnerables.' },
      { term: 'Sostenibilidad', detail: 'Plan de mantenimiento técnico, costos y relevo generacional a largo plazo.' },
    ],
    workflowSteps: [
      'Audita tu solución verificando usabilidad para distintos géneros, edades y conectividad limitada.',
      'Define 3 KPIs sociales cuantificables con línea base y meta trimestral.',
      'Implementa consentimiento informado y resguardo cifrado para cualquier dato personal.',
      'Prepara la defensa final demostrando impacto medido y continuidad operativa.',
    ],
    exampleTemplate: (topic) => ({
      title: `Tablero de Impacto Social: ${topic}`,
      snippetOrCase:
        'KPI 1: % de participantes que completan el nivel técnico (Meta: >= 80%).\nKPI 2: Participación femenina en proyectos de liderazgo STEM (Meta: >= 50%).\nPrivacidad: Datos anónimos en reportes públicos.',
      takeaway: 'Lo que se mide con ética y precisión permite demostrar impacto real y escalar a más comunidades.',
    }),
    commonPitfall:
      'Medir solo "métricas de vanidad" (ej. número de clics o likes) en lugar de cambios reales en habilidades o bienestar.',
    organizerPattern: (topic) => [
      { title: '1. Diseño Inclusivo', detail: `Asegura acceso equitativo y diversidad en ${topic}.` },
      { title: '2. Métricas KPI', detail: 'Define indicadores reales de transformación.' },
      { title: '3. Resguardo Ético', detail: 'Protege privacidad y dignidad de participantes.' },
      { title: '4. Escala y Defensa', detail: 'Garantiza sostenibilidad y valida ante jurado.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuál es un ejemplo de KPI social sólido frente a una métrica de vanidad?',
        options: [
          'Porcentaje de jóvenes que obtienen certificación práctica y aplican la habilidad en su escuela o empleo',
          'Número total de personas que vieron un póster de lejos',
          'Cantidad de colores usados en el logotipo',
        ],
        correctIndex: 0,
        explanation: 'Los KPIs sociales miden resultados tangibles en la vida y capacidades de las personas.',
      },
      {
        prompt: 'Al trabajar con datos de comunidades vulnerables, ¿qué regla ética es innegociable?',
        options: [
          'Recabar solo los datos estrictamente necesarios, con consentimiento y protección segura',
          'Publicar nombres y domicilios en abierto',
          'Vender la base de datos a terceros',
        ],
        correctIndex: 0,
        explanation: 'La minimización de datos y el consentimiento protegen la seguridad y dignidad humana.',
      },
      {
        prompt: '¿Qué busca la perspectiva de género e inclusión digital en proyectos STEM?',
        options: [
          'Eliminar barreras culturales y técnicas para garantizar participación y liderazgo equitativo',
          'Limitar el acceso a un solo grupo',
          'Evitar mentorías y referentes visibles',
        ],
        correctIndex: 0,
        explanation: 'La diversidad en tecnología produce soluciones más justas, completas y representativas.',
      },
    ],
  },

  // --- TALLERES FINANZAS & TIEMPO (fallback profile if needed) & TALLERES STEM M1-M6 ---
  'talleres-finanzas': {
    domainLabel: 'Herramientas Tech para Finanzas Personales',
    tools: 'Excel/Sheets 50/30/20, Apps de Gastos, Calculadora de Interés Compuesto, Seguridad Bancaria',
    contextIntro:
      'Combinar educación financiera práctica con herramientas digitales te da control total sobre tus ingresos, gastos, metas de ahorro y seguridad bancaria.',
    conceptPairs: [
      { term: 'Regla 50/30/20', detail: 'Equilibrio entre necesidades, estilo de vida y ahorro prioritario.' },
      { term: 'Interés Compuesto', detail: 'Crecimiento exponencial al reinvertir rendimientos en el tiempo.' },
      { term: 'Control Móvil', detail: 'Registro inmediato y alertas preventivas al 80% del presupuesto.' },
      { term: 'Seguridad Digital', detail: 'CVV dinámico, 2FA y verificación directa en canales oficiales.' },
    ],
    workflowSteps: [
      'Registra ingresos netos y gastos reales durante al menos 15 días.',
      'Automatiza el presupuesto 50/30/20 en hoja de cálculo.',
      'Simula tus metas en el Simulador de Finanzas de MentMar.',
      'Aplica medidas de blindaje digital en tus cuentas.',
    ],
    exampleTemplate: (topic) => ({
      title: `Aplicación financiera: ${topic}`,
      snippetOrCase: 'Ingreso neto -> Apartado automático 20% -> Control semanal de categorías.',
      takeaway: 'La disciplina financiera apoyada en tecnología construye libertad y tranquilidad.',
    }),
    commonPitfall: 'Postergar el ahorro esperando ingresos enormes en lugar de construir el hábito desde hoy.',
    organizerPattern: (topic) => [
      { title: '1. Diagnóstico', detail: `Mide ingresos y fugas en ${topic}.` },
      { title: '2. Presupuesto Tech', detail: 'Automatiza topes en hojas o apps.' },
      { title: '3. Crecimiento', detail: 'Proyecta ahorro e interés compuesto.' },
      { title: '4. Protección', detail: 'Blinda cuentas frente a fraudes digitales.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuál es el orden saludable al recibir tus ingresos mensuales?',
        options: [
          'Separar primero tu ahorro (20%) y administrar gastos dentro de los topes 50/30',
          'Gastar todo primero y ahorrar solo si sobra',
          'No registrar ningún movimiento',
        ],
        correctIndex: 0,
        explanation: 'Priorizar el ahorro al inicio asegura el cumplimiento constante de tus metas.',
      },
      {
        prompt: '¿Qué herramienta te permite proyectar el efecto del tiempo y la tasa en tus ahorros?',
        options: ['La fórmula y simulador de interés compuesto', 'Un editor de diapositivas', 'Un compresor ZIP'],
        correctIndex: 0,
        explanation: 'Visualizar la curva compuesta ayuda a tomar decisiones con horizonte de mediano y largo plazo.',
      },
      {
        prompt: '¿Qué hábito protege tus compras por internet?',
        options: [
          'Usar tarjeta digital con CVV dinámico y revisar la URL HTTPS oficial',
          'Guardar tu NIP en notas públicas',
          'Abrir enlaces recibidos por SMS sospechosos',
        ],
        correctIndex: 0,
        explanation: 'El CVV dinámico limita la exposición de tu cuenta principal.',
      },
    ],
  },

  'talleres-tiempo': {
    domainLabel: 'Tecnología para la Administración del Tiempo',
    tools: 'Google Calendar/Outlook, Notion/Trello/Todoist, Temporizador Pomodoro, Automatización',
    contextIntro:
      'Administrar el tiempo con tecnología no significa llenar cada minuto de estrés, sino diseñar sistemas claros de enfoque, priorización y descanso que te permitan avanzar con calma.',
    conceptPairs: [
      { term: 'Time-Blocking', detail: 'Asignar bloques de calendario específicos a tus prioridades.' },
      { term: 'Matriz de Eisenhower', detail: 'Distinguir lo verdaderamente importante de lo meramente urgente.' },
      { term: 'Técnica Pomodoro', detail: 'Bloques de 25 min sin distracciones + 5 min de pausa activa.' },
      { term: 'Bienestar Digital', detail: 'Límites de notificaciones y ritual de cierre diario.' },
    ],
    workflowSteps: [
      'Centraliza tus pendientes en un único gestor confiable.',
      'Clasifica por importancia y urgencia antes de ejecutar.',
      'Agenda bloques profundos en tu calendario y protégelos con Pomodoro.',
      'Revisa semanalmente y ajusta para mantener equilibrio personal.',
    ],
    exampleTemplate: (topic) => ({
      title: `Sistema de enfoque: ${topic}`,
      snippetOrCase: 'Prioridad Q2 -> Bloque en calendario 09:00–10:30 -> 3 ciclos Pomodoro 25/5.',
      takeaway: 'La claridad reduce la procrastinación y protege tu tiempo libre.',
    }),
    commonPitfall: 'Intentar hacer cinco tareas al mismo tiempo (multitarea), lo que reduce calidad y duplica el cansancio.',
    organizerPattern: (topic) => [
      { title: '1. Captura', detail: `Reúne pendientes de ${topic} en un solo lugar.` },
      { title: '2. Priorización', detail: 'Filtra con Matriz de Eisenhower.' },
      { title: '3. Ejecución', detail: 'Aplica Time-Blocking y Pomodoro.' },
      { title: '4. Balance', detail: 'Automatiza rutinas y protege descansos.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Por qué la multitarea constante reduce tu rendimiento académico?',
        options: [
          'Cada cambio de atención consume energía y aumenta errores al retomar la tarea',
          'Porque el cerebro procesa diez lecturas complejas a la vez sin pérdida',
          'Porque bloquea el teclado',
        ],
        correctIndex: 0,
        explanation: 'Trabajar en bloques enfocados de una sola tarea mejora la comprensión y velocidad.',
      },
      {
        prompt: '¿Qué combinación une planificación horaria con enfoque inmediato?',
        options: [
          'Time-Blocking en calendario + ciclos Pomodoro',
          'Dejar todo sin fecha ni hora',
          'Revisar notificaciones cada minuto',
        ],
        correctIndex: 0,
        explanation: 'El calendario reserva el espacio y Pomodoro estructura la ejecución sin fatiga.',
      },
      {
        prompt: '¿En qué cuadrante nacen el aprendizaje continuo y los proyectos preventivos?',
        options: ['Cuadrante 2: Importante y No Urgente', 'Cuadrante 4: Ni Importante ni Urgente', 'En ninguno'],
        correctIndex: 0,
        explanation: 'Dedicar tiempo planificado al Cuadrante 2 evita crisis de último minuto.',
      },
    ],
  },

  'tal-m1': {
    domainLabel: 'Comunicación Técnica y Propósito (Talleres 1 y 4)',
    tools: 'Demo en Vivo, Estructura Problema-Solución-Impacto, Storytelling Tecnológico',
    contextIntro:
      'Construir una gran solución técnica no basta si no sabes explicarla con claridad humana. En estos talleres aprendes a pasar de líneas de código o prototipos a un relato inspirador que conecte la tecnología con las personas a quienes ayuda.',
    conceptPairs: [
      { term: 'Propósito antes que Jerga', detail: 'Explica primero qué problema humano resuelves antes de listar librerías o protocolos.' },
      { term: 'Demo Segura', detail: 'Muestra el flujo principal de tu app paso a paso con respaldo listo ante fallas de red.' },
      { term: 'Arco Narrativo', detail: 'Situación inicial -> Conflicto/Brecha -> Solución tecnológica -> Transformación lograda.' },
      { term: 'Audiencia Real', detail: 'Adapta el vocabulario técnico según hables con usuarios, jurados o desarrolladores.' },
    ],
    workflowSteps: [
      'Resume en una sola oración quién se beneficia de tu proyecto y cómo mejora su vida.',
      'Prepara una demostración de 90 segundos enfocada en la experiencia del usuario final.',
      'Construye la historia detrás de tu app destacando el momento en que descubriste el problema.',
      'Graba un ensayo rápido verificando ritmo, claridad de pantalla y dicción.',
    ],
    exampleTemplate: (topic) => ({
      title: `Estructura narrativa: ${topic}`,
      snippetOrCase:
        'Gancho: "En nuestra comunidad, 6 de cada 10 estudiantes..."\nSolución: "Creamos esta plataforma que en 3 clics..."\nDemo: Mostrar flujo real en pantalla.\nCierre: Impacto medido y siguiente paso.',
      takeaway: 'Las personas recuerdan historias humanas y demostraciones claras mucho más que diapositivas llenas de código.',
    }),
    commonPitfall:
      'Empezar una presentación diciendo "Usamos React, Express y 14 tablas SQL..." antes de contar qué problema resuelve la aplicación.',
    organizerPattern: (topic) => [
      { title: '1. Gancho Humano', detail: `Conecta ${topic} con una necesidad real visible.` },
      { title: '2. Historia y Reto', detail: 'Narra el origen y los obstáculos superados.' },
      { title: '3. Demo Clara', detail: 'Enseña la solución funcionando sin tecnicismos excesivos.' },
      { title: '4. Propósito', detail: 'Cierra mostrando el cambio generado en la comunidad.' },
    ],
    quizPool: () => [
      {
        prompt: 'Al presentar un prototipo técnico ante un público general, ¿por dónde conviene iniciar?',
        options: [
          'Por el problema humano que resuelve y quién se beneficia',
          'Leyendo 100 líneas de código fuente en voz alta',
          'Explicando la configuración del compilador',
        ],
        correctIndex: 0,
        explanation: 'Conectar primero con la necesidad genera interés para entender cómo funciona la solución.',
      },
      {
        prompt: '¿Qué elemento vuelve memorable al Storytelling de un proyecto tecnológico?',
        options: [
          'Mostrar la historia real de usuario detrás de la tecnología y su transformación',
          'Evitar mencionar para qué sirve la app',
          'Hablar sin pausas leyendo un guion técnico',
        ],
        correctIndex: 0,
        explanation: 'La tecnología cobra sentido cuando se ve reflejada en una historia real.',
      },
      {
        prompt: '¿Cómo previenes imprevistos durante una demostración en vivo?',
        options: [
          'Probando el flujo antes y teniendo capturas o video de respaldo listos',
          'Programando funciones nuevas cinco minutos antes de subir al escenario',
          'No ensayar previamente',
        ],
        correctIndex: 0,
        explanation: 'Tener respaldo garantiza profesionalismo incluso si falla la conexión del lugar.',
      },
    ],
  },

  'tal-m2': {
    domainLabel: 'Trabajo en Equipo bajo Presión y Liderazgo Ágil STEM (Talleres 2 y 5)',
    tools: 'Roles de Hackathon, MVP (Producto Mínimo Viable), Tablero Rápido, Liderazgo Colaborativo',
    contextIntro:
      'En hackathons y proyectos escolares intensivos el reloj avanza rápido y la presión puede dividir a un equipo. Aprenderás a repartir roles claros, recortar alcance hacia un MVP funcional y ejercer un liderazgo juvenil que escucha, desbloquea y suma fortalezas.',
    conceptPairs: [
      { term: 'MVP (Mínimo Viable)', detail: 'La versión más pequeña que demuestra el valor central de tu solución funcionando.' },
      { term: 'Roles Complementarios', detail: 'Coordinación/Pitch, Diseño UX, Lógica/Backend y Datos trabajando en paralelo.' },
      { term: 'Check-ins Cortos', detail: 'Reuniones de 5 minutos cada 2 horas: ¿qué logramos, qué sigue y qué nos bloquea?' },
      { term: 'Liderazgo de Servicio', detail: 'El líder organiza, escucha y elimina obstáculos del equipo en lugar de acaparar todo.' },
    ],
    workflowSteps: [
      'En los primeros 20 minutos, acuerden alcance exacto del MVP y digan "no" a funciones extra.',
      'Asignen responsabilidades claras evitando que dos personas editen el mismo bloque sin coordinarse.',
      'Realicen integraciones tempranas cada pocas horas para no juntar todo al último minuto.',
      'Mantengan comunicación respetuosa cuando aparezcan errores bajo presión.',
    ],
    exampleTemplate: (topic) => ({
      title: `Hoja de ruta Hackathon/MVP: ${topic}`,
      snippetOrCase:
        'Hora 0–2: Definir MVP + boceto.\nHora 2–8: Construcción paralela (UI + Datos + Lógica).\nHora 8–10: Integración obligatoria.\nHora 10–12: Pruebas y ensayo de Pitch.',
      takeaway: 'Un MVP modesto pero terminado y funcionando siempre vence a una idea gigantesca a medio construir.',
    }),
    commonPitfall:
      'Intentar integrar el trabajo de cuatro personas faltando 30 minutos para la entrega o querer construir 10 funciones en un solo fin de semana.',
    organizerPattern: (topic) => [
      { title: '1. Alcance MVP', detail: `Acota la función esencial de ${topic}.` },
      { title: '2. Roles Claros', detail: 'Divide tareas según fortalezas del equipo.' },
      { title: '3. Sincronización', detail: 'Haz check-ins breves e integra temprano.' },
      { title: '4. Liderazgo Positivo', detail: 'Resuelve bloqueos con calma y apoyo mutuo.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué significa construir un MVP (Producto Mínimo Viable) en un hackathon o proyecto corto?',
        options: [
          'Enfocarse en la versión más simple que demuestra la solución principal funcionando de verdad',
          'Agregar todas las funciones imaginables aunque ninguna funcione',
          'Hacer solo el logotipo sin prototipo',
        ],
        correctIndex: 0,
        explanation: 'El MVP prioriza validar la idea central funcional dentro del tiempo disponible.',
      },
      {
        prompt: '¿Cuál es el rol principal de un líder juvenil ágil cuando un compañero está bloqueado?',
        options: [
          'Escuchar el problema, reasignar apoyo o ayudar a destrabar el obstáculo con respeto',
          'Culpar al compañero frente al equipo',
          'Hacer todo solo en silencio',
        ],
        correctIndex: 0,
        explanation: 'El liderazgo ágil facilita la colaboración y mantiene la moral y ritmo del grupo.',
      },
      {
        prompt: '¿Por qué conviene integrar las partes del equipo varias horas antes de la fecha límite?',
        options: [
          'Para detectar incompatibilidades a tiempo y dejar margen para pruebas y ensayo',
          'Para tener menos tiempo de preparación',
          'Para evitar probar el proyecto',
        ],
        correctIndex: 0,
        explanation: 'La integración temprana evita sorpresas críticas de último minuto.',
      },
    ],
  },

  'tal-m3': {
    domainLabel: 'Empatía Digital, Accesibilidad y Resiliencia ante el Bug (Talleres 3 y 6)',
    tools: 'Diseño Inclusivo (WCAG), Lectores de Pantalla, Gestión Emocional ante Errores, Debugging Metódico',
    contextIntro:
      'La tecnología verdaderamente humana incluye a todas las personas sin barreras visuales, auditivas o de conectividad, y al mismo tiempo exige fortaleza emocional en quien la construye: los errores ("bugs") no significan incapacidad, sino pistas normales del proceso creativo.',
    conceptPairs: [
      { term: 'Empatía e Inclusión', detail: 'Contraste alto, tipografía legible, subtítulos y navegación por teclado benefician a todos.' },
      { term: 'Mentalidad de Crecimiento', detail: 'Ver cada error como información diagnóstica y no como fracaso personal.' },
      { term: 'Método de Debugging', detail: 'Leer el mensaje completo -> reproducir -> aislar la línea -> probar hipótesis.' },
      { term: 'Regla de la Pausa', detail: 'Si llevas 25 min atascado en un bug, descansa 5 min o explícalo en voz alta ("Rubber Duck").' },
    ],
    workflowSteps: [
      'Audita tus pantallas pensando en usuarios con baja visión, daltonismo o pantallas pequeñas.',
      'Ante un bug frustrante, respira hondo y lee exactamente la línea y tipo de error que reporta el sistema.',
      'Reduce el problema a la unidad mínima que falla y verifica tus suposiciones paso a paso.',
      'Documenta la solución encontrada para ayudar a otros compañeros en tu comunidad.',
    ],
    exampleTemplate: (topic) => ({
      title: `Protocolo práctico: ${topic}`,
      snippetOrCase:
        'Accesibilidad: Contraste >= 4.5:1 + icono + texto descriptivo (no solo color).\nResiliencia ante bug: 1) Leer traceback -> 2) Reproducir -> 3) Revisar datos entrada -> 4) Pausa si hay bloqueo.',
      takeaway: 'Cuidar la accesibilidad multiplica el alcance humano de tu software; cuidar tu calma multiplica tu capacidad técnica.',
    }),
    commonPitfall:
      'Cambiar diez líneas de código al azar por desesperación cuando aparece un error, o transmitir estados críticos usando únicamente color rojo/verde.',
    organizerPattern: (topic) => [
      { title: '1. Diseño Universal', detail: `Elimina barreras de uso y acceso en ${topic}.` },
      { title: '2. Calma Emocional', detail: 'Regula la frustración aceptando el error como parte del código.' },
      { title: '3. Diagnóstico Metódico', detail: 'Aísla el bug leyendo mensajes y trazas.' },
      { title: '4. Mejora Continua', detail: 'Aprende de cada fallo y documenta el hallazgo.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Qué práctica mejora la accesibilidad digital para personas con daltonismo o baja visión?',
        options: [
          'Acompañar colores de estado con etiquetas de texto o íconos y mantener alto contraste',
          'Usar texto gris claro sobre fondo blanco',
          'Indicar errores únicamente cambiando un punto de color sin texto',
        ],
        correctIndex: 0,
        explanation: 'La redundancia visual (texto + icono + contraste) garantiza comprensión universal.',
      },
      {
        prompt: 'Cuando llevas 30 minutos frustrado con un error que no encuentras, ¿qué estrategia ayuda más?',
        options: [
          'Tomar una pausa breve de 5 minutos, leer el error línea por línea o explicarlo en voz alta',
          'Seguir cambiando código al azar con enojo',
          'Borrar todo el proyecto',
        ],
        correctIndex: 0,
        explanation: 'Despejar la mente y verbalizar el problema permite detectar errores evidentes que la fatiga oculta.',
      },
      {
        prompt: '¿Qué representa un "bug" en la carrera de cualquier programador profesional?',
        options: [
          'Una parte normal y cotidiana del desarrollo que se resuelve con método y análisis',
          'Una señal de que debes abandonar la tecnología',
          'Algo que solo ocurre a principiantes',
        ],
        correctIndex: 0,
        explanation: 'Todo software complejo pasa por detección y corrección continua de fallas.',
      },
    ],
  },

  'tal-m4': {
    domainLabel: 'Pensamiento Lógico y Resolución Algorítmica (Talleres 7 y 8)',
    tools: 'Descomposición, Reconocimiento de Patrones, Abstracción, Algoritmos Paso a Paso',
    contextIntro:
      'El pensamiento computacional no pertenece únicamente a quienes escriben código: es una metodología poderosa para enfrentar desafíos complejos en cualquier área, dividiendo grandes problemas en subproblemas manejables y reutilizando patrones conocidos.',
    conceptPairs: [
      { term: 'Descomposición', detail: 'Partir un problema grande e intimidante en tareas pequeñas e independientes.' },
      { term: 'Reconocimiento de Patrones', detail: 'Identificar similitudes con problemas que ya resolviste antes.' },
      { term: 'Abstracción', detail: 'Filtrar detalles irrelevantes para concentrarte en las reglas esenciales.' },
      { term: 'Algoritmo Verificable', detail: 'Secuencia finita con casos de prueba normales y extremos.' },
    ],
    workflowSteps: [
      'Lee el desafío y define con claridad qué tienes (entradas) y qué debes lograr (salidas).',
      'Divide el reto en 3 o 4 bloques pequeños y resuelve uno a la vez.',
      'Busca casos borde (cero, valores negativos, listas vacías) antes de dar por buena tu lógica.',
      'Traduce la solución al Simulador Lógico para comprobar cada paso.',
    ],
    exampleTemplate: (topic) => ({
      title: `Descomposición aplicada: ${topic}`,
      snippetOrCase:
        'Reto: Calcular ruta y presupuesto escolar.\nSubproblema A: Sumar gastos fijos.\nSubproblema B: Comparar opciones de transporte.\nSubproblema C: Elegir mínimo costo dentro del tiempo disponible.',
      takeaway: 'Si no puedes resolver el problema completo hoy, resuelve una versión simplificada y ve agregando complejidad.',
    }),
    commonPitfall:
      'Intentar escribir código de golpe antes de entender en papel cómo resolverías un ejemplo sencillo manualmente.',
    organizerPattern: (topic) => [
      { title: '1. Descomponer', detail: `Divide ${topic} en piezas pequeñas y manejables.` },
      { title: '2. Patrones', detail: 'Identifica reglas que se repiten o ya conoces.' },
      { title: '3. Abstraer', detail: 'Quédate con los datos esenciales del reto.' },
      { title: '4. Algoritmo', detail: 'Ordena pasos y prueba casos límite.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuáles son los 4 pilares clásicos del Pensamiento Computacional?',
        options: [
          'Descomposición, Reconocimiento de Patrones, Abstracción y Diseño de Algoritmos',
          'Copiar, Pegar, Imprimir y Cerrar',
          'Memorizar comandos sin entender el problema',
        ],
        correctIndex: 0,
        explanation: 'Estos cuatro pasos permiten abordar problemas complejos en ciencia, ingeniería y vida diaria.',
      },
      {
        prompt: '¿Qué logras aplicando la "Abstracción" ante un problema con mucha información?',
        options: [
          'Ignorar detalles secundarios y enfocarte en los elementos críticos para la solución',
          'Agregar datos innecesarios para confundir',
          'Evitar usar matemáticas',
        ],
        correctIndex: 0,
        explanation: 'Abstraer simplifica el modelo mental destacando solo las variables relevantes.',
      },
      {
        prompt: 'Antes de programar una solución compleja, ¿qué paso práctico ahorra más tiempo?',
        options: [
          'Resolver primero un ejemplo pequeño en papel y verificar casos límite',
          'Escribir cientos de líneas sin leer el enunciado',
          'Saltarse las pruebas finales',
        ],
        correctIndex: 0,
        explanation: 'Validar la lógica con ejemplos sencillos previene reescribir código entero después.',
      },
    ],
  },

  'tal-m5': {
    domainLabel: 'Inteligencia Emocional, Liderazgo Femenino y Autoconocimiento (Talleres 9 y 10)',
    tools: 'Voz Propia, Comunicación Asertiva, Liderazgo STEM Inclusivo, Autogestión Energética',
    contextIntro:
      'El talento técnico florece cuando se acompaña de autoconocimiento, inteligencia emocional y confianza en la propia voz. Estos talleres fortalecen la asertividad, el liderazgo juvenil y femenino en áreas STEM, y el manejo consciente de tu energía y tiempo.',
    conceptPairs: [
      { term: 'Voz Propia y Asertividad', detail: 'Expresar ideas, límites y propuestas técnicas con respeto, claridad y firmeza.' },
      { term: 'Síndrome del Impostor', detail: 'Reconocer tus logros reales frente a la duda injustificada sobre tu capacidad.' },
      { term: 'Visibilidad y Sororidad STEM', detail: 'Crear redes de apoyo donde más mujeres y jóvenes ocupen roles técnicos y directivos.' },
      { term: 'Gestión de Energía', detail: 'Alinear metas con descanso, límites saludables y autoconocimiento.' },
    ],
    workflowSteps: [
      'Registra en tu bitácora 3 logros técnicos o aprendizajes concretos de este mes.',
      'Practica presentar una idea técnica propia sin pedir disculpas ni minimizar tu trabajo.',
      'Identifica qué actividades drenan o recargan tu energía semanal para reorganizar tu agenda.',
      'Acompaña y comparte conocimiento con otras compañeras y compañeros que inician.',
    ],
    exampleTemplate: (topic) => ({
      title: `Ejercicio de voz y liderazgo: ${topic}`,
      snippetOrCase:
        'Frase débil: "Perdón, creo que tal vez esta idea no sirve..."\nFrase asertiva: "Propongo esta arquitectura porque reduce el tiempo de carga en 40%; revisemos los datos."',
      takeaway: 'Comunicar con seguridad tus argumentos técnicos abre puertas para ti y abre camino para quienes vienen detrás.',
    }),
    commonPitfall:
      'Minimizar tus propios aportes atribuyéndolos únicamente a la suerte o sobrecargarte diciendo "sí" a todo por miedo a decepcionar.',
    organizerPattern: (topic) => [
      { title: '1. Autoconocimiento', detail: `Reconoce fortalezas, límites y valores en ${topic}.` },
      { title: '2. Inteligencia Emocional', detail: 'Gestiona estrés y diálogo interno constructivo.' },
      { title: '3. Voz Asertiva', detail: 'Defiende ideas técnicas con datos y respeto.' },
      { title: '4. Comunidad STEM', detail: 'Impulsa liderazgo inclusivo y mentoría mutua.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cómo se expresa la comunicación asertiva dentro de un equipo de tecnología?',
        options: [
          'Exponiendo ideas y desacuerdos con claridad, datos y respeto hacia uno mismo y los demás',
          'Quedándose en silencio aunque veas un error grave',
          'Imponiendo decisiones a gritos sin escuchar',
        ],
        correctIndex: 0,
        explanation: 'La asertividad equilibra firmeza en las ideas con respeto colaborativo.',
      },
      {
        prompt: '¿Qué práctica ayuda a combatir el llamado "síndrome del impostor" en carreras STEM?',
        options: [
          'Documentar evidencias concretas de proyectos logrados y apoyarse en mentorías y comunidad',
          'Ocultar tus logros y evitar retos nuevos',
          'Compararte negativamente todo el día',
        ],
        correctIndex: 0,
        explanation: 'La evidencia objetiva de tu progreso y las redes de mentoría fortalecen la confianza real.',
      },
      {
        prompt: '¿Por qué es clave impulsar el liderazgo femenino y juvenil en STEM?',
        options: [
          'Porque aporta diversidad de perspectivas para resolver problemas reales que afectan a toda la sociedad',
          'Porque la tecnología no necesita diversidad',
          'Para trabajar de forma aislada',
        ],
        correctIndex: 0,
        explanation: 'Equipos diversos diseñan tecnologías más justas, creativas e innovadoras.',
      },
    ],
  },

  'tal-m6': {
    domainLabel: 'Elevator Pitch y Oratoria de Alto Impacto (Talleres 11 y 12)',
    tools: 'Estructura Pitch 60s, Lenguaje No Verbal, Modulación de Voz, Conexión Escénica',
    contextIntro:
      'Muchas veces dispones de apenas 60 segundos para despertar el interés de un jurado, inversionista o aliado comunitario. Dominar el Elevator Pitch y la presencia escénica te prepara para defender cualquier proyecto con impacto y autenticidad.',
    conceptPairs: [
      { term: 'Fórmula Pitch 60s', detail: '1) Problema urgente (15s) -> 2) Solución y diferencial (20s) -> 3) Tracción/Impacto (15s) -> 4) Cierre (10s).' },
      { term: 'Postura y Mirada', detail: 'Pies firmes, manos abiertas acompañando el mensaje y contacto visual distribuido.' },
      { term: 'Pausas Estratégicas', detail: 'Hacer una pausa de 1–2 segundos tras una cifra clave multiplica su fuerza.' },
      { term: 'Llamado a la Acción', detail: 'Terminar pidiendo exactamente qué sigue (probar prototipo, alianza o mentoría).' },
    ],
    workflowSteps: [
      'Redacta tu guion de 130–150 palabras (aprox. 60 segundos a ritmo natural).',
      'Elimina palabras de relleno y muletillas ("este...", "o sea...") grabándote en audio.',
      'Marca dónde harás pausas respiratorias y qué cifras enfatizarás con la voz.',
      'Practica de pie frente a un espejo o compañero cronometrando exactamente el minuto.',
    ],
    exampleTemplate: (topic) => ({
      title: `Guion maestro de 60 segundos: ${topic}`,
      snippetOrCase:
        '[0–15s] Cada año, X jóvenes pierden oportunidades por...\n[15–35s] Con MentMar creamos una plataforma accesible que...\n[35–50s] Ya validamos con Y estudiantes logrando...\n[50–60s] Hoy buscamos aliados para llevar esto a más escuelas.',
      takeaway: 'Un buen Pitch no intenta decirlo todo: busca generar la curiosidad suficiente para obtener una segunda conversación.',
    }),
    commonPitfall:
      'Hablar a toda velocidad para meter 5 minutos de texto en 60 segundos o terminar con un tímido "pues eso sería todo, gracias".',
    organizerPattern: (topic) => [
      { title: '1. Gancho 15s', detail: `Atrapa atención con el reto real de ${topic}.` },
      { title: '2. Solución 20s', detail: 'Explica qué haces y por qué es único.' },
      { title: '3. Evidencia 15s', detail: 'Respalda con resultados o prototipo validado.' },
      { title: '4. Presencia y Cierre 10s', detail: 'Proyecta voz firme y llamado a la acción.' },
    ],
    quizPool: () => [
      {
        prompt: '¿Cuál es el objetivo real de un Elevator Pitch de 60 segundos?',
        options: [
          'Comunicar problema, solución, impacto y llamado a la acción con tal claridad que genere interés de continuar conversando',
          'Explicar absolutamente cada detalle técnico del proyecto en un minuto',
          'Hablar lo más rápido posible sin respirar',
        ],
        correctIndex: 0,
        explanation: 'El Pitch abre la puerta a reuniones más profundas mediante claridad y propósito.',
      },
      {
        prompt: '¿Qué recurso de oratoria da mayor fuerza a una cifra importante durante tu exposición?',
        options: [
          'Hacer una breve pausa de silencio antes o después de decirla y mantener contacto visual',
          'Susurrarla mirando al suelo',
          'Leerla sin levantar la vista de las notas',
        ],
        correctIndex: 0,
        explanation: 'Las pausas deliberadas permiten que la audiencia procese y recuerde el dato clave.',
      },
      {
        prompt: '¿Cómo conviene cerrar una presentación o Pitch frente a un jurado?',
        options: [
          'Con un llamado a la acción concreto y agradeciendo con postura segura',
          'Diciendo "creo que ya acabé, perdón"',
          'Apagando el micrófono a mitad de una frase',
        ],
        correctIndex: 0,
        explanation: 'Un cierre intencional proyecta preparación, liderazgo y convicción en el proyecto.',
      },
    ],
  },
};

// ============================================================
// PUBLIC DETAIL BUILDER FOR ALL 328 LESSONS & WORKSHOPS
// ============================================================
export function generateDetailedLessonContent(params: {
  lessonId: string;
  levelId: string;
  moduleId: string;
  moduleTitle: string;
  cleanTitle: string;
}): DetailedLessonContent {
  const { lessonId, moduleId, moduleTitle, cleanTitle } = params;

  // 1. Check exact curated workshops/lessons first, enriching with 5-question pedagogy & visual refs
  for (const entry of EXACT_TOPIC_DETAILS) {
    if (entry.match(lessonId, cleanTitle)) {
      const exact = entry.build(cleanTitle);
      const granular = buildGranularPedagogy({
        moduleId,
        moduleTitle,
        cleanTitle,
        defaultGuide: exact.stepByStepGuide,
        defaultExample: exact.practicalExample,
        defaultImageCaption: exact.imageCaption,
      });

      return {
        ...exact,
        whatIs: granular.whatIs,
        purpose: granular.purpose,
        whereUsed: granular.whereUsed,
        howToDo: {
          steps: exact.stepByStepGuide,
          exampleTitle: exact.practicalExample.title,
          codeOrConfig: exact.practicalExample.snippetOrCase,
          takeaway: exact.practicalExample.takeaway,
        },
        mistakesToAvoid: granular.mistakesToAvoid,
        visualReference: granular.visualReference,
      };
    }
  }

  // 2. Build deep, zero-filler topic content from module profile + granular topic pedagogy
  const profile = MODULE_PROFILES[moduleId] || MODULE_PROFILES.m1;
  const mainTopic = cleanMainTopic(cleanTitle);
  const subitems = extractSubitems(cleanTitle);
  const subListText = subitems.length > 0 ? subitems.join(', ') : mainTopic;

  const learningObjectives = [
    `Definir técnicamente "${mainTopic}" y operar sus componentes clave (${subListText}) dentro de ${profile.domainLabel}.`,
    `Ejecutar configuraciones, comandos o fórmulas reales de ${mainTopic} resolviendo un caso concreto de principio a fin.`,
    `Detectar y corregir los 2 errores técnicos más frecuentes antes de validar resultados en el simulador y cuestionario.`,
  ];

  const stepByStepGuide = [
    `Prepara el entorno técnico requerido (${profile.tools.split(',')[0].trim()}) identificando los elementos específicos de ${mainTopic}.`,
    ...profile.workflowSteps,
  ].slice(0, 5);

  const practicalExample = profile.exampleTemplate(mainTopic, subitems);
  const defaultCaption = `Referencia visual aplicada: ${cleanTitle} (${moduleTitle}).`;

  const granular = buildGranularPedagogy({
    moduleId,
    moduleTitle,
    cleanTitle,
    defaultGuide: stepByStepGuide,
    defaultExample: practicalExample,
    defaultImageCaption: defaultCaption,
  });

  // Zero-filler synthesis for readingBody using exact technical answers
  const readingBody = [
    `${granular.whatIs.definition} Analogía práctica: ${granular.whatIs.analogy}`,
    `Propósito técnico: ${granular.purpose.functionalGoal} Problema concreto que resuelve: ${granular.purpose.problemSolved}`,
    `Aplicaciones verificables: En la industria se emplea en ${granular.whereUsed.industry.toLowerCase()} En el ámbito escolar en ${granular.whereUsed.school.toLowerCase()} Y en proyectos comunitarios en ${granular.whereUsed.community.toLowerCase()}`,
  ];

  // Enrich keyConcepts with specific subitems parsed from this lesson title
  const tailoredConcepts = [...profile.conceptPairs];
  if (subitems.length > 0) {
    tailoredConcepts[0] = {
      term: `Concepto central: ${subitems[0]}`,
      detail: `${granular.whatIs.definition.slice(0, 165)}${granular.whatIs.definition.length > 165 ? '...' : ''}`,
    };
  }

  const multimediaSteps = [
    {
      timeLabel: '00:00 – 01:30',
      heading: `1. ¿Qué es y para qué sirve ${mainTopic}?`,
      explanation: `${granular.whatIs.definition} ${granular.purpose.problemSolved}`,
    },
    {
      timeLabel: '01:30 – 03:30',
      heading: `2. Demostración técnica: ${subitems[0] || mainTopic}`,
      explanation: `${granular.whereUsed.industry} Configuración aplicada: ${stepByStepGuide[1] || stepByStepGuide[0]}`,
    },
    {
      timeLabel: '03:30 – 05:00',
      heading: '3. Caso práctico y prevención de errores',
      explanation: `Caso "${practicalExample.title}": ${practicalExample.takeaway} Evita: ${granular.mistakesToAvoid[0].mistake}`,
    },
  ];

  return {
    summary: `${granular.whatIs.definition}`,
    learningObjectives,
    whatIs: granular.whatIs,
    purpose: granular.purpose,
    whereUsed: granular.whereUsed,
    howToDo: {
      steps: stepByStepGuide,
      exampleTitle: practicalExample.title,
      codeOrConfig: practicalExample.snippetOrCase,
      takeaway: practicalExample.takeaway,
    },
    mistakesToAvoid: granular.mistakesToAvoid,
    visualReference: granular.visualReference,
    readingBody,
    keyConcepts: tailoredConcepts,
    stepByStepGuide,
    practicalExample,
    commonMistake: `${granular.mistakesToAvoid[0].mistake} Solución: ${granular.mistakesToAvoid[0].solution}`,
    organizerTitle: `Organizador Conceptual: ${mainTopic}`,
    organizerNodes: profile.organizerPattern(mainTopic),
    multimediaTitle: `Cápsula Explicativa Paso a Paso: ${mainTopic}`,
    multimediaSteps,
    imageCaption: granular.visualReference.caption,
    practiceQuestions: profile.quizPool(mainTopic, subitems),
  };
}
