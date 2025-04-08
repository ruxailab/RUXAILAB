import hmac
import hashlib
import json
from fastapi import APIRouter, Request, HTTPException, Depends
from typing import Dict, Any
import logging
import os
from datetime import datetime, timezone

from .database import get_db
from . import crud
from .config import config, GITHUB_WEBHOOK_SECRET
from .notifier import Notifier

router = APIRouter(prefix="/api/github", tags=["webhooks"])
logger = logging.getLogger(__name__)

WEBHOOK_SECRET = GITHUB_WEBHOOK_SECRET
BOT_NAME = "BURO"

class WebhookEvent:
    def __init__(self, event_type: str, payload: Dict[str, Any]):
        self.type = event_type
        self.payload = payload
        self.timestamp = datetime.now(timezone.utc)
        self.repo_name = payload.get("repository", {}).get("full_name")

async def verify_signature(request: Request):
    """Verify GitHub webhook signature."""
    if not WEBHOOK_SECRET:
        logger.critical(f"{BOT_NAME}: Webhook secret not configured!")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")

    signature = request.headers.get("X-Hub-Signature-256")
    if not signature:
        logger.warning(f"{BOT_NAME}: Received webhook without signature")
        raise HTTPException(status_code=401, detail="No signature provided")

    body = await request.body()
    hmac_gen = hmac.new(
        WEBHOOK_SECRET.encode(),
        msg=body,
        digestmod=hashlib.sha256
    )
    expected = f"sha256={hmac_gen.hexdigest()}"

    if not hmac.compare_digest(signature, expected):
        logger.warning(f"{BOT_NAME}: Invalid webhook signature received")
        raise HTTPException(status_code=401, detail="Invalid signature")

@router.post("/webhook")
async def github_webhook(
    request: Request,
    db=Depends(get_db),
    _=Depends(verify_signature)
):
    """Handle GitHub webhook events."""
    event = WebhookEvent(
        event_type=request.headers.get("X-GitHub-Event"),
        payload=await request.json()
    )
    
    logger.info(f"{BOT_NAME}: Received {event.type} event from {event.repo_name}")

    try:
        if event.type == "push":
            return await handle_push_event(db, event)
        elif event.type == "pull_request":
            return await handle_pr_event(db, event)
        elif event.type == "pull_request_review":
            return await handle_review_event(db, event)
        elif event.type == "issues":
            return await handle_issue_event(db, event)
        
        logger.info(f"{BOT_NAME}: Ignored {event.type} event")
        return {"status": "ignored", "event": event.type}

    except Exception as e:
        logger.error(f"{BOT_NAME}: Error processing {event.type} event: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

async def handle_push_event(db, event: WebhookEvent):
    """Handle push events from GitHub."""
    try:
        commits = event.payload.get("commits", [])
        if not commits:
            return {"status": "no commits"}

        pusher = event.payload["pusher"]["name"]
        commit_count = len(commits)

        # Update contribution stats
        await crud.update_contribution(
            db,
            github_username=pusher,
            repo_name=event.repo_name,
            contribution_type="commit",
            amount=commit_count
        )

        # Send notification
        notifier = Notifier()
        await notifier.send_commit_notification(
            user=pusher,
            repo=event.repo_name,
            commit_count=commit_count
        )

        logger.info(f"{BOT_NAME}: Processed {commit_count} commits from {pusher}")
        return {
            "status": "processed",
            "commits": commit_count,
            "user": pusher,
            "repository": event.repo_name
        }

    except Exception as e:
        logger.error(f"{BOT_NAME}: Error handling push event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_pr_event(db, event: WebhookEvent):
    """Handle pull request events from GitHub."""
    try:
        action = event.payload.get("action")
        pr = event.payload.get("pull_request", {})
        user = pr.get("user", {}).get("login")

        if not user:
            return {"status": "no user found"}

        # Update contribution stats
        await crud.update_contribution(
            db,
            github_username=user,
            repo_name=event.repo_name,
            contribution_type="pull_request",
            amount=1
        )

        logger.info(f"{BOT_NAME}: Processed PR {action} from {user}")
        return {
            "status": "processed",
            "action": action,
            "user": user,
            "repository": event.repo_name
        }

    except Exception as e:
        logger.error(f"{BOT_NAME}: Error handling PR event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_issue_event(db, event: WebhookEvent):
    """Handle issue events from GitHub."""
    try:
        action = event.payload.get("action")
        issue = event.payload.get("issue", {})
        user = issue.get("user", {}).get("login")

        if not user:
            return {"status": "no user found"}

        # Update contribution stats
        await crud.update_contribution(
            db,
            github_username=user,
            repo_name=event.repo_name,
            contribution_type="issue",
            amount=1
        )

        logger.info(f"{BOT_NAME}: Processed issue {action} from {user}")
        return {
            "status": "processed",
            "action": action,
            "user": user,
            "repository": event.repo_name
        }

    except Exception as e:
        logger.error(f"{BOT_NAME}: Error handling issue event: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def handle_review_event(db, event: WebhookEvent):
    """Handle pull request review events from GitHub."""
    try:
        action = event.payload.get("action")
        review = event.payload.get("review", {})
        user = review.get("user", {}).get("login")

        if not user:
            return {"status": "no user found"}

        # Update contribution stats
        await crud.update_contribution(
            db,
            github_username=user,
            repo_name=event.repo_name,
            contribution_type="review",
            amount=1
        )

        logger.info(f"{BOT_NAME}: Processed review {action} from {user}")
        return {
            "status": "processed",
            "action": action,
            "user": user,
            "repository": event.repo_name
        }

    except Exception as e:
        logger.error(f"{BOT_NAME}: Error handling review event: {e}")
        raise HTTPException(status_code=500, detail=str(e))