import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  CreditCard,
  PiggyBank,
  ArrowRight,
  ShieldAlert,
  CalendarCheck,
  ChevronRight,
  Info,
  PieChart,
} from 'lucide-react';
import {
  CurrencyCode,
  MonthFinancialSummary,
  FixedExpense,
  ActiveTab,
  BudgetLimit,
  VariableExpense,
  AppLanguage,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';
import { getTranslation } from '../services/i18n';
import { Camera } from 'lucide-react';

interface DashboardModuleProps {
  language: AppLanguage;
  summary: MonthFinancialSummary;
  currencyCode: CurrencyCode;
  monthYear: string;
  overdueExpenses: FixedExpense[];
  upcomingExpenses: FixedExpense[];
  budgets: BudgetLimit[];
  variableExpenses: VariableExpense[];
  onNavigateTab: (tab: ActiveTab) => void;
  onOpenNewTransaction: (defaultType: 'income' | 'fixedExpense' | 'variable') => void;
  onPayFixedExpense: (expense: FixedExpense) => void;
  onOpenScanReceipt: () => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  language,
  summary,
  currencyCode,
  monthYear,
  overdueExpenses,
  upcomingExpenses,
  budgets,
  variableExpenses,
  onNavigateTab,
  onOpenNewTransaction,
  onPayFixedExpense,
  onOpenScanReceipt,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  // Calculate category budget status
  const budgetStatuses = FinancialCalculatorService.calculateCategoryBudgets(
    budgets,
    variableExpenses,
    monthYear
  );

  const warningBudgets = budgetStatuses.filter((b) => b.isWarning);
  const overBudgets = budgetStatuses.filter((b) => b.isOverBudget);

  return (
    <div className="space-y-4 sm:space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Critical Alert Banners (if any bills overdue or budgets exceeded) */}
      {(overdueExpenses.length > 0 || overBudgets.length > 0) && (
        <div className="space-y-2">
          {overdueExpenses.map((exp) => (
            <div
              key={exp.id}
              className="flex items-center justify-between p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-800 dark:text-rose-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                      Factura Vencida
                    </span>
                    <span className="text-xs text-rose-500">· Venció el {exp.dueDate}</span>
                  </div>
                  <p className="text-sm font-semibold text-rose-900 dark:text-rose-100">
                    {exp.name} — Pendiente {format(exp.expectedAmount - exp.actualPaidAmount)}
                  </p>
                </div>
              </div>

              <button
                onClick={() => onPayFixedExpense(exp)}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors shrink-0 shadow-sm"
              >
                Pagar Ahora
              </button>
            </div>
          ))}

          {overBudgets.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl text-amber-800 dark:text-amber-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-300 shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      Presupuesto Excedido (100%+)
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      · Excedido por {format(b.overAmount)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {b.category}: {format(b.spent)} de {format(b.limit)} ({b.percentage}%)
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('budget')}
                className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 rounded-xl transition-colors shrink-0"
              >
                Ver Límite
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Hero Card: Available Balance & Financial Position */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-blue-100 text-xs font-medium">
              <span>Balance Disponible Efectivo</span>
              <span className="text-blue-200/60">·</span>
              <span className="text-[11px] bg-white/10 px-2 py-0.5 rounded-full font-mono">
                Ingresos Recibidos - Gastos Ejecutados
              </span>
            </div>
            <div className="text-3xl sm:text-5xl font-extrabold tracking-tight tabular-nums break-words">
              {format(summary.availableBalance)}
            </div>
            <p className="text-xs text-blue-100 max-w-md leading-relaxed">
              Dinero en cuenta disponible ahora. No descuenta dos veces tus gastos pendientes, protegiendo tu liquidez.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
            <button
              onClick={onOpenScanReceipt}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-blue-800 hover:bg-blue-50 font-bold text-xs shadow-md transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Camera className="w-4 h-4 text-blue-600" />
              <span>{t('scan_receipt_btn')}</span>
            </button>
            <button
              onClick={() => onOpenNewTransaction('variable')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-500/40 hover:bg-blue-500/50 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('registrar_gasto')}</span>
            </button>
            <button
              onClick={() => onOpenNewTransaction('income')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-blue-500/25 hover:bg-blue-500/35 text-white font-semibold text-xs border border-white/20 backdrop-blur-xs transition-colors cursor-pointer shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('registrar_ingreso')}</span>
            </button>
          </div>
        </div>

        {/* Micro Sub-Stats Strip inside Hero */}
        <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <span className="text-[11px] text-blue-200 block font-medium">Ingresos Recibidos</span>
            <span className="text-lg font-bold tabular-nums text-white block mt-0.5">
              {format(summary.totalIncomeReceived)}
            </span>
            <span className="text-[10px] text-blue-200/80">
              {summary.totalIncomePending > 0
                ? `+ ${format(summary.totalIncomePending)} pendientes`
                : '100% cobrados'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-blue-200 block font-medium">Gastos Ejecutados</span>
            <span className="text-lg font-bold tabular-nums text-white block mt-0.5">
              {format(summary.totalExpensesExecuted)}
            </span>
            <span className="text-[10px] text-blue-200/80">Fijos pagados + variables</span>
          </div>

          <div>
            <span className="text-[11px] text-blue-200 block font-medium">Gastos Comprometidos</span>
            <span className="text-lg font-bold tabular-nums text-white block mt-0.5">
              {format(summary.committedExpenses)}
            </span>
            <span className="text-[10px] text-blue-200/80">
              {summary.percentageIncomeCommitted}% de los ingresos
            </span>
          </div>

          <div>
            <span className="text-[11px] text-blue-200 block font-medium">Tasa de Ahorro</span>
            <span className="text-lg font-bold tabular-nums text-emerald-300 block mt-0.5">
              {summary.savingsRate}%
            </span>
            <span className="text-[10px] text-blue-200/80">
              {format(summary.availableBalance)} ahorrado este mes
            </span>
          </div>
        </div>
      </div>

      {/* Comparison Banner with Previous Month */}
      {summary.prevMonthComparison && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Comportamiento frente al mes anterior:
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs tabular-nums">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Ingresos:</span>
              <span
                className={`font-bold flex items-center ${
                  summary.prevMonthComparison.incomeChangePercent >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {summary.prevMonthComparison.incomeChangePercent >= 0 ? '+' : ''}
                {summary.prevMonthComparison.incomeChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Gastos:</span>
              <span
                className={`font-bold flex items-center ${
                  summary.prevMonthComparison.expensesChangePercent <= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {summary.prevMonthComparison.expensesChangePercent >= 0 ? '+' : ''}
                {summary.prevMonthComparison.expensesChangePercent.toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Ahorro:</span>
              <span
                className={`font-bold flex items-center ${
                  summary.prevMonthComparison.savingsChangePercent >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {summary.prevMonthComparison.savingsChangePercent >= 0 ? '+' : ''}
                {summary.prevMonthComparison.savingsChangePercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Grid of 4 Detailed Financial Pillar Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ingresos Totales */}
        <div
          onClick={() => onNavigateTab('incomes')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all ios-pressable group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ingresos del Mes
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {format(summary.totalIncomeExpected)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Cobrado: {format(summary.totalIncomeReceived)}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 2: Gastos Fijos (Prioritario) */}
        <div
          onClick={() => onNavigateTab('fixedExpenses')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all ios-pressable group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Obligaciones Fijas
            </span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {format(summary.fixedExpensesTotalExpected)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>
              Pagado: {format(summary.fixedExpensesPaid)} · Pendiente: {format(summary.fixedExpensesPending)}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 3: Gastos Variables */}
        <div
          onClick={() => onNavigateTab('variableExpenses')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all ios-pressable group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Gastos Cotidianos
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white tabular-nums">
            {format(summary.variableExpensesTotal)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Extraordinarios: {format(summary.extraordinaryExpensesTotal)}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Card 4: Ahorro y Metas */}
        <div
          onClick={() => onNavigateTab('goals')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all ios-pressable group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Ahorro del Mes
            </span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
            {format(summary.availableBalance)}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
            <span>Tasa del {summary.savingsRate}%</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Section: Próximos Vencimientos Inmediatos & Presupuestos en Alerta */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Vencimientos */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Próximos Vencimientos (5 días)
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('fixedExpenses')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Ver todos
            </button>
          </div>

          {upcomingExpenses.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 opacity-80" />
              No tienes obligaciones pendientes en los próximos 5 días.
            </div>
          ) : (
            <div className="space-y-2.5">
              {upcomingExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900 dark:text-white">
                      {exp.name}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Vence el {exp.dueDate} · {exp.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      {format(exp.expectedAmount - exp.actualPaidAmount)}
                    </span>
                    <button
                      onClick={() => onPayFixedExpense(exp)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-100/70 dark:bg-blue-900/40 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      Pagar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado de Presupuestos (Alerta 80%) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Control de Presupuestos Clave
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('budget')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Configurar límites
            </button>
          </div>

          <div className="space-y-3">
            {budgetStatuses.slice(0, 4).map((b) => (
              <div key={b.id} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {b.category}
                  </span>
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className="text-slate-500 dark:text-slate-400">
                      {format(b.spent)} / {format(b.limit)}
                    </span>
                    <span
                      className={`font-bold ${
                        b.isOverBudget
                          ? 'text-rose-600 dark:text-rose-400'
                          : b.isWarning
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ({b.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.isOverBudget
                        ? 'bg-rose-500'
                        : b.isWarning
                        ? 'bg-amber-500'
                        : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
