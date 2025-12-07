//
//  AuthService.swift
//  dancow
//
//  Created by prk on 07/10/25.
//

import Foundation

class AuthController: ObservableObject {
    private let baseURL = Config.baseURL
    
    func register(username: String, email: String, password: String) async throws -> User {
        let url = URL(string: "\(baseURL)/users")!
        
        var request = URLRequest(url: url)
        
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "username": username,
            "email": email,
            "password": password
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        let response = try JSONDecoder().decode(RegisterResponse.self, from: data)
        
        return response.data.addedUser
    }
    
    func login(username: String, password: String) async throws -> AuthData {
        let url = URL(string: "\(baseURL)/authentications")!
        
        var request = URLRequest(url: url)
        
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "username": username,
            "password": password
        ]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, _) = try await URLSession.shared.data(for: request)
        
        let response = try JSONDecoder().decode(AuthResponse.self, from: data)
        
        return response.data
    }
    
    func updateProfile(username: String?, email: String?, password: String?) async throws {
        let url = URL(string: "\(baseURL)/users/profile")!
        
        var request = URLRequest(url: url)
        
        request.httpMethod = "PUT"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        
        var body: [String: String] = [:]
        if let username = username { body["username"] = username }
        if let email = email { body["email"] = email }
        if let password = password { body["password"] = password }
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (_, _) = try await URLSession.shared.data(for: request)
    }
    
    func getProfile() async throws -> User {
        let url = URL(string: "\(baseURL)/users/profile")!
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("Bearer \(getToken())", forHTTPHeaderField: "Authorization")
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(UserProfileResponse.self, from: data)
        return response.data
    }
    
    private func getToken() -> String {
        return UserDefaults.standard.string(forKey: "accessToken") ?? ""
    }
}
