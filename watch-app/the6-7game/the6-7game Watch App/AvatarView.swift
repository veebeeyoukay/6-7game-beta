import SwiftUI

struct AvatarConfig: Codable {
    var skinColor: String = "Skin1"
    var hairStyle: String = "Short"
    var hairColor: String = "Brown"
    var shirtColor: String = "Blue"
}

struct AvatarView: View {
    @State private var config = AvatarConfig()
    @State private var selectedTab = 0
    
    let skinColors = ["Skin1", "Skin2", "Skin3", "Skin4"]
    let hairStyles = ["Short", "Long", "Spiky", "Bald"]
    let hairColors = ["Brown", "Black", "Blonde", "Red"]
    let shirtColors = ["Blue", "Red", "Green", "Yellow"]
    
    var body: some View {
        VStack {
            // Avatar Preview
            ZStack {
                Circle().fill(Color(config.skinColor == "Skin1" ? .orange : .brown).opacity(0.3)) // Simple mock
                    .frame(width: 80, height: 80)
                Text("USER") // Placeholder for real asset logic
            }
            .padding()
            
            // Customization Tabs
            Picker("Category", selection: $selectedTab) {
                Text("Skin").tag(0)
                Text("Hair").tag(1)
                Text("Shirt").tag(2)
            }
// .pickerStyle(SegmentedPickerStyle()) // Not available on watchOS
            
            // Options Grid
            ScrollView {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    if selectedTab == 0 {
                        ForEach(skinColors, id: \.self) { color in
                            Button(color) { config.skinColor = color }
                        }
                    } else if selectedTab == 1 {
                        ForEach(hairStyles, id: \.self) { style in
                            Button(style) { config.hairStyle = style }
                        }
                    } else {
                        ForEach(shirtColors, id: \.self) { color in
                            Button(color) { config.shirtColor = color }
                        }
                    }
                }
            }
            
            Button("Save Avatar") {
                saveAvatar()
            }
            .background(Color.brandTeal)
            .cornerRadius(8)
        }
        .navigationTitle("Style")
    }
    
    func saveAvatar() {
        // Mock save to DB
        print("Saving avatar config: \(config)")
    }
}

struct AvatarView_Previews: PreviewProvider {
    static var previews: some View {
        AvatarView()
    }
}
