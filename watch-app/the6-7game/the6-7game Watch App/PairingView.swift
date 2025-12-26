import SwiftUI

struct PairingView: View {
    @Binding var isPaired: Bool
    @State private var pairingCode = ""
    @State private var isLoading = false
    @State private var errorMessage = ""
    
    var body: some View {
        VStack {
            Text("Enter 6-Digit Code")
                .font(.headline)
            
            TextField("Code", text: $pairingCode)
                .multilineTextAlignment(.center)
                .textContentType(.oneTimeCode)
                .padding()
            
            if isLoading {
                ProgressView()
            } else {
                Button("Connect") {
                    validateCode()
                }
                .disabled(pairingCode.count != 6)
                .padding()
                .background(Color.brandBlue)
                .foregroundColor(.white)
                .cornerRadius(8)
            }

            if !errorMessage.isEmpty {
                Text(errorMessage)
                    .foregroundColor(.brandMagenta)
                    .font(.caption)
            }
        }
    }
    
    func validateCode() {
        isLoading = true
        errorMessage = ""
        APIService.shared.validatePairingCode(code: pairingCode) { result in
            DispatchQueue.main.async {
                isLoading = false
                switch result {
                case .success(let isValid):
                    if isValid {
                        isPaired = true
                    } else {
                        errorMessage = "Invalid code. Try again."
                    }
                case .failure(let error):
                    errorMessage = "Error: \(error.localizedDescription)"
                }
            }
        }
    }
}
