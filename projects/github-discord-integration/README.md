# GitHub-Discord Integration Bot

A Discord bot that tracks and rewards GitHub contributions by integrating GitHub webhooks with Discord roles and notifications.

## 📋 Features

- **GitHub Activity Tracking**: Monitor commits, pull requests, reviews, and issues
- **Discord Integration**: Real-time notifications of GitHub events in your server
- **Role Management**: Automatically assign Discord roles based on GitHub contribution metrics
- **Statistics & Leaderboards**: View personal stats and compare contributions across team members
- **Weekly Summaries**: Regular activity reports for your project

## 🛠️ Technical Overview

This project combines a FastAPI web server for GitHub webhooks with a Discord.py bot for user interaction and notifications.

- **Backend**: Python with FastAPI, SQLAlchemy ORM, and SQLite
- **Bot Framework**: Discord.py with application commands
- **Data Storage**: Local SQLite database for user info and contribution metrics

## 🧩 Components

- **Discord Bot**: Handles commands, roles, and notifications
- **Webhook Receiver**: Processes GitHub event data
- **Database**: Stores user associations and contribution statistics
- **Role Manager**: Automates role assignments based on configurable criteria

## 🤖 Bot Commands

| Command          | Description                                          |
| ---------------- | ---------------------------------------------------- |
| `/link`        | Connect your Discord account to your GitHub username |
| `/verify`      | Confirm your GitHub account link (prototype mode)    |
| `/whois`       | Look up a Discord user's linked GitHub account       |
| `/stats`       | View your or another user's contribution statistics  |
| `/leaderboard` | Display top contributors with optional metric filter |

## ⚙️ Setup & Configuration

### Prerequisites

- Python 3.10+
- Discord Bot Token
- Discord Server with appropriate permissions
- GitHub webhook secret (can be generated)

### Environment Variables

Create a `.env` file in the project root with:

```
DISCORD_BOT_TOKEN=your_bot_token
GITHUB_WEBHOOK_SECRET=your_webhook_secret
DATABASE_URL=sqlite+aiosqlite:///./data/discord_github.db
DISCORD_GUILD_ID=your_server_id
NOTIFICATION_CHANNEL_ID=your_channel_
SUMMARY_CHANNEL_ID=your_channel_id
BOT_OWNER_ID=your_discord_id
```

Additional role IDs are configured in the `.env` file and mapped in `config/roles.yaml`.

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Configure the `.env` file with your credentials
4. Run the application:
   ```
   uvicorn app.main:app --reload
   ```

### GitHub Webhook Setup

1. Go to your GitHub repository > Settings > Webhooks > Add webhook
2. Set Payload URL to `https://your-server.com/webhook`
3. Set Content type to `application/json`
4. Set Secret to your `GITHUB_WEBHOOK_SECRET` value
5. Select events: Push, Pull requests, Pull request reviews, Issues

## 🎮 Role System

The bot automatically assigns roles based on contribution metrics:

| Role             | Requirements                                                           | Description                       |
| ---------------- | ---------------------------------------------------------------------- | --------------------------------- |
| New Ninja        | 3+ commits                                                             | Started their coding journey      |
| Bug Slayer       | 5+ closed issues                                                       | Expert at finding and fixing bugs |
| PR Flash         | 5+ merged PRs OR 3+ reviewed PRs                                       | Master of Pull Requests           |
| Arc              | 20+ commits OR 10+ merged PRs OR 5+ reviewed PRs                       | Shapes the project's architecture |
| Project Guardian | 50+ commits OR 15+ merged PRs OR 10+ reviewed PRs OR 20+ closed issues | Trusted project maintainer        |

Roles are fully customizable in the `config/roles.yaml` file.

## 📊 Database Schema

This project uses a simple relational database with two main tables:

- **Users**: Discord users with linked GitHub accounts
- **Contributions**: GitHub activity metrics per user and repository

## 🔄 Workflow

1. Users link their Discord and GitHub accounts using `/link`
2. Bot receives GitHub webhook events when users contribute
3. Contributions are tracked and stored in the database
4. Roles are automatically assigned based on contribution metrics
5. Weekly summaries are posted to the configured channel

## 📝 License

[MIT License](LICENSE)

## 🙏 Credits

Created by SURYA BODHI SATHWA (Discord UID: croco08)
