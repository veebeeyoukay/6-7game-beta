import SwiftUI

struct MainMenuView: View {
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                NavigationLink(destination: PracticeView()) {
                    Text("Practice Mode")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.brandBlue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }

                NavigationLink(destination: BattleView()) {
                    Text("Battle Mode")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.brandMagenta)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }

                NavigationLink(destination: TasksView()) {
                    Text("Tasks")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.brandTeal)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }

                NavigationLink(destination: AvatarView()) {
                    Text("Avatar")
                        .font(.headline)
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color.brandGold)
                        .foregroundColor(.brandNavy)
                        .cornerRadius(10)
                }

                Text("Mollars: 150")
                    .font(.caption)
                    .foregroundColor(.brandGold)
            }
            .navigationTitle("6-7 Game")
        }
    }
}

struct MainMenuView_Previews: PreviewProvider {
    static var previews: some View {
        MainMenuView()
    }
}
