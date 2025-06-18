"""
Lab Order API endpoints.
"""
from datetime import date, datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from ...core.database import get_session
from ...models.lab_order import (
    LabOrder, LabOrderItem, LabTest, LabResult,
    LabOrderCreate, LabOrderResponse, LabOrderUpdate,
    LabTestCreate, LabTestResponse,
    LabOrderItemCreate, LabOrderItemResponse,
    LabResultCreate, LabResultResponse,
    LabOrderStatus, LabOrderPriority, LabTestCategory
)
from ...models.patient import Patient

router = APIRouter()


@router.post("/", response_model=LabOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_order(
    order_data: LabOrderCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a new lab order."""
    
    # Verify patient exists
    patient_query = select(Patient).where(Patient.id == order_data.patient_id)
    patient_result = await session.exec(patient_query)
    patient = patient_result.first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create lab order
    lab_order = LabOrder.model_validate(order_data.model_dump(exclude={"items"}))
    session.add(lab_order)
    await session.commit()
    await session.refresh(lab_order)
    
    # Create lab order items
    for item_data in order_data.items:
        # Verify lab test exists
        test_query = select(LabTest).where(LabTest.id == item_data.lab_test_id)
        test_result = await session.exec(test_query)
        lab_test = test_result.first()
        
        if not lab_test:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lab test with ID {item_data.lab_test_id} not found"
            )
        
        item = LabOrderItem(
            lab_order_id=lab_order.id,
            **item_data.model_dump()
        )
        session.add(item)
    
    await session.commit()
    
    # Reload with relationships
    order_query = select(LabOrder).options(
        selectinload(LabOrder.items).selectinload(LabOrderItem.lab_test)
    ).where(LabOrder.id == lab_order.id)
    result = await session.exec(order_query)
    lab_order = result.first()
    
    return lab_order


@router.get("/", response_model=List[LabOrderResponse])
async def get_lab_orders(
    patient_id: Optional[UUID] = Query(None),
    status: Optional[LabOrderStatus] = Query(None),
    priority: Optional[LabOrderPriority] = Query(None),
    ordered_by: Optional[str] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    session: AsyncSession = Depends(get_session)
):
    """Get lab orders with filtering."""
    
    query = select(LabOrder).options(
        selectinload(LabOrder.items).selectinload(LabOrderItem.lab_test)
    )
    
    # Apply filters
    filters = []
    if patient_id:
        filters.append(LabOrder.patient_id == patient_id)
    if status:
        filters.append(LabOrder.status == status)
    if priority:
        filters.append(LabOrder.priority == priority)
    if ordered_by:
        filters.append(LabOrder.ordered_by.ilike(f"%{ordered_by}%"))
    if date_from:
        filters.append(LabOrder.ordered_date >= date_from)
    if date_to:
        filters.append(LabOrder.ordered_date <= date_to)
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.limit(limit).order_by(LabOrder.created_at.desc())
    
    result = await session.exec(query)
    lab_orders = result.all()
    
    return lab_orders


@router.get("/{order_id}", response_model=LabOrderResponse)
async def get_lab_order(
    order_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get a specific lab order by ID."""
    
    query = select(LabOrder).options(
        selectinload(LabOrder.items).selectinload(LabOrderItem.lab_test)
    ).where(LabOrder.id == order_id)
    
    result = await session.exec(query)
    lab_order = result.first()
    
    if not lab_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab order not found"
        )
    
    return lab_order


@router.patch("/{order_id}", response_model=LabOrderResponse)
async def update_lab_order(
    order_id: int,
    order_data: LabOrderUpdate,
    session: AsyncSession = Depends(get_session)
):
    """Update a lab order."""
    
    query = select(LabOrder).where(LabOrder.id == order_id)
    result = await session.exec(query)
    lab_order = result.first()
    
    if not lab_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab order not found"
        )
    
    # Update fields
    update_data = order_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lab_order, field, value)
    
    lab_order.updated_at = datetime.now()
    await session.commit()
    await session.refresh(lab_order)
    
    return lab_order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_lab_order(
    order_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Cancel a lab order."""
    
    query = select(LabOrder).where(LabOrder.id == order_id)
    result = await session.exec(query)
    lab_order = result.first()
    
    if not lab_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab order not found"
        )
    
    lab_order.status = LabOrderStatus.CANCELLED
    lab_order.updated_at = datetime.now()
    await session.commit()


# Lab Tests endpoints
@router.post("/tests/", response_model=LabTestResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_test(
    test_data: LabTestCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a new lab test."""
    
    lab_test = LabTest.model_validate(test_data)
    session.add(lab_test)
    await session.commit()
    await session.refresh(lab_test)
    
    return lab_test


@router.get("/tests/", response_model=List[LabTestResponse])
async def get_lab_tests(
    category: Optional[LabTestCategory] = Query(None),
    name: Optional[str] = Query(None),
    code: Optional[str] = Query(None),
    active_only: bool = Query(True),
    limit: int = Query(100, ge=1, le=500),
    session: AsyncSession = Depends(get_session)
):
    """Get lab tests with filtering."""
    
    query = select(LabTest)
    
    filters = []
    if category:
        filters.append(LabTest.category == category)
    if name:
        filters.append(LabTest.name.ilike(f"%{name}%"))
    if code:
        filters.append(LabTest.code == code)
    if active_only:
        filters.append(LabTest.is_active == True)
    
    if filters:
        query = query.where(and_(*filters))
    
    query = query.limit(limit).order_by(LabTest.name)
    
    result = await session.exec(query)
    lab_tests = result.all()
    
    return lab_tests


@router.get("/tests/categories", response_model=List[str])
async def get_lab_test_categories():
    """Get all available lab test categories."""
    return [category.value for category in LabTestCategory]


# Lab Results endpoints
@router.post("/{order_id}/items/{item_id}/results", response_model=LabResultResponse, status_code=status.HTTP_201_CREATED)
async def create_lab_result(
    order_id: int,
    item_id: int,
    result_data: LabResultCreate,
    session: AsyncSession = Depends(get_session)
):
    """Create a lab result for an order item."""
    
    # Verify order item exists
    item_query = select(LabOrderItem).where(
        and_(LabOrderItem.id == item_id, LabOrderItem.lab_order_id == order_id)
    )
    item_result = await session.exec(item_query)
    order_item = item_result.first()
    
    if not order_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab order item not found"
        )
    
    lab_result = LabResult(
        lab_order_item_id=item_id,
        **result_data.model_dump()
    )
    session.add(lab_result)
    await session.commit()
    await session.refresh(lab_result)
    
    return lab_result


