# (Paste the code from the previous response's app/cogs/linking.py)
# Optional: Change logger name if desired: logger = logging.getLogger("buro.linking")
import discord
from discord import app_commands
from discord.ext import commands
import logging
import os

from ..database import AsyncSessionLocal
from .. import crud
from ..config import DISCORD_GUILD_ID

# Use specific logger for this cog
logger = logging.getLogger(__name__) # Standard practice

class LinkingCog(commands.Cog):
    def __init__(self, bot: commands.Bot): # Use commands.Bot type hint for compatibility
        self.bot = bot

    # --- /link command ---
    @app_commands.command(name="link", description="Link your Discord account to a GitHub username.")
    @app_commands.describe(github_username="Your GitHub username (case-insensitive).")
    async def link_github(self, interaction: discord.Interaction, github_username: str):
        # ...(same logic as before)...
        await interaction.response.defer(ephemeral=True)
        discord_id = interaction.user.id

        if not github_username or len(github_username) > 39 or not github_username.replace('-', '').isalnum():
             await interaction.followup.send("Please provide a valid GitHub username (alphanumeric and hyphens).", ephemeral=True)
             return

        try:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                    user = await crud.link_user_github(session, discord_id, github_username.strip())

            await interaction.followup.send(
                f"✅ Linked {interaction.user.mention} to GitHub `{user.github_username}`. "
                f"Use `/verify` to enable contribution tracking.",
                ephemeral=True
            )
            logger.info(f"Link command successful for {discord_id} -> {user.github_username}")
        except ValueError as e:
             logger.warning(f"Link command failed for {discord_id}: {e}")
             await interaction.followup.send(f"⚠️ Link failed: {e}", ephemeral=True)
        except Exception as e:
            logger.error(f"Error linking account for {discord_id}: {e}", exc_info=True)
            await interaction.followup.send("❌ An unexpected error occurred. Please try again later.", ephemeral=True)


    # --- /verify command ---
    @app_commands.command(name="verify", description="Mark your linked GitHub account as verified (Prototype).")
    async def verify_account(self, interaction: discord.Interaction):
         # ...(same logic as before)...
        await interaction.response.defer(ephemeral=True)
        discord_id = interaction.user.id

        try:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                     user = await crud.verify_user(session, discord_id)

            if user:
                await interaction.followup.send(
                    f"✅ Verified linked GitHub account: `{user.github_username}`. Contributions are now tracked!",
                    ephemeral=True
                )
                logger.info(f"Verify command successful for {discord_id}")
                # Trigger an initial role check upon verification
                from ..role_manager import check_and_update_roles # Local import okay here
                await check_and_update_roles(discord_id, notify_user=True)
            else:
                await interaction.followup.send(
                    "⚠️ Verification failed. Did you `/link` your GitHub username first?",
                    ephemeral=True
                )
                logger.warning(f"Verify command failed for {discord_id}: User not found or no GH username.")

        except Exception as e:
            logger.error(f"Error verifying account for {discord_id}: {e}", exc_info=True)
            await interaction.followup.send("❌ An unexpected error during verification.", ephemeral=True)


    # --- /whois command ---
    @app_commands.command(name="whois", description="Check linked GitHub account for a Discord user.")
    @app_commands.describe(user="The Discord user to check (defaults to you).")
    async def whois(self, interaction: discord.Interaction, user: discord.User = None):
         # ...(same logic as before)...
        target_user = user or interaction.user
        # Show publicly only if checking someone else AND interaction wasn't already ephemeral
        make_ephemeral = (user is None)
        await interaction.response.defer(ephemeral=make_ephemeral)

        try:
            async with AsyncSessionLocal() as session:
                db_user = await crud.get_user_by_discord_id(session, target_user.id)

            if db_user and db_user.github_username:
                verification_status = "✅ Verified" if db_user.is_verified else "⚠️ Not Verified"
                await interaction.followup.send(
                    f"{target_user.mention} is linked to GitHub: `{db_user.github_username}` ({verification_status}).",
                    ephemeral=make_ephemeral # Use original ephemeral state
                )
            elif db_user:
                 await interaction.followup.send(
                    f"{target_user.mention} has not linked a GitHub account yet.",
                     ephemeral=make_ephemeral
                )
            else:
                 await interaction.followup.send(
                    f"{target_user.mention} is not found in the BURO system.",
                    ephemeral=make_ephemeral
                )

        except Exception as e:
            logger.error(f"Error in whois command for target {target_user.id}: {e}", exc_info=True)
            await interaction.followup.send("❌ Error checking linked account.", ephemeral=True)

# Setup function for the cog
async def setup(bot: commands.Bot): # Use commands.Bot for type hint consistency
    guild_id = int(os.getenv("DISCORD_GUILD_ID", 0)) # Fetch guild_id here
    if guild_id:
         guild = discord.Object(id=guild_id)
         await bot.add_cog(LinkingCog(bot), guilds=[guild])
         logger.info(f"Added LinkingCog to guild {guild_id}")
    else:
         # await bot.add_cog(LinkingCog(bot)) # Add globally if no guild ID (might take time to show)
         logger.warning("LinkingCog not added to a specific guild as DISCORD_GUILD_ID is not set.")