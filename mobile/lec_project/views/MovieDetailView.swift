import SwiftUI
import WebKit

struct MovieDetailView: View {
    let movieId: String
    @StateObject private var movieService = MovieController()
    @State private var movie: MovieDetail?
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var isVideoPlaying = false
    @State private var videoError: String? = nil
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                Color(hex: 0x211111)
                    .ignoresSafeArea()
                
                if isLoading {
                    VStack(spacing: 16) {
                        ProgressView()
                            .scaleEffect(1.5)
                            .tint(.white)
                        Text("Loading movie details...")
                            .foregroundColor(.gray)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
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
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .padding()
                } else if let movie = movie {
                    VStack(spacing: 0) {
                        ScrollView {
                            VStack(alignment: .leading, spacing: 16) {
                                // Movie Image or Video
                                if movie.owned {
                                    // Show Video Player if owned with Play Button
                                    ZStack {
                                        if let videoError = videoError {
                                            VStack(spacing: 16) {
                                                Image(systemName: "exclamationmark.triangle")
                                                    .font(.system(size: 50))
                                                    .foregroundColor(.orange)
                                                Text("Video Unavailable")
                                                    .font(.title2)
                                                    .bold()
                                                    .foregroundColor(.white)
                                                Text("This video cannot be played. The video may not allow embedding or is unavailable.")
                                                    .font(.caption)
                                                    .foregroundColor(.gray)
                                                    .multilineTextAlignment(.center)
                                                    .padding()
                                                
                                                if let videoUrl = URL(string: movie.video) {
                                                    Link("Open in Browser", destination: videoUrl)
                                                        .padding(.horizontal, 20)
                                                        .padding(.vertical, 10)
                                                        .background(Color.red)
                                                        .foregroundColor(.white)
                                                        .cornerRadius(8)
                                                }
                                            }
                                            .frame(maxWidth: .infinity)
                                            .padding()
                                            .background(Color.black.opacity(0.7))
                                            .aspectRatio(16/9, contentMode: .fit)
                                            .cornerRadius(12)
                                        } else {
                                            VideoPlayerView(
                                                videoURL: movie.video,
                                                isPlaying: $isVideoPlaying,
                                                onError: { error in
                                                    DispatchQueue.main.async {
                                                        videoError = error
                                                    }
                                                }
                                            )
                                            .frame(maxWidth: .infinity)
                                            .aspectRatio(16/9, contentMode: .fit)
                                            .clipped()
                                            
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
                                                            .offset(x: 3)
                                                    }
                                                }
                                                .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: 5)
                                            }
                                        }
                                    }
                                    .frame(maxWidth: .infinity)
                                    .aspectRatio(16/9, contentMode: .fit)
                                    .cornerRadius(12)
                                    .clipped()
                                } else {
                                    // Show Blurred Image with "Content Locked" if not owned
                                    ZStack {
                                        MovieImageView(imageString: movie.image, height: 300, cornerRadius: 0, aspectRatio: nil)
                                            .blur(radius: 20)
                                        
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
                                    Text("Year: \(formatYear(movie.year))")
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
                                
                                // Spacer for fixed button at bottom
                                Spacer()
                                    .frame(height: 100)
                            }
                            .padding()
                        }
                        
                        // Fixed button at bottom
                        VStack(spacing: 0) {
                            Divider()
                                .background(Color.gray.opacity(0.3))
                            
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
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
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
                                .padding(.horizontal, 16)
                                .padding(.vertical, 12)
                            }
                        }
                        .background(Color(hex: 0x211111))
                    }
                }
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
                    Image(systemName: "chevron.left")
                        .foregroundColor(.white)
                        .font(.system(size: 18, weight: .semibold))
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
        videoError = nil // Reset video error when loading new movie
        do {
            let fetchedMovie = try await movieService.getMovieDetail(id: movieId)
            movie = fetchedMovie
            videoError = nil // Reset video error when movie loaded successfully
            isLoading = false
        } catch {
            errorMessage = "Failed to load movie details: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    private func purchaseMovie() async {
        isLoading = true
        do {
            try await movieService.purchaseMovie(movieId: movieId)
            // Refresh movie detail to update owned status
            await loadMovieDetail()
            
            // Notify HomeView to refresh balance after successful purchase
            NotificationCenter.default.post(name: NSNotification.Name("MoviePurchased"), object: nil)
            isLoading = false
        } catch {
            errorMessage = "Purchase failed: \(error.localizedDescription)"
            isLoading = false
        }
    }
    
    private func formatYear(_ year: Int) -> String {
        // Format year without thousand separators (2020, not 2.020)
        let formatter = NumberFormatter()
        formatter.numberStyle = .none
        formatter.groupingSeparator = ""
        return formatter.string(from: NSNumber(value: year)) ?? String(year)
    }
}

