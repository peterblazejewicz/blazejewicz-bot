const botbuilder_azure = require("botbuilder-azure");
const builder = require("botbuilder");
const path = require("path");
const restify = require("restify");
const useEmulator = process.env.NODE_ENV == "development";

const connector = useEmulator
  ? new builder.ChatConnector()
  : new botbuilder_azure.BotServiceConnector({appId: process.env["MicrosoftAppId"], appPassword: process.env["MicrosoftAppPassword"]});

const bot = new builder.UniversalBot(connector);
bot.localePath(path.join(__dirname, "./locale"));

bot.dialog("/", session => {
  session.send("You said " + session.message.text);
});

if (useEmulator) {
  const server = restify.createServer();
  server.listen(3978, function () {
    console.log("test bot endpont at http://localhost:3978/api/messages");
  });
  server.post("/api/messages", connector.listen());
} else {
  exports.default = {
    default: connector.listen()
  };
}
