import os

LLM_SERVICE_HOST = os.getenv("LLM_SERVICE_HOST")

DB_USERNAME = os.getenv("DB_USERNAME", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "root")
DB_HOST = os.getenv("DB_HOST", "mariadb")
DB_PORT = int(os.getenv("DB_PORT", "3306"))

STATIC_PATH = os.getenv("STATIC_PATH", "/static")
RESOURCES_PATH = f"{STATIC_PATH}/nodes"
DOCS_PATH = f"{STATIC_PATH}/docs"

IS_DEV = os.getenv("DEV") is not None