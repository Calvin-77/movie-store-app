struct User: Codable {
    let id: String
    let username: String
    let email: String
    let balance: Int?
    
    // Computed property untuk mendapatkan balance dengan default 0
    var balanceValue: Int {
        return balance ?? 0
    }
}

struct UserProfileResponse: Codable {
    let status: String
    let data: User
}
