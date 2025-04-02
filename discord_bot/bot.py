# Importing libraries and modules
import os # Allows interaction with the operating system
import discord # Provides methods to interact with the Discord API
from discord.ext import commands # Extends discord.py and allows creation and handling of commands
from discord import app_commands # Allows parameters to be used for slash-commands
from dotenv import load_dotenv # Allows the use of environment variables (this is what we'll use to manage our
                               # tokens and keys)
 
import json  
# Environment variables for tokens and other sensitive data
load_dotenv() # Loads and reads the .env file 
TOKEN = os.getenv("DISCORD_BOT_TOKEN") # Reads and stores the Discord Token from the .env file

# Setup of intents. Intents are permissions the bot has on the server
intents = discord.Intents.default() # Intents can be set through this object
intents.message_content = True  # This intent allows you to read and handle messages from users
intents.members = True
# Bot setup
bot = commands.Bot(command_prefix="!", intents=intents) # Creates a bot and uses the intents created earlier


@bot.event
async def on_message(msg):
    if msg.author.id != bot.user.id:
        await msg.channel.send(f"Interesting message, {msg.author.mention}")

@bot.tree.command(name="greet", description="Sends a greeting to the user")
async def greet(interaction: discord.Interaction):
    username = interaction.user.mention
    await interaction.response.send_message(f"Hello there, {username}")

PR_THRESHOLDS = {
    "⚪ Member (General)": 0,
    "🟣 Entry": 1,
    "🔵 Intermediate": 4,
    "🔵 Proficient": 7,
    "🟢 Advanced": 10,
    "🟡 Expert": 20,
    "🟠 Master": 40,
    "🔴 Grandmaster": 60
}

ISSUE_THRESHOLDS = {
    "📝 Bug Reporter": 1,
    "🔍 Debugger": 3,
    "🕵️‍♂️ Investigator": 7
}

COMMIT_THRESHOLDS = {
    "🔧 Committer": 10,
    "🚀 Commit Machine": 30
}

def determine_role(pr_count, issues_count, commits_count):
    # Determine PR role
    pr_role = "⚪ Member (General)"
    for role, threshold in PR_THRESHOLDS.items():
        if pr_count >= threshold:
            pr_role = role

    # Determine issue role
    issue_role = None
    for role, threshold in ISSUE_THRESHOLDS.items():
        if issues_count >= threshold:
            issue_role = role

    # Determine commit role
    commit_role = None
    for role, threshold in COMMIT_THRESHOLDS.items():
        if commits_count >= threshold:
            commit_role = role

    # Return the highest role in each category
    return pr_role, issue_role, commit_role

contributions = {}
user_mappings = {}

def load_data():
    global contributions, user_mappings
    try:
        with open("contributions.json", "r") as f:
            contributions = json.load(f)
        print("Successfully loaded contributions.json")
    except Exception as e:
        print(f"Error loading contributions.json: {e}")  

    # Load or create user mappings
    try:
        with open("user_mappings.json", "r") as f:
            user_mappings = json.load(f)
        print("Successfully loaded user mappings")
    except FileNotFoundError:
        print("No user mappings found, creating new mapping file")
        user_mappings = {}
        with open("user_mappings.json", "w") as f:
            json.dump(user_mappings, f)
    except Exception as e:
        print(f"Error loading user mappings: {e}") 

load_data()

@bot.tree.command(name="link", description="Links your Discord account to your GitHub username")
async def link(interaction: discord.Interaction, github_username: str):
    """Link your Discord account to your GitHub username."""
    try:
        # Check if the GitHub username exists in contributions
        if github_username not in contributions:
            await interaction.response.send_message(
                f"No contribution data found for GitHub user '{github_username}'. Are you sure that's your GitHub username?", 
                ephemeral=True
            )
            return

        # Save the mapping
        user_mappings[str(interaction.user.id)] = github_username
        with open("user_mappings.json", "w") as f:
            json.dump(user_mappings, f)

        await interaction.response.send_message(
            f"Successfully linked your Discord account to GitHub user '{github_username}'!", 
            ephemeral=True
        )
        print(f"Linked Discord user {interaction.user.name} to GitHub user {github_username}")

    except Exception as e:
        print(f"Error linking user: {e}") 
        await interaction.response.send_message("An error occurred while linking your account.", ephemeral=True)

