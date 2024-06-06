#!/bin/sh

mkdir -p /static/nodes /static/docs
exec uvicorn app.main:app --host 0.0.0.0 --port 80
