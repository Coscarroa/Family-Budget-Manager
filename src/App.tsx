/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Household,
  FamilyMember,
  Income,
  FixedExpense,
  VariableExpense,
  BudgetLimit,
  FinancialGoal,
  ActiveTab,
  PaymentMethod,
} from './types/finance';
import { StorageService } from './services/storage';
import { FinancialCalculatorService } from './services/financialCalculations';

// Components
import { Header } from './components/Header';
import { BottomTabBar } from './components/BottomTabBar';
import { DynamicIsland } from './components/DynamicIsland';
import { FaceIDLock } from './components/FaceIDLock';
import { DashboardModule } from './components/DashboardModule';
import { FixedExpensesModule } from './components/FixedExpensesModule';
import { IncomesModule } from './components/IncomesModule';
import { VariableExpensesModule } from './components/VariableExpensesModule';
import { BudgetModule } from './components/BudgetModule';
import { CalendarModule } from './components/CalendarModule';
import { ReportsModule } from './components/ReportsModule';
import { SavingsGoalsModule } from './components/SavingsGoalsModule';
import { TransactionModal } from './components/TransactionModal';
import { SettingsAndFamilyModal } from './components/SettingsAndFamilyModal';
import { SwiftArchitectureModal } from './components/SwiftArchitectureModal';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Device presentation mode: 'iphone' (framed) or 'fullscreen' (responsive iPad/Mac)
  const [deviceMode, setDeviceMode] = useState<'iphone' | 'fullscreen'>('fullscreen');

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Current selected month-year (defaults to current month: 2026-11)
  const [currentMonthYear, setCurrentMonthYear] = useState<string>('2026-11');

  // Persistence entities state
  const [household, setHousehold] = useState<Household>(() => StorageService.getHousehold());
  const [members, setMembers] = useState<FamilyMember[]>(() => StorageService.getMembers());
  const [incomes, setIncomes] = useState<Income[]>(() => StorageService.getIncomes());
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(() => StorageService.getFixedExpenses());
  const [variableExpenses, setVariableExpenses] = useState<VariableExpense[]>(() => StorageService.getVariableExpenses());
  const [budgets, setBudgets] = useState<BudgetLimit[]>(() => StorageService.getBudgets());
  const [goals, setGoals] = useState<FinancialGoal[]>(() => StorageService.getGoals());

  // Security Lock
  const [isLocked, setIsLocked] = useState<boolean>(() => household.pinProtected);

  // Modals state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionModalMode, setTransactionModalMode] = useState<'income' | 'fixedExpense' | 'variable' | 'payment'>('variable');
  const [activeFixedForPayment, setActiveFixedForPayment] = useState<FixedExpense | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwiftDocsModal, setShowSwiftDocsModal] = useState(false);

  // Toast / Status notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sync Dark Mode class with HTML element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Previous month string calculation (for comparative statistics)
  const previousMonthYear = useMemo(() => {
    const [y, m] = currentMonthYear.split('-');
    let py = parseInt(y, 10);
    let pm = parseInt(m, 10) - 1;
    if (pm < 1) {
      pm = 12;
      py -= 1;
    }
    return `${py}-${pm < 10 ? '0' + pm : pm}`;
  }, [currentMonthYear]);

  // Calculate Previous Month Summary
  const prevMonthSummary = useMemo(() => {
    return FinancialCalculatorService.calculateMonthlySummary(
      previousMonthYear,
      incomes,
      fixedExpenses,
      variableExpenses,
      budgets
    );
  }, [previousMonthYear, incomes, fixedExpenses, variableExpenses, budgets]);

  // Calculate Current Month Summary
  const currentSummary = useMemo(() => {
    return FinancialCalculatorService.calculateMonthlySummary(
      currentMonthYear,
      incomes,
      fixedExpenses,
      variableExpenses,
      budgets,
      prevMonthSummary
    );
  }, [currentMonthYear, incomes, fixedExpenses, variableExpenses, budgets, prevMonthSummary]);

  // Today string
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Overdue and upcoming fixed expenses
  const overdueExpenses = useMemo(() => {
    return fixedExpenses.filter(
      (e) =>
        (e.monthYear === currentMonthYear || e.dueDate.startsWith(currentMonthYear)) &&
        FinancialCalculatorService.isExpenseOverdue(e, todayStr)
    );
  }, [fixedExpenses, currentMonthYear, todayStr]);

  const upcomingExpenses = useMemo(() => {
    return fixedExpenses.filter(
      (e) =>
        (e.monthYear === currentMonthYear || e.dueDate.startsWith(currentMonthYear)) &&
        FinancialCalculatorService.isExpenseUpcoming(e, todayStr, 5)
    );
  }, [fixedExpenses, currentMonthYear, todayStr]);

  // Handlers for data updates
  const handleUpdateHousehold = (updated: Household) => {
    setHousehold(updated);
    StorageService.saveHousehold(updated);
    showToast('Configuración del hogar guardada exitosamente');
  };

  const handleUpdateMembers = (updated: FamilyMember[]) => {
    setMembers(updated);
    StorageService.saveMembers(updated);
    showToast('Integrantes de la familia actualizados');
  };

  // Incomes handlers
  const handleSaveIncome = (newIncome: Income) => {
    const next = [newIncome, ...incomes];
    setIncomes(next);
    StorageService.saveIncomes(next);
    showToast(`Ingreso "${newIncome.description}" guardado`);
  };

  const handleUpdateIncome = (updated: Income) => {
    const next = incomes.map((i) => (i.id === updated.id ? updated : i));
    setIncomes(next);
    StorageService.saveIncomes(next);
  };

  const handleDeleteIncome = (id: string) => {
    const next = incomes.filter((i) => i.id !== id);
    setIncomes(next);
    StorageService.saveIncomes(next);
    showToast('Ingreso eliminado');
  };

  // Fixed Expenses handlers
  const handleSaveFixedExpense = (newExp: FixedExpense) => {
    const next = [newExp, ...fixedExpenses];
    setFixedExpenses(next);
    StorageService.saveFixedExpenses(next);
    showToast(`Obligación fija "${newExp.name}" agregada`);
  };

  const handleUpdateFixedExpense = (updated: FixedExpense) => {
    const next = fixedExpenses.map((f) => (f.id === updated.id ? updated : f));
    setFixedExpenses(next);
    StorageService.saveFixedExpenses(next);
  };

  const handleDeleteFixedExpense = (id: string) => {
    const next = fixedExpenses.filter((f) => f.id !== id);
    setFixedExpenses(next);
    StorageService.saveFixedExpenses(next);
    showToast('Obligación fija eliminada');
  };

  // Variable Expenses handlers
  const handleSaveVariableExpense = (newExp: VariableExpense) => {
    const next = [newExp, ...variableExpenses];
    setVariableExpenses(next);
    StorageService.saveVariableExpenses(next);
    showToast(`Gasto "${newExp.description}" registrado`);
  };

  const handleUpdateVariableExpense = (updated: VariableExpense) => {
    const next = variableExpenses.map((v) => (v.id === updated.id ? updated : v));
    setVariableExpenses(next);
    StorageService.saveVariableExpenses(next);
  };

  const handleDeleteVariableExpense = (id: string) => {
    const next = variableExpenses.filter((v) => v.id !== id);
    setVariableExpenses(next);
    StorageService.saveVariableExpenses(next);
    showToast('Gasto eliminado');
  };

  // Budgets handlers
  const handleSaveBudgetLimit = (category: string, monthlyLimit: number) => {
    const existingIndex = budgets.findIndex(
      (b) => b.category === category && b.monthYear === currentMonthYear
    );
    let next: BudgetLimit[];
    if (existingIndex >= 0) {
      next = [...budgets];
      next[existingIndex] = { ...next[existingIndex], monthlyLimit };
    } else {
      next = [
        ...budgets,
        {
          id: `bud-${Date.now()}`,
          category,
          monthlyLimit,
          monthYear: currentMonthYear,
        },
      ];
    }
    setBudgets(next);
    StorageService.saveBudgets(next);
    showToast(`Presupuesto de ${category} fijado en $${monthlyLimit}`);
  };

  const handleDeleteBudgetLimit = (id: string) => {
    const next = budgets.filter((b) => b.id !== id);
    setBudgets(next);
    StorageService.saveBudgets(next);
    showToast('Límite de presupuesto eliminado');
  };

  // Goals handlers
  const handleSaveGoal = (newGoal: FinancialGoal) => {
    const next = [newGoal, ...goals];
    setGoals(next);
    StorageService.saveGoals(next);
    showToast(`Meta "${newGoal.name}" creada`);
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    StorageService.saveGoals(next);
    showToast('Meta eliminada');
  };

  const handleContributeToGoal = (id: string, amount: number) => {
    const next = goals.map((g) => {
      if (g.id === id) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    });
    setGoals(next);
    StorageService.saveGoals(next);
    showToast(`Aporte de $${amount} registrado a la meta`);
  };

  // Record payment / partial payment
  const handleRecordPayment = (
    expenseId: string,
    amount: number,
    method: PaymentMethod,
    notes?: string
  ) => {
    const expense = fixedExpenses.find((f) => f.id === expenseId);
    if (!expense) return;

    const newPaymentRecord = {
      id: `pay-${Date.now()}`,
      amount,
      date: todayStr,
      method,
      notes: notes || 'Abono registrado',
    };

    const newPaidTotal = expense.actualPaidAmount + amount;
    const isFullyPaid = newPaidTotal >= expense.expectedAmount;

    const updatedExpense: FixedExpense = {
      ...expense,
      actualPaidAmount: newPaidTotal,
      status: isFullyPaid ? 'paid' : 'partial',
      paidDate: isFullyPaid ? todayStr : expense.paidDate,
      payments: [...expense.payments, newPaymentRecord],
    };

    handleUpdateFixedExpense(updatedExpense);
    showToast(
      isFullyPaid
        ? `Factura "${expense.name}" liquidada por completo`
        : `Abono de $${amount} registrado a "${expense.name}"`
    );
  };

  // Auto Generate Recurring Items
  const handleGenerateMonthlyRecurring = () => {
    const result = StorageService.generateMonthlyRecurringItems(currentMonthYear);
    // Reload state
    setFixedExpenses(StorageService.getFixedExpenses());
    setIncomes(StorageService.getIncomes());

    if (result.generatedFixedCount > 0 || result.generatedIncomeCount > 0) {
      showToast(
        `Generados: ${result.generatedFixedCount} gastos fijos y ${result.generatedIncomeCount} ingresos para ${currentMonthYear}`
      );
    } else {
      showToast('Todas las obligaciones recurrentes ya estaban sincronizadas para este mes.');
    }
  };

  // Export & Import handlers
  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FamilyBudget_${household.name.replace(/\s+/g, '_')}_Backup.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Copia de seguridad descargada en JSON');
  };

  const handleImportJSON = (jsonString: string) => {
    const success = StorageService.importDatabaseJSON(jsonString);
    if (success) {
      setHousehold(StorageService.getHousehold());
      setMembers(StorageService.getMembers());
      setIncomes(StorageService.getIncomes());
      setFixedExpenses(StorageService.getFixedExpenses());
      setVariableExpenses(StorageService.getVariableExpenses());
      setBudgets(StorageService.getBudgets());
      setGoals(StorageService.getGoals());
      showToast('Copia de seguridad restaurada correctamente');
    } else {
      showToast('Error al importar archivo JSON');
    }
  };

  const handleResetToDemo = () => {
    StorageService.resetToDemoData();
    setHousehold(StorageService.getHousehold());
    setMembers(StorageService.getMembers());
    setIncomes(StorageService.getIncomes());
    setFixedExpenses(StorageService.getFixedExpenses());
    setVariableExpenses(StorageService.getVariableExpenses());
    setBudgets(StorageService.getBudgets());
    setGoals(StorageService.getGoals());
    showToast('Demostración reiniciada con datos de la Familia Rivera');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Biometric Face ID Lock Screen if enabled and locked */}
      {isLocked && (
        <FaceIDLock
          householdName={household.name}
          pinCode={household.pinCode}
          onUnlock={() => setIsLocked(false)}
        />
      )}

      {/* Main Top Bar Contract */}
      <Header
        currentMonthYear={currentMonthYear}
        onMonthChange={setCurrentMonthYear}
        currencyCode={household.currency}
        householdName={household.name}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        deviceMode={deviceMode}
        onToggleDeviceMode={() =>
          setDeviceMode(deviceMode === 'iphone' ? 'fullscreen' : 'iphone')
        }
        onOpenSwiftDocs={() => setShowSwiftDocsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onGenerateRecurring={handleGenerateMonthlyRecurring}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Application Container */}
      <main
        className={`flex-1 w-full mx-auto transition-all ${
          deviceMode === 'iphone'
            ? 'max-w-[430px] my-6 rounded-[52px] border-[10px] border-slate-800 shadow-2xl bg-white dark:bg-slate-950 overflow-hidden relative min-h-[850px]'
            : 'max-w-7xl px-4 sm:px-6 py-6'
        }`}
      >
        {/* Apple Dynamic Island (shown in both modes as interactive widget) */}
        <DynamicIsland
          availableBalance={currentSummary.availableBalance}
          overdueCount={overdueExpenses.length}
          upcomingCount={upcomingExpenses.length}
          currencyCode={household.currency}
        />

        {/* Content View Router */}
        <div className="mt-4">
          {activeTab === 'dashboard' && (
            <DashboardModule
              summary={currentSummary}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
              overdueExpenses={overdueExpenses}
              upcomingExpenses={upcomingExpenses}
              budgets={budgets}
              variableExpenses={variableExpenses}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenNewTransaction={(type) => {
                setTransactionModalMode(type);
                setActiveFixedForPayment(null);
                setShowTransactionModal(true);
              }}
              onPayFixedExpense={(exp) => {
                setActiveFixedForPayment(exp);
                setTransactionModalMode('payment');
                setShowTransactionModal(true);
              }}
            />
          )}

          {activeTab === 'fixedExpenses' && (
            <FixedExpensesModule
              fixedExpenses={fixedExpenses}
              members={members}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
              onUpdateExpense={handleUpdateFixedExpense}
              onDeleteExpense={handleDeleteFixedExpense}
              onOpenNewExpenseModal={() => {
                setTransactionModalMode('fixedExpense');
                setActiveFixedForPayment(null);
                setShowTransactionModal(true);
              }}
              onOpenPaymentModal={(exp) => {
                setActiveFixedForPayment(exp);
                setTransactionModalMode('payment');
                setShowTransactionModal(true);
              }}
            />
          )}

          {activeTab === 'incomes' && (
            <IncomesModule
              incomes={incomes}
              members={members}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
              onUpdateIncome={handleUpdateIncome}
              onDeleteIncome={handleDeleteIncome}
              onOpenNewIncomeModal={() => {
                setTransactionModalMode('income');
                setActiveFixedForPayment(null);
                setShowTransactionModal(true);
              }}
            />
          )}

          {activeTab === 'variableExpenses' && (
            <VariableExpensesModule
              variableExpenses={variableExpenses}
              members={members}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
              onUpdateExpense={handleUpdateVariableExpense}
              onDeleteExpense={handleDeleteVariableExpense}
              onOpenNewExpenseModal={(isExtra) => {
                setTransactionModalMode('variable');
                setActiveFixedForPayment(null);
                setShowTransactionModal(true);
              }}
            />
          )}

          {activeTab === 'budget' && (
            <BudgetModule
              budgets={budgets}
              variableExpenses={variableExpenses}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
              onSaveBudgetLimit={handleSaveBudgetLimit}
              onDeleteBudgetLimit={handleDeleteBudgetLimit}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarModule
              incomes={incomes}
              fixedExpenses={fixedExpenses}
              variableExpenses={variableExpenses}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModule
              summary={currentSummary}
              incomes={incomes}
              fixedExpenses={fixedExpenses}
              variableExpenses={variableExpenses}
              currencyCode={household.currency}
              monthYear={currentMonthYear}
            />
          )}

          {activeTab === 'goals' && (
            <SavingsGoalsModule
              goals={goals}
              currencyCode={household.currency}
              onSaveGoal={handleSaveGoal}
              onDeleteGoal={handleDeleteGoal}
              onContributeToGoal={handleContributeToGoal}
            />
          )}
        </div>
      </main>

      {/* iOS Bottom Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        overdueFixedCount={overdueExpenses.length}
      />

      {/* Modals */}
      {showTransactionModal && (
        <TransactionModal
          initialMode={transactionModalMode}
          members={members}
          currencyCode={household.currency}
          monthYear={currentMonthYear}
          activeFixedExpenseForPayment={activeFixedForPayment}
          onClose={() => {
            setShowTransactionModal(false);
            setActiveFixedForPayment(null);
          }}
          onSaveIncome={handleSaveIncome}
          onSaveFixedExpense={handleSaveFixedExpense}
          onSaveVariableExpense={handleSaveVariableExpense}
          onRecordPayment={handleRecordPayment}
        />
      )}

      {showSettingsModal && (
        <SettingsAndFamilyModal
          household={household}
          members={members}
          onClose={() => setShowSettingsModal(false)}
          onUpdateHousehold={handleUpdateHousehold}
          onUpdateMembers={handleUpdateMembers}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onResetToDemo={handleResetToDemo}
        />
      )}

      {showSwiftDocsModal && (
        <SwiftArchitectureModal onClose={() => setShowSwiftDocsModal(false)} />
      )}
    </div>
  );
}
