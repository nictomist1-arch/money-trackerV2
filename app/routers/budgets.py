# app/routers/budgets.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import models, schemas
from app.database import get_db
from app.auth import get_current_user

router = APIRouter(prefix="/api/v1/budgets", tags=["budgets"])

@router.get("/", response_model=list[schemas.BudgetResponse])
def get_budgets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Получить бюджеты пользователя"""
    budgets = db.query(models.Budget).filter(
        models.Budget.user_id == current_user.id
    ).all()
    return budgets

@router.get("/test")
def test_budgets():
    return {"message": "Budgets router works!"}