@router.get("/{order_id}/results", response_model=List[LabResultResponse])
async def get_lab_results(
    order_id: int,
    session: AsyncSession = Depends(get_session)
):
    """Get all lab results for an order."""
    
    # Verify order exists
    order_query = select(LabOrder).where(LabOrder.id == order_id)
    order_result = await session.exec(order_query)
    lab_order = order_result.first()
    
    if not lab_order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lab order not found"
        )
    
    # Get results for all items in this order
    results_query = select(LabResult).join(LabOrderItem).where(
        LabOrderItem.lab_order_id == order_id
    ).order_by(LabResult.created_at)
    
    result = await session.exec(results_query)
    lab_results = result.all()
    
    return lab_results


@router.get("/stats", response_model=dict)
async def get_lab_order_stats(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    session: AsyncSession = Depends(get_session)
):
    """Get lab order statistics."""
    
    base_query = select(LabOrder)
    
    # Apply date filters
    if date_from or date_to:
        filters = []
        if date_from:
            filters.append(LabOrder.ordered_date >= date_from)
        if date_to:
            filters.append(LabOrder.ordered_date <= date_to)
        base_query = base_query.where(and_(*filters))
    
    # Count by status
    total_result = await session.exec(select(func.count(LabOrder.id)))
    total = total_result.first() or 0
    
    draft_result = await session.exec(
        select(func.count(LabOrder.id)).where(LabOrder.status == LabOrderStatus.DRAFT)
    )
    draft = draft_result.first() or 0
    
    ordered_result = await session.exec(
        select(func.count(LabOrder.id)).where(LabOrder.status == LabOrderStatus.ORDERED)
    )
    ordered = ordered_result.first() or 0
    
    in_progress_result = await session.exec(
        select(func.count(LabOrder.id)).where(LabOrder.status == LabOrderStatus.IN_PROGRESS)
    )
    in_progress = in_progress_result.first() or 0
    
    completed_result = await session.exec(
        select(func.count(LabOrder.id)).where(LabOrder.status == LabOrderStatus.COMPLETED)
    )
    completed = completed_result.first() or 0
    
    cancelled_result = await session.exec(
        select(func.count(LabOrder.id)).where(LabOrder.status == LabOrderStatus.CANCELLED)
    )
    cancelled = cancelled_result.first() or 0
    
    return {
        "total_orders": total,
        "draft_orders": draft,
        "ordered_orders": ordered,
        "in_progress_orders": in_progress,
        "completed_orders": completed,
        "cancelled_orders": cancelled,
        "completion_rate": round((completed / total * 100) if total > 0 else 0, 2)
    }