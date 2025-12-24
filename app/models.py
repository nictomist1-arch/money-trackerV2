from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String)  # 'income' или 'expense'
    created_at = Column(DateTime, default=datetime.now)
    
    # Связь с транзакциями
    transactions = relationship("Transaction", back_populates="category")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float, nullable=False)
    description = Column(String)
    type = Column(String)  # 'income' или 'expense'
    created_at = Column(DateTime, default=datetime.now)
    
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    
    # Связь с категорией
    category = relationship("Category", back_populates="transactions")