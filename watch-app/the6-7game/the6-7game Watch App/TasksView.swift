import SwiftUI

struct TaskItem: Identifiable {
    let id: String
    let name: String
    let reward: Int
}

struct TasksView: View {
    @State private var tasks: [TaskItem] = [
        TaskItem(id: "1", name: "Clean Room", reward: 50),
        TaskItem(id: "2", name: "Math Homework", reward: 100),
        TaskItem(id: "3", name: "Read 20 Mins", reward: 30)
    ]
    @State private var showingAlert = false
    @State private var alertMessage = ""

    var body: some View {
        List(tasks) { task in
            Button(action: {
                requestValidation(for: task)
            }) {
                HStack {
                    VStack(alignment: .leading) {
                        Text(task.name)
                            .font(.headline)
                        Text("\(task.reward) Mollars")
                            .font(.caption)
                            .foregroundColor(.yellow)
                    }
                    Spacer()
                    Image(systemName: "hand.raised.fill")
                        .foregroundColor(.green)
                }
                .padding(.vertical, 8)
            }
        }
        .navigationTitle("Tasks")
        .alert(isPresented: $showingAlert) {
            Alert(title: Text("Request Sent"), message: Text(alertMessage), dismissButton: .default(Text("OK")))
        }
    }

    func requestValidation(for task: TaskItem) {
        // Mock DB Call
        // In real app: supabase.from('validation_requests').insert(...)
        alertMessage = "Parent notified for \(task.name)!"
        showingAlert = true
    }
}

struct TasksView_Previews: PreviewProvider {
    static var previews: some View {
        TasksView()
    }
}
