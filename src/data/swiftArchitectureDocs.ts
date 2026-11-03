export interface SwiftFileDoc {
  id: string;
  filename: string;
  path: string;
  category: 'models' | 'services' | 'viewmodels' | 'views' | 'tests' | 'architecture';
  description: string;
  code: string;
}

export const SWIFT_ARCHITECTURE_FILES: SwiftFileDoc[] = [
  {
    id: 'arch-overview',
    filename: 'SYSTEM_ARCHITECTURE.md',
    path: 'Docs/SYSTEM_ARCHITECTURE.md',
    category: 'architecture',
    description: 'Documento completo de arquitectura del sistema, diagramas MVVM, Modelo Entidad-Relación y guía técnica.',
    code: `# ARQUITECTURA DEL SISTEMA: FAMILY BUDGET MANAGER (iOS / Swift 6 / SwiftUI / SwiftData)

## 1. Principios Arquitectónicos
- **Patrón MVVM (Model-View-ViewModel)** con SwiftUI declarativo.
- **Persistencia**: SwiftData (@Model) con soporte nativo para CloudKit (NSPersistentCloudKitContainer automático).
- **Tipos de Precisión Monetaria**: Uso estricto de \`Decimal\` y \`Foundation.Decimal\` para evitar errores de coma flotante.
- **Servicios Puros & Desacoplados**: Lógica de cálculo financiero inyectada como protocolos testeables (\`FinancialCalculatorServiceProtocol\`).
- **Inmutabilidad Histórica**: Las transacciones pasadas nunca se alteran al cambiar plantillas recurrentes.

## 2. Diagrama MVVM
\`\`\`
+-------------------------------------------------------------+
|                      SWIFTUI VIEWS                          |
|  - DashboardView        - FixedExpensesView                 |
|  - IncomesListView      - BudgetLimitsView                  |
|  - FinancialCalendar    - ReportsView                       |
|  - SavingsGoalsView     - HouseholdSettingsView             |
+------------------------------+------------------------------+
                               | (Binding / @Observable)
                               v
+-------------------------------------------------------------+
|                     VIEW MODELS                             |
|  - DashboardViewModel                                       |
|  - FixedExpensesViewModel                                   |
|  - BudgetViewModel                                          |
|  - IncomesViewModel                                         |
+------------------------------+------------------------------+
                               | (Invocaciones a Servicios)
                               v
+-------------------------------------------------------------+
|                 SERVICES & BUSINESS LOGIC                   |
|  - FinancialCalculatorService                               |
|  - RecurringEngineService                                   |
|  - BiometricAuthService (LocalAuthentication)               |
|  - NotificationService (UserNotifications)                  |
+------------------------------+------------------------------+
                               | (CRUD SwiftData Context)
                               v
+-------------------------------------------------------------+
|                   SWIFTDATA LOCAL STORAGE                   |
|  - ModelContainer / ModelConfiguration                      |
|  - @Model Household                                         |
|  - @Model FamilyMember                                      |
|  - @Model Income                                            |
|  - @Model FixedExpense                                      |
|  - @Model VariableExpense                                   |
|  - @Model BudgetLimit                                       |
|  - @Model FinancialGoal                                     |
|  - @Model RecurringTemplate                                 |
+-------------------------------------------------------------+
\`\`\`

## 3. Modelo Entidad-Relación (ERD)
\`\`\`
+--------------------+       1:N       +----------------------+
|     Household      | --------------> |     FamilyMember     |
| - id: UUID         |                 | - id: UUID           |
| - name: String     |                 | - name: String       |
| - currency: String |                 | - role: String       |
| - cycleDay: Int    |                 | - avatarColor: String|
+--------------------+                 +----------------------+
          |                                       |
          | 1:N                                   | 1:N
          v                                       v
+--------------------+                 +----------------------+
|    BudgetLimit     |                 |        Income        |
| - id: UUID         |                 | - id: UUID           |
| - category: String |                 | - amount: Decimal    |
| - monthlyLimit: Dec|                 | - status: Status     |
| - monthYear: String|                 | - date: Date         |
+--------------------+                 +----------------------+
          |                                       |
          v                                       v
+--------------------+       1:N       +----------------------+
|  RecurringTemplate | --------------> |     FixedExpense     |
| - id: UUID         |                 | - id: UUID           |
| - defaultAmount:Dec|                 | - expectedAmount: Dec|
| - dayOfMonth: Int  |                 | - paidAmount: Decimal|
| - category: String |                 | - dueDate: Date      |
+--------------------+                 | - status: ExpStatus  |
                                       +----------------------+
                                                  | 1:N
                                                  v
                                       +----------------------+
                                       |    PaymentRecord     |
                                       | - id: UUID           |
                                       | - amount: Decimal    |
                                       | - date: Date         |
                                       +----------------------+
\`\`\`
`,
  },
  {
    id: 'swift-models',
    filename: 'Models.swift',
    path: 'FamilyBudget/Models/Models.swift',
    category: 'models',
    description: 'Modelos de datos SwiftData con @Model, relaciones, validaciones y uso de Decimal.',
    code: `import Foundation
import SwiftData

// MARK: - Household (Hogar)
@Model
public final class Household {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var currencyCode: String
    public var budgetCycleStartDay: Int
    public var pinProtected: Bool
    public var pinHash: String?
    
    @Relationship(deleteRule: .cascade, inverse: \\FamilyMember.household)
    public var members: [FamilyMember] = []
    
    public init(name: String, currencyCode: String = "USD", budgetCycleStartDay: Int = 1) {
        self.id = UUID()
        self.name = name
        self.currencyCode = currencyCode
        self.budgetCycleStartDay = budgetCycleStartDay
        self.pinProtected = false
    }
}

// MARK: - FamilyMember (Miembro)
@Model
public final class FamilyMember {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var role: String
    public var avatarColorHex: String
    public var isMainEarner: Bool
    public var household: Household?
    
    public init(name: String, role: String, avatarColorHex: String = "#007AFF", isMainEarner: Bool = true) {
        self.id = UUID()
        self.name = name
        self.role = role
        self.avatarColorHex = avatarColorHex
        self.isMainEarner = isMainEarner
    }
}

// MARK: - Income (Ingreso)
@Model
public final class Income {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var amount: Decimal
    public var category: String
    public var recipientMemberId: UUID?
    public var date: Date
    public var frequency: String
    public var isReceived: Bool
    public var isRecurring: Bool
    public var monthYear: String // "2026-11"
    public var notes: String?
    public var templateId: UUID?
    
    public init(
        title: String,
        amount: Decimal,
        category: String,
        recipientMemberId: UUID? = nil,
        date: Date = Date(),
        frequency: String = "monthly",
        isReceived: Bool = true,
        isRecurring: Bool = false,
        monthYear: String,
        notes: String? = nil,
        templateId: UUID? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.amount = max(0, amount)
        self.category = category
        self.recipientMemberId = recipientMemberId
        self.date = date
        self.frequency = frequency
        self.isReceived = isReceived
        self.isRecurring = isRecurring
        self.monthYear = monthYear
        self.notes = notes
        self.templateId = templateId
    }
}

// MARK: - FixedExpense (Gasto Fijo Mensual)
@Model
public final class FixedExpense {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var category: String
    public var expectedAmount: Decimal
    public var actualPaidAmount: Decimal
    public var dueDate: Date
    public var monthYear: String
    public var frequency: String
    public var paymentMethod: String
    public var responsibleMemberId: UUID?
    public var statusRaw: String // "pending", "paid", "overdue", "partial"
    public var paidDate: Date?
    public var isSuspended: Bool
    public var templateId: UUID?
    public var notes: String?
    
    @Relationship(deleteRule: .cascade)
    public var payments: [PaymentRecord] = []
    
    public var pendingAmount: Decimal {
        max(0, expectedAmount - actualPaidAmount)
    }
    
    public init(
        name: String,
        category: String,
        expectedAmount: Decimal,
        dueDate: Date,
        monthYear: String,
        frequency: String = "monthly",
        paymentMethod: String = "Transferencia",
        responsibleMemberId: UUID? = nil,
        templateId: UUID? = nil,
        notes: String? = nil
    ) {
        self.id = UUID()
        self.name = name
        self.category = category
        self.expectedAmount = max(0, expectedAmount)
        self.actualPaidAmount = 0
        self.dueDate = dueDate
        self.monthYear = monthYear
        self.frequency = frequency
        self.paymentMethod = paymentMethod
        self.responsibleMemberId = responsibleMemberId
        self.statusRaw = "pending"
        self.isSuspended = false
        self.templateId = templateId
        self.notes = notes
    }
}

// MARK: - PaymentRecord (Registro de Pago / Parcial)
@Model
public final class PaymentRecord {
    @Attribute(.unique) public var id: UUID
    public var amount: Decimal
    public var date: Date
    public var method: String
    public var notes: String?
    
    public init(amount: Decimal, date: Date = Date(), method: String = "Transferencia", notes: String? = nil) {
        self.id = UUID()
        self.amount = max(0, amount)
        self.date = date
        self.method = method
        self.notes = notes
    }
}

// MARK: - VariableExpense (Gasto Variable y Extraordinario)
@Model
public final class VariableExpense {
    @Attribute(.unique) public var id: UUID
    public var title: String
    public var amount: Decimal
    public var category: String
    public var date: Date
    public var monthYear: String
    public var memberId: UUID?
    public var paymentMethod: String
    public var isExtraordinary: Bool
    public var notes: String?
    
    public init(
        title: String,
        amount: Decimal,
        category: String,
        date: Date = Date(),
        monthYear: String,
        memberId: UUID? = nil,
        paymentMethod: String = "Tarjeta",
        isExtraordinary: Bool = false,
        notes: String? = nil
    ) {
        self.id = UUID()
        self.title = title
        self.amount = max(0, amount)
        self.category = category
        self.date = date
        self.monthYear = monthYear
        self.memberId = memberId
        self.paymentMethod = paymentMethod
        self.isExtraordinary = isExtraordinary
        self.notes = notes
    }
}

// MARK: - BudgetLimit (Presupuesto por Categoría)
@Model
public final class BudgetLimit {
    @Attribute(.unique) public var id: UUID
    public var category: String
    public var monthlyLimit: Decimal
    public var monthYear: String
    
    public init(category: String, monthlyLimit: Decimal, monthYear: String) {
        self.id = UUID()
        self.category = category
        self.monthlyLimit = max(0, monthlyLimit)
        self.monthYear = monthYear
    }
}

// MARK: - FinancialGoal (Objetivo de Ahorro)
@Model
public final class FinancialGoal {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var targetAmount: Decimal
    public var currentAmount: Decimal
    public var targetDate: Date
    public var category: String
    public var notes: String?
    
    public var progressPercentage: Double {
        guard targetAmount > 0 else { return 0 }
        let current = NSDecimalNumber(decimal: currentAmount).doubleValue
        let target = NSDecimalNumber(decimal: targetAmount).doubleValue
        return min(100.0, (current / target) * 100.0)
    }
    
    public init(name: String, targetAmount: Decimal, currentAmount: Decimal = 0, targetDate: Date, category: String = "General") {
        self.id = UUID()
        self.name = name
        self.targetAmount = max(0, targetAmount)
        self.currentAmount = max(0, currentAmount)
        self.targetDate = targetDate
        self.category = category
    }
}
`,
  },
  {
    id: 'swift-service',
    filename: 'FinancialCalculatorService.swift',
    path: 'FamilyBudget/Services/FinancialCalculatorService.swift',
    category: 'services',
    description: 'Servicio de cálculo financiero en Swift con fórmulas matemáticas exactas.',
    code: `import Foundation

public struct MonthlySummaryResult: Equatable {
    public let monthYear: String
    public let totalIncomeReceived: Decimal
    public let totalIncomePending: Decimal
    public let totalIncomeExpected: Decimal
    public let fixedExpensesPaid: Decimal
    public let fixedExpensesPending: Decimal
    public let variableExpensesTotal: Decimal
    public let extraordinaryExpensesTotal: Decimal
    public let totalExpensesExecuted: Decimal
    public let availableBalance: Decimal
    public let committedExpenses: Decimal
    public let savingsRate: Double
}

public protocol FinancialCalculatorServiceProtocol {
    func calculateSummary(
        monthYear: String,
        incomes: [Income],
        fixedExpenses: [FixedExpense],
        variableExpenses: [VariableExpense],
        budgets: [BudgetLimit]
    ) -> MonthlySummaryResult
}

public final class FinancialCalculatorService: FinancialCalculatorServiceProtocol {
    public static let shared = FinancialCalculatorService()
    public init() {}
    
    public func calculateSummary(
        monthYear: String,
        incomes: [Income],
        fixedExpenses: [FixedExpense],
        variableExpenses: [VariableExpense],
        budgets: [BudgetLimit]
    ) -> MonthlySummaryResult {
        // 1. Filtrar por mes
        let mIncomes = incomes.filter { $0.monthYear == monthYear }
        let mFixed = fixedExpenses.filter { $0.monthYear == monthYear && !$0.isSuspended }
        let mVariable = variableExpenses.filter { $0.monthYear == monthYear }
        
        // 2. Ingresos recibidos vs pendientes
        var receivedIncome: Decimal = 0
        var pendingIncome: Decimal = 0
        for inc in mIncomes {
            if inc.isReceived {
                receivedIncome += inc.amount
            } else {
                pendingIncome += inc.amount
            }
        }
        let totalIncomeExpected = receivedIncome + pendingIncome
        
        // 3. Gastos Fijos
        var fixedPaid: Decimal = 0
        var fixedPending: Decimal = 0
        for fix in mFixed {
            fixedPaid += fix.actualPaidAmount
            fixedPending += fix.pendingAmount
        }
        
        // 4. Gastos Variables y Extraordinarios
        var varTotal: Decimal = 0
        var extraTotal: Decimal = 0
        var categorySpent: [String: Decimal] = [:]
        
        for exp in mVariable {
            if exp.isExtraordinary {
                extraTotal += exp.amount
            } else {
                varTotal += exp.amount
            }
            categorySpent[exp.category, default: 0] += exp.amount
        }
        
        // 5. Total Gastos Ejecutados
        let totalExpensesExecuted = fixedPaid + varTotal + extraTotal
        
        // 6. Balance Disponible = Ingresos Recibidos - Gastos Ejecutados
        let availableBalance = receivedIncome - totalExpensesExecuted
        
        // 7. Gastos Comprometidos = Fijos Pendientes + Variables Presupuestados Pendientes
        var remainingBudget: Decimal = 0
        let mBudgets = budgets.filter { $0.monthYear == monthYear }
        for b in mBudgets {
            let spent = categorySpent[b.category, default: 0]
            if b.monthlyLimit > spent {
                remainingBudget += (b.monthlyLimit - spent)
            }
        }
        let committedExpenses = fixedPending + remainingBudget
        
        // 8. Tasa de Ahorro: (Ingresos recibidos - Gastos ejecutados) / Ingresos recibidos * 100
        var savingsRate: Double = 0
        if receivedIncome > 0 {
            let num = NSDecimalNumber(decimal: availableBalance).doubleValue
            let den = NSDecimalNumber(decimal: receivedIncome).doubleValue
            savingsRate = (num / den) * 100.0
        }
        
        return MonthlySummaryResult(
            monthYear: monthYear,
            totalIncomeReceived: receivedIncome,
            totalIncomePending: pendingIncome,
            totalIncomeExpected: totalIncomeExpected,
            fixedExpensesPaid: fixedPaid,
            fixedExpensesPending: fixedPending,
            variableExpensesTotal: varTotal,
            extraordinaryExpensesTotal: extraTotal,
            totalExpensesExecuted: totalExpensesExecuted,
            availableBalance: availableBalance,
            committedExpenses: committedExpenses,
            savingsRate: savingsRate
        )
    }
}
`,
  },
  {
    id: 'swift-viewmodel',
    filename: 'DashboardViewModel.swift',
    path: 'FamilyBudget/ViewModels/DashboardViewModel.swift',
    category: 'viewmodels',
    description: 'ViewModel reactivo en Swift 6 con @Observable para gestionar el estado del Dashboard.',
    code: `import Foundation
import Observation
import SwiftData

@Observable
public final class DashboardViewModel {
    public var selectedMonthYear: String
    public var currentSummary: MonthlySummaryResult?
    public var overdueExpenses: [FixedExpense] = []
    public var upcomingExpenses: [FixedExpense] = []
    public var budgetAlerts: [(category: String, percent: Double, overLimit: Bool)] = []
    
    private let calculator: FinancialCalculatorServiceProtocol
    
    public init(calculator: FinancialCalculatorServiceProtocol = FinancialCalculatorService.shared) {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        self.selectedMonthYear = formatter.string(from: Date())
        self.calculator = calculator
    }
    
    public func refresh(
        incomes: [Income],
        fixedExpenses: [FixedExpense],
        variableExpenses: [VariableExpense],
        budgets: [BudgetLimit]
    ) {
        self.currentSummary = calculator.calculateSummary(
            monthYear: selectedMonthYear,
            incomes: incomes,
            fixedExpenses: fixedExpenses,
            variableExpenses: variableExpenses,
            budgets: budgets
        )
        
        let now = Date()
        self.overdueExpenses = fixedExpenses.filter {
            $0.monthYear == selectedMonthYear &&
            !$0.isSuspended &&
            $0.statusRaw != "paid" &&
            $0.dueDate < now &&
            $0.pendingAmount > 0
        }
        
        let calendar = Calendar.current
        let fiveDaysOut = calendar.date(byAdding: .day, value: 5, to: now) ?? now
        self.upcomingExpenses = fixedExpenses.filter {
            $0.monthYear == selectedMonthYear &&
            !$0.isSuspended &&
            $0.statusRaw != "paid" &&
            $0.dueDate >= now &&
            $0.dueDate <= fiveDaysOut
        }
    }
}
`,
  },
  {
    id: 'swift-tests',
    filename: 'FinancialCalculationsTests.swift',
    path: 'FamilyBudgetTests/FinancialCalculationsTests.swift',
    category: 'tests',
    description: 'Batería de pruebas unitarias XCTest para verificar matemáticamente las reglas de negocio.',
    code: `import XCTest
@testable import FamilyBudget

final class FinancialCalculationsTests: XCTestCase {
    var sut: FinancialCalculatorService!
    
    override func setUp() {
        super.setUp()
        sut = FinancialCalculatorService()
    }
    
    func testAvailableBalanceAndZeroDuplication() {
        // GIVEN:
        // Ingresos: $5000 recibido, $1000 pendiente
        let inc1 = Income(title: "Salario", amount: 5000, category: "Salario", isReceived: true, monthYear: "2026-11")
        let inc2 = Income(title: "Bonus", amount: 1000, category: "Bonus", isReceived: false, monthYear: "2026-11")
        
        // Fijos: $1500 esperado con $1000 pagado ($500 pendiente)
        let fix1 = FixedExpense(name: "Hipoteca", category: "Vivienda", expectedAmount: 1500, dueDate: Date(), monthYear: "2026-11")
        fix1.actualPaidAmount = 1000
        
        // Variables: $400 ejecutado
        let var1 = VariableExpense(title: "Super", amount: 400, category: "Supermercado", monthYear: "2026-11")
        
        // Presupuesto Supermercado: $600 límite -> Pendiente presupuestado = $600 - $400 = $200
        let bud1 = BudgetLimit(category: "Supermercado", monthlyLimit: 600, monthYear: "2026-11")
        
        // WHEN:
        let summary = sut.calculateSummary(
            monthYear: "2026-11",
            incomes: [inc1, inc2],
            fixedExpenses: [fix1],
            variableExpenses: [var1],
            budgets: [bud1]
        )
        
        // THEN:
        // 1. Ingresos recibidos = 5000
        XCTAssertEqual(summary.totalIncomeReceived, 5000)
        // 2. Gastos ejecutados = 1000 (fijo pagado) + 400 (variable) = 1400
        XCTAssertEqual(summary.totalExpensesExecuted, 1400)
        // 3. Balance disponible = 5000 - 1400 = 3600
        XCTAssertEqual(summary.availableBalance, 3600)
        // 4. Gastos comprometidos = 500 (fijo pendiente) + 200 (variable presupuesto remanente) = 700
        XCTAssertEqual(summary.committedExpenses, 700)
        // 5. Tasa de ahorro = (5000 - 1400) / 5000 * 100 = 72.0%
        XCTAssertEqual(summary.savingsRate, 72.0, accuracy: 0.01)
    }
}
`,
  },
  {
    id: 'swift-xcode-instructions',
    filename: 'XCODE_COMPILATION_GUIDE.md',
    path: 'Docs/XCODE_COMPILATION_GUIDE.md',
    category: 'architecture',
    description: 'Instrucciones paso a paso para compilar y ejecutar en Xcode 16 / iOS 18.',
    code: `# GUÍA DE COMPILACIÓN Y DESPLIEGUE EN XCODE

## Requisitos Previos
- macOS Sequoia 15.0 o posterior
- Xcode 16.0 o posterior (compatible con Swift 6 y SwiftData)
- Simulador de iOS 18.0+ o iPhone físico

## Paso 1: Crear el Proyecto en Xcode
1. Abre Xcode -> File -> New -> Project...
2. Selecciona **iOS** -> **App**.
3. Configuración:
   - **Product Name**: \`FamilyBudgetManager\`
   - **Organization Identifier**: \`com.tuorganizacion.familybudget\`
   - **Interface**: \`SwiftUI\`
   - **Language**: \`Swift\`
   - **Storage**: \`SwiftData\`
   - Marca la casilla **Host in CloudKit** si deseas sincronización automática con iCloud.
4. Pulsa **Next** y guarda en tu directorio preferido.

## Paso 2: Copiar los Archivos de Código
Copia los archivos proporcionados en sus respectivas carpetas:
- \`Models/Models.swift\` -> Dentro del grupo \`Models\`
- \`Services/FinancialCalculatorService.swift\` -> Grupo \`Services\`
- \`ViewModels/DashboardViewModel.swift\` -> Grupo \`ViewModels\`
- \`Views/...\` -> Grupo \`Views\`
- \`FamilyBudgetTests/FinancialCalculationsTests.swift\` -> Target de Tests

## Paso 3: Configurar Capacidades (Signing & Capabilities)
1. Selecciona el target principal en la barra lateral.
2. Ve a la pestaña **Signing & Capabilities**:
   - Pulsa **+ Capability** y añade **iCloud** -> Marca **CloudKit**.
   - Pulsa **+ Capability** y añade **Background Modes** -> Marca **Remote notifications**.
   - Pulsa **+ Capability** y añade **App Groups** (para Widgets de pantalla de inicio).

## Paso 4: Configurar Permisos en Info.plist
Añade las claves de privacidad:
- \`NSFaceIDUsageDescription\`: *"Family Budget Manager utiliza Face ID para proteger la privacidad de las finanzas de su hogar."*

## Paso 5: Ejecutar Pruebas Unitarias
- Pulsa \`Cmd + U\` para ejecutar la suite de pruebas unitarias financieras.
- Verifica que todos los tests pasen exitosamente con marca verde.

## Paso 6: Compilar y Ejecutar en el Simulador
- Selecciona el esquema **FamilyBudgetManager** y el simulador **iPhone 16 Pro**.
- Pulsa \`Cmd + R\` para compilar y lanzar la aplicación.
`,
  },
];
