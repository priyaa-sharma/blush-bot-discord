require("dotenv").config();
const { Client, GatewayIntentBits, SlashCommandBuilder, REST, Routes } = require("discord.js");
const fs = require("fs");

const token = process.env.DISCORD_TOKEN;
const clientId = "your_client_id_here";
const guildId = "your_test_server_id_here"; // For dev/test only

const affirmations = JSON.parse(fs.readFileSync("affirmations.json", "utf8"));

const commands = [
  new SlashCommandBuilder()
    .setName("affirm")
    .setDescription("Receive a sweet, sassy affirmation 🩷")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("Deploying commands...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
    console.log("Done! Commands deployed.");
  } catch (e) {
    console.error(e);
  }
})();

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag} 😈`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName === "affirm") {
    const affirm = affirmations[Math.floor(Math.random() * affirmations.length)];
    await interaction.reply(`💖 ${affirm}`);
  }
});

client.login(token);
