import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Wallet,
  Receipt,
  PieChart,
  Calendar,
  BarChart3,
  Target,
  Users,
  MoreHorizontal,
  X,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, AppLanguage } from '../types/finance';
import { getTranslation } from '../services/i18n';

interface BottomTabBarProps {
  language: AppLanguage;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  overdueFixedCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  language,
  activeTab,
  onSelectTab,
  overdueFixedCount = 0,
}) => {
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);
  const [showMoreSheet, setShowMoreSheet] = useState(false);

  interface TabItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    description?: string;
  }

  const primaryTabs: TabItem[] = [
    {
      id: 'dashboard',
      label: t('tab_dashboard'),
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fixedExpenses',
      label: t('tab_fixedExpenses'),
      icon: <CalendarClock className="w-5 h-5" />,
      badge: overdueFixedCount > 0 ? overdueFixedCount : undefined,
    },
    {
      id: 'variableExpenses',
      label: t('tab_variableExpenses'),
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'budget',
      label: t('tab_budget'),
      icon: <PieChart className="w-5 h-5" />,
    },
  ];

  const secondaryTabs: TabItem[] = [
    {
      id: 'incomes',
      label: t('tab_incomes'),
      icon: <Wallet className="w-5 h-5 text-emerald-500" />,
      description: language === 'en' ? 'Salaries, freelance & dividends' : 'Salarios, nóminas e inversiones',
    },
    {
      id: 'calendar',
      label: t('tab_calendar'),
      icon: <Calendar className="w-5 h-5 text-blue-500" />,
      description: language === 'en' ? 'Monthly due dates and schedule' : 'Vencimientos del mes y agenda diaria',
    },
    {
      id: 'reports',
      label: t('tab_reports'),
      icon: <BarChart3 className="w-5 h-5 text-indigo-500" />,
      description: language === 'en' ? 'Statistics, CSV & PDF report' : 'Estadísticas, CSV y exportación PDF',
    },
    {
      id: 'goals',
      label: t('tab_goals'),
      icon: <Target className="w-5 h-5 text-purple-500" />,
      description: language === 'en' ? 'Emergency fund & family goals' : 'Fondo de emergencia y proyectos',
    },
    {
      id: 'users',
      label: t('tab_users'),
      icon: <Users className="w-5 h-5 text-blue-600" />,
      description: language === 'en' ? 'Member profiles & financial variables' : 'Integrantes, roles y variables del hogar',
    },
  ];

  const allTabs: TabItem[] = [...primaryTabs, ...secondaryTabs];
  const isSecondaryActive = secondaryTabs.some((tab) => tab.id === activeTab);
  const activeSecondaryItem = secondaryTabs.find((tab) => tab.id === activeTab);

  const handleSelectFromMore = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    setShowMoreSheet(false);
  };

  return (
    <>
      {/* Mobile iOS Action Sheet for "Más / More" */}
      {showMoreSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm transition-opacity md:hidden animate-in fade-in duration-200">
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-[32px] p-5 shadow-2xl border-t border-slate-200 dark:border-slate-800 space-y-4 ios-sheet-slide-up"
            style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))' }}
          >
            {/* Grab handle bar */}
            <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto" />

            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {language === 'en' ? 'Additional Modules' : 'Módulos Adicionales'}
              </span>
              <button
                onClick={() => setShowMoreSheet(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
              {secondaryTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleSelectFromMore(tab.id)}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-500/40 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white dark:bg-slate-900 shadow-xs">
                        {tab.icon}
                      </div>
                      <div>
                        <span className="text-sm font-bold block">{tab.label}</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                          {tab.description}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar Container */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/92 dark:bg-slate-900/92 backdrop-blur-2xl border-t border-slate-200/80 dark:border-slate-800/80 transition-colors"
        style={{ paddingBottom: 'max(10px, env(safe-area-inset-bottom, 10px))' }}
      >
        <div className="max-w-4xl mx-auto px-2">
          {/* Mobile Phone Layout (5 thumb buttons >= 44x44px) */}
          <div className="flex md:hidden items-center justify-around h-14">
            {primaryTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 ios-pressable transition-colors min-h-[44px] ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    {tab.icon}
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-1 truncate max-w-[65px]">
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                  )}
                </button>
              );
            })}

            {/* 5th Mobile Tab: "Más / More" */}
            <button
              onClick={() => setShowMoreSheet(true)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 ios-pressable transition-colors min-h-[44px] ${
                isSecondaryActive
                  ? 'text-blue-600 dark:text-blue-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {isSecondaryActive && activeSecondaryItem ? (
                  activeSecondaryItem.icon
                ) : (
                  <MoreHorizontal className="w-5 h-5" />
                )}
              </div>
              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[65px]">
                {isSecondaryActive && activeSecondaryItem
                  ? activeSecondaryItem.label
                  : language === 'en'
                  ? 'More'
                  : 'Más'}
              </span>
              {isSecondaryActive && (
                <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
              )}
            </button>
          </div>

          {/* Desktop & iPad Layout (All 9 tabs with clean typography and spacing) */}
          <div className="hidden md:flex items-center justify-around h-16">
            {allTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 ios-pressable transition-colors min-h-[48px] ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <div className="relative">
                    {tab.icon}
                    {tab.badge !== undefined && (
                      <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {tab.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap truncate max-w-[75px]">
                    {tab.label}
                  </span>

                  {isActive && (
                    <span className="w-1 h-1 rounded-full bg-blue-600 dark:bg-blue-400 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
};
