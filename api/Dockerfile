FROM python:3.10
WORKDIR /code
COPY requirements.txt requirements.txt
RUN pip install --no-cache-dir --upgrade -r requirements.txt
COPY run_service.sh run_service.sh
COPY app/ app/
CMD ["./run_service.sh"]

EXPOSE 80