import * as vscode from "vscode";
import { RCPanelProvider } from "./panels/RCPanel";
export function activate(context: vscode.ExtensionContext) {
  const provider = new RCPanelProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      RCPanelProvider.viewType,
      provider
    )
  );
}

export function deactivate() {}
