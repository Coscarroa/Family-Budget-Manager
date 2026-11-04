export type CurrencyCode = 'USD' | 'EUR' | 'MXN' | 'COP' | 'ARS' | 'CLP' | 'PEN';
export type AppLanguage = 'es' | 'en';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  locale: string;
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', name: 'Dólar estadounidense (USD)', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)', locale: 'es-ES' },
  MXN: { code: 'MXN', symbol: '$', name: 'Peso mexicano (MXN)', locale: 'es-MX' },
  COP: { code: 'COP', symbol: '$', name: 'Peso colombiano (COP)', locale: 'es-CO' },
  ARS: { code: 'ARS', symbol: '$', name: 'Peso argentino (ARS)', locale: 'es-AR' },
  CLP: { code: 'CLP', symbol: '$', name: 'Peso chileno (CLP)', locale: 'es-CL' },
  PEN: { code: 'PEN', symbol: 'S/', name: 'Sol peruano (PEN)', locale: 'es-PE' },
};

export type SystemRole = 'superadmin' | 'admin' | 'editor' | 'viewer';

export interface FamilyMember {
  id: string;
  name: string;
  role: string; // e.g. "Padre", "Madre", "Hijo", etc.
  systemRole?: SystemRole; // 'superadmin' | 'admin' | 'editor' | 'viewer'
  avatarColor: string;
  isMainEarner?: boolean;
  email?: string;
  phone?: string;
  biometricEnabled?: boolean;
  monthlyContribution?: number;
  isActive?: boolean;
  notes?: string;
}

export interface AuthSession {
  user: FamilyMember;
  loginTime: string;
  method: 'otp' | 'biometric';
}

export interface HouseholdVariables {
  emergencyFundMonths: number; // e.g. 6 months
  targetSavingsRate: number; // e.g. 20%
  alertThresholdPercent: number; // e.g. 80%
  defaultPaymentMethod: PaymentMethod;
  customCategories: string[];
}

export interface Household {
  id: string;
  name: string;
  currency: CurrencyCode;
  language: AppLanguage;
  budgetCycleStartDay: number;
  pinProtected: boolean;
  pinCode?: string;
  members: FamilyMember[];
  variables: HouseholdVariables;
}

export type IncomeCategory =
  | 'Salario principal'
  | 'Salario cónyuge'
  | 'Trabajo independiente'
  | 'Freelance'
  | 'Alquileres'
  | 'Negocios'
  | 'Inversiones'
  | 'Otros ingresos';

export type IncomeFrequency = 'unique' | 'weekly' | 'biweekly' | 'monthly' | 'annual';
export type IncomeStatus = 'received' | 'pending';

export interface Income {
  id: string;
  description: string;
  amount: number;
  category: IncomeCategory;
  recipientMemberId: string;
  date: string; // YYYY-MM-DD
  frequency: IncomeFrequency;
  status: IncomeStatus;
  isRecurring: boolean;
  nextDate?: string;
  notes?: string;
  monthYear: string; // YYYY-MM
  recurringTemplateId?: string;
}

export type FixedExpenseCategory =
  | 'Hipoteca o alquiler'
  | 'Electricidad'
  | 'Agua'
  | 'Gas'
  | 'Internet'
  | 'Teléfono móvil'
  | 'Seguro del automóvil'
  | 'Seguro médico'
  | 'Préstamos'
  | 'Tarjetas de crédito'
  | 'Vehículos'
  | 'Guardería o educación'
  | 'Suscripciones'
  | 'Otros compromisos';

export type ExpenseStatus = 'pending' | 'paid' | 'overdue' | 'partial';
export type PaymentFrequency = 'monthly' | 'bimonthly' | 'quarterly' | 'annual';
export type PaymentMethod =
  | 'Transferencia bancaria'
  | 'Tarjeta de débito'
  | 'Tarjeta de crédito'
  | 'Domiciliación bancaria'
  | 'Efectivo'
  | 'Otro';

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  notes?: string;
}

export interface FixedExpense {
  id: string;
  name: string;
  category: FixedExpenseCategory;
  expectedAmount: number;
  actualPaidAmount: number; // accumulated payments
  dueDate: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  frequency: PaymentFrequency;
  paymentMethod: PaymentMethod;
  responsibleMemberId: string;
  status: ExpenseStatus;
  paidDate?: string;
  isSuspended?: boolean;
  templateId?: string; // id of recurring rule
  notes?: string;
  payments: PaymentRecord[];
  receiptImageUrl?: string;
}

export type VariableExpenseCategory =
  | 'Supermercado'
  | 'Restaurantes'
  | 'Combustible'
  | 'Transporte'
  | 'Salud'
  | 'Farmacia'
  | 'Entretenimiento'
  | 'Compras personales'
  | 'Ropa'
  | 'Mantenimiento del hogar'
  | 'Mascotas'
  | 'Educación complementaria'
  | 'Extraordinario'
  | 'Otros';

export interface VariableExpense {
  id: string;
  description: string;
  amount: number;
  category: VariableExpenseCategory;
  date: string; // YYYY-MM-DD
  monthYear: string; // YYYY-MM
  memberId: string;
  paymentMethod: PaymentMethod;
  isExtraordinary: boolean;
  notes?: string;
  receiptImageUrl?: string;
}

export interface BudgetLimit {
  id: string;
  category: string;
  monthlyLimit: number;
  monthYear: string; // YYYY-MM
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
  notes?: string;
}

export interface RecurringTemplate {
  id: string;
  type: 'income' | 'fixedExpense';
  title: string;
  category: string;
  defaultAmount: number;
  dayOfMonth: number;
  frequency: string;
  memberId: string;
  isActive: boolean;
  paymentMethod?: PaymentMethod;
  notes?: string;
}

export interface MonthFinancialSummary {
  monthYear: string;
  totalIncomeReceived: number;
  totalIncomePending: number;
  totalIncomeExpected: number;
  
  fixedExpensesPaid: number;
  fixedExpensesPending: number;
  fixedExpensesTotalExpected: number;

  variableExpensesTotal: number;
  extraordinaryExpensesTotal: number;

  totalExpensesExecuted: number; // fixed paid + variable + extraordinary
  committedExpenses: number; // fixed pending + remaining budgeted variable

  availableBalance: number; // received income - executed expenses
  projectedNetSavings: number; // received income - total expected expenses

  savingsRate: number; // (received income - executed expenses) / received income * 100
  percentageIncomeCommitted: number;

  prevMonthComparison?: {
    incomeChangePercent: number;
    expensesChangePercent: number;
    savingsChangePercent: number;
  };
}

export type ActiveTab =
  | 'dashboard'
  | 'fixedExpenses'
  | 'incomes'
  | 'variableExpenses'
  | 'budget'
  | 'calendar'
  | 'reports'
  | 'goals'
  | 'users';

export interface ScannedReceiptData {
  title: string;
  amount: number;
  date: string; // YYYY-MM-DD
  category: string;
  suggestedType: 'fixedExpense' | 'variable';
  isExtraordinary?: boolean;
  paymentMethod?: PaymentMethod;
  notes?: string;
  confidenceScore?: number;
}
