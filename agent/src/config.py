import logging
import sys

from dotenv import dotenv_values


def initLogger():
    logger = logging.getLogger("autossl")
    logger.setLevel(logging.INFO)
    handler = logging.StreamHandler(
        sys.stdout
    )  # stdout is written to /opt/autossl/logs.txt in the service
    formatter = logging.Formatter(
        "%(created)f:%(levelname)s:%(name)s:%(module)s:%(message)s"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)


initLogger()

logger = logging.getLogger("autossl")
config = dotenv_values(".env")
