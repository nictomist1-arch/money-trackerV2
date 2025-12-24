from fastapi.templating import Jinja2Templates
from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from typing import List
import os

from app import models, schemas
from app.database import engine, get_db

# Создаем таблицы
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="MoneyTracker API", version="1.0")

# Подключаем статические файлы
app.mount("/static", StaticFiles(directory="static"), name="static")

# Простая домашняя страница
@app.get("/")
def home():
    return {
        "message": "Добро пожаловать в MoneyTracker API!",
        "endpoints": {
            "GET /static/": "Веб-интерфейс",
            "GET /transactions": "Все транзакции",
            "POST /transactions": "Создать транзакцию",
            "GET /stats": "Статистика"
        },
        "docs": "/docs"
    }

# Простые CRUD эндпоинты для транзакций
@app.post("/transactions", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db)
):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions", response_model=List[schemas.TransactionResponse])
def get_transactions(db: Session = Depends(get_db)):
    return db.query(models.Transaction).all()

@app.get("/transactions/{id}", response_model=schemas.TransactionResponse)
def get_transaction(id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    return transaction

@app.delete("/transactions/{id}")
def delete_transaction(id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Транзакция не найдена")
    db.delete(transaction)
    db.commit()
    return {"message": "Транзакция удалена"}

# Статистика (простая)
@app.get("/stats")
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    total_income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.type == "income"
    ).scalar() or 0
    
    total_expense = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.type == "expense"
    ).scalar() or 0
    
    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "balance": float(total_income - total_expense)
    }

# Проверка здоровья
@app.get("/health")
def health_check():
    return {"status": "healthy"}

templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})