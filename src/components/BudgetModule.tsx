import React, { useState } from 'react';
import {
  PieChart,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Edit2,
  Trash2,
} from 'lucide-react';
import {
  CurrencyCode,
  BudgetLimit,
  VariableExpense,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface BudgetModuleProps {
  budgets: BudgetLimit[];
  variableExpenses: VariableExpense[];
  currencyCode: CurrencyCode;
  monthYear: string;
  onSaveBudgetLimit: (category: string, monthlyLimit: number) => void;
  onDeleteBudgetLimit: (id: string) => void;
}

export const BudgetModule: React.FC<BudgetModuleProps> = ({
  budgets,
  variableExpenses,
  currencyCode,
  monthYear,
  onSaveBudgetLimit,
  onDeleteBudgetLimit,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState('');
  const [limitInput, setLimitInput] = useState('');

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const budgetStatuses = FinancialCalculatorService.calculateCategoryBudgets(
    budgets,
    variableExpenses,
    monthYear
  );

  const totalBudgeted = budgetStatuses.reduce((acc, b) => acc + b.limit, 0);
  const totalSpent = budgetStatuses.reduce((acc, b) => acc + b.spent, 0);
  const totalRemaining = Math.max(0, totalBudgeted - totalSpent);
  const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  const handleOpenAdd = (category?: string, currentLimit?: number) => {
    setEditingCategory(category || 'Supermercado');
    setLimitInput(currentLimit ? currentLimit.toString() : '500');
    setShowAddModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(limitInput);
    if (!isNaN(parsed) && parsed > 0 && editingCategory) {
      onSaveBudgetLimit(editingCategory, parsed);
      setShowAddModal(false);
    }
  };

  const AVAILABLE_CATEGORIES = [
    'Supermercado',
    'Combustible',
    'Restaurantes',
    'Farmacia',
    'Salud',
    'Entretenimiento',
    'Compras personales',
    'Ropa',
    'Mantenimiento del hogar',
    'Mascotas',
    'Educación complementaria',
    'Otros',
  ];

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <PieChart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Presupuesto Familiar Mensual
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de techos de gasto y prevención de sobrecostos para {monthYear}
          </p>
        </div>

        <button
          onClick={() => handleOpenAdd()}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Fijar Límite por Categoría</span>
        </button>
      </div>

      {/* Aggregate Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Límite Presupuestado
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(totalBudgeted)}
          </span>
          <span className="text-[11px] text-slate-400">Techo máximo planificado</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Gasto Real Consumido
          </span>
          <span
            className={`text-xl font-bold block mt-1 tabular-nums ${
              overallPercentage > 100
                ? 'text-rose-600 dark:text-rose-400'
                : overallPercentage >= 80
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-indigo-600 dark:text-indigo-400'
            }`}
          >
            {format(totalSpent)}
          </span>
          <span className="text-[11px] text-slate-400">
            {overallPercentage.toFixed(1)}% consumido en conjunto
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Margen Presupuestario Restante
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1 tabular-nums">
            {format(totalRemaining)}
          </span>
          <span className="text-[11px] text-emerald-600">Espacio disponible para gastar</span>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            Consumo General del Presupuesto
          </span>
          <span className="font-bold tabular-nums text-slate-700 dark:text-slate-300">
            {format(totalSpent)} de {format(totalBudgeted)} ({overallPercentage.toFixed(1)}%)
          </span>
        </div>
        <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage >= 100
                ? 'bg-rose-500'
                : overallPercentage >= 80
                ? 'bg-amber-500'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgetStatuses.map((item) => (
          <div
            key={item.id}
            className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
              item.isOverBudget
                ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                : item.isWarning
                ? 'border-amber-300 dark:border-amber-900/60 shadow-xs'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.category}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  {item.isOverBudget ? (
                    <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Excedido por {format(item.overAmount)}
                    </span>
                  ) : item.isWarning ? (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Alerta: 80%+ alcanzado
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">
                      En rango óptimo
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenAdd(item.category, item.limit)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  title="Editar límite"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDeleteBudgetLimit(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500"
                  title="Eliminar límite"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Numbers */}
            <div className="flex items-baseline justify-between text-xs mb-2">
              <span className="text-slate-500">
                Gastado: <strong className="text-slate-900 dark:text-white tabular-nums">{format(item.spent)}</strong>
              </span>
              <span className="text-slate-500">
                Límite: <strong className="text-slate-900 dark:text-white tabular-nums">{format(item.limit)}</strong>
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  item.isOverBudget
                    ? 'bg-rose-500'
                    : item.isWarning
                    ? 'bg-amber-500'
                    : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, item.percentage)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>{item.percentage}% consumido</span>
              <span>
                {item.remaining > 0
                  ? `Quedan ${format(item.remaining)} disponibles`
                  : 'Sin saldo disponible'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Limit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 pb-safe animate-in fade-in zoom-in-95"
          >
            {/* iOS grab handle */}
            <div className="flex justify-center -mt-2 mb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Fijar Límite de Presupuesto
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Categoría
              </label>
              <select
                value={editingCategory}
                onChange={(e) => setEditingCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Límite Mensual ({currencyCode})
              </label>
              <input
                type="number"
                step="10"
                min="0"
                required
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl"
              >
                Guardar Límite
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
