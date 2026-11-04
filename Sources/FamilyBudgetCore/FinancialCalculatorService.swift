import Foundation

public struct MonthlyFinancialSummary: Sendable {
    public let totalExpectedIncome: Decimal
    public let receivedIncome: Decimal
    public let pendingIncome: Decimal
    
    public let expectedFixedExpenses: Decimal
    public let paidFixedExpenses: Decimal
    public let pendingFixedExpenses: Decimal
    
    public let variableExpensesTotal: Decimal
    public let totalExpensesExecuted: Decimal
    public let availableBalance: Decimal
    public let committedExpenses: Decimal
    public let savingsRate: Decimal
}

public protocol FinancialCalculatorServiceProtocol: Sendable {
    func calculateSummary(
        incomes: [Income],
        fixedExpenses: [FixedExpense],
        variableExpenses: [VariableExpense]
    ) -> MonthlyFinancialSummary
}

public final class FinancialCalculatorService: FinancialCalculatorServiceProtocol {
    public static let shared = FinancialCalculatorService()
    
    public init() {}
    
    public func calculateSummary(
        incomes: [Income],
        fixedExpenses: [FixedExpense],
        variableExpenses: [VariableExpense]
    ) -> MonthlyFinancialSummary {
        let totalExpectedIncome = incomes.reduce(Decimal.zero) { $0 + $1.amount }
        let receivedIncome = incomes.filter { $0.isReceived }.reduce(Decimal.zero) { $0 + $1.amount }
        let pendingIncome = totalExpectedIncome - receivedIncome
        
        let activeFixed = fixedExpenses.filter { !$0.isSuspended }
        let expectedFixed = activeFixed.reduce(Decimal.zero) { $0 + $1.expectedAmount }
        let paidFixed = activeFixed.reduce(Decimal.zero) { $0 + $1.actualPaidAmount }
        let pendingFixed = max(Decimal.zero, expectedFixed - paidFixed)
        
        let variableTotal = variableExpenses.reduce(Decimal.zero) { $0 + $1.amount }
        let totalExecuted = paidFixed + variableTotal
        let availableBalance = receivedIncome - totalExecuted
        let committed = pendingFixed
        
        let savingsRate: Decimal
        if receivedIncome > 0 {
            savingsRate = ((receivedIncome - totalExecuted) / receivedIncome) * 100
        } else {
            savingsRate = 0
        }
        
        return MonthlyFinancialSummary(
            totalExpectedIncome: totalExpectedIncome,
            receivedIncome: receivedIncome,
            pendingIncome: pendingIncome,
            expectedFixedExpenses: expectedFixed,
            paidFixedExpenses: paidFixed,
            pendingFixedExpenses: pendingFixed,
            variableExpensesTotal: variableTotal,
            totalExpensesExecuted: totalExecuted,
            availableBalance: availableBalance,
            committedExpenses: committed,
            savingsRate: savingsRate
        )
    }
}
