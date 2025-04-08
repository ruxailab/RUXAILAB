import discord
from discord import app_commands
from discord.ext import commands
import logging
import matplotlib.pyplot as plt
import os
import io
from typing import Literal, Optional, List

from ..database import AsyncSessionLocal
from .. import crud
from ..config import DISCORD_GUILD_ID, ROLE_MAP_BY_ID # Import role map

logger = logging.getLogger(__name__)

# Add reviewed_prs to the literal type for choices
Metric = Literal['commits', 'merged_prs', 'closed_issues', 'reviewed_prs']

class StatsCog(commands.Cog):
    def __init__(self, bot: commands.Bot):
        self.bot = bot

    @app_commands.command(name="stats", description="Show your or another user's GitHub contribution stats and roles.")
    @app_commands.describe(user="The user whose stats you want to see (optional).")
    async def stats(self, interaction: discord.Interaction, user: Optional[discord.User] = None):
        target_user = user or interaction.user
        make_ephemeral = (user is None)
        await interaction.response.defer(ephemeral=make_ephemeral)

        try:
            total_commits = 0
            total_merged_prs = 0
            total_closed_issues = 0
            total_reviewed_prs = 0 # Added
            contributions_details = []
            github_username = "N/A"
            is_verified = False
            roles_display = "None"

            async with AsyncSessionLocal() as session:
                db_user = await crud.get_user_by_discord_id(session, target_user.id)
                if db_user:
                    github_username = db_user.github_username or "Not Linked"
                    is_verified = db_user.is_verified
                    if is_verified and db_user.github_username:
                         contributions = await crud.get_all_user_contributions(session, target_user.id)
                         for contrib in contributions:
                             total_commits += contrib.commits or 0
                             total_merged_prs += contrib.merged_prs or 0
                             total_closed_issues += contrib.closed_issues or 0
                             total_reviewed_prs += contrib.reviewed_prs or 0 # Added
                             # Only list repos with *any* tracked activity
                             if contrib.commits or contrib.merged_prs or contrib.closed_issues or contrib.reviewed_prs:
                                  details = f"- `{contrib.repo_name}`: "
                                  parts = []
                                  if contrib.commits: parts.append(f"C={contrib.commits}")
                                  if contrib.merged_prs: parts.append(f"PRs={contrib.merged_prs}")
                                  if contrib.closed_issues: parts.append(f"I={contrib.closed_issues}")
                                  if contrib.reviewed_prs: parts.append(f"Rv={contrib.reviewed_prs}") # Added
                                  details += ", ".join(parts)
                                  contributions_details.append(details)
                    else:
                         pass # User exists but not verified or linked

                    # Get user's roles from Discord member object
                    member = interaction.guild.get_member(target_user.id) if interaction.guild else None
                    if member:
                         member_role_ids = {r.id for r in member.roles}
                         assigned_buro_roles = []
                         for role_id, role_config in ROLE_MAP_BY_ID.items():
                              if role_id in member_role_ids:
                                   # Format with emoji and name
                                   emoji = role_config.get('emoji', '')
                                   name = role_config.get('name', 'Unknown Role')
                                   description = role_config.get('description', '')
                                   assigned_buro_roles.append(f"{emoji} **{name}** ({description})") # Include description

                         if assigned_buro_roles:
                              roles_display = "\n".join(assigned_buro_roles)

                else:
                     await interaction.followup.send(f"{target_user.mention} is not registered with BURO.", ephemeral=True)
                     return

            embed = discord.Embed(
                title=f"BURO Stats for {target_user.display_name}",
                color=discord.Color.blue() if is_verified else discord.Color.orange()
            )
            embed.set_thumbnail(url=target_user.display_avatar.url)
            embed.add_field(name="GitHub", value=f"`{github_username}`", inline=True)
            embed.add_field(name="Status", value="✅ Verified" if is_verified else "⚠️ Not Verified/Linked", inline=True)
            embed.add_field(name="BURO Roles", value=roles_display, inline=False) # Display assigned roles
            # Updated stats display
            embed.add_field(
                 name="Total Contributions",
                 value=f"Commits: {total_commits}\nMerged PRs: {total_merged_prs}\nClosed Issues: {total_closed_issues}\nReviewed PRs: {total_reviewed_prs}", # Added reviews
                 inline=False
             )


            if contributions_details:
                details_str = "\n".join(contributions_details)
                if len(details_str) > 1024: # Embed field value limit
                     details_str = details_str[:1021] + "..." # Keep under limit
                embed.add_field(name="Activity per Repository", value=details_str, inline=False)
            elif is_verified:
                 embed.add_field(name="Activity per Repository", value="No tracked contributions found yet.", inline=False)

            await interaction.followup.send(embed=embed, ephemeral=make_ephemeral)

        except Exception as e:
            logger.error(f"Error fetching stats for {target_user.id}: {e}", exc_info=True)
            await interaction.followup.send("❌ An error occurred while fetching stats.", ephemeral=True)


    @app_commands.command(name="leaderboard", description="Show the top contributors.")
    @app_commands.describe(metric="The metric to rank by.", chart="Display results as a chart?")
    # Add reviewed_prs to choices
    @app_commands.choices(metric=[
        app_commands.Choice(name="Merged Pull Requests", value="merged_prs"),
        app_commands.Choice(name="Commits", value="commits"),
        app_commands.Choice(name="Closed Issues", value="closed_issues"),
        app_commands.Choice(name="Reviewed Pull Requests", value="reviewed_prs"), # Added
    ])
    async def leaderboard(self, interaction: discord.Interaction, metric: Metric, chart: bool = False):
        await interaction.response.defer()

        try:
            async with AsyncSessionLocal() as session:
                leaderboard_data = await crud.get_leaderboard(session, metric=metric, limit=10)

            if not leaderboard_data:
                await interaction.followup.send(f"No contribution data found yet for the '{metric}' metric.")
                return

            # Generate response (text or chart)
            if chart:
                # ...(chart generation logic remains the same, uses the data)...
                try:
                    buffer = self._create_leaderboard_chart(leaderboard_data, metric)
                    file = discord.File(buffer, filename=f"{metric}_leaderboard.png")
                    await interaction.followup.send(f"Top contributors by **{metric.replace('_', ' ').title()}**:", file=file)
                except Exception as chart_error:
                     logger.error(f"Failed to generate leaderboard chart: {chart_error}", exc_info=True)
                     await interaction.followup.send("⚠️ Failed to generate chart, showing text instead.")
                     await self._send_leaderboard_text(interaction, leaderboard_data, metric) # Fallback
            else:
                await self._send_leaderboard_text(interaction, leaderboard_data, metric)

        except ValueError as e:
             logger.warning(f"Leaderboard command failed: {e}")
             await interaction.followup.send(f"⚠️ Invalid metric selected.", ephemeral=True)
        except Exception as e:
            logger.error(f"Error fetching leaderboard for {metric}: {e}", exc_info=True)
            await interaction.followup.send("❌ An error occurred while fetching the leaderboard.", ephemeral=True)

    async def _send_leaderboard_text(self, interaction: discord.Interaction, data: list, metric: str):
         # ...(same text generation logic as before)...
        embed = discord.Embed(
            title=f"🏆 BURO Leaderboard: Top Contributors by {metric.replace('_', ' ').title()}",
            color=discord.Color.gold()
        )
        description = ""
        guild = interaction.guild # Get guild from interaction
        for i, (discord_id, github_username, total) in enumerate(data):
            display_name = f"`{github_username or 'Unknown GH'}`" # Default to GH username
            if guild:
                 member = guild.get_member(discord_id)
                 if member:
                       display_name = member.mention # Use mention if member found
                 else: # Member not found in cache/guild
                       display_name = f"`{github_username or 'Unknown'}` (<@{discord_id}>)" # Show ID as fallback

            rank = i + 1
            description += f"{rank}. {display_name}: **{total}**\n"

        embed.description = description.strip()
        await interaction.followup.send(embed=embed)


    def _create_leaderboard_chart(self, data: list, metric: str) -> io.BytesIO:
        # ...(same chart generation logic as before)...
        # Use GitHub username, fallback to Discord ID string if GH name missing
        display_names = [item[1] if item[1] else f"User_{item[0]}" for item in data]
        totals = [item[2] for item in data]

        # Check if data is present before plotting
        if not display_names or not totals:
            raise ValueError("No data available to generate chart.")

        plt.style.use('dark_background') # Use dark theme for Discord
        fig, ax = plt.subplots(figsize=(10, max(6, len(display_names) * 0.6))) # Dynamic height

        bars = ax.barh(display_names, totals, color='#7289DA') # Discord blurple

        ax.set_xlabel(f"Total {metric.replace('_', ' ').title()}")
        ax.set_ylabel("Contributor")
        ax.set_title(f"BURO Leaderboard by {metric.replace('_', ' ').title()}")
        ax.invert_yaxis()

        # Add value labels
        ax.bar_label(bars, padding=5, fmt='%d') # Integer format

        # Improve layout
        fig.tight_layout()

        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        plt.close(fig)
        return buffer

# Setup function
async def setup(bot: commands.Bot):
    guild_id = int(os.getenv("DISCORD_GUILD_ID", 0))
    if guild_id:
         guild = discord.Object(id=guild_id)
         await bot.add_cog(StatsCog(bot), guilds=[guild])
         logger.info(f"Added StatsCog to guild {guild_id}")
    else:
         # await bot.add_cog(StatsCog(bot))
         logger.warning("StatsCog not added to a specific guild as DISCORD_GUILD_ID is not set.")