// Heroku port setup

const http = require("http");
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {});

server.listen(PORT, () => {
  console.log(`Our app is running on port ${PORT}`);
});

// Telegram Bot

require("dotenv").config();

const { Telegraf, Telegram } = require("telegraf");

const tgBot = new Telegram(process.env.BOT_TOKEN);
const bot = new Telegraf(process.env.BOT_TOKEN);

// Libs import

const GamesToPlay = require("./data.js");
const epicFreeGames = require("epic-free-games");

const nconf = require("nconf");

// Start message

bot.start((ctx) =>
  ctx.reply(
    `Привет, ${ctx.message.from.first_name}!\nНадеюсь ты не будешь кидать ничего из хуёвых каналов.`
  )
); //ответ бота на команду /start

bot.on(["message", "channel_post"], (ctx) => {
  if (
    ctx.message.hasOwnProperty("forward_from_chat") &&
    (ctx.message.forward_from_chat.title.toLowerCase().includes("топор") ||
      ctx.message.forward_from_chat.title.toLowerCase().includes("кб"))
  ) {
    if (ctx.message.forward_from_chat.title.toLowerCase().includes("топор")) {
      ctx.reply(`@${ctx.message.from.username}, ты еблан из топора кидать ?`);
    } else {
      ctx.reply(`@${ctx.message.from.username}, ты еблан из кб кидать ?`);
    }

    tgBot.deleteMessage(ctx.message.chat.id, ctx.message.message_id);
  }

  if (ctx.message.hasOwnProperty("text")) {
    switch (ctx.message.text.toLowerCase()) {
      case "во что поиграть":
        ctx.reply(
          `В ${GamesToPlay[Math.floor(Math.random() * GamesToPlay.length)]}`,
          { reply_to_message_id: ctx.message.message_id }
        );
        break;
      case "🤡":
        ctx.reply(`${ctx.message.from.first_name}, сам ты клоун`, {
          reply_to_message_id: ctx.message.message_id,
        });
        break;
      case "да":
        ctx.reply(`Пизда`, { reply_to_message_id: ctx.message.message_id });
        break;
      case "нет":
        ctx.reply(`Пидора ответ`, {
          reply_to_message_id: ctx.message.message_id,
        });
        break;
      case "шлюхи аргумент":
        ctx.reply(`Аргумент не нужен, пидор обнаружен!`, {
          reply_to_message_id: ctx.message.message_id,
        });
        break;
      case "аргумент не вечен, пидор обеспечен":
        ctx.reply(`Пидор засекречен, твой анал не вечен)))))`, {
          reply_to_message_id: ctx.message.message_id,
        });
        break;
      case "пидор мафиозный, твой анал спидозный xd":
        ctx.reply(`Анал мой вечен, твой помечен)`, {
          reply_to_message_id: ctx.message.message_id,
        });
        break;
      default:
        break;
    }
  }

  if (
    ctx.message.hasOwnProperty("text") &&
    ctx.message.text.toLowerCase().includes("халява")
  ) {
    epicFreeGames
      .getGames("US", true)
      .then(async (res) => {
        // Бесплатные игры на сегодня

        let gameTitles = "Сегодня бесплатно:\n";
        let gameThumbnails = [];

        for (let i = 0; i < res.currentGames.length; i++) {
          const game = res.currentGames[i];

          gameTitles += `\n<a href="https://store.epicgames.com/ru/p/${game.catalogNs.mappings[0].pageSlug}">${game.title}</a>`;
          gameThumbnails.push({ type: "photo", media: game.keyImages[0].url });
        }

        gameThumbnails[0].caption = gameTitles;
        gameThumbnails[0].parse_mode = "HTML";

        await tgBot.sendMediaGroup(ctx.message.chat.id, gameThumbnails);

        // Будущие бесплатные игры

        gameTitles = "Скоро будет бесплатно:\n";
        gameThumbnails = [];

        for (let i = 0; i < res.nextGames.length; i++) {
          const game = res.nextGames[i];

          gameTitles += `\n<a href="https://store.epicgames.com/ru/p/${game.catalogNs.mappings[0].pageSlug}">${game.title}</a>`;
          gameThumbnails.push({ type: "photo", media: game.keyImages[0].url });
        }

        gameThumbnails[0].caption = gameTitles;
        gameThumbnails[0].parse_mode = "HTML";

        await tgBot.sendMediaGroup(ctx.message.chat.id, gameThumbnails);
      })
      .catch((err) => {
        console.log(`epicFreeGames - error \n${err}`);
      });
  }

  // Bulling

  // if (ctx.message.hasOwnProperty('from') && ( ctx.message.from.username == 'sanchezszs' || ctx.message.from.username == 'littheagent' ) ) {
  //     ctx.reply(`🤡`, { reply_to_message_id: ctx.message.message_id });
  // }

  // Назар id - 429928542
});

