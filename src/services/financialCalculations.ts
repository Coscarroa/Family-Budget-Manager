import {
  CurrencyCode,
  SUPPORTED_CURRENCIES,
  Income,
  FixedExpense,
  VariableExpense,
  BudgetLimit,
  MonthFinancialSummary,
} from '../types/finance';

/**
 * Servicio de cálculos financieros que implementa estrictamente las fórmulas del Maestro Prompt:
 * 1. Balance disponible = Ingresos recibidos - Gastos ejecutados
 * 2. Total gastos ejecutados = Gastos fijos pagados + Gastos variables + Gastos extraordinarios
 * 3. Gastos comprometidos = Gastos fijos pendientes (incluyendo saldos parciales) + Gastos variables presupuestados pendientes
 * 4. Tasa de ahorro = (Ingresos recibidos - Gastos ejecutados) / Ingresos recibidos × 100
 * 5. Cero duplicidades: Los gastos pendientes se proyectan sin restarse dos veces del balance disponible.
 */
export class FinancialCalculatorService {
  /**
   * Formatea un valor monetario según la moneda configurada
   */
  static formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
    const config = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.USD;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  /**
   * Calcula el resumen mensual completo para un mes dado (YYYY-MM)
   */
  static calculateMonthlySummary(
    monthYear: string,
    incomes: Income[],
    fixedExpenses: FixedExpense[],
    variableExpenses: VariableExpense[],
    budgets: BudgetLimit[],
    previousMonthSummary?: MonthFinancialSummary
  ): MonthFinancialSummary {
    // 1. Filtrar por el mes correspondiente
    const monthIncomes = incomes.filter(
      (inc) => inc.monthYear === monthYear || inc.date.startsWith(monthYear)
    );
    const monthFixed = fixedExpenses.filter(
      (exp) => (exp.monthYear === monthYear || exp.dueDate.startsWith(monthYear)) && !exp.isSuspended
    );
    const monthVariable = variableExpenses.filter(
      (exp) => exp.monthYear === monthYear || exp.date.startsWith(monthYear)
    );

    // 2. Ingresos recibidos vs pendientes
    let totalIncomeReceived = 0;
    let totalIncomePending = 0;

    monthIncomes.forEach((inc) => {
      if (inc.status === 'received') {
        totalIncomeReceived += inc.amount;
      } else {
        totalIncomePending += inc.amount;
      }
    });

    const totalIncomeExpected = totalIncomeReceived + totalIncomePending;

    // 3. Gastos Fijos
    let fixedExpensesPaid = 0;
    let fixedExpensesPending = 0;
    let fixedExpensesTotalExpected = 0;

    monthFixed.forEach((exp) => {
      fixedExpensesTotalExpected += exp.expectedAmount;
      const paidPortion = exp.actualPaidAmount || (exp.status === 'paid' ? exp.expectedAmount : 0);
      fixedExpensesPaid += paidPortion;
      const pendingPortion = Math.max(0, exp.expectedAmount - paidPortion);
      fixedExpensesPending += pendingPortion;
    });

    // 4. Gastos Variables y Extraordinarios
    let regularVariableTotal = 0;
    let extraordinaryExpensesTotal = 0;

    monthVariable.forEach((exp) => {
      if (exp.isExtraordinary) {
        extraordinaryExpensesTotal += exp.amount;
      } else {
        regularVariableTotal += exp.amount;
      }
    });

    const variableExpensesTotal = regularVariableTotal + extraordinaryExpensesTotal;

    // 5. Total de Gastos Ejecutados (Fórmula: Fijos efectivamente pagados + Variables + Extraordinarios)
    const totalExpensesExecuted = fixedExpensesPaid + variableExpensesTotal;

    // 6. Balance Disponible (Fórmula: Ingresos recibidos - Gastos ejecutados)
    const availableBalance = totalIncomeReceived - totalExpensesExecuted;

    // 7. Gastos Comprometidos = Fijos pendientes + Variables presupuestados que aún no se han gastado
    // Calcular por cada presupuesto de categoría cuánto queda por gastar este mes
    const categorySpending: Record<string, number> = {};
    monthVariable.forEach((v) => {
      categorySpending[v.category] = (categorySpending[v.category] || 0) + v.amount;
    });

    let remainingBudgetedVariable = 0;
    const currentBudgets = budgets.filter((b) => b.monthYear === monthYear);
    currentBudgets.forEach((b) => {
      const spent = categorySpending[b.category] || 0;
      if (b.monthlyLimit > spent) {
        remainingBudgetedVariable += (b.monthlyLimit - spent);
      }
    });

    const committedExpenses = fixedExpensesPending + remainingBudgetedVariable;

    // 8. Tasa de Ahorro: (Ingresos recibidos - Gastos ejecutados) / Ingresos recibidos × 100
    let savingsRate = 0;
    if (totalIncomeReceived > 0) {
      savingsRate = ((totalIncomeReceived - totalExpensesExecuted) / totalIncomeReceived) * 100;
    }

    // Porcentaje de ingresos comprometidos
    let percentageIncomeCommitted = 0;
    const baseIncome = totalIncomeReceived > 0 ? totalIncomeReceived : totalIncomeExpected;
    if (baseIncome > 0) {
      percentageIncomeCommitted = Math.min(100, (committedExpenses / baseIncome) * 100);
    }

    const projectedNetSavings = totalIncomeExpected - (fixedExpensesTotalExpected + variableExpensesTotal + remainingBudgetedVariable);

    // Comparación con mes anterior si está disponible
    let prevMonthComparison: MonthFinancialSummary['prevMonthComparison'];
    if (previousMonthSummary && previousMonthSummary.totalIncomeReceived > 0) {
      const incDiff = totalIncomeReceived - previousMonthSummary.totalIncomeReceived;
      const expDiff = totalExpensesExecuted - previousMonthSummary.totalExpensesExecuted;
      const curSavings = totalIncomeReceived - totalExpensesExecuted;
      const prevSavings = previousMonthSummary.totalIncomeReceived - previousMonthSummary.totalExpensesExecuted;

      prevMonthComparison = {
        incomeChangePercent: (incDiff / previousMonthSummary.totalIncomeReceived) * 100,
        expensesChangePercent: previousMonthSummary.totalExpensesExecuted > 0 
          ? (expDiff / previousMonthSummary.totalExpensesExecuted) * 100 
          : 0,
        savingsChangePercent: prevSavings !== 0 
          ? ((curSavings - prevSavings) / Math.abs(prevSavings)) * 100 
          : 0,
      };
    }

    return {
      monthYear,
      totalIncomeReceived,
      totalIncomePending,
      totalIncomeExpected,
      fixedExpensesPaid,
      fixedExpensesPending,
      fixedExpensesTotalExpected,
      variableExpensesTotal,
      extraordinaryExpensesTotal,
      totalExpensesExecuted,
      committedExpenses,
      availableBalance,
      projectedNetSavings,
      savingsRate: Number(savingsRate.toFixed(1)),
      percentageIncomeCommitted: Number(percentageIncomeCommitted.toFixed(1)),
      prevMonthComparison,
    };
  }

