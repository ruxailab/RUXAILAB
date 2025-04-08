import discord
from fastapi import FastAPI, Request, HTTPException, BackgroundTasks
import uvicorn
import logging
import asyncio
import json
import os 
try:
     from .bot import bot
except ImportError:
     bot = None
     logging.critical("Failed to import bot instance in main.py!")

from .config import DISCORD_BOT_TOKEN, GITHUB_WEBHOOK_SECRET
from .database import init_db, AsyncSessionLocal
from .utils import verify_github_signature
from . import crud
from .notifier import send_github_notification
from .role_manager import check_and_update_roles

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="BURO GitHub-Discord Integration Service")

#Background processing tasks
async def process_github_event(event_type: str, payload: dict):
    """Parses event, updates DB, triggers notifications and role checks."""
    logger.info(f"Processing event: {event_type} for repo {payload.get('repository', {}).get('full_name', 'N/A')}")

    github_username = None
    action_type = None # e.g., 'commit', 'pr_merged', 'issue_closed', 'pr_review'
    credit_username = None 
    count = 1
    repo_name = None

    try:
        repo_data = payload.get('repository')
        if not repo_data:
            logger.warning(f"Event {event_type} missing repository data. Skipping.")
            return
        repo_name = repo_data['full_name']
        sender_login = payload.get('sender', {}).get('login')

        if event_type == 'push':
            pusher_name = payload.get('pusher', {}).get('name')
            commits = payload.get('commits', [])
            if commits and not payload.get('deleted'):
                action_type = 'commit'
                count = len(commits)
                credit_username = pusher_name
                if not credit_username and commits[0].get('author'):
                    credit_username = commits[0]['author'].get('username') or commits[0]['author'].get('name')
                if not credit_username:
                     credit_username = sender_login

        elif event_type == 'pull_request':
            action = payload.get('action')
            pr_data = payload.get('pull_request', {})
            if action == 'closed' and pr_data.get('merged') == True:
                action_type = 'pr_merged'
                credit_username = pr_data.get('user', {}).get('login')

        elif event_type == 'issues':
            action = payload.get('action')
            if action == 'closed':
                action_type = 'issue_closed'
                credit_username = sender_login

        elif event_type == 'pull_request_review': 
             action = payload.get('action')
             if action == 'submitted':
                  action_type = 'pr_review'
                  credit_username = payload.get('review', {}).get('user', {}).get('login')


    except KeyError as e:
        logger.warning(f"Missing expected key in {event_type} payload for repo {repo_name}: {e}. Skipping DB update.")
        asyncio.create_task(send_github_notification(event_type, payload)) # Still notify
        return
    except Exception as e:
         logger.error(f"Error parsing {event_type} payload for repo {repo_name}: {e}", exc_info=True)
         asyncio.create_task(send_github_notification(event_type, payload)) # Still notify
         return

    # database update
    user_discord_id_for_roles = None
    if action_type and credit_username and repo_name:
        logger.info(f"Attempting DB update: User={credit_username}, Action={action_type}, Repo={repo_name}, Count={count}")
        try:
            async with AsyncSessionLocal() as session:
                async with session.begin():
                     user = await crud.get_user_by_github_username(session, credit_username)
                     if user and user.is_verified:
                        await crud.update_contribution(session, user.discord_id, repo_name, action_type, count)
                        user_discord_id_for_roles = user.discord_id
                        logger.info(f"DB update successful for verified user {user.discord_id} ({credit_username})")
                     elif user:
                        logger.info(f"Contribution from unverified user {credit_username}. Skipping DB update.")
                     else:
                         logger.info(f"Contribution from unknown GitHub user {credit_username}. Skipping DB update.")
        except Exception as e:
             logger.error(f"Error updating database for {credit_username}, event {event_type}: {e}", exc_info=True)

    asyncio.create_task(send_github_notification(event_type, payload))

    if user_discord_id_for_roles:
        asyncio.create_task(check_and_update_roles(user_discord_id_for_roles, notify_user=True))


@app.on_event("startup")
async def startup_event():
    logger.info("FastAPI application starting up...")
    await init_db()
    if bot is None or DISCORD_BOT_TOKEN is None:
         logger.critical("Bot instance or token is missing. Cannot start bot.")
    else:
         logger.info(f"Starting {bot.user.name if bot.user else 'BURO'}...")
         asyncio.create_task(bot.start(DISCORD_BOT_TOKEN))
         logger.info("Discord bot start task created.")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("FastAPI application shutting down...")
    if bot and not bot.is_closed():
        await bot.close()
        logger.info("Discord bot connection closed.")

@app.post("/webhook")
async def github_webhook(request: Request, background_tasks: BackgroundTasks):
     logger.debug("Webhook endpoint hit.")
     try:
        body = await verify_github_signature(request, GITHUB_WEBHOOK_SECRET)
        try:
             payload = json.loads(body)
        except json.JSONDecodeError:
             logger.error("Webhook error: Invalid JSON payload received.")
             raise HTTPException(status_code=400, detail="Invalid JSON payload")

        event_type = request.headers.get('X-GitHub-Event')
        delivery_id = request.headers.get('X-GitHub-Delivery') 
        if not event_type:
            logger.warning("Webhook received without X-GitHub-Event header.")
            raise HTTPException(status_code=400, detail="X-GitHub-Event header missing")

        logger.info(f"Received verified GitHub event: {event_type} (Delivery: {delivery_id})")
        background_tasks.add_task(process_github_event, event_type, payload)
        return {"message": "Webhook received successfully"}
     except HTTPException as http_exc:
         raise http_exc
     except Exception as e:
         logger.error(f"Unexpected error in webhook handler: {e}", exc_info=True)
         raise HTTPException(status_code=500, detail="Internal Server Error processing webhook")


@app.get("/")
async def root():
    bot_status = "Not Initialized"
    if bot:
         bot_status = "Ready" if bot.is_ready() else "Connecting"
    return {"status": "OK", "bot_status": bot_status, "bot_name": "BURO"}