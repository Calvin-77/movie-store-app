//
//  MovieDetail.swift
//  ads
//
//  Created by prk on 07/10/25.
//

import SwiftUI
import Foundation

struct MovieDetail: Codable {
    let id: String
    let title: String
    let synopsis: String
    let price : Int
    let year: Int
    let video: String
    let image: String?
    let owned: Bool
}
