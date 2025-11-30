import SwiftUI
import SwiftData

struct MainView: View {
    init() {
        let appearance = UITabBarAppearance()
        
        // BACKGROUND
        appearance.backgroundColor = UIColor(red: 33/255, green: 17/255, blue: 17/255, alpha: 1)
        
        // SHADOW (garis/border di atas TabBar)
        appearance.shadowColor = UIColor.gray.withAlphaComponent(0.3) // Warna shadow/border
        appearance.shadowImage = nil // Set nil untuk menggunakan shadowColor
        
        // ICON & TEXT - Normal State (tidak dipilih)
        appearance.stackedLayoutAppearance.normal.iconColor = UIColor.gray
        appearance.stackedLayoutAppearance.normal.titleTextAttributes = [
            NSAttributedString.Key.foregroundColor: UIColor.gray,
            NSAttributedString.Key.font: UIFont.systemFont(ofSize: 10) // Ukuran font
        ]
        
        // ICON & TEXT - Selected State (dipilih)
        appearance.stackedLayoutAppearance.selected.iconColor = UIColor.red
        appearance.stackedLayoutAppearance.selected.titleTextAttributes = [
            NSAttributedString.Key.foregroundColor: UIColor.red,
            NSAttributedString.Key.font: UIFont.boldSystemFont(ofSize: 10) // Bold saat selected
        ]
        
        // BADGE (notifikasi bulat merah)
        appearance.stackedLayoutAppearance.normal.badgeBackgroundColor = UIColor.red
        appearance.stackedLayoutAppearance.normal.badgeTextAttributes = [
            NSAttributedString.Key.foregroundColor: UIColor.white
        ]
        
        // Apply appearance
        UITabBar.appearance().standardAppearance = appearance
        UITabBar.appearance().scrollEdgeAppearance = appearance
        
        // ADDITIONAL CUSTOMIZATION (opsional)
        // Tint color untuk item yang selected (cara alternatif)
        UITabBar.appearance().tintColor = UIColor.red
        
        // Warna untuk item yang tidak selected (cara alternatif)
        UITabBar.appearance().unselectedItemTintColor = UIColor.gray
    }
    
    var body: some View {
        TabView {
            NavigationStack {
                HomeView()
            }
            .tabItem {
                Label("Home", systemImage: "house.fill")
            }

            NavigationStack {
                LibraryView()
            }
            .tabItem {
                Label("Library", systemImage: "books.vertical.fill")
            }

            NavigationStack {
                ProfileView()
            }
            .tabItem {
                Label("Profile", systemImage: "person.fill")
            }
        }
        .navigationBarBackButtonHidden(true)
    }
}

#Preview {
    MainView()
        .modelContainer(for: Item.self, inMemory: true)
}
