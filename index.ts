import Discord, { Channel, Message, TextChannel } from "discord.js";
import low from "lowdb";
import FileSync from "lowdb/adapters/FileSync";
import schedule from "node-schedule";
// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();
import fs from "fs";

if (!fs.existsSync("db")) {
    fs.mkdirSync("db");
}

interface Ping {
    messageId: string;
    channelId: string;
    timeToReply: string;
}

const adapter = new FileSync<{ pings: Ping[] }>("./db/pings.json");
const pingsDb = low(adapter);

pingsDb.defaults({}).write();

const client = new Discord.Client();

// const newTime = new Date();
// console.log(newTime.toJSON());
// newTime.setSeconds(newTime.getSeconds() + 30);

schedule.scheduleJob("*/5 * * * * *", () => {

    pingsDb.get("pings").forEach(async (ping: Ping) => {
        if (new Date(ping.timeToReply) < new Date()) {
            const channel: Channel = client.channels.cache.get(ping.channelId);
            if (channel.type != "text") return;

            const message: Message = await (channel as TextChannel).messages.fetch(ping.messageId);
            if (!message) return;

            await (channel as TextChannel).send(`<a:peepoclap:752066314092281856> <@214748527669018625>: Reverse Clumsy ping from <${message.reference}>`);
        }
    });
});

client.on("ready", () => {
    console.log(`Bot online: ${client.user.tag}`);
});

// Create an event listener for messages
client.on("message", (message: Message) => {
    if (!(message.channel.type == "text" && message.author.id == "214748527669018625")) return;

    const randomTime: Date = new Date();
    randomTime.setMinutes(randomTime.getMinutes() + Math.random() * 60 * 24 * 7);

    const ping: Ping = {
        messageId: message.id,
        channelId: message.channel.id,
        timeToReply: randomTime.toJSON()
    };

    pingsDb.get("pings").push(ping).write();
});

client.login(process.env.TOKEN);
