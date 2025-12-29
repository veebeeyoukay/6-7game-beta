import SwiftUI

struct AnswerButton: View {
    let text: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(text)
                .font(Font.system(size: 20, weight: .bold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding()
                .background(isSelected ? Color.brandTeal : Color.brandBlue)
                .cornerRadius(10)
        }
        .buttonStyle(PlainButtonStyle()) // Important for WatchOS list/scroll context
    }
}

struct AnswerButton_Previews: PreviewProvider {
    static var previews: some View {
        AnswerButton(text: "72", isSelected: false, action: {})
            .previewLayout(.fixed(width: 150, height: 60))
    }
}
