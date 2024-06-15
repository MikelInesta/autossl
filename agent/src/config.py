import logging
import sys

from dotenv import dotenv_values


def initLogger():
    logger = logging.getLogger("autossl")
    logger.setLevel(logging.INFO)

    # handler = logging.FileHandler("/opt/autossl/agent.log")
    handler = logging.StreamHandler(
        sys.stdout
    )  # stdout is written to /opt/autossl/logs.txt in the service
    formatter = logging.Formatter(
        "%(created)f:%(levelname)s:%(name)s:%(module)s:%(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


try:
    initLogger()
    logger = logging.getLogger("autossl")
except Exception as e:
    print(f"Something went wrong trying to start the logger: {e}")
    exit(-1)

try:
    config = dotenv_values(".env")
except Exception as e:
    logger.error(f"Couldn't read the environment variables from .env: {e}")
    exit(-1)
