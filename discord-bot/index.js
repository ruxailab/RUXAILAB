import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
dotenv.config();

const app = express();
app.use(express.json());


const roleMap = {
  'first-timer': '1359057792572592251',
  'contributor': '1358872922617544904',
  'maintainer-in-training': '1359057877616037998',
  'champion': '1359057840148447327',
  'core-maintainer': '1359058025284898960',
}

const userMap = {
  armanmoztar: '324351166270144516', // Github username to Discord ID mapping
}

const dbPath = './data.json';
const userData = JSON.parse(fs.readFileSync(dbPath));

app.post('/promote', async (req, res) => {
  const username = req.body.username;
  const discordId = userMap[username];
  if (!discordId) return res.status(404).send('User not found');

  userData[username] = (userData[username] || 0) + 1;
  fs.writeFileSync(dbPath, JSON.stringify(userData, null, 2));

  const prCount = userData[username];
  let roleToAssign;

  if (prCount >= 10) roleToAssign = roleMap['core-maintainer'];
  else if (prCount >= 7) roleToAssign = roleMap['champion'];
  else if (prCount >= 4) roleToAssign = roleMap['maintainer-in-training'];
  else if (prCount >= 2) roleToAssign = roleMap['contributor'];
  else roleToAssign = roleMap['first-timer'];

  const url = `https://discord.com/api/guilds/${process.env.GUILD_ID}/members/${discordId}/roles/${roleToAssign}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bot ${process.env.BOT_TOKEN}`,
    },
  });

  // Notify Discord
  const webhookRes = await fetch(process.env.DISCORD_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json'},
    body: JSON.stringify({
      content: `🎉 ${username} has successfully been promoted. Total merged PRs: ${prCount}`,
    }),
  });

  if (!response.ok) {
    console.error(`⚠️ Failed to assign role. Discord returned ${response.status}`);
    return res.status(500).send("Failed to assign role.");
  }

  if (!webhookRes.ok) {
    console.error(`⚠️ Webhook failed: ${webhookRes.status}`);
    return res.status(500).send("Role assigned, but webhook failed.");
  }

  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, '{}');
  }
  const userData = JSON.parse(fs.readFileSync(dbPath));

  res.send('Role assigned + notified!');
});

app.listen(3000, () => console.log('Server running'));