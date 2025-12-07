//
//  TransactionController.swift
//  dancow
//
//  Created by prk on 07/10/25.
//

import Foundation

class TransactionController: ObservableObject {
    private let baseURL = Config.baseURL

    func topUpBalance(amount: Int) async throws {
        let url = URL(string: "\(baseURL)/topup")!

        var request = URLRequest(url: url)

        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")

        let body = ["amount": amount]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)

        let (_, _) = try await URLSession.shared.data(for: request)
    }

    func getTransactionHistory() async throws -> [Transaction] {
        // Get all transactions (topup + purchase) from /transactions/history endpoint
        let url = URL(string: "\(baseURL)/transactions/history")!
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        let response = try JSONDecoder().decode(TransactionResponse.self, from: data)
        
        return response.data.transactions
    }
    
    func getTopupHistory() async throws -> [Transaction] {
        // Get only topup transactions for balance calculation
        let url = URL(string: "\(baseURL)/topup/history")!
        
        var request = URLRequest(url: url)
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        let response = try JSONDecoder().decode(TransactionResponse.self, from: data)
        
        return response.data.transactions
    }

    private func getToken() -> String {
        return UserDefaults.standard.string(forKey: "accessToken") ?? ""
    }
}
