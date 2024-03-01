import sqlalchemy as sa
from sqlalchemy.orm import sessionmaker

DB_URL = sa.URL.create(
    "mariadb+pymysql",
    username="root",
    password="root",
    host="127.0.0.1",
    database="protocols",
    port=3306,
)

engine = sa.create_engine(DB_URL, echo=True)
SessionLocal = sessionmaker(bind=engine)