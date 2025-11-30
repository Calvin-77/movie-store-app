//
//  ContentView.swift
//  project_lec
//
//  Created by prk on 10/6/25.
//

import SwiftUI
import SwiftData

struct LogInView: View {
    @State private var username:String = ""
    @State private var password:String = ""
    @State private var isLoading = false
    @ObservedObject var controller = AuthController()
    @State private var navigateToMain = false
    
    private enum FocusableField {
        case username
        case password
    }
    @FocusState private var focusedField: FocusableField?

    var body: some View {
        NavigationStack {
        VStack {
            Text("Welcome")
                .font(.system(size: 32, weight: .bold))
                .foregroundStyle(.white)
                .padding(.top, 160)
            
            Text("Enter your credentials")
                .foregroundStyle(.gray)
    
            Spacer()
                .frame(maxHeight: 24)
            
            VStack(alignment: .leading, spacing: 8) {
                Text("Username")
                    .font(.caption)
                    .foregroundColor(.gray)
                
                TextField("enter", text:$username, prompt: Text("enter username").foregroundColor(Color(hex: 0x9E9E9E)))
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
                
                SecureField("", text:$password, prompt: Text("enter password").foregroundColor(Color(hex: 0x9E9E9E)))
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
            
            NavigationLink(destination: MainView(), isActive: $navigateToMain) { EmptyView() }
            
            Button(action: {
                Task {
                    isLoading = true
                    do {
                        let authData = try await controller.login(username: username, password: password)
                        UserDefaults.standard.set(authData.accessToken, forKey: "accessToken")
                        navigateToMain = true
                        isLoading = false
                    } catch {
                        // silently fail or add inline error state if needed
                        isLoading = false
                    }
                }
            }) {
                if isLoading {
                    ProgressView()
                        .frame(maxWidth: .infinity)
                        .padding()
                } else {
                    Text("Login")
                        .frame(maxWidth: .infinity)
                        .padding()
                }
            }
            .foregroundStyle(.white)
            .background(Color(hex: 0xE53935))
            .cornerRadius(8)
            .padding(.horizontal, 24)
            
            Spacer()
                .frame(maxHeight: 16)
            
            HStack {
                Text("Don't have an account?")
                    .foregroundStyle(.gray)
                NavigationLink(destination: RegisterView()) {
                    Text("Sign up here")
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
        .ignoresSafeArea(.keyboard, edges: .bottom)
        .background(Color(hex: 0x2C0F0C))
        .navigationBarBackButtonHidden(true)
        .onTapGesture {
            focusedField = nil
        }
        }
    }
}

#Preview {
    LogInView()
}
