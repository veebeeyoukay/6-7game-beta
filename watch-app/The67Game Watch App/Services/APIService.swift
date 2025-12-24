import Foundation

class APIService {
    static let shared = APIService()
    private let supabaseUrl = "https://nxdcttkyegnwnjnnjjqg.supabase.co/functions/v1"
    private let anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZGN0dGt5ZWdud25qbm5qanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MzE0NzQsImV4cCI6MjA4MjEwNzQ3NH0.KC0loul4PjSTOubsrQIfvt4l9Hr4taevhfJMUPtEXnE"

    func validatePairingCode(code: String, completion: @escaping (Result<Bool, Error>) -> Void) {
        let url = URL(string: "\(supabaseUrl)/validate-pairing-code")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("Bearer \(anonKey)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = ["code": code]
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                completion(.failure(error))
                return
            }
            // Parse response
            if let data = data, let json = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
               let valid = json["valid"] as? Bool {
                completion(.success(valid))
            } else {
                completion(.failure(NSError(domain: "", code: -1, userInfo: nil)))
            }
        }.resume()
    }
}
