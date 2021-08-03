import os

from dotenv import load_dotenv

load_dotenv()

NAMESPACE = os.getenv("NAMESPACE")
TOPIC = os.getenv("TOPIC")
TENANT_ID = os.getenv("TENANT_ID")
CLIENT_ID = os.getenv("CLIENT_ID")
CLIENT_SECRET = os.getenv("CLIENT_SECRET")
CONSUMER_GROUP = os.getenv("CONSUMER_GROUP", "test-consumer-python")
FROM_BEGINNING = os.getenv("FROM_BEGINNING", "false").lower() == 'true'

