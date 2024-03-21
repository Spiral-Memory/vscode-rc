import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  Button,
  vsCodeTextField,
  TextField,
} from "@vscode/webview-ui-toolkit";

provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeTextField());

const vscode = acquireVsCodeApi();

window.addEventListener("load", main);

function main() {
  const loginBtn = document.getElementById("login-btn") as Button;
  loginBtn?.addEventListener("click", handleLogin);

  const sendBtn = document.getElementById("send-btn") as Button;
  sendBtn?.addEventListener("click", () => {
    handleSendMessage();
  });

  window.addEventListener("message", (event) => {
    const vscodeMessage = event.data;
    if (vscodeMessage.messages) {
      renderMessage(vscodeMessage.messages);
    }

    if (vscodeMessage.realTimeMsg) {
      renderMsgRealtime(vscodeMessage.realTimeMsg);
    }
  });
}

async function handleSendMessage() {
  const msgInputBox = document.getElementById("msg-input") as TextField;
  const msgValue = msgInputBox.value;

  vscode.postMessage({
    method: "sendMessage",
    data: msgValue,
  });

  msgInputBox.value = "";
}

async function handleLogin() {
  let username = (document.getElementById("username") as TextField)?.value;
  let password = (document.getElementById("password") as TextField)?.value;
  const credentials = {
    user: username,
    password: password,
  };

  vscode.postMessage({
    method: "login",
    data: credentials,
  });
}

async function renderMessage(messages: any) {
  document.getElementById("login-page")!.style.display = "none";
  document.getElementById("chat-container")!.style.display = "flex";
  const messageViewBox = document.getElementById("message-view-box");
  messageViewBox!.innerHTML = "";
  messages.forEach((message: any) => {
    const newMsgTemplate = `
      <div class="message-body">
        <div class="username"><b>@${message.u?.username}</b></div>
        <div class="message-content">${message.msg}</div>
      </div>`;

    if (messageViewBox) {
      messageViewBox.innerHTML += newMsgTemplate;
    }
  });
}

async function renderMsgRealtime(message:any) {
  const messageViewBox = document.getElementById("message-view-box");
  const newMsgTemplate = `
  <div class="message-body">
    <div class="username"><b>@${message.u?.username}</b></div>
    <div class="message-content">${message.msg}</div>
  </div>`;
  if (messageViewBox) {
    messageViewBox.innerHTML += newMsgTemplate;
  }
}
