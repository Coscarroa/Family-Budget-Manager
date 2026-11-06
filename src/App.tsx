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
  AppLanguage,
} from './types/finance';
import { StorageService } from './services/storage';
import { FinancialCalculatorService } from './services/financialCalculations';
import { getTranslation } from './services/i18n';

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
import { UsersAndVariablesModule } from './components/UsersAndVariablesModule';
import { TransactionModal } from './components/TransactionModal';
import { SettingsAndFamilyModal } from './components/SettingsAndFamilyModal';
import { SwiftArchitectureModal } from './components/SwiftArchitectureModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { LoginPage } from './components/LoginPage';
import { TrainingModule } from './components/TrainingModule';

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

  // Language state (default from household or Spanish)
  const [language, setLanguage] = useState<AppLanguage>(household.language || 'es');

  // Authenticated user session
  const [currentUser, setCurrentUser] = useState<FamilyMember | null>(() => {
    const session = StorageService.getAuthSession();
    return session?.user || null;
  });

  // Security Lock
  const [isLocked, setIsLocked] = useState<boolean>(() => household.pinProtected);

  // Modals state
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionModalMode, setTransactionModalMode] = useState<'income' | 'fixedExpense' | 'variable' | 'payment'>('variable');
  const [activeFixedForPayment, setActiveFixedForPayment] = useState<FixedExpense | null>(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSwiftDocsModal, setShowSwiftDocsModal] = useState(false);
  const [showReceiptScannerModal, setShowReceiptScannerModal] = useState(false);

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

  // Language toggle handler
  const handleLanguageChange = (newLang: AppLanguage) => {
    setLanguage(newLang);
    const updated = { ...household, language: newLang };
    setHousehold(updated);
    StorageService.saveHousehold(updated);
    showToast(newLang === 'en' ? 'Language switched to English' : 'Idioma cambiado a Español');
  };

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

  // Handlers for authentication
  const handleLoginSuccess = (user: FamilyMember, method: 'otp' | 'biometric') => {
    setCurrentUser(user);
    StorageService.saveAuthSession({ user, method });
    showToast(
      language === 'en'
        ? `Welcome, ${user.name}! (${user.systemRole || 'editor'})`
        : `¡Bienvenido/a, ${user.name}! (${user.systemRole || 'editor'})`
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    StorageService.saveAuthSession(null);
    showToast(language === 'en' ? 'Session closed' : 'Sesión cerrada correctamente');
  };

  const handleRegisterNewMember = (newMember: FamilyMember) => {
    const updated = [...members, newMember];
    setMembers(updated);
    StorageService.saveMembers(updated);
  };

  // Handlers for data updates
  const handleUpdateHousehold = (updated: Household) => {
    setHousehold(updated);
    if (updated.language) setLanguage(updated.language);
    StorageService.saveHousehold(updated);
    showToast(language === 'en' ? 'Household settings saved' : 'Configuración del hogar guardada exitosamente');
  };

  const handleUpdateMembers = (updated: FamilyMember[]) => {
    setMembers(updated);
    StorageService.saveMembers(updated);
    // If current logged in user was modified, keep in sync
    if (currentUser) {
      const match = updated.find((m) => m.id === currentUser.id);
      if (match) {
        setCurrentUser(match);
        StorageService.saveAuthSession({ user: match, method: 'otp' });
      }
    }
    showToast(language === 'en' ? 'Family members updated' : 'Integrantes de la familia actualizados');
  };

  // Incomes handlers
  const handleSaveIncome = (newIncome: Income) => {
    const next = [newIncome, ...incomes];
    setIncomes(next);
    StorageService.saveIncomes(next);
    showToast(language === 'en' ? `Income "${newIncome.description}" added` : `Ingreso "${newIncome.description}" guardado`);
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
    showToast(language === 'en' ? 'Income deleted' : 'Ingreso eliminado');
  };

  // Fixed Expenses handlers
  const handleSaveFixedExpense = (newExp: FixedExpense) => {
    const next = [newExp, ...fixedExpenses];
    setFixedExpenses(next);
    StorageService.saveFixedExpenses(next);
    showToast(language === 'en' ? `Fixed bill "${newExp.name}" added` : `Obligación fija "${newExp.name}" agregada`);
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
    showToast(language === 'en' ? 'Fixed bill deleted' : 'Obligación fija eliminada');
  };

  // Variable Expenses handlers
  const handleSaveVariableExpense = (newExp: VariableExpense) => {
    const next = [newExp, ...variableExpenses];
    setVariableExpenses(next);
    StorageService.saveVariableExpenses(next);
    showToast(language === 'en' ? `Expense "${newExp.description}" logged` : `Gasto "${newExp.description}" registrado`);
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
    showToast(language === 'en' ? 'Expense deleted' : 'Gasto eliminado');
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
    showToast(
      language === 'en'
        ? `Budget for ${category} set to $${monthlyLimit}`
        : `Presupuesto de ${category} fijado en $${monthlyLimit}`
    );
  };

  const handleDeleteBudgetLimit = (id: string) => {
    const next = budgets.filter((b) => b.id !== id);
    setBudgets(next);
    StorageService.saveBudgets(next);
    showToast(language === 'en' ? 'Budget limit removed' : 'Límite de presupuesto eliminado');
  };

  // Goals handlers
  const handleSaveGoal = (newGoal: FinancialGoal) => {
    const next = [newGoal, ...goals];
    setGoals(next);
    StorageService.saveGoals(next);
    showToast(language === 'en' ? `Goal "${newGoal.name}" created` : `Meta "${newGoal.name}" creada`);
  };

  const handleDeleteGoal = (id: string) => {
    const next = goals.filter((g) => g.id !== id);
    setGoals(next);
    StorageService.saveGoals(next);
    showToast(language === 'en' ? 'Goal deleted' : 'Meta eliminada');
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
    showToast(language === 'en' ? `Contributed $${amount} to goal` : `Aporte de $${amount} registrado a la meta`);
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
      notes: notes || (language === 'en' ? 'Payment logged' : 'Abono registrado'),
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
        ? (language === 'en' ? `Bill "${expense.name}" paid in full` : `Factura "${expense.name}" liquidada por completo`)
        : (language === 'en' ? `Payment of $${amount} logged for "${expense.name}"` : `Abono de $${amount} registrado a "${expense.name}"`)
    );
  };

  // Handler for Scanned Receipt from Photo
  const handleConfirmScannedReceipt = (data: {
    type: 'fixedExpense' | 'variable';
    title: string;
    amount: number;
    date: string;
    category: string;
    responsibleMemberId: string;
    paymentMethod: PaymentMethod;
    isExtraordinary: boolean;
    notes?: string;
    receiptImageUrl?: string;
    taxId?: string;
    invoiceNumber?: string;
    dueDate?: string;
    subtotal?: number;
    tax?: number;
    currency?: string;
  }) => {
    const targetMonth = data.date.slice(0, 7) || currentMonthYear;

    if (data.type === 'fixedExpense') {
      const newFixed: FixedExpense = {
        id: `fix-${Date.now()}`,
        name: data.title,
        category: data.category as any,
        expectedAmount: data.amount,
        actualPaidAmount: 0,
        dueDate: data.dueDate || data.date,
        monthYear: targetMonth,
        frequency: 'monthly',
        paymentMethod: data.paymentMethod,
        responsibleMemberId: data.responsibleMemberId,
        status: 'pending',
        notes: data.notes || (data.invoiceNumber ? `Factura Nº: ${data.invoiceNumber}` : 'Factura escaneada'),
        payments: [],
        receiptImageUrl: data.receiptImageUrl,
        taxId: data.taxId,
        invoiceNumber: data.invoiceNumber,
        subtotal: data.subtotal,
        tax: data.tax,
        currency: data.currency,
      };
      handleSaveFixedExpense(newFixed);
    } else {
      const newVar: VariableExpense = {
        id: `var-${Date.now()}`,
        description: data.title,
        amount: data.amount,
        category: (data.isExtraordinary ? 'Extraordinario' : data.category) as any,
        date: data.date,
        monthYear: targetMonth,
        memberId: data.responsibleMemberId,
        paymentMethod: data.paymentMethod,
        isExtraordinary: data.isExtraordinary,
        notes: data.notes || (data.invoiceNumber ? `Ticket/Factura Nº: ${data.invoiceNumber}` : 'Comprobante escaneado'),
        receiptImageUrl: data.receiptImageUrl,
        taxId: data.taxId,
        invoiceNumber: data.invoiceNumber,
        subtotal: data.subtotal,
        tax: data.tax,
        currency: data.currency,
      };
      handleSaveVariableExpense(newVar);
    }

    showToast(
      language === 'en'
        ? `Invoice "${data.title}" ($${data.amount}) successfully registered!`
        : `¡Factura "${data.title}" ($${data.amount}) registrada con éxito!`
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
        language === 'en'
          ? `Generated: ${result.generatedFixedCount} fixed bills & ${result.generatedIncomeCount} incomes for ${currentMonthYear}`
          : `Generados: ${result.generatedFixedCount} gastos fijos y ${result.generatedIncomeCount} ingresos para ${currentMonthYear}`
      );
    } else {
      showToast(
        language === 'en'
          ? 'All recurring obligations already synced for this month.'
          : 'Todas las obligaciones recurrentes ya estaban sincronizadas para este mes.'
      );
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
    showToast(language === 'en' ? 'Database backup exported to JSON' : 'Copia de seguridad descargada en JSON');
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
      showToast(language === 'en' ? 'Database restored successfully' : 'Copia de seguridad restaurada correctamente');
    } else {
      showToast(language === 'en' ? 'Error importing JSON backup' : 'Error al importar archivo JSON');
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
    showToast(language === 'en' ? 'Reset to Rivera Family demo data' : 'Demostración reiniciada con datos de la Familia Rivera');
  };

  // If no user is logged in, show the minimalist Login Page
  if (!currentUser) {
    return (
      <div className={isDarkMode ? 'dark' : ''}>
        <LoginPage
          language={language}
          members={members}
          onLoginSuccess={handleLoginSuccess}
          onRegisterMember={handleRegisterNewMember}
        />
        {toastMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-slate-900/90 dark:bg-white/90 text-white dark:text-slate-900 text-xs font-semibold rounded-2xl shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-200">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

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
        language={language}
        onLanguageChange={handleLanguageChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        deviceMode={deviceMode}
        onToggleDeviceMode={() =>
          setDeviceMode(deviceMode === 'iphone' ? 'fullscreen' : 'iphone')
        }
        onOpenSwiftDocs={() => setShowSwiftDocsModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onGenerateRecurring={handleGenerateMonthlyRecurring}
        onOpenScanReceipt={() => setShowReceiptScannerModal(true)}
        onOpenTraining={() => setActiveTab('training')}
        currentUser={currentUser}
        onLogout={handleLogout}
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
        {/* Apple Dynamic Island */}
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
              language={language}
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
              onOpenScanReceipt={() => setShowReceiptScannerModal(true)}
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

          {activeTab === 'users' && (
            <UsersAndVariablesModule
              language={language}
              household={household}
              members={members}
              currencyCode={household.currency}
              onUpdateHousehold={handleUpdateHousehold}
              onUpdateMembers={handleUpdateMembers}
            />
          )}

          {activeTab === 'training' && (
            <TrainingModule
              language={language}
              currencyCode={household.currency}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenScanReceipt={() => setShowReceiptScannerModal(true)}
            />
          )}
        </div>
      </main>

      {/* iOS Bottom Tab Bar */}
      <BottomTabBar
        language={language}
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

      {showReceiptScannerModal && (
        <ReceiptScannerModal
          language={language}
          members={members}
          currencyCode={household.currency}
          monthYear={currentMonthYear}
          fixedExpenses={fixedExpenses}
          variableExpenses={variableExpenses}
          onClose={() => setShowReceiptScannerModal(false)}
          onConfirmReceipt={handleConfirmScannedReceipt}
          onViewExpense={(expenseType) => setActiveTab(expenseType === 'fixedExpense' ? 'fixedExpenses' : 'variableExpenses')}
        />
      )}

      {showSettingsModal && (
        <SettingsAndFamilyModal
          household={household}
          members={members}
          language={language}
          onLanguageChange={handleLanguageChange}
          onClose={() => setShowSettingsModal(false)}
          onUpdateHousehold={handleUpdateHousehold}
          onUpdateMembers={handleUpdateMembers}
          onExportJSON={handleExportJSON}
          onImportJSON={handleImportJSON}
          onResetToDemo={handleResetToDemo}
          onOpenUsersAndVariables={() => setActiveTab('users')}
        />
      )}

      {showSwiftDocsModal && (
        <SwiftArchitectureModal onClose={() => setShowSwiftDocsModal(false)} />
      )}
    </div>
  );
}
