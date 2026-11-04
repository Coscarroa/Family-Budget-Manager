// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "FamilyBudgetManager",
    platforms: [
        .iOS(.v17),
        .macOS(.v14)
    ],
    products: [
        .library(
            name: "FamilyBudgetCore",
            targets: ["FamilyBudgetCore"]
        ),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "FamilyBudgetCore",
            dependencies: [],
            path: "Sources/FamilyBudgetCore"
        ),
        .testTarget(
            name: "FamilyBudgetCoreTests",
            dependencies: ["FamilyBudgetCore"],
            path: "Tests/FamilyBudgetCoreTests"
        ),
    ]
)
