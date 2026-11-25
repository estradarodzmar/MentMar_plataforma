import type { LessonMistakeFix, LessonVisualReference } from '../types/mentmar';

export interface GranularPedagogy {
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
  mistakesToAvoid: [LessonMistakeFix, LessonMistakeFix];
  visualReference: LessonVisualReference;
  customSteps?: string[];
  customExample?: {
    title: string;
    snippetOrCase: string;
    takeaway: string;
  };
}

interface TopicRule {
  test: (lowerTitle: string, moduleId: string) => boolean;
  build: (cleanTitle: string, moduleTitle: string) => GranularPedagogy;
}

const TOPIC_RULES: TopicRule[] = [
  // =========================================================
  // TALLERES ESPECIALIZADOS: FINANZAS PERSONALES & TIEMPO
  // =========================================================
  {
    test: (t, m) => m === 'talleres-finanzas' && (t.includes('50/30/20') || t.includes('presupuesto')),
    build: () => ({
      whatIs: {
        definition:
          'La regla 50/30/20 es un modelo de asignación porcentual de flujo de efectivo neto: 50% cubre gastos fijos indispensables, 30% cubre consumo discrecional y 20% se transfiere de inmediato a ahorro o inversión.',
        analogy:
          'Funciona como preparar una mochila antes de salir de excursión: primero aseguras agua y botiquín (20% de respaldo), luego el equipo básico para caminar (50% necesidades) y al final dejas espacio para comodidades extra (30% deseos).',
      },
      purpose: {
        functionalGoal:
          'Automatizar en Excel o Google Sheets el límite máximo permitido por categoría antes de realizar cualquier gasto.',
        problemSolved:
          'Elimina la fuga silenciosa de dinero ("gastos hormiga") y el error clásico de llegar al final de la quincena sin saber en qué se fue el ingreso.',
      },
      whereUsed: {
        industry:
          'Departamentos de tesorería y finanzas corporativas para proyectar presupuestos por centro de costos mediante hojas dinámicas.',
        school:
          'Administración de becas estudiantiles, cuotas de proyectos STEM y planeación de compra de equipo de cómputo.',
        community:
          'Presupuestos familiares transparentes y comités vecinales o cooperativas escolares con metas de ahorro.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Calcular los porcentajes sobre el ingreso bruto (antes de impuestos o descuentos) en lugar del ingreso neto real.',
          whyItHappens: 'Se sobreestima la capacidad real de gasto mensual y se genera déficit desde la segunda semana.',
          solution: 'Usa en la celda base únicamente el dinero libre que realmente recibes en tu cuenta o efectivo.',
        },
        {
          mistake: 'Ahorrar "lo que sobre al final del mes" en lugar de separar el 20% el primer día.',
          whyItHappens: 'Los gastos variables siempre crecen hasta ocupar todo el saldo visible disponible.',
          solution: 'Aplica "págate a ti primero": transfiere el 20% a una subcuenta o apartado el mismo día del ingreso.',
        },
      ],
      visualReference: {
        altText: 'Hoja de cálculo con gráfica circular de presupuesto 50/30/20 y celdas de gastos categorizados',
        searchTerms: {
          unsplash: 'personal budget spreadsheet laptop calculator',
          pexels: 'financial planning notebook spreadsheet desk',
          wikimedia: 'Household budget pie chart diagram',
        },
        caption: 'Modelo visual de distribución 50/30/20 automatizado con fórmulas condicionales.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-finanzas' && (t.includes('aplicaciones móviles') || t.includes('alertas de saldo')),
    build: () => ({
      whatIs: {
        definition:
          'Son sistemas de registro de transacciones en tiempo real sincronizados en la nube que clasifican egresos mediante etiquetas y disparan notificaciones automáticas ante umbrales configurados.',
        analogy:
          'Equivale al tablero de gasolina de un automóvil: te enciende un foco preventivo cuando queda un cuarto de tanque para que no te quedes varado en carretera.',
      },
      purpose: {
        functionalGoal:
          'Reducir a menos de 15 segundos la captura de cada gasto diario y recibir alertas al alcanzar el 80% del tope mensual de una categoría.',
        problemSolved:
          'Evita olvidar pagos pequeños en efectivo y previene sobregiros en tarjetas antes de cerrar el mes.',
      },
      whereUsed: {
        industry:
          'Plataformas FinTech y banca digital para monitoreo de liquidez, conciliación de viáticos y control de presupuestos.',
        school:
          'Registro rápido de gastos diarios de transporte, copias, alimentación y materiales escolares desde el teléfono.',
        community:
          'Control transparente de cajas chicas en clubes estudiantiles o colectas comunitarias.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Crear más de 25 subcategorías hiperespecíficas (ej. separar "café frío" de "café caliente").',
          whyItHappens: 'La fricción cognitiva al elegir dónde anotar el gasto provoca abandono tras pocos días.',
          solution: 'Mantén entre 6 y 8 categorías amplias y claras para sostener el hábito todo el año.',
        },
        {
          mistake: 'Ingresar contraseñas bancarias completas en aplicaciones de terceros no reguladas.',
          whyItHappens: 'Se busca sincronización automática sin verificar estándares de autorización segura.',
          solution: 'Prefiere registro manual ágil o consulta únicamente alertas oficiales emitidas por tu institución regulada.',
        },
      ],
      visualReference: {
        altText: 'Teléfono inteligente mostrando aplicación de control de gastos con categorías y alertas de límite',
        searchTerms: {
          unsplash: 'mobile banking expense tracker app smartphone',
          pexels: 'person checking budget app on phone',
          wikimedia: 'Personal finance app interface diagram',
        },
        caption: 'Captura móvil inmediata de movimientos y alertas preventivas al 80% del presupuesto.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-finanzas' && (t.includes('interés compuesto') || t.includes('inversión')),
    build: () => ({
      whatIs: {
        definition:
          'El interés compuesto es la capitalización sucesiva de rendimientos: los intereses generados en cada periodo se suman al capital base para producir nuevos intereses según VF = VP × (1 + r)^n.',
        analogy:
          'Es como una bola de nieve rodando cuesta abajo: en cada vuelta recoge más nieve sobre la superficie ya acumulada, acelerando su tamaño de forma exponencial.',
      },
      purpose: {
        functionalGoal:
          'Proyectar el crecimiento real de metas de ahorro a mediano y largo plazo protegiendo el poder adquisitivo frente a la inflación.',
        problemSolved:
          'Evita que el dinero guardado en efectivo pierda valor año con año debido al incremento sostenido de precios.',
      },
      whereUsed: {
        industry:
          'Valuación de instrumentos de deuda gubernamental (CETES), fondos indexados, pensiones y planes de inversión.',
        school:
          'Simulación matemática de funciones exponenciales aplicadas a metas reales como adquirir equipo técnico o financiar estudios.',
        community:
          'Fomento de cultura de ahorro formal en jóvenes y familias frente a créditos con intereses compuestos en contra.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Confundir tasa nominal con tasa real olvidando restar la inflación anual.',
          whyItHappens: 'Un rendimiento del 4% cuando la inflación es del 5% en realidad reduce lo que puedes comprar.',
          solution: 'Compara siempre el rendimiento ofrecido contra la tasa de inflación oficial vigente.',
        },
        {
          mistake: 'Atraerse por plataformas que prometen rendimientos altísimos "garantizados sin riesgo".',
          whyItHappens: 'El deseo de multiplicar dinero rápido oculta señales clásicas de fraude piramidal.',
          solution: 'Verifica siempre que el intermediario esté supervisado por autoridades financieras oficiales (CNBV/CONDUSEF).',
        },
      ],
      visualReference: {
        altText: 'Gráfica comparativa de crecimiento exponencial del interés compuesto frente al interés simple en el tiempo',
        searchTerms: {
          unsplash: 'compound interest growth chart finance monitor',
          pexels: 'investment growth graph laptop screen',
          wikimedia: 'Compound interest graph simple vs compound',
        },
        caption: 'Curva de capitalización compuesta: el tiempo y la constancia multiplican los rendimientos.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-finanzas' && (t.includes('seguridad bancaria') || t.includes('fraudes')),
    build: () => ({
      whatIs: {
        definition:
          'Conjunto de controles técnicos y protocolos de verificación (CVV dinámico, 2FA, validación de canales oficiales) para proteger cuentas y medios de pago electrónicos.',
        analogy:
          'Un CVV dinámico funciona como un pase temporal de un solo uso para entrar a un edificio: aunque alguien anote el código tras entrar, cinco minutos después ya no abre ninguna puerta.',
      },
      purpose: {
        functionalGoal:
          'Neutralizar ataques de ingeniería social (phishing, smishing, vishing) y minimizar el impacto de filtraciones en comercios web.',
        problemSolved:
          'Impide cargos no reconocidos y robo de saldo aunque terceros intenten suplantar a tu banco por SMS o llamada.',
      },
      whereUsed: {
        industry:
          'Banca electrónica, pasarelas de pago PCI-DSS y sistemas de prevención de fraude en comercio electrónico.',
        school:
          'Adquisición segura de licencias educativas, libros digitales y suscripciones de software en la nube.',
        community:
          'Capacitación preventiva a adultos mayores y familias para reconocer llamadas y mensajes fraudulentos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Usar los 16 dígitos y el CVV impreso de tu tarjeta física de débito en tiendas desconocidas.',
          whyItHappens: 'Si el comercio sufre un robo de base de datos, el atacante tiene acceso directo a tu cuenta principal.',
          solution: 'Genera siempre una tarjeta digital con CVV dinámico y activa límites por compra o apagado temporal.',
        },
        {
          mistake: 'Hacer clic en enlaces urgentes de SMS/correos o dictar códigos OTP por teléfono.',
          whyItHappens: 'Los estafadores crean pánico ("cargo no reconocido en proceso") para anular el pensamiento crítico.',
          solution: 'Cuelga o cierra el mensaje, abre manualmente la app oficial de tu banco y verifica allí tus movimientos.',
        },
      ],
      visualReference: {
        altText: 'Usuario realizando pago seguro en línea con verificación en dos pasos y tarjeta digital en smartphone',
        searchTerms: {
          unsplash: 'two factor authentication smartphone security lock',
          pexels: 'secure online payment credit card phone',
          wikimedia: 'Two-factor authentication workflow diagram',
        },
        caption: 'Blindaje financiero mediante CVV dinámico, alertas inmediatas y verificación en dos pasos.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-tiempo' && (t.includes('time-blocking') || t.includes('google calendar')),
    build: () => ({
      whatIs: {
        definition:
          'Metodología de planificación temporal que asigna franjas horarias explícitas (inicio, duración y objetivo) en un calendario digital para cada actividad prioritaria.',
        analogy:
          'Es como reservar asientos numerados en un auditorio: si no asignas un horario real a tu proyecto en el calendario, las tareas urgentes de otros ocuparán tu día sin permiso.',
      },
      purpose: {
        functionalGoal:
          'Convertir listas abstractas de pendientes en compromisos ejecutables con tiempo realista y bloques de trabajo profundo.',
        problemSolved:
          'Elimina la sobrecarga de tareas imposibles en un mismo día y evita posponer proyectos clave por falta de horario definido.',
      },
      whereUsed: {
        industry:
          'Equipos de ingeniería y producto para proteger ventanas de programación sin reuniones ni interrupciones.',
        school:
          'Organización semanal de clases, prácticas de laboratorio, estudio para exámenes y descanso.',
        community:
          'Coordinación de voluntariados juveniles y entregas de proyectos colaborativos con archivos .ICS.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Saturar el 100% del calendario bloque tras bloque sin dejar un solo minuto de margen.',
          whyItHappens: 'Un retraso de 15 minutos provoca un efecto dominó que desordena toda la tarde.',
          solution: 'Incluye "bloques colchón" diarios de 20–30 minutos para absorber imprevistos con calma.',
        },
        {
          mistake: 'Mezclar trabajo profundo (programar) dentro del mismo bloque que revisar correos o chats.',
          whyItHappens: 'Cada cambio de contexto fragmenta la atención y duplica el tiempo necesario para terminar.',
          solution: 'Agrupa tareas administrativas rápidas en un único bloque separado de 30 minutos.',
        },
      ],
      visualReference: {
        altText: 'Calendario digital organizado por bloques horarios de colores diferenciados para estudio y descansos',
        searchTerms: {
          unsplash: 'digital calendar schedule laptop time blocking',
          pexels: 'planner schedule laptop desk workspace',
          wikimedia: 'Time management calendar grid illustration',
        },
        caption: 'Bloques horarios con código de colores y holguras estratégicas en calendario digital.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-tiempo' && (t.includes('eisenhower') || t.includes('notion')),
    build: () => ({
      whatIs: {
        definition:
          'Marco de decisión bidimensional que clasifica tareas según Importancia (impacto en metas) y Urgencia (inmediatez de plazo) en 4 cuadrantes integrables en tableros digitales Kanban.',
        analogy:
          'Es como el triaje médico en urgencias: primero atiendes lo crítico real, programas revisiones preventivas para evitar crisis y descartas distracciones menores.',
      },
      purpose: {
        functionalGoal:
          'Separar actividades estratégicas (Cuadrante 2) del ruido diario de interrupciones (Cuadrante 3) mediante etiquetas automáticas.',
        problemSolved:
          'Evita pasar todo el día ocupado respondiendo mensajes urgentes sin avanzar en tus metas reales.',
      },
      whereUsed: {
        industry:
          'Gestión de proyectos en Notion, Jira o Trello para priorizar sprints y limitar trabajo en progreso (WIP).',
        school:
          'Clasificación de entregas inmediatas frente a preparación anticipada de proyectos integradores.',
        community:
          'Organización de comités escolares y reparto equilibrado de actividades delegables.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Etiquetar absolutamente todo como "Importante y Urgente (Q1)".',
          whyItHappens: 'Si todo es prioridad máxima, en la práctica nada tiene prioridad.',
          solution: 'Limita Q1 a un máximo de 2 tareas críticas reales por día y mueve la prevención a Q2.',
        },
        {
          mistake: 'Abrir demasiadas tarjetas simultáneamente en la columna "En proceso" del tablero Kanban.',
          whyItHappens: 'Genera sensación de avance inicial pero retrasa la entrega final de cada tarea.',
          solution: 'Establece un límite máximo de 2 tareas activas en curso antes de tomar la siguiente.',
        },
      ],
      visualReference: {
        altText: 'Tablero digital Kanban con cuatro cuadrantes de priorización de tareas por importancia y urgencia',
        searchTerms: {
          unsplash: 'kanban board sticky notes task management',
          pexels: 'team organizing kanban project board',
          wikimedia: 'Eisenhower matrix four quadrants diagram',
        },
        caption: 'Priorización objetiva combinando Matriz de Eisenhower con flujo visual Kanban.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-tiempo' && (t.includes('pomodoro') || t.includes('distracciones')),
    build: () => ({
      whatIs: {
        definition:
          'Técnica de gestión atencional basada en intervalos cronometrados de 25 minutos de ejecución monotarea ("Pomodoro") seguidos de 5 minutos de pausa física sin pantalla.',
        analogy:
          'Funciona como las series de entrenamiento físico: trabajas con buena técnica durante un intervalo corto y recuperas el aliento antes de la siguiente serie.',
      },
      purpose: {
        functionalGoal:
          'Vencer la resistencia inicial ante tareas complejas reduciendo el compromiso mental a un bloque manejable de 25 minutos.',
        problemSolved:
          'Elimina la procrastinación por abrumamiento y previene la fatiga cognitiva por sesiones continuas de varias horas sin descanso.',
      },
      whereUsed: {
        industry:
          'Desarrolladores, diseñadores y analistas para mantener concentración sostenida en depuración y escritura técnica.',
        school:
          'Lectura técnica, resolución de ejercicios matemáticos y preparación de exposiciones sin redes sociales.',
        community:
          'Sesiones grupales de estudio guiado ("study-with-me") en clubes juveniles de programación.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Pasar los 5 minutos de pausa deslizando videos cortos o mensajes en el teléfono.',
          whyItHappens: 'Las redes mantienen el cerebro sobreestimulado y agravan el cansancio visual.',
          solution: 'Levántate, hidrátate, estira los hombros y mira a un punto lejano durante la pausa.',
        },
        {
          mistake: 'Interrumpir el temporizador cada vez que recuerdas un pendiente ajeno.',
          whyItHappens: 'El miedo a olvidar la idea rompe la inmersión en la tarea actual.',
          solution: 'Ten una libreta junto al teclado: anota el pendiente en 5 segundos y continúa el ciclo hasta que suene.',
        },
      ],
      visualReference: {
        altText: 'Temporizador Pomodoro de escritorio junto a laptop y libreta de enfoque libre de distracciones',
        searchTerms: {
          unsplash: 'pomodoro timer study desk minimalist laptop',
          pexels: 'student studying focused timer notebook',
          wikimedia: 'Pomodoro technique cycle diagram',
        },
        caption: 'Ciclo estructurado 25/5 con pausa activa real para sostener atención profunda.',
      },
    }),
  },
  {
    test: (t, m) => m === 'talleres-tiempo' && (t.includes('automatización') || t.includes('balance')),
    build: () => ({
      whatIs: {
        definition:
          'Integración de recordatorios recurrentes, plantillas reutilizables y sincronización en la nube para descargar tareas repetitivas de la memoria de trabajo humana.',
        analogy:
          'Es como programar un riego automático: en lugar de acordarte cada tarde de abrir la llave, el sistema ejecuta la rutina puntual y tú solo supervisas.',
      },
      purpose: {
        functionalGoal:
          'Estandarizar rutinas semanales (respaldos, reportes, corte financiero) y proteger límites saludables de desconexión nocturna.',
        problemSolved:
          'Reduce la ansiedad por olvidos cotidianos y evita reinventar formatos desde cero cada semana.',
      },
      whereUsed: {
        industry:
          'Flujos automatizados de oficina, recordatorios recurrentes en calendarios corporativos y plantillas de documentación.',
        school:
          'Plantillas de informes técnicos, alertas automáticas de cierre de módulos y copias de respaldo semanales.',
        community:
          'Coordinación automatizada de avisos periódicos en grupos estudiantiles y clubes STEM.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Instalar cinco o más aplicaciones de listas que no sincronizan entre sí.',
          whyItHappens: 'Cada lista queda incompleta y pierdes tiempo copiando pendientes manualmente.',
          solution: 'Elige un solo calendario + un gestor principal sincronizado en todos tus dispositivos.',
        },
        {
          mistake: 'Trabajar frente a la pantalla hasta el último minuto antes de dormir sin ritual de cierre.',
          whyItHappens: 'La luz azul y la activación mental impiden descansar adecuadamente.',
          solution: 'Establece un cierre de 5 minutos para anotar la primera tarea de mañana y activa el modo descanso.',
        },
      ],
      visualReference: {
        altText: 'Laptop y teléfono sincronizados mostrando recordatorios semanales automatizados en ambiente tranquilo',
        searchTerms: {
          unsplash: 'clean desk laptop smartphone synchronized calendar',
          pexels: 'work life balance laptop evening desk',
          wikimedia: 'Workflow automation diagram cloud sync',
        },
        caption: 'Ecosistema personal unificado con recurrencias automáticas e higiene de descanso.',
      },
    }),
  },

  // =========================================================
  // COMPUTACIÓN BÁSICA: M1–M12
  // =========================================================
  {
    test: (t, m) => m === 'm1' && (t.includes('componentes físicos') || t.includes('encendido') || t.includes('ergonomía')),
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          cleanTitle.toLowerCase().includes('ergonomía')
            ? 'La ergonomía digital es la adaptación técnica de la postura, iluminación, distancia visual y altura de periféricos para operar equipos de cómputo sin lesiones musculoesqueléticas ni fatiga visual.'
            : cleanTitle.toLowerCase().includes('encendido')
              ? 'El ciclo ordenado de arranque y apagado (POST -> BIOS/UEFI -> Sistema Operativo y cierre limpio de procesos en RAM) protege la integridad del hardware y de los archivos abiertos.'
              : 'El hardware comprende los componentes tangibles del computador organizados bajo la arquitectura de entrada, procesamiento (CPU + RAM), almacenamiento permanente (SSD/HDD) y salida.',
        analogy:
          cleanTitle.toLowerCase().includes('ergonomía')
            ? 'Es como ajustar el asiento y los espejos de un vehículo antes de conducir: te permite llegar lejos con comodidad y sin lastimar espalda o muñecas.'
            : 'Piensa en tu escritorio físico: la CPU es tu cerebro resolviendo un problema, la memoria RAM es la mesa donde pones las hojas abiertas en ese momento y el SSD es el archivero donde guardas todo al terminar.',
      },
      purpose: {
        functionalGoal:
          'Garantizar estabilidad operativa del equipo, diagnosticar qué componente interviene en cada acción y prevenir desgaste físico o fallos eléctricos.',
        problemSolved:
          'Evita corrupción de datos en el disco por apagados bruscos, cuellos de botella por falta de RAM y dolores de cuello o muñeca en sesiones largas.',
      },
      whereUsed: {
        industry:
          'Soporte técnico de TI, ensamblado de estaciones de trabajo de ingeniería y auditorías de salud ocupacional.',
        school:
          'Laboratorios escolares de cómputo donde múltiples alumnos comparten equipos y deben cuidarlos al inicio y cierre de clase.',
        community:
          'Centros digitales comunitarios y mantenimiento preventivo de equipos domésticos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Confundir memoria RAM (temporal, se borra al apagar) con capacidad de almacenamiento (SSD/HDD, permanente).',
          whyItHappens: 'Ambas se miden en Gigabytes (GB), generando confusión al leer especificaciones técnicas.',
          solution: 'Recuerda: la RAM define cuántos programas fluirán abiertos a la vez; el SSD define cuántos archivos puedes conservar guardados.',
        },
        {
          mistake: 'Mantener presionado el botón físico o desconectar el cable como método habitual para apagar el equipo.',
          whyItHappens: 'Impide que el sistema operativo cierre escrituras pendientes en disco.',
          solution: 'Utiliza siempre Menú Inicio -> Apagar y espera a que los ventiladores e indicadores LED se detengan por completo.',
        },
      ],
      visualReference: {
        altText: 'Componentes internos de computadora mostrando procesador CPU, módulos de memoria RAM y unidad SSD sobre placa madre',
        searchTerms: {
          unsplash: 'computer motherboard cpu ram hardware closeup',
          pexels: 'pc hardware technician motherboard ssd',
          wikimedia: 'Personal computer hardware architecture diagram',
        },
        caption: 'Relación funcional entre CPU, memoria RAM, almacenamiento permanente y periféricos.',
      },
    }),
  },
  {
    test: (t, m) => m === 'm1' && (t.includes('mouse') || t.includes('teclado') || t.includes('mecanografía') || t.includes('atajos')),
    build: () => ({
      whatIs: {
        definition:
          'Los periféricos de precisión (ratón/trackpad y teclado alfanumérico/de control) junto con los atajos combinados permiten ejecutar selecciones, menús contextuales y comandos sin desplazarse por menús lentos.',
        analogy:
          'Los atajos de teclado son como pasar directamente por una puerta de acceso rápido en lugar de caminar todo el pasillo cada vez que quieres copiar o deshacer algo.',
      },
      purpose: {
        functionalGoal:
          'Multiplicar la velocidad de captura y edición usando ambas manos en la fila guía del teclado y combinaciones estándar como Ctrl+C, Ctrl+V, Ctrl+Z y Alt+Tab.',
        problemSolved:
          'Reduce errores de clic accidental, cansancio en la muñeca y minutos perdidos buscando opciones básicas con el puntero.',
      },
      whereUsed: {
        industry:
          'Programación, diseño gráfico, captura administrativa y análisis financiero con altos volúmenes de datos.',
        school:
          'Redacción ágil de ensayos, manejo fluido de ventanas durante clases prácticas y exámenes en línea.',
        community:
          'Alfabetización digital de jóvenes y adultos para ganar confianza inmediata frente a la pantalla.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Mirar constantemente el teclado y teclear únicamente con dos dedos índices.',
          whyItHappens: 'Se omite ubicar los relieves táctiles de las teclas F y J para posicionar los dedos.',
          solution: 'Coloca los índices sobre las marcas de F y J y practica 10 minutos diarios de mecanografía sin ver las teclas.',
        },
        {
          mistake: 'Soltar o mover el mouse mientras haces doble clic sobre un ícono.',
          whyItHappens: 'El sistema interpreta un arrastre involuntario en lugar de una apertura.',
          solution: 'Mantén firme la palma apoyada en el escritorio y presiona el botón izquierdo dos veces rápidas sin desplazar el puntero.',
        },
      ],
      visualReference: {
        altText: 'Manos correctamente posicionadas en la fila guía del teclado junto a ratón ergonómico en escritorio',
        searchTerms: {
          unsplash: 'hands typing mechanical keyboard mouse desk',
          pexels: 'person typing laptop keyboard closeup',
          wikimedia: 'Home row typing finger placement diagram',
        },
        caption: 'Posición base en teclas guía (F y J) y dominio de atajos esenciales de productividad.',
      },
    }),
  },
  {
    test: (t, m) => m === 'm1',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `El sistema de archivos y entorno del Sistema Operativo organiza la información en directorios jerárquicos (árbol de carpetas), identificando cada documento mediante nombre y extensión (.docx, .xlsx, .pdf, .zip) aplicado a "${cleanTitle}".`,
        analogy:
          'Un directorio jerárquico es idéntico a un archivero con cajones etiquetados por año, materia y subcarpeta: si metes todo revuelto en un solo cajón, encontrar un documento tarda diez veces más.',
      },
      purpose: {
        functionalGoal:
          'Crear, mover, buscar, comprimir en .ZIP y recuperar archivos de forma determinista y sin pérdida accidental.',
        problemSolved:
          'Evita documentos extraviados bajo nombres genéricos ("Sin título 4"), errores al enviar archivos pesados y daños por retirar memorias USB sin expulsar.',
      },
      whereUsed: {
        industry:
          'Gestión documental corporativa, empaquetado de entregas de código y respaldos ordenados en servidores.',
        school:
          'Organización de portafolios digitales por semestre, asignatura y entregas comprimidas para plataformas educativas.',
        community:
          'Resguardo limpio de trámites familiares, fotografías y actas en discos externos y unidades USB.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Cambiar manualmente las letras después del punto (ej. renombrar foto.jpg a foto.pdf) esperando convertir el formato.',
          whyItHappens: 'La extensión solo etiqueta el formato; no transforma la estructura binaria interna del archivo.',
          solution: 'Usa la función "Guardar como" o "Exportar a PDF" dentro del programa correspondiente.',
        },
        {
          mistake: 'Guardar todos tus trabajos directamente en el Escritorio o en la carpeta Descargas sin clasificar.',
          whyItHappens: 'Parece rápido al inicio, pero satura la vista e impide realizar respaldos limpios.',
          solution: 'Define una estructura fija en Documentos (Año > Nivel > Módulo) y vacía Descargas cada viernes.',
        },
      ],
      visualReference: {
        altText: 'Explorador de archivos mostrando estructura ordenada de carpetas jerárquicas, extensiones y archivo comprimido ZIP',
        searchTerms: {
          unsplash: 'computer desktop file folders organization screen',
          pexels: 'laptop screen organizing digital files',
          wikimedia: 'Hierarchical file system directory tree diagram',
        },
        caption: 'Árbol jerárquico de directorios, lectura de extensiones y empaquetado eficiente en ZIP.',
      },
    }),
  },
  {
    test: (t, m) => m === 'm2' && (t.includes('https') || t.includes('contraseña') || t.includes('phishing')),
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `La seguridad web en "${cleanTitle}" combina cifrado de transporte (HTTPS con certificados SSL/TLS), entropía en credenciales (contraseñas largas y únicas + 2FA) y verificación de autenticidad contra ingeniería social.`,
        analogy:
          'HTTPS equivale a enviar una carta dentro de una caja fuerte cerrada en lugar de una postal abierta que cualquiera en el camino puede leer; revisar la URL equivale a confirmar la dirección exacta de la sucursal antes de entregar tus llaves.',
      },
      purpose: {
        functionalGoal:
          'Garantizar confidencialidad de los datos enviados en línea, validar que el servidor es auténtico y bloquear accesos aunque exista filtración de contraseñas.',
        problemSolved:
          'Previene robo de cuentas escolares o bancarias en redes Wi-Fi públicas y bloquea páginas clonadas de phishing.',
      },
      whereUsed: {
        industry:
          'Portales bancarios, comercio electrónico, autenticación institucional SSO y auditorías de ciberseguridad.',
        school:
          'Acceso seguro a plataformas académicas, correo institucional y portafolios en la nube desde cualquier red.',
        community:
          'Protección de cuentas familiares de mensajería y redes sociales frente a suplantación de identidad.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Asumir que porque una página tiene el ícono del candado HTTPS ya es una empresa confiable o no es phishing.',
          whyItHappens: 'Hoy cualquier atacante puede obtener un certificado SSL gratuito para un dominio falso como "bannco-seguro.xyz".',
          solution: 'Verifica siempre el candado HTTPS Y lee carácter por carácter el dominio raíz oficial antes de iniciar sesión.',
        },
        {
          mistake: 'Usar fechas de nacimiento o la misma clave corta ("123456" o tu nombre) en múltiples servicios.',
          whyItHappens: 'Las herramientas automatizadas prueban credenciales filtradas de un sitio en cientos de cuentas más.',
          solution: 'Crea frases de paso únicas de 12+ caracteres combinando tipos de símbolo y activa 2FA por aplicación.',
        },
      ],
      visualReference: {
        altText: 'Barra de navegador web con protocolo HTTPS cifrado, candado de seguridad SSL y verificación en dos pasos',
        searchTerms: {
          unsplash: 'cybersecurity padlock https browser laptop',
          pexels: 'internet security password protection screen',
          wikimedia: 'HTTPS TLS handshake diagram',
        },
        caption: 'Verificación de dominio real, cifrado HTTPS/TLS y defensa contra suplantación Phishing.',
      },
    }),
  },
  {
    test: (t, m) => m === 'm2',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En "${cleanTitle}", la alfabetización web y ciudadanía digital integran la arquitectura cliente-navegador, operadores lógicos de búsqueda ("frase", site:, -término), verificación crítica de fuentes y normas éticas de convivencia en línea.`,
        analogy:
          'Buscar en internet sin operadores ni criterio crítico es como entrar a una biblioteca gigantesca sin catálogo y creerle al primer folleto sin firma que ves en la entrada.',
      },
      purpose: {
        functionalGoal:
          'Localizar información académica confiable en segundos y gestionar con responsabilidad tu huella digital, privacidad y convivencia virtual.',
        problemSolved:
          'Evita citar noticias falsas (Fake News), perder tiempo en resultados irrelevantes y quedar vulnerable ante riesgos como ciberacoso o exposición de datos personales.',
      },
      whereUsed: {
        industry:
          'Investigación de mercado, reputación digital corporativa y verificación periodística de datos (fact-checking).',
        school:
          'Búsqueda de fuentes científicas o educativas confiables (.edu, .org, .gob) para ensayos y proyectos STEM.',
        community:
          'Prevención escolar contra el ciberacoso y configuración segura de privacidad en perfiles juveniles.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Aceptar el primer resultado patrocinado o cadena viral en redes sociales sin contrastar autoría ni fecha.',
          whyItHappens: 'Los titulares emocionales buscan clics rápidos y no rigor documental.',
          solution: 'Verifica autor, institución, fecha de publicación y contrasta en al menos dos fuentes oficiales.',
        },
        {
          mistake: 'Publicar ubicación en tiempo real, credenciales escolares o fotos privadas con perfil totalmente público.',
          whyItHappens: 'Se subestima la permanencia de la huella digital y las capturas de terceros.',
          solution: 'Revisa mensualmente la configuración de privacidad y aplica Netiquette en cada interacción.',
        },
      ],
      visualReference: {
        altText: 'Persona evaluando fuentes confiables en navegador web con pensamiento crítico y ciudadanía digital responsable',
        searchTerms: {
          unsplash: 'web search critical thinking laptop research',
          pexels: 'student researching internet reliable sources',
          wikimedia: 'Information literacy fact checking diagram',
        },
        caption: 'Operadores de búsqueda, verificación de fuentes y cuidado activo de la huella digital.',
      },
    }),
  },
  {
    test: (_t, m) => m === 'm3' || m === 'm4',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `En ${moduleTitle}, "${cleanTitle}" abarca el conjunto de herramientas estructuradas de Microsoft Word / Docs (estilos semánticos, maquetación de párrafos, secciones independientes, tablas, citas APA o combinación de correspondencia) que separan el contenido de su presentación formal.`,
        analogy:
          'Dar formato profesional con estilos y secciones es como construir un libro con plano arquitectónico: si cambias el diseño de los títulos una vez, todo el documento se alinea automáticamente en cascada.',
      },
      purpose: {
        functionalGoal:
          'Producir documentos académicos y administrativos impecables, automatizar índices o envíos masivos y colaborar en equipo sin romper la maquetación.',
        problemSolved:
          'Elimina índices escritos a mano que siempre se desactualizan, textos descuadrados al imprimir y archivos perdidos entre múltiples versiones ("Final_v2_corregido").',
      },
      whereUsed: {
        industry:
          'Redacción de contratos, manuales operativos, propuestas ejecutivas y emisión automatizada de constancias por correspondencia.',
        school:
          'Elaboración de tesis, reportes de prácticas con normas APA, cartas formales e informes integradores exportados a PDF.',
        community:
          'Oficios institucionales, convocatorias vecinales y boletines comunitarios claros y bien maquetados.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Alinear texto o empujar contenido a la página siguiente presionando repetidamente la barra espaciadora o la tecla Enter.',
          whyItHappens: 'Al añadir una sola línea arriba, todo el texto de páginas posteriores se desplaza fuera de lugar.',
          solution: 'Utiliza siempre sangrías en la regla, tabuladores, tablas o "Ctrl + Enter" (Salto de página / Sección).',
        },
        {
          mistake: 'Aplicar negrita y tamaño grande manualmente en lugar de usar "Estilos" (Título 1, Título 2) antes de crear la Tabla de Contenido.',
          whyItHappens: 'Visualmente parece un título, pero Word no reconoce su jerarquía lógica.',
          solution: 'Etiqueta cada capítulo y subtema con los Estilos integrados para generar y actualizar el índice en un clic.',
        },
      ],
      visualReference: {
        altText: 'Documento profesional maquetado con estilos jerárquicos, tabla de contenido automática y exportación a PDF',
        searchTerms: {
          unsplash: 'typing formal document laptop word processor',
          pexels: 'student writing academic report laptop',
          wikimedia: 'Word processor page layout styles diagram',
        },
        caption: `Maquetación estructurada e índice automático aplicados a: ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'm5' || m === 'm6',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `Dentro de ${moduleTitle}, "${cleanTitle}" utiliza la cuadrícula de celdas de Excel/Sheets (referencias relativas, absolutas $A$1, lógica condicional SI/SUMAR.SI, formato condicional o gráficos) para modelar y analizar información numérica de forma dinámica.`,
        analogy:
          'Una fórmula basada en referencias de celda funciona como una calculadora conectada por cables invisibles: si cambias el precio en una celda de origen, todos los totales vinculados se recalculan en milisegundos.',
      },
      purpose: {
        functionalGoal:
          'Automatizar cálculos repetitivos, depurar grandes listas mediante filtros y traducir tablas de números en gráficos e indicadores visuales inmediatos.',
        problemSolved:
          'Evita errores humanos de suma manual con calculadora y reduce horas de revisión de datos al resaltar alertas y tendencias automáticamente.',
      },
      whereUsed: {
        industry:
          'Contabilidad, control de inventarios, reportes comerciales KPI, nóminas y tableros financieros.',
        school:
          'Registro de promedios académicos, análisis de encuestas estudiantiles y tablas estadísticas para ciencias.',
        community:
          'Control de ingresos y egresos en presupuestos familiares, cooperativas y torneos locales.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Escribir unidades de texto dentro de la misma celda que el número (ej. escribir "45 kg" o "$500 mxn").',
          whyItHappens: 'Excel interpreta la celda como texto y las funciones SUMA o PROMEDIO la ignoran o arrojan #¡VALOR!.',
          solution: 'Captura únicamente el número puro (45 o 500) y aplica el formato visual de Moneda o formato personalizado desde la cinta.',
        },
        {
          mistake: 'Arrastrar una fórmula que multiplica por una celda de porcentaje sin fijarla con signos de dólar ($B$1).',
          whyItHappens: 'La referencia relativa avanza hacia celdas vacías abajo, devolviendo ceros o errores.',
          solution: 'Presiona F4 sobre la celda constante para convertirla en referencia absoluta ($B$1) antes de autorellenar.',
        },
      ],
      visualReference: {
        altText: 'Hoja de cálculo de Excel mostrando fórmulas dinámicas con referencias absolutas, formato condicional y gráfico estadístico',
        searchTerms: {
          unsplash: 'excel spreadsheet charts analytics screen',
          pexels: 'data analysis spreadsheet graphs laptop',
          wikimedia: 'Spreadsheet chart formulas table example',
        },
        caption: `Modelado numérico y visualización analítica en hojas de cálculo: ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'm7' || m === 'm8',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `En ${moduleTitle}, "${cleanTitle}" aplica principios de comunicación visual (Regla 6x6, alto contraste, diagramas SmartArt, transiciones sobrias, Vista del Presentador y Storytelling) para respaldar una exposición oral sin saturar la pantalla.`,
        analogy:
          'Las diapositivas son como las señales visuales de una carretera: el expositor conduce la explicación y cada lámina solo orienta de un vistazo rápido sin obligar a leer un libro.',
      },
      purpose: {
        functionalGoal:
          'Sintetizar datos complejos en apoyos visuales limpios y controlar el ritmo de la presentación escénica con confianza y claridad de voz.',
        problemSolved:
          'Evita presentaciones aburridas llenas de texto diminuto donde el ponente da la espalda al público para leer párrafos en voz alta.',
      },
      whereUsed: {
        industry:
          'Presentaciones ejecutivas de resultados, lanzamientos de producto y propuestas a clientes.',
        school:
          'Exposiciones de proyectos integradores, ferias de ciencia STEM y defensas de portafolio.',
        community:
          'Asambleas informativas y presentación de iniciativas juveniles ante autoridades o patrocinadores.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Copiar párrafos enteros de Word en cada diapositiva y usar más de cuatro tipografías o colores brillantes sin contraste.',
          whyItHappens: 'Se confunde el documento escrito de apoyo con el guion visual proyectado.',
          solution: 'Aplica la Regla 6x6 (máx. 6 líneas y 6 palabras clave), usa contraste alto y respalda detalles en tus Notas del Orador.',
        },
        {
          mistake: 'Añadir animaciones giratorias distintas y efectos de sonido en cada elemento de la presentación.',
          whyItHappens: 'Se busca llamar la atención mediante efectos, pero termina distrayendo del argumento central.',
          solution: 'Mantén una única transición sutil (Desvanecer) y anima entradas solo para revelar pasos ordenados mientras hablas.',
        },
      ],
      visualReference: {
        altText: 'Presentación visual minimalista proyectada en pantalla con diagrama claro y expositor comunicando con seguridad',
        searchTerms: {
          unsplash: 'presentation slides projector speaker stage',
          pexels: 'public speaking presentation screen business',
          wikimedia: 'Presentation slide layout visual hierarchy',
        },
        caption: `Síntesis visual, diagramación limpia y oratoria escénica para ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'm9' || m === 'm10',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `En ${moduleTitle}, "${cleanTitle}" comprende el diseño metodológico de instrumentos digitales (Microsoft/Google Forms) con tipos de reactivos adecuados, ramificación condicional, códigos QR, limpieza de respuestas y resguardo ético de datos.`,
        analogy:
          'Un formulario bien estructurado es como un embudo de laboratorio calibrado: guía ordenadamente a cada participante por solo las preguntas que le aplican y entrega datos limpios listos para analizar.',
      },
      purpose: {
        functionalGoal:
          'Recopilar información cuantitativa y cualitativa de forma masiva, autoevaluar conocimientos y convertir respuestas crudas en reportes ejecutivos confiables.',
        problemSolved:
          'Evita encuestas interminables con datos inconsistentes imposibles de graficar y previene fugas de privacidad al difundir resultados.',
      },
      whereUsed: {
        industry:
          'Encuestas de satisfacción de clientes, registros a eventos corporativos y diagnósticos internos.',
        school:
          'Cuestionarios autoevaluables con retroalimentación instantánea, registro de prácticas y encuestas de investigación.',
        community:
          'Censos vecinales rápidos por código QR, consulta ciudadana y evaluación de impacto social.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Dejar preguntas de categoría (como grado, ciudad o edad) como respuesta de texto abierto cuando planeas graficarlas.',
          whyItHappens: 'Cada persona escribe distinto ("4to", "cuarto", "4 semestre"), rompiendo los conteos automáticos.',
          solution: 'Usa opciones múltiples o listas desplegables cerradas para variables categóricas y reserva texto abierto para opiniones.',
        },
        {
          mistake: 'Recopilar correos o teléfonos sin incluir un aviso de privacidad ni limpiar duplicados antes de publicar gráficas.',
          whyItHappens: 'Se omite la etapa ética y de depuración previa al análisis en Excel.',
          solution: 'Agrega siempre consentimiento informado inicial, valida permisos de acceso y depura duplicados en hoja de cálculo.',
        },
      ],
      visualReference: {
        altText: 'Formulario digital interactivo con preguntas estructuradas, escala Likert y panel de resultados gráficos',
        searchTerms: {
          unsplash: 'online survey analytics dashboard laptop',
          pexels: 'person filling digital form smartphone qr',
          wikimedia: 'Online survey branching logic flowchart',
        },
        caption: `Diseño condicional, difusión segura por QR y análisis limpio de respuestas en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'm11' || m === 'm12',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `En ${moduleTitle}, "${cleanTitle}" articula comunicación institucional formal (correo con asunto claro y CCO), colaboración controlada en la nube (permisos Lector/Comentador/Editor), calendarios sincronizados e integración multiplataforma de entregables.`,
        analogy:
          'Administrar permisos en la nube es como entregar copias o llaves de acceso a una sala: a unos invitados les das pase solo de lectura y únicamente a tu equipo cercano le das permiso de editar.',
      },
      purpose: {
        functionalGoal:
          'Coordinar equipos distribuidos en tiempo real, proteger la privacidad de destinatarios e integrar documentos, cálculos, encuestas y presentaciones en un proyecto unificado.',
        problemSolved:
          'Elimina correos sin contexto, exposición accidental de listas de correos en CC, archivos sobrescritos por desconocidos y entregas desorganizadas de último minuto.',
      },
      whereUsed: {
        industry:
          'Oficinas híbridas, gestión de proyectos colaborativos en Drive/OneDrive y reuniones ejecutivas por Meet/Teams.',
        school:
          'Entrega formal de proyectos integradores a docentes, coordinación de equipos y agendamiento de asesorías.',
        community:
          'Comunicación institucional ordenada para convocatorias abiertas y difusión de resultados comunitarios.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Colocar decenas de correos externos en el campo CC (Copia abierta) o compartir enlaces de Drive como "Editor público".',
          whyItHappens: 'Falta revisar privacidad antes de pulsar Enviar o Compartir.',
          solution: 'Usa CCO (Copia Oculta) para listas externas y asigna el permiso mínimo necesario (Lector o Comentador).',
        },
        {
          mistake: 'Escribir toda la petición en el campo "Asunto" del correo sin saludo, contexto ni firma.',
          whyItHappens: 'Se trata el correo institucional como si fuera un chat informal instantáneo.',
          solution: 'Escribe un Asunto breve de 5–8 palabras, saludo formal, cuerpo claro, enlace o adjunto y firma con tu nombre.',
        },
      ],
      visualReference: {
        altText: 'Equipo colaborando en la nube con correo formal, almacenamiento compartido y videollamada organizada',
        searchTerms: {
          unsplash: 'cloud collaboration video call laptop office',
          pexels: 'remote team meeting laptop productivity',
          wikimedia: 'Cloud computing collaboration permissions diagram',
        },
        caption: `Colaboración en la nube, etiqueta institucional e integración de evidencias: ${cleanTitle}.`,
      },
    }),
  },

  // =========================================================
  // PROGRAMACIÓN Y DESARROLLO WEB: pw-m1 .. pw-m6
  // =========================================================
  {
    test: (_t, m) => m === 'pw-m1' || m === 'tal-m4',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En lógica computacional y algorítmica, "${cleanTitle}" establece secuencias finitas, deterministas y sin ambigüedad (diagramas de flujo, pseudocódigo en PSeInt, variables tipadas y operadores aritméticos/relacionales/lógicos) siguiendo el modelo Entrada -> Proceso -> Salida.`,
        analogy:
          'Un algoritmo bien escrito es como una receta precisa de repostería: indica exactamente cuántos gramos (variables con tipo de dato), en qué orden mezclarlos (secuencia y jerarquía) y cuándo sacar del horno (condición de término).',
      },
      purpose: {
        functionalGoal:
          'Modelar y validar la solución lógica de un problema mediante pruebas de escritorio antes de traducirla a cualquier lenguaje de programación.',
        problemSolved:
          'Evita saltar directo a escribir código desordenado lleno de errores lógicos, precedencia incorrecta de operadores o tipos de datos incompatibles.',
      },
      whereUsed: {
        industry:
          'Diseño de reglas de negocio, validadores de formularios, cálculo de nóminas y diagramación de sistemas.',
        school:
          'Resolución estructurada de problemas matemáticos, físicos y prácticas iniciales en PSeInt.',
        community:
          'Mapeo lógico de pasos para agilizar trámites escolares o calculadoras simples de apoyo comunitario.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Omitir paréntesis al combinar sumas y divisiones (ej. escribir c1 + c2 / 2 esperando el promedio).',
          whyItHappens: 'Por jerarquía de operadores, la división se evalúa antes que la suma y produce un resultado erróneo.',
          solution: 'Agrupa explícitamente las operaciones prioritarias entre paréntesis: (c1 + c2) / 2.',
        },
        {
          mistake: 'Usar nombres de variables crípticos como a, b1, x2 o asignar texto a una variable declarada como Entero.',
          whyItHappens: 'Al crecer el algoritmo nadie recuerda qué almacena cada variable y falla en ejecución.',
          solution: 'Elige identificadores descriptivos (promedioFinal, edadUsuario) y respeta el tipo de dato desde la declaración.',
        },
      ],
      visualReference: {
        altText: 'Diagrama de flujo algorítmico junto a editor de pseudocódigo PSeInt mostrando variables y prueba de escritorio',
        searchTerms: {
          unsplash: 'flowchart coding logic whiteboard laptop',
          pexels: 'software developer planning algorithm diagram',
          wikimedia: 'Flowchart algorithm structured programming diagram',
        },
        caption: `Representación lógica, tipos de datos y prueba paso a paso para ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pw-m2',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `Las estructuras de control y modularidad en "${cleanTitle}" gobiernan el flujo dinámico de ejecución mediante bifurcaciones (Si/Según), ciclos iterativos (Mientras, Repetir-Hasta, Para), arreglos indexados y subprocesos reutilizables.`,
        analogy:
          'Los condicionales son desvíos con señalización en una vía de tren; los bucles son una pista circular con contador de vueltas que se detiene automáticamente al llegar a la meta.',
      },
      purpose: {
        functionalGoal:
          'Tomar decisiones automatizadas, procesar listas completas de datos sin repetir líneas de código y dividir sistemas grandes en funciones mantenibles.',
        problemSolved:
          'Elimina duplicación masiva de código y permite manejar entradas variables de usuarios y colecciones de cualquier tamaño.',
      },
      whereUsed: {
        industry:
          'Sistemas de inventario, validación de menús, motores de búsqueda, procesamiento de lotes y microservicios.',
        school:
          'Calculadoras interactivas con menú en PSeInt, análisis de arreglos de calificaciones y revisión por pares.',
        community:
          'Programas sencillos para ordenar listas de inscritos o calcular métricas de campañas comunitarias.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Crear un ciclo Mientras sin actualizar dentro del cuerpo la variable evaluada en la condición.',
          whyItHappens: 'La condición nunca se vuelve falsa y el programa entra en un bucle infinito que congela la ejecución.',
          solution: 'Verifica siempre que cada iteración avance hacia la condición de parada (por ejemplo contador <- contador + 1).',
        },
        {
          mistake: 'Acceder a un índice fuera del tamaño real del arreglo (ej. posición 10 en un vector de 5 elementos).',
          whyItHappens: 'Se confunde el límite base (0 o 1 según el lenguaje) o la longitud declarada del vector.',
          solution: 'Controla siempre los límites del bucle Para usando la longitud exacta del arreglo.',
        },
      ],
      visualReference: {
        altText: 'Esquema visual de estructuras condicionales, bucles iterativos y vectores indexados en programación',
        searchTerms: {
          unsplash: 'programming code loops screen dark editor',
          pexels: 'programmer debugging loop code laptop',
          wikimedia: 'Control flow loop flowchart diagram',
        },
        caption: `Bifurcación condicional, iteración controlada y modularidad aplicada a ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pw-m3',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En desarrollo web frontend, "${cleanTitle}" emplea HTML5 estándar (etiquetas semánticas <header>, <main>, <article>, enlaces, tablas, formularios accesibles y atributo alt) para definir significado, jerarquía y estructura documental para navegadores y lectores de pantalla.`,
        analogy:
          'HTML5 es la estructura de vigas, muros y puertas etiquetadas de un edificio: antes de pintar (CSS) o instalar interruptores (JavaScript), define qué es entrada, qué es sala principal y qué es salida.',
      },
      purpose: {
        functionalGoal:
          'Estructurar páginas web comprensibles tanto para personas (incluyendo tecnología asistiva) como para motores de búsqueda.',
        problemSolved:
          'Evita documentos llenos de etiquetas genéricas <div> sin significado, imágenes rotas por rutas absolutas locales y formularios inaccesibles.',
      },
      whereUsed: {
        industry:
          'Sitios web corporativos, portales gubernamentales accesibles (WCAG), aplicaciones React/SPA y correo HTML.',
        school:
          'Construcción de portafolios estudiantiles, periódicos escolares digitales y documentación web de proyectos.',
        community:
          'Páginas informativas ligeras y accesibles para negocios locales, clínicas o centros comunitarios.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Usar rutas absolutas de tu disco duro (ej. src="C:/Users/Juan/Desktop/foto.jpg") o dejar imágenes sin atributo alt.',
          whyItHappens: 'La imagen carga en tu PC, pero falla por completo al subir el proyecto a internet o en otra computadora.',
          solution: 'Organiza recursos dentro del proyecto usando rutas relativas (./img/foto.jpg) e incluye siempre un alt descriptivo.',
        },
        {
          mistake: 'Elegir encabezados <h4> o <h6> únicamente porque se ven más pequeños que <h2>, rompiendo la jerarquía.',
          whyItHappens: 'Se confunde la estructura semántica del documento con su apariencia visual.',
          solution: 'Usa exactamente un <h1> principal, seguido de <h2> y <h3> en orden lógico; ajusta tamaños luego con CSS.',
        },
      ],
      visualReference: {
        altText: 'Editor VS Code mostrando código HTML5 semántico con header, main, section y vista previa en navegador',
        searchTerms: {
          unsplash: 'html5 semantic code vs code editor monitor',
          pexels: 'web developer writing html markup laptop',
          wikimedia: 'HTML5 semantic page layout structure diagram',
        },
        caption: `Estructura semántica HTML5, rutas relativas y accesibilidad web en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pw-m4',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En diseño visual web, "${cleanTitle}" aplica CSS3 mediante selectores específicos (.clase, #id), Modelo de Caja (padding, border, margin), unidades fluidas (rem, %), Flexbox y consultas @media Mobile-First para maquetar interfaces responsivas.`,
        analogy:
          'Si HTML son las cajas de un almacén, CSS es el diseño de estanterías flexibles (Flexbox) y el acolchado interno (padding) que se reacomodan automáticamente si el cuarto es estrecho (móvil) o amplio (monitor).',
      },
      purpose: {
        functionalGoal:
          'Separar la capa estética de la estructura HTML garantizando legibilidad, contraste accesible y adaptación fluida a cualquier resolución de pantalla.',
        problemSolved:
          'Elimina páginas rígidas que generan scroll horizontal incómodo en celulares y botones o tarjetas desalineadas.',
      },
      whereUsed: {
        industry:
          'Interfaces de aplicaciones web modernas, sistemas de diseño UI (Tailwind/CSS Modules) y comercio electrónico móvil.',
        school:
          'Estilizado completo de portafolios personales, galerías responsivas y dashboards estudiantiles.',
        community:
          'Sitios comunitarios pensados primero para quienes consultan desde teléfonos económicos con pantallas pequeñas.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Fijar anchos absolutos enormes en píxeles (ej. width: 1000px) en contenedores principales.',
          whyItHappens: 'Funciona en tu laptop, pero desborda y corta el contenido en teléfonos de 360–414 px de ancho.',
          solution: 'Usa max-width con porcentajes, unidades rem, flex-wrap y puntos de quiebre @media (min-width: ...).',
        },
        {
          mistake: 'Olvidar box-sizing: border-box al sumar anchos de columnas con padding y bordes.',
          whyItHappens: 'El navegador suma padding fuera del 50% asignado, empujando la segunda columna hacia abajo.',
          solution: 'Declara *, *::before, *::after { box-sizing: border-box; } al inicio de tu hoja de estilos.',
        },
      ],
      visualReference: {
        altText: 'Diagrama del Modelo de Caja CSS y diseño responsivo Flexbox adaptándose de teléfono móvil a monitor',
        searchTerms: {
          unsplash: 'responsive web design mobile desktop css',
          pexels: 'css flexbox frontend layout coding screen',
          wikimedia: 'CSS box model diagram padding border margin',
        },
        caption: `Box Model, Flexbox y enfoque Mobile-First con CSS3 aplicados a ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pw-m5',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En programación web del lado del cliente, "${cleanTitle}" utiliza JavaScript moderno (const/let, funciones, arreglos/objetos, selección DOM con querySelector y eventos addEventListener) para reaccionar en vivo a acciones del usuario sin recargar la página.`,
        analogy:
          'El DOM es el árbol genealógico vivo de tu página HTML; JavaScript actúa como el sistema eléctrico que escucha cuando presionas un interruptor (addEventListener) y enciende o actualiza una tarjeta específica al instante.',
      },
      purpose: {
        functionalGoal:
          'Validar formularios, manipular nodos HTML dinámicamente, mantener estado en memoria del navegador y diagnosticar fallos desde DevTools.',
        problemSolved:
          'Resuelve la rigidez de páginas estáticas que no pueden filtrar listas, actualizar contadores ni mostrar retroalimentación inmediata al usuario.',
      },
      whereUsed: {
        industry:
          'Aplicaciones web interactivas (SPA), simuladores educativos, validadores de pago y dashboards en tiempo real.',
        school:
          'Listas de tareas dinámicas, calculadoras interactivas, cuestionarios autoevaluables y juegos web.',
        community:
          'Herramientas ligeras que corren directo en el navegador del ciudadano incluso con internet intermitente.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Insertar texto escrito por el usuario directamente con innerHTML o colocar <script> en el <head> sin defer.',
          whyItHappens: 'El script corre antes de existir el botón (devuelve null) y además innerHTML expone a ataques XSS.',
          solution: 'Carga el script con atributo defer o al cierre del <body>, y actualiza texto siempre con textContent.',
        },
        {
          mistake: 'Olvidar event.preventDefault() dentro del listener "submit" de un formulario.',
          whyItHappens: 'El navegador recarga toda la página por defecto y borra el estado que acabas de calcular en JS.',
          solution: 'Llama e.preventDefault() al inicio del manejador del evento submit para controlar la lógica en JavaScript.',
        },
      ],
      visualReference: {
        altText: 'Consola JavaScript DevTools y código manipulando elementos del árbol DOM tras eventos de clic',
        searchTerms: {
          unsplash: 'javascript code devtools browser inspector monitor',
          pexels: 'frontend developer coding javascript laptop',
          wikimedia: 'DOM tree HTML JavaScript diagram',
        },
        caption: `Manipulación del DOM, manejo seguro de eventos y depuración DevTools en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pw-m6',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En Python 3, "${cleanTitle}" aplica programación legible basada en indentación obligatoria, estructuras integradas (listas, tuplas, diccionarios clave-valor), funciones def y manejo controlado de excepciones (try/except).`,
        analogy:
          'Si un diccionario de Python es como la libreta de contactos del teléfono (buscas directamente por el nombre "clave" sin recorrer toda la agenda), try/except es la red de seguridad que atrapa un error de teclado sin tirar el programa.',
      },
      purpose: {
        functionalGoal:
          'Automatizar procesos, modelar datos estructurados de manera concisa y construir aplicaciones resilientes frente a entradas inesperadas.',
        problemSolved:
          'Previene caídas bruscas (ValueError, ZeroDivisionError) y reduce drásticamente la cantidad de código necesario frente a lenguajes más verbosos.',
      },
      whereUsed: {
        industry:
          'Backend web, automatización de tareas, análisis científico de datos e inteligencia artificial.',
        school:
          'Resolución de retos algorítmicos, proyectos integradores con persistencia y procesamiento de archivos.',
        community:
          'Scripts rápidos para procesar encuestas CSV locales o respaldar datos comunitarios.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Intentar operar aritméticamente el valor devuelto por input() sin convertirlo antes con int() o float().',
          whyItHappens: 'En Python input() siempre regresa texto (str); "5" + "5" concatena "55" en vez de sumar 10.',
          solution: 'Convierte explícitamente dentro de un bloque try/except ValueError antes de calcular.',
        },
        {
          mistake: 'Mezclar espacios y tabuladores en los bloques indentados o modificar una lista mientras la recorres.',
          whyItHappens: 'Python delimita jerarquías por sangría exacta y arroja IndentationError ante mezclas invisibles.',
          solution: 'Configura tu editor a 4 espacios por tabulación y crea listas nuevas mediante comprensión o copias.',
        },
      ],
      visualReference: {
        altText: 'Terminal y editor mostrando código Python 3 con diccionarios, funciones def y manejo try/except',
        searchTerms: {
          unsplash: 'python programming code editor terminal laptop',
          pexels: 'software engineer writing python code',
          wikimedia: 'Python programming code indentation example',
        },
        caption: `Sintaxis limpia, estructuras de datos y manejo de excepciones en Python para ${cleanTitle}.`,
      },
    }),
  },

  // =========================================================
  // PROGRAMACIÓN INTERMEDIA Y AVANZADA: pa-m1 .. pa-m6
  // =========================================================
  {
    test: (_t, m) => m === 'pa-m1',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En C++, "${cleanTitle}" aprovecha compilación nativa de alto rendimiento y Programación Orientada a Objetos (clases, encapsulamiento private/public, constructores, herencia, polimorfismo y punteros en memoria).`,
        analogy:
          'Una Clase es el plano arquitectónico de una vivienda; cada Objeto instanciado es una casa real construida en memoria; el encapsulamiento es la cerradura que impide alterar instalaciones internas sin usar las llaves autorizadas.',
      },
      purpose: {
        functionalGoal:
          'Modelar dominios complejos en código modular manteniendo control preciso sobre memoria, referencias y velocidad de ejecución.',
        problemSolved:
          'Evita código espagueti con variables globales expuestas y optimiza el uso de RAM al pasar estructuras grandes por referencia.',
      },
      whereUsed: {
        industry:
          'Motores de videojuegos, sistemas embebidos, compiladores, robótica y software financiero de baja latencia.',
        school:
          'Competencias de programación (OMI/ICPC), simuladores físicos y sistemas de inventario en consola con POO.',
        community:
          'Software de escritorio rápido capaz de ejecutarse sin lag en computadoras escolares de bajos recursos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Declarar todos los atributos de una clase como public o dejar punteros colgantes sin inicializar.',
          whyItHappens: 'Cualquier función externa puede corromper el estado del objeto o leer basura en memoria.',
          solution: 'Mantén los atributos en private, valídalos en constructores/setters y prefiere referencias (&) o contenedores std::vector.',
        },
        {
          mistake: 'Pasar objetos enormes por valor en funciones dentro de ciclos intensivos.',
          whyItHappens: 'Se duplica todo el objeto en memoria en cada llamada, degradando rendimiento.',
          solution: 'Usa paso por referencia constante (const Tipo& objeto) para leer sin copiar ni alterar el original.',
        },
      ],
      visualReference: {
        altText: 'Código fuente en C++ estructurado con clases, encapsulamiento POO, herencia y compilación en terminal',
        searchTerms: {
          unsplash: 'c++ object oriented programming code monitor',
          pexels: 'developer coding cpp terminal dark screen',
          wikimedia: 'Object oriented programming inheritance diagram',
        },
        caption: `Arquitectura POO, gestión de memoria y rendimiento nativo en C++: ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pa-m2',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `Dentro del ecosistema Java (JDK/JVM), "${cleanTitle}" aplica tipado estricto, interfaces/clases abstractas, colecciones dinámicas (ArrayList, HashMap), manejo robusto de excepciones try/catch/finally, interfaces Swing/JavaFX y control de versiones Git.`,
        analogy:
          'La JVM actúa como un traductor universal simultáneo: escribes y compilas una vez a bytecode (.class), y esa misma máquina virtual lo adapta al instante para correr en Windows, macOS o Linux.',
      },
      purpose: {
        functionalGoal:
          'Construir aplicaciones de escritorio portables y mantenibles con persistencia en archivos y respuesta limpia ante fallos previsibles.',
        problemSolved:
          'Previene cierres abruptos ante archivos ausentes, organiza equipos de desarrollo con Git sin perder historial y desacopla la lógica de la vista GUI.',
      },
      whereUsed: {
        industry:
          'Banca empresarial, microservicios corporativos (Spring), aplicaciones Android nativas y sistemas administrativos.',
        school:
          'Proyectos de escritorio con Swing/JavaFX, manejo de archivos locales y colaboración en GitHub.',
        community:
          'Sistemas locales de registro para bibliotecas escolares, inventarios o control de préstamo de equipos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Dejar bloques catch (Exception e) completamente vacíos o comparar cadenas de texto String con ==.',
          whyItHappens: 'En Java == compara direcciones de memoria en lugar del contenido de los caracteres, y un catch vacío oculta fallos reales.',
          solution: 'Compara Strings siempre con .equals() y registra o maneja explícitamente toda excepción capturada.',
        },
        {
          mistake: 'Mezclar toda la lógica de negocio dentro del ActionListener de un botón sin cerrar flujos de archivo.',
          whyItHappens: 'Hace imposible probar o reutilizar el código fuera de la ventana gráfica y bloquea archivos en disco.',
          solution: 'Separa servicios en clases independientes y usa try-with-resources para cerrar archivos automáticamente.',
        },
      ],
      visualReference: {
        altText: 'Entorno de desarrollo Java con arquitectura JVM, colecciones HashMap e interfaz gráfica Swing/JavaFX',
        searchTerms: {
          unsplash: 'java programming ide desktop application code',
          pexels: 'software developer working java git github',
          wikimedia: 'Java Virtual Machine architecture diagram',
        },
        caption: `Portabilidad JVM, manejo de excepciones y GUI en Java aplicados a ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pa-m3',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En el ecosistema C# y .NET, "${cleanTitle}" utiliza tipado fuerte con genéricos (List<T>, Dictionary), consultas declarativas LINQ, programación asíncrona async/await, diseño adaptable UI/WinForms, consumo de APIs REST y pruebas unitarias.`,
        analogy:
          'LINQ funciona como hablarle a una lista de objetos en C# con la misma claridad de una consulta SQL ("dame solo los alumnos con promedio mayor a 85 ordenados de mayor a menor"), sin escribir bucles manuales largos.',
      },
      purpose: {
        functionalGoal:
          'Desarrollar software de escritorio o móvil conectado a servicios web con código limpio, verificable mediante pruebas unitarias y sin congelar la interfaz.',
        problemSolved:
          'Evita bloqueos de pantalla durante descargas HTTP, reduce errores de tipo en colecciones y detecta regresiones antes de publicar.',
      },
      whereUsed: {
        industry:
          'Sistemas empresariales .NET, backends cloud en Azure, videojuegos en Unity y apps multiplataforma (.NET MAUI).',
        school:
          'Prototipos conectados a APIs públicas, formularios WinForms validados y suites básicas de pruebas unitarias.',
        community:
          'Aplicaciones de gestión local rápidas con interfaz amigable para centros educativos o comercios locales.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Ejecutar llamadas HTTP con .Result o .Wait() bloqueando el hilo principal de la interfaz de usuario.',
          whyItHappens: 'Detiene el repintado de botones y ventanas haciendo creer al usuario que la aplicación se colgó.',
          solution: 'Utiliza métodos asíncronos con async Task y await HttpClient de extremo a extremo.',
        },
        {
          mistake: 'Confiar únicamente en pruebas manuales haciendo clic sin validar datos en la UI ni escribir unit tests.',
          whyItHappens: 'Al modificar una fórmula o API, fallan otras funciones sin que nadie lo note hasta producción.',
          solution: 'Valida cada entrada de formulario y cubre la lógica crítica con pruebas unitarias automatizadas.',
        },
      ],
      visualReference: {
        altText: 'Código C# .NET mostrando consultas LINQ, genéricos List<T> y consumo asíncrono de API JSON',
        searchTerms: {
          unsplash: 'dotnet csharp software engineering desktop code',
          pexels: 'developer testing api json code screen',
          wikimedia: 'Client server REST API JSON diagram',
        },
        caption: `Tipado fuerte .NET, consultas LINQ y consumo asíncrono REST en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pa-m4',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En bases de datos, "${cleanTitle}" comprende el diseño de esquemas normalizados (1FN–3FN con PK y FK), lenguaje SQL (DDL CREATE/ALTER, DML SELECT/INSERT/UPDATE/DELETE, agregaciones GROUP BY e INNER/LEFT JOIN) y modelado documental NoSQL.`,
        analogy:
          'Una base de datos relacional normalizada es como un sistema escolar donde la lista de alumnos está en una libreta con matrícula única (PK) y sus préstamos de libros solo guardan esa matrícula (FK) en lugar de reescribir su dirección cien veces.',
      },
      purpose: {
        functionalGoal:
          'Garantizar integridad referencial sin datos duplicados, responder preguntas complejas en milisegundos mediante JOINs y proteger información sensible.',
        problemSolved:
          'Elimina inconsistencias al actualizar teléfonos o precios en múltiples copias repetidas y previene borrados catastróficos sin filtro.',
      },
      whereUsed: {
        industry:
          'Comercio electrónico, banca, expedientes médicos, sistemas ERP (PostgreSQL/SQL Server) y apps en tiempo real (Firestore/MongoDB).',
        school:
          'Sistemas de calificaciones, bibliotecas escolares e inventarios conectados a aplicaciones Java/C#/Web.',
        community:
          'Padrones seguros de beneficiarios con datos personales cifrados y respaldados.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Ejecutar UPDATE o DELETE en SQL olvidando la cláusula WHERE.',
          whyItHappens: 'Un descuido sin filtro ni transacción modifica o elimina TODAS las filas de la tabla en un segundo.',
          solution: 'Prueba siempre primero la condición con un SELECT *, envuelve cambios críticos en BEGIN/ROLLBACK y usa WHERE por clave primaria.',
        },
        {
          mistake: 'Concatenar variables de texto directo en consultas SQL en vez de usar consultas parametrizadas.',
          whyItHappens: 'Abre la vulnerabilidad crítica de Inyección SQL permitiendo a un atacante leer o destruir la base.',
          solution: 'Emplea siempre parámetros preparados (?) o un ORM seguro y aplica el principio de mínimo privilegio.',
        },
      ],
      visualReference: {
        altText: 'Diagrama Entidad-Relación con llaves primarias y foráneas junto a consulta SQL con INNER JOIN',
        searchTerms: {
          unsplash: 'database schema sql code server screen',
          pexels: 'software architect database diagram laptop',
          wikimedia: 'SQL Joins Venn diagram relational database',
        },
        caption: `Integridad referencial, consultas SQL con JOINs y criterios SQL vs NoSQL para ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pa-m5',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En Internet de las Cosas con Arduino IDE, "${cleanTitle}" conecta hardware libre (microcontrolador AVR/ESP32, pines digitales HIGH/LOW, ADC analógico 0–1023, PWM 0–255, sensores físicos, actuadores y comunicación Serial/Wi-Fi) mediante código C/C++ estructurado en setup() y loop().`,
        analogy:
          'Los sensores son los sentidos del circuito (ojos de luz, termómetro de piel), el microcontrolador es el cerebro ejecutando reglas en loop() cientos de veces por segundo, y los actuadores (servos, LEDs, bombas) son sus manos.',
      },
      purpose: {
        functionalGoal:
          'Leer variables físicas del entorno real, procesar umbrales automáticos y accionar dispositivos locales o publicar telemetría hacia plataformas IoT en la nube.',
        problemSolved:
          'Permite automatizar riegos, alarmas, estaciones climáticas y dispositivos asistivos accesibles sin depender de hardware propietario costoso.',
      },
      whereUsed: {
        industry:
          'Domótica inteligente, agricultura de precisión, monitoreo ambiental industrial y prototipado rápido mecatrónico.',
        school:
          'Estaciones meteorológicas escolares, robots seguidores de línea y maquetas automatizadas STEM.',
        community:
          'Sensores comunitarios de calidad del aire, detección temprana de humedad o ahorro automático de agua en huertos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Conectar un LED sin resistencia limitadora (~220 Ω) o alimentar motores DC directamente desde un pin de señal.',
          whyItHappens: 'La corriente excede el límite seguro del pin (~20–40 mA) y puede quemar el LED o el microcontrolador.',
          solution: 'Coloca siempre resistencia en serie con LEDs y utiliza transistores, drivers (L298N) o fuentes externas con tierra común (GND) para motores.',
        },
        {
          mistake: 'Usar bloqueos largos como delay(10000) cuando necesitas leer botones o sensores continuamente.',
          whyItHappens: 'delay() detiene por completo el procesador e ignora cualquier evento durante esos segundos.',
          solution: 'Utiliza temporización no bloqueante con millis() para atender sensores, botones y Wi-Fi en paralelo.',
        },
      ],
      visualReference: {
        altText: 'Placa Arduino conectada en protoboard a sensor ambiental, LED con resistencia y monitor serial IoT',
        searchTerms: {
          unsplash: 'arduino breadboard electronics sensor wires closeup',
          pexels: 'microcontroller electronics engineering prototype',
          wikimedia: 'Arduino Uno pinout hardware schematic diagram',
        },
        caption: `Electrónica segura en protoboard, programación setup()/loop() y telemetría IoT en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'pa-m6',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En Inteligencia Artificial aplicada y Machine Learning con Python, "${cleanTitle}" utiliza NumPy, Pandas, Matplotlib/Seaborn, preprocesamiento de datos limpios y modelos supervisados (Regresión Lineal, KNN, Árboles de Decisión) evaluados con métricas objetivas como matriz de confusión y precisión.`,
        analogy:
          'Mientras la programación tradicional programa reglas fijas escritas por humanos ("si temperatura > 30 entonces alerta"), Machine Learning le muestra miles de ejemplos históricos limpios al algoritmo para que descubra por sí mismo el patrón matemático.',
      },
      purpose: {
        functionalGoal:
          'Limpiar conjuntos de datos imperfectos, entrenar modelos predictivos reproducibles y validar su desempeño real sobre datos nunca antes vistos.',
        problemSolved:
          'Resuelve problemas donde escribir miles de reglas manuales sería imposible (predicción de demanda, clasificación médica o detección de riesgo escolar).',
      },
      whereUsed: {
        industry:
          'Sistemas de recomendación, detección de fraude bancario, mantenimiento predictivo y diagnóstico asistido.',
        school:
          'Análisis exploratorio de datos abiertos con Pandas y modelos predictivos sencillos en proyectos integradores avanzados.',
        community:
          'Predicción de deserción escolar temprana o análisis de tendencias ambientales locales con datos públicos.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Entrenar y evaluar el modelo con exactamente los mismos datos sin hacer separación Train/Test.',
          whyItHappens: 'El modelo "memoriza" los ejemplos de entrenamiento (sobreajuste / overfitting) y falla con datos reales nuevos.',
          solution: 'Divide siempre el dataset (ej. 80% entrenamiento / 20% prueba) antes de normalizar o entrenar el modelo.',
        },
        {
          mistake: 'Confiar únicamente en la métrica de exactitud (Accuracy) cuando las clases están muy desbalanceadas.',
          whyItHappens: 'Si 98% de los casos son sanos, un modelo inútil que siempre dice "sano" saca 98% pero detecta 0% de enfermos.',
          solution: 'Inspecciona la Matriz de Confusión, Precisión y Sensibilidad (Recall) para cada clase.',
        },
      ],
      visualReference: {
        altText: 'Visualización de datos en Python con gráfica de dispersión, línea de regresión y matriz de confusión ML',
        searchTerms: {
          unsplash: 'machine learning data visualization python screen',
          pexels: 'data scientist analyzing graphs python code',
          wikimedia: 'Linear regression scatter plot confusion matrix',
        },
        caption: `Limpieza de datos, entrenamiento Train/Test y evaluación predictiva en ${cleanTitle}.`,
      },
    }),
  },

  // =========================================================
  // TECNOLOGÍA SOCIAL & TALLERES DE LIDERAZGO STEM
  // =========================================================
  {
    test: (_t, m) => m === 'ts-m1',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En diagnóstico social basado en evidencia, "${cleanTitle}" articula herramientas de investigación primaria (entrevistas, encuestas), repositorios abiertos oficiales (INEGI, datos municipales), visualización de brechas y Árbol de Problemas (Causas raíz -> Problema central -> Efectos).`,
        analogy:
          'Diagnosticar sin datos es como recetar medicina sin revisar la temperatura del paciente: el Árbol de Problemas separa la fiebre visible (efecto) de la infección real que hay que resolver (causa raíz).',
      },
      purpose: {
        functionalGoal:
          'Sustentar cualquier iniciativa tecnológica en evidencia verificable y enfocar los esfuerzos en las causas profundas más viables de atender.',
        problemSolved:
          'Evita construir aplicaciones costosas para problemas imaginados desde el escritorio que la comunidad ni siquiera prioriza.',
      },
      whereUsed: {
        industry:
          'Consultoría de innovación social, laboratorios cívicos y áreas de responsabilidad social empresarial (ESG).',
        school:
          'Diagnósticos escolares documentados para convocatorias de innovación juvenil y tecnología con propósito.',
        community:
          'Mapeo participativo de brechas en acceso a trámites, becas, agua o seguridad vecinal.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Redactar el problema como "falta de una aplicación móvil" en lugar de describir la necesidad humana real.',
          whyItHappens: 'Se impone la solución tecnológica antes de comprobar si la causa es falta de información, conectividad o confianza.',
          solution: 'Formula el problema centrándolo en las personas y evalúa qué herramienta digital o presencial resulta más accesible.',
        },
        {
          mistake: 'Basarse en suposiciones personales ("todo mundo sabe que...") sin citar fuentes ni escuchar testimonios locales.',
          whyItHappens: 'Sesgos propios ocultan realidades de conectividad, idioma o edad de la comunidad.',
          solution: 'Combina al menos una base estadística pública oficial con entrevistas breves a beneficiarios reales.',
        },
      ],
      visualReference: {
        altText: 'Mapa de datos comunitarios y árbol de problemas elaborado colaborativamente con estadísticas abiertas',
        searchTerms: {
          unsplash: 'community workshop data mapping sticky notes',
          pexels: 'youth team analyzing community data laptop',
          wikimedia: 'Problem tree analysis cause effect diagram',
        },
        caption: `Evidencia estadística pública y análisis de causa raíz aplicados a ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'ts-m2',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En innovación centrada en personas, "${cleanTitle}" combina las cinco fases del Design Thinking (Empatizar, Definir, Idear, Prototipar, Testear) con entregas incrementales ágiles (Scrum/Kanban) y maquetas rápidas en papel o plataformas No-Code.`,
        analogy:
          'Es como probar primero una maqueta de cartón de un mueble en la sala real antes de cortar madera fina: descubres en diez minutos si estorba la puerta sin desperdiciar meses ni dinero.',
      },
      purpose: {
        functionalGoal:
          'Validar hipótesis de solución directamente con 5 usuarios reales mediante iteraciones semanales cortas.',
        problemSolved:
          'Evita invertir meses programando pantallas complejas que luego nadie entiende ni utiliza en su teléfono diario.',
      },
      whereUsed: {
        industry:
          'Equipos UX/UI, startups tecnológicas y laboratorios ágiles de producto digital.',
        school:
          'Retos interdisciplinarios, hackathons escolares y prototipos rápidos de impacto comunitario.',
        community:
          'Co-diseño de trámites sencillos y portales informativos junto a jóvenes, comerciantes o adultos mayores.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Entrevistar usuarios preguntando "¿Verdad que te gustaría usar mi app?" o defender el prototipo cuando se confunden.',
          whyItHappens: 'Por cortesía el entrevistado dice sí, ocultando fallos reales de diseño.',
          solution: 'Observa en silencio cómo intenta completar una tarea en el prototipo; cada tropiezo es oro para mejorar.',
        },
        {
          mistake: 'Saltarse el boceto en papel o No-Code e intentar programar toda la base de datos desde el día uno.',
          whyItHappens: 'Se asocia calidad con código complejo en lugar de utilidad validada.',
          solution: 'Valida primero flujos esenciales en papel o prototipo No-Code y escala luego a código.',
        },
      ],
      visualReference: {
        altText: 'Estudiantes creando bocetos en papel, mapa de empatía y tablero ágil Kanban para prototipo social',
        searchTerms: {
          unsplash: 'design thinking empathy map wireframes workshop',
          pexels: 'ux students sketching paper prototype team',
          wikimedia: 'Design thinking five stages process diagram',
        },
        caption: `Empatía comunitaria, prototipado rápido e iteración ágil en ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'ts-m3' || m === 'ts-m4',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En sostenibilidad e impacto social, "${cleanTitle}" integra el Canvas Social, estrategias de financiamiento (subvenciones/crowdfunding), transferencia tecnológica, inclusión digital con perspectiva de género, KPIs sociales verificables y protección ética de datos.`,
        analogy:
          'Un proyecto social sin plan de sostenibilidad ni transferencia es como regalar una bicicleta sin bomba de aire ni enseñar a repararla: al primer pinchazo queda guardada.',
      },
      purpose: {
        functionalGoal:
          'Medir transformación real en las personas, asegurar recursos continuos y capacitar a operadores locales para mantener la solución autónoma y segura.',
        problemSolved:
          'Evita proyectos fugaces que mueren al acabar el curso, métricas superficiales ("likes") y exposición indebida de datos de poblaciones vulnerables.',
      },
      whereUsed: {
        industry:
          'Empresas sociales certificadas, fundaciones tecnológicas y fondos de impacto juvenil.',
        school:
          'Defensa final de proyectos sociales STEM ante comités evaluadores e inversionistas de impacto.',
        community:
          'Escuelas rurales, centros de capacitación juvenil y programas de inclusión femenina en tecnología.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Reportar únicamente métricas de vanidad (visitas o seguidores) sin medir logros reales ni proteger datos personales.',
          whyItHappens: 'Contar clics es fácil, mientras medir retención, ahorro de tiempo o aprendizaje exige seguimiento.',
          solution: 'Define 3 KPIs de transformación medibles y publica únicamente agregados anónimos con consentimiento.',
        },
        {
          mistake: 'Entregar una herramienta compleja a la comunidad sin guías claras ni acompañamiento de adopción.',
          whyItHappens: 'Se asume que todos tienen la misma alfabetización digital o conectividad que el equipo creador.',
          solution: 'Incluye manual visual paso a paso, capacitación práctica local y soporte de bajo consumo de datos.',
        },
      ],
      visualReference: {
        altText: 'Equipo diverso presentando tablero de KPIs de impacto social, Canvas Social e inclusión digital comunitaria',
        searchTerms: {
          unsplash: 'social enterprise impact metrics diverse tech team',
          pexels: 'women in stem mentoring community technology',
          wikimedia: 'Social business model canvas diagram',
        },
        caption: `Sostenibilidad financiera, inclusión STEM y medición ética de KPIs para ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'tal-m1' || m === 'tal-m6',
    build: (cleanTitle) => ({
      whatIs: {
        definition:
          `En comunicación técnica y Elevator Pitch, "${cleanTitle}" estructura el arco narrativo Problema-Solución-Evidencia-Llamado a la Acción (en 60 segundos o con demo en vivo), respaldado por Storytelling humano, modulación vocal, pausas estratégicas y presencia escénica.`,
        analogy:
          'Un Elevator Pitch es como el tráiler bien editado de una película: no cuenta cada escena ni cada diálogo técnico, pero en 60 segundos transmite la trama central y deja al jurado queriendo saber más.',
      },
      purpose: {
        functionalGoal:
          'Traducir logros técnicos complejos en valor comprensible para cualquier audiencia en menos de un minuto con seguridad vocal y corporal.',
        problemSolved:
          'Evita exposiciones saturadas de jerga técnica que aburren o confunden al jurado, improvisaciones nerviosas y cierres débiles.',
      },
      whereUsed: {
        industry:
          'Demo Days de startups, presentaciones a clientes directivos y defensa de propuestas ante fondos.',
        school:
          'Exposiciones de cierre de proyecto, ferias tecnológicas y concursos de emprendimiento juvenil.',
        community:
          'Presentación de iniciativas sociales para conseguir aliados locales, becas o espacios de implementación.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Abrir el Pitch enumerando librerías o servidores ("Usamos 12 tablas y API...") antes de explicar el problema humano.',
          whyItHappens: 'Quien construyó la app ama sus detalles técnicos, pero el público primero necesita saber a quién ayuda.',
          solution: 'Dedica los primeros 15 segundos a mostrar el problema real con una cifra o historia concreta antes de enseñar la solución.',
        },
        {
          mistake: 'Acelerar la voz para meter 5 minutos de texto en 60 segundos y terminar diciendo "pues eso sería todo".',
          whyItHappens: 'Falta de recorte en el guion y nervios escénicos al finalizar.',
          solution: 'Limita el guion a ~135 palabras, haz pausas de 1 segundo tras cifras clave y cierra con un llamado a la acción claro.',
        },
      ],
      visualReference: {
        altText: 'Joven líder presentando proyecto tecnológico con seguridad en escenario frente a audiencia',
        searchTerms: {
          unsplash: 'young tech founder pitch stage microphone',
          pexels: 'confident speaker presenting tech project',
          wikimedia: 'Elevator pitch four stage structure diagram',
        },
        caption: `Narrativa con propósito, demo segura y presencia escénica para ${cleanTitle}.`,
      },
    }),
  },
  {
    test: (_t, m) => m === 'tal-m2' || m === 'tal-m3' || m === 'tal-m5',
    build: (cleanTitle, moduleTitle) => ({
      whatIs: {
        definition:
          `En ${moduleTitle}, "${cleanTitle}" integra liderazgo ágil de servicio (definición de MVP, roles claros y check-ins breves), diseño accesible universal (WCAG), depuración metódica ante errores ("bugs"), asertividad e inclusión juvenil y femenina en STEM.`,
        analogy:
          'Liderar un equipo técnico bajo presión es como dirigir una orquesta: el director no toca todos los instrumentos solo, sino que marca el ritmo, escucha a cada sección y desbloquea a tiempo para que todo suene armonioso.',
      },
      purpose: {
        functionalGoal:
          'Sostener colaboración sana en hackathons, transformar la frustración ante errores en diagnóstico lógico y fortalecer la voz propia y seguridad técnica.',
        problemSolved:
          'Previene pleitos por falta de integración a última hora, bloqueos emocionales frente a errores de código y autoexclusión por síndrome del impostor.',
      },
      whereUsed: {
        industry:
          'Equipos ágiles de ingeniería, mentoría técnica y comités de accesibilidad e inclusión digital.',
        school:
          'Hackathons estudiantiles, trabajo en equipo interdisciplinario y círculos de estudio STEM.',
        community:
          'Redes de liderazgo juvenil femenino y proyectos accesibles para personas con distintas capacidades.',
      },
      mistakesToAvoid: [
        {
          mistake: 'Cambiar líneas de código al azar cuando aparece un bug por frustración, o intentar integrar el trabajo grupal en la última hora.',
          whyItHappens: 'La prisa y el agotamiento anulan el método sistemático.',
          solution: 'Lee completo el mensaje de error, haz pausas de 5 minutos ante bloqueos e integra avances cada pocas horas.',
        },
        {
          mistake: 'Minimizar tus aportes técnicos ("solo tuve suerte") o transmitir información en pantalla usando únicamente color.',
          whyItHappens: 'Se subestima el mérito propio y se diseñan interfaces pensando solo en la visión propia.',
          solution: 'Registra tus logros reales en bitácora y acompaña todo estado visual con etiqueta e ícono de alto contraste.',
        },
      ],
      visualReference: {
        altText: 'Equipo diverso de jóvenes colaborando en hackathon con tablero ágil, liderazgo inclusivo y laptop',
        searchTerms: {
          unsplash: 'diverse youth coding hackathon teamwork laptop',
          pexels: 'women leading tech workshop collaboration',
          wikimedia: 'Agile scrum team collaboration workflow',
        },
        caption: `Liderazgo colaborativo, accesibilidad y resiliencia técnica en ${cleanTitle}.`,
      },
    }),
  },
];

