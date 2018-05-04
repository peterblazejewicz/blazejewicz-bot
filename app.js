// This loads the environment variables from the .env file
require('dotenv-extended').load();

const builder = require('botbuilder');
const restify = require('restify');

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
  console.log(`${server.name} listening to ${server.url}`);
});

// Create connector and listen for messages
const connector = new builder.ChatConnector({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});
server.post('/api/messages', connector.listen());

const instructions = `Welcome to the Bot to showcase the DirectLine API. Send 'Show me a hero card' or \
'Send me a BotFramework image' to see how the DirectLine client supports custom channel data. Any other \
message will be echoed.`;

// Bot Storage: Here we register the state storage for your bot.
// Default store: volatile in-memory store - Only for prototyping!
// We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
// For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
const inMemoryStorage = new builder.MemoryBotStorage();

const bot = new builder.UniversalBot(connector, session => {
  const reply = new builder.Message().address(session.message.address);

  const text = session.message.text.toLocaleLowerCase();

  console.log(
    `[${session.message.address.conversation.id}] Message received:  ${text}`
  );

  switch (text) {
    case 'show me a hero card':
      reply
        .text('Sample message with a HeroCard attachment')
        .addAttachment(
          new builder.HeroCard(session)
            .title('Sample Hero Card')
            .text('Displayed in the DirectLine client')
        );
      break;
    case 'send me a botframework image':
      reply.text('Sample message with an Image attachment').addAttachment({
        contentUrl:
          'https://docs.microsoft.com/en-us/bot-framework/media/how-it-works/architecture-resize.png',
        contentType: 'image/png',
        name: 'BotFrameworkOverview.png'
      });
      break;
    default:
      reply.text(`you said '${session.message.text}'`);
      break;
  }
  session.send(reply);
}).set('storage', inMemoryStorage); // Register in memory storage

bot.on('conversationUpdate', activity => {
  // when user joins conversation, send instructions
  if (activity.membersAdded) {
    activity.membersAdded.forEach(identity => {
      if (identity.id === activity.address.bot.id) {
        const reply = new builder.Message()
          .address(activity.address)
          .text(instructions);
        bot.send(reply);
      }
    });
  }
});
