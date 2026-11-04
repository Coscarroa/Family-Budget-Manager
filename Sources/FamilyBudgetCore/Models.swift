import Foundation
import SwiftData

// MARK: - SystemRole (Roles de Usuario)
public enum SystemRole: String, Codable, Sendable {
    case superadmin
    case admin
    case editor
    case viewer
}

// MARK: - Household (Hogar)
@Model
public final class Household {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var currencyCode: String
    public var budgetCycleStartDay: Int
    public var pinProtected: Bool
    public var pinCode: String?
    
    @Relationship(deleteRule: .cascade, inverse: \FamilyMember.household)
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
    public var systemRoleRaw: String = "editor"
    public var avatarColorHex: String
    public var isMainEarner: Bool
    public var phone: String?
    public var email: String?
    public var biometricEnabled: Bool = true
    public var monthlyContribution: Decimal = 0
    public var isActive: Bool = true
    public var notes: String?
    public var household: Household?
    
    public var systemRole: SystemRole {
        get { SystemRole(rawValue: systemRoleRaw) ?? .editor }
        set { systemRoleRaw = newValue.rawValue }
    }
    
    public init(
        name: String,
        role: String,
        systemRole: SystemRole = .editor,
        phone: String? = nil,
        email: String? = nil,
        avatarColorHex: String = "#007AFF",
        isMainEarner: Bool = true
    ) {
        self.id = UUID()
        self.name = name
        self.role = role
        self.systemRoleRaw = systemRole.rawValue
        self.phone = phone
        self.email = email
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
    public var date: Date
    public var monthYear: String
    public var isReceived: Bool
    public var recipientMemberId: UUID?
    public var notes: String?
    
    public init(title: String, amount: Decimal, category: String, date: Date, isReceived: Bool = true) {
        self.id = UUID()
        self.title = title
        self.amount = amount
        self.category = category
        self.date = date
        self.isReceived = isReceived
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        self.monthYear = formatter.string(from: date)
    }
}

// MARK: - FixedExpense (Gasto Fijo)
@Model
public final class FixedExpense {
    @Attribute(.unique) public var id: UUID
    public var name: String
    public var expectedAmount: Decimal
    public var actualPaidAmount: Decimal
    public var category: String
    public var dueDate: Date
    public var monthYear: String
    public var statusRaw: String // "pending", "paid", "partial", "overdue"
    public var paymentMethod: String
    public var isSuspended: Bool
    public var notes: String?
    
    public init(name: String, expectedAmount: Decimal, category: String, dueDate: Date, paymentMethod: String = "Transferencia") {
        self.id = UUID()
        self.name = name
        self.expectedAmount = expectedAmount
        self.actualPaidAmount = 0
        self.category = category
        self.dueDate = dueDate
        self.statusRaw = "pending"
        self.paymentMethod = paymentMethod
        self.isSuspended = false
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        self.monthYear = formatter.string(from: dueDate)
    }
}

// MARK: - VariableExpense (Gasto Cotidiano)
@Model
public final class VariableExpense {
    @Attribute(.unique) public var id: UUID
    public var expenseDescription: String
    public var amount: Decimal
    public var category: String
    public var date: Date
    public var monthYear: String
    public var isExtraordinary: Bool
    public var paymentMethod: String
    public var receiptImageUrl: String?
    public var notes: String?
    
    public init(description: String, amount: Decimal, category: String, date: Date, isExtraordinary: Bool = false) {
        self.id = UUID()
        self.expenseDescription = description
        self.amount = amount
        self.category = category
        self.date = date
        self.isExtraordinary = isExtraordinary
        self.paymentMethod = "Tarjeta"
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM"
        self.monthYear = formatter.string(from: date)
    }
}
