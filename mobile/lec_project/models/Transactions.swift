//
//  Transactions.swift
//  dancow
//
//  Created by prk on 07/10/25.
//

import Foundation

struct TransactionResponse: Codable {
    let status: String
    let data: TransactionData
}

struct TransactionData: Codable {
    let transactions: [Transaction]
}

struct Transaction: Codable, Identifiable {
    let id: String
    let type: String
    let amount: Int
    let movieId: String?
    let date: String
    
    enum CodingKeys: String, CodingKey {
        case id
        case type
        case amount
        case movieId = "movie_id"
        case date
    }
}
