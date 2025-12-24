from pydantic import BaseModel
from typing import Optional

# Category
class CategoryBase(BaseModel):
    name: str
    type: str

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    class Config:
        from_attributes = True

# Transaction
class TransactionBase(BaseModel):
    amount: float
    description: Optional[str] = None
    type: str
    category_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    
    class Config:
        from_attributes = True