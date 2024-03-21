import * as vscode from "vscode";
import { RocketChatApi } from "../api/api";
import { AuthData } from "../authData/authData";

const host = "http://localhost:3000";
const apiClient = new RocketChatApi(host);

let selectedText: string | undefined;
let commentId = 1;
let mappings = new Map();

class NoteComment implements vscode.Comment {
  savedBody: string | vscode.MarkdownString;
  id: number;

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

  public async startDiscussion(reply: vscode.CommentReply) {
    const thread = reply.thread;

    const sentResponse = await apiClient.handleSendMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      selectedText
        ? "```\n" + selectedText.replace(/`/g, "\\`") + "\n```"
        : "No code selected"
    );

    const threadId = sentResponse.message._id;
    const range: any = thread.range;
    const rangeString = `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
    mappings.set(rangeString, threadId);
    const res = await apiClient.handleSendMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      reply.text,
      threadId
    );

    console.log(res);

    const newComment = new NoteComment(
      reply.text,
      vscode.CommentMode.Preview,
      {
        name: `@${res.message.u?.username}`,
        iconPath: vscode.Uri.parse(
          `https://open.rocket.chat/avatar/${res.message.u?.username}`
        ),
      },
      thread,
      thread.comments.length ? "canDelete" : undefined
    );

    thread.comments = [...thread.comments, newComment];
  }

  public async replyNote(reply: vscode.CommentReply) {
    const thread = reply.thread;
    const range: any = thread.range;
    const rangeString = `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
    const threadId = mappings.get(rangeString);

    const res = await apiClient.handleSendMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      reply.text,
      threadId
    );

    const newComment = new NoteComment(
      reply.text,
      vscode.CommentMode.Preview,
      {
        name: `@${res.message.u?.username}`,
        iconPath: vscode.Uri.parse(
          `https://open.rocket.chat/avatar/${res.message.u?.username}`
        ),
      },
      thread,
      thread.comments.length ? "canDelete" : undefined
    );

    thread.comments = [...thread.comments, newComment];
  }

  public async refreshMsg(thread: vscode.CommentThread) {
    const range: any = thread.range;
    const rangeString = `${range.start.line}-${range.start.character}-${range.end.line}-${range.end.character}`;
    const threadId = mappings.get(rangeString);
    const res = await apiClient.getThreadMessage(
      AuthData.getAuthToken(),
      AuthData.getUserId(),
      threadId
    );

    console.log(res);
    thread.comments = [];
    res.messages?.forEach((message: any) => {
      const newComment = new NoteComment(
        message.msg,
        vscode.CommentMode.Preview,
        {
          name: `@${message.u?.username}`,
          iconPath: vscode.Uri.parse(
            `https://open.rocket.chat/avatar/${message.u?.username}`
          ),
        },
        thread,
        thread.comments.length ? "canDelete" : undefined
      );

      thread.comments = [...thread.comments, newComment];
    });
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
