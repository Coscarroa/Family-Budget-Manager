import React, { useState } from 'react';
import {
  Target,
  PlusCircle,
  PiggyBank,
  Calendar,
  Sparkles,
  TrendingUp,
  Trash2,
  Plus,
} from 'lucide-react';
import { CurrencyCode, FinancialGoal } from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface SavingsGoalsModuleProps {
  goals: FinancialGoal[];
  currencyCode: CurrencyCode;
  onSaveGoal: (goal: FinancialGoal) => void;
  onDeleteGoal: (id: string) => void;
  onContributeToGoal: (id: string, amount: number) => void;
}

export const SavingsGoalsModule: React.FC<SavingsGoalsModuleProps> = ({
  goals,
  currencyCode,
  onSaveGoal,
  onDeleteGoal,
  onContributeToGoal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contributeGoalId, setContributeGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');

  // Form states for new goal
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('0');
  const [targetDate, setTargetDate] = useState('2027-12-31');
  const [category, setCategory] = useState('Ahorro general');
  const [notes, setNotes] = useState('');

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const totalTarget = goals.reduce((acc, g) => acc + g.targetAmount, 0);
  const totalSaved = goals.reduce((acc, g) => acc + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const tAmount = parseFloat(targetAmount);
    const cAmount = parseFloat(currentAmount) || 0;
    if (name && !isNaN(tAmount) && tAmount > 0) {
      const newGoal: FinancialGoal = {
        id: `goal-${Date.now()}`,
        name,
        targetAmount: tAmount,
        currentAmount: cAmount,
        targetDate,
        category,
        notes,
      };
      onSaveGoal(newGoal);
      setShowAddModal(false);
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      setNotes('');
    }
  };

  const handleContribute = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(contributionAmount);
    if (contributeGoalId && !isNaN(parsed) && parsed > 0) {
      onContributeToGoal(contributeGoalId, parsed);
      setContributeGoalId(null);
      setContributionAmount('');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            Objetivos de Ahorro Familiar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Metas financieras para el patrimonio del hogar y proyectos compartidos
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nuevo Objetivo de Ahorro</span>
        </button>
      </div>

      {/* Aggregate Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Meta Total Acumulada
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(totalTarget)}
          </span>
          <span className="text-[11px] text-slate-400">{goals.length} metas activas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Capital Ahorrado
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1 tabular-nums">
            {format(totalSaved)}
          </span>
          <span className="text-[11px] text-emerald-500">{overallPercentage.toFixed(1)}% completado</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Capital Restante por Recaudar
          </span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 block mt-1 tabular-nums">
            {format(Math.max(0, totalTarget - totalSaved))}
          </span>
          <span className="text-[11px] text-purple-500">Por aportar en familia</span>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percentage = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
          return (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{goal.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{goal.category}</span>
                    <span>·</span>
                    <span>Meta: {goal.targetDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Eliminar meta"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Progress and Numbers */}
              <div className="flex items-baseline justify-between text-xs pt-1">
                <span className="text-slate-500">
                  Ahorrado: <strong className="text-emerald-600 dark:text-emerald-400 tabular-nums">{format(goal.currentAmount)}</strong>
                </span>
                <span className="text-slate-500">
                  Objetivo: <strong className="text-slate-900 dark:text-white tabular-nums">{format(goal.targetAmount)}</strong>
                </span>
              </div>

              <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, percentage)}%` }}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {percentage.toFixed(1)}% completado
                </span>

                <button
                  onClick={() => setContributeGoalId(goal.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aportar</span>
                </button>
              </div>

              {goal.notes && (
                <p className="text-xs text-slate-400 italic pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  "{goal.notes}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Contribute Modal */}
      {contributeGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleContribute}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Aportar a Meta de Ahorro
            </h3>
            <p className="text-xs text-slate-500">
              Registra un depósito o traspaso de ahorro familiar para este fondo.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Monto del Aporte ({currencyCode})
              </label>
              <input
                type="number"
                step="1"
                min="1"
                required
                autoFocus
                placeholder="200"
                value={contributionAmount}
                onChange={(e) => setContributionAmount(e.target.value)}
                className="w-full px-3 py-2 text-base font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setContributeGoalId(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Registrar Aporte
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateGoal}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-3.5"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Nuevo Objetivo de Ahorro Familiar
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Nombre de la Meta
              </label>
              <input
                type="text"
                required
                placeholder="ej: Vacaciones Verano 2027, Fondo de Emergencia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Monto Objetivo ({currencyCode})
                </label>
                <input
                  type="number"
                  step="1"
                  required
                  placeholder="5000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Ahorrado Inicialmente
                </label>
                <input
                  type="number"
                  step="1"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Ahorro general">Ahorro general</option>
                  <option value="Fondo de emergencia">Fondo de emergencia</option>
                  <option value="Vivienda">Vivienda</option>
                  <option value="Vehículos">Vehículos</option>
                  <option value="Vacaciones">Vacaciones</option>
                  <option value="Educación">Educación</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                Notas
              </label>
              <input
                type="text"
                placeholder="Notas u observaciones de la meta"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
              >
                Crear Meta
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
