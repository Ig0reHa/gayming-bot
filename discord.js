const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_BANS, Intents.FLAGS.GUILD_INTEGRATIONS, Intents.FLAGS.GUILD_INVITES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS, , Intents.FLAGS.GUILD_MESSAGE_TYPING, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_SCHEDULED_EVENTS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_WEBHOOKS] });

client.once('ready', () => {
	console.log('Dicord Ready!');
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    } else if (commandName === 'user') {
		await interaction.reply(`Your tag: ${interaction.user.tag}\nYour id: ${interaction.user.id}`);
	} else if (commandName === 'voice') {
		// await interaction.reply(`Voice info: ${(interaction.guild.channels)}`);
		await interaction.reply(`Voice info: none`);
		// console.log(JSON.stringify(interaction.guild.channels));
	}
});

client.on('voiceStateUpdate', (oldState, newState) => {
	let UpdatedChannel = newState.channel;

	if (UpdatedChannel.name == 'Основной') {
		UpdatedChannel.members.forEach((VoiceUser) => {
			console.log(VoiceUser.nickname);
		});
	}
});

client.login(token);