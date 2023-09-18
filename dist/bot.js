"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
require("dotenv/config");
const epic_free_games_1 = require("epic-free-games");
const telegraf_1 = require("telegraf");
const data_1 = __importDefault(require("./data"));
const bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
const epicFreeGames = new epic_free_games_1.EpicFreeGames({
    country: "US",
    locale: "en-US",
    includeAll: true,
});
// Start message
const sendFreeGames = (chatId) => {
    epicFreeGames
        .getGames()
        .then(async (res) => {
        let gameTitles = "Сьогодні безкоштовно:\n";
        let gameThumbnails = [];
        for (let i = 0; i < res.currentGames.length; i++) {
            const game = res.currentGames[i];
            gameTitles += `\n<a href="https://store.epicgames.com/en-US/p/${game.productSlug}">${game.title}</a>`;
            gameThumbnails.push({ type: "photo", media: game.keyImages[0].url });
        }
        gameThumbnails[0].caption = gameTitles;
        gameThumbnails[0].parse_mode = "HTML";
        await bot.telegram.sendMediaGroup(chatId, gameThumbnails);
        gameTitles = "Незбаром буде безкоштовно:\n";
        gameThumbnails = [];
        for (let i = 0; i < res.nextGames.length; i++) {
            const game = res.nextGames[i];
            gameTitles += `\n<a href="https://store.epicgames.com/en-US/p/${game.productSlug}">${game.title}</a>`;
            gameThumbnails.push({ type: "photo", media: game.keyImages[0].url });
        }
        gameThumbnails[0].caption = gameTitles;
        gameThumbnails[0].parse_mode = "HTML";
        await bot.telegram.sendMediaGroup(chatId, gameThumbnails);
    })
        .catch((err) => {
        console.log(`epicFreeGames - error \n${err}`);
    });
};
bot.start((ctx) => ctx.reply("Слава Україні!"));
bot.on(["message", "edited_message"], (ctx) => {
    if (ctx.message?.hasOwnProperty("text")) {
        // @ts-ignore
        switch (ctx.message.text.toLowerCase()) {
            case "у що пограти":
                ctx.reply(`У ${data_1.default[Math.floor(Math.random() * data_1.default.length)]}`, { reply_to_message_id: ctx.message.message_id });
                break;
            case "🤡":
                ctx.reply(`${ctx.message.from.first_name}, сам ти клоун`, {
                    reply_to_message_id: ctx.message.message_id,
                });
                break;
            case "да":
                ctx.reply(`Пізда`, {
                    reply_to_message_id: ctx.message.message_id,
                });
                break;
            case "нет":
                ctx.reply(`Підора отвєт`, {
                    reply_to_message_id: ctx.message.message_id,
                });
                break;
            default:
                break;
        }
        // @ts-ignore
        ctx.message.text.toLowerCase().includes("халява") &&
            sendFreeGames(ctx.message.chat.id);
    }
});
bot.launch();
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildIntegrations,
        discord_js_1.GatewayIntentBits.GuildInvites,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildMessageTyping,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.GuildScheduledEvents,
        discord_js_1.GatewayIntentBits.GuildVoiceStates,
        discord_js_1.GatewayIntentBits.GuildWebhooks,
    ],
});
client.once("ready", () => {
    console.log("Dicord Ready!");
});
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand())
        return;
    const { commandName } = interaction;
    if (commandName === "ping") {
        await interaction.reply("Pong!");
    }
    else if (commandName === "server") {
        await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    }
    else if (commandName === "user") {
        await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
    }
    else if (commandName === "voice") {
        await interaction.reply(`Voice info: none`);
    }
});
var temp = {
    prevVoiceMembers: null,
    lastMessageId: null,
};
client.on("voiceStateUpdate", (oldState, newState) => {
    let UpdatedChannel = newState.channel ? newState.channel : oldState.channel;
    if (!(newState.channel && oldState.channel) &&
        UpdatedChannel &&
        UpdatedChannel.id == "834469105414569995") {
        const prevVoiceMembers = temp.prevVoiceMembers;
        const lastMessageId = temp.lastMessageId;
        let TextOutput = "Зараз у дискорді:\n\n";
        let addedUser = null;
        let removedUser = null;
        let MovedUser;
        if (prevVoiceMembers) {
            if (prevVoiceMembers.size > UpdatedChannel.members.size) {
                prevVoiceMembers.forEach((VoiceUser) => {
                    if (!UpdatedChannel.members.has(VoiceUser.user.id)) {
                        console.log(`${VoiceUser.nickname || VoiceUser.displayName} left`);
                        removedUser = `\n➖ ${VoiceUser.nickname || VoiceUser.displayName}`;
                        MovedUser = VoiceUser;
                    }
                });
            }
            else if (prevVoiceMembers.size < UpdatedChannel.members.size) {
                UpdatedChannel.members.forEach((VoiceUser, VoiceUserKey) => {
                    if (!prevVoiceMembers.some((prevVoiceUser) => prevVoiceUser.user.id == VoiceUserKey)) {
                        console.log(`${VoiceUser.nickname || VoiceUser.user.username} joined`);
                        addedUser = `➕ ${VoiceUser.nickname || VoiceUser.user.username}\n\n`;
                        MovedUser = VoiceUser;
                    }
                });
            }
            TextOutput += addedUser || "";
            UpdatedChannel.members.forEach((VoiceUser) => {
                if (VoiceUser.user.id != MovedUser.user.id) {
                    TextOutput += `${VoiceUser.nickname || VoiceUser.user.username}\n`;
                }
            });
            TextOutput += removedUser || "";
        }
        else {
            if (UpdatedChannel.members.size != 0) {
                UpdatedChannel.members.forEach((VoiceUser) => {
                    TextOutput += `${VoiceUser.nickname || VoiceUser.user.username}\n`;
                });
            }
        }
        // If all users left voice
        if (UpdatedChannel.members.size == 0) {
            TextOutput = "Дискорд спить 😴";
        }
        bot.telegram
            .sendMessage("-1001217699907", TextOutput, { parse_mode: "HTML" })
            .then(async function (msg) {
            if (lastMessageId) {
                try {
                    await bot.telegram.deleteMessage("-1001217699907", lastMessageId);
                }
                catch (error) {
                    console.log(`Error deleting message ${lastMessageId}`);
                }
            }
            temp.lastMessageId = msg.message_id;
        }, function (fail) {
            console.log(fail);
        })
            .then(function () {
            temp.prevVoiceMembers = UpdatedChannel.members;
        });
    }
});
client.login(process.env.DISCORD_TOKEN);
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//# sourceMappingURL=bot.js.map