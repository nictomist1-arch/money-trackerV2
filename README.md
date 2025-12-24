# 🌙 MoonTracker - Космический трекер финансов

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=for-the-badge&logo=python)](https://python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Render](https://img.shields.io/badge/Render-Cloud-46e3b7?style=for-the-badge&logo=render)](https://render.com)

**MoonTracker** — это современное веб-приложение для учета личных финансов, разработанное в стиле MoonGod. Приложение сочетает мощный REST API на FastAPI с элегантным космическим интерфейсом.

## 🚀 Быстрый старт

### Локальная разработка

1. **Клонируйте репозиторий**
   ```bash
   git clone https://github.com/ваш-username/moon-tracker.git
   cd moon-tracker
   ```

2. **Установите зависимости**
   ```bash
   pip install -r requirements.txt
   ```

3. **Настройте переменные окружения**
   ```bash
   cp .env.example .env
   # Отредактируйте .env файл
   ```

4. **Запустите приложение**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

5. **Откройте в браузере**
   - 🌐 Приложение: http://localhost:8000
   - 📚 Документация API: http://localhost:8000/api/docs
   - ❓ Проверка здоровья: http://localhost:8000/health

### Docker (рекомендуется)

1. **Запустите Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Приложение будет доступно по адресу**
   ```
   http://localhost:8000
   ```

## 📁 Структура проекта

```
moon-tracker/
├── app/                    # Основное приложение
│   ├── __init__.py
│   ├── main.py           # Точка входа FastAPI
│   ├── database.py       # Настройка БД
│   ├── models.py         # SQLAlchemy модели
│   └── schemas.py        # Pydantic схемы
├── static/               # Статические файлы
│   ├── css/
│   │   └── moon.css     # Стили в стиле MoonGod
│   └── js/
│       └── moon.js      # Логика фронтенда
├── templates/            # HTML шаблоны
│   └── index.html       # Главная страница
├── requirements.txt      # Зависимости Python
├── runtime.txt          # Версия Python
├── docker-compose.yml   # Локальная разработка
├── .env.example         # Шаблон переменных окружения
└── README.md            # Документация
```

## ✨ Особенности

### 🎨 **Фронтенд в стиле MoonGod**
- 🌌 Космический дизайн с анимированным фоном
- 📱 Полностью адаптивный интерфейс
- 💫 Плавные анимации и переходы
- 🎯 Интуитивное управление транзакциями
- 📊 Интерактивные диаграммы Chart.js

### 🔧 **Бэкенд на FastAPI**
- ⚡ Высокопроизводительный REST API
- 🗄️ Две связанные таблицы с отношениями
- 🔐 Безопасная архитектура
- 📄 Автодокументация OpenAPI/Swagger
- 🧪 Type hints и валидация Pydantic

### ☁️ **Облачная инфраструктура**
- 🌐 Деплой на Render.com
- 🐘 PostgreSQL в облаке
- 🔄 Автоматический деплой из GitHub
- ⚙️ Переменные окружения

## 📡 API Эндпоинты

### Основные
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/` | Главная страница |
| `GET` | `/health` | Проверка здоровья |
| `GET` | `/api/v1/db/check` | Проверка БД |

### Транзакции
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/api/v1/transactions` | Список транзакций |
| `POST` | `/api/v1/transactions` | Создать транзакцию |
| `GET` | `/api/v1/transactions/{id}` | Получить транзакцию |
| `DELETE` | `/api/v1/transactions/{id}` | Удалить транзакцию |

### Категории
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/api/v1/categories` | Список категорий |
| `POST` | `/api/v1/categories` | Создать категорию |
| `GET` | `/api/v1/categories/default` | Дефолтные категории |
| `POST` | `/api/v1/categories/seed` | Заполнить БД категориями |

### Статистика
| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| `GET` | `/api/v1/stats` | Основная статистика |
| `GET` | `/api/v1/stats/detailed` | Детальная статистика |

## 🗄️ Модели данных

### Категория (Category)
```python
class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String)  # 'income' или 'expense'
    created_at = Column(DateTime, default=datetime.now)
    
    # Связь 1:N с транзакциями
    transactions = relationship("Transaction", back_populates="category")
```

### Транзакция (Transaction)
```python
class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String)
    type = Column(String)  # 'income' или 'expense'
    created_at = Column(DateTime, default=datetime.now)
    
    # Внешний ключ к категории
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    # Связь N:1 с категорией
    category = relationship("Category", back_populates="transactions")
```

## 🚀 Деплой на Render.com

### 1. Подготовка репозитория
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/ваш-username/moon-tracker.git
git push -u origin main
```

### 2. Создание сервисов на Render.com

