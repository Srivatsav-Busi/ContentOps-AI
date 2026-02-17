"""System tables: billing_plans, audit_logs, usage_events."""

from sqlalchemy import Column, Text, Integer, Float, Boolean, Index
from app.database import Base


class BillingPlan(Base):
    __tablename__ = "billing_plans"

    id = Column(Text, primary_key=True)
    name = Column(Text, nullable=False)
    tier = Column(Text, nullable=False)
    price_monthly = Column(Float, nullable=False)
    price_yearly = Column(Float, nullable=False)
    limits_json = Column(Text)
    features = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    created_at = Column(Text, nullable=False)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Text, primary_key=True)
    org_id = Column(Text, nullable=False, index=True)
    user_id = Column(Text)
    action = Column(Text, nullable=False)
    resource_type = Column(Text)
    resource_id = Column(Text)
    changes_json = Column(Text)
    ip_address = Column(Text)
    user_agent = Column(Text)
    timestamp = Column(Text, nullable=False, index=True)


class UsageEvent(Base):
    __tablename__ = "usage_events"

    id = Column(Text, primary_key=True)
    org_id = Column(Text, nullable=False, index=True)
    event_type = Column(Text, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(Text, nullable=False)
    extra_metadata = Column("metadata", Text)
    timestamp = Column(Text, nullable=False, index=True)
