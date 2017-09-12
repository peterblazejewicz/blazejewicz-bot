import botbuilder_azure from "botbuilder-azure";
import builder from "botbuilder";
import path from "path";

const useEmulator = process.env.NODE_ENV == "development";

const connector = useEmulator
  ? new builder.ChatConnector()
  : new botbuilder_azure.BotServiceConnector({appId: process.env["MicrosoftAppId"], appPassword: process.env["MicrosoftAppPassword"], stateEndpoint: process.env["BotStateEndpoint"], openIdMetadata: process.env["BotOpenIdMetadata"]});

const bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, "./locale"));

bot.dialog("/", session => {
  session.send("You said " + session.message.text);
});

if (useEmulator) {
  const restify = require("restify");
  const server = restify.createServer();
  server.listen(3978, function () {
    console.log("test bot endpont at http://localhost:3978/api/messages");
  });
  server.post("/api/messages", connector.listen());
} else {
  export default {
    default : connector.listen()
  };
}
