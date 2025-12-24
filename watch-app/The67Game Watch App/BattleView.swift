import SwiftUI

struct BattleView: View {
    @State private var question = "Waiting for battle..."
    @State private var answer = ""
    @State private var timer = 0
    @State private var isBattleActive = false
    
    var body: some View {
        VStack {
            if isBattleActive {
                Text(question)
                    .font(.title)
                    .padding()
                
                Text("Time: \(timer)")
                    .font(.caption)
                    .padding(.bottom)
                
                TextField("Answer", text: $answer)
                    .keyboardType(.numberPad)
                    .multilineTextAlignment(.center)
                
                Button("Submit") {
                    submitAnswer()
                }
                .padding()
            } else {
                Text("Waiting for opponent...")
                Button("Start Practice") {
                    // Navigate to Practice
                }
            }
        }
        .onAppear {
            checkForActiveBattle()
        }
    }
    
    func checkForActiveBattle() {
        // Poll backend for active battle
        // Mocking activation
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.0) {
            isBattleActive = true
            question = "8 x 9"
            startTimer()
        }
    }
    
    func startTimer() {
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            timer += 1
        }
    }
    
    func submitAnswer() {
        // Send answer to backend
        answer = ""
    }
}

struct BattleView_Previews: PreviewProvider {
    static var previews: some View {
        BattleView()
    }
}
