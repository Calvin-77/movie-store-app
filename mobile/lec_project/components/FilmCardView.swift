//
//  FilmCardView.swift
//  home
//
//  Created by prk on 10/6/25.
//

import SwiftUI

struct MovieCardDetail: View{
    let movie: MovieDetail
    
    var body: some View {
        VStack(alignment: .leading){
            if let imageUrl = movie.image, let url = URL(string: imageUrl) {
                AsyncImage(url: url) { image in
                    image
                        .resizable()
                        .scaledToFill()
                } placeholder: {
                    Rectangle()
                        .fill(Color.gray.opacity(0.3))
                        .overlay(
                            ProgressView()
                        )
                }
                .scaledToFit()
                .cornerRadius(10)
            } else {
                // Kotak abu-abu polos jika tidak ada gambar
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .aspectRatio(2/3, contentMode: .fit)
                    .cornerRadius(10)
                    .overlay(
                        Image(systemName: "photo")
                            .font(.system(size: 30))
                            .foregroundColor(.gray.opacity(0.5))
                    )
            }
            Text(movie.title)
                .font(.headline)
                .foregroundColor(.white)
                .padding(.top, 4)
        }
    }
}
