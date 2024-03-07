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
  sendBtn?.addEventListener("click", handleSendMessage);
}

let authToken = "";
let userID = "";

async function handleSendMessage() {
  let message = (document.getElementById("msg-input") as TextField)?.value;
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Auth-Token": authToken,
      "X-User-Id": userID,
    },
    body: JSON.stringify({
      message: {
        rid: "GENERAL",
        msg: message,
      },
    }),
  };

  if (message !== "") {
    fetch("http://localhost:3000/api/v1/chat.sendMessage", requestOptions)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        (document.getElementById("msg-input") as TextField)!.value = '';
      })
      .catch((error) => console.error("Error:", error));
  }
}
async function handleLogin() {
  let username = (document.getElementById("username") as TextField)?.value;
  let password = (document.getElementById("password") as TextField)?.value;
  const credentials = {
    user: username,
    password: password,
  };

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  })
    .then(async (response) => {
      return await response.json();
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });

  console.log(res);

  if (res?.status === "success") {
    authToken = res.data.authToken;
    userID = res.data.userId;
    setInterval(() => listenMessage(), 2000);
    vscode.postMessage({
      status: "success",
      message: "Login Successful",
    });
  } else {
    vscode.postMessage({
      status: "error",
      message: res.message,
    });
  }
}

async function listenMessage() {
  const res = await fetch(
    "http://localhost:3000/api/v1/channels.messages?roomId=GENERAL",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": `${authToken}`,
        "X-User-Id": `${userID}`,
      },
    }
  )
    .then(async (response) => {
      return await response.json();
    })
    .catch((error) => console.error("Error:", error));

  document.getElementById("login-page")!.style.display = "none";
  document.getElementById("chat-container")!.style.display = "flex";
  const messageViewBox = document.getElementById("message-view-box");
  messageViewBox!.innerHTML = "";
  const messages = res.messages;
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
