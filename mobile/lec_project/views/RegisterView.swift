//
//  SignUpView.swift
//  project_lec
//
//  Created by prk on 10/6/25.
//

import Foundation
import SwiftUI
import SwiftData

struct RegisterView: View {
    @State private var username:String = ""
    @State private var email:String = ""
    @State private var password:String = ""
    @State private var isLoading = false
    @ObservedObject var controller = AuthController()
    @State private var navigateToLogin = false
    @Environment(\.dismiss) var dismiss
    
    private enum FocusableField {
        case email
        case username
        case password
    }
    @FocusState private var focusedField: FocusableField?
    
    var body: some View {
        VStack {
            Text("Sign Up")
                .font(.system(size: 32, weight: .bold))
                .foregroundStyle(.white)
                .padding(.top, 160)
            
            Text("Enter Your credentials")
                .foregroundStyle(.gray)
            
            Spacer()
                .frame(maxHeight: 24)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Email")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                TextField("", text:$email, prompt: Text("enter email").foregroundColor(Color(hex: 0x9E9E9E)))
                    .textInputAutocapitalization(.never)
                    .foregroundStyle(.white)
                    .padding()
                    .background(Color(hex: 0x3B1A16))
                    .cornerRadius(8)
                    .focused($focusedField, equals: .email)
            }
            .padding(.horizontal, 24)
            
            Spacer()
                .frame(maxHeight: 8)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Username")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                TextField("", text:$username, prompt: Text("enter username").foregroundColor(Color(hex: 0x9E9E9E)))
                    .textInputAutocapitalization(.never)
                    .foregroundStyle(.white)
                    .padding()
                    .background(Color(hex: 0x3B1A16))
                    .cornerRadius(8)
                    .focused($focusedField, equals: .username)
            }
            .padding(.horizontal, 24)
            
            Spacer()
                .frame(maxHeight: 8)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Password")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                TextField("", text:$password, prompt: Text("enter password").foregroundColor(Color(hex: 0x9E9E9E)))
                    .textInputAutocapitalization(.never)
                    .foregroundStyle(.white)
                    .padding()
                    .background(Color(hex: 0x3B1A16))
                    .cornerRadius(8)
                    .focused($focusedField, equals: .password)
            }
            .padding(.horizontal, 24)
            
            Spacer()
                .frame(maxHeight: 54)
            
            Button(action: {
                Task {
                    isLoading = true
                    do {
                        let user = try await controller.register(username: username, email: email, password: password)
                        await MainActor.run {
                            isLoading = false
                            // Navigate to login after successful registration
                            navigateToLogin = true
                        }
                    } catch {
                        await MainActor.run {
                            isLoading = false
                            // silently fail or add inline error state if needed
                        }
                    }
                }
            }) {
                if isLoading {
                    ProgressView()
                } else {
                    Text("Sign Up")
                        .frame(maxWidth: .infinity)
                        .foregroundStyle(.white)
                        .padding()
                        .background(Color(hex: 0xE53935))
                        .cornerRadius(8)
                }
            }
            .padding(.horizontal, 24)
            
            Spacer()
                .frame(maxHeight: 16)
            
            HStack {
                Text("Already have an account?")
                    .foregroundStyle(.gray)
                NavigationLink(destination: LogInView(), isActive: $navigateToLogin) {
                    Text("Login here")
                        .fontWeight(.bold)
                        .foregroundStyle(.gray)
                }
            }

            Spacer()
        }
        .frame(
            minWidth: 0,
            maxWidth: .infinity,
            minHeight: 0,
            maxHeight: .infinity,
            alignment: .center
        )
        .background(Color(hex: 0x2C0F0C))
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .navigationBarBackButtonHidden(true)
        .onTapGesture {
            focusedField = nil
        }
    }
}

#Preview {
    RegisterView()
}
