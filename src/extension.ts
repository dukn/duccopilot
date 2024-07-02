import * as vscode from 'vscode';
import axios from 'axios';


// https://github.com/ollama/ollama/blob/main/docs/api.md#generate-a-completion
interface LLMResponse {
	// response of nostreaming 
	model: string;
	created_at: string;
	response: string;
	done: boolean;
	context: Array<number>;
	total_duration: number;
	load_duration: number;
	prompt_eval_count: number;
	prompt_eval_duration: number;
	eval_count: number;
	eval_duration: number;
}
let prefix_prompt = "Complete this line:\n";

export function activate(context: vscode.ExtensionContext) {
    vscode.languages.registerCompletionItemProvider('*', {
        provideCompletionItems(document, position) {
            const linePrefix = document.lineAt(position).text.substr(0, position.character);
            
            console.log("Requesting completion for:", linePrefix); // Log the request

            return axios.post<LLMResponse>('http://localhost:11434/api/generate', {
                prompt: prefix_prompt + linePrefix,
                model: "codellama:7b-code",
                stream: false
            })
                .then(response => {
                    console.log("Received response:", response.data); // Log the response

                    const suggestion = response.data.response;
                    return [new vscode.CompletionItem(suggestion, vscode.CompletionItemKind.Snippet)];
                })
                .catch(error => {
                    console.error("Error fetching completion:", error); // Log errors
                    return []; // Or handle the error differently
                });
        }
    });
}

export function deactivate() { }
