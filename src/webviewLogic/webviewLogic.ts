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
