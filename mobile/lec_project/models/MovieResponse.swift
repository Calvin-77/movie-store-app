//
//  MovieResponse.swift
//  ads
//
//  Created by prk on 07/10/25.
//
import Foundation
import SwiftUI

struct MovieResponse: Codable {
    let status : String
    let data : MovieData
}

struct MovieData : Codable{
    let movies: [Movie]
}

struct MovieDetailResponse: Codable{
    let status: String
    let data: MovieDetailData
}

struct MovieDetailData: Codable{
    let movie: MovieDetail
}
