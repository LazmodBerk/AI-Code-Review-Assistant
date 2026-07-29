import sys
from loguru import logger
from pathlib import Path
from app.core.config import get_settings

def setup_logging():
    settings = get_settings()
    Path(settings.REPORTS_DIR).mkdir(parents=True, exist_ok=True)
    logger.remove()
    logger.add(sys.stderr, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>", level="DEBUG" if settings.DEBUG else "INFO", colorize=True)
    logger.add(f"{settings.REPORTS_DIR}/app.log", rotation="1 day", retention="30 days", compression="gz", level="INFO")
    return logger

app_logger = setup_logging()

def get_logger(name: str = "app"):
    return app_logger.bind(context=name)
