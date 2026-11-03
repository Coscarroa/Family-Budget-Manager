import {
  Household,
  FamilyMember,
  Income,
  FixedExpense,
  VariableExpense,
  BudgetLimit,
  FinancialGoal,
  RecurringTemplate,
  PaymentRecord,
} from '../types/finance';
import {
  INITIAL_HOUSEHOLD,
  INITIAL_MEMBERS,
  INITIAL_RECURRING_TEMPLATES,
  INITIAL_INCOMES,
  INITIAL_FIXED_EXPENSES,
  INITIAL_VARIABLE_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_GOALS,
} from '../data/initialData';

const STORAGE_KEYS = {
  HOUSEHOLD: 'fbm_household_v1',
  MEMBERS: 'fbm_members_v1',
  RECURRING_TEMPLATES: 'fbm_recurring_templates_v1',
  INCOMES: 'fbm_incomes_v1',
  FIXED_EXPENSES: 'fbm_fixed_expenses_v1',
  VARIABLE_EXPENSES: 'fbm_variable_expenses_v1',
  BUDGETS: 'fbm_budgets_v1',
  GOALS: 'fbm_goals_v1',
  THEME: 'fbm_theme_v1',
  DEVICE_MODE: 'fbm_device_mode_v1', // 'iphone' | 'responsive'
  IS_LOCKED: 'fbm_is_locked_v1',
};

