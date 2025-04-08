from sqlalchemy import Integer, String, Boolean, BigInteger, ForeignKey, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional
import datetime

from .database import Base

class User(Base):
    """Represents a Discord user with an optional GitHub link"""
    __tablename__ = "users"

    # Primary user identification
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    discord_id: Mapped[int] = mapped_column(BigInteger, unique=True, index=True, nullable=False)
    github_username: Mapped[Optional[str]] = mapped_column(String, unique=True, index=True, nullable=True)
    
    # User status
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(TIMESTAMP, server_default=func.now())

    # Relationships
    contributions: Mapped[list["Contribution"]] = relationship("Contribution", back_populates="user")

class Contribution(Base):
    """Tracks GitHub contributions per user and repository"""
    __tablename__ = "contributions"

    # Primary identification
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_discord_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.discord_id"), index=True)
    repo_name: Mapped[str] = mapped_column(String, index=True)

    # Contribution metrics
    commits: Mapped[int] = mapped_column(Integer, default=0)
    merged_prs: Mapped[int] = mapped_column(Integer, default=0)
    closed_issues: Mapped[int] = mapped_column(Integer, default=0)
    reviewed_prs: Mapped[int] = mapped_column(Integer, default=0)
    
    # Tracking
    last_updated: Mapped[datetime.datetime] = mapped_column(
        TIMESTAMP, 
        server_default=func.now(), 
        onupdate=func.now()
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="contributions")