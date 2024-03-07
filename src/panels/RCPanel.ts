import * as vscode from "vscode";

import { getUri } from "../utils/getUri";
import { getNonce } from "../utils/getNonce";
import { listenToRoom } from "../external/ddpRunner";   

export class RCPanelProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "vsCodeRc.entry";

  private _view?: vscode.WebviewView;

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
      "webviewLogic.js",
    ]);
    const cssStyles = getUri(webview, this._extensionUri, [
      "media",
      "index.css",
    ]);
    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>RC VSCode Extension</title>
          <link href="${cssStyles}" rel="stylesheet">
        </head>
        <body>
          <h1>Welcome to Rocket.Chat VSCode Extension</h1>
          <h2>Login</h2>
          <form id="login-form">
          <vscode-text-field id ="username" size="50" placeholder="example@example.com" autofocus>Email or username *</vscode-text-field>
          <vscode-text-field id = "password" size="50" type="password">Password *</vscode-text-field>
          <vscode-button id="login-btn">Login</vscode-button>
          </form>
					<script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage((data: any) => {
      const status = data.status;
      const message = data.message;
      const authToken = data.authToken;

      switch (status) {
        case "success":
          vscode.window.showInformationMessage(message);
          listenToRoom("GENERAL", authToken);
          break;
        case "error":
          vscode.window.showErrorMessage(message);
          break;
      }
    });
  }

  
}
