require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");
const axios = require("axios");
const { participant: participantModel } = require("./models");
const { sequelize } = require("./models");

const app = express();
app.use(express.json());

// Initialize Discord Bot
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

discordClient.once("ready", () => {
  console.log(`✅ Discord Bot Logged in as ${discordClient.user.tag}`);
});

discordClient.login(process.env.DISCORD_BOT_TOKEN);

// Webhook Endpoint to receive Zoom events
app.post("/webhook", async (req, res) => {
  console.log("🔍 Received webhook request:", req.body);

  // Handle Zoom URL validation
  if (
    req.body.event === "endpoint.url_validation" &&
    req.body.payload?.plainToken
  ) {
    console.log("✅ Validation request received. Responding with plainToken.");
    return res.json({ plainToken: req.body.payload.plainToken });
  }

  // Handle actual Zoom webhook events
  if (!req.body.payload || !req.body.payload.object) {
    console.error("❌ Error: Missing payload or object in request.");
    return res.sendStatus(400);
  }

  const { event, payload } = req.body;
  const meetingId = payload.object.id;
  const meetingTopic = payload.object.topic || "Unknown Topic";
  const participant = payload.object.participant;
  const channelId = process.env.DISCORD_CHANNEL_ID;

  if (!participant) return res.sendStatus(400);

  let message = "";

  if (event === "meeting.started") {
    message = `🟢 **Meeting Started:** "${meetingTopic}" (ID: ${meetingId})`;
  } else if (event === "meeting.ended") {
    message = `🔴 **Meeting Ended:** "${meetingTopic}" (ID: ${meetingId})`;
  } else if (event === "meeting.participant_joined") {
    message = `✅ **${participant.user_name}** joined meeting "${meetingTopic}" (ID: ${meetingId})`;
    await participantModel.create({
      meetingId,
      userId: participant.user_id,
      username: participant.user_name,
      email: participant.email,
      join_time: participant.join_time,
      leave_time: "N/A",
    });
  } else if (event === "meeting.participant_left") {
    message = `❌ **${participant.user_name}** left meeting "${meetingTopic}" (ID: ${meetingId})`;
    const user = await participantModel.findOne({
      where: { meetingId, userId: participant.user_id },
    });
    if (user) {
      user.leave_time = participant.leave_time;
      await user.save();
    }
  }

  if (message) {
    const channel = discordClient.channels.cache.get(channelId);
    if (channel) {
      channel.send(message);
    } else {
      console.error("⚠️ Discord channel not found!");
    }
  }

  res.status(200).send();
});

// Endpoint to fetch participants of a Zoom meeting
app.get("/participants/:meetingId", async (req, res) => {
  const { meetingId } = req.params;
  const participants = await participantModel.findAll({ where: { meetingId } });
  res.json({ participants });
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected");
  })
  .catch((error) => {
    console.error("Unable to connect to database", error);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`🚀 Webhook server running on port ${PORT}`)
);
