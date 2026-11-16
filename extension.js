const vscode = require('vscode');

// --- CONFIGURATION ---
const API_KEY = ""; 
const API_URL = "https😕/api.nofiltergpt.com/v1/chat";

// --- THE BRAIN (API Logic) ---
async function getNoFilterGPTResponse(prompt, context = "") {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ${API_KEY}
            },
            body: JSON.stringify({
                model: "nofilter-gpt",
                messages: [
                    { role: "system", content: "You are a coding expert. Provide clean, accurate, and efficient code." },
                    { role: "user", content: Context: ${context}\n\nQuestion: ${prompt} }
                ],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        return "Error: " + error.message;
    }
}

// --- THE ACTIVATION ---
function activate(context) {
    // 1. Create the Sidebar Chat
    const chatView = vscode.window.createWebviewTextPanel(
        "nofilter-chat", 
        "NoFilterGPT Chat", 
        {
            viewContent: <div style="padding: 15px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                <div id="chat-history" style="height: 300px; overflow-y: auto; margin-bottom: 10px; border-bottom: 1px solid #ddd; font-size: 14px;">
                    <p><em style="color: #666;">NoFilterGPT: Hello! Highlight your code and ask me anything.</em></p>
                </div>
                <input type="text" id="user-input" placeholder="Type your question..." 
                style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; outline: none;" />
            </div>
        }
    );

    // 2. Handle Chat Interaction
    chatView.webview.onDidTextChange(async (e) => {
        const input = chatView.webview.viewContent.getElementById('user-input');
        const history = chatView.webview.viewContent.getElementById('chat-history');
        const userPrompt = input.value;

        if (userPrompt.trim()) {
            const editor = vscode.window.activeTextEditor;
            let contextCode = "";
            
            // If code is selected, use it as context. If not, use the whole file.
            if (editor && !editor.selection.isEmpty) {
                contextCode = editor.selection.getText();
            } else if (editor) {
                contextCode = editor.document.getText();
            }

            const aiResponse = await getNoFilterGPTResponse(userPrompt, contextCode);

            // Update the UI
            history.innerHTML += <p><strong style="color: #007acc;">You:</strong> ${userPrompt}</p>;
            history.innerHTML += <p><strong style="color: #28a745;">NoFilterGPT:</strong> ${aiResponse}</p>;
            history.scrollTop = history.scrollHeight;
        }
    });

    // 3. Add the "Explain" Right-Click Command
    vscode.commands.registerCommand('nofilter.explain', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectedText = editor.selection.getText();
            const response = await getNoFilterGPTResponse(Explain this code clearly: ${selectedText});
            vscode.window.showInformationMessage(response);
        }
    });
}

function deactivate() {}

module.exports = { activate, deactivate };