//
//  Config.swift
//  Configuration untuk API endpoint
//

import Foundation

struct Config {
    // Untuk iOS Simulator: gunakan localhost
    // Untuk Device fisik: gunakan IP address Mac Anda (misalnya 192.168.100.183)
    
    #if targetEnvironment(simulator)
    // Running di Simulator - gunakan localhost
    static let baseURL = "http://localhost:5000"
    #else
    // Running di Device fisik - gunakan IP address Mac
    // GANTI IP INI DENGAN IP ADDRESS MAC ANDA
    static let baseURL = "http://192.168.100.183:5000"
    #endif
    
    // Atau jika ingin lebih fleksibel, bisa uncomment baris ini
    // dan set di build settings atau environment variable
    // static let baseURL = ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3001"
}

