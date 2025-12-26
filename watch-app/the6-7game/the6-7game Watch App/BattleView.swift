import SwiftUI

struct BattleView: View {
    @State private var currentQuestion: Question?
    @State private var selectedAnswer: String?
    @State private var timer = 0
    @State private var isBattleActive = false
    
    // Timer for the persistent clock update if needed,
    // though Text(date, style: .time) handles it automatically.
    
    var body: some View {
        ScrollView {
            VStack {
                // Persistent Time Overlay (User Requirement)
                HStack {
                    Spacer()
                    Text(Date.now, style: .time)
                        .font(.caption2)
                        .foregroundColor(.gray)
                }
                .padding(.horizontal)
                
                if isBattleActive, let question = currentQuestion {
                    Spacer().frame(height: 20)
                    
                    Text(question.text)
                        .font(.system(size: 40, weight: .bold)) // Larger for kids
                        .padding(.bottom, 5)
                    
                    Text("Time: \(timer)s")
                        .font(.caption)
                        .foregroundColor(.brandGold)
                        .padding(.bottom)
                    
                    // Multiple Choice Grid
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                        ForEach(question.options, id: \.self) { option in
                            AnswerButton(
                                text: option,
                                isSelected: selectedAnswer == option
                            ) {
                                selectAnswer(option)
                            }
                        }
                    }
                    .padding(.horizontal)

                } else {
                    VStack(spacing: 20) {
                        Text("Searching for battle...")
                        ProgressView()
                    }
                    .padding(.top, 40)
                }
            }
        }
        .onAppear {
            checkForActiveBattle()
        }
    }
    
    func checkForActiveBattle() {
        // Poll backend for active battle
        // Mocking activation with delay for Demo
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            isBattleActive = true
            generateNewQuestion()
            startTimer()
        }
    }
    
    func generateNewQuestion() {
        currentQuestion = GameLogic.shared.generateMathQuestion()
    }
    
    func selectAnswer(_ answer: String) {
        selectedAnswer = answer
        
        if answer == currentQuestion?.correctAnswer {
            // Correct - Visual Feedback?
            // For now, fast forward
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                generateNewQuestion()
                selectedAnswer = nil
            }
        } else {
            // Shake/Wrong (Haptic)
            // WKInterfaceDevice.current().play(.failure) // Needs import WatchKit, sticking to SwiftUI generic for now
        }
    }
    
    func startTimer() {
        Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { _ in
            timer += 1
        }
    }
}

struct BattleView_Previews: PreviewProvider {
    static var previews: some View {
        BattleView()
    }
}
