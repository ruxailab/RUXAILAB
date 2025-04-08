from sqlalchemy import select, update, func, delete, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from typing import Optional, List, Tuple
import datetime

from . import models
import logging

logger = logging.getLogger(__name__)

async def get_user_by_discord_id(db: AsyncSession, discord_id: int) -> Optional[models.User]:
    result = await db.execute(select(models.User).filter(models.User.discord_id == discord_id))
    return result.scalar_one_or_none()

async def get_user_by_github_username(db: AsyncSession, github_username: str) -> Optional[models.User]:
    result = await db.execute(
        select(models.User).filter(func.lower(models.User.github_username) == github_username.lower())
    )
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
             raise ValueError(f"GitHub username '{github_username}' is already linked to another Discord user ({existing_github_link.discord_id}).")

        db_user.github_username = github_username
        db_user.is_verified = False
        logger.info(f"Linking GitHub username '{github_username}' to discord_id={discord_id}. Verification needed.")
    else:
        existing_github_link = await get_user_by_github_username(db, github_username)
        if existing_github_link:
             raise ValueError(f"GitHub username '{github_username}' is already linked to Discord user ({existing_github_link.discord_id}).")
        db_user = await create_user(db, discord_id, github_username)
        logger.info(f"Created new user and linking GitHub username '{github_username}' to discord_id={discord_id}. Verification needed.")

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
    elif not db_user:
         logger.warning(f"Verification failed: User not found for discord_id={discord_id}")
         return None
    else:
        logger.warning(f"Verification failed: No GitHub username linked for discord_id={discord_id}")
        return None


#Contribution
async def get_contribution(db: AsyncSession, user_discord_id: int, repo_name: str) -> Optional[models.Contribution]:
    result = await db.execute(
        select(models.Contribution)
        .filter(models.Contribution.user_discord_id == user_discord_id)
        .filter(models.Contribution.repo_name == repo_name)
    )
    return result.scalar_one_or_none()

async def get_all_user_contributions(db: AsyncSession, user_discord_id: int) -> List[models.Contribution]:
    # ... (same as before)
    result = await db.execute(
        select(models.Contribution).filter(models.Contribution.user_discord_id == user_discord_id)
    )
    return result.scalars().all()

async def update_contribution(db: AsyncSession, user_discord_id: int, repo_name: str, event_type: str, count: int = 1) -> models.Contribution:
    """Increment contribution count for a user/repo. Creates record if not exists."""
    contrib = await get_contribution(db, user_discord_id, repo_name)
    if not contrib:
        user = await get_user_by_discord_id(db, user_discord_id)
        if not user:
             logger.error(f"Cannot update contribution for non-existent user: discord_id={user_discord_id}")
             raise ValueError(f"User with discord_id {user_discord_id} not found.")

        contrib = models.Contribution(user_discord_id=user_discord_id, repo_name=repo_name)
        db.add(contrib)
        await db.flush() # Flush to get object in session before update
        logger.info(f"Created new contribution record for user {user_discord_id} on repo {repo_name}")

    # Increment the appropriate counter
    updated = False
    if event_type == 'commit':
        contrib.commits = (contrib.commits or 0) + count
        updated = True
    elif event_type == 'pr_merged':
        contrib.merged_prs = (contrib.merged_prs or 0) + count
        updated = True
    elif event_type == 'issue_closed':
        contrib.closed_issues = (contrib.closed_issues or 0) + count
        updated = True
    elif event_type == 'pr_review': 
         contrib.reviewed_prs = (contrib.reviewed_prs or 0) + count
         updated = True
    else:
        logger.warning(f"Unknown event type for contribution update: {event_type}")

    if updated:
        logger.info(f"Updated contribution for user {user_discord_id}, repo {repo_name}: {event_type} +{count}")
        await db.flush()
        await db.refresh(contrib)
    else:
        await db.refresh(contrib)
    return contrib

#Analytics 
async def get_leaderboard(db: AsyncSession, metric: str, limit: int = 10) -> List[Tuple[int, str, int]]:
    """Get top contributors based on a specific metric."""
    metric_column_map = {
        'commits': models.Contribution.commits,
        'merged_prs': models.Contribution.merged_prs,
        'closed_issues': models.Contribution.closed_issues,
        'reviewed_prs': models.Contribution.reviewed_prs, 
    }
    if metric not in metric_column_map:
        raise ValueError(f"Invalid metric for leaderboard: {metric}. Use one of {list(metric_column_map.keys())}")

    metric_column = metric_column_map[metric]

    query = (
        select(
            models.Contribution.user_discord_id,
            models.User.github_username,
            func.sum(metric_column).label('total_metric')
        )
        .join(models.User, models.Contribution.user_discord_id == models.User.discord_id)
        .filter(metric_column > 0)
        .group_by(models.Contribution.user_discord_id, models.User.github_username)
        .order_by(func.sum(metric_column).desc())
        .limit(limit)
    )
    result = await db.execute(query)
    leaderboard_data = result.fetchall()
    logger.info(f"Fetched leaderboard for metric '{metric}': {len(leaderboard_data)} results.")
    return leaderboard_data


async def get_contributions_since(db: AsyncSession, start_date: datetime.datetime) -> List[models.Contribution]:
    """Fetch all contributions updated since a specific date (for weekly summary)."""
    result = await db.execute(
        select(models.Contribution)
        .options(selectinload(models.Contribution.user))
        .filter(models.Contribution.last_updated >= start_date)
    )
    return result.scalars().unique().all()