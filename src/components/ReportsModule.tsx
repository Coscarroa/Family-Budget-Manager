import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  PieChart,
  TrendingUp,
  CreditCard,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  CurrencyCode,
  Income,
  FixedExpense,
  VariableExpense,
  MonthFinancialSummary,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface ReportsModuleProps {
  summary: MonthFinancialSummary;
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  currencyCode: CurrencyCode;
  monthYear: string;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  summary,
  incomes,
  fixedExpenses,
  variableExpenses,
  currencyCode,
  monthYear,
}) => {
  const [periodMode, setPeriodMode] = useState<'monthly' | 'annual'>('monthly');

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  // Group variable expenses by category
  const currentMonthVariables = variableExpenses.filter(
    (v) => v.monthYear === monthYear || v.date.startsWith(monthYear)
  );

  const categoryTotals: Record<string, number> = {};
  currentMonthVariables.forEach((v) => {
    categoryTotals[v.category] = (categoryTotals[v.category] || 0) + v.amount;
  });

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: summary.variableExpensesTotal > 0 ? (amount / summary.variableExpensesTotal) * 100 : 0,
    }));

  // Fijos vs Variables ratio
  const totalAllExpenses = summary.totalExpensesExecuted;
  const fixedRatio = totalAllExpenses > 0 ? (summary.fixedExpensesPaid / totalAllExpenses) * 100 : 0;
  const variableRatio = totalAllExpenses > 0 ? (summary.variableExpensesTotal / totalAllExpenses) * 100 : 0;

  // CSV Export Handler
  const handleExportCSV = () => {
    const rows = [
      ['Tipo', 'Descripción / Nombre', 'Categoría', 'Monto', 'Fecha / Vencimiento', 'Estado'],
      ...incomes
        .filter((i) => i.monthYear === monthYear)
        .map((i) => ['Ingreso', i.description, i.category, i.amount.toString(), i.date, i.status]),
      ...fixedExpenses
        .filter((f) => f.monthYear === monthYear)
        .map((f) => [
          'Gasto Fijo',
          f.name,
          f.category,
          f.expectedAmount.toString(),
          f.dueDate,
          f.status,
        ]),
      ...variableExpenses
        .filter((v) => v.monthYear === monthYear)
        .map((v) => [
          'Gasto Variable',
          v.description,
          v.category,
          v.amount.toString(),
          v.date,
          v.isExtraordinary ? 'Extraordinario' : 'Ejecutado',
        ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Informe_Financiero_Familia_${monthYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print / PDF Handler
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Title & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Informes Financieros y Análisis
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evolución, ratios de consumo y distribución del gasto para {monthYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Guardar PDF</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">Ingresos Recibidos</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(summary.totalIncomeReceived)}
          </span>
          <span className="text-[10px] text-emerald-500">100% liquidados en cuenta</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">Gastos Totales Ejecutados</span>
          <span className="text-lg font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(summary.totalExpensesExecuted)}
          </span>
          <span className="text-[10px] text-slate-400">Fijos + variables</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">Balance Neto Mensual</span>
          <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400 block mt-1 tabular-nums">
            {format(summary.availableBalance)}
          </span>
          <span className="text-[10px] text-emerald-500">Superávit efectivo</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-400 block">Tasa de Ahorro Real</span>
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400 block mt-1 tabular-nums">
            {summary.savingsRate}%
          </span>
          <span className="text-[10px] text-blue-500">Objetivo &gt; 20%</span>
        </div>
      </div>

      {/* Breakdown: Fijos vs Variables Visual Comparison */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Estructura del Gasto: Obligaciones Fijas vs Consumo Variable
        </h3>

        {/* Dual Bar */}
        <div className="w-full h-5 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden flex">
          <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${fixedRatio}%` }}
            title={`Gastos Fijos: ${fixedRatio.toFixed(1)}%`}
          />
          <div
            className="h-full bg-indigo-400 transition-all duration-500"
            style={{ width: `${variableRatio}%` }}
            title={`Gastos Variables: ${variableRatio.toFixed(1)}%`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600 inline-block" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Gastos Fijos Pagados: {format(summary.fixedExpensesPaid)} ({fixedRatio.toFixed(1)}%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-indigo-400 inline-block" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Gastos Variables: {format(summary.variableExpensesTotal)} ({variableRatio.toFixed(1)}%)
            </span>
          </div>
        </div>
      </div>

      {/* Top Consumed Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Principales Categorías de Consumo Variable
          </h3>

          <div className="space-y-3">
            {sortedCategories.slice(0, 6).map((item) => (
              <div key={item.category} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {item.category}
                  </span>
                  <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
                    {format(item.amount)} ({item.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${Math.min(100, item.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Flow Projection Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Proyección del Período y Salud Financiera
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Ingresos Totales Esperados:</span>
              <strong className="text-slate-900 dark:text-white tabular-nums">
                {format(summary.totalIncomeExpected)}
              </strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Gastos Totales Comprometidos:</span>
              <strong className="text-rose-600 dark:text-rose-400 tabular-nums">
                {format(summary.committedExpenses)}
              </strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-slate-500">Gasto Extraordinario No Previsto:</span>
              <strong className="text-amber-600 dark:text-amber-400 tabular-nums">
                {format(summary.extraordinaryExpensesTotal)}
              </strong>
            </div>
            <div className="flex justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Ahorro Proyectado al Cierre:
              </span>
              <strong className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {format(summary.projectedNetSavings)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
