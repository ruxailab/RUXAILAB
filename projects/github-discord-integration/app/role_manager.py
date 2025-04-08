import discord
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

try:
     from .bot import bot
except ImportError:
     bot = None
     logger.warning("Could not import bot instance in role_manager.")


from .config import DISCORD_GUILD_ID, ROLES_CONFIG, ROLE_MAP_BY_ID 
from .database import AsyncSessionLocal
from . import crud

logger = logging.getLogger(__name__)

async def check_and_update_roles(discord_user_id: int, notify_user: bool = False): 
    """Checks contributions and updates Discord roles based on config/roles.yaml."""
    if bot is None or not bot.is_ready():
         logger.warning("Role check skipped: Bot is not ready.")
         return
    if not DISCORD_GUILD_ID or not ROLES_CONFIG:
        return

    guild = bot.get_guild(DISCORD_GUILD_ID)
    if not guild:
        logger.error(f"Role management failed: Cannot find Guild {DISCORD_GUILD_ID}")
        return

    member = guild.get_member(discord_user_id)
    if not member:
        return 

    logger.debug(f"Checking roles for member {member.id} ({member.display_name})")

    try:
        #  Fetch user stats
        total_stats = {'commits': 0, 'merged_prs': 0, 'closed_issues': 0, 'reviewed_prs': 0}
        async with AsyncSessionLocal() as session:
            contributions = await crud.get_all_user_contributions(session, discord_user_id)
            for contrib in contributions:
                total_stats['commits'] += contrib.commits or 0
                total_stats['merged_prs'] += contrib.merged_prs or 0
                total_stats['closed_issues'] += contrib.closed_issues or 0
                total_stats['reviewed_prs'] += contrib.reviewed_prs or 0 

        logger.debug(f"User {member.id} total stats: {total_stats}")

        #  Check Roles
        current_role_ids = {role.id for role in member.roles}
        roles_to_add_ids = set()
        roles_to_remove_ids = set() 

        all_managed_role_ids = set(ROLE_MAP_BY_ID.keys())

        # Check each role's criteria
        for role_cfg in ROLES_CONFIG:
            role_id = role_cfg['id']
            criteria = role_cfg['criteria']
            operator = role_cfg['operator']

            meets_criteria = False
            checks_met = 0
            required_checks = 0

            for metric, required_value in criteria.items():
                if metric == 'operator': continue
                required_checks += 1
                if total_stats.get(metric, 0) >= required_value:
                     checks_met += 1

            if required_checks == 0: # Skip roles with no criteria
                 continue

            if operator == 'AND':
                meets_criteria = (checks_met == required_checks)
            else: 
                 meets_criteria = (checks_met > 0)


            if meets_criteria:
                if role_id not in current_role_ids:
                    roles_to_add_ids.add(role_id)
            else:
                if role_id in current_role_ids and role_id in all_managed_role_ids:
                    roles_to_remove_ids.add(role_id)

        # Apply Role Changes
        roles_added_info: Dict[int, Dict[str, Any]] = {}
        if roles_to_add_ids:
            add_objs = []
            for rid in roles_to_add_ids:
                role_obj = guild.get_role(rid)
                if role_obj:
                    add_objs.append(role_obj)
                    roles_added_info[rid] = ROLE_MAP_BY_ID.get(rid, {})
                else:
                    logger.warning(f"Role ID {rid} configured but not found in guild {guild.id}.")

            if add_objs:
                await member.add_roles(*add_objs, reason=f"{bot.user.name}: Auto-assigned by contribution")
                logger.info(f"Added roles {[r.name for r in add_objs]} to user {member.id}")

        roles_removed_info: Dict[int, Dict[str, Any]] = {}
        if roles_to_remove_ids:
             remove_objs = []
             for rid in roles_to_remove_ids:
                 role_obj = guild.get_role(rid)
                 if role_obj:
                     remove_objs.append(role_obj)
                     roles_removed_info[rid] = ROLE_MAP_BY_ID.get(rid, {})

             if remove_objs:
                await member.remove_roles(*remove_objs, reason=f"{bot.user.name}: Auto-removed by contribution")
                logger.info(f"Removed roles {[r.name for r in remove_objs]} from user {member.id}")

        # 4. Notify User
        if notify_user and (roles_added_info or roles_removed_info):
            try:
                 embed = discord.Embed(title="Your Roles Have Been Updated!", color=discord.Color.blurple())
                 added_desc = ""
                 for role_id, role_info in roles_added_info.items():
                      added_desc += f"- {role_info.get('emoji','')} **{role_info.get('name','Unknown Role')}** added.\n"
                 removed_desc = ""
                 for role_id, role_info in roles_removed_info.items():
                       removed_desc += f"- {role_info.get('emoji','')} **{role_info.get('name','Unknown Role')}** removed.\n"

                 if added_desc:
                       embed.add_field(name="Roles Gained", value=added_desc, inline=False)
                 if removed_desc:
                       embed.add_field(name="Roles Lost", value=removed_desc, inline=False)

                 if embed.fields:
                     await member.send(embed=embed)
                     logger.info(f"Notified user {member.id} of role changes via DM.")
            except discord.Forbidden:
                 logger.warning(f"Could not DM user {member.id} about role changes (DMs likely disabled).")
            except Exception as e:
                 logger.error(f"Failed to notify user {member.id} of role changes: {e}")


    except discord.Forbidden:
        logger.error(f"Role management failed for {member.id}: Bot lacks Manage Roles permission.")
    except discord.HTTPException as e:
         logger.error(f"Role management failed for {member.id} due to Discord API error: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during role management for {member.id}: {e}", exc_info=True)