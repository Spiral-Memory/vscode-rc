class RocketChatApi {
  private host: string;

  constructor(host: string) {
    this.host = host;
  }

  public async loadMessage(authToken: string, userID: string): Promise<any> {
    try {
      const res = await fetch(
        `${this.host}/api/v1/channels.messages?roomId=GENERAL`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": authToken,
            "X-User-Id": userID,
          },
        }
      );
      return await res.json();
    } catch (error) {
      console.error("Error:", error);
    }
  }

  public async handleLogin(credentials: any): Promise<any> {
    try {
      const res = await fetch(`${this.host}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  public async handleSendMessage(
    authToken: string,
    userID: string,
    message: any
  ): Promise<any> {
    try {
      const res = await fetch(`${this.host}/api/v1/chat.sendMessage`, {
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
      });

      return await res.json();
    } catch (error) {
      console.error("Send error:", error);
    }
  }
}

export { RocketChatApi };
