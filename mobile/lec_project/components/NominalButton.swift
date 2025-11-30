//
//  NominalButton.swift
//  tugas
//
//  Created by prk on 07/10/25.
//

import SwiftUI

struct NominalButton: View {
    let amount: Int
    let isSelected: Bool
    let action: () -> Void
    
    private var currencyFormater: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.locale = Locale(identifier: "id_ID")
        formatter.maximumFractionDigits = 0
        return formatter
    }()
    
    init(amount: Int, isSelected: Bool, action: @escaping () -> Void) {
        self.amount = amount
        self.isSelected = isSelected
        self.action = action
    }
    
    var body: some View {
        Button(action: action){
            VStack {
                Image(systemName: "banknote.fill")
                    .font(.title)
                    .foregroundColor(isSelected ? .green : .red)
                
                Text(currencyFormater.string(from: NSNumber(value: amount)) ?? "")
                    .fontWeight(.bold)
                    .foregroundColor(.white)
            }
            .padding()
            .frame(maxWidth: .infinity, minHeight: 80)
            .background(Color(hex: 0x2D1D1D))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.green : Color.clear, lineWidth: 2)
            )
        }
    }
}

#Preview {
    VStack(spacing: 20){
        Text("Contoh tidak dipilih")
        NominalButton(amount: 49000, isSelected: false, action: {print("Tombol 49000 ditekan")})
        
        Text("Contoh dipilih")
        NominalButton(amount: 49000, isSelected: true, action: {print("Tombol 49000 ditekan")})
        
    }
}
