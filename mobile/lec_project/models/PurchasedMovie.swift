//
//  PurchasedMovie.swift
//  Library
//
//  Created by prk on 07/10/25.
//

import SwiftUI
import Foundation

struct PurchasedMovie: Codable, Identifiable {
    let id : String
    let title: String
    let year : Int
    let price: Int
    var image: String?
    let purchaseDate: String
}


