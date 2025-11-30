//
//  AlertNotification.swift
//  tugas
//
//  Created by prk on 07/10/25.
//

import SwiftUI

struct AlertNotification: View {
    @State private var showAlert = false
    var body: some View {
        VStack {
            Button("Show Alert"){
                showAlert = true
            }
            .alert("Choose an Option", isPresented: $showAlert) {
                Button("Delete", role: .destructive){
                    print("Option 1 selected")
                }
                Button("Cancel", role: .cancel){
                    print("Cancelled")
                }
            }
            message: {
                Text("Are you sure you want to delete?")
            }
        }
    }
}

#Preview {
    AlertNotification()
}
