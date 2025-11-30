//
//  ProfileView.swift
//  tugas
//
//  Created by prk on 10/6/25.
//

import SwiftUI

struct ProfileView: View {
    @State private var name: String = ""
    @State private var email: String = ""
    @State private var password: String = ""
    @StateObject private var authController = AuthController()
    @State private var isSaving = false
    @State private var navigateToLogin = false
    
    @State private var isEditingName = false
    @State private var isEditingEmail = false
    @State private var isEditingPassword = false

    var body: some View {
        NavigationStack {
            ZStack {
                Color(hex: 0x211111).ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 16) {
                        Image(systemName: "person.crop.circle.fill")
                            .resizable()
                            .scaledToFill()
                            .frame(width: 100, height: 100)
                            .clipShape(Circle())
                            .foregroundColor(.gray)
                            .padding(.top, 24)
                            .padding(.bottom, 24)
                        
                        Text("Account")
                            .font(.headline)
                            .foregroundColor(.white)
                            .padding(.bottom, 4)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 24)
                
                        // name
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Name")
                                .font(.caption)
                                .foregroundColor(.gray)
                            HStack {
                                TextField("Name", text: $name)
                                    .padding()
                                    .background(Color(hex: 0x2D1D1D))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                                    .disabled(!isEditingName)
                                    .opacity(isEditingName ? 1.0 : 0.6)
                                
                                Button(action: {
                                    isEditingName.toggle()
                                }) {
                                    Image(systemName: isEditingName ? "checkmark.circle.fill" : "pencil")
                                        .foregroundColor(isEditingName ? .green : .gray)
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // email
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Email")
                                .font(.caption)
                                .foregroundColor(.gray)
                            HStack {
                                TextField("Email", text: $email)
                                    .padding()
                                    .background(Color(hex: 0x2D1D1D))
                                    .foregroundColor(.white)
                                    .cornerRadius(8)
                                    .disabled(!isEditingEmail)
                                    .opacity(isEditingEmail ? 1.0 : 0.6)
                                    .textInputAutocapitalization(.never)
                                    .keyboardType(.emailAddress)
                                
                                Button(action: {
                                    isEditingEmail.toggle()
                                }) {
                                    Image(systemName: isEditingEmail ? "checkmark.circle.fill" : "pencil")
                                        .foregroundColor(isEditingEmail ? .green : .gray)
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                        
                        // password
                        VStack(alignment: .leading, spacing: 8) {
                            Text("Password")
                                .font(.caption)
                                .foregroundColor(.gray)
                            HStack {
                                if isEditingPassword {
                                    TextField("New Password", text: $password)
                                        .padding()
                                        .background(Color(hex: 0x2D1D1D))
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                        .textInputAutocapitalization(.never)
                                } else {
                                    TextField("", text: .constant("••••••••"))
                                        .padding()
                                        .background(Color(hex: 0x2D1D1D))
                                        .foregroundColor(.white)
                                        .cornerRadius(8)
                                        .disabled(true)
                                        .opacity(0.6)
                                }
                                
                                Button(action: {
                                    if isEditingPassword {
                                        // Selesai edit, kosongkan password field
                                        isEditingPassword = false
                                    } else {
                                        // Mulai edit, kosongkan password untuk input baru
                                        password = ""
                                        isEditingPassword = true
                                    }
                                }) {
                                    Image(systemName: isEditingPassword ? "checkmark.circle.fill" : "pencil")
                                        .foregroundColor(isEditingPassword ? .green : .gray)
                                }
                            }
                        }
                        .padding(.horizontal, 24)
                
                        Button(action: {
                            Task {
                                isSaving = true
                                do {
                                    let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
                                    let trimmedEmail = email.trimmingCharacters(in: .whitespacesAndNewlines)
                                    let trimmedPassword = password.trimmingCharacters(in: .whitespacesAndNewlines)
                                    let nameParam = trimmedName.isEmpty ? nil : trimmedName
                                    let emailParam = trimmedEmail.isEmpty ? nil : trimmedEmail
                                    let passwordParam = trimmedPassword.isEmpty ? nil : trimmedPassword
                                    try await authController.updateProfile(username: nameParam, email: emailParam, password: passwordParam)
                                    
                                    // Reset editing states setelah save
                                    isEditingName = false
                                    isEditingEmail = false
                                    isEditingPassword = false
                                    password = "" // Reset password field
                                } catch {
                                    // silently fail or add inline error state if needed
                                }
                                isSaving = false
                            }
                        }) {
                            Text(isSaving ? "Saving..." : "Save Changes")
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background((isEditingName || isEditingEmail || isEditingPassword) ? Color.green : Color.gray)
                                .foregroundColor(.white)
                                .cornerRadius(8)
                        }
                        .disabled(!isEditingName && !isEditingEmail && !isEditingPassword)
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                        
                        // NavigationLink for redirect after logout
                        NavigationLink(destination: LogInView(), isActive: $navigateToLogin) { EmptyView() }
                        
                        // button logout
                        Button(action: {
                            UserDefaults.standard.removeObject(forKey: "accessToken")
                            navigateToLogin = true
                        }) {
                            HStack {
                                Image(systemName: "rectangle.portrait.and.arrow.right")
                                Text("Logout")
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.red)
                            .foregroundColor(.white)
                            .cornerRadius(8)
                        }
                        .padding(.horizontal, 24)
                        .padding(.top, 8)
                        .padding(.bottom, 24)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .task {
                do {
                    let user = try await authController.getProfile()
                    print("✅ Profile loaded:")
                    print("   Username: \(user.username)")
                    print("   Email: \(user.email)")
                    print("   Balance: \(user.balance)")
                    
                    name = user.username
                    email = user.email
                } catch {
                    print("❌ Error loading profile: \(error)")
                    // keep fields empty on failure
                }
            }
        }
    }
}

#Preview {
    ProfileView()
}