  /**
   * Determina si un gasto fijo está vencido (dueDate < fecha actual y no está pagado)
   */
  static isExpenseOverdue(expense: FixedExpense, todayStr: string): boolean {
    if (expense.status === 'paid' || expense.isSuspended) return false;
    return expense.dueDate < todayStr && (expense.expectedAmount - expense.actualPaidAmount > 0.01);
  }

  /**
   * Determina si un gasto fijo está próximo a vencer (dentro de los próximos N días)
   */
  static isExpenseUpcoming(expense: FixedExpense, todayStr: string, daysAhead: number = 5): boolean {
    if (expense.status === 'paid' || expense.isSuspended) return false;
    if (expense.dueDate < todayStr) return false; // ya venció
    
    const today = new Date(todayStr);
    const due = new Date(expense.dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= daysAhead;
  }

  /**
   * Calcula el consumo de presupuestos por categoría
   */
  static calculateCategoryBudgets(
    budgets: BudgetLimit[],
    variableExpenses: VariableExpense[],
    monthYear: string
  ) {
    const currentMonthExpenses = variableExpenses.filter(
      (v) => v.monthYear === monthYear || v.date.startsWith(monthYear)
    );

    const spendingByCategory: Record<string, number> = {};
    currentMonthExpenses.forEach((v) => {
      spendingByCategory[v.category] = (spendingByCategory[v.category] || 0) + v.amount;
    });

    const activeBudgets = budgets.filter((b) => b.monthYear === monthYear);

    return activeBudgets.map((b) => {
      const spent = spendingByCategory[b.category] || 0;
      const remaining = Math.max(0, b.monthlyLimit - spent);
      const percentage = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;
      const isWarning = percentage >= 80 && percentage < 100;
      const isOverBudget = percentage >= 100;

      return {
        id: b.id,
        category: b.category,
        limit: b.monthlyLimit,
        spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        isWarning,
        isOverBudget,
        overAmount: Math.max(0, spent - b.monthlyLimit),
      };
    });
  }
}
