import SwiftUI
import WebKit

struct MovieDetailView: View {
    let movieId: String
    @StateObject private var movieService = MovieController()
    @State private var movie: MovieDetail?
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var isVideoPlaying = false
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        ScrollView {
            if isLoading {
                VStack(spacing: 16) {
                    ProgressView()
                        .scaleEffect(1.5)
                        .tint(.white)
                    Text("Loading movie details...")
                        .foregroundColor(.gray)
                }
                .frame(maxWidth: .infinity, minHeight: 400)
                .padding()
            } else if let errorMessage = errorMessage {
                VStack(spacing: 16) {
                    Image(systemName: "exclamationmark.triangle")
                        .font(.system(size: 50))
                        .foregroundColor(.red)
                    Text("Error")
                        .font(.title)
                        .bold()
                        .foregroundColor(.white)
                    Text(errorMessage)
                        .foregroundColor(.gray)
                        .multilineTextAlignment(.center)
                        .padding()
                    
                    Button("Retry") {
                        Task {
                            await loadMovieDetail()
                        }
                    }
                    .padding(.horizontal, 40)
                    .padding(.vertical, 12)
                    .background(Color.red)
                    .foregroundColor(.white)
                    .cornerRadius(8)
                }
                .frame(maxWidth: .infinity, minHeight: 400)
                .padding()
            } else if let movie = movie {
                VStack(alignment: .leading, spacing: 16) {
                    // Movie Image or Video
                    if movie.owned {
                        // Show Video Player if owned with Play Button
                        ZStack {
                            YouTubeVideoView(
                                videoURL: "https://youtu.be/RSNmgE6L8AU?si=jdI207N0DZIlNcoK",
                                isPlaying: $isVideoPlaying
                            )
                            .frame(height: 300)
                            
                            // Play Button Overlay
                            if !isVideoPlaying {
                                Button(action: {
                                    withAnimation {
                                        isVideoPlaying = true
                                    }
                                }) {
                                    ZStack {
                                        Circle()
                                            .fill(Color.black.opacity(0.7))
                                            .frame(width: 80, height: 80)
                                        
                                        Image(systemName: "play.fill")
                                            .font(.system(size: 35))
                                            .foregroundColor(.white)
                                            .offset(x: 3) // Slight offset to center the play icon visually
                                    }
                                }
                                .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 5)
                            }
                        }
                        .frame(height: 300)
                        .cornerRadius(12)
                        .clipped()
                    } else {
                        // Show Blurred Image with "Content Locked" if not owned
                        ZStack {
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
                                .frame(height: 300)
                                .blur(radius: 20)
                            } else {
                                Rectangle()
                                    .fill(Color.gray.opacity(0.3))
                                    .frame(height: 300)
                                    .blur(radius: 20)
                            }
                            
                            // Content Locked Overlay
                            VStack(spacing: 16) {
                                Image(systemName: "lock.fill")
                                    .font(.system(size: 50))
                                    .foregroundColor(.white)
                                
                                Text("Content Locked")
                                    .font(.title2)
                                    .fontWeight(.bold)
                                    .foregroundColor(.white)
                                
                                Text("Purchase to unlock")
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.8))
                            }
                            .padding()
                            .background(
                                RoundedRectangle(cornerRadius: 12)
                                    .fill(Color.black.opacity(0.6))
                            )
                        }
                        .frame(height: 300)
                        .cornerRadius(12)
                        .clipped()
                    }
                    
                    // Movie Info
                    Text(movie.title)
                        .font(.title)
                        .bold()
                        .foregroundColor(.white)
                    
                    HStack {
                        Text("Year: \(movie.year)")
                            .foregroundColor(.gray)
                        Spacer()
                        Text("Price: Rp \(movie.price)")
                            .foregroundColor(.gray)
                    }
                    
                    Divider()
                        .background(Color.gray.opacity(0.3))
                    
                    Text("Synopsis")
                        .font(.headline)
                        .foregroundColor(.white)
                        .padding(.top, 8)
                    
                    Text(movie.synopsis)
                        .foregroundColor(.gray)
                        .padding(.top, 4)
                    
                    Divider()
                        .background(Color.gray.opacity(0.3))
                        .padding(.vertical, 8)
                    
                    // Purchase Button
                    if !movie.owned {
                        Button {
                            Task {
                                await purchaseMovie()
                            }
                        } label: {
                            HStack {
                                if isLoading {
                                    ProgressView()
                                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                } else {
                                    Image(systemName: "cart.fill")
                                }
                                Text(isLoading ? "Processing..." : "Buy Movie - Rp \(movie.price)")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(12)
                        }
                        .disabled(isLoading)
                        .padding(.top, 8)
                    } else {
                        HStack {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.green)
                            Text("Owned")
                                .foregroundColor(.green)
                                .bold()
                        }
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.green.opacity(0.2))
                        .cornerRadius(12)
                    }
                }
                .padding()
            }
        }
        .background(Color(hex: 0x211111))
        .navigationBarTitleDisplayMode(.inline)
        .navigationBarBackButtonHidden(true)
        .toolbar {
            ToolbarItem(placement: .navigationBarLeading) {
                Button {
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .foregroundColor(.white)
                }
            }
        }
        .toolbarBackground(Color(hex: 0x211111), for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .task {
            await loadMovieDetail()
        }
    }
    
    private func loadMovieDetail() async {
        isLoading = true
        errorMessage = nil
        do {
            print("🔄 Loading movie detail for ID: \(movieId)")
            let fetchedMovie = try await movieService.getMovieDetail(id: movieId)
            movie = fetchedMovie
            print("✅ Movie loaded: \(fetchedMovie.title)")
            isLoading = false
        } catch {
            errorMessage = "Failed to load movie details: \(error.localizedDescription)"
            print("❌ Error fetching movie detail: \(error.localizedDescription)")
            isLoading = false
        }
    }
    
    private func purchaseMovie() async {
        isLoading = true
        do {
            try await movieService.purchaseMovie(movieId: movieId)
            // Refresh movie detail to update owned status
            await loadMovieDetail()
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
            print("❌ Purchase failed: \(error.localizedDescription)")
            isLoading = false
        }
    }
}

