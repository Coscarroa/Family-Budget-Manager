import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  ShieldAlert,
} from 'lucide-react';
import {
  CurrencyCode,
  Income,
  FixedExpense,
  VariableExpense,
} from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface CalendarModuleProps {
  incomes: Income[];
  fixedExpenses: FixedExpense[];
  variableExpenses: VariableExpense[];
  currencyCode: CurrencyCode;
  monthYear: string;
}

export const CalendarModule: React.FC<CalendarModuleProps> = ({
  incomes,
  fixedExpenses,
  variableExpenses,
  currencyCode,
  monthYear,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(new Date().getDate());

  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  const [yearStr, monthStr] = monthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  // Number of days in current month
  const daysInMonth = new Date(year, month, 0).getDate();
  // First day of week (0 = Sunday, 1 = Monday, etc.)
  const firstDayIndex = new Date(year, month - 1, 1).getDay(); // Sunday=0, Monday=1...
  // Convert to Monday-start (Monday=0 ... Sunday=6)
  const mondayOffset = (firstDayIndex + 6) % 7;

  // Filter items for current month
  const mIncomes = incomes.filter((i) => i.monthYear === monthYear || i.date.startsWith(monthYear));
  const mFixed = fixedExpenses.filter(
    (f) => (f.monthYear === monthYear || f.dueDate.startsWith(monthYear)) && !f.isSuspended
  );
  const mVariable = variableExpenses.filter((v) => v.monthYear === monthYear || v.date.startsWith(monthYear));

  // Build map of day -> items
  const dayEventsMap: Record<
    number,
    {
      incomes: Income[];
      fixedPending: FixedExpense[];
      fixedPaid: FixedExpense[];
      variable: VariableExpense[];
    }
  > = {};

  for (let d = 1; d <= daysInMonth; d++) {
    dayEventsMap[d] = { incomes: [], fixedPending: [], fixedPaid: [], variable: [] };
  }

  mIncomes.forEach((inc) => {
    const d = parseInt(inc.date.split('-')[2], 10);
    if (dayEventsMap[d]) dayEventsMap[d].incomes.push(inc);
  });

  mFixed.forEach((fix) => {
    const d = parseInt(fix.dueDate.split('-')[2], 10);
    if (dayEventsMap[d]) {
      if (fix.status === 'paid') {
        dayEventsMap[d].fixedPaid.push(fix);
      } else {
        dayEventsMap[d].fixedPending.push(fix);
      }
    }
  });

  mVariable.forEach((v) => {
    const d = parseInt(v.date.split('-')[2], 10);
    if (dayEventsMap[d]) dayEventsMap[d].variable.push(v);
  });

  const selectedDayData = dayEventsMap[selectedDay] || {
    incomes: [],
    fixedPending: [],
    fixedPaid: [],
    variable: [],
  };

  const totalDayIncome = selectedDayData.incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalDayOutflow =
    selectedDayData.fixedPaid.reduce((acc, f) => acc + f.actualPaidAmount, 0) +
    selectedDayData.fixedPending.reduce((acc, f) => acc + (f.expectedAmount - f.actualPaidAmount), 0) +
    selectedDayData.variable.reduce((acc, v) => acc + v.amount, 0);

  const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="space-y-6 pb-32 sm:pb-24 animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          Calendario Financiero Mensual
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Visualización de vencimientos, cobros y flujos programados para {monthYear}
        </p>
      </div>

      {/* Legend strip */}
      <div className="flex flex-wrap items-center gap-4 text-xs p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Ingresos</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Facturas Pendientes / Vencidas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Facturas Pagadas</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 inline-block" />
          <span className="text-slate-600 dark:text-slate-400">Gastos Cotidianos</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Matrix (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {WEEKDAYS.map((wd) => (
              <div key={wd} className="py-1">
                {wd}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {/* Empty slots for monday offset */}
            {Array.from({ length: mondayOffset }).map((_, i) => (
              <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-transparent opacity-0" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const events = dayEventsMap[dayNum];
              const isSelected = selectedDay === dayNum;
              const hasIncomes = events.incomes.length > 0;
              const hasPending = events.fixedPending.length > 0;
              const hasPaid = events.fixedPaid.length > 0;
              const hasVar = events.variable.length > 0;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(dayNum)}
                  className={`h-14 sm:h-16 p-1.5 rounded-2xl flex flex-col justify-between items-center transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-102 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-900 dark:text-white'
                  }`}
                >
                  <span className="text-xs font-semibold tabular-nums">{dayNum}</span>

                  {/* Event indicators dots */}
                  <div className="flex items-center gap-1">
                    {hasIncomes && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-emerald-300' : 'bg-emerald-500'
                        }`}
                      />
                    )}
                    {hasPending && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-rose-300' : 'bg-rose-500'
                        }`}
                      />
                    )}
                    {hasPaid && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-blue-200' : 'bg-blue-500'
                        }`}
                      />
                    )}
                    {hasVar && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-indigo-200' : 'bg-indigo-400'
                        }`}
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer (1 col) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              Agenda del Día
            </span>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {selectedDay} de {monthStr === '11' ? 'Noviembre' : monthStr} de {year}
            </h3>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
              <span>Ingresos: +{format(totalDayIncome)}</span>
              <span>Compromisos: -{format(totalDayOutflow)}</span>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto no-scrollbar">
            {/* Incomes on this day */}
            {selectedDayData.incomes.map((inc) => (
              <div
                key={inc.id}
                className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-emerald-900 dark:text-emerald-200">
                    {inc.description}
                  </span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                    +{format(inc.amount)}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-600/80 block mt-1">
                  {inc.category} · {inc.status === 'received' ? 'Recibido' : 'Pendiente'}
                </span>
              </div>
            ))}

            {/* Pending Fixed Expenses on this day */}
            {selectedDayData.fixedPending.map((fix) => (
              <div
                key={fix.id}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/50 dark:border-rose-900/40 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-rose-900 dark:text-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                    {fix.name}
                  </span>
                  <span className="font-bold text-rose-700 dark:text-rose-400 tabular-nums">
                    -{format(fix.expectedAmount - fix.actualPaidAmount)}
                  </span>
                </div>
                <span className="text-[11px] text-rose-600/80 block mt-1">
                  {fix.category} · {fix.status === 'overdue' ? 'VENCIDO' : 'Vencimiento programado'}
                </span>
              </div>
            ))}

            {/* Paid Fixed Expenses on this day */}
            {selectedDayData.fixedPaid.map((fix) => (
              <div
                key={fix.id}
                className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-blue-900 dark:text-blue-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    {fix.name}
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    -{format(fix.actualPaidAmount)}
                  </span>
                </div>
                <span className="text-[11px] text-blue-600/80 block mt-1">
                  {fix.category} · Pagado
                </span>
              </div>
            ))}

            {/* Variable expenses on this day */}
            {selectedDayData.variable.map((v) => (
              <div
                key={v.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs"
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {v.description}
                  </span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    -{format(v.amount)}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  {v.category} · {v.paymentMethod}
                </span>
              </div>
            ))}

            {selectedDayData.incomes.length === 0 &&
              selectedDayData.fixedPending.length === 0 &&
              selectedDayData.fixedPaid.length === 0 &&
              selectedDayData.variable.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Sin movimientos registrados para el día {selectedDay}.
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};