#### 2.1 PostgreSQL База данных
1. Перейдите на [Render.com](https://render.com)
2. Нажмите "New" → "PostgreSQL"
3. Настройте:
   - **Name:** `moon-tracker-db`
   - **Database:** `moon_tracker`
   - **User:** `moon_user`
   - **Region:** Singapore (или ближайший)
4. Сохраните External Database URL

#### 2.2 Web Service
1. Нажмите "New" → "Web Service"
2. Подключите GitHub репозиторий
3. Настройте:
   - **Name:** `moon-tracker`
   - **Region:** Singapore
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Добавьте переменные окружения:
   - `DATABASE_URL`: Ваш PostgreSQL URL
   - `DEBUG`: `False` (для продакшена)

### 3. Автоматический деплой
- При каждом push в `main` ветку будет автоматический деплой
- Можно настроить Webhooks для уведомлений

## 🐳 Docker Compose для разработки

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: moon_user
      POSTGRES_PASSWORD: moon_password
      POSTGRES_DB: moon_tracker
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "8000:8000"
    environment:
      DATABASE_URL: postgresql://moon_user:moon_password@postgres:5432/moon_tracker
    depends_on:
      - postgres
    volumes:
      - .:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

volumes:
  postgres_data:
```

## 📦 Зависимости

### Основные зависимости (`requirements.txt`)
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
pydantic==2.5.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
jinja2==3.1.2
```

## 🧪 Тестирование

### Ручное тестирование API
```bash
# Создать транзакцию
curl -X POST "http://localhost:8000/api/v1/transactions" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "description": "Зарплата", "type": "income"}'

# Получить статистику
curl "http://localhost:8000/api/v1/stats"

# Получить все транзакции
curl "http://localhost:8000/api/v1/transactions"
```

### Тестирование через Swagger UI
Откройте в браузере: `http://localhost:8000/api/docs`

## 🛠️ Разработка

### Установка для разработки
```bash
# Установка зависимостей
pip install -r requirements.txt

# Установка дополнительных инструментов разработки
pip install pytest pytest-cov black flake8

# Запуск линтера
flake8 app/

# Запуск форматирования кода
black app/
```

### Структура кода
```python
# Пример структуры эндпоинта
@app.post("/api/v1/transactions", response_model=schemas.TransactionResponse)
def create_transaction(
    transaction: schemas.TransactionCreate, 
    db: Session = Depends(get_db)
) -> schemas.TransactionResponse:
    """
    Создает новую транзакцию в системе.
    
    Args:
        transaction: Данные для создания транзакции
        db: Сессия базы данных
        
    Returns:
        Созданная транзакция
        
    Raises:
        HTTPException: Если данные невалидны
    """
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
```

## 🔧 Конфигурация

### Файл `.env`
```env
# Для разработки
DATABASE_URL=sqlite:///./money_tracker.db

# Для продакшена (Render)
# DATABASE_URL=postgresql://user:password@host:port/database

# Настройки приложения
DEBUG=True
APP_NAME=MoonTracker
VERSION=1.0.0
```

### Конфигурация базы данных
```python
# app/database.py
def get_database_url():
    if "RENDER" in os.environ:
        # Продакшен на Render
        database_url = os.getenv("DATABASE_URL")
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url
    else:
        # Локальная разработка
        return "sqlite:///./money_tracker.db"
```

## 📱 Фронтенд особенности

### Космический дизайн
- Анимированный фон с звездами
- Неоновые эффекты для элементов
- Плавные переходы и анимации
- Адаптивная сетка CSS Grid

### Функциональность
- Добавление транзакций с быстрыми действиями
- Фильтрация по типу и категории
- Удаление транзакций с подтверждением
- Статистика в реальном времени
- Графики распределения расходов

### Быстрые действия
```javascript
// Быстрое добавление частых транзакций
document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const amount = this.dataset.amount;
        const description = this.dataset.description;
        document.getElementById('amount').value = amount;
        document.getElementById('description').value = description;
    });
});
```

## 🚀 Производительность

### Оптимизации
- Кэширование статических файлов
- Минимизация запросов к БД
- Ленивая загрузка транзакций
- Оптимизированные SQL-запросы

### Мониторинг
```python
# Логирование запросов
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} "
        f"completed in {process_time:.2f}s"
    )
    return response
```

## 📚 Документация

### Встроенная документация
- Swagger UI: `/api/docs`
- ReDoc: `/api/redoc`
- OpenAPI схема: `/api/openapi.json`

### Дополнительная документация
- Комментарии в коде (docstrings)
- Примеры запросов в README
- Инструкции по развертыванию

## 🤝 Вклад в проект

### Правила разработки
1. Создайте issue для новой функции
2. Создайте ветку от `main`
3. Сделайте изменения и добавьте тесты
4. Создайте Pull Request
5. Дождитесь ревью кода

### Code Style
```bash
# Проверка стиля кода
flake8 app/

# Форматирование кода
black app/

# Сортировка импортов
isort app/
```
## 🙏 Благодарности

- FastAPI сообществу за отличный фреймворк
- Render.com за бесплатный хостинг
- Сообществу open source за инструменты и библиотеки

---

**MoonTracker** © 2025 - Создано с 🌙 и ❤️ для управления финансами