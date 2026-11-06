import React, { useState } from 'react';
import {
  Receipt,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Calendar,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  FileText,
} from 'lucide-react';
import {
  CurrencyCode,
  VariableExpense,
  FamilyMember,
  VariableExpenseCategory,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';
import { ReceiptViewerModal } from './ReceiptViewerModal';

interface VariableExpensesModuleProps {
  variableExpenses: VariableExpense[];
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  onUpdateExpense: (expense: VariableExpense) => void;
  onDeleteExpense: (id: string) => void;
  onOpenNewExpenseModal: (isExtraordinary?: boolean) => void;
}

export const VariableExpensesModule: React.FC<VariableExpensesModuleProps> = ({
  variableExpenses,
  members,
  currencyCode,
  monthYear,
  onUpdateExpense,
  onDeleteExpense,
  onOpenNewExpenseModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [onlyExtraordinary, setOnlyExtraordinary] = useState(false);
  const [viewingReceiptExpense, setViewingReceiptExpense] = useState<VariableExpense | null>(null);

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const currentMonthExpenses = variableExpenses.filter(
    (e) => e.monthYear === monthYear || e.date.startsWith(monthYear)
  );

  const regularTotal = currentMonthExpenses
    .filter((e) => !e.isExtraordinary)
    .reduce((acc, e) => acc + e.amount, 0);

  const extraordinaryTotal = currentMonthExpenses
    .filter((e) => e.isExtraordinary)
    .reduce((acc, e) => acc + e.amount, 0);

  const total = regularTotal + extraordinaryTotal;

  const filteredExpenses = currentMonthExpenses.filter((e) => {
    if (onlyExtraordinary && !e.isExtraordinary) return false;
    if (selectedCategory !== 'all' && e.category !== selectedCategory) return false;
    if (selectedMember !== 'all' && e.memberId !== selectedMember) return false;
    if (searchTerm && !e.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const getMember = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            Gastos Variables y Cotidianos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registro diario de compras, salidas y gastos no recurrentes para {monthYear}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenNewExpenseModal(false)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Gasto Cotidiano</span>
          </button>
          <button
            onClick={() => onOpenNewExpenseModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Extraordinario</span>
          </button>
        </div>
      </div>

      {/* Aggregate Financial Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Total Variables del Mes
          </span>
          <span className="text-xl font-bold text-slate-900 dark:text-white block mt-1 tabular-nums">
            {format(total)}
          </span>
          <span className="text-[11px] text-slate-400">
            {currentMonthExpenses.length} transacciones
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Gastos Regulares (Día a Día)
          </span>
          <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block mt-1 tabular-nums">
            {format(regularTotal)}
          </span>
          <span className="text-[11px] text-indigo-500">Supermercado, combustible, etc.</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 block">
            Gastos Extraordinarios
          </span>
          <span className="text-xl font-bold text-amber-600 dark:text-amber-400 block mt-1 tabular-nums">
            {format(extraordinaryTotal)}
          </span>
          <span className="text-[11px] text-amber-600">Imprevistos y reparaciones</span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por descripción (ej: Supermercado, Gasolina)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas las categorías</option>
              <option value="Supermercado">Supermercado</option>
              <option value="Combustible">Combustible</option>
              <option value="Restaurantes">Restaurantes</option>
              <option value="Farmacia">Farmacia</option>
              <option value="Salud">Salud</option>
              <option value="Entretenimiento">Entretenimiento</option>
              <option value="Ropa">Ropa</option>
              <option value="Mantenimiento del hogar">Mantenimiento hogar</option>
              <option value="Mascotas">Mascotas</option>
              <option value="Extraordinario">Extraordinario</option>
              <option value="Otros">Otros</option>
            </select>

            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">Toda la familia</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setOnlyExtraordinary(!onlyExtraordinary)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                onlyExtraordinary
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Solo Extraordinarios
            </button>
          </div>
        </div>
      </div>

      {/* Expenses Table / Cards */}
      <div className="space-y-2.5">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              No hay movimientos que coincidan con la búsqueda.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const member = getMember(expense.memberId);
            return (
              <div
                key={expense.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {expense.description}
                    </h4>
                    {expense.isExtraordinary && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                        Extraordinario
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{expense.category}</span>
                    <span>·</span>
                    <span>{expense.date}</span>
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
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      "{expense.notes}"
                    </p>
                  )}

                  {(expense.receiptImageUrl || expense.invoiceNumber) && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingReceiptExpense(expense)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 text-[11px] font-semibold hover:bg-indigo-100 transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>
                          {expense.invoiceNumber ? `Ticket/Factura ${expense.invoiceNumber}` : 'Ver comprobante original'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    -{format(expense.amount)}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(expense.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Eliminar gasto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Receipt Viewer Modal */}
      {viewingReceiptExpense && (
        <ReceiptViewerModal
          title={viewingReceiptExpense.description}
          receiptImageUrl={viewingReceiptExpense.receiptImageUrl}
          invoiceNumber={viewingReceiptExpense.invoiceNumber}
          taxId={viewingReceiptExpense.taxId}
          amount={viewingReceiptExpense.amount}
          date={viewingReceiptExpense.date}
          category={viewingReceiptExpense.category}
          currencyCode={currencyCode}
          notes={viewingReceiptExpense.notes}
          language="es"
          onClose={() => setViewingReceiptExpense(null)}
        />
      )}
    </div>
  );
};
