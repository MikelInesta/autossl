import os
import shutil
from Agent import Agent


"""
    Switches the current certificate with an old one
    In reality only the certificate path and ids are needed,
    the server blocks are in case some specific configuration was saved.
"""


class Rollback:
    @staticmethod
    def rollback(data):
        try:
            wantedCertificateId = data["wantedCertificateId"]
            currentCertificateId = data["curentCertificateId"]
            currentCertPath = data["currentCertPath"]
            # currentCertificateServerBlock = data["currentCertificateServerBlock"]
            # configurationFile = data["configurationFile"]
            # wantedCertificateServerBlock = data["wantedCertificateServerBlock"]
        except Exception as e:
            print(f"Couldn't retrieve necessary data for rollback: {e}")
            return

        wantedCertPath = f"{currentCertPath}.{wantedCertificateId}"

        try:
            Rollback.exchangeCerts(
                currentCertPath, currentCertificateId, wantedCertPath
            )
        except Exception as e:
            print(f"Something went wrong exchanging certificates: {e}")
            return

        # Force an update
        a = Agent()
        a.update()

        try:
            os.system("systemctl restart nginx")
        except Exception as e:
            print(f"Something went wrong restarting Nginx")

    """
        Places the wanted cert path as the current cert path
    """

    @staticmethod
    def exchangeCerts(currentCertPath, currentCertId, wantedCertPath):
        shutil.move(currentCertPath, f"{currentCertPath}.{currentCertId}")
        print(f"Moved {currentCertPath} to {currentCertPath}.{currentCertId}")
        shutil.move(wantedCertPath, currentCertPath)
        print(f"Moved {wantedCertPath} to {currentCertPath}")
