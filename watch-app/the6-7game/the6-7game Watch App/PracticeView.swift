import SwiftUI

struct PracticeView: View {
    @State private var question = "6 x 7"
    @State private var answer = ""
    @State private var showResult = false
    @State private var isCorrect = false
    
    var body: some View {
        VStack {
            Text(question)
                .font(.title)
                .padding()
            
            TextField("Answer", text: $answer)
                .multilineTextAlignment(TextAlignment.center)
                .textInputAutocapitalization(.never)
                .disableAutocorrection(true)
            
            Button("Submit") {
                checkAnswer()
            }
            .padding()
            
            if showResult {
                Text(isCorrect ? "Correct!" : "Try Again")
                    .foregroundColor(isCorrect ? .green : .red)
            }
        }
    }
    
    func checkAnswer() {
        if answer == "42" {
            isCorrect = true
        } else {
            isCorrect = false
        }
        showResult = true
        
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            nextQuestion()
        }
    }
    
    func nextQuestion() {
        // Mock next question logic
        question = "7 x 6" 
        answer = ""
        showResult = false
    }
}

struct PracticeView_Previews: PreviewProvider {
    static var previews: some View {
        PracticeView()
    }
}
