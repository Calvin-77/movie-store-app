//
//  MovieService.swift
//  ads
//
//  Created by prk on 07/10/25.
//

import SwiftUI
import Foundation

@MainActor
class MovieController: ObservableObject {
    private let baseURL = Config.baseURL
    
    func getAllMovies() async throws -> [Movie] {
        let url = URL(string: "\(baseURL)/movies")!
        let (data,_) = try await URLSession.shared.data(from: url)
        let response = try JSONDecoder().decode(MovieResponse.self, from: data)
        return response.data.movies
    }
    
    func getMovieDetail(id: String) async throws -> MovieDetail{
        let url = URL(string: "\(baseURL)/movies/\(id)")!
        var request = URLRequest(url:url)
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        let (data,_) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(MovieDetailResponse.self, from: data)
        return response.data.movie
    }
    
    func purchaseMovie(movieId: String) async throws{
        let url = URL(string: "\(baseURL)/purchase")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        
        let body = ["movieId": movieId]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let(_,_) = try await URLSession.shared.data(for: request)
    }
    
    func getPurchasedMovie() async throws -> [PurchasedMovie]{
        let url = URL(string: "\(baseURL)/users/purchased-movies")!
        
        var request = URLRequest(url:url)
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(PurchasedMovieResponse.self, from: data)
        
        
        return response.data.movies
        
    }
    
    private func getToken() -> String {
        return UserDefaults.standard.string(forKey: "accessToken") ?? ""
    }
}
