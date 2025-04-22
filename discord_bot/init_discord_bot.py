# init_discord_bot.py
import os
import discord
from discord.ext import commands
from discord import app_commands
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import json
import asyncio
import threading

from auth import get_github_username, wait_for_username, start_flask

# Load env vars
load_dotenv()
TOKEN = os.getenv("DISCORD_BOT_TOKEN")

# Firebase init
if not firebase_admin._apps:
    cred = credentials.Certificate("credentials.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()

intents = discord.Intents.default()
intents.message_content = True
bot = commands.Bot(command_prefix="!", intents=intents)

# Create a lock for the verification process
verification_lock = threading.Lock()

@bot.event
async def on_ready():
    await bot.tree.sync()
    print(f"{bot.user} is online!")

@bot.tree.command(name="link", description="Link your Discord to GitHub")
async def link(interaction: discord.Interaction):
    await interaction.response.defer(ephemeral=True)

    # Attempt to acquire the lock
    if not verification_lock.acquire(blocking=False):
        await interaction.followup.send("The verification process is currently busy. Please try again later.", ephemeral=True)
        return

    try:
        github_auth_url = await asyncio.get_event_loop().run_in_executor(None, get_github_username)
        await interaction.followup.send(f"Please complete GitHub auth: {github_auth_url}", ephemeral=True)

        # Wait for the Flask auth to complete and get the username
        github_username = await asyncio.get_event_loop().run_in_executor(None, wait_for_username)

        doc_ref = db.collection('discord').document(str(interaction.user.id))
        doc_ref.set({
            'github_id': github_username,
            'pr_count': 0,
            'issues_count': 0,
            'commits_count': 0,
            'role': 'member'
        })

        await interaction.followup.send(f"Successfully linked to GitHub user: `{github_username}`", ephemeral=True)

    except Exception as e:
        print("Error in /link:", e)
        await interaction.followup.send("Failed to link GitHub account.", ephemeral=True)

    finally:
        # Release the lock
        verification_lock.release()

bot.run(TOKEN)