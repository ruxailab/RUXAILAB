import requests
from dotenv import load_dotenv
import os
import discord
import asyncio
import json
from discord.ext import commands, tasks

# Load environment variables
load_dotenv()
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")
GITHUB_OWNER = "ruxailab"
GITHUB_REPO = "RUXAILAB"
LINKS_FILE = "github_links.json" #File for Discord to Github links
DISCORD_SERVER = "Template Server"

def load_links():
    if os.path.exists(LINKS_FILE):
        with open(LINKS_FILE, "r") as f:
            return json.load(f)
    return {}

def save_links(data):
    with open(LINKS_FILE, "w") as f:
        json.dump(data, f, indent=4)

github_to_discord = load_links()

# GitHub API headers
headers = {
    "Accept": "application/vnd.github.v3+json"
}

# Fetch PRs from GitHub
def fetch_pull_requests():
    prs = []
    page = 1
    per_page = 100

    while True:
        url = f"https://api.github.com/repos/{GITHUB_OWNER}/{GITHUB_REPO}/pulls"
        params = {"state": "all", "page": page, "per_page": per_page}
        response = requests.get(url, headers=headers, params=params)

        if response.status_code != 200:
            print("Error:", response.status_code, response.text)
            break

        data = response.json()
        if not data:
            break

        prs.extend(data)
        page += 1

    return prs

def find_user_from_github(github_user):
    guild = discord.utils.get(bot.guilds, name=DISCORD_SERVER)  # your server name
    github_to_discord = load_links()

    tag = github_to_discord.get(github_user)  
    if not tag:
        return None

    if "#" in tag:
        name, discrim = tag.split("#")
        member = discord.utils.get(guild.members, name=name, discriminator=discrim)
    else:
        member = discord.utils.get(guild.members, name=tag)
    return member


# Create the    
intents = discord.Intents.default()
intents.message_content = True  # allow bot to see messages
intents.members = True  # allow bot to see members
bot = commands.Bot(command_prefix="!", intents=intents)

@bot.command(name="pullrequests")
async def pull_requests(ctx):
    prs = fetch_pull_requests()

    if not prs:
        await ctx.send("No pull requests found.")
        return

    msg = "**📦 Latest Pull Requests:**\n"
    for pr in prs[:5]:  # Display up to 5
        title = pr["title"]
        number = pr["number"]
        author = pr["user"]["login"]
        state = pr["state"]
        url = pr["html_url"]
        msg += f"[#{number}]({url}) - `{title}` by **{author}** ({state})\n"

    await ctx.send(msg)

@bot.command(name="leaderboard")
async def leaderboard(ctx):
    prs = fetch_pull_requests()

    # Filter only merged PRs
    merged_prs = [pr for pr in prs if pr["merged_at"] is not None]

    # Count merged PRs by author
    leaderboard = {}
    for pr in merged_prs:
        author = pr["user"]["login"]
        leaderboard[author] = leaderboard.get(author, 0) + 1

    if not leaderboard:
        await ctx.send("No merged pull requests found.")
        return

    # Sort by PR count, descending
    sorted_leaderboard = sorted(leaderboard.items(), key=lambda x: x[1], reverse=True)
    
    # Format the message
    msg = "**🏆 PR Leaderboard (Merged PRs):**\n"
    for i, (user, count) in enumerate(sorted_leaderboard[:10], start=1):
        member = find_user_from_github(user)
        if not member: 
            msg += f"{i}. **{user}** - {count} merged PR{'s' if count > 1 else ''}\n"
        else:
            msg += f"{i}. **{user}** - {count} merged PR{'s' if count > 1 else ''} - {member.top_role.name}\n"


    await ctx.send(msg)

@tasks.loop(minutes=1)  # Change frequency here (hours, minutes, seconds)
async def auto_update_roles():
    await bot.wait_until_ready()
    guild = discord.utils.get(bot.guilds, name=DISCORD_SERVER)  # your server name

    prs = fetch_pull_requests()
    merged_prs = [pr for pr in prs if pr["merged_at"] is not None]

    user_stats = {}
    for pr in merged_prs:
        author = pr["user"]["login"]
        user_stats[author] = user_stats.get(author, 0) + 1

    roles_by_threshold = [
        (21, "🏆🔥 Legendary"),
        (13, "🧠 Jedi"),
        (9, "🎖️ Master"),
        (6, "⚡ Skilled"),
        (4, "⚙️ Adept"),
        (2, "🐣 Apprentice"),
        (0, "🥚 Novice")
    ]

    github_to_discord = load_links()

    for github_user, pr_count in user_stats.items():
        if github_user not in github_to_discord:
            continue

        member = find_user_from_github(github_user)
        if not member:
            continue
        tag = github_to_discord.get(github_user)  # safer than direct access
        

        for threshold, role_name in roles_by_threshold:
            if pr_count >= threshold:
                role = discord.utils.get(guild.roles, name=role_name)
                if role:
                    # Remove any existing tier roles before assigning the new one
                    all_tier_roles = [r for _, r in roles_by_threshold]
                    member_roles_to_remove = [r for r in member.roles if r.name in all_tier_roles]

                    if member_roles_to_remove:
                        await member.remove_roles(*member_roles_to_remove)
                        print(f"🔁 Removed old roles from {tag}: {[r.name for r in member_roles_to_remove]}")

                    await member.add_roles(role)
                    print(f"✅ Assigned role '{role_name}' to {tag}")
                break

@bot.command(name="linkgithub")
async def linkgithub(ctx, github_username: str):
    discord_username = ctx.author.name
    github_to_discord[github_username] = discord_username
    save_links(github_to_discord)
    await ctx.send(f"🔗 Linked GitHub username `{github_username}` to Discord user `{discord_username}`.")

@bot.event
async def on_ready():
    print(f"✅ Logged in as {bot.user.name}")
    auto_update_roles.start()

# Run the bot
bot.run(DISCORD_BOT_TOKEN)
