from dotenv import load_dotenv
import os

load_dotenv()

AGENT_ENDPOINT_ADDRESS = os.environ.get("SERVER_ADDRESS")
RABBIT_ADDRESS=os.environ.get("RABBIT_ADDRESS")
