from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import Column, DateTime, func
from sqlmodel import Field, Relationship, SQLModel


class IssueType(str, Enum):
    """Enum for different types of issues"""

    WATER = "water"
    ELECTRICITY = "electricity"
    ROAD = "road"
    GARBAGE = "garbage"


class IssueStatus(str, Enum):
    """Enum for issue status"""

    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class Issue(SQLModel, table=True):
    """Main issue/report model"""

    __tablename__ = "issues"

    id: Optional[int] = Field(default=None, primary_key=True)
    issue_type: IssueType = Field(index=True)
    description: str = Field(min_length=10, max_length=2000)

    # Location data
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)

    # Status
    status: IssueStatus = Field(default=IssueStatus.PENDING, index=True)

    # User ID (for future auth implementation)
    user_id: Optional[int] = Field(default=None, foreign_key="users.id", index=True)

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )

    # Relationships
    photos: list["IssuePhoto"] = Relationship(
        back_populates="issue", cascade_delete=True
    )


class IssuePhoto(SQLModel, table=True):
    """Model for issue photos"""

    __tablename__ = "issue_photos"

    id: Optional[int] = Field(default=None, primary_key=True)
    issue_id: int = Field(foreign_key="issues.id", index=True)

    # MinIO/S3 path
    photo_url: str = Field(max_length=500)

    # Original filename
    filename: str = Field(max_length=255)

    # File metadata
    file_size: int  # in bytes
    content_type: str = Field(default="image/jpeg")

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )

    # Relationships
    issue: Optional[Issue] = Relationship(back_populates="photos")


class User(SQLModel, table=True):
    """User model for authentication"""

    __tablename__ = "users"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    mobile_number: str = Field(unique=True, index=True, max_length=15)
    
    # Authentication
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)

    # Timestamps
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )
    )


class OTP(SQLModel, table=True):
    """OTP model for phone verification"""
    
    __tablename__ = "otps"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    mobile_number: str = Field(index=True, max_length=15)
    otp_code: str = Field(max_length=6)
    
    # OTP metadata
    is_used: bool = Field(default=False)
    attempt_count: int = Field(default=0)
    
    # Timestamps
    expires_at: datetime = Field()
    created_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True), server_default=func.now(), nullable=False
        )
    )
    used_at: Optional[datetime] = Field(default=None)
