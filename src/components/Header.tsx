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
  Camera,
  Languages,
  LogOut,
  User,
  GraduationCap,
} from 'lucide-react';
import { CurrencyCode, AppLanguage, FamilyMember } from '../types/finance';
import { getTranslation } from '../services/i18n';

interface HeaderProps {
  currentMonthYear: string;
  onMonthChange: (monthYear: string) => void;
  currencyCode: CurrencyCode;
  householdName: string;
  language: AppLanguage;
  onLanguageChange: (lang: AppLanguage) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  deviceMode: 'iphone' | 'fullscreen';
  onToggleDeviceMode: () => void;
  onOpenSwiftDocs: () => void;
  onOpenSettings: () => void;
  onOpenScanReceipt: () => void;
  onGenerateRecurring: () => void;
  onOpenTraining?: () => void;
  currentUser?: FamilyMember | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonthYear,
  onMonthChange,
  householdName,
  language,
  onLanguageChange,
  isDarkMode,
  onToggleDarkMode,
  deviceMode,
  onToggleDeviceMode,
  onOpenSwiftDocs,
  onOpenSettings,
  onGenerateRecurring,
  onOpenScanReceipt,
  onOpenTraining,
  currentUser,
  onLogout,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  // Parse YYYY-MM
  const [yearStr, monthStr] = currentMonthYear.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const monthNamesEs = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const currentMonthName = language === 'en'
    ? monthNamesEn[month - 1] || 'Month'
    : monthNamesEs[month - 1] || 'Mes';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3 md:gap-6">
        {/* Zone 1: Brand Wordmark with Official App Icon */}
        <div className="flex items-center gap-2.5 shrink-0">
          <img
            src="/app-icon.png"
            alt="Family Budget Icon"
            className="w-9 h-9 rounded-xl shadow-xs shadow-blue-500/20 object-cover border border-slate-200/60 dark:border-slate-700/60"
          />
          <div>
            <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block leading-tight">
              {t('brand_title')}
            </span>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate block max-w-[120px] sm:max-w-none">
              {householdName}
            </span>
          </div>
        </div>

        {/* Zone 2: Month / Cycle Navigation Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 shadow-inner shrink-0">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title={t('mes_anterior')}
            aria-label={t('mes_anterior')}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 text-xs font-semibold text-slate-800 dark:text-slate-200">
            <CalendarIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span className="whitespace-nowrap sm:hidden">
              {currentMonthName.slice(0, 3)} '{year.toString().slice(-2)}
            </span>
            <span className="whitespace-nowrap hidden sm:inline">
              {currentMonthName} {year}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
            title={t('mes_siguiente')}
            aria-label={t('mes_siguiente')}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Scan Receipt with Photo Button */}
          <button
            onClick={onOpenScanReceipt}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 shrink-0 min-h-[36px]"
            title={t('scanner_title')}
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden md:inline whitespace-nowrap">{t('scan_receipt_btn')}</span>
          </button>

          {/* Quick Recurring Sync */}
          <button
            onClick={onGenerateRecurring}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors border border-blue-200/50 dark:border-blue-800/40"
            title="Auto-Sync"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span className="whitespace-nowrap">{t('auto_recurrentes')}</span>
          </button>

          {/* Language Selector: ES / EN */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold">
            <button
              onClick={() => onLanguageChange('es')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                language === 'es'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          {/* Training & Education Guide */}
          {onOpenTraining && (
            <button
              onClick={onOpenTraining}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-lg transition-colors border border-amber-200 dark:border-amber-800 cursor-pointer"
              title="Instructivo & Consejos Financieros"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline whitespace-nowrap">Capacitación</span>
            </button>
          )}

          {/* Swift & Xcode Docs Modal Trigger */}
          <button
            onClick={onOpenSwiftDocs}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
            title="Swift 6 & Xcode Architecture"
          >
            <FileCode2 className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden md:inline whitespace-nowrap">Swift & Xcode</span>
          </button>

          {/* Toggle Device Frame */}
          <button
            onClick={onToggleDeviceMode}
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={deviceMode === 'iphone' ? t('vista_completa') : t('vista_iphone')}
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
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? t('modo_claro') : t('modo_oscuro')}
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
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={t('configuracion')}
            aria-label="Configuración"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile & Logout Button */}
          {currentUser && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200 dark:border-slate-800">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor || '#007AFF' }}
                title={`${currentUser.name} (${currentUser.systemRole || 'editor'})`}
              >
                {currentUser.name.slice(0, 2).toUpperCase()}
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  title={t('cerrar_sesion')}
                  aria-label="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
