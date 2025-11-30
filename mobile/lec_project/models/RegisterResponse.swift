struct RegisterResponse: Codable {
    let status: String
    let data: RegisterData
}

struct RegisterData: Codable {
    let addedUser: User
}
