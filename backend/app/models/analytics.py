"""Analytics & KPI tables: dashboards, kpi_configs, time_series,
anomalies, alerts, reports."""

from sqlalchemy import Column, Text, Integer, Float, Boolean, ForeignKey, UniqueConstraint, Index
from app.database import Base


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text)
    template = Column(Text)
    layout_json = Column(Text)
    is_default = Column(Boolean, nullable=False, default=False)
    created_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(Text, nullable=False)
    updated_at = Column(Text, nullable=False)


class KpiConfig(Base):
    __tablename__ = "kpi_configs"

    id = Column(Text, primary_key=True)
    dashboard_id = Column(Text, ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text, nullable=False)
    metric_type = Column(Text, nullable=False)
    source = Column(Text)
    query_config = Column(Text)
    target_value = Column(Float)
    comparison = Column(Text)
    viz_type = Column(Text)
    position_json = Column(Text)
    created_at = Column(Text, nullable=False)


class TimeSeries(Base):
    __tablename__ = "time_series"
    __table_args__ = (
        UniqueConstraint("kpi_id", "timestamp", name="time_series_kpi_ts_uniq"),
        Index("time_series_org_id_idx", "org_id"),
    )

    id = Column(Text, primary_key=True)
    kpi_id = Column(Text, ForeignKey("kpi_configs.id", ondelete="CASCADE"), nullable=False)
    timestamp = Column(Text, nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    value = Column(Float, nullable=False)
    extra_metadata = Column("metadata", Text)


class Anomaly(Base):
    __tablename__ = "anomalies"

    id = Column(Text, primary_key=True)
    kpi_id = Column(Text, ForeignKey("kpi_configs.id", ondelete="CASCADE"), nullable=False)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    detected_at = Column(Text, nullable=False)
    severity = Column(Text, nullable=False)
    actual_value = Column(Float, nullable=False)
    expected_value = Column(Float, nullable=False)
    deviation_pct = Column(Float, nullable=False)
    explanation = Column(Text)
    status = Column(Text, nullable=False, default="open")
    resolved_at = Column(Text)
    resolved_by = Column(Text, ForeignKey("users.id", ondelete="SET NULL"))


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    kpi_id = Column(Text, ForeignKey("kpi_configs.id", ondelete="CASCADE"))
    name = Column(Text, nullable=False)
    rule_type = Column(Text, nullable=False)
    threshold_config = Column(Text, nullable=False)
    severity = Column(Text, nullable=False, default="warning")
    channels = Column(Text)
    is_active = Column(Boolean, nullable=False, default=True)
    last_fired_at = Column(Text)
    cooldown_minutes = Column(Integer, nullable=False, default=60)
    created_at = Column(Text, nullable=False)


class Report(Base):
    __tablename__ = "reports"

    id = Column(Text, primary_key=True)
    org_id = Column(Text, ForeignKey("orgs.id", ondelete="CASCADE"), nullable=False)
    dashboard_id = Column(Text, ForeignKey("dashboards.id", ondelete="SET NULL"))
    frequency = Column(Text, nullable=False)
    recipients = Column(Text, nullable=False)
    format = Column(Text, nullable=False, default="pdf")
    ai_summary = Column(Text)
    pdf_url = Column(Text)
    sent_at = Column(Text)
    opened_count = Column(Integer, nullable=False, default=0)
    period_start = Column(Text)
    period_end = Column(Text)
    created_at = Column(Text, nullable=False)