// YouTube Video Player View using WebKit
struct YouTubeVideoView: UIViewRepresentable {
    let videoURL: String
    @Binding var isPlaying: Bool
    
    func makeUIView(context: Context) -> WKWebView {
        let webView = WKWebView()
        webView.scrollView.isScrollEnabled = false
        webView.backgroundColor = .black
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        guard let youtubeURL = extractYouTubeID(from: videoURL) else { return }
        
        // Autoplay parameter based on isPlaying state
        let autoplayParam = isPlaying ? "1" : "0"
        
        let embedHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    background-color: black;
                }
                .video-container {
                    position: relative;
                    width: 100%;
                    padding-bottom: 56.25%; /* 16:9 aspect ratio */
                }
                iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border: 0;
                }
            </style>
        </head>
        <body>
            <div class="video-container">
                <iframe src="https://www.youtube.com/embed/\(youtubeURL)?autoplay=\(autoplayParam)&playsinline=1&rel=0&modestbranding=1&controls=1" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen>
                </iframe>
            </div>
        </body>
        </html>
        """
        
        uiView.loadHTMLString(embedHTML, baseURL: nil)
    }
    
    private func extractYouTubeID(from urlString: String) -> String? {
        // Extract video ID from various YouTube URL formats
        if urlString.contains("youtu.be/") {
            // Format: https://youtu.be/VIDEO_ID
            let components = urlString.components(separatedBy: "youtu.be/")
            if components.count > 1 {
                let videoID = components[1].components(separatedBy: "?")[0]
                return videoID
            }
        } else if urlString.contains("youtube.com/watch?v=") {
            // Format: https://www.youtube.com/watch?v=VIDEO_ID
            let components = urlString.components(separatedBy: "v=")
            if components.count > 1 {
                let videoID = components[1].components(separatedBy: "&")[0]
                return videoID
            }
        }
        return nil
    }
}

#Preview {
    MovieDetailView(movieId: "sampleId")
}
