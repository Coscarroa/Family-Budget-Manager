import React, { useState } from 'react';
import {
  X,
  Wallet,
  CalendarClock,
  Receipt,
  DollarSign,
  AlertCircle,
  Calendar,
  User,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import {
  CurrencyCode,
  FamilyMember,
  Income,
  FixedExpense,
  VariableExpense,
  PaymentMethod,
  IncomeCategory,
  FixedExpenseCategory,
  VariableExpenseCategory,
} from '../types/finance';

type ModalMode = 'income' | 'fixedExpense' | 'variable' | 'payment';

interface TransactionModalProps {
  initialMode: ModalMode;
  members: FamilyMember[];
  currencyCode: CurrencyCode;
  monthYear: string;
  activeFixedExpenseForPayment?: FixedExpense | null;
  onClose: () => void;
  onSaveIncome: (income: Income) => void;
  onSaveFixedExpense: (expense: FixedExpense) => void;
  onSaveVariableExpense: (expense: VariableExpense) => void;
  onRecordPayment: (expenseId: string, amount: number, method: PaymentMethod, notes?: string) => void;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  initialMode,
  members,
  currencyCode,
  monthYear,
  activeFixedExpenseForPayment,
  onClose,
  onSaveIncome,
  onSaveFixedExpense,
  onSaveVariableExpense,
  onRecordPayment,
}) => {
  const [mode, setMode] = useState<ModalMode>(initialMode);

  // Common fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return today.startsWith(monthYear) ? today : `${monthYear}-05`;
  });
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Transferencia bancaria');

  // Income specific
  const [incomeCategory, setIncomeCategory] = useState<IncomeCategory>('Salario principal');
  const [incomeFrequency, setIncomeFrequency] = useState<'unique' | 'monthly'>('monthly');
  const [incomeStatus, setIncomeStatus] = useState<'received' | 'pending'>('received');

  // Fixed Expense specific
  const [fixedCategory, setFixedCategory] = useState<FixedExpenseCategory>('Hipoteca o alquiler');
  const [isRecurringFixed, setIsRecurringFixed] = useState(true);

  // Variable Expense specific
  const [variableCategory, setVariableCategory] = useState<VariableExpenseCategory>('Supermercado');
  const [isExtraordinary, setIsExtraordinary] = useState(false);

  // Payment specific (for activeFixedExpenseForPayment)
  const [paymentAmount, setPaymentAmount] = useState(() => {
    if (activeFixedExpenseForPayment) {
      return (
        activeFixedExpenseForPayment.expectedAmount - activeFixedExpenseForPayment.actualPaidAmount
      ).toString();
    }
    return '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);

    if (mode === 'payment') {
      const pAmt = parseFloat(paymentAmount);
      if (activeFixedExpenseForPayment && !isNaN(pAmt) && pAmt > 0) {
        onRecordPayment(activeFixedExpenseForPayment.id, pAmt, paymentMethod, notes);
        onClose();
      }
      return;
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    if (mode === 'income') {
      const newIncome: Income = {
        id: `inc-${Date.now()}`,
        description,
        amount: parsedAmount,
        category: incomeCategory,
        recipientMemberId: memberId,
        date,
        frequency: incomeFrequency,
        status: incomeStatus,
        isRecurring: incomeFrequency === 'monthly',
        monthYear,
        notes,
      };
      onSaveIncome(newIncome);
      onClose();
    } else if (mode === 'fixedExpense') {
      const newFixed: FixedExpense = {
        id: `fix-${Date.now()}`,
        name: description,
        category: fixedCategory,
        expectedAmount: parsedAmount,
        actualPaidAmount: 0,
        dueDate: date,
        monthYear,
        frequency: 'monthly',
        paymentMethod,
        responsibleMemberId: memberId,
        status: 'pending',
        notes,
        payments: [],
      };
      onSaveFixedExpense(newFixed);
      onClose();
    } else if (mode === 'variable') {
      const newVar: VariableExpense = {
        id: `var-${Date.now()}`,
        description,
        amount: parsedAmount,
        category: isExtraordinary ? 'Extraordinario' : variableCategory,
        date,
        monthYear,
        memberId,
        paymentMethod,
        isExtraordinary,
        notes,
      };
      onSaveVariableExpense(newVar);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-black/60 backdrop-blur-sm sm:p-4 overflow-y-auto">
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 space-y-4 max-h-[92vh] sm:max-h-[85vh] overflow-y-auto no-scrollbar ios-sheet-slide-up"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
      >
        {/* iPhone Drag handle affordance */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto sm:hidden -mt-1 mb-2" />

        {/* Header & Close */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            {mode === 'payment'
              ? 'Registrar Pago / Abono a Obligación'
              : mode === 'income'
              ? 'Registrar Nuevo Ingreso'
              : mode === 'fixedExpense'
              ? 'Nueva Obligación Fija Mensual'
              : 'Registrar Gasto Cotidiano'}
          </h3>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector (if not in direct payment mode) */}
        {initialMode !== 'payment' && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('variable')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'variable'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Gasto Variable</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('fixedExpense')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'fixedExpense'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Gasto Fijo</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('income')}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                mode === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Ingreso</span>
            </button>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'payment' && activeFixedExpenseForPayment && (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 space-y-1 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white block">
                {activeFixedExpenseForPayment.name}
              </span>
              <span className="text-slate-500 block">
                Total factura: ${activeFixedExpenseForPayment.expectedAmount.toFixed(2)} · Ya abonado: $
                {activeFixedExpenseForPayment.actualPaidAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Description / Name */}
          {mode !== 'payment' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {mode === 'income' ? 'Concepto del Ingreso' : 'Descripción / Nombre'}
              </label>
              <input
                type="text"
                required
                placeholder={
                  mode === 'income'
                    ? 'ej: Salario Nómina, Cobro Freelance'
                    : mode === 'fixedExpense'
                    ? 'ej: Hipoteca, Electricidad CFE, Seguro'
                    : 'ej: Compra Supermercado, Gasolina'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {/* Amount and Date Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {mode === 'payment' ? 'Monto a Abonar' : 'Monto'} ({currencyCode})
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="150.00"
                value={mode === 'payment' ? paymentAmount : amount}
                onChange={(e) =>
                  mode === 'payment' ? setPaymentAmount(e.target.value) : setAmount(e.target.value)
                }
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {mode === 'fixedExpense' ? 'Fecha de Vencimiento' : 'Fecha de Registro'}
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category Dropdowns */}
          {mode === 'income' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoría
                </label>
                <select
                  value={incomeCategory}
                  onChange={(e) => setIncomeCategory(e.target.value as IncomeCategory)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="Salario principal">Salario principal</option>
                  <option value="Salario cónyuge">Salario cónyuge</option>
                  <option value="Trabajo independiente">Trabajo independiente</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Alquileres">Alquileres</option>
                  <option value="Negocios">Negocios</option>
                  <option value="Inversiones">Inversiones</option>
                  <option value="Otros ingresos">Otros ingresos</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Estado
                </label>
                <select
                  value={incomeStatus}
                  onChange={(e) => setIncomeStatus(e.target.value as 'received' | 'pending')}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="received">Ya Recibido (en cuenta)</option>
                  <option value="pending">Pendiente de cobro</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'fixedExpense' && (
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Categoría de Obligación
              </label>
              <select
                value={fixedCategory}
                onChange={(e) => setFixedCategory(e.target.value as FixedExpenseCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Hipoteca o alquiler">Hipoteca o alquiler</option>
                <option value="Electricidad">Electricidad</option>
                <option value="Agua">Agua</option>
                <option value="Gas">Gas</option>
                <option value="Internet">Internet</option>
                <option value="Teléfono móvil">Teléfono móvil</option>
                <option value="Seguro del automóvil">Seguro del automóvil</option>
                <option value="Seguro médico">Seguro médico</option>
                <option value="Préstamos">Préstamos</option>
                <option value="Tarjetas de crédito">Tarjetas de crédito</option>
                <option value="Vehículos">Vehículos</option>
                <option value="Guardería o educación">Guardería o educación</option>
                <option value="Suscripciones">Suscripciones</option>
                <option value="Otros compromisos">Otros compromisos</option>
              </select>
            </div>
          )}

          {mode === 'variable' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Categoría
                </label>
                <select
                  value={variableCategory}
                  onChange={(e) => setVariableCategory(e.target.value as VariableExpenseCategory)}
                  disabled={isExtraordinary}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white disabled:opacity-50"
                >
                  <option value="Supermercado">Supermercado</option>
                  <option value="Combustible">Combustible</option>
                  <option value="Restaurantes">Restaurantes</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Salud">Salud</option>
                  <option value="Farmacia">Farmacia</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Compras personales">Compras personales</option>
                  <option value="Ropa">Ropa</option>
                  <option value="Mantenimiento del hogar">Mantenimiento del hogar</option>
                  <option value="Mascotas">Mascotas</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>

              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={isExtraordinary}
                    onChange={(e) => setIsExtraordinary(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-0"
                  />
                  <span>Gasto Extraordinario</span>
                </label>
              </div>
            </div>
          )}

          {/* Member and Payment Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                {mode === 'income' ? 'Persona que Recibe' : 'Persona Responsable'}
              </label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="Transferencia bancaria">Transferencia bancaria</option>
                <option value="Tarjeta de débito">Tarjeta de débito</option>
                <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                <option value="Domiciliación bancaria">Domiciliación bancaria</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Notas Adicionales (Opcional)
            </label>
            <input
              type="text"
              placeholder="Detalles, número de comprobante o referencia..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {/* Submit and Cancel */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              {mode === 'payment' ? 'Confirmar Abono' : 'Guardar Registro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
