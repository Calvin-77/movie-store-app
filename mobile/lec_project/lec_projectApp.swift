//
//  lec_projectApp.swift
//  lec_project
//
//  Created by prk on 10/7/25.
//

import SwiftUI
import SwiftData

@main
struct lec_projectApp: App {
    var sharedModelContainer: ModelContainer = {
        let schema = Schema([
            Item.self,
        ])
        let modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)

        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            fatalError("Could not create ModelContainer: \(error)")
        }
    }()

    var body: some Scene {
        WindowGroup {
            LogInView()
        }
        .modelContainer(sharedModelContainer)
    }
}
