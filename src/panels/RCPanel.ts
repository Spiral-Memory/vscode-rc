import * as vscode from "vscode";

import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";

export class RCPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vsCodeRc.entry";

  public _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.messagePasser = this.messagePasser.bind(this);
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    this._setWebviewMessageListener(this._view.webview);
  }

  
  public messagePasser(message: string) {
    console.log("Message passer has been called");
    this._view?.webview.postMessage({ command: message });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const webviewUri = getUri(webview, this._extensionUri, [
      "out",
      "webviewLogic.js",
    ]);
    const cssStyles = getUri(webview, this._extensionUri, [
      "media",
      "index.css",
    ]);
    const nonce = getNonce();

    return /*html*/ `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>RC VSCode Extension</title>
        <link href="${cssStyles}" rel="stylesheet">
    </head>
    
    <body>
        <div id = "login-page">
          <h1>Welcome to Rocket.Chat VSCode Extension</h1>
          <h2>Login</h2>
          <form id="login-form">
              <vscode-text-field id="username" size="50" placeholder="example@example.com" autofocus>Email or username
                  *</vscode-text-field>
              <vscode-text-field id="password" size="50" type="password">Password *</vscode-text-field>
              <vscode-button id="login-btn">Login</vscode-button>
          </form>
        </div>
    
        <div id = "chat-container">
            <div id="message-view-box">
            </div>
            <div class="message-input-container">
                <vscode-text-field id="msg-input" size="50" placeholder="Type your message ..."
                    autofocus></vscode-text-field>
                <vscode-button id="send-btn">Send</vscode-button>
            </div>
        </div>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
    </body>
    
    </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage((data: any) => {
      const status = data.status;
      const message = data.message;

      switch (status) {
        case "success":
          vscode.window.showInformationMessage(message);
          break;
        case "error":
          vscode.window.showErrorMessage(message);
          break;
      }
    });
  }
}
