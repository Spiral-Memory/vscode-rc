const DDP = require("ddp");
const login = require("ddp-login");

export async function listenToRoom(channelName: string, authToken: string) {
  process.env.METEOR_TOKEN = authToken;
  console.log("Hello");
  let ddpClient = new DDP({
    host: "localhost",
    port: "3000",
    maintainCollections: true,
  });
 
  ddpClient.connect(function (err: any) {
    if (err) {
      throw err;
    }

    login(
      ddpClient,
      {
        env: "METEOR_TOKEN",
        method: "token",
        retry: 5,
      },

      function (error: any, userInfo: any) {
        if (error) {
          console.log(error);
        } else {
          ddpClient.subscribe(
            "stream-room-messages",
            [channelName, false],
            function () {
              console.log(ddpClient.collections);
              ddpClient.on("message", function (msg: any) {
                console.log("Subscription Msg: " + msg);
              });
            }
          );
        }
      }
    );
  });
}

