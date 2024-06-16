import requests
import json
import os

from certifcateUtils import CertificateUtils
from systemUtils import SystemUtils
from nginxUtils import NginxUtils
from identification import Identification
from config import logger, config

"""
    This function retrieves web server, domain and certificate information from
    the host, authenticates and sends it to the server. Basically hosts the 
    necessary functions to send an update.
"""


class Agent:
    def __init__(
        self,
        webServerNames=["nginx", "apache2", "apache", "httpd"],
    ):
        try:
            self.apiEndpoint = config["SERVER_ADDRESS"]
        except KeyError:
            logger.error("Couldn't get the Agent Endpoint Address from .env file")
            exit(-1)
        self.webServerNames = webServerNames
        self.nginx = None

    """
        This function builds the update object that will be sent to the server.
        It call's all the necessary parsing functions, builds an update tree and returns it.
        It's originally intended to work with multiple web servers, but in reality it just
        works for Nginx right now
    """

    def buildUpdateData(self):

        try:
            webServers = SystemUtils.getWebServersConfigPath(
                "/etc", self.webServerNames
            )
        except Exception as e:
            logger.error(f"Couldn't get the web servers configuration path: {e}")

        for webServerName in webServers:
            if webServerName == "nginx":
                try:
                    self.nginx = NginxUtils()
                    virtual_hosts = self.nginx.findServerBlocks(
                        webServers[webServerName]
                    )
                    if virtual_hosts:
                        webServers[webServerName]["virtual_hosts"] = virtual_hosts
                except Exception as e:
                    logger.error(
                        f"Something went wrong while parsing the Nginx server configuration: {e}"
                    )
        try:
            serverIp = SystemUtils.getIpAddress()
            serverName = f"Server-{serverIp}"
        except Exception as e:
            logger.error(f"Couldn't get the server's IP address: {e} ")

        try:
            operatingSystem = SystemUtils.getOperatingSystem()
        except Exception as e:
            logger.error(f"Couldn't get the server's operating system: {e}")

        try:
            identification = Identification(self.apiEndpoint)
        except Exception as e:
            logger.error(
                f"Something went wrong while instantiating a Identification object: {e}"
            )

        try:
            updateData = {
                "server": {
                    "server_name": serverName,
                    "server_ip": serverIp,
                    "operating_system": operatingSystem,
                    "web_servers": webServers,
                    "agent_id": identification.getAgentId(),
                },
            }
        except Exception as e:
            logger.error(f"Something went wrong building the update data: {e}")

        return updateData

    """
        Turns the update data into json and sends it to the backend
    """

    def update(self):
        try:
            updateData = self.buildUpdateData()
        except Exception as e:
            logger.error(f"Something went wrong while building the update data: {e}")
            exit(-1)

        try:
            jsonData = json.dumps(updateData)
        except Exception as e:
            logger.error(f"Couldn't dump the update data into json: {e}")
            exit(-1)

        try:
            res = requests.post(
                f"{self.apiEndpoint}/agents/update",
                data=jsonData,
                headers={"Content-Type": "application/json"},
            )
            if res.status_code != 200:
                raise Exception(f"Received the following http code: {res.status_code}")

            try:
                CertificateUtils.updateCertificates()
            except Exception as e:
                logger.error(f"Something went wrong updating the certificates: {e}")

            # Restart nginx in case certificates changed
            try:
                os.system("systemctl restart nginx")
            except Exception as e:
                logger.error(f"Something went wrong restarting the Nginx service: {e}")

        except Exception as e:
            logger.error(
                f"Something went wrong while sending update data to the backend: {e}"
            )
            exit(-1)
