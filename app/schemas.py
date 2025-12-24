from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Категория
class CategoryBase(BaseModel):
    name: str
    type: str  # 'income' или 'expense'

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Транзакция
class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    type: str  # 'income' или 'expense'
    category_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True