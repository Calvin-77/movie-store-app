//
//  PurchasedMovieResponse.swift
//  Library
//
//  Created by prk on 07/10/25.
//

import SwiftUI
import Foundation

struct PurchasedMovieResponse: Codable {
    let status : String
    let data : PurchasedMovieData
}

struct PurchasedMovieData : Codable{
    let movies : [PurchasedMovie]
}
