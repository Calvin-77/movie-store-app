//
//  TopUpView.swift
//  tugas
//
//  Created by prk on 07/10/25.
//

import SwiftUI

struct TopUpView: View {
    @Binding var selectedAmount: Int?
    var onTopUpSuccess: (() -> Void)? = nil
    @Environment(\.dismiss) var dismiss
    @StateObject private var transactionController = TransactionController()
    @State private var isProcessing = false
    @State private var customAmount: String = ""
    
    private let nominals = [10000, 20000, 50000, 100000]
    
    private let gridColumns: [GridItem] = [
        GridItem(.flexible(), spacing: 16),
        GridItem(.flexible(), spacing: 16)
    ]
    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 20){
                Text("Select amount")
                    .font(.title2)
                    .bold()
                    .foregroundColor(.white)
                LazyVGrid(columns: gridColumns, spacing: 16){
                    ForEach(nominals, id: \.self){ amount in
                        NominalButton(
                            amount: amount,
                            isSelected: selectedAmount == amount
                        ) {
                            selectedAmount = amount
                            customAmount = ""
                        }
                    }
                }
                
                HStack {
                    Text("Rp")
                        .foregroundColor(.white)
                        .bold()
                        .font(.title2)
                    
                    TextField("",
                              text: $customAmount,
                              prompt: Text("Type your desired amount").foregroundColor(.white.opacity(0.6))
                          )
                        .keyboardType(.numberPad)
                        .padding()
                        .background(Color(hex: 0x2D1D1D))
                        .cornerRadius(12)
                        .overlay(RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.green, lineWidth: selectedAmount == nil && !customAmount.isEmpty ? 2 : 0))
                        .onChange(of: customAmount) { oldValue, newValue in
                            if !newValue.isEmpty, let amount = Int(newValue) {
                                selectedAmount = amount
                            } else if newValue.isEmpty {
                                selectedAmount = nil
                            }
                        }
                        .foregroundStyle(.white)
                }
                
                Spacer()
                
                Button(action: {
                    guard let amount = selectedAmount, amount > 0, !isProcessing else {
                        return
                    }
                    Task {
                        isProcessing = true
                        do {
                            try await transactionController.topUpBalance(amount: amount)
                            // Call success callback to refresh balance
                            onTopUpSuccess?()
                            dismiss()
                        } catch {
                            // TODO: Show error alert to user
                        }
                        isProcessing = false
                    }
                }){
                    Text(isProcessing ? "Memproses..." : "Confirm")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .foregroundColor(.white)
                        .background((selectedAmount != nil && selectedAmount! > 0 && !isProcessing) ? Color.green : Color.gray)
                        .cornerRadius(12)
                }
                .disabled(selectedAmount == nil || selectedAmount! <= 0 || isProcessing)
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar{
                ToolbarItem(placement: .principal) {
                    Text("Top Up")
                        .font(.title)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                ToolbarItem(placement: .navigationBarLeading){
                    Button{
                        selectedAmount = nil
                        customAmount = ""
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .foregroundColor(.white)
                    }
                }
            }
            .toolbarBackground(Color(hex: 0x211111), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .onAppear {
                // Reset selection when view appears
                if selectedAmount == nil {
                    customAmount = ""
                }
            }
            .background(Color(hex: 0x211111))
        }
    }
}

#Preview {
    TopUpView(selectedAmount: .constant(nil))
}
