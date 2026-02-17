"""Core tenant tables: roles, orgs, users."""

from sqlalchemy import Column, Text, Integer, Boolean, ForeignKey, UniqueConstraint, Index
from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    id = Column(Text, primary_key=True)
    name = Column(Text, nullable=False, unique=True)
    permissions = Column(Text, nullable=False, default="[]")


class Org(Base):
    __tablename__ = "orgs"

    id = Column(Text, primary_key=True)
    name = Column(Text, nullable=False)
    slug = Column(Text, nullable=False, unique=True)
    plan_id = Column(Text, ForeignKey("billing_plans.id", ondelete="SET NULL"))
    settings = Column(Text, default="{}")
    region = Column(Text)
    logo_url = Column(Text)
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("org_id", "email", name="users_org_email_uniq"),
        Index("users_email_idx", "email"),
    )

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    email = Column(Text, nullable=False)
    display_name = Column(Text)
    avatar_url = Column(Text)
    password_hash = Column(Text)
    role_id = Column(Text, ForeignKey("roles.id", ondelete="SET NULL"))
    email_verified = Column(Boolean, nullable=False, default=False)
    last_login_at = Column(Text)
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)