// YouTube Video Player View using WebKit
struct YouTubeVideoView: UIViewRepresentable {
    let videoURL: String
    @Binding var isPlaying: Bool
    var onError: ((String) -> Void)? = nil
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.backgroundColor = .black
        webView.isOpaque = false
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Set navigation delegate
        uiView.navigationDelegate = context.coordinator
        context.coordinator.onError = onError
        
        guard let youtubeID = extractYouTubeID(from: videoURL) else {
            onError?("Invalid YouTube URL: Could not extract video ID")
            return
        }
        
        // Autoplay parameter based on isPlaying state
        let autoplayParam = isPlaying ? "1" : "0"
        
        // Create embed URL with proper parameters to avoid error code 4
        // Using minimal parameters for better compatibility
        let embedURL = "https://www.youtube.com/embed/\(youtubeID)?autoplay=\(autoplayParam)&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1"
        
        let embedHTML = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                html, body {
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                    background-color: #000000;
                }
                .video-wrapper {
                    position: relative;
                    width: 100%;
                    height: 0;
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
                .error-message {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    color: white;
                    text-align: center;
                    padding: 20px;
                }
            </style>
        </head>
        <body>
            <div class="video-wrapper">
                <iframe id="youtube-iframe"
                        src="\(embedURL)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen>
                </iframe>
            </div>
            <script>
                window.addEventListener('message', function(event) {
                    if (event.data === 'youtube-error' || event.data.type === 'error') {
                        console.error('YouTube player error');
                    }
                });
            </script>
        </body>
        </html>
        """
        
        // Only reload if the video ID or playing state has changed
        if context.coordinator.lastVideoID != youtubeID || context.coordinator.wasPlaying != isPlaying {
            context.coordinator.lastVideoID = youtubeID
            context.coordinator.wasPlaying = isPlaying
            context.coordinator.videoURL = videoURL
            uiView.loadHTMLString(embedHTML, baseURL: URL(string: "https://www.youtube.com"))
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    class Coordinator: NSObject, WKNavigationDelegate {
        var lastVideoID: String?
        var wasPlaying: Bool = false
        var videoURL: String = ""
        var onError: ((String) -> Void)?
        
        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            onError?("Video playback error: \(error.localizedDescription)")
        }
        
        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            onError?("Video loading error: \(error.localizedDescription)")
        }
        
        func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            // Allow navigation
            decisionHandler(.allow)
        }
    }
    
    private func extractYouTubeID(from urlString: String) -> String? {
        // Extract video ID from various YouTube URL formats
        if urlString.contains("youtu.be/") {
            // Format: https://youtu.be/VIDEO_ID or https://youtu.be/VIDEO_ID?si=...
            let components = urlString.components(separatedBy: "youtu.be/")
            if components.count > 1 {
                var videoID = components[1]
                // Remove query parameters if any
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                // Remove any trailing slashes
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                return videoID
            }
        } else if urlString.contains("youtube.com/embed/") {
            // Format: https://www.youtube.com/embed/VIDEO_ID or https://www.youtube.com/embed/VIDEO_ID?si=...
            let components = urlString.components(separatedBy: "embed/")
            if components.count > 1 {
                var videoID = components[1]
                // Remove query parameters (like ?si=...)
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                // Remove any trailing slashes or paths
                if let slashIndex = videoID.firstIndex(of: "/") {
                    videoID = String(videoID[..<slashIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                return videoID
            }
        } else if urlString.contains("youtube.com/watch?v=") {
            // Format: https://www.youtube.com/watch?v=VIDEO_ID
            let components = urlString.components(separatedBy: "v=")
            if components.count > 1 {
                var videoID = components[1]
                // Remove query parameters after video ID
                if let ampersandIndex = videoID.firstIndex(of: "&") {
                    videoID = String(videoID[..<ampersandIndex])
                }
                // Remove any trailing parameters
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                return videoID
            }
        }
        
        return nil
    }
}

#Preview {
    MovieDetailView(movieId: "sampleId")
}
