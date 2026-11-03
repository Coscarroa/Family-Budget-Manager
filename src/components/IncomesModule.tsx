import React, { useState } from 'react';
import {
  Wallet,
  PlusCircle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  User,
  Filter,
  Check,
  Trash2,
} from 'lucide-react';
import {
  CurrencyCode,
  Income,
  FamilyMember,
  IncomeCategory,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface IncomesModuleProps {
  incomes: Income[];
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  onUpdateIncome: (income: Income) => void;
  onDeleteIncome: (id: string) => void;
  onOpenNewIncomeModal: () => void;
}

export const IncomesModule: React.FC<IncomesModuleProps> = ({
  incomes,
  members,
  currencyCode,
  monthYear,
  onUpdateIncome,
  onDeleteIncome,
  onOpenNewIncomeModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'received' | 'pending'>('all');
  const [filterMemberId, setFilterMemberId] = useState<string>('all');

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const currentMonthIncomes = incomes.filter(
    (inc) => inc.monthYear === monthYear || inc.date.startsWith(monthYear)
  );

  const totalExpected = currentMonthIncomes.reduce((acc, i) => acc + i.amount, 0);
  const totalReceived = currentMonthIncomes.reduce((acc, i) => acc + (i.status === 'received' ? i.amount : 0), 0);
  const totalPending = currentMonthIncomes.reduce((acc, i) => acc + (i.status === 'pending' ? i.amount : 0), 0);

  const filteredIncomes = currentMonthIncomes.filter((inc) => {
    if (filterStatus !== 'all' && inc.status !== filterStatus) return false;
    if (filterMemberId !== 'all' && inc.recipientMemberId !== filterMemberId) return false;
    return true;
  });

  const getMember = (id: string) => members.find((m) => m.id === id);

  const toggleIncomeStatus = (income: Income) => {
    onUpdateIncome({
      ...income,
      status: income.status === 'received' ? 'pending' : 'received',
    });
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Gestión de Ingresos Familiares
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de fuentes salariales, negocios y rentas para {monthYear}
          </p>
        </div>

        <button
          onClick={onOpenNewIncomeModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Registrar Nuevo Ingreso</span>
        </button>
      </div>

      {/* Aggregate Financial Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Ingresos Totales Proyectados
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(totalExpected)}
          </span>
          <span className="text-[11px] text-slate-400">
            {currentMonthIncomes.length} movimientos de ingreso
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Ingresos Ya Recibidos
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1 tabular-nums">
            {format(totalReceived)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            Disponible para balance
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Ingresos Pendientes de Cobro
          </span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block mt-1 tabular-nums">
            {format(totalPending)}
          </span>
          <span className="text-[11px] text-amber-600">Por recibir este período</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todos ({currentMonthIncomes.length})
          </button>
          <button
            onClick={() => setFilterStatus('received')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'received'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Recibidos
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              filterStatus === 'pending'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Pendientes
          </button>
        </div>

        {/* Member filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Miembro:</span>
          <select
            value={filterMemberId}
            onChange={(e) => setFilterMemberId(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
          >
            <option value="all">Toda la familia</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Income List */}
      <div className="space-y-3">
        {filteredIncomes.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No hay ingresos registrados con los filtros seleccionados.
            </p>
          </div>
        ) : (
          filteredIncomes.map((income) => {
            const member = getMember(income.recipientMemberId);
            return (
              <div
                key={income.id}
                className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleIncomeStatus(income)}
                    className={`w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 transition-colors cursor-pointer shrink-0 ${
                      income.status === 'received'
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                    title={income.status === 'received' ? 'Marcar como pendiente' : 'Marcar como recibido'}
                  >
                    {income.status === 'received' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {income.description}
                      </h4>

                      {income.isRecurring && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                          Recurrente ({income.frequency})
                        </span>
                      )}

                      {income.status === 'received' ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                          Recibido
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400">
                          Pendiente
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{income.category}</span>
                      <span>·</span>
                      <span>Fecha: {income.date}</span>
                      {member && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <span
                              className="w-2 h-2 rounded-full inline-block"
                              style={{ backgroundColor: member.avatarColor }}
                            />
                            {member.name}
                          </span>
                        </>
                      )}
                    </div>

                    {income.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                        "{income.notes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                    +{format(income.amount)}
                  </span>

                  <button
                    onClick={() => onDeleteIncome(income.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Eliminar ingreso"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
