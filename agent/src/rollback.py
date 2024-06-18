import os
import shutil
import requests

from agent import Agent
from config import logger, config


"""
    Switches the current certificate with an old one
    In reality only the certificate path and ids are needed,
    the server blocks are in case some specific configuration was saved.
"""

try:
    apiEndpoint = config["SERVER_ADDRESS"]
except KeyError as e:
    logger.error(f"Something went wrong trying to access the SERVER_ADDRESS: {e}")


class Rollback:
    @staticmethod
    def rollback(data):
        try:
            wantedCertificateId = data["wantedCertificateId"]
            currentCertificateId = data["currentCertificateId"]
            currentCertPath = data["currentCertPath"]
            # currentCertificateServerBlock = data["currentCertificateServerBlock"]
            # configurationFile = data["configurationFile"]
            # wantedCertificateServerBlock = data["wantedCertificateServerBlock"]
        except Exception as e:
            logger.error(f"Couldn't retrieve necessary data for rollback: {e}")
            return

        wantedCertPath = f"{currentCertPath}.{wantedCertificateId}"

        try:
            Rollback.exchangeCerts(
                currentCertPath, currentCertificateId, wantedCertPath
            )
        except Exception as e:
            logger.error(f"Something went wrong exchanging certificates: {e}")
            return

        # Restart nginx
        try:
            os.system("systemctl restart nginx")
        except Exception as e:
            logger.error(f"Something went wrong restarting the Nginx service: {e}")

        # Force an update
        # This update should relate the new certificate to virtual host
        a = Agent()
        a.update()

        try:
            res = requests.post(
                f"{apiEndpoint}/domain/update-rollback-status/cert/{wantedCertificateId}",
                data={
                    "newStatus": "Successfully rolled back to the requested certificate!"
                },
                headers={"Content-Type": "application/json"},
            )
        except Exception as e:
            logger.error(
                f"Something went wrong trying to update the csr request status: {e}"
            )

    """
        Places the wanted cert path as the current cert path
    """

    @staticmethod
    def exchangeCerts(currentCertPath, currentCertId, wantedCertPath):
        try:
            shutil.move(currentCertPath, f"{currentCertPath}.{currentCertId}")
            logger.info(f"Moved {currentCertPath} to {currentCertPath}.{currentCertId}")
            shutil.move(wantedCertPath, currentCertPath)
            logger.info(f"Moved {wantedCertPath} to {currentCertPath}")
        except Exception as e:
            logger.error(
                f"Couldn't exchange the certificates {currentCertPath} and {wantedCertPath}: {e}"
            )
