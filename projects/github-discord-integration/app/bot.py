
import discord
from discord.ext import commands 
import os
import logging

BOT_NAME = "BURO"

DISCORD_GUILD_ID = int(os.getenv("DISCORD_GUILD_ID", 0))
DISCORD_BOT_TOKEN = os.getenv("DISCORD_BOT_TOKEN")

logger = logging.getLogger(__name__) 

intents = discord.Intents.default()
intents.members = True         
intents.message_content = True
intents.guilds = True          

class BuroBot(commands.Bot):
    def __init__(self):
        super().__init__(
            command_prefix='!buro_', 
            intents=intents,
            owner_id=int(os.getenv("BOT_OWNER_ID", 0)) if os.getenv("BOT_OWNER_ID") else None
        )

        self.initial_extensions = [
            'app.cogs.linking',
            'app.cogs.stats',
            'app.cogs.summary',
            'app.cogs.role_manager',
            'app.cogs.github_webhook',]
        #we can add moras needed
    async def setup_hook(self):
        """
        Asynchronous setup function called automatically after the bot logs in
        but before it connects to the Discord Gateway. Ideal place for loading cogs
        and syncing commands.
        """
        logger.info(f"Setting up {BOT_NAME}...")
        loaded_count = 0
        for extension in self.initial_extensions:
            try:
                await self.load_extension(extension)
                logger.info(f"Successfully loaded extension: {extension}")
                loaded_count += 1
            except commands.ExtensionNotFound:
                 logger.error(f"Failed to load extension {extension}: Cog file not found.")
            except commands.ExtensionAlreadyLoaded:
                 logger.warning(f"Extension {extension} was already loaded (shouldn't happen here normally).")
            except commands.NoEntryPointError:
                 logger.error(f"Failed to load extension {extension}: The cog file is missing the required 'async def setup(bot):' function.")
            except commands.ExtensionFailed as e:
                logger.error(f"Failed to load extension {extension}: An error occurred within the cog's setup.", exc_info=e.original) # Log the original error
            except Exception as e:
                logger.error(f"An unexpected error occurred while loading extension {extension}: {e}", exc_info=True)

        logger.info(f"Attempted to load {len(self.initial_extensions)} extensions, successfully loaded {loaded_count}.")

        if DISCORD_GUILD_ID:
            guild_obj = discord.Object(id=DISCORD_GUILD_ID)
            logger.info(f"Attempting to sync application commands to guild {DISCORD_GUILD_ID}...")
            try:
                synced_commands = await self.tree.sync(guild=guild_obj)
                logger.info(f"Synced {len(synced_commands)} application commands to guild {DISCORD_GUILD_ID}.")
            except discord.Forbidden:
                 logger.error(f"Failed to sync commands to guild {DISCORD_GUILD_ID}: Bot lacks 'applications.commands' scope in the guild OR necessary permissions.")
            except discord.HTTPException as e:
                 logger.error(f"Failed to sync commands to guild {DISCORD_GUILD_ID} due to an API error: {e}")
            except Exception as e:
                 logger.error(f"An unexpected error occurred during command sync for guild {DISCORD_GUILD_ID}: {e}", exc_info=True)
        else:
            logger.warning("DISCORD_GUILD_ID not set. Skipping specific guild sync. Application commands might sync globally (slow) or not appear if already synced globally.")

    async def on_ready(self):
        """Called when the bot has finished connecting and is ready."""
        # Log bot ready status
        if self.user: # Check if user object is available
            logger.info(f'Logged in as {self.user} (ID: {self.user.id})')
            logger.info(f'{BOT_NAME} is ready and connected to Discord.')
            try:
                await self.change_presence(activity=discord.Activity(type=discord.ActivityType.watching, name="GitHub Actions"))
                logger.info("Bot presence updated.")
            except Exception as e:
                logger.warning(f"Could not set bot presence: {e}")
        else:
            logger.error("Bot connected but self.user is not available!")


    async def on_error(self, event_method, *args, **kwargs):
        """Fallback error handler for uncaught errors in event listeners."""
        logger.error(f"Unhandled error in event listener '{event_method}':", exc_info=True)

if not DISCORD_BOT_TOKEN:
     logger.critical("CRITICAL: Cannot start BURO. DISCORD_BOT_TOKEN is missing in environment variables (.env file).")
     raise ValueError("DISCORD_BOT_TOKEN environment variable not set or loaded.")
else:
    bot = BuroBot()
    logger.info("BuroBot instance created.")
