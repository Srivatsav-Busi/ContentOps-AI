"""Application configuration via environment variables."""

from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Paths
    project_root: Path = Path(__file__).resolve().parent.parent.parent  # contentops/
    data_dir: Path = Path("")
    upload_dir: str = "./data/uploads"

    # Database
    database_url: str = ""

    # AI / LLM
    llm_api_url: str = ""
    llm_api_key: str = ""
    llm_model: str = ""
    llm_model_seo: str = ""
    llm_model_edit: str = ""
    llm_model_anomaly: str = ""
    llm_model_report: str = ""

    # Backward-compat keys
    openrouter_api_key: str = ""
    openai_api_key: str = ""
    openai_base_url: str = ""

    # Auth
    nextauth_secret: str = ""

    # OAuth (social account connections)
    google_client_id: str = ""
    google_client_secret: str = ""
    facebook_app_id: str = ""
    facebook_app_secret: str = ""
    oauth_redirect_base_url: str = "http://localhost:8000"
    tiktok_publish_url: str = ""
    linkedin_publish_url: str = ""
    x_publish_url: str = ""
    facebook_publish_url: str = ""

    model_config = {"env_file": "../.env.local", "extra": "ignore"}

    @property
    def resolved_data_dir(self) -> Path:
        return self.project_root / "data"

    @property
    def db_path(self) -> Path:
        return self.resolved_data_dir / "contentops.db"

    @property
    def resolved_api_key(self) -> str:
        return self.llm_api_key or self.openrouter_api_key or self.openai_api_key

    @property
    def resolved_base_url(self) -> str:
        return self.llm_api_url or self.openai_base_url or ""

    @property
    def is_openrouter(self) -> bool:
        return "openrouter.ai" in self.resolved_base_url

    def get_model(self, env_key_attr: str, openai_default: str) -> str:
        """Resolve model name, mirroring the TypeScript getModel() logic."""
        specific = getattr(self, env_key_attr, "")
        if specific and specific.strip():
            return specific
        if self.llm_model and self.llm_model.strip():
            return self.llm_model
        return f"openai/{openai_default}" if self.is_openrouter else openai_default


settings = Settings()
