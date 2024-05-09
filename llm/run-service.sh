#!/bin/sh

# Sleep because it is easier than implementing a healtcheck
sleep 10

python setup_qdrant.py
exec uvicorn app.main:app --host 0.0.0.0 --port 80