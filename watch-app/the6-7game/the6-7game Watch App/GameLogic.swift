import Foundation

struct Question: Identifiable {
    let id: String
    let text: String
    let options: [String]
    let correctAnswer: String
}

class GameLogic {
    static let shared = GameLogic()
    
    // Generate a math question with distractors
    func generateMathQuestion(grade: Int = 3) -> Question {
        // Simple Logic for Demo: Multiplication table check (Grade 3+)
        // Or Addition for younger.
        
        let num1 = Int.random(in: 2...9)
        let num2 = Int.random(in: 2...9)
        let answer = num1 * num2
        
        let distractors = generateDistractors(answer: answer)
        var options = distractors
        options.append(answer)
        options.shuffle()
        
        return Question(
            id: UUID().uuidString,
            text: "\(num1) × \(num2)",
            options: options.map { String($0) },
            correctAnswer: String(answer)
        )
    }
    
    private func generateDistractors(answer: Int) -> [Int] {
        var distractors = Set<Int>()
        
        // Strategy 1: Close numbers (+/- 1 to 5)
        while distractors.count < 3 {
            let offset = Int.random(in: -5...5)
            let candidate = answer + offset
            
            if candidate != answer && candidate > 0 {
                distractors.insert(candidate)
            }
            
            // Strategy 2: Transposition (e.g. 56 -> 65)
            // (Only try once to avoid infinite loops or complexity)
            if distractors.count < 3 { // check again
                let s = String(answer)
                if s.count == 2 {
                    let reversed = String(s.reversed())
                    if let revInt = Int(reversed), revInt != answer {
                        distractors.insert(revInt)
                    }
                }
            }
        }
        
        return Array(distractors).prefix(3).map { $0 }
    }
}
