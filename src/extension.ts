import * as vscode from "vscode";
import { RCPanelProvider } from "./panels/RCPanel";
import { RCComment } from "./comments/RCComments";


export function activate(context: vscode.ExtensionContext) {
  const provider = new RCPanelProvider(context.extensionUri);
  const rcComment = new RCComment();

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      RCPanelProvider.viewType,
      provider
    )
  );
  context.subscriptions.push(rcComment.commentController);

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsCodeRc.startDiscussion",
      (reply: vscode.CommentReply) => {
        rcComment.replyNote(reply, true);
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vsCodeRc.reply",
      (reply: vscode.CommentReply) => {
        rcComment.replyNote(reply);
      }
    )
  );
}

export function deactivate() {}
