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

# pre ping checks the connection is still valid by emitting
# a ping to the db. If it fails, the connection is recycled
# as well as all connections older tha it

# https://docs.sqlalchemy.org/en/20/core/pooling.html#disconnect-handling-pessimistic
engine = sa.create_engine(DB_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
