"""Pradhan API routes - for managing assigned issues and updating progress"""

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
    IssueCountByType,
    PradhanDashboardStats,
    PradhanInfo,
    PradhanStatusUpdate,
    UserInfo,
)
from app.services.auth import get_current_active_user
from app.services.storage import get_storage_service
from app.settings.config import get_settings

settings = get_settings()
pradhan_router = APIRouter(prefix="/api/pradhan", tags=["Pradhan"])


async def get_pradhan_user(
    current_user: User = Depends(get_current_active_user),
) -> User:
    """
    Dependency to verify user is a Pradhan
    """
    if current_user.role != UserRole.PRADHAN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Pradhan privileges required"
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

@pradhan_router.get(
    "/dashboard",
    response_model=PradhanDashboardStats,
    summary="Get Pradhan dashboard statistics",
)
async def get_pradhan_dashboard(
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Get dashboard statistics for the logged-in Pradhan.
    
    Shows only issues assigned to this Pradhan.
    """
    pradhan_id = pradhan_user.id
    
    # Total assigned to this Pradhan
    total_assigned = session.exec(
        select(func.count(Issue.id)).where(Issue.assigned_pradhan_id == pradhan_id)
    ).one()
    
    # Pending acknowledgement (status = ASSIGNED)
    pending_acknowledgement = session.exec(
        select(func.count(Issue.id)).where(
            Issue.assigned_pradhan_id == pradhan_id,
            Issue.status == IssueStatus.ASSIGNED
        )
    ).one()
    
    # In progress (PRADHAN_CHECK or STARTED_WORKING)
    in_progress = session.exec(
        select(func.count(Issue.id)).where(
            Issue.assigned_pradhan_id == pradhan_id,
            Issue.status.in_([IssueStatus.PRADHAN_CHECK, IssueStatus.STARTED_WORKING])
        )
    ).one()
    
    # Completed
    completed = session.exec(
        select(func.count(Issue.id)).where(
            Issue.assigned_pradhan_id == pradhan_id,
            Issue.status == IssueStatus.FINISHED_WORK
        )
    ).one()
    
    # Issues by type (for this Pradhan)
    issues_by_type = IssueCountByType()
    for issue_type in IssueType:
        count = session.exec(
            select(func.count(Issue.id)).where(
                Issue.assigned_pradhan_id == pradhan_id,
                Issue.issue_type == issue_type
            )
        ).one()
        setattr(issues_by_type, issue_type.value, count)
    
    return PradhanDashboardStats(
        total_assigned=total_assigned,
        pending_acknowledgement=pending_acknowledgement,
        in_progress=in_progress,
        completed=completed,
        issues_by_type=issues_by_type,
    )


# ==================== Issue Management ====================

@pradhan_router.get(
    "/issues",
    response_model=AdminIssueListResponse,
    summary="Get issues assigned to this Pradhan",
)
async def get_my_issues(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    issue_type: Optional[IssueType] = Query(None, description="Filter by issue type"),
    status_filter: Optional[IssueStatus] = Query(None, alias="status", description="Filter by status"),
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Get paginated list of issues assigned to this Pradhan.
    
    **Pradhan Only**: Only sees issues assigned to them.
    """
    pradhan_id = pradhan_user.id
    
    # Build query - only issues assigned to this Pradhan
    query = select(Issue).where(Issue.assigned_pradhan_id == pradhan_id)
    count_query = select(func.count(Issue.id)).where(Issue.assigned_pradhan_id == pradhan_id)
    
    # Apply filters
    if issue_type:
        query = query.where(Issue.issue_type == issue_type)
        count_query = count_query.where(Issue.issue_type == issue_type)
    
    if status_filter:
        query = query.where(Issue.status == status_filter)
        count_query = count_query.where(Issue.status == status_filter)
    
    # Get total count
    total = session.exec(count_query).one()
    
    # Apply pagination and sorting (newest first, then by status priority)
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Issue.updated_at.desc())
    
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


