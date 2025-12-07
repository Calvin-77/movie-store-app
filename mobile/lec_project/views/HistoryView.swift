//
//  HistoryView.swift
//  tugas
//
//  Created by prk on 10/7/25.
//

import SwiftUI

struct HistoryView: View {
    @StateObject private var transactionController = TransactionController()
    @State private var transactions: [Transaction] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter
    }
    
    var body: some View {
        ZStack {
            Color(Color(hex: 0x211111)).ignoresSafeArea()
        
        if isLoading {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle())
                .scaleEffect(1.5)
        } else if let errorMessage = errorMessage {
            VStack(spacing: 16){
                Image(systemName: "exclamationmark.triangle")
                    .font(.system(size: 50))
                    .foregroundColor(.orange)
                Text("Oops!")
                    .font(.title)
                    .bold()
                    .foregroundColor(.orange)
                Text(errorMessage)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                    .padding()
            }
        } else if transactions.isEmpty {
            VStack(spacing: 16){
                Image(systemName: "clock.arrow.circlepath")
                    .font(.system(size: 50))
                    .foregroundColor(Color(hex: 0x2D1D1D))
                Text("No Transactions Yet")
                    .font(.title2)
                    .foregroundColor(.white)
                Text("Your transaction history will appear here")
                    .font(.caption)
                    .foregroundColor(.white)
            }
        } else {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    ForEach(transactions) { transaction in
                        HStack(spacing: 12) {
                            Image(systemName: transaction.type == "topup" ? "plus.circle.fill" : "cart.fill")
                                .font(.title2)
                                .foregroundColor(transaction.type == "topup" ? .green : .blue)
                                .frame(width: 40)
                            
                            VStack(alignment: .leading, spacing: 4) {
                                Text(transaction.type == "topup" ? "Top Up" : "Purchase Movie")
                                    .font(.headline)
                                    .foregroundColor(.white)
                                
                                Text(formatDate(transaction.date))
                                    .font(.caption)
                                    .foregroundColor(.white)
                            }
                            
                            Spacer()
                            
                            Text(transaction.type == "topup" ? "+" : "-")
                                .font(.headline)
                                .foregroundColor(transaction.type == "topup" ? .green : .red)
                            +
                            Text("Rp \(transaction.amount)")
                                .font(.headline)
                                .foregroundColor(transaction.type == "topup" ? .green : .red)
                        }
                        .padding()
                        .background(Color.clear)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                        )
                        .padding(.horizontal)
                    }
                }
                .padding(.top)
            }
        }
        }
        .task {
            await loadTransactions()
        }
        .refreshable {
            await loadTransactions()
        }
        .navigationTitle("Transaction History")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(Color(hex: 0x211111), for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbarColorScheme(.dark, for: .navigationBar)
    }
    
    private func loadTransactions() async {
        isLoading = true
        errorMessage = nil
        do {
            let fetchedTransactions = try await transactionController.getTransactionHistory()
            transactions = fetchedTransactions.sorted { t1, t2 in
                // Sort by date descending (newest first)
                return parseDate(t1.date) > parseDate(t2.date)
            }
            isLoading = false
        } catch {
            errorMessage = "Failed to load transaction history: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    private func formatDate(_ dateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = isoFormatter.date(from: dateString) {
            return dateFormatter.string(from: date)
        } else {
            // Try without fractional seconds
            let isoFormatter2 = ISO8601DateFormatter()
            if let date = isoFormatter2.date(from: dateString) {
                return dateFormatter.string(from: date)
            }
        }
        return dateString
    }
    
    private func parseDate(_ dateString: String) -> Date {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        if let date = isoFormatter.date(from: dateString) {
            return date
        } else {
            let isoFormatter2 = ISO8601DateFormatter()
            return isoFormatter2.date(from: dateString) ?? Date.distantPast
        }
    }
}

#Preview {
    HistoryView()
}
