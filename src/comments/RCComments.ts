import * as vscode from "vscode";

let commentId = 1;
let selectedText: string | undefined;

class NoteComment implements vscode.Comment {
  id: number;
  label: string | undefined;
  savedBody: string | vscode.MarkdownString;

  constructor(
    public body: string | vscode.MarkdownString,
    public mode: vscode.CommentMode,
    public author: vscode.CommentAuthorInformation,
    public parent?: vscode.CommentThread,
    public contextValue?: string
  ) {
    this.id = ++commentId;
    this.savedBody = this.body;
  }
}

export class RCComment {
  public commentController: vscode.CommentController;

  constructor() {
    this.commentController = vscode.comments.createCommentController(
      "send-code",
      "Code Sharing RC"
    );

    vscode.window.onDidChangeTextEditorSelection((event) => {
      const newSelectedText = this._getSelectedText();
      if (newSelectedText.length > (selectedText?.length || 0)) {
        selectedText = newSelectedText;
      }
    });

    this.commentController.commentingRangeProvider = {
      provideCommentingRanges: (document: vscode.TextDocument) => {
        const lineCount = document.lineCount;
        return [new vscode.Range(0, 0, lineCount - 1, 0)];
      },
    };
  }

  public replyNote(reply: vscode.CommentReply) {
    const thread = reply.thread;
    const newCommentBody = `${reply.text}`;
    const newComment = new NoteComment(
      newCommentBody,
      vscode.CommentMode.Preview,
      { name: "@spiral-memory" },
      thread,
      thread.comments.length ? "canDelete" : undefined
    );

    thread.comments = [...thread.comments, newComment];
  }

  private _getSelectedText(): string {
    const editor = vscode.window.activeTextEditor;
    let highlighted = "";

    if (editor) {
      const selection = editor.selection;
      if (selection && !selection.isEmpty) {
        const selectionRange = new vscode.Range(
          selection.start.line,
          selection.start.character,
          selection.end.line,
          selection.end.character
        );
        highlighted = editor.document.getText(selectionRange);
      }
    }
    return highlighted;
  }
}
