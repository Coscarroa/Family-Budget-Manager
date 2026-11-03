import React from 'react';
import {
  LayoutDashboard,
  CalendarClock,
  Wallet,
  Receipt,
  PieChart,
  Calendar,
  BarChart3,
  Target,
} from 'lucide-react';
import { ActiveTab } from '../types/finance';

interface BottomTabBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  overdueFixedCount?: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onSelectTab,
  overdueFixedCount = 0,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'fixedExpenses',
      label: 'Gastos Fijos',
      icon: <CalendarClock className="w-5 h-5" />,
      badge: overdueFixedCount > 0 ? overdueFixedCount : undefined,
    },
    {
      id: 'incomes',
      label: 'Ingresos',
      icon: <Wallet className="w-5 h-5" />,
    },
    {
      id: 'variableExpenses',
      label: 'Variables',
      icon: <Receipt className="w-5 h-5" />,
    },
    {
      id: 'budget',
      label: 'Presupuesto',
      icon: <PieChart className="w-5 h-5" />,
    },
    {
      id: 'calendar',
      label: 'Calendario',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      id: 'reports',
      label: 'Informes',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: <Target className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 ios-pressable transition-colors ${
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
                <span className="text-[10px] tracking-tight mt-1 whitespace-nowrap">
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
  );
};