export class StorageService {
  static getHousehold(): Household {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOUSEHOLD);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading household', e);
    }
    this.saveHousehold(INITIAL_HOUSEHOLD);
    return INITIAL_HOUSEHOLD;
  }

  static saveHousehold(household: Household) {
    localStorage.setItem(STORAGE_KEYS.HOUSEHOLD, JSON.stringify(household));
  }

  static getMembers(): FamilyMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading members', e);
    }
    this.saveMembers(INITIAL_MEMBERS);
    return INITIAL_MEMBERS;
  }

  static saveMembers(members: FamilyMember[]) {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }

  static getRecurringTemplates(): RecurringTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RECURRING_TEMPLATES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading recurring templates', e);
    }
    this.saveRecurringTemplates(INITIAL_RECURRING_TEMPLATES);
    return INITIAL_RECURRING_TEMPLATES;
  }

  static saveRecurringTemplates(templates: RecurringTemplate[]) {
    localStorage.setItem(STORAGE_KEYS.RECURRING_TEMPLATES, JSON.stringify(templates));
  }

  static getIncomes(): Income[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCOMES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading incomes', e);
    }
    this.saveIncomes(INITIAL_INCOMES);
    return INITIAL_INCOMES;
  }

  static saveIncomes(incomes: Income[]) {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }

  static getFixedExpenses(): FixedExpense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FIXED_EXPENSES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading fixed expenses', e);
    }
    this.saveFixedExpenses(INITIAL_FIXED_EXPENSES);
    return INITIAL_FIXED_EXPENSES;
  }

  static saveFixedExpenses(expenses: FixedExpense[]) {
    localStorage.setItem(STORAGE_KEYS.FIXED_EXPENSES, JSON.stringify(expenses));
  }

  static getVariableExpenses(): VariableExpense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VARIABLE_EXPENSES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading variable expenses', e);
    }
    this.saveVariableExpenses(INITIAL_VARIABLE_EXPENSES);
    return INITIAL_VARIABLE_EXPENSES;
  }

  static saveVariableExpenses(expenses: VariableExpense[]) {
    localStorage.setItem(STORAGE_KEYS.VARIABLE_EXPENSES, JSON.stringify(expenses));
  }

  static getBudgets(): BudgetLimit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading budgets', e);
    }
    this.saveBudgets(INITIAL_BUDGETS);
    return INITIAL_BUDGETS;
  }

  static saveBudgets(budgets: BudgetLimit[]) {
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
  }

  static getGoals(): FinancialGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.GOALS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Error reading goals', e);
    }
    this.saveGoals(INITIAL_GOALS);
    return INITIAL_GOALS;
  }

  static saveGoals(goals: FinancialGoal[]) {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  /**
   * Genera automáticamente las obligaciones mensuales y los ingresos recurrentes para un mes (YYYY-MM),
   * verificando que no existan previamente para evitar duplicados.
   */
  static generateMonthlyRecurringItems(monthYear: string): {
    generatedFixedCount: number;
    generatedIncomeCount: number;
  } {
    const templates = this.getRecurringTemplates();
    const currentFixed = this.getFixedExpenses();
    const currentIncomes = this.getIncomes();

    let generatedFixedCount = 0;
    let generatedIncomeCount = 0;

    const newFixed: FixedExpense[] = [...currentFixed];
    const newIncomes: Income[] = [...currentIncomes];

    // Split year and month
    const [yearStr, monthStr] = monthYear.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    templates.forEach((tmpl) => {
      if (!tmpl.isActive) return;

      if (tmpl.type === 'fixedExpense') {
        // Verificar si ya existe este mes para esta plantilla
        const alreadyExists = currentFixed.some(
          (f) => f.templateId === tmpl.id && f.monthYear === monthYear
        );

        if (!alreadyExists) {
          const day = Math.min(tmpl.dayOfMonth, daysInMonth);
          const dayFormatted = day < 10 ? `0${day}` : `${day}`;
          const dueDate = `${monthYear}-${dayFormatted}`;

          newFixed.push({
            id: `fix-${monthYear}-${tmpl.id}-${Date.now().toString(36)}`,
            name: tmpl.title,
            category: tmpl.category as any,
            expectedAmount: tmpl.defaultAmount,
            actualPaidAmount: 0,
            dueDate,
            monthYear,
            frequency: 'monthly',
            paymentMethod: tmpl.paymentMethod || 'Transferencia bancaria',
            responsibleMemberId: tmpl.memberId,
            status: 'pending',
            templateId: tmpl.id,
            payments: [],
            notes: 'Generado automáticamente según compromiso mensual recurrente.',
          });
          generatedFixedCount++;
        }
      } else if (tmpl.type === 'income') {
        const alreadyExists = currentIncomes.some(
          (inc) => inc.recurringTemplateId === tmpl.id && inc.monthYear === monthYear
        );

        if (!alreadyExists) {
          const day = Math.min(tmpl.dayOfMonth, daysInMonth);
          const dayFormatted = day < 10 ? `0${day}` : `${day}`;
          const date = `${monthYear}-${dayFormatted}`;

          newIncomes.push({
            id: `inc-${monthYear}-${tmpl.id}-${Date.now().toString(36)}`,
            description: tmpl.title,
            amount: tmpl.defaultAmount,
            category: tmpl.category as any,
            recipientMemberId: tmpl.memberId,
            date,
            frequency: 'monthly',
            status: 'received',
            isRecurring: true,
            monthYear,
            recurringTemplateId: tmpl.id,
            notes: 'Ingreso recurrente planificado.',
          });
          generatedIncomeCount++;
        }
      }
    });

    if (generatedFixedCount > 0) {
      this.saveFixedExpenses(newFixed);
    }
    if (generatedIncomeCount > 0) {
      this.saveIncomes(newIncomes);
    }

    return { generatedFixedCount, generatedIncomeCount };
  }

  /**
   * Resetea toda la base de datos a los datos de demostración
   */
  static resetToDemoData() {
    this.saveHousehold(INITIAL_HOUSEHOLD);
    this.saveMembers(INITIAL_MEMBERS);
    this.saveRecurringTemplates(INITIAL_RECURRING_TEMPLATES);
    this.saveIncomes(INITIAL_INCOMES);
    this.saveFixedExpenses(INITIAL_FIXED_EXPENSES);
    this.saveVariableExpenses(INITIAL_VARIABLE_EXPENSES);
    this.saveBudgets(INITIAL_BUDGETS);
    this.saveGoals(INITIAL_GOALS);
  }

  /**
   * Exporta toda la base de datos a un archivo JSON de respaldo
   */
  static exportDatabaseJSON(): string {
    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      household: this.getHousehold(),
      members: this.getMembers(),
      recurringTemplates: this.getRecurringTemplates(),
      incomes: this.getIncomes(),
      fixedExpenses: this.getFixedExpenses(),
      variableExpenses: this.getVariableExpenses(),
      budgets: this.getBudgets(),
      goals: this.getGoals(),
    };
    return JSON.stringify(backup, null, 2);
  }

  /**
   * Restaura la base de datos desde un JSON
   */
  static importDatabaseJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.household) this.saveHousehold(data.household);
      if (data.members) this.saveMembers(data.members);
      if (data.recurringTemplates) this.saveRecurringTemplates(data.recurringTemplates);
      if (data.incomes) this.saveIncomes(data.incomes);
      if (data.fixedExpenses) this.saveFixedExpenses(data.fixedExpenses);
      if (data.variableExpenses) this.saveVariableExpenses(data.variableExpenses);
      if (data.budgets) this.saveBudgets(data.budgets);
      if (data.goals) this.saveGoals(data.goals);
      return true;
    } catch (e) {
      console.error('Failed to import database', e);
      return false;
    }
  }
}
