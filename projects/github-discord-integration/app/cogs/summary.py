import discord
from discord import app_commands
from discord.ext import commands, tasks
import logging
import datetime
from collections import defaultdict
import os

from ..database import AsyncSessionLocal
from .. import crud
from ..config import DISCORD_GUILD_ID, SUMMARY_CHANNEL_ID,BOT_OWNER_ID

logger = logging.getLogger(__name__)

class SummaryCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot
        self.owner_id = BOT_OWNER_ID
        logger.info(f"SummaryCog initialized. Owner ID set to: {self.owner_id}")

        if SUMMARY_CHANNEL_ID != 0:
            try:
                if not self.post_weekly_summary.is_running():
                    self.post_weekly_summary.start()
                    logger.info("Weekly summary task started.")
                else:
                    logger.info("Weekly summary task is already running.")
            except Exception as e:
                logger.error(f"Failed to start weekly summary task: {e}", exc_info=True)
        else:
            logger.warning("Weekly summary task not started: SUMMARY_CHANNEL_ID is not set.")

    def cog_unload(self):
        if self.post_weekly_summary.is_running():
            self.post_weekly_summary.cancel()
            logger.info("Weekly summary task cancelled.")

    @tasks.loop(time=datetime.time(hour=18, minute=0, tzinfo=datetime.timezone.utc))
    async def post_weekly_summary(self):
        today = datetime.datetime.now(datetime.timezone.utc)
        if self.post_weekly_summary.current_loop > 0 and today.weekday() != 6:
            return

        logger.info(f"Running post_weekly_summary (Loop: {self.post_weekly_summary.current_loop}, Day: {today.weekday()})...")

        if not SUMMARY_CHANNEL_ID:
            logger.error("Cannot post weekly summary: SUMMARY_CHANNEL_ID is not configured.")
            return

        channel = self.bot.get_channel(SUMMARY_CHANNEL_ID)
        if not channel or not isinstance(channel, discord.TextChannel):
            logger.error(f"Cannot post weekly summary: Channel {SUMMARY_CHANNEL_ID} not found or not text.")
            return

        start_of_week = today - datetime.timedelta(days=today.weekday())
        start_of_week = start_of_week.replace(hour=0, minute=0, second=0, microsecond=0)
        logger.info(f"Generating summary for week starting: {start_of_week}")

        weekly_contributors = defaultdict(lambda: {'commits': 0, 'merged_prs': 0, 'closed_issues': 0, 'reviewed_prs': 0, 'discord_id': 0, 'github_username': 'Unknown'})
        total_commits = 0
        total_merged_prs = 0
        total_closed_issues = 0
        total_reviewed_prs = 0
        repo_activity = defaultdict(int)
        try:
            async with AsyncSessionLocal() as session:
                contributions_this_week = await crud.get_contributions_since(session, start_of_week)
                logger.debug(f"Found {len(contributions_this_week)} contribution records updated since {start_of_week}")
                user_ids_active = {c.user_discord_id for c in contributions_this_week}

                if user_ids_active:
                    all_contributions_for_active_users = []
                    for user_id in user_ids_active:
                        user_contribs = await crud.get_all_user_contributions(session, user_id)
                        all_contributions_for_active_users.extend(user_contribs)

                    for contrib in all_contributions_for_active_users:
                        user_id = contrib.user_discord_id
                        github_username = getattr(contrib.user, 'github_username', 'Unknown') if contrib.user else 'Unknown'
                        weekly_contributors[user_id]['discord_id'] = user_id
                        weekly_contributors[user_id]['github_username'] = github_username
                        weekly_contributors[user_id]['commits'] += contrib.commits or 0
                        weekly_contributors[user_id]['merged_prs'] += contrib.merged_prs or 0
                        weekly_contributors[user_id]['closed_issues'] += contrib.closed_issues or 0
                        weekly_contributors[user_id]['reviewed_prs'] += contrib.reviewed_prs or 0

                for contrib in contributions_this_week:
                    total_commits += contrib.commits or 0
                    total_merged_prs += contrib.merged_prs or 0
                    total_closed_issues += contrib.closed_issues or 0
                    total_reviewed_prs += contrib.reviewed_prs or 0
                    repo_activity[contrib.repo_name] += (contrib.commits or 0) + (contrib.merged_prs or 0) + (contrib.closed_issues or 0) + (contrib.reviewed_prs or 0)

        except Exception as e:
            logger.error(f"Error fetching data for weekly summary: {e}", exc_info=True)
            await channel.send("⚠️ Error generating weekly summary data.")
            return

        embed = discord.Embed(
            title=f"BURO Weekly Summary ({start_of_week.strftime('%b %d')} - {today.strftime('%b %d, %Y')})",
            color=discord.Color.from_rgb(114, 137, 218),
            timestamp=today
        )
        embed.add_field(
            name="📊 Weekly Activity Totals",
            value=(
                f"> Commits: `{total_commits}`\n"
                f"> Merged PRs: `{total_merged_prs}`\n"
                f"> Closed Issues: `{total_closed_issues}`\n"
                f"> Reviewed PRs: `{total_reviewed_prs}`"
            ),
            inline=False
        )
        top_contributors_str = "*No tracked activity this week.*"
        if weekly_contributors:
            def contribution_score(data):
                return (data['merged_prs'] * 3) + (data['reviewed_prs'] * 2) + (data['commits'] * 1) + (data['closed_issues'] * 1)
            sorted_contributors = sorted(weekly_contributors.values(), key=contribution_score, reverse=True)
            top_contributors_str = ""
            guild = self.bot.get_guild(DISCORD_GUILD_ID) if DISCORD_GUILD_ID else channel.guild
            for i, user_data in enumerate(sorted_contributors[:5]):
                display_name = f"`{user_data['github_username']}`"
                if guild:
                    member = guild.get_member(user_data['discord_id'])
                    if member: display_name = member.mention
                score_details = f"(PRs: {user_data['merged_prs']}, Rv: {user_data['reviewed_prs']}, C: {user_data['commits']}, I: {user_data['closed_issues']})"
                top_contributors_str += f"{i+1}. {display_name} {score_details}\n"
        embed.add_field(name="⭐ Top Active Contributors (Ranked)", value=top_contributors_str.strip(), inline=False)
        active_repos_str = "*No specific repository activity tracked.*"
        if repo_activity:
            sorted_repos = sorted(repo_activity.items(), key=lambda item: item[1], reverse=True)
            active_repos_str = "\n".join([f"- `{repo}` ({count} actions)" for repo, count in sorted_repos[:5]])
        embed.add_field(name="🏗️ Most Active Repositories", value=active_repos_str, inline=False)
        embed.set_footer(text=f"{self.bot.user.name if self.bot.user else 'BURO'} | Weekly Report")
        try:
            await channel.send(embed=embed)
            logger.info(f"Weekly summary posted to channel {SUMMARY_CHANNEL_ID}.")
        except discord.Forbidden:
            logger.error(f"Failed to post weekly summary: Bot lacks permissions in channel {SUMMARY_CHANNEL_ID}.")
        except Exception as e:
            logger.error(f"Failed to send weekly summary embed: {e}", exc_info=True)

    @post_weekly_summary.before_loop
    async def before_weekly_summary(self):
        await self.bot.wait_until_ready()
        logger.info("Bot is ready, weekly summary loop check can start.")

    @app_commands.command(name="debug_weekly_summary", description="[Owner Only] Manually triggers the weekly summary generation.")
    async def debug_summary_command(self, interaction: discord.Interaction):
        await interaction.response.defer(ephemeral=True)

        logger.info(f"Debug summary command invoked by: {interaction.user} (ID: {interaction.user.id})")
        logger.info(f"Checking against configured Owner ID: {self.owner_id}")

        if not self.owner_id or interaction.user.id != self.owner_id:
            logger.warning(f"Unauthorized attempt to use debug_weekly_summary by {interaction.user} ({interaction.user.id})")
            await interaction.followup.send("⛔ You do not have permission to use this command.", ephemeral=True)
            return

        logger.info(f"Manual weekly summary triggered by owner {interaction.user.id}")
        try:
            await self.post_weekly_summary()
            await interaction.followup.send("✅ Weekly summary generation manually triggered. Check the summary channel.", ephemeral=True)
        except Exception as e:
            logger.error(f"Error during manual summary trigger execution: {e}", exc_info=True)
            if not interaction.is_expired():
                await interaction.followup.send(f"❌ An error occurred during manual trigger: {e}", ephemeral=True)
            else:
                logger.warning("Interaction expired before error message could be sent for manual summary trigger.")

async def setup(bot: commands.Bot):
    if not BOT_OWNER_ID:
        logger.warning("BOT_OWNER_ID not set in environment. Owner-only commands in SummaryCog might not work as expected.")

    await bot.add_cog(SummaryCog(bot))
    logger.info("Added SummaryCog.")