export function buildGranularPedagogy(params: {
  moduleId: string;
  moduleTitle: string;
  cleanTitle: string;
  defaultGuide: string[];
  defaultExample: { title: string; snippetOrCase: string; takeaway: string };
  defaultImageCaption: string;
}): GranularPedagogy {
  const { moduleId, moduleTitle, cleanTitle, defaultGuide, defaultExample, defaultImageCaption } = params;
  const lower = cleanTitle.toLowerCase();

  for (const rule of TOPIC_RULES) {
    if (rule.test(lower, moduleId)) {
      return rule.build(cleanTitle, moduleTitle);
    }
  }

  // Fallback seguro y riguroso sin frases genéricas
  return {
    whatIs: {
      definition: `${cleanTitle} es una competencia técnica dentro de ${moduleTitle} enfocada en aplicar estándares claros, herramientas digitales especializadas y criterios verificables de calidad.`,
      analogy: `Funciona como seguir un manual de taller mecánico: cada herramienta tiene una función precisa y el orden de los pasos determina que el mecanismo opere sin fallas.`,
    },
    purpose: {
      functionalGoal: `Ejecutar ${cleanTitle} con precisión técnica, trazabilidad y formato reutilizable.`,
      problemSolved: `Elimina improvisaciones, retrabajos y errores operativos comunes al pasar de pruebas básicas a entregables reales.`,
    },
    whereUsed: {
      industry: `Flujos profesionales de tecnología, documentación técnica y control de calidad.`,
      school: `Prácticas de laboratorio, portafolios digitales y proyectos integradores STEM.`,
      community: `Soluciones digitales prácticas aplicables en entornos locales y escolares.`,
    },
    mistakesToAvoid: [
      {
        mistake: `Omitir la verificación de entradas o configuraciones previas antes de ejecutar ${cleanTitle}.`,
        whyItHappens: `Se intenta avanzar directo al resultado final saltando la preparación base.`,
        solution: `Comprueba tus parámetros iniciales paso a paso siguiendo la guía práctica y el ejemplo real.`,
      },
      {
        mistake: `No guardar versiones respaldadas ni comprobar el resultado en un caso de prueba sencillo.`,
        whyItHappens: `Se asume que todo quedó bien al primer intento sin validar salidas.`,
        solution: `Prueba siempre con un caso pequeño verificable antes de dar por cerrada tu entrega.`,
      },
    ],
    visualReference: {
      altText: `Ilustración técnica y entorno real de práctica sobre ${cleanTitle} en ${moduleTitle}`,
      searchTerms: {
        unsplash: `${cleanTitle.split(' ').slice(0, 4).join(' ')} technology laptop`,
        pexels: `${cleanTitle.split(' ').slice(0, 4).join(' ')} workspace`,
        wikimedia: `${cleanTitle.split(' ').slice(0, 3).join(' ')} diagram`,
      },
      caption: defaultImageCaption,
    },
    customSteps: defaultGuide,
    customExample: defaultExample,
  };
}
