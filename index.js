require("dotenv").config();
const path = require("path");
const fs = require("fs");
const {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
} = require("discord.js");

// Load env vars
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

// Debug check
console.log("🧪 TOKEN CHECK:", token ? token.slice(0, 15) + "..." : "undefined");
console.log("🆔 CLIENT_ID:", clientId);
console.log("🆔 GUILD_ID:", guildId);

// Load affirmations
const affirmations = JSON.parse(
  fs.readFileSync(path.join(__dirname, "affirmations.json"), "utf8")
);

// Slash command setup
const commands = [
  new SlashCommandBuilder()
    .setName("affirm")
    .setDescription("Receive a sweet, sassy affirmation 🩷")
    .addStringOption((option) =>
      option
        .setName("mood")
        .setDescription("What's your current mood, baby?")
        .setRequired(true)
        .addChoices(
          { name: "sad", value: "sad" },
          { name: "angry", value: "angry" },
          { name: "happy", value: "happy" },
          { name: "anxious", value: "anxious" },
          { name: "tired", value: "tired" },
          { name: "bored", value: "bored" }
        )
    ),
].map((cmd) => cmd.toJSON());

// Deploy slash command
const rest = new REST({ version: "10" }).setToken(token);

(async () => {
  try {
    console.log("🚀 Deploying commands...");
    await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });
    console.log("✅ Commands deployed.");
  } catch (err) {
    console.error("❌ Failed to deploy commands:", err);
  }
})();

// Start Discord client
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on("ready", () => {
  console.log(`💘 Logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "affirm") {
    const mood = interaction.options.getString("mood");
    const moodList = affirmations[mood];

    if (!moodList) {
      await interaction.reply({
        content: `😩 Oops! I don't have affirmations for *${mood}*. Try a different mood, baby.`,
        ephemeral: true,
      });
      return;
    }

    const affirm =
      moodList[Math.floor(Math.random() * moodList.length)];
    await interaction.reply(`💖 *Mood: ${mood}*\n${affirm}`);
  }
});

client.login(token);
