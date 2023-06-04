// Heroku port setup

const http = require("http");
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {});

server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});

// Telegram Bot

require("dotenv").config();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.BOT_TOKEN);

// Libs import

const GamesToPlay = require("./data.js");
const epicFreeGames = require("epic-free-games");
const fs = require("fs");
fs.writeFileSync("./temp.json", "{}");

// Start message

bot.start((ctx) => ctx.reply("Слава Україні!"));

const sendFreeGames = (chatId) => {
  epicFreeGames
    .getGames("US", true)
    .then(async (res) => {
      // Бесплатные игры на сегодня

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

      // Будущие бесплатные игры

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

bot.on(["message", "edited_message"], (ctx) => {
  if (ctx.message?.hasOwnProperty("text")) {
    switch (ctx.message.text.toLowerCase()) {
      case "во що пограти":
        ctx.reply(
          `У ${GamesToPlay[Math.floor(Math.random() * GamesToPlay.length)]}`,
          { reply_to_message_id: ctx.message.message_id }
        );
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

    ctx.message.text.toLowerCase().includes("халява") &&
      sendFreeGames(ctx.message.chat.id);
  }

  // Bulling

  // if (ctx.message.hasOwnProperty('from') && ( ctx.message.from.username == 'sanchezszs' || ctx.message.from.username == 'littheagent' ) ) {
  //     ctx.reply(`🤡`, { reply_to_message_id: ctx.message.message_id });
  // }

  // Назар id - 429928542
});

bot.launch();

const { Client, GatewayIntentBits } = require("discord.js");

const token = process.env.DISCORD_TOKEN;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
  ],
});

client.once("ready", () => {
  console.log("Dicord Ready!");
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (commandName === "server") {
    await interaction.reply(
      `Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`
    );
  } else if (commandName === "user") {
    await interaction.reply(
      `Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`
    );
  } else if (commandName === "voice") {
    await interaction.reply(`Voice info: none`);
  }
});

let temp = {
  prevVoiceMembers: null,
  lastMessageId: null,
};

client.on("voiceStateUpdate", (oldState, newState) => {
  let UpdatedChannel = newState.channel ? newState.channel : oldState.channel;

  if (
    !(newState.channel && oldState.channel) &&
    UpdatedChannel &&
    UpdatedChannel.id == "834469105414569995"
  ) {
    const tempFile = JSON.parse(fs.readFileSync("./temp.json"));
    const prevVoiceMembers = tempFile?.prevVoiceMembers;
    const lastMessageId = tempFile?.lastMessageId;

    let TextOutput = "Зараз у дискорді:\n\n";
    let addedUser = null;
    let removedUser = null;
    let MovedUser;

    if (prevVoiceMembers) {
      if (prevVoiceMembers.length > UpdatedChannel.members.size) {
        prevVoiceMembers.forEach((VoiceUser) => {
          if (!UpdatedChannel.members.has(VoiceUser.userId)) {
            console.log(`${VoiceUser.nickname || VoiceUser.displayName} left`);

            removedUser = `\n➖ ${VoiceUser.nickname || VoiceUser.displayName}`;

            MovedUser = VoiceUser;
          }
        });
      } else if (prevVoiceMembers.length < UpdatedChannel.members.size) {
        UpdatedChannel.members.forEach((VoiceUser, VoiceUserKey) => {
          if (
            !prevVoiceMembers.some(
              (prevVoiceUser) => prevVoiceUser.userId == VoiceUserKey
            )
          ) {
            console.log(
              `${VoiceUser.nickname || VoiceUser.user.username} joined`
            );

            addedUser = `➕ ${
              VoiceUser.nickname || VoiceUser.user.username
            }\n\n`;

            MovedUser = VoiceUser;
          }
        });
      }

      TextOutput += addedUser || "";

      UpdatedChannel.members.forEach((VoiceUser) => {
        if (VoiceUser.id != MovedUser.id) {
          TextOutput += `${VoiceUser.nickname || VoiceUser.user.username}\n`;
        }
      });

      TextOutput += removedUser || "";
    } else {
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
      .then(
        function (msg) {
          if (lastMessageId) {
            try {
              bot.telegram.deleteMessage("-1001217699907", lastMessageId);
            } catch (error) {
              console.log(`Error deleting message ${lastMessageId}`);
            }
          }

          temp.lastMessageId = msg.message_id;
        },
        function (fail) {
          console.log(fail);
        }
      )
      .then(function () {
        temp.prevVoiceMembers = UpdatedChannel.members;

        fs.writeFileSync("./temp.json", JSON.stringify(temp, null, 2));
      });
  }
});

client.login(token);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
