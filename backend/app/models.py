from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class DailySummary(Base):
    """Сводка за день"""

    __tablename__ = "daily_summaries"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String, unique=True, index=True)  # YYYY-MM-DD
    total_revenue = Column(Float, default=0.0)
    total_orders = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="daily_summary")


class Order(Base):
    """Заказ"""

    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, index=True)  # ID из frontend
    name = Column(String)
    comment = Column(Text, nullable=True)
    status = Column(String)  # NEW, HANDOFF
    total = Column(Float)
    is_paid = Column(Integer)  # 0 или 1 (SQLite не имеет Boolean)
    created_at = Column(DateTime)
    daily_summary_id = Column(Integer, ForeignKey("daily_summaries.id"))

    daily_summary = relationship("DailySummary", back_populates="orders")
    lines = relationship(
        "OrderLine", back_populates="order", cascade="all, delete-orphan"
    )


class OrderLine(Base):
    """Позиция в заказе"""

    __tablename__ = "order_lines"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(String)
    name = Column(String)
    price = Column(Float)
    qty = Column(Integer)

    order = relationship("Order", back_populates="lines")
