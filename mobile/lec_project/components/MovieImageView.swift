//
//  MovieImageView.swift
//  lec_project
//
//  Created for handling both base64 and URL images
//

import SwiftUI

struct MovieImageView: View {
    let imageString: String?
    let height: CGFloat?
    let cornerRadius: CGFloat
    let aspectRatio: CGFloat?
    
    // For poster format (portrait 2:3)
    init(imageString: String?, height: CGFloat? = nil, cornerRadius: CGFloat = 8, aspectRatio: CGFloat? = nil) {
        self.imageString = imageString
        self.height = height
        self.cornerRadius = cornerRadius
        // Default to poster aspect ratio (2:3) if no height specified
        self.aspectRatio = aspectRatio ?? (height == nil ? 2/3 : nil)
    }
    
    var body: some View {
        Group {
            if let imageString = imageString {
                // Check if it's a URL (starts with http/https) or base64
                if imageString.hasPrefix("http://") || imageString.hasPrefix("https://") {
                    // URL image
                    if let url = URL(string: imageString) {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .empty:
                                Group {
                                    if let height = height {
                                        Rectangle()
                                            .fill(Color.gray.opacity(0.3))
                                            .frame(height: height)
                                    } else if let aspectRatio = aspectRatio {
                                        Rectangle()
                                            .fill(Color.gray.opacity(0.3))
                                            .aspectRatio(aspectRatio, contentMode: .fit)
                                    } else {
                                        Rectangle()
                                            .fill(Color.gray.opacity(0.3))
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .overlay(
                                    ProgressView()
                                )
                            case .success(let image):
                                Group {
                                    if let height = height {
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .frame(height: height)
                                    } else if let aspectRatio = aspectRatio {
                                        image
                                            .resizable()
                                            .scaledToFill()
                                            .aspectRatio(aspectRatio, contentMode: .fit)
                                    } else {
                                        image
                                            .resizable()
                                            .scaledToFill()
                                    }
                                }
                                .frame(maxWidth: .infinity)
                                .clipped()
                                .cornerRadius(cornerRadius)
                            case .failure:
                                placeholderView
                            @unknown default:
                                placeholderView
                            }
                        }
                    } else {
                        placeholderView
                    }
                } else {
                    // Assume it's base64 (no http prefix)
                    if let imageData = extractBase64Data(from: imageString),
                       let uiImage = UIImage(data: imageData) {
                        Group {
                            if let height = height {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(height: height)
                            } else if let aspectRatio = aspectRatio {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .scaledToFill()
                                    .aspectRatio(aspectRatio, contentMode: .fit)
                            } else {
                                Image(uiImage: uiImage)
                                    .resizable()
                                    .scaledToFill()
                            }
                        }
                        .frame(maxWidth: .infinity)
                        .clipped()
                        .cornerRadius(cornerRadius)
                    } else {
                        // Fallback placeholder
                        placeholderView
                    }
                }
            } else {
                placeholderView
            }
        }
    }
    
    private var placeholderView: some View {
        Group {
            if let height = height {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .frame(height: height)
            } else if let aspectRatio = aspectRatio {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .aspectRatio(aspectRatio, contentMode: .fit)
            } else {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
            }
        }
        .frame(maxWidth: .infinity)
        .cornerRadius(cornerRadius)
        .overlay(
            Image(systemName: "photo")
                .foregroundColor(.gray)
        )
    }
    
    private func extractBase64Data(from base64String: String) -> Data? {
        var base64 = base64String
        
        // Remove data URL prefix if present
        if base64String.hasPrefix("data:image") {
            if let commaIndex = base64String.firstIndex(of: ",") {
                base64 = String(base64String[base64String.index(after: commaIndex)...])
            }
        }
        
        // Remove whitespace
        base64 = base64.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Decode base64
        return Data(base64Encoded: base64, options: .ignoreUnknownCharacters)
    }
}

#Preview {
    MovieImageView(imageString: nil)
}

