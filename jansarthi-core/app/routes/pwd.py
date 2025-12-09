"""PWD Worker API routes - for assigning Pradhans and monitoring issues"""

import math
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, func, select

from app.database import get_session
from app.models.issue import Issue, IssueStatus, IssueType, User, UserRole
from app.schemas.admin import (
    AdminIssueListResponse,
    AdminIssueResponse,
    AdminUserResponse,
    AssignPradhanRequest,
    IssueCountByStatus,
    IssueCountByType,
    PradhanInfo,
    PradhanListResponse,
    PWDDashboardStats,
    PWDStatusUpdate,
    UserInfo,
    UserListResponse,
    UserRoleUpdate,
)
from app.services.auth import get_current_active_user
from app.services.storage import get_storage_service
from app.settings.config import get_settings

settings = get_settings()
pwd_router = APIRouter(prefix="/api/pwd", tags=["PWD Worker"])


async def get_pwd_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Dependency to verify user is a PWD Worker
    """
    if current_user.role != UserRole.PWD_WORKER:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PWD Worker privileges required"
        )
    return current_user


def build_issue_response(issue: Issue, session: Session) -> AdminIssueResponse:
    """Helper to build AdminIssueResponse with related data"""
    reporter = None
    if issue.user_id:
        user = session.get(User, issue.user_id)
        if user:
            reporter = UserInfo(id=user.id, name=user.name, mobile_number=user.mobile_number)
    
    assigned_pradhan = None
    if issue.assigned_pradhan_id:
        pradhan = session.get(User, issue.assigned_pradhan_id)
        if pradhan:
            assigned_pradhan = PradhanInfo(
                id=pradhan.id,
                name=pradhan.name,
                mobile_number=pradhan.mobile_number,
                village_name=pradhan.village_name,
                latitude=pradhan.latitude,
                longitude=pradhan.longitude,
            )
    
    return AdminIssueResponse(
        id=issue.id,
        issue_type=issue.issue_type,
        description=issue.description,
        latitude=issue.latitude,
        longitude=issue.longitude,
        status=issue.status,
        user_id=issue.user_id,
        reporter=reporter,
        assigned_pradhan_id=issue.assigned_pradhan_id,
        assigned_pradhan=assigned_pradhan,
        assignment_notes=issue.assignment_notes,
        progress_notes=issue.progress_notes,
        created_at=issue.created_at,
        updated_at=issue.updated_at,
        photo_count=len(issue.photos),
    )


# ==================== Dashboard ====================

@pwd_router.get(
    "/dashboard",
    response_model=PWDDashboardStats,
    summary="Get PWD Worker dashboard statistics",
)
async def get_pwd_dashboard(
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get comprehensive dashboard statistics for PWD Worker.
    
    Shows overview of all issues, assignment status, and Pradhan activity.
    """
    # Total issues
    total_issues = session.exec(select(func.count(Issue.id))).one()
    
    # Unassigned issues (reported but no pradhan assigned)
    unassigned_issues = session.exec(
        select(func.count(Issue.id)).where(
            Issue.status == IssueStatus.REPORTED,
            Issue.assigned_pradhan_id == None
        )
    ).one()
    
    # Assigned issues (has pradhan but not yet acknowledged)
    assigned_issues = session.exec(
        select(func.count(Issue.id)).where(Issue.status == IssueStatus.ASSIGNED)
    ).one()
    
    # In progress (pradhan_check or started_working)
    in_progress_issues = session.exec(
        select(func.count(Issue.id)).where(
            Issue.status.in_([IssueStatus.PRADHAN_CHECK, IssueStatus.STARTED_WORKING])
        )
    ).one()
    
    # Completed
    completed_issues = session.exec(
        select(func.count(Issue.id)).where(Issue.status == IssueStatus.FINISHED_WORK)
    ).one()
    
    # Total Pradhans
    total_pradhans = session.exec(
        select(func.count(User.id)).where(
            User.role == UserRole.PRADHAN,
            User.is_active == True
        )
    ).one()
    
    # Active Pradhans (with ongoing work)
    active_pradhans = session.exec(
        select(func.count(func.distinct(Issue.assigned_pradhan_id))).where(
            Issue.status.in_([IssueStatus.ASSIGNED, IssueStatus.PRADHAN_CHECK, IssueStatus.STARTED_WORKING])
        )
    ).one()
    
    # Issues by type
    issues_by_type = IssueCountByType()
    for issue_type in IssueType:
        count = session.exec(
            select(func.count(Issue.id)).where(Issue.issue_type == issue_type)
        ).one()
        setattr(issues_by_type, issue_type.value, count)
    
    # Issues by status
    issues_by_status = IssueCountByStatus()
    for issue_status in IssueStatus:
        count = session.exec(
            select(func.count(Issue.id)).where(Issue.status == issue_status)
        ).one()
        setattr(issues_by_status, issue_status.value, count)
    
    # Time-based counts
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    
    issues_today = session.exec(
        select(func.count(Issue.id)).where(Issue.created_at >= today_start)
    ).one()
    
    issues_this_week = session.exec(
        select(func.count(Issue.id)).where(Issue.created_at >= week_start)
    ).one()
    
    return PWDDashboardStats(
        total_issues=total_issues,
        unassigned_issues=unassigned_issues,
        assigned_issues=assigned_issues,
        in_progress_issues=in_progress_issues,
        completed_issues=completed_issues,
        total_pradhans=total_pradhans,
        active_pradhans=active_pradhans,
        issues_by_type=issues_by_type,
        issues_by_status=issues_by_status,
        issues_today=issues_today,
        issues_this_week=issues_this_week,
    )


