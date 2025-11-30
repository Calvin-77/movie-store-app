//
//  LibraryView.swift
//  Library
//
//  Created by prk on 07/10/25.
//

import SwiftUI

struct LibraryView: View {
    @StateObject private var controller = MovieController()
    @State private var purchasedMovies: [PurchasedMovie] = []
    @State private var isLoading = false
    @State private var errorMessage: String?
    
    var body : some View {
        NavigationStack{
            ZStack {
                Color(hex: 0x211111).ignoresSafeArea()
                
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                        .scaleEffect(1.5)
                } else if let errorMessage = errorMessage {
                    VStack(spacing: 16) {
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
                } else if purchasedMovies.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "film")
                            .font(.system(size: 50))
                            .foregroundColor(.gray)
                        Text("No Purchased Movies")
                            .font(.title2)
                            .foregroundColor(.white)
                        Text("Movies you purchase will appear here")
                            .font(.caption)
                            .foregroundColor(.gray)
                    }
                } else {
                    ScrollView {
                        let columns = [
                            GridItem(.flexible(), spacing: 12, alignment: .top),
                            GridItem(.flexible(), spacing: 12, alignment: .top)
                        ]
                        
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(purchasedMovies) { movie in
                                NavigationLink(destination: MovieDetailView(movieId: movie.id)) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        if let imageUrl = movie.image, let url = URL(string: imageUrl) {
                                            AsyncImage(url: url) { image in
                                                image
                                                    .resizable()
                                                    .scaledToFill()
                                            } placeholder: {
                                                Rectangle()
                                                    .fill(Color.gray.opacity(0.3))
                                            }
                                            .frame(height: 180)
                                            .frame(maxWidth: .infinity)
                                            .clipped()
                                            .cornerRadius(8)
                                        } else {
                                            Rectangle()
                                                .fill(Color.gray.opacity(0.3))
                                                .frame(height: 180)
                                                .cornerRadius(8)
                                                .overlay(
                                                    Image(systemName: "photo")
                                                        .foregroundColor(.gray)
                                                )
                                        }
                                        
                                        Text(movie.title)
                                            .font(.headline)
                                            .lineLimit(2)
                                            .foregroundColor(.white)
                                    }
                                    .padding(8)
                                }
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.top, 12)
                    }
                }
            }
            .navigationTitle("My Library")
            .navigationBarTitleDisplayMode(.inline)
            .refreshable {
                await loadPurchasedMovies()
            }
            .task {
                await loadPurchasedMovies()
            }
        }
    }
    
    private func loadPurchasedMovies() async {
        isLoading = true
        errorMessage = nil
        do {
            let movies = try await controller.getPurchasedMovie()
            purchasedMovies = movies.sorted { m1, m2 in
                // Sort by purchase date descending (newest first)
                return parseDate(m1.purchaseDate) > parseDate(m2.purchaseDate)
            }
            print("✅ Loaded \(purchasedMovies.count) purchased movies")
            isLoading = false
        } catch {
            errorMessage = "Failed to load purchased movies: \(error.localizedDescription)"
            print("❌ Error: \(error.localizedDescription)")
            isLoading = false
        }
    }
    
    private func formatPurchaseDate(_ dateString: String) -> String {
        let isoFormatter = ISO8601DateFormatter()
        isoFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateStyle = .medium
        dateFormatter.timeStyle = .none
        
        if let date = isoFormatter.date(from: dateString) {
            return "Purchased: \(dateFormatter.string(from: date))"
        } else {
            let isoFormatter2 = ISO8601DateFormatter()
            if let date = isoFormatter2.date(from: dateString) {
                return "Purchased: \(dateFormatter.string(from: date))"
            }
        }
        return "Purchased: \(dateString)"
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
    LibraryView()
}
