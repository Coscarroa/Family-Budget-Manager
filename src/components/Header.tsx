import React from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Smartphone,
  Maximize2,
  FileCode2,
  Settings,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode } from '../types/finance';

interface HeaderProps {
  currentMonthYear: string;
  onMonthChange: (monthYear: string) => void;
  currencyCode: CurrencyCode;
  householdName: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  deviceMode: 'iphone' | 'fullscreen';
  onToggleDeviceMode: () => void;
  onOpenSwiftDocs: () => void;
  onOpenSettings: () => void;
  onGenerateRecurring: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthYear,
  onMonthChange,
  householdName,
  isDarkMode,
  onToggleDarkMode,
  deviceMode,
  onToggleDeviceMode,
  onOpenSwiftDocs,
  onOpenSettings,
  onGenerateRecurring,
}) => {
  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const currentMonthName = monthNames[month - 1] || 'Mes';

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const newMonthStr = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    onMonthChange(`${newYear}-${newMonthStr}`);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const newMonthStr = newMonth < 10 ? `0${newMonth}` : `${newMonth}`;
    onMonthChange(`${newYear}-${newMonthStr}`);
  };

  return (
    <header className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <span className="font-extrabold text-sm tracking-tighter">FB</span>
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
              Family Budget
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block max-w-[140px] sm:max-w-none">
              {householdName}
            </span>
          </div>
        </div>

        {/* Zone 2: Month / Cycle Navigation Segmented Control */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Mes anterior"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
            <span className="whitespace-nowrap">
              {currentMonthName} {year}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title="Mes siguiente"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Quick Recurring Sync */}
          <button
            onClick={onGenerateRecurring}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-200/50 dark:border-blue-800/40"
            title="Comprobar y generar obligaciones del mes automáticamente"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="whitespace-nowrap">Auto-Recurrentes</span>
          </button>

          {/* Swift & Xcode Docs Modal Trigger */}
          <button
            onClick={onOpenSwiftDocs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            title="Ver Arquitectura Swift 6, SwiftUI, SwiftData y Entregables Xcode"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline whitespace-nowrap">Swift & Xcode Docs</span>
          </button>

          {/* Toggle Device Frame (iPhone 16 Pro mockup vs Fullscreen) */}
          <button
            onClick={onToggleDeviceMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={deviceMode === 'iphone' ? 'Cambiar a Vista Completa (iPad/Mac)' : 'Cambiar a Vista iPhone Marco Nativo'}
            aria-label="Alternar vista de dispositivo"
          >
            {deviceMode === 'iphone' ? (
              <Maximize2 className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            ) : (
              <Smartphone className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            )}
          </button>

          {/* Dark / Light Mode Switch */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            aria-label="Alternar modo oscuro"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* Settings & Family */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Configuración de Hogar, Miembros y Moneda"
            aria-label="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
