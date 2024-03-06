class RocketChatApi {
  private host: string;

  constructor(host: string) {
    this.host = host;
  }

  public async getMessage(
    authToken: string | null,
    userID: string | null
  ): Promise<any> {
    if (authToken && userID) {
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
  }

  public async getThreadMessage(
    authToken: string | null,
    userID: string | null,
    tmid: string | null
  ): Promise<any> {
    if (authToken && userID && tmid) {
      try {
        const res = await fetch(
          `${this.host}/api/v1/chat.getThreadMessages?tmid=${tmid}`,
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
    authToken: string | null,
    userID: string | null,
    message: any,
    tmid?: any
  ): Promise<any> {
    if (authToken && userID) {
      try {
        const requestBody: any = {
          message: {
            rid: "GENERAL",
            msg: message,
          },
        };
        if (tmid) {
          requestBody.message.tmid = tmid;
        }

        const res = await fetch(`${this.host}/api/v1/chat.sendMessage`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Auth-Token": authToken,
            "X-User-Id": userID,
          },
          body: JSON.stringify(requestBody),
        });

        return await res.json();
      } catch (error) {
        console.error("Send error:", error);
      }
    }
  }
}

export { RocketChatApi };
