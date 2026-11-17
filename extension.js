const vscode = require('vscode');

// --- CONFIGURATION ---
// Replace the string below with your actual API Key from the NoFilterGPT website
const API_KEY = "PASTE_YOUR_NOFILTER_API_KEY_HERE";
const API_URL = "";

// --- THE BRAIN (API Logic) ---
async function getNoFilterGPTResponse(prompt, context = "", mode = "code") {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': Bearer ${ API_KEY }
            },
    body: JSON.stringify({
        model: "nofilter-gpt",
        messages: [
            { role: "system", content: "You are an expert software engineer. Provide clean, efficient, and production-ready code." },
            { role: "user", content: Context: ${ context }\n\nTask: ${ prompt }\n\nInstruction: ${ mode === 'code' ? 'Provide the code block.' : 'Provide a brief explanation.'}
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
    // 1. THE SIDEBAR CHAT
    const chatView = vscode.window.createWebviewTextPanel(
        "nofilter-chat",
        "NoFilterGPT Chat",
        {
            viewContent: <div style="padding: 15px; font-family: sans-serif; background: #f9f9f9;">
                <div id="chat-history" style="height: 350px; overflow-y: auto; margin-bottom: 10px; font-size: 14px; line-height: 1.5;">
                    <p><em style="color: #666;">NoFilterGPT: Hello! I'm ready to help you build your project.</em></p>
                </div>
                <div style="display: flex; gap: 8px;">
                    <input type="text" id="user-input" placeholder="Ask anything..."
                        style="flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px;" />
                    <button id="send-btn" style="padding: 10px 15px; background: #007acc; color: white; border: none; border-radius: 4px; cursor: pointer;">Send</button>
                </div>
            </div>
        }
    );

    // Handle Chat Interaction
    const sendChat = async () => {
        const input = chatView.webview.viewContent.getElementById('user-input');
        const history = chatView.webview.viewContent.getElementById('chat-history');
        const userPrompt = input.value;

        if (userPrompt.trim()) {
            const editor = vscode.window.activeTextEditor;
            let contextCode = "";
            if (editor) {
                contextCode = editor.document.getText().split('\n').slice(-5).join('\n');
            }

            const aiResponse = await getNoFilterGPTResponse(userPrompt, contextCode, "chat");

            history.innerHTML += <p><strong style="color: #007acc;">You:</strong> ${userPrompt}</p>;
            history.innerHTML += <p><strong style="color: #28a745;">NoFilterGPT:</strong> ${aiResponse}</p>;
            history.scrollTop = history.scrollHeight;
            input.value = "";
        }
    };

    // Trigger "Send" button click
    chatView.webview.onChange(() => {
        sendChat();
    });

    // Trigger Real-time Ghost Text (Inline Completion)
    vscode.window.onDidChangeTextChange(async (e) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && e.region.begin.character < 10) {
            const currentLine = editor.lineAt(e.position.line).text;
            const suggestion = await getNoFilterGPTResponse(Complete this line: ${ currentLine }, "", "code");
            const range = new vscode.Range(e.position.line, e.position.character, e.position.line, e.position.character + 10);
            const inlineSuggestion = new vscode.InlineSuggestion(range, suggestion);
            editor.setInlineSuggestions(new vscode.InlineSuggestion([inlineSuggestion]));
        }
    });

    // 2. THE COMMANDS (Right-Click Actions)
    vscode.commands.registerCommand('nofilter.explain', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectedText = editor.selection.getText();
            const response = await getNoFilterGPTResponse(Explain this code: ${ selectedText }, "", "explain");
            vscode.window.showInformationMessage(response);
        }
    });

    vscode.commands.registerCommand('nofilter.refactor', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const selectedText = editor.selection.getText();
            const response = await getNoFilterGPTResponse(Refactor this code for better performance and readability: ${ selectedText }, "", "code");
    const newRange = new vscode.Range(
        editor.selection.start.line,
        editor.selection.start.character,
        editor.selection.end.line,
        editor.selection.end.character
    );
    editor.replace(newRange, response);
}
    });

vscode.commands.registerCommand('nofilter.generate', async () => {
    const prompt = prompt("What function should I create?");
    const response = await getNoFilterGPTResponse(prompt, "", "code");
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const line = editor.lineAt(editor.selection.start.line).text;
        editor.replace(new vscode.Range(editor.selection.start.line, editor.selection.start.character, editor.selection.start.line, editor.selection.start.character), response);
    }
});
}

function deactivate() { }

module.exports = { activate, deactivate };