@bot.tree.command(name="unlink", description="Unlinks your Discord account from your GitHub username")
async def unlink(interaction: discord.Interaction):
    """Unlink your Discord account from your GitHub username."""
    try:
        user_id = str(interaction.user.id)

        if user_id in user_mappings:
            github_username = user_mappings.pop(user_id)
            with open("user_mappings.json", "w") as f:
                json.dump(user_mappings, f)

            await interaction.response.send_message(
                f"Successfully unlinked your Discord account from GitHub user '{github_username}'!", 
                ephemeral=True
            )
            print(f"Unlinked Discord user {interaction.user.name} from GitHub user {github_username}")

        else:
            await interaction.response.send_message(
                "Your Discord account is not linked to any GitHub username.", 
                ephemeral=True
            )

    except Exception as e:
        print(f"Error unlinking user: {e}") 
        await interaction.response.send_message("An error occurred while unlinking your account.", ephemeral=True)


@bot.tree.command(name="getstats", description="Displays your GitHub stats and current role")
async def getstats(interaction: discord.Interaction): 
    """Display user's GitHub stats and current role."""
    try:
        user_id = str(interaction.user.id)
        github_username = user_mappings.get(user_id)

        if not github_username:
            await interaction.response.send_message(
                "Your Discord account is not linked to a GitHub username. Use `/link your_github_username` to link it.",
                ephemeral=True
            )
            return
         
        user_data = contributions.get(github_username)
        
        print(user_data)  # Make sure you are getting the right data
        
        if not user_data:
            await interaction.response.send_message(
                f"AAANo contribution data found for GitHub user '{github_username}'.",
                ephemeral=True
            )
            return

        embed = discord.Embed(
            title=f"GitHub Stats for {github_username}",
            color=discord.Color.blue()
        )
        embed.add_field(name="Merged PRs", value=str(user_data["pr_count"]), inline=True)
        embed.add_field(name="Issues Opened", value=str(user_data["issues_count"]), inline=True)
        embed.add_field(name="Commits (30 days)", value=str(user_data["commits_count"]), inline=True)

        # Get user's current role based on contribution thresholds
    
        # Add role information to the embed
        embed.add_field(name="Current Role", value=current_role, inline=False)

        await interaction.response.send_message(embed=embed)

    except Exception as e:
        await interaction.response.send_message(
            f"An error occurred: {str(e)}",
            ephemeral=True
        )

async def update_roles_for_guild(guild: discord.Guild):
    # Get all the roles and create missing ones, similar to your current logic
    roles = {role.name: role for role in guild.roles}
    for role_name in PR_THRESHOLDS.keys() | ISSUE_THRESHOLDS.keys() | COMMIT_THRESHOLDS.keys():
        if role_name not in roles:
            try:
                print(f"Creating role: {role_name}")
                roles[role_name] = await guild.create_role(name=role_name)
            except discord.Forbidden:
                print(f"Insufficient permissions to create role: {role_name}")
                continue
            except Exception as e:
                print(f"Error creating role {role_name}: {e}")
                continue

    # Update roles for each member (you might want to adjust the logic as needed)
    updated_count = 0
    for member in guild.members:
        github_username = user_mappings.get(str(member.id))
        if not github_username:
            continue
        user_data = contributions.get(github_username)
        if not user_data:
            continue
        pr_count = user_data["pr_count"]
        issues_count = user_data["issues_count"]
        commits_count = user_data["commits_count"]

        pr_role, issue_role, commit_role = determine_role(pr_count, issues_count, commits_count)
        new_role_names = [pr_role, issue_role, commit_role]
        current_roles = {role.name for role in member.roles}

        # Remove old roles if necessary
        for role_name in (PR_THRESHOLDS.keys() | ISSUE_THRESHOLDS.keys() | COMMIT_THRESHOLDS.keys()):
            if role_name in current_roles:
                try:
                    await member.remove_roles(roles[role_name])
                    print(f"Removed role {role_name} from {member.name}")
                except Exception as e:
                    print(f"Error removing role {role_name} from {member.name}: {e}")

        # Add new roles
        for role_name in new_role_names:
            if role_name and role_name not in current_roles:
                try:
                    await member.add_roles(roles[role_name])
                    print(f"Added role {role_name} to {member.name}")
                except Exception as e:
                    print(f"Error adding role {role_name} to {member.name}: {e}")

        updated_count += 1

    print(f"Role update completed for {updated_count} members in guild {guild.name}")


@bot.event
async def on_ready():
    print(f"{bot.user} is online!")

    load_data()
    # Use a flag to ensure this update runs only once per startup
    if not hasattr(bot, 'roles_updated'):
        bot.roles_updated = True
        # Iterate through all guilds (or target specific guilds if needed)
        for guild in bot.guilds:
            await update_roles_for_guild(guild)
    await bot.close()

bot.run(TOKEN)    