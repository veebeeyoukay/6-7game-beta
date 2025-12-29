//
//  BrandColors.swift
//  the6-7game Watch App
//
//  6-7 Game Brand Design System
//  Type-safe color references for consistent UI
//

import SwiftUI

// MARK: - Brand Colors Extension

extension Color {
    // Primary Palette (from Creative Brief)
    // NOTE: These are commented out because Xcode automatically generates symbols for Assets.
    // Uncomment if you disable "Generate Swift Asset Symbol Extensions" in Build Settings.
    
    /*
    static let brandNavy = Color("BrandNavy")           // #1A1A2E - Primary backgrounds
    static let brandBlue = Color("BrandBlue")           // #4361EE - CTAs, interactive elements
    static let brandTeal = Color("BrandTeal")           // #00D9FF - Accents, success states
    static let brandGold = Color("BrandGold")           // #FFD700 - Mollars, rewards
    static let brandMagenta = Color("BrandMagenta")     // #E91E8C - Primary action (the "7")
    static let brandGreen = Color("BrandGreen")         // #7FFF00 - Accents (the "6")

    // Mollar Tier Colors
    static let mollarBronze = Color("MollarBronze")     // #B87333
    static let mollarSilver = Color("MollarSilver")     // #C0C0C0
    */
    static let mollarGold = Color("BrandGold")          // #FFD700 (same as brandGold) - ALIAS, No Asset
    /*
    static let mollarDiamond = Color("MollarDiamond")   // #B9F2FF
    */
}

// MARK: - Semantic Color Aliases

extension Color {
    // Backgrounds
    static let backgroundPrimary = Color.brandNavy

    // Interactive Elements
    static let buttonPrimary = Color.brandMagenta
    static let buttonSecondary = Color.brandBlue
    static let buttonSuccess = Color.brandTeal

    // Currency & Rewards
    static let mollars = Color.brandGold

    // Status
    static let statusActive = Color.brandTeal
    static let statusBattle = Color.brandMagenta
}

// MARK: - Mollar Tier Helper

enum MollarTier: String {
    case bronze
    case silver
    case gold
    case diamond

    var color: Color {
        switch self {
        case .bronze:
            return .mollarBronze
        case .silver:
            return .mollarSilver
        case .gold:
            return .mollarGold
        case .diamond:
            return .mollarDiamond
        }
    }
}