@pradhan_router.get(
    "/issues/pending",
    response_model=AdminIssueListResponse,
    summary="Get pending issues needing acknowledgement",
)
async def get_pending_issues(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Get issues that are newly assigned and need acknowledgement.
    
    These are issues with status = ASSIGNED that the Pradhan hasn't started yet.
    """
    pradhan_id = pradhan_user.id
    
    query = select(Issue).where(
        Issue.assigned_pradhan_id == pradhan_id,
        Issue.status == IssueStatus.ASSIGNED
    )
    count_query = select(func.count(Issue.id)).where(
        Issue.assigned_pradhan_id == pradhan_id,
        Issue.status == IssueStatus.ASSIGNED
    )
    
    total = session.exec(count_query).one()
    
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size).order_by(Issue.created_at.asc())  # Oldest first
    
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


@pradhan_router.get(
    "/issues/{issue_id}",
    response_model=AdminIssueResponse,
    summary="Get issue details",
)
async def get_issue_detail(
    issue_id: int,
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Get detailed information about a specific assigned issue.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    # Verify issue is assigned to this Pradhan
    if issue.assigned_pradhan_id != pradhan_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This issue is not assigned to you"
        )
    
    return build_issue_response(issue, session)


@pradhan_router.patch(
    "/issues/{issue_id}/status",
    response_model=AdminIssueResponse,
    summary="Update issue status and progress",
)
async def update_issue_status(
    issue_id: int,
    status_update: PradhanStatusUpdate,
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Update the status of an assigned issue.
    
    **Pradhan Only**: Can only update issues assigned to them.
    
    Valid status transitions:
    - ASSIGNED → PRADHAN_CHECK (acknowledge receipt)
    - PRADHAN_CHECK → STARTED_WORKING (begin work)
    - STARTED_WORKING → FINISHED_WORK (complete work)
    
    - **status**: New status
    - **progress_notes**: Notes about the progress/work done
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    # Verify issue is assigned to this Pradhan
    if issue.assigned_pradhan_id != pradhan_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This issue is not assigned to you"
        )
    
    # Validate status transition
    valid_transitions = {
        IssueStatus.ASSIGNED: [IssueStatus.PRADHAN_CHECK],
        IssueStatus.PRADHAN_CHECK: [IssueStatus.STARTED_WORKING],
        IssueStatus.STARTED_WORKING: [IssueStatus.FINISHED_WORK],
        IssueStatus.FINISHED_WORK: [],  # Cannot change after completion
    }
    
    # Also allow REPORTED -> PRADHAN_CHECK for backward compatibility
    if issue.status == IssueStatus.REPORTED:
        valid_transitions[IssueStatus.REPORTED] = [IssueStatus.PRADHAN_CHECK]
    
    allowed_statuses = valid_transitions.get(issue.status, [])
    
    if status_update.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot transition from {issue.status.value} to {status_update.status.value}. "
                   f"Allowed: {[s.value for s in allowed_statuses]}"
        )
    
    # Update status and notes
    issue.status = status_update.status
    
    if status_update.progress_notes:
        # Append to existing notes with timestamp
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
        new_note = f"[{timestamp}] {status_update.progress_notes}"
        
        if issue.progress_notes:
            issue.progress_notes = f"{issue.progress_notes}\n\n{new_note}"
        else:
            issue.progress_notes = new_note
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)


@pradhan_router.post(
    "/issues/{issue_id}/acknowledge",
    response_model=AdminIssueResponse,
    summary="Acknowledge an assigned issue",
)
async def acknowledge_issue(
    issue_id: int,
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Quick action to acknowledge a newly assigned issue.
    
    Changes status from ASSIGNED to PRADHAN_CHECK.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    if issue.assigned_pradhan_id != pradhan_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This issue is not assigned to you"
        )
    
    if issue.status != IssueStatus.ASSIGNED:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Issue is already acknowledged (status: {issue.status.value})"
        )
    
    issue.status = IssueStatus.PRADHAN_CHECK
    
    # Add acknowledgement note
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    ack_note = f"[{timestamp}] Issue acknowledged by Pradhan"
    issue.progress_notes = ack_note
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)


@pradhan_router.post(
    "/issues/{issue_id}/start-work",
    response_model=AdminIssueResponse,
    summary="Start working on an issue",
)
async def start_work(
    issue_id: int,
    notes: Optional[str] = Query(None, description="Notes about starting work"),
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Quick action to mark that work has started on an issue.
    
    Changes status from PRADHAN_CHECK to STARTED_WORKING.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    if issue.assigned_pradhan_id != pradhan_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This issue is not assigned to you"
        )
    
    if issue.status != IssueStatus.PRADHAN_CHECK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot start work from status: {issue.status.value}. Must be in pradhan_check status."
        )
    
    issue.status = IssueStatus.STARTED_WORKING
    
    # Add work start note
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    note = f"[{timestamp}] Work started"
    if notes:
        note += f": {notes}"
    
    if issue.progress_notes:
        issue.progress_notes = f"{issue.progress_notes}\n\n{note}"
    else:
        issue.progress_notes = note
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)


@pradhan_router.post(
    "/issues/{issue_id}/complete",
    response_model=AdminIssueResponse,
    summary="Mark issue as completed",
)
async def complete_issue(
    issue_id: int,
    notes: Optional[str] = Query(None, description="Completion notes"),
    pradhan_user: User = Depends(get_pradhan_user),
    session: Session = Depends(get_session),
):
    """
    Quick action to mark an issue as completed.
    
    Changes status from STARTED_WORKING to FINISHED_WORK.
    """
    issue = session.get(Issue, issue_id)
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    if issue.assigned_pradhan_id != pradhan_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This issue is not assigned to you"
        )
    
    if issue.status != IssueStatus.STARTED_WORKING:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete from status: {issue.status.value}. Must be in started_working status."
        )
    
    issue.status = IssueStatus.FINISHED_WORK
    
    # Add completion note
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M")
    note = f"[{timestamp}] Work completed"
    if notes:
        note += f": {notes}"
    
    if issue.progress_notes:
        issue.progress_notes = f"{issue.progress_notes}\n\n{note}"
    else:
        issue.progress_notes = note
    
    session.add(issue)
    session.commit()
    session.refresh(issue)
    
    return build_issue_response(issue, session)
