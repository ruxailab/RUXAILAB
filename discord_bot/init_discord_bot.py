# Importing libraries and modules
import os # Allows interaction with the operating system
import discord # Provides methods to interact with the Discord API
from discord.ext import commands # Extends discord.py and allows creation and handling of commands
from discord import app_commands # Allows parameters to be used for slash-commands
from dotenv import load_dotenv # Allows the use of environment variables (this is what we'll use to manage our
                               # tokens and keys)
from update_discord_roles import load_data, determine_role, PR_THRESHOLDS, ISSUE_THRESHOLDS, COMMIT_THRESHOLDS, update_roles_for_guild
import json  
# Environment variables for tokens and other sensitive data
load_dotenv() # Loads and reads the .env file 
TOKEN = os.getenv("DISCORD_BOT_TOKEN") # Reads and stores the Discord Token from the .env file

# Setup of intents. Intents are permissions the bot has on the server
intents = discord.Intents.default() # Intents can be set through this object
intents.message_content = True  # This intent allows you to read and handle messages from users

# Bot setup
bot = commands.Bot(command_prefix="!", intents=intents) # Creates a bot and uses the intents created earlier

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"{bot.user} is online!")

@bot.event
async def on_message(msg):
    if msg.author.id != bot.user.id:
        await msg.channel.send(f"Interesting message, {msg.author.mention}")

@bot.tree.command(name="greet", description="Sends a greeting to the user")
async def greet(interaction: discord.Interaction):
    username = interaction.user.mention
    await interaction.response.send_message(f"Hello there, {username}")

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

        # Load existing mappings
        try:
            with open("user_mappings.json", "r") as f:
                user_mappings = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            user_mappings = {}

        # Insert the new mapping
        user_mappings[str(interaction.user.id)] = github_username

        # Save the updated mappings
        with open("user_mappings.json", "w") as f:
            json.dump(user_mappings, f, indent=4)

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
    print("getstats")
    """Display user's GitHub stats and current role."""
    try:
        user_id = str(interaction.user.id)
        github_username = user_mappings.get(user_id)
        print(user_id)
        print(github_username)
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
                f"No contribution data found for GitHub user '{github_username}'.",
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
        current_role = next(
            (role.name for role in interaction.user.roles)
        )
        # Add role information to the embed
        embed.add_field(name="Current Role", value=current_role, inline=False)

        await interaction.response.send_message(embed=embed)

    except Exception as e:
        await interaction.response.send_message(
            f"An error occurred: {str(e)}",
            ephemeral=True
        )

bot.run(TOKEN)