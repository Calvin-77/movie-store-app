//
//  VideoPlayerView.swift
//  lec_project
//
//  Universal video player supporting YouTube and Dailymotion
//

import SwiftUI
import WebKit

enum VideoPlatform {
    case youtube
    case dailymotion
    case unknown
}

struct VideoPlayerView: UIViewRepresentable {
    let videoURL: String
    @Binding var isPlaying: Bool
    var onError: ((String) -> Void)? = nil
    
    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []
        configuration.allowsAirPlayForMediaPlayback = true
        configuration.allowsPictureInPictureMediaPlayback = true
        
        // Prevents opening links in external browser
        let preferences = WKWebpagePreferences()
        preferences.allowsContentJavaScript = true
        configuration.defaultWebpagePreferences = preferences
        
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        webView.backgroundColor = .black
        webView.isOpaque = false
        webView.allowsLinkPreview = false // Prevent link previews that might open browser
        
        return webView
    }
    
    func updateUIView(_ uiView: WKWebView, context: Context) {
        // Set navigation delegate
        uiView.navigationDelegate = context.coordinator
        context.coordinator.onError = onError
        
        let platform = detectPlatform(from: videoURL)
        
        switch platform {
        case .youtube:
            guard let videoID = extractYouTubeID(from: videoURL) else {
                onError?("Invalid YouTube URL: Could not extract video ID")
                return
            }
            
            loadYouTubeVideo(webView: uiView, videoID: videoID, context: context)
            
        case .dailymotion:
            guard let videoID = extractDailymotionID(from: videoURL) else {
                onError?("Invalid Dailymotion URL: Could not extract video ID")
                return
            }
            
            loadDailymotionVideo(webView: uiView, videoID: videoID, context: context)
            
        case .unknown:
            onError?("Unsupported video platform")
        }
    }
    
    func makeCoordinator() -> Coordinator {
        Coordinator()
    }
    
    // MARK: - Platform Detection
    
    private func detectPlatform(from urlString: String) -> VideoPlatform {
        let lowercased = urlString.lowercased()
        if lowercased.contains("youtube.com") || lowercased.contains("youtu.be") {
            return .youtube
        } else if lowercased.contains("dailymotion.com") || lowercased.contains("dai.ly") {
            return .dailymotion
        }
        return .unknown
    }
    
    // MARK: - YouTube Support
    
    private func loadYouTubeVideo(webView: WKWebView, videoID: String, context: Context) {
        let autoplayParam = isPlaying ? "1" : "0"
        let embedURL = "https://www.youtube.com/embed/\(videoID)?autoplay=\(autoplayParam)&playsinline=1&rel=0&modestbranding=1&controls=1&enablejsapi=1"
        
        let embedHTML = createVideoHTML(embedURL: embedURL, platform: .youtube)
        
        // Only reload if the video ID or playing state has changed
        if context.coordinator.lastVideoID != videoID || context.coordinator.wasPlaying != isPlaying {
            context.coordinator.lastVideoID = videoID
            context.coordinator.wasPlaying = isPlaying
            context.coordinator.videoURL = videoURL
            webView.loadHTMLString(embedHTML, baseURL: URL(string: "https://www.youtube.com"))
        }
    }
    
    private func extractYouTubeID(from urlString: String) -> String? {
        if urlString.contains("youtu.be/") {
            let components = urlString.components(separatedBy: "youtu.be/")
            if components.count > 1 {
                var videoID = components[1]
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                return videoID
            }
        } else if urlString.contains("youtube.com/embed/") {
            let components = urlString.components(separatedBy: "embed/")
            if components.count > 1 {
                var videoID = components[1]
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                if let slashIndex = videoID.firstIndex(of: "/") {
                    videoID = String(videoID[..<slashIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                return videoID
            }
        } else if urlString.contains("youtube.com/watch?v=") {
            let components = urlString.components(separatedBy: "v=")
            if components.count > 1 {
                var videoID = components[1]
                if let ampersandIndex = videoID.firstIndex(of: "&") {
                    videoID = String(videoID[..<ampersandIndex])
                }
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                return videoID
            }
        }
        
        return nil
    }
    
    // MARK: - Dailymotion Support
    
    private func loadDailymotionVideo(webView: WKWebView, videoID: String, context: Context) {
        let autoplayParam = isPlaying ? "1" : "0"
        // Dailymotion embed URL with parameters for inline playback
        let embedURL = "https://www.dailymotion.com/embed/video/\(videoID)?autoplay=\(autoplayParam)&controls=1&mute=0&ui-theme=dark&ui-start-screen-info=0&endscreen-enable=0&sharing-enable=0"
        
        let embedHTML = createVideoHTML(embedURL: embedURL, platform: .dailymotion)
        
        // Only reload if the video ID or playing state has changed
        if context.coordinator.lastVideoID != videoID || context.coordinator.wasPlaying != isPlaying {
            context.coordinator.lastVideoID = videoID
            context.coordinator.wasPlaying = isPlaying
            context.coordinator.videoURL = videoURL
            webView.loadHTMLString(embedHTML, baseURL: URL(string: "https://www.dailymotion.com"))
        }
    }
    
    private func extractDailymotionID(from urlString: String) -> String? {
        let lowercased = urlString.lowercased()
        
        // Format: https://dai.ly/VIDEO_ID (check this first as it's the shortest)
        if lowercased.contains("dai.ly/") {
            let components = urlString.components(separatedBy: "dai.ly/")
            if components.count > 1 {
                var videoID = components[1]
                // Remove query parameters if any
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                // Remove any trailing slashes or paths
                if let slashIndex = videoID.firstIndex(of: "/") {
                    videoID = String(videoID[..<slashIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                if !videoID.isEmpty {
                    return videoID
                }
            }
        }
        // Format: https://www.dailymotion.com/video/VIDEO_ID
        else if lowercased.contains("dailymotion.com/video/") {
            let components = urlString.components(separatedBy: "dailymotion.com/video/")
            if components.count > 1 {
                var videoID = components[1]
                // Remove query parameters if any
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                // Remove any trailing slashes or paths
                if let slashIndex = videoID.firstIndex(of: "/") {
                    videoID = String(videoID[..<slashIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                if !videoID.isEmpty {
                    return videoID
                }
            }
        }
        // Format: https://www.dailymotion.com/embed/video/VIDEO_ID
        else if lowercased.contains("dailymotion.com/embed/video/") {
            let components = urlString.components(separatedBy: "dailymotion.com/embed/video/")
            if components.count > 1 {
                var videoID = components[1]
                if let questionMarkIndex = videoID.firstIndex(of: "?") {
                    videoID = String(videoID[..<questionMarkIndex])
                }
                if let slashIndex = videoID.firstIndex(of: "/") {
                    videoID = String(videoID[..<slashIndex])
                }
                videoID = videoID.trimmingCharacters(in: CharacterSet(charactersIn: "/"))
                if !videoID.isEmpty {
                    return videoID
                }
            }
        }
        
        return nil
    }
    
    // MARK: - HTML Generation
    
    private func createVideoHTML(embedURL: String, platform: VideoPlatform) -> String {
        let platformName = platform == .youtube ? "YouTube" : "Dailymotion"
        
        return """
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
                <iframe id="video-iframe"
                        src="\(embedURL)"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowfullscreen
                        webkitallowfullscreen
                        mozallowfullscreen>
                </iframe>
                <script>
                    // Prevent any clicks from opening external links
                    document.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                    }, true);
                    
                    // Prevent navigation away from embed
                    window.addEventListener('beforeunload', function(e) {
                        e.preventDefault();
                        e.returnValue = '';
                    });
                </script>
            </div>
            <script>
                window.addEventListener('message', function(event) {
                    if (event.data === 'video-error' || event.data.type === 'error') {
                        console.error('\(platformName) player error');
                    }
                });
            </script>
        </body>
        </html>
        """
    }
    
    // MARK: - Coordinator
    
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
            // Prevent opening external links in Safari
            // Only allow navigation within the same domain (for video embedding)
            if let url = navigationAction.request.url {
                let urlString = url.absoluteString.lowercased()
                
                // Allow navigation to YouTube/Dailymotion embed domains
                if urlString.contains("youtube.com/embed") || 
                   urlString.contains("dailymotion.com/embed") ||
                   urlString.contains("youtube.com/api") ||
                   urlString.contains("dailymotion.com/api") {
                    decisionHandler(.allow)
                } else if navigationAction.navigationType == .linkActivated {
                    // Block external links (like opening video in browser)
                    decisionHandler(.cancel)
                } else {
                    // Allow other navigation (like iframe loading)
                    decisionHandler(.allow)
                }
            } else {
                decisionHandler(.allow)
            }
        }
    }
}

#Preview {
    VideoPlayerView(videoURL: "https://www.dailymotion.com/video/x8qj5k", isPlaying: .constant(false))
}

