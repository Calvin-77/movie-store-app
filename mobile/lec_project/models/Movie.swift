//
//  Movie.swift
//  ads
//
//  Created by prk on 07/10/25.
//

import SwiftUI
import Foundation

struct Movie: Codable, Identifiable {
    let id: String
    let title: String
    let year: Int
    let price: Int
    let image: String?
}


