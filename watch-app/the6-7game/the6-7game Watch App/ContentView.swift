import SwiftUI

struct ContentView: View {
    @State private var isPaired = false
    
    var body: some View {
        Group {
            if isPaired {
                MainMenuView()
            } else {
                PairingView(isPaired: $isPaired)
            }
        }
    }
}
