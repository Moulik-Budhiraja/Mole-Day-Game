FROM python:3.9 

ADD main.py .
ADD media/ ./media
ADD static/ ./static
ADD templates/ ./templates

RUN pip install flask
RUN pip install requests

CMD ["python", "main.py"]