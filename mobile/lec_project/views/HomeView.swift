//
//  HomeView.swift
//  home
//
//  Created by prk on 10/6/25.
//

import SwiftUI
import Combine

struct HomeView: View {
    @StateObject private var controller = MovieController()
    @StateObject private var authController = AuthController()
    @State private var movies: [Movie] = []
    @State private var balance: Int = 0
    @State private var showTopUp = false
    @State private var selectedTopUpAmount: Int? = nil
    @StateObject private var transactionController = TransactionController()
    
    var body: some View {
        VStack {
                HStack() {
                    Image(systemName: "movieclapper.fill")
                        .foregroundColor(.red)
                    Text("LK12")
                        .font(.title)
                        .foregroundStyle(.white)
                        .bold()
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal, 24)
                ScrollView {
                    Section {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Balance")
                                    .font(.caption)
                                    .foregroundColor(.white)
                                Text(balance, format: .currency(code: "IDR"))
                                    .font(.title3)
                                    .bold()
                                    .foregroundColor(.white)
                            }
                            Spacer()
                            Button(action: { showTopUp = true }) {
                                HStack { Image(systemName: "creditcard.fill")
                                        .foregroundColor(Color(.red)); Text("Top Up")
                                    .foregroundColor(Color(.red)) }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(Color(hex: 0x673233))
                            NavigationLink(destination: HistoryView()) {
                                HStack{
                                    Image(systemName: "clock.arrow.circlepath")
                                    Text("History")
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.gray)
                        }
                        .padding(8)
                        .padding(.horizontal, 8)
                        .frame(height: 70)
                        .background(Color(hex: 0x423434))
                    }
                    .listRowInsets(EdgeInsets())
                    
                    let columns = [
                            GridItem(.flexible(), spacing: 12, alignment: .top),
                            GridItem(.flexible(), spacing: 12, alignment: .top)
                        ]

                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(movies) { movie in
                                NavigationLink(destination: MovieDetailView(movieId: movie.id)) {
                                    VStack(alignment: .leading, spacing: 8) {
                                        MovieImageView(imageString: movie.image, cornerRadius: 8, aspectRatio: 2/3)

                                        Text(movie.title)
                                            .font(.headline)
                                            .lineLimit(2)
                                            .foregroundColor(.white)
                                        
                                        let year = String(movie.year)
                                        let updatedYear = year.replacingOccurrences(of: ",", with: "")
                                        
                                        HStack {
                                            Text("\(updatedYear)")
                                                .font(.caption)
                                                .foregroundColor(.white)

                                            Spacer()

                                            Text("Rp \(movie.price)")
                                                .font(.subheadline)
                                                .foregroundColor(.white)
                                        }
                                    }
                                    .padding(8)
                                }
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.top, 12)
                }
                .scrollContentBackground(.hidden)
                .task {
                    do {
                        movies = try await controller.getAllMovies()
                    } catch {
                        // Error fetching movies
                    }
                    
                    await refreshBalance()
                }
                .sheet(isPresented: $showTopUp) {
                    TopUpView(selectedAmount: $selectedTopUpAmount, onTopUpSuccess: {
                        Task {
                            await refreshBalance()
                        }
                    })
                }
                .onAppear {
                    Task {
                        await refreshBalance()
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: NSNotification.Name("MoviePurchased"))) { _ in
                    Task {
                        await refreshBalance()
                    }
                }
            }
            .background(Color(hex: 0x211111).ignoresSafeArea())
    }

    
    private func refreshBalance() async {
        do {
            let topupTransactions = try await transactionController.getTopupHistory()
            let totalTopup = topupTransactions.reduce(0) { $0 + $1.amount }
            
            let purchasedMovies = try await controller.getPurchasedMovie()
            let totalSpent = purchasedMovies.reduce(0) { $0 + $1.price }
            
            balance = totalTopup - totalSpent
        } catch {
            do {
                let user = try await authController.getProfile()
                balance = user.balanceValue
            } catch {
                // Could not get balance
            }
        }
    }
}

#Preview {
    HomeView()
}
