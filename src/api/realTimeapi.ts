import { Rocketchat } from "@rocket.chat/sdk";

class RocketChatRealtime {
  private client: Rocketchat;

  constructor(host: string) {
    this.client = new Rocketchat({
      protocol: "ddp",
      host: host,
      useSsl: !/http:\/\//.test(host),
      reopen: 20000,
    });
  }

  public async listenMessage(
    token: string | null,
    rid: string,
    callback: any
  ): Promise<void> {
    if (token) {
      try {
        await this.client.connect({});
        await this.client.resume({ token });
        await this.client.subscribeRoom(rid);
        this.client.onMessage((message) => {
          callback(message);
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

export { RocketChatRealtime };
