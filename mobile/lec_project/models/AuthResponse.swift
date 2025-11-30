struct AuthResponse: Codable {
    let status: String
    let data: AuthData
}

struct AuthData: Codable {
    let accessToken: String
    let refreshToken: String
    let role: String?
}
