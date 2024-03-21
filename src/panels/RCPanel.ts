import * as vscode from "vscode";

import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";
import { RocketChatRealtime } from "../api/realTimeapi";
import { RocketChatApi } from "../api/api";
import { AuthData } from "../authData/authData";

const host = "http://localhost:3000";
const apiClient = new RocketChatApi(host);
const realtimeClient = new RocketChatRealtime(host);

export class RCPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vsCodeRc.entry";

  public _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

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

  private _getHtmlForWebview(webview: vscode.Webview) {
    const webviewUri = getUri(webview, this._extensionUri, [
      "out",
      "webview.js",
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
              <vscode-text-field id="username" size="50" placeholder="example@example.com">Email or username
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
                    ></vscode-text-field>
                <vscode-button id="send-btn">Send</vscode-button>
            </div>
        </div>
        <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
    </body>
    
    </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(async (message: any) => {
      if (message.method) {
        const method = message.method;
        const requestData = message.data;

        switch (method) {
          case "login":
            const res = await apiClient.handleLogin(requestData);
            if (res.status === "success") {
              vscode.window.showInformationMessage("Login Successful !");
              AuthData.setAuthToken(res.data.authToken);
              AuthData.setUserId(res.data.userId);

              const sendRealTimeMsg = (message: any) => {
                webview.postMessage({ realTimeMsg: message });
              };
              realtimeClient.listenMessage(
                AuthData.getAuthToken(),
                "GENERAL",
                sendRealTimeMsg
              );
              const msgData = await apiClient.getMessage(
                AuthData.getAuthToken(),
                AuthData.getUserId()
              );
              webview.postMessage({ messages: msgData.messages });
            } else {
              vscode.window.showErrorMessage("Oops! Login Failed");
            }
            break;

          case "sendMessage":
            await apiClient.handleSendMessage(
              AuthData.getAuthToken(),
              AuthData.getUserId(),
              requestData
            );
            vscode.commands.executeCommand("vsCodeRc.reply");
            break;
        }
      }
    });
  }
}
