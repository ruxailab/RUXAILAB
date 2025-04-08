import discord
import logging
import datetime

logger = logging.getLogger(__name__)

try:
     from .bot import bot
except ImportError:
     bot = None
     logger.warning("Could not import bot instance in notifier. Notifications might fail.")

from .config import NOTIFICATION_CHANNEL_ID

async def send_github_notification(event_type: str, payload: dict):
    """Formats and sends GitHub event notifications to Discord."""
    if not NOTIFICATION_CHANNEL_ID:
        return
    if bot is None or not bot.is_ready():
         logger.warning("Bot is not ready or available, skipping notification.")
         return
    channel = bot.get_channel(NOTIFICATION_CHANNEL_ID)
    if not channel or not isinstance(channel, discord.TextChannel):
        logger.error(f"Notification channel {NOTIFICATION_CHANNEL_ID} not found or is not a text channel.")
        return

    embed = None
    try:
        repo_name = payload.get('repository', {}).get('full_name', 'Unknown Repo')
        sender_name = payload.get('sender', {}).get('login', 'Unknown User')
        sender_url = payload.get('sender', {}).get('html_url', None)
        sender_avatar = payload.get('sender', {}).get('avatar_url', None)

        if event_type == 'push':
            commits = payload.get('commits', [])
            if not commits or payload.get('deleted', False):
                 return

            branch = payload.get('ref', 'Unknown Branch').replace('refs/heads/', '')
            compare_url = payload.get('compare', None)

            embed = discord.Embed(
                title=f" Pushed to `{repo_name}:{branch}`",
                color=discord.Color.blue(),
                url=compare_url,
                timestamp=datetime.datetime.now(datetime.timezone.utc)
            )
            commit_details = ""
            commit_count = len(commits)
            for i, commit in enumerate(commits[:5]):
                sha_short = commit.get('id', '')[:7]
                message = commit.get('message', '').split('\n')[0]
                commit_url = commit.get('url', None)
                commit_details += f"[`{sha_short}`]({commit_url}) {message}\n"
            if commit_count > 5:
                 commit_details += f"... and {commit_count - 5} more commits."

            embed.description = commit_details.strip() if commit_details else "No commit details available."
            embed.set_author(name=sender_name, url=sender_url, icon_url=sender_avatar)


        # PR and Issue Events
        elif event_type == 'pull_request':
            action = payload.get('action', 'unknown')
            pr_data = payload.get('pull_request', {})
            pr_number = payload.get('number', pr_data.get('number', '??'))
            pr_title = pr_data.get('title', 'No Title')
            pr_url = pr_data.get('html_url', None)
            pr_user = pr_data.get('user', {}).get('login', sender_name)
            pr_user_url = pr_data.get('user', {}).get('html_url', sender_url)
            pr_user_avatar = pr_data.get('user', {}).get('avatar_url', sender_avatar)
            merged = pr_data.get('merged', False)
            timestamp_str = pr_data.get('updated_at') 

            color = discord.Color.default()
            action_text = action.replace('_', ' ').title()

            if action == 'opened':
                color = discord.Color.green()
                timestamp_str = pr_data.get('created_at')
            elif action == 'closed':
                if merged:
                     color = discord.Color.purple()
                     action_text = "Merged"
                     timestamp_str = pr_data.get('merged_at')
                else:
                     color = discord.Color.red()
                     action_text = "Closed (Not Merged)"
                     timestamp_str = pr_data.get('closed_at')
            elif action == 'reopened':
                 color = discord.Color.orange()

            embed = discord.Embed(
                title=f"{action_text} PR #{pr_number}: {pr_title}",
                description=f"Action in `{repo_name}` by {sender_name}",
                color=color,
                url=pr_url
            )
            if timestamp_str:
                try:
                    embed.timestamp=datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                except ValueError:
                    embed.timestamp=datetime.datetime.now(datetime.timezone.utc)

            embed.set_author(name=pr_user, url=pr_user_url, icon_url=pr_user_avatar)

        elif event_type == 'issues':
            action = payload.get('action', 'unknown')
            issue_data = payload.get('issue', {})
            issue_number = issue_data.get('number', '??')
            issue_title = issue_data.get('title', 'No Title')
            issue_url = issue_data.get('html_url', None)
            issue_user = issue_data.get('user', {}).get('login', sender_name)
            issue_user_url = issue_data.get('user', {}).get('html_url', sender_url)
            issue_user_avatar = issue_data.get('user', {}).get('avatar_url', sender_avatar)
            timestamp_str = issue_data.get('updated_at')

            color = discord.Color.default()
            action_text = action.replace('_', ' ').title()

            if action == 'opened':
                 color = discord.Color.orange()
                 timestamp_str = issue_data.get('created_at')
            elif action == 'closed':
                 color = discord.Color.dark_grey() # Changed color
                 timestamp_str = issue_data.get('closed_at')
            elif action == 'reopened':
                 color = discord.Color.light_grey()

            embed = discord.Embed(
                title=f"{action_text} Issue #{issue_number}: {issue_title}",
                description=f"Action in `{repo_name}` by {sender_name}",
                color=color,
                url=issue_url
            )
            if timestamp_str:
                try:
                     embed.timestamp=datetime.datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
                except ValueError:
                    embed.timestamp=datetime.datetime.now(datetime.timezone.utc)

            embed.set_author(name=issue_user, url=issue_user_url, icon_url=issue_user_avatar)

        elif event_type == 'pull_request_review':
             action = payload.get('action')
             if action != 'submitted':
                  return

             review = payload.get('review', {})
             pr_data = payload.get('pull_request', {})
             reviewer_name = review.get('user', {}).get('login', sender_name)
             reviewer_url = review.get('user', {}).get('html_url', sender_url)
             reviewer_avatar = review.get('user', {}).get('avatar_url', sender_avatar)
             pr_number = pr_data.get('number', '??')
             pr_title = pr_data.get('title', 'No Title')
             review_url = review.get('html_url')
             state = review.get('state', '').lower() 

             color = discord.Color.yellow()
             state_text = "Commented on"
             if state == 'approved':
                  color = discord.Color.green()
                  state_text = "Approved"
             elif state == 'changes_requested':
                  color = discord.Color.orange()
                  state_text = "Requested Changes on"

             embed = discord.Embed(
                 title=f"{state_text} PR #{pr_number}: {pr_title}",
                 description=f"Review in `{repo_name}`",
                 color=color,
                 url=review_url,
                 timestamp=datetime.datetime.fromisoformat(review.get('submitted_at', str(datetime.datetime.now(datetime.timezone.utc))).replace('Z', '+00:00'))
             )
             body = review.get('body')
             if body and len(body) < 1000:
                  embed.add_field(name="Comment", value=body, inline=False)

             embed.set_author(name=reviewer_name, url=reviewer_url, icon_url=reviewer_avatar)


        if embed:
            await channel.send(embed=embed)

    except Exception as e:
        logger.error(f"Error formatting/sending notification for event {event_type}: {e}", exc_info=True)
        try:
             # Fallback msg if embed fails
             await channel.send(f"⚠️ Error processing GitHub event notification: `{event_type}` in `{payload.get('repository', {}).get('full_name', 'N/A')}`")
        except Exception as fallback_e:
             logger.error(f"Failed to send error fallback message: {fallback_e}")