bot.launch();

const { Client, GatewayIntentBits } = require("discord.js");
const { log } = require("console");

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

client.on("voiceStateUpdate", (oldState, newState) => {
  let UpdatedChannel = newState.channel ? newState.channel : oldState.channel;

  if (
    !(newState.channel && oldState.channel) &&
    UpdatedChannel &&
    UpdatedChannel.name == "Основной"
  ) {
    nconf.use("file", { file: "./temp-vars.json" });
    nconf.load(function (err) {
      const prevVoiceMembers = nconf.get("prevVoiceMembers");
      const lastMessageId = nconf.get("lastMessageId");

      let UsersInChannel = "Сейчас в дискорде:\n\n";
      let MovedUser;

      // if (prevVoiceMembers) {
      //     if (prevVoiceMembers.size > UpdatedChannel.members.size) {
      //         prevVoiceMembers.forEach((VoiceUser, VoiceUserKey) => {
      //             if (!UpdatedChannel.members.has(VoiceUserKey)) {
      //                 console.log(`${VoiceUser.nickname ? VoiceUser.nickname : VoiceUser.user.username} left`);
      //                 MovedUser = VoiceUser;
      //             }
      //         });
      //     } else if (prevVoiceMembers.size < UpdatedChannel.members.size) {
      //         UpdatedChannel.members.forEach((VoiceUser, VoiceUserKey) => {
      //             if (!prevVoiceMembers.has(VoiceUserKey)) {
      //                 console.log(`${VoiceUser.nickname ? VoiceUser.nickname : VoiceUser.user.username} joined`);
      //                 MovedUser = VoiceUser;
      //             }
      //         });
      //     }
      // }

      if (prevVoiceMembers) {
        if (prevVoiceMembers.length > UpdatedChannel.members.size) {
          prevVoiceMembers.forEach((VoiceUser) => {
            if (!UpdatedChannel.members.has(VoiceUser.userId)) {
              console.log(
                `${
                  VoiceUser.nickname
                    ? VoiceUser.nickname
                    : VoiceUser.displayName
                } left`
              );
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
                `${
                  VoiceUser.nickname
                    ? VoiceUser.nickname
                    : VoiceUser.user.username
                } joined`
              );
              MovedUser = VoiceUser;
            }
          });
        }
      }

      UpdatedChannel.members.forEach((VoiceUser) => {
        if (
          prevVoiceMembers &&
          (VoiceUser == MovedUser || VoiceUser.user.id == MovedUser.userId) &&
          prevVoiceMembers.length < UpdatedChannel.members.size
        ) {
          UsersInChannel += `➕ ${
            VoiceUser.nickname ? VoiceUser.nickname : VoiceUser.user.username
          }\n`;
        } else {
          UsersInChannel += `${
            VoiceUser.nickname ? VoiceUser.nickname : VoiceUser.user.username
          }\n`;
        }
      });

      if (
        prevVoiceMembers &&
        prevVoiceMembers.length > UpdatedChannel.members.size
      ) {
        if (MovedUser.userId) {
          UsersInChannel += `\n➖ ${
            MovedUser.nickname ? MovedUser.nickname : MovedUser.displayName
          }`;
        } else {
          UsersInChannel += `\n➖ ${
            MovedUser.nickname ? MovedUser.nickname : MovedUser.user.username
          }`;
        }
      }

      // If all users left voice

      if (UpdatedChannel.members.size == 0) {
        UsersInChannel = "Все вышли из дискорда 😴";
      }

      bot.telegram
        .sendMessage("-1001217699907", UsersInChannel, { parse_mode: "HTML" })
        .then(
          function (msg) {
            if (lastMessageId) {
              bot.telegram.deleteMessage("-1001217699907", lastMessageId);
            }

            nconf.set("lastMessageId", msg.message_id);
          },
          function (fail) {
            console.log(fail);
          }
        )
        .then(function () {
          // bot.telegram.deleteMessage('425848093', lastMessageId);
          // bot.telegram.sendMessage('-1001217699907', UsersInChannel);

          nconf.set("prevVoiceMembers", UpdatedChannel.members);

          nconf.save(function (err) {
            if (err) {
              console.error(err.message);
              return;
            }
          });
        });

      if (err) {
        console.error(err.message);
        return;
      }
    });
  }
});

client.login(token);
