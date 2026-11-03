import React, { useState } from 'react';
import {
  CalendarClock,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Clock,
  PauseCircle,
  PlayCircle,
  History,
  DollarSign,
  Edit2,
  Trash2,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';
import {
  CurrencyCode,
  FixedExpense,
  FamilyMember,
  PaymentMethod,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface FixedExpensesModuleProps {
  fixedExpenses: FixedExpense[];
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  onUpdateExpense: (expense: FixedExpense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenNewExpenseModal: () => void;
  onOpenPaymentModal: (expense: FixedExpense) => void;
}

export const FixedExpensesModule: React.FC<FixedExpensesModuleProps> = ({
  fixedExpenses,
  members,
  currencyCode,
  monthYear,
  onUpdateExpense,
  onDeleteExpense,
  onOpenNewExpenseModal,
  onOpenPaymentModal,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExpenseForHistory, setSelectedExpenseForHistory] = useState<FixedExpense | null>(null);
  const [editingExpenseAmountId, setEditingExpenseAmountId] = useState<string | null>(null);
  const [newAmountInput, setNewAmountInput] = useState<string>('');

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  // Month filtering
  const currentMonthExpenses = fixedExpenses.filter(
    (e) => e.monthYear === monthYear || e.dueDate.startsWith(monthYear)
  );

  const totalExpected = currentMonthExpenses.reduce((acc, e) => acc + (e.isSuspended ? 0 : e.expectedAmount), 0);
  const totalPaid = currentMonthExpenses.reduce((acc, e) => acc + (e.isSuspended ? 0 : e.actualPaidAmount), 0);
  const totalPending = Math.max(0, totalExpected - totalPaid);

  // Status counters
  const overdueCount = currentMonthExpenses.filter((e) => e.status === 'overdue').length;
  const pendingCount = currentMonthExpenses.filter((e) => e.status === 'pending' || e.status === 'partial').length;
  const paidCount = currentMonthExpenses.filter((e) => e.status === 'paid').length;

  const filteredExpenses = currentMonthExpenses.filter((e) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'overdue') return e.status === 'overdue';
    if (filterStatus === 'pending') return e.status === 'pending' || e.status === 'partial';
    if (filterStatus === 'paid') return e.status === 'paid';
    if (filterStatus === 'suspended') return e.isSuspended;
    return true;
  });

  const getMember = (id: string) => members.find((m) => m.id === id);

  const toggleStatusPaid = (expense: FixedExpense) => {
    if (expense.status === 'paid') {
      // Reabrir
      onUpdateExpense({
        ...expense,
        status: 'pending',
        actualPaidAmount: 0,
        paidDate: undefined,
        payments: [],
      });
    } else {
      // Marcar pagado completo
      const fullAmount = expense.expectedAmount;
      const today = new Date().toISOString().split('T')[0];
      const newPayment = {
        id: `pay-${Date.now()}`,
        amount: fullAmount - expense.actualPaidAmount,
        date: today,
        method: expense.paymentMethod,
        notes: 'Pago completo registrado',
      };
      onUpdateExpense({
        ...expense,
        status: 'paid',
        actualPaidAmount: fullAmount,
        paidDate: today,
        payments: [...expense.payments, newPayment],
      });
    }
  };

  const toggleSuspension = (expense: FixedExpense) => {
    onUpdateExpense({
      ...expense,
      isSuspended: !expense.isSuspended,
    });
  };

  const handleStartEditAmount = (expense: FixedExpense) => {
    setEditingExpenseAmountId(expense.id);
    setNewAmountInput(expense.expectedAmount.toString());
  };

  const handleSaveEditedAmount = (expense: FixedExpense) => {
    const parsed = parseFloat(newAmountInput);
    if (!isNaN(parsed) && parsed >= 0) {
      onUpdateExpense({
        ...expense,
        expectedAmount: parsed,
        // recalculate status if paid amount is affected
        status: expense.actualPaidAmount >= parsed ? 'paid' : (expense.actualPaidAmount > 0 ? 'partial' : expense.status),
      });
    }
    setEditingExpenseAmountId(null);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Module Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Gastos Fijos y Obligaciones
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control de vencimientos recurrentes del hogar para {monthYear}
          </p>
        </div>

        <button
          onClick={onOpenNewExpenseModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Obligación Fija</span>
        </button>
      </div>

      {/* Aggregate Financial Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Obligaciones Esperadas
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(totalExpected)}
          </span>
          <span className="text-[11px] text-slate-400">
            {currentMonthExpenses.length} compromisos registrados
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Pagado Efectivamente
          </span>
          <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block mt-1 tabular-nums">
            {format(totalPaid)}
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
            {paidCount} facturas liquidadas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Saldo Pendiente por Pagar
          </span>
          <span className="text-xl font-bold text-rose-600 dark:text-rose-400 block mt-1 tabular-nums">
            {format(totalPending)}
          </span>
          <span className="text-[11px] text-rose-500">
            {overdueCount > 0 ? `${overdueCount} vencidas prioritarias` : `${pendingCount} por pagar`}
          </span>
        </div>
      </div>

      {/* Segmented Filter Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-x-auto no-scrollbar">
        {[
          { id: 'all', label: `Todos (${currentMonthExpenses.length})` },
          { id: 'overdue', label: `Vencidos (${overdueCount})`, isAlert: overdueCount > 0 },
          { id: 'pending', label: `Pendientes / Parcial (${pendingCount})` },
          { id: 'paid', label: `Pagados (${paidCount})` },
          { id: 'suspended', label: 'Suspendidos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              filterStatus === tab.id
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-semibold'
                : tab.isAlert
                ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fixed Expenses List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No hay obligaciones fijas con este filtro.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const member = getMember(expense.responsibleMemberId);
            const pendingAmount = Math.max(0, expense.expectedAmount - expense.actualPaidAmount);
            const isEditing = editingExpenseAmountId === expense.id;

            return (
              <div
                key={expense.id}
                className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  expense.isSuspended
                    ? 'opacity-60 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950'
                    : expense.status === 'overdue'
                    ? 'border-rose-300 dark:border-rose-900/60 shadow-xs'
                    : expense.status === 'paid'
                    ? 'border-slate-200 dark:border-slate-800/80'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggleStatusPaid(expense)}
                      disabled={expense.isSuspended}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center mt-0.5 transition-colors cursor-pointer shrink-0 ${
                        expense.status === 'paid'
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-blue-500'
                      }`}
                      title={expense.status === 'paid' ? 'Marcar como pendiente' : 'Marcar como pagado'}
                    >
                      {expense.status === 'paid' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm font-bold text-slate-900 dark:text-white ${
                            expense.status === 'paid' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {expense.name}
                        </h4>

                        {/* Status Badges */}
                        {expense.isSuspended ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            Suspendido
                          </span>
                        ) : expense.status === 'overdue' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" />
                            Vencido
                          </span>
                        ) : expense.status === 'partial' ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                            Pago Parcial ({format(expense.actualPaidAmount)})
                          </span>
                        ) : expense.status === 'paid' ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                            Pagado {expense.paidDate ? `el ${expense.paidDate}` : ''}
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            Pendiente
                          </span>
                        )}
                      </div>

                      {/* Metadata row without pills */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span>{expense.category}</span>
                        <span>·</span>
                        <span>Vence: {expense.dueDate}</span>
                        <span>·</span>
                        <span>{expense.paymentMethod}</span>
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

                      {expense.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 italic">
                          "{expense.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amounts & Quick Actions */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2">
                    {/* Amount edit block */}
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          step="0.01"
                          value={newAmountInput}
                          onChange={(e) => setNewAmountInput(e.target.value)}
                          className="w-24 px-2 py-1 text-xs border border-blue-500 rounded bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveEditedAmount(expense)}
                          className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingExpenseAmountId(null)}
                          className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                            {format(expense.expectedAmount)}
                          </span>
                          <button
                            onClick={() => handleStartEditAmount(expense)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Modificar importe para este mes sin alterar el histórico anterior"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        {pendingAmount > 0 && expense.status !== 'pending' && (
                          <span className="text-[11px] text-rose-500 font-medium block">
                            Resta por pagar: {format(pendingAmount)}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      {expense.status !== 'paid' && !expense.isSuspended && (
                        <button
                          onClick={() => onOpenPaymentModal(expense)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg transition-colors"
                        >
                          Abonar / Parcial
                        </button>
                      )}

                      {expense.payments && expense.payments.length > 0 && (
                        <button
                          onClick={() => setSelectedExpenseForHistory(expense)}
                          className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          title="Ver historial de pagos de esta factura"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => toggleSuspension(expense)}
                        className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        title={expense.isSuspended ? 'Reanudar obligación' : 'Suspender temporalmente'}
                      >
                        {expense.isSuspended ? (
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <PauseCircle className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>

                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                        title="Eliminar gasto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Progress bar for partial payments */}
                {expense.actualPaidAmount > 0 && expense.actualPaidAmount < expense.expectedAmount && (
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Progreso de pago: {format(expense.actualPaidAmount)} abonados</span>
                      <span>{Math.round((expense.actualPaidAmount / expense.expectedAmount) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${(expense.actualPaidAmount / expense.expectedAmount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Payment History Modal */}
      {selectedExpenseForHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Historial de Pagos
                </h3>
                <p className="text-xs text-slate-500">{selectedExpenseForHistory.name}</p>
              </div>
              <button
                onClick={() => setSelectedExpenseForHistory(null)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {selectedExpenseForHistory.payments.map((p, idx) => (
                <div
                  key={p.id || idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {format(p.amount)}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {p.date} · {p.method}
                    </span>
                    {p.notes && <p className="text-[10px] text-slate-400 mt-0.5">{p.notes}</p>}
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 rounded">
                    Abonado
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-bold">
              <span>Total Abonado:</span>
              <span className="text-emerald-600 dark:text-emerald-400">
                {format(selectedExpenseForHistory.actualPaidAmount)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
