from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import os
import sys

# Проверка зависимостей
print("🚀 Запуск MoonTracker...")
print(f"📅 Время запуска: {datetime.now()}")
print(f"🐍 Версия Python: {sys.version}")

from app.database import engine, get_db
from app import models
from app import schemas

# Создаем таблицы
print("🔄 Создание таблиц базы данных...")
try:
    models.Base.metadata.create_all(bind=engine)
    print("✅ Таблицы созданы успешно")
except Exception as e:
    print(f"⚠️ Предупреждение: Не удалось создать таблицы: {e}")

# Создаем приложение
app = FastAPI(
    title="MoonTracker API",
    description="Космический трекер финансов в стиле MoonGod",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Подключаем статические файлы и шаблоны
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")
    print("✅ Статические файлы подключены")

if os.path.exists("templates"):
    templates = Jinja2Templates(directory="templates")
    print("✅ Шаблоны подключены")
else:
    print("⚠️ Папка templates не найдена")

# ==================== РОУТЫ ====================

# Главная страница
@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    if not os.path.exists("templates/index.html"):
        return HTMLResponse("""
            <html>
                <head><title>MoonTracker</title></head>
                <body style="background: #0f0c29; color: white; padding: 50px; text-align: center;">
                    <h1>🌙 MoonTracker</h1>
                    <p>Космический трекер финансов</p>
                    <p>API доступно по <a href="/api/docs" style="color: #667eea;">/api/docs</a></p>
                </body>
            </html>
        """)
    
    try:
        return templates.TemplateResponse("index.html", {"request": request})
    except Exception as e:
        print(f"Ошибка загрузки шаблона: {e}")
        return HTMLResponse(f"""
            <html>
                <head><title>MoonTracker</title></head>
                <body style="background: #0f0c29; color: white; padding: 50px;">
                    <h1>🌙 MoonTracker</h1>
                    <p>Космический трекер финансов</p>
                    <p>Ошибка загрузки интерфейса: {e}</p>
                    <p>API доступно по <a href="/api/docs" style="color: #667eea;">/api/docs</a></p>
                </body>
            </html>
        """)

# Проверка здоровья
@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "MoonTracker",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }

# Проверка базы данных
@app.get("/api/v1/db/check")
def check_database(db: Session = Depends(get_db)):
    try:
        # Простой запрос для проверки подключения
        result = db.execute("SELECT 1")
        return {
            "status": "connected",
            "database": str(db.bind.url),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }

# ==================== ТРАНЗАКЦИИ ====================

@app.post("/api/v1/transactions", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db)
):
    # Добавляем timestamp
    db_transaction = models.Transaction(
        **transaction.dict(),
        created_at=datetime.now()
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/api/v1/transactions", response_model=List[schemas.TransactionResponse])
def get_transactions(
    skip: int = 0,
    limit: int = 100,
    type: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Transaction)
    
    if type and type in ['income', 'expense']:
        query = query.filter(models.Transaction.type == type)
    
    return query.order_by(models.Transaction.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()

@app.get("/api/v1/transactions/{id}", response_model=schemas.TransactionResponse)
def get_transaction(id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

@app.delete("/api/v1/transactions/{id}")
def delete_transaction(id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}

# ==================== КАТЕГОРИИ ====================

@app.post("/api/v1/categories", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.get("/api/v1/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

# ==================== СТАТИСТИКА ====================

@app.get("/api/v1/stats")
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    
    # Общая статистика
    total_income = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.type == "income"
    ).scalar() or 0
    
    total_expense = db.query(func.sum(models.Transaction.amount)).filter(
        models.Transaction.type == "expense"
    ).scalar() or 0
    
    # Количество транзакций
    count_income = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.type == "income"
    ).scalar() or 0
    
    count_expense = db.query(func.count(models.Transaction.id)).filter(
        models.Transaction.type == "expense"
    ).scalar() or 0
    
    return {
        "total_income": float(total_income),
        "total_expense": float(total_expense),
        "balance": float(total_income - total_expense),
        "transactions": {
            "income_count": count_income,
            "expense_count": count_expense,
            "total_count": count_income + count_expense
        },
        "averages": {
            "avg_income": float(total_income / count_income) if count_income > 0 else 0,
            "avg_expense": float(total_expense / count_expense) if count_expense > 0 else 0
        },
        "timestamp": datetime.now().isoformat()
    }

# ==================== ИНФОРМАЦИЯ О СИСТЕМЕ ====================

@app.get("/api/v1/system/info")
def system_info():
    import platform
    return {
        "system": platform.system(),
        "release": platform.release(),
        "python_version": platform.python_version(),
        "service": "MoonTracker",
        "version": "1.0.0",
        "uptime": datetime.now().isoformat()
    }

print(f"✅ MoonTracker API запущен!")
print(f"📊 Конечные точки:")
print(f"   • Главная страница: /")
print(f"   • API документация: /api/docs")
print(f"   • Здоровье системы: /health")
print(f"   • Статистика: /api/v1/stats")
print(f"   • Транзакции: /api/v1/transactions")