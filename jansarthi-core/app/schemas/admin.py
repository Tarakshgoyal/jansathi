"""Schemas for admin operations - Pradhan and PWD Worker"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.models.issue import IssueStatus, IssueType, UserRole


# ==================== Common Schemas ====================

class IssueCountByType(BaseModel):
    """Count of issues by type"""
    water: int = 0
    electricity: int = 0
    road: int = 0
    garbage: int = 0


class IssueCountByStatus(BaseModel):
    """Count of issues by status"""
    reported: int = 0
    assigned: int = 0
    pradhan_check: int = 0
    started_working: int = 0
    finished_work: int = 0


# ==================== User/Pradhan Schemas ====================

class PradhanInfo(BaseModel):
    """Basic Pradhan info for issue assignment"""
    id: int
    name: str
    mobile_number: str
    village_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    class Config:
        from_attributes = True


class PradhanListResponse(BaseModel):
    """List of available Pradhans"""
    items: list[PradhanInfo]
    total: int


class UserInfo(BaseModel):
    """Basic user info who reported issue"""
    id: int
    name: str
    mobile_number: str
    
    class Config:
        from_attributes = True


class AdminUserResponse(BaseModel):
    """Admin view of user details"""
    id: int
    name: str
    mobile_number: str
    role: UserRole
    is_active: bool
    is_verified: bool
    village_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    total_reports: int = 0
    assigned_issues: int = 0  # For Pradhans

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    """Paginated list of users"""
    items: list[AdminUserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UserRoleUpdate(BaseModel):
    """Update user role and details"""
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    village_name: Optional[str] = Field(None, max_length=255)
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)


# ==================== Issue Schemas for Admin ====================

class AdminIssueResponse(BaseModel):
    """Admin view of issue with full details"""
    id: int
    issue_type: IssueType
    description: str
    latitude: float
    longitude: float
    status: IssueStatus
    
    # Reporter info
    user_id: Optional[int]
    reporter: Optional[UserInfo] = None
    
    # Assignment info
    assigned_pradhan_id: Optional[int] = None
    assigned_pradhan: Optional[PradhanInfo] = None
    assignment_notes: Optional[str] = None
    
    # Progress
    progress_notes: Optional[str] = None
    
    created_at: datetime
    updated_at: datetime
    photo_count: int = 0

    class Config:
        from_attributes = True


class AdminIssueListResponse(BaseModel):
    """Paginated list of issues for admin"""
    items: list[AdminIssueResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==================== PWD Worker Schemas ====================

class PWDDashboardStats(BaseModel):
    """Dashboard statistics for PWD Worker"""
    total_issues: int
    unassigned_issues: int  # Issues that need Pradhan assignment
    assigned_issues: int
    in_progress_issues: int
    completed_issues: int
    total_pradhans: int
    active_pradhans: int  # Pradhans with ongoing work
    issues_by_type: IssueCountByType
    issues_by_status: IssueCountByStatus
    issues_today: int
    issues_this_week: int


class AssignPradhanRequest(BaseModel):
    """Request to assign a Pradhan to an issue"""
    pradhan_id: int
    assignment_notes: Optional[str] = Field(None, max_length=1000)


class PWDStatusUpdate(BaseModel):
    """PWD can reassign or add notes"""
    assigned_pradhan_id: Optional[int] = None
    assignment_notes: Optional[str] = Field(None, max_length=1000)


# ==================== Pradhan Schemas ====================

class PradhanDashboardStats(BaseModel):
    """Dashboard statistics for Pradhan"""
    total_assigned: int
    pending_acknowledgement: int  # Status = ASSIGNED
    in_progress: int  # Status = PRADHAN_CHECK or STARTED_WORKING
    completed: int  # Status = FINISHED_WORK
    issues_by_type: IssueCountByType


class PradhanStatusUpdate(BaseModel):
    """Pradhan updates issue status and progress"""
    status: IssueStatus = Field(
        ...,
        description="New status (pradhan_check, started_working, finished_work)"
    )
    progress_notes: Optional[str] = Field(None, max_length=2000)
