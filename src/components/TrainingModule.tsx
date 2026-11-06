import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Shield,
  Wallet,
  Receipt,
  CalendarClock,
  PieChart,
  Calendar,
  BarChart3,
  Target,
  Users,
  Camera,
  Smartphone,
  ChevronRight,
  HardDrive,
  Check,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AppLanguage, CurrencyCode } from '../types/finance';
import { getTranslation } from '../services/i18n';
import { StorageService } from '../services/storage';

interface TrainingModuleProps {
  language: AppLanguage;
  currencyCode: CurrencyCode;
  onNavigateTab: (tab: any) => void;
  onOpenScanReceipt: () => void;
}

interface ModuleGuide {
  id: string;
  title: string;
  tabKey: string;
  icon: React.ReactNode;
  summary: string;
  steps: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  }[];
  keyRules: string[];
}

export const TrainingModule: React.FC<TrainingModuleProps> = ({
  language,
  currencyCode,
  onNavigateTab,
  onOpenScanReceipt,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const [activeSection, setActiveSection] = useState<'guides' | 'advice' | 'storage'>('guides');
  const [selectedGuideId, setSelectedGuideId] = useState<string>('dashboard');
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('fbm_training_progress_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [isPersistedStorage, setIsPersistedStorage] = useState<boolean | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{ usageMB: number; quotaMB: number } | null>(null);
  const [persistingStatus, setPersistingStatus] = useState<string>('');

  useEffect(() => {
    // Check persistence status
    StorageService.isStoragePersistent().then(setIsPersistedStorage);
    StorageService.getStorageEstimate().then(setStorageEstimate);
  }, []);

  const handleToggleStep = (stepKey: string) => {
    const next = { ...completedSteps, [stepKey]: !completedSteps[stepKey] };
    setCompletedSteps(next);
    localStorage.setItem('fbm_training_progress_v1', JSON.stringify(next));
  };

  const handleRequestPersistence = async () => {
    setPersistingStatus('solicitando');
    const result = await StorageService.requestPersistentStorage();
    setIsPersistedStorage(result);
    setPersistingStatus(result ? 'exito' : 'denegado');
    const est = await StorageService.getStorageEstimate();
    setStorageEstimate(est);
  };

  const guides: ModuleGuide[] = [
    {
      id: 'dashboard',
      title: language === 'en' ? 'Financial Dashboard' : 'Panel Financiero (Dashboard)',
      tabKey: 'dashboard',
      icon: <TrendingUp className="w-5 h-5 text-blue-500" />,
      summary:
        language === 'en'
          ? 'The heart of your household finances. Monitor available liquid cash, commitments, and savings rate in real time.'
          : 'El núcleo financiero del hogar. Monitorea tu liquidez real disponible, compromisos futuros y tasa de ahorro mensual.',
      steps: [
        {
          title: language === 'en' ? '1. Understand Available Balance' : '1. Comprender el Balance Disponible Efectivo',
          description:
            language === 'en'
              ? 'Calculated as: Received Income - Executed Expenses. Pending bills are not double-subtracted, preventing cash-flow distortion.'
              : 'Fórmula financiera: Ingresos Recibidos - Gastos Ejecutados. No descuenta dos veces los pendientes, protegiendo tu liquidez.',
        },
        {
          title: language === 'en' ? '2. Review Dynamic Island' : '2. Observar la Dynamic Island superior',
          description:
            language === 'en'
              ? 'Tapping the top Apple Dynamic Island expands a quick summary of urgent overdue bills and month cash.'
              : 'La Dynamic Island en la parte superior te avisa de facturas próximas o vencidas con un toque rápido.',
        },
        {
          title: language === 'en' ? '3. Compare with Previous Month' : '3. Comparativa frente al mes anterior',
          description:
            language === 'en'
              ? 'Use the comparative indicators to verify whether expenses grew and whether your savings percentage improved.'
              : 'Observa si tu tasa de ahorro subió o si tus gastos se dispararon respecto al ciclo anterior.',
        },
      ],
      keyRules: [
        language === 'en'
          ? 'Rule of thumb: Maintain a savings rate above 20% whenever possible.'
          : 'Regla de oro: Mantén tu tasa de ahorro mensual por encima del 20%.',
        language === 'en'
          ? 'Check overdue bills first thing when opening the app.'
          : 'Revisa de inmediato las alertas rojas de vencimiento para evitar recargos o cortes de servicio.',
      ],
    },
    {
      id: 'fixedExpenses',
      title: language === 'en' ? 'Fixed Obligations & Bills' : 'Gastos Fijos y Obligaciones',
      tabKey: 'fixedExpenses',
      icon: <CalendarClock className="w-5 h-5 text-blue-600" />,
      summary:
        language === 'en'
          ? 'Priority management of recurring household bills (mortgage, utilities, insurance, schooling).'
          : 'Control prioritario de todos los compromisos recurrentes del hogar (renta, servicios, seguros, colegiaturas).',
      steps: [
        {
          title: language === 'en' ? '1. Register your fixed recurring obligations' : '1. Dar de alta las obligaciones fijas',
          description:
            language === 'en'
              ? 'Define bill name, expected amount, payment method, responsible member, and exact due date.'
              : 'Registra el nombre, importe esperado, fecha de vencimiento, método de pago y persona responsable.',
          actionLabel: language === 'en' ? 'Go to Fixed Bills' : 'Ir a Gastos Fijos',
          onAction: () => onNavigateTab('fixedExpenses'),
        },
        {
          title: language === 'en' ? '2. Mark as Paid or Partial' : '2. Marcar como Pagado o Registrar Abonos Parciales',
          description:
            language === 'en'
              ? 'Click the circle to mark 100% settled or use "Abonar / Parcial" to pay in installments without losing history.'
              : 'Pulsa el círculo de verificación para marcarla pagada o "Abonar / Parcial" para registrar entregas escalonadas.',
        },
        {
          title: language === 'en' ? '3. Synchronize monthly cycles' : '3. Sincronizar meses futuros con Auto-Recurrentes',
          description:
            language === 'en'
              ? 'Use the "Auto-Recurrentes" button in the top bar to generate next month’s bills automatically without duplicating.'
              : 'Usa el botón "Auto-Recurrentes" en la barra superior para proyectar el nuevo mes sin duplicar datos.',
        },
      ],
      keyRules: [
        'Los gastos fijos representan tus compromisos ineludibles: liquídalos en cuanto ingresen los salarios.',
        'Puedes modificar el importe esperado de un mes en curso sin alterar el historial contable de los meses previos.',
      ],
    },
    {
      id: 'incomes',
      title: language === 'en' ? 'Family Income Management' : 'Gestión de Ingresos Familiares',
      tabKey: 'incomes',
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
      summary:
        language === 'en'
          ? 'Track all household earnings: corporate payroll, freelance work, investments, rental dividends.'
          : 'Registro y seguimiento de todas las entradas del hogar: nóminas, freelance, rentas e inversiones.',
      steps: [
        {
          title: language === 'en' ? '1. Register Income Sources' : '1. Registrar fuentes y receptores',
          description:
            language === 'en'
              ? 'Add each paycheck or freelance payment, linking it to the responsible family member.'
              : 'Añade cada sueldo o cobro, asociando a qué miembro de la familia le corresponde.',
          actionLabel: language === 'en' ? 'Go to Incomes' : 'Ir a Ingresos',
          onAction: () => onNavigateTab('incomes'),
        },
        {
          title: language === 'en' ? '2. Distinguish Pending vs. Received' : '2. Diferenciar Pendiente de Recibido',
          description:
            language === 'en'
              ? 'Only income marked as "Received" is factored into your active Available Balance.'
              : 'Solo el dinero marcado como "Recibido" sumará a tu balance real disponible para evitar falsas seguridades.',
        },
      ],
      keyRules: [
        'Nunca comprometas gastos basados en ingresos no confirmados o de cobro incierto.',
      ],
    },
    {
      id: 'variableExpenses',
      title: language === 'en' ? 'Variable Expenses & AI Receipt Scanning' : 'Gastos Variables y Escaneo con IA',
      tabKey: 'variableExpenses',
      icon: <Receipt className="w-5 h-5 text-indigo-500" />,
      summary:
        language === 'en'
          ? 'Log daily purchases, groceries, dining, fuel, and scan printed paper receipts instantly using Gemini AI.'
          : 'Registra compras cotidianas, supermercado, salidas, gasolina y escanea tickets con foto usando Gemini IA.',
      steps: [
        {
          title: language === 'en' ? '1. Fast Receipt Scanning via Photo' : '1. Escanear recibos mediante fotografía',
          description:
            language === 'en'
              ? 'Click "Scan invoice" in the top bar. Choose "Take photo" or "Upload file". Gemini will automatically extract fiscal ID, invoice number, dates, taxes, and total.'
              : 'Toca "Escanear factura" en la barra superior. Selecciona "Tomar foto" o "Subir archivo". La IA extraerá emisor, NIF/RFC, número de factura, importes e impuestos.',
          actionLabel: language === 'en' ? 'Open Invoice Scanner' : 'Escanear factura',
          onAction: onOpenScanReceipt,
        },
        {
          title: language === 'en' ? '2. Mark Extraordinary Outlays' : '2. Clasificar gastos extraordinarios',
          description:
            language === 'en'
              ? 'Separate ordinary consumption from non-recurring events (car repairs, appliances) to keep metrics clean.'
              : 'Usa el botón "Extraordinario" para reparaciones inesperadas o compras atípicas sin distorsionar el promedio diario.',
        },
      ],
      keyRules: [
        'Registra el gasto en el mismo momento que ocurre para no olvidar tickets en el bolsillo.',
      ],
    },
    {
      id: 'budget',
      title: language === 'en' ? 'Category Budgets' : 'Presupuestos y Techos de Gasto',
      tabKey: 'budget',
      icon: <PieChart className="w-5 h-5 text-indigo-600" />,
      summary:
        language === 'en'
          ? 'Define category limits (groceries, dining, entertainment) to prevent lifestyle inflation and receive alerts.'
          : 'Establece límites máximos por categoría (supermercado, restaurantes, ocio) con alertas al 80% y 100%.',
      steps: [
        {
          title: language === 'en' ? '1. Set monthly category ceilings' : '1. Fijar techos mensuales',
          description:
            language === 'en'
              ? 'Define realistic amounts for Supermarket, Fuel, Dining, and Personal Shopping.'
              : 'Asigna límites realistas para Supermercado, Combustible, Restaurantes y Compras Personales.',
          actionLabel: language === 'en' ? 'Configure Budgets' : 'Configurar Presupuestos',
          onAction: () => onNavigateTab('budget'),
        },
        {
          title: language === 'en' ? '2. Track early warnings' : '2. Monitorear las barras de progreso',
          description:
            language === 'en'
              ? 'Yellow bars indicate you reached 80% of your ceiling; red banners flag immediate overruns.'
              : 'Las barras cambian a amarillo al llegar al 80% y a rojo con alertas cuando superas el 100%.',
        },
      ],
      keyRules: [
        'El presupuesto no es una camisa de fuerza, es un mapa de prioridades familiares consensuadas.',
      ],
    },
    {
      id: 'goals',
      title: language === 'en' ? 'Savings Goals & Emergency Fund' : 'Metas de Ahorro y Fondo de Emergencia',
      tabKey: 'goals',
      icon: <Target className="w-5 h-5 text-purple-600" />,
      summary:
        language === 'en'
          ? 'Build your family emergency reserve and shared dreams (travel, education, home down-payment).'
          : 'Construye el colchón financiero del hogar y proyectos compartidos (vacaciones, fondo médico, compras).',
      steps: [
        {
          title: language === 'en' ? '1. Establish an Emergency Fund' : '1. Crear el Fondo de Emergencia Prioritario',
          description:
            language === 'en'
              ? 'Your first goal should cover 3 to 6 months of fixed household commitments.'
              : 'Tu primera meta debe ser cubrir entre 3 y 6 meses de obligaciones fijas familiares.',
          actionLabel: language === 'en' ? 'View Savings Goals' : 'Ver Metas de Ahorro',
          onAction: () => onNavigateTab('goals'),
        },
        {
          title: language === 'en' ? '2. Record Periodic Contributions' : '2. Registrar aportes mensuales',
          description:
            language === 'en'
              ? 'Use the "Aportar" button on any goal to feed the piggy bank as soon as you receive paychecks.'
              : 'Pulsa "Aportar" en cada tarjeta de meta para transferir ahorro mensual directamente.',
        },
      ],
      keyRules: [
        'Págate a ti primero: aparta el ahorro a principio de mes antes de empezar a gastar.',
      ],
    },
    {
      id: 'users',
      title: language === 'en' ? 'Roles & Household Variables' : 'Gestión de Roles y Variables del Hogar',
      tabKey: 'users',
      icon: <Users className="w-5 h-5 text-blue-600" />,
      summary:
        language === 'en'
          ? 'Manage system permissions (Super Admin, Admin, Editor, Viewer), biometric access, and key financial variables.'
          : 'Configura permisos (Super Admin, Admin, Editor, Viewer), biometría, teléfonos y variables del hogar.',
      steps: [
        {
          title: language === 'en' ? '1. Assign Role Permissions' : '1. Configurar Roles del Sistema',
          description:
            language === 'en'
              ? 'Assign "Super Admin" for master control, "Admin" for parents, "Editor" for adults logging expenses, and "Viewer" for children.'
              : 'Asigna "Super Admin" al titular, "Admin" a los padres, "Editor" para registrar gastos y "Viewer" a los hijos.',
          actionLabel: language === 'en' ? 'Manage Users' : 'Gestionar Usuarios',
          onAction: () => onNavigateTab('users'),
        },
        {
          title: language === 'en' ? '2. Tune Household Variables' : '2. Ajustar Variables Financieras',
          description:
            language === 'en'
              ? 'Set your default currency, budget cycle start day (e.g. 1st or 15th), and emergency coverage months.'
              : 'Configura la moneda base, el día de inicio de ciclo salarial y el umbral de alerta deseado.',
        },
      ],
      keyRules: [
        'La transparencia familiar en las finanzas reduce el estrés y fomenta la cooperación de todos los miembros.',
      ],
    },
  ];

  const financialAdvices = [
    {
      title: 'La Regla de Oro 50 / 30 / 20 Adaptada al Hogar',
      badge: 'Metodología Clásica',
      color: 'blue',
      content:
        'Distribuye los ingresos netos del hogar en tres bloques principales: 50% para Necesidades Básicas y Obligaciones Fijas (hipoteca, luz, despensa básica), 30% para Gastos Variables y Calidad de Vida (restaurantes, ropa, salidas), y un 20% innegociable destinado al Ahorro, Fondo de Emergencia e Inversión.',
    },
    {
      title: 'El Fondo de Paz Mental (3 a 6 meses)',
      badge: 'Seguridad Crítica',
      color: 'emerald',
      content:
        'Ningún hogar debe invertir o adquirir deudas superfluas sin antes tener un fondo equivalente a mínimo 3 meses de gastos fijos en una cuenta líquida y segura. Este fondo evita recurrir a tarjetas de crédito con intereses del 40%+ cuando surge un imprevisto médico o laboral.',
    },
    {
      title: 'Auditoría Mensual de "Fugas Hormiga" y Suscripciones',
      badge: 'Eficiencia',
      color: 'purple',
      content:
        'Revisa periódicamente el módulo de Gastos Fijos para cancelar suscripciones duplicadas (streaming, apps que nadie usa, membresías de gimnasio inactivas). Un goteo de $40 dólares al mes suma cerca de $500 al año que podrían estar rindiendo en el fondo de ahorro de tus hijos.',
    },
    {
      title: 'Reunión Financiera Familiar Mensual (15 Minutos)',
      badge: 'Cultura Familiar',
      color: 'amber',
      content:
        'Dediquen 15 minutos el último domingo de cada mes a abrir juntos el módulo de Informes. Ver el gráfico de gastos y celebrar los ahorros fomenta la educación financiera de los hijos y alinea a la pareja en objetivos comunes sin tensiones.',
    },
    {
      title: 'Págate a Ti Primero (Pay Yourself First)',
      badge: 'Hábito Transformador',
      color: 'indigo',
      content:
        'El error más común es ahorrar "lo que sobra a fin de mes" (generalmente nada). En cuanto se registre el cobro de la nómina en el módulo de Ingresos, traslada de inmediato el 15% o 20% a tus Metas de Ahorro. Ajusta el estilo de vida al saldo restante.',
    },
    {
      title: 'Diferencia Gasto Fijo vs. Deseo Cotidiano',
      badge: 'Claridad Mental',
      color: 'rose',
      content:
        'En Family Budget Manager, las obligaciones fijas tienen fecha límite ineludible. Antes de hacer una compra variable grande, espera 48 horas: si sigues necesitándola pasado ese tiempo, regístrala; en el 70% de los casos descubrirás que era un impulso pasajero.',
    },
  ];

  const currentGuide = guides.find((g) => g.id === selectedGuideId) || guides[0];

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-white" />
            <span className="text-xs uppercase tracking-widest font-mono font-bold text-blue-200">
              Centro de Aprendizaje & Academia Financiera
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Instructivo y Finanzas Saludables
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
            Aprende a dominar cada herramienta de la aplicación y pon en práctica las mejores estrategias de administración patrimonial para tu hogar.
          </p>
        </div>

        {/* Storage Integrity Status Pill */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 text-right shrink-0">
          <div className="flex items-center gap-1.5 justify-end text-xs font-bold">
            <HardDrive className="w-4 h-4 text-emerald-300" />
            <span>Almacenamiento Local PWA</span>
          </div>
          <span className="text-[11px] text-blue-100 block mt-0.5">
            {isPersistedStorage
              ? 'Almacenamiento Permanente Activo'
              : 'Persistencia estándar de navegador'}
          </span>
        </div>
      </div>

      {/* Main Mode Navigation Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
        <button
          onClick={() => setActiveSection('guides')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'guides'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Instructivo por Módulos ({guides.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('advice')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'advice'
              ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          <span>Consejos Financieros Familiares</span>
        </button>

        <button
          onClick={() => setActiveSection('storage')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSection === 'storage'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Almacenamiento Local Offline</span>
        </button>
      </div>

      {/* SECTION 1: INSTRUCTIVO POR MÓDULOS */}
      {activeSection === 'guides' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Modules list selector */}
          <div className="lg:col-span-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-2 mb-2">
              Selecciona un Módulo
            </span>

            {guides.map((guide) => {
              const isSelected = guide.id === selectedGuideId;
              const stepCount = guide.steps.length;
              const completedCount = guide.steps.filter((_, idx) =>
                completedSteps[`${guide.id}-step-${idx}`]
              ).length;
              const isAllDone = stepCount > 0 && completedCount === stepCount;

              return (
                <button
                  key={guide.id}
                  onClick={() => setSelectedGuideId(guide.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500/80 text-blue-950 dark:text-blue-100 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0">
                      {guide.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                        {guide.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                        {completedCount} de {stepCount} lecciones
                      </span>
                    </div>
                  </div>

                  {isAllDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Guide Interactive Steps */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {currentGuide.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {currentGuide.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentGuide.summary}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab(currentGuide.tabKey)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Abrir Módulo
              </button>
            </div>

            {/* Interactive Steps List */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Pasos y Guía de Uso:
              </span>

              {currentGuide.steps.map((step, idx) => {
                const stepKey = `${currentGuide.id}-step-${idx}`;
                const isChecked = Boolean(completedSteps[stepKey]);

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border transition-all ${
                      isChecked
                        ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => handleToggleStep(stepKey)}
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                          isChecked
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                        }`}
                        title={isChecked ? 'Marcar como pendiente' : 'Marcar como completado'}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      <div className="flex-1">
                        <h4
                          className={`text-xs font-bold text-slate-900 dark:text-white ${
                            isChecked ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {step.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                          {step.description}
                        </p>

                        {step.actionLabel && step.onAction && (
                          <button
                            onClick={step.onAction}
                            className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                          >
                            <span>{step.actionLabel}</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Key Financial Rules Box */}
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Recomendaciones Clave para este Módulo
              </span>
              <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 dark:text-amber-300">
                {currentGuide.keyRules.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CONSEJOS Y RECOMENDACIONES FINANCIERAS */}
      {activeSection === 'advice' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Estrategias y Consejos de Finanzas Familiares
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prácticas comprobadas para construir patrimonio, evitar el sobreendeudamiento y proteger la estabilidad de tu hogar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {financialAdvices.map((adv, idx) => (
              <div
                key={idx}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 inline-block">
                    {adv.badge}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {adv.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {adv.content}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Aplica directamente en Family Budget Manager</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: ALMACENAMIENTO LOCAL Y MODO INSTALADO OFFLINE */}
      {activeSection === 'storage' && (
        <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Garantía de Almacenamiento Local 100% Autónomo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Toda la información financiera se guarda en tu dispositivo, sin servidores externos.
              </p>
            </div>
          </div>

          {/* Technical Specs List */}
          <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white">
                  Privacidad y Confiabilidad Local
                </span>
                <span>
                  Tus ingresos, obligaciones bancarias y notas no viajan a ninguna base de datos en la nube. Se almacenan exclusivamente en el almacenamiento seguro de tu teléfono o navegador.
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-3">
              <Smartphone className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-slate-900 dark:text-white">
                  PWA Instalable con Service Worker Offline
                </span>
                <span>
                  Al pulsar "Añadir a pantalla de inicio" o "Instalar" en tu navegador, la app se comporta como una aplicación nativa de iOS y Android, funcionando incluso sin conexión a Internet.
                </span>
              </div>
            </div>

            {storageEstimate && (
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <span className="font-bold block text-slate-900 dark:text-white mb-1">
                  Capacidad de Almacenamiento Local Detectada
                </span>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Espacio Utilizado: <strong>{storageEstimate.usageMB} MB</strong></span>
                  <span>Cuota Disponible: <strong>{storageEstimate.quotaMB} MB</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Action button: Request permanent storage persistence */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block">
                {isPersistedStorage
                  ? 'Persistencia Permanente Habilitada'
                  : 'Habilitar Persistencia Permanente'}
              </span>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                {isPersistedStorage
                  ? 'El sistema operativo no borrará tus datos bajo ninguna circunstancia de limpieza automática.'
                  : 'Solicita al navegador evitar la depuración de datos locales cuando quede poco espacio.'}
              </span>
            </div>

            {!isPersistedStorage && (
              <button
                onClick={handleRequestPersistence}
                disabled={persistingStatus === 'solicitando'}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-colors shrink-0"
              >
                {persistingStatus === 'solicitando' ? 'Verificando...' : 'Activar Persistencia'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
