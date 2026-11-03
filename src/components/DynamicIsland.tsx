import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, TrendingUp, Sparkles, ChevronDown } from 'lucide-react';
import { CurrencyCode } from '../types/finance';
import { FinancialCalculatorService } from '../services/financialCalculations';

interface DynamicIslandProps {
  availableBalance: number;
  overdueCount: number;
  upcomingCount: number;
  currencyCode: CurrencyCode;
}

export const DynamicIsland: React.FC<DynamicIslandProps> = ({
  availableBalance,
  overdueCount,
  upcomingCount,
  currencyCode,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const format = (val: number) => FinancialCalculatorService.formatCurrency(val, currencyCode);

  return (
    <div className="flex justify-center pt-2 pb-1 relative z-30">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`bg-black text-white rounded-full transition-all duration-300 ease-out shadow-lg shadow-black/30 flex items-center justify-between cursor-pointer border border-white/10 ${
          isExpanded
            ? 'w-[90%] sm:w-96 px-5 py-3 rounded-3xl'
            : 'w-48 sm:w-56 h-7 px-3.5'
        }`}
      >
        {!isExpanded ? (
          <>
            {/* Left slot */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tabular-nums">{format(availableBalance)}</span>
            </div>

            {/* Right slot */}
            <div className="flex items-center gap-1 text-[10px] text-slate-300">
              {overdueCount > 0 ? (
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{overdueCount} vencida</span>
                </span>
              ) : upcomingCount > 0 ? (
                <span className="text-amber-300">{upcomingCount} por vencer</span>
              ) : (
                <span className="text-slate-400 flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  <span>Al día</span>
                </span>
              )}
            </div>
          </>
        ) : (
          /* Expanded Island View */
          <div className="w-full space-y-2 text-left">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-1.5">
              <span className="font-semibold text-white">Dynamic Island · Estado Familiar</span>
              <span className="text-[10px]">Toca para contraer</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 block">Balance Disponible Líquido</span>
                <span className="text-base font-extrabold text-emerald-400 tabular-nums">
                  {format(availableBalance)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Alertas de Vencimiento</span>
                <span
                  className={`text-xs font-bold ${
                    overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {overdueCount > 0 ? `${overdueCount} Facturas Vencidas` : 'Todas las facturas al día'}
                </span>
              </div>
            </div>
          </div>
        )}
      </button>
    </div>
  );
};
