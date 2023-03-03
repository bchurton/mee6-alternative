const { Client, Intents, Collection, WebhookClient } = require("discord.js");
const fs = require('fs');
const { MongoClient } = require("mongodb");
require('dotenv').config();
const LevelHandler = require("./utils/LevelHandler")

const intents = new Intents();
intents.add(
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILD_PRESENCES
);

const client = new Client({
    intents: intents, partials: ["MESSAGE", "REACTION", "CHANNEL"],
    allowedMentions: { parse: ["users"] }
});

client.commands = new Collection();
require("./utils/emojis").init(client)
client.levelHandler = new LevelHandler(client, {
    mongo: {
        uri: process.env.MONGO_URI,
        db: process.env.MONGO_DB,
        collection: process.env.MONGO_COLLECTION
    },
    redis: {
        uri: process.env.REDIS_URI
    }
});

client.on("ready", async () => {
    console.log(`Ready! ${new Date(Date.now())}`)
    if (process.env.STATUS) client.user.setActivity(process.env.STATUS, { type: "PLAYING" })
});

console.log("LOADING COMMANDS...")
for (file of fs.readdirSync("./commands").filter(f => f.endsWith(".js"))) {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.name, cmd)
    console.log(`Loaded ${cmd.name}`)
}

console.log("\n\nLOADING EVENTS...")
for (file of fs.readdirSync("./events").filter(f => f.endsWith(".js"))) {
    const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(client, ...args))
    console.log(`Loaded ${event.name}`)
}

process.on('unhandledRejection', async error => {
    console.error(error)
});

client.login(process.env.TOKEN)