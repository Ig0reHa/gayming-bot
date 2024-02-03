import { Client, Collection, GatewayIntentBits, GuildMember } from "discord.js";
import "dotenv/config";
import express from "express";
import { Telegraf } from "telegraf";
import GamesToPlay from "./data";

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.listen(PORT, () => {
  console.log("Server Listening on PORT:", PORT);
});

app.options("*", function (req, res) {
  res.send(200);
});

app.get("/", (err, res) => {
  res.status(200);
  res.json({ working: true });
  res.end();
});

app.post("/", (err, res) => {
  res.status(200);
  res.send("working");
  res.end();
});

app.put("/", (err, res) => {
  res.status(200);
  res.send("working");
  res.end();
});

const bot = new Telegraf(process.env.BOT_TOKEN);

// Start message
bot.start((ctx) => ctx.reply("Слава Україні!"));

bot.on(["message", "edited_message"], (ctx) => {
  if (ctx.message?.hasOwnProperty("text")) {
    // @ts-ignore
    switch (ctx.message.text.toLowerCase()) {
      case "у що пограти":
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
      // case "да":
      //   ctx.reply(`Пізда`, {
      //     reply_to_message_id: ctx.message.message_id,
      //   });
      //   break;
      // case "нет":
      //   ctx.reply(`Підора отвєт`, {
      //     reply_to_message_id: ctx.message.message_id,
      //   });
      //   break;
      default:
        break;
    }
  }
});

bot.launch();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildEmojisAndStickers,
  ],
});

client.once("ready", () => {
  console.log("Dicord Ready!");
});

var temp = {
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
    const prevVoiceMembers: Collection<string, GuildMember> | null =
      temp.prevVoiceMembers;
    const lastMessageId: number | null = temp.lastMessageId;

    let TextOutput: string = "Зараз у дискорді:\n\n";
    let addedUser: string = null;
    let removedUser: string = null;
    let MovedUser: GuildMember;

    if (prevVoiceMembers) {
      if (prevVoiceMembers.size > UpdatedChannel.members.size) {
        prevVoiceMembers.forEach((VoiceUser) => {
          if (!UpdatedChannel.members.has(VoiceUser.user.id)) {
            console.log(`${VoiceUser.nickname || VoiceUser.displayName} left`);

            removedUser = `\n➖ ${VoiceUser.nickname || VoiceUser.displayName}`;

            MovedUser = VoiceUser;
          }
        });
      } else if (prevVoiceMembers.size < UpdatedChannel.members.size) {
        UpdatedChannel.members.forEach((VoiceUser, VoiceUserKey) => {
          if (
            !prevVoiceMembers.some(
              (prevVoiceUser) => prevVoiceUser.user.id == VoiceUserKey
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
        if (VoiceUser.user.id != MovedUser.user.id) {
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
        async function (msg) {
          if (lastMessageId) {
            try {
              await bot.telegram.deleteMessage("-1001217699907", lastMessageId);
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
      });
  }
});

client.login(process.env.DISCORD_TOKEN);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
