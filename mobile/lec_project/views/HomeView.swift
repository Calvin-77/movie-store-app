//
//  HomeView.swift
//  home
//
//  Created by prk on 10/6/25.
//

import SwiftUI

struct HomeView: View {
    @StateObject private var controller = MovieController()
    @StateObject private var authController = AuthController()
    @State private var movies: [Movie] = []
    @State private var balance: Int = 0
    @State private var showTopUp = false
    @State private var showHistory = false
    @State private var selectedTopUpAmount: Int? = nil
    @StateObject private var transactionController = TransactionController()
    
    var body: some View {
        NavigationStack {
            VStack {
                HStack() {
                    Image(systemName: "movieclapper.fill")
                        .foregroundColor(.red)
                    Text("CineStream")
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
                            VStack {
                                Button(action: {
                                    showHistory = true
                                }) {
                                    HStack{
                                        Image(systemName: "clock.arrow.circlepath")
                                        Text("History")
                                    }
                                }
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.gray)
                            .navigationDestination(isPresented: $showHistory) {
                                HistoryView()
                            }
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
                        print("✅ Movies loaded: \(movies.count)")
                    } catch {
                        print("❌ Error fetching movies: \(error.localizedDescription)")
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
            }
            .background(Color(hex: 0x211111).ignoresSafeArea())
        }
    }

    
    private func refreshBalance() async {
        do {
            let topupTransactions = try await transactionController.getTopupHistory()
            let totalTopup = topupTransactions.reduce(0) { $0 + $1.amount }
            
            let purchasedMovies = try await controller.getPurchasedMovie()
            let totalSpent = purchasedMovies.reduce(0) { $0 + $1.price }
            
            balance = totalTopup - totalSpent
            print("✅ Balance calculated: Topup=\(totalTopup), Spent=\(totalSpent), Balance=\(balance)")
        } catch {
            print("⚠️ Error calculating balance: \(error.localizedDescription)")
            do {
                let user = try await authController.getProfile()
                balance = user.balance
                print("✅ Balance from profile: \(balance)")
            } catch {
                print("⚠️ Could not get balance: \(error.localizedDescription)")
            }
        }
    }
}

#Preview {
    HomeView()
}