# ==================== Issue Management ====================

@pwd_router.get(
    "/issues",
    response_model=AdminIssueListResponse,
    summary="Get all issues",
)
async def get_all_issues(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    issue_type: Optional[IssueType] = Query(None, description="Filter by issue type"),
    status_filter: Optional[IssueStatus] = Query(None, alias="status", description="Filter by status"),
    assigned: Optional[bool] = Query(None, description="Filter by assignment status (true=assigned, false=unassigned)"),
    pradhan_id: Optional[int] = Query(None, description="Filter by assigned Pradhan"),
    search: Optional[str] = Query(None, description="Search in description"),
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get paginated list of all issues with filtering options.
    
    **PWD Worker Only**: View all reported issues and their assignment status.
    """
    # Build query
    query = select(Issue)
    count_query = select(func.count(Issue.id))
    
    # Apply filters
    if issue_type:
        query = query.where(Issue.issue_type == issue_type)
        count_query = count_query.where(Issue.issue_type == issue_type)
    
    if status_filter:
        query = query.where(Issue.status == status_filter)
        count_query = count_query.where(Issue.status == status_filter)
    
    if assigned is not None:
        if assigned:
            query = query.where(Issue.assigned_pradhan_id != None)
            count_query = count_query.where(Issue.assigned_pradhan_id != None)
        else:
            query = query.where(Issue.assigned_pradhan_id == None)
            count_query = count_query.where(Issue.assigned_pradhan_id == None)
    
    if pradhan_id:
        query = query.where(Issue.assigned_pradhan_id == pradhan_id)
        count_query = count_query.where(Issue.assigned_pradhan_id == pradhan_id)
    
    if search:
        query = query.where(Issue.description.contains(search))
        count_query = count_query.where(Issue.description.contains(search))
    
    # Get total count
    total = session.exec(count_query).one()
    
    # Apply pagination and sorting
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Issue.created_at.desc())
    
    issues = session.exec(query).all()
    
    # Build response
    items = [build_issue_response(issue, session) for issue in issues]
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return AdminIssueListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@pwd_router.get(
    "/issues/{issue_id}",
    response_model=AdminIssueResponse,
    summary="Get issue details",
)
async def get_issue_detail(
    issue_id: int,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get detailed information about a specific issue.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    return build_issue_response(issue, session)


@pwd_router.post(
    "/issues/{issue_id}/assign",
    response_model=AdminIssueResponse,
    summary="Assign Pradhan to an issue",
)
async def assign_pradhan(
    issue_id: int,
    assignment: AssignPradhanRequest,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Assign a Pradhan to handle an issue.
    
    **PWD Worker Only**: Assign or reassign Pradhans to issues.
    
    - **pradhan_id**: ID of the Pradhan to assign
    - **assignment_notes**: Optional notes for the Pradhan
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    # Verify Pradhan exists and is active
    pradhan = session.get(User, assignment.pradhan_id)
    
    if not pradhan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Pradhan with id {assignment.pradhan_id} not found"
        )
    
    if pradhan.role != UserRole.PRADHAN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected user is not a Pradhan"
        )
    
    if not pradhan.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Selected Pradhan is not active"
        )
    
    # Assign Pradhan
    issue.assigned_pradhan_id = assignment.pradhan_id
    issue.assignment_notes = assignment.assignment_notes
    issue.status = IssueStatus.ASSIGNED
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)


@pwd_router.patch(
    "/issues/{issue_id}",
    response_model=AdminIssueResponse,
    summary="Update issue assignment",
)
async def update_issue_assignment(
    issue_id: int,
    update_data: PWDStatusUpdate,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Update issue assignment (reassign Pradhan or update notes).
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    if update_data.assigned_pradhan_id is not None:
        # Verify new Pradhan
        pradhan = session.get(User, update_data.assigned_pradhan_id)
        
        if not pradhan or pradhan.role != UserRole.PRADHAN:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Pradhan ID"
            )
        
        issue.assigned_pradhan_id = update_data.assigned_pradhan_id
        issue.status = IssueStatus.ASSIGNED  # Reset status on reassignment
    
    if update_data.assignment_notes is not None:
        issue.assignment_notes = update_data.assignment_notes
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)


# ==================== Pradhan Management ====================

@pwd_router.get(
    "/pradhans",
    response_model=PradhanListResponse,
    summary="Get all Pradhans",
)
async def get_all_pradhans(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search by name or village"),
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get list of all Pradhans for assignment.
    """
    query = select(User).where(User.role == UserRole.PRADHAN)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
    
    if search:
        query = query.where(
            (User.name.contains(search)) | (User.village_name.contains(search))
        )
    
    pradhans = session.exec(query.order_by(User.name)).all()
    
    items = [
        PradhanInfo(
            id=p.id,
            name=p.name,
            mobile_number=p.mobile_number,
            village_name=p.village_name,
            latitude=p.latitude,
            longitude=p.longitude,
        )
        for p in pradhans
    ]
    
    return PradhanListResponse(items=items, total=len(items))


@pwd_router.get(
    "/pradhans/{pradhan_id}/issues",
    response_model=AdminIssueListResponse,
    summary="Get issues assigned to a Pradhan",
)
async def get_pradhan_issues(
    pradhan_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[IssueStatus] = Query(None, alias="status"),
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get all issues assigned to a specific Pradhan.
    
    Useful for monitoring Pradhan workload and performance.
    """
    # Verify Pradhan exists
    pradhan = session.get(User, pradhan_id)
    if not pradhan or pradhan.role != UserRole.PRADHAN:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pradhan not found"
        )
    
    # Build query
    query = select(Issue).where(Issue.assigned_pradhan_id == pradhan_id)
    count_query = select(func.count(Issue.id)).where(Issue.assigned_pradhan_id == pradhan_id)
    
    if status_filter:
        query = query.where(Issue.status == status_filter)
        count_query = count_query.where(Issue.status == status_filter)
    
    total = session.exec(count_query).one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Issue.updated_at.desc())
    
    issues = session.exec(query).all()
    items = [build_issue_response(issue, session) for issue in issues]
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return AdminIssueListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


# ==================== User Management ====================

@pwd_router.get(
    "/users",
    response_model=UserListResponse,
    summary="Get all users",
)
async def get_all_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None),
    search: Optional[str] = Query(None),
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Get paginated list of all users.
    """
    query = select(User)
    count_query = select(func.count(User.id))
    
    if role:
        query = query.where(User.role == role)
        count_query = count_query.where(User.role == role)
    
    if is_active is not None:
        query = query.where(User.is_active == is_active)
        count_query = count_query.where(User.is_active == is_active)
    
    if search:
        query = query.where(
            (User.name.contains(search)) | (User.mobile_number.contains(search))
        )
        count_query = count_query.where(
            (User.name.contains(search)) | (User.mobile_number.contains(search))
        )
    
    total = session.exec(count_query).one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(User.created_at.desc())
    
    users = session.exec(query).all()
    
    items = []
    for user in users:
        report_count = session.exec(
            select(func.count(Issue.id)).where(Issue.user_id == user.id)
        ).one()
        
        assigned_count = 0
        if user.role == UserRole.PRADHAN:
            assigned_count = session.exec(
                select(func.count(Issue.id)).where(Issue.assigned_pradhan_id == user.id)
            ).one()
        
        items.append(AdminUserResponse(
            id=user.id,
            name=user.name,
            mobile_number=user.mobile_number,
            role=user.role,
            is_active=user.is_active,
            is_verified=user.is_verified,
            village_name=user.village_name,
            latitude=user.latitude,
            longitude=user.longitude,
            created_at=user.created_at,
            updated_at=user.updated_at,
            total_reports=report_count,
            assigned_issues=assigned_count,
        ))
    
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return UserListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@pwd_router.patch(
    "/users/{user_id}",
    response_model=AdminUserResponse,
    summary="Update user role and details",
)
async def update_user(
    user_id: int,
    update_data: UserRoleUpdate,
    pwd_user: User = Depends(get_pwd_user),
    session: Session = Depends(get_session),
):
    """
    Update user role, status, or location details.
    
    Use this to:
    - Promote a user to Pradhan
    - Set Pradhan's village and location
    - Activate/deactivate users
    """
    user = session.get(User, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Cannot modify PWD workers (only another PWD can do this via DB)
    if user.role == UserRole.PWD_WORKER and user.id != pwd_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify other PWD workers"
        )
    
    if update_data.role is not None:
        # Cannot make someone a PWD worker via API
        if update_data.role == UserRole.PWD_WORKER:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot assign PWD Worker role via API"
            )
        user.role = update_data.role
    
    if update_data.is_active is not None:
        user.is_active = update_data.is_active
    
    if update_data.village_name is not None:
        user.village_name = update_data.village_name
    
    if update_data.latitude is not None:
        user.latitude = update_data.latitude
    
    if update_data.longitude is not None:
        user.longitude = update_data.longitude
    
    session.add(user)
    session.commit()
    session.refresh(user)
    
    report_count = session.exec(
        select(func.count(Issue.id)).where(Issue.user_id == user.id)
    ).one()
    
    assigned_count = 0
    if user.role == UserRole.PRADHAN:
        assigned_count = session.exec(
            select(func.count(Issue.id)).where(Issue.assigned_pradhan_id == user.id)
        ).one()
    
    return AdminUserResponse(
        id=user.id,
        name=user.name,
        mobile_number=user.mobile_number,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        village_name=user.village_name,
        latitude=user.latitude,
        longitude=user.longitude,
        created_at=user.created_at,
        updated_at=user.updated_at,
        total_reports=report_count,
        assigned_issues=assigned_count,
    )
