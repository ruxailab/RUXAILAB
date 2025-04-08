import hmac
import hashlib
import logging
import os
from fastapi import Request, HTTPException
from sqlalchemy import select, update, func, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple

from . import models

logger = logging.getLogger(__name__)

#GitHub Webhook verification
async def verify_github_signature(request: Request, secret: str):
    if not secret:
        logger.warning("GITHUB_WEBHOOK_SECRET is not configured. Skipping webhook signature verification (INSECURE!).")
        try:
            return await request.body()
        except Exception as e:
            logger.error(f"Error reading request body: {e}")
            raise HTTPException(status_code=500, detail="Failed to read request body.")

    signature_header = request.headers.get('X-Hub-Signature-256')
    if not signature_header:
        logger.error("Webhook verification failed: Missing 'X-Hub-Signature-256' header.")
        raise HTTPException(status_code=403, detail="Signature header missing!")

    body = await request.body()
    try:
        hash_object = hmac.new(secret.encode('utf-8'), msg=body, digestmod=hashlib.sha256)
        expected_signature = "sha256=" + hash_object.hexdigest()

        if not hmac.compare_digest(expected_signature, signature_header):
            logger.error("Webhook verification failed: Signature mismatch.")
            raise HTTPException(status_code=403, detail="Request signature mismatch!")
    except Exception as e:
        logger.error(f"Error during signature verification: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Server error during verification.")

    logger.debug("Webhook signature verified successfully.")
    return body

# User
async def get_user_by_discord_id(db: AsyncSession, discord_id: int) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(models.User.discord_id == discord_id))
    return result.scalar_one_or_none()

async def get_user_by_github_username(db: AsyncSession, github_username: str) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(func.lower(models.User.github_username) == github_username.lower()))
    return result.scalar_one_or_none()

async def create_user(db: AsyncSession, discord_id: int, github_username: Optional[str] = None) -> models.User:
    db_user = models.User(discord_id=discord_id, github_username=github_username)
    db.add(db_user)
    await db.flush()
    await db.refresh(db_user)
    logger.info(f"Created new user: discord_id={discord_id}, github_username={github_username}")
    return db_user

async def link_user_github(db: AsyncSession, discord_id: int, github_username: str) -> models.User:
    db_user = await get_user_by_discord_id(db, discord_id)
    if db_user:
        existing_github_link = await get_user_by_github_username(db, github_username)
        if existing_github_link and existing_github_link.discord_id != discord_id:
            raise ValueError(f"GitHub username '{github_username}' is already linked to another Discord user.")
        db_user.github_username = github_username
        db_user.is_verified = False
    else:
        db_user = await create_user(db, discord_id, github_username)
    await db.flush()
    await db.refresh(db_user)
    return db_user

async def verify_user(db: AsyncSession, discord_id: int) -> Optional[models.User]:
    db_user = await get_user_by_discord_id(db, discord_id)
    if db_user and db_user.github_username:
        db_user.is_verified = True
        await db.flush()
        await db.refresh(db_user)
        logger.info(f"Verified user: discord_id={discord_id}")
        return db_user
    return None

# Contribution
async def get_contribution(db: AsyncSession, user_discord_id: int, repo_name: str) -> Optional[models.Contribution]:
    result = await db.execute(
        select(models.Contribution)
        .filter(models.Contribution.user_discord_id == user_discord_id)
        .filter(models.Contribution.repo_name == repo_name)
    )
    return result.scalar_one_or_none()

async def get_all_user_contributions(db: AsyncSession, user_discord_id: int) -> List[models.Contribution]:
    result = await db.execute(select(models.Contribution).filter(models.Contribution.user_discord_id == user_discord_id))
    return result.scalars().all()

async def update_contribution(db: AsyncSession, user_discord_id: int, repo_name: str, event_type: str, count: int = 1) -> models.Contribution:
    contrib = await get_contribution(db, user_discord_id, repo_name)
    if not contrib:
        user = await get_user_by_discord_id(db, user_discord_id)
        if not user:
            logger.error(f"User {user_discord_id} not found.")
            raise ValueError("User not found.")
        contrib = models.Contribution(user_discord_id=user_discord_id, repo_name=repo_name)
        db.add(contrib)
        await db.flush()
    
    if event_type == 'commit':
        contrib.commits = (contrib.commits or 0) + count
    elif event_type == 'pr_merged':
        contrib.merged_prs = (contrib.merged_prs or 0) + count
    elif event_type == 'issue_closed':
        contrib.closed_issues = (contrib.closed_issues or 0) + count
    else:
        logger.warning(f"Unknown event type: {event_type}")
        return contrib
    
    await db.flush()
    await db.refresh(contrib)
    return contrib

# Analytics
async def get_leaderboard(db: AsyncSession, metric: str, limit: int = 10) -> List[Tuple[int, str, int]]:
    metric_column_map = {
        'commits': models.Contribution.commits,
        'merged_prs': models.Contribution.merged_prs,
        'closed_issues': models.Contribution.closed_issues,
    }
    
    if metric not in metric_column_map:
        raise ValueError(f"Invalid metric: {metric}")
    
    metric_column = metric_column_map[metric]
    query = (
        select(models.Contribution.user_discord_id, models.User.github_username, func.sum(metric_column).label('total_metric'))
        .join(models.User, models.Contribution.user_discord_id == models.User.discord_id)
        .group_by(models.Contribution.user_discord_id, models.User.github_username)
        .order_by(func.sum(metric_column).desc())
        .limit(limit)
    )
    
    result = await db.execute(query)
    return result.fetchall()
