import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

from . import config

DB_URL = sa.URL.create(
    "mariadb+pymysql",
    username=config.DB_USERNAME,
    password=config.DB_PASSWORD,
    host=config.DB_HOST,
    database="primary",
    port=config.DB_PORT,
)

engine = sa.create_engine(DB_URL)
SessionLocal = sessionmaker(bind=engine)
