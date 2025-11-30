struct User: Codable {
    let id: String
    let username: String
    let email: String
    let balance: Int
}

struct UserProfileResponse: Codable {
    let status: String
    let data: User
}
