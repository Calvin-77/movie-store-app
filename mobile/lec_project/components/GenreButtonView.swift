//
//  GenreButtonView.swift
//  home
//
//  Created by prk on 10/6/25.
//

import SwiftUI

struct GenreButtonView: View {
    let title: String
    let isSelected: Bool
    
    var body: some View{
        Text(title)
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            .background(isSelected ? Color.red : Color.gray.opacity(0.3))
            .foregroundColor(.white)
            .cornerRadius(20)
    }
}
