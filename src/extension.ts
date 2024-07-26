import * as vscode from 'vscode';
import axios from 'axios';

export function chatCopilot(content: string) {
	const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showErrorMessage('No active editor found');
			return "";
		}
		const selection = editor.selection;
		const codeSnippet = editor.document.getText(selection);

		const requestPayload = {
			prompt: codeSnippet,
			model: "codellama:7b-code",
			stream: false
		};
		// http://localhost:11434/api/generate
		// http://127.0.0.1:5000/api/generate
		axios.post('http://127.0.0.1:5000/api/generate', requestPayload)
		.then(response => {
			vscode.window.showInformationMessage(response.data.data.prompt);
			return response.data.data.prompt;
		})
		.catch(error => {
			vscode.window.showErrorMessage(`Error generating code: ${error.message}`);
			return error.message;
		});
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('duccopilot.Chat', () => {
		vscode.window.showInformationMessage('Chat command executed'); // Add this line for debugging

		  // Create and show panel
		  const panel = vscode.window.createWebviewPanel(
			'chatview',
			'Duc Copilot',
			vscode.ViewColumn.Two,
			{
				enableScripts: true
			}
		  );
		  // And set its HTML content
		  panel.webview.html = getWebviewContent();
		  panel.webview.onDidReceiveMessage(
			async message => {
				switch (message.type) {
					case 'newMessage':
						const chatCopilotResponse = chatCopilot(message.text);
						panel.webview.postMessage({ type: 'newMessage', text: chatCopilotResponse });
						break;
				}
			},
			undefined,
			context.subscriptions
		);
		})
	  );
	
}

function getWebviewContent() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Q&A Chat</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
        }
        #chat-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 10px;
            border-bottom: 1px solid #ccc;
            overflow-y: auto;
        }
        #input-container {
            display: flex;
            padding: 10px;
            border-top: 1px solid #ccc;
        }
        #message-input {
            flex: 1;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        #send-button {
            padding: 10px 20px;
            font-size: 16px;
            margin-left: 10px;
            border: none;
            background-color: #007acc;
            color: white;
            border-radius: 4px;
            cursor: pointer;
        }
        #send-button:hover {
            background-color: #005f99;
        }
    </style>
</head>
<body>
    <div id="chat-container"></div>
    <div id="input-container">
        <input type="text" id="message-input" placeholder="Type your message here..." />
        <button id="send-button">Send</button>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const chatContainer = document.getElementById('chat-container');
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');

        sendButton.addEventListener('click', () => {
            const message = messageInput.value;
            if (message) {
                vscode.postMessage({ type: 'newMessage', text: message });
                messageInput.value = '';
                addMessageToChat('You', message);
            }
        });

        function addMessageToChat(sender, message) {
            const messageElement = document.createElement('div');
            messageElement.textContent = \`\${sender}: \${message}\`;
            chatContainer.appendChild(messageElement);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        window.addEventListener('message', event => {
            const message = event.data;
            switch (message.type) {
                case 'newMessage':
                    addMessageToChat('Bot', message.text);
                    break;
            }
        });
    </script>
</body>
</html>`;
}

export function deactivate() {}
