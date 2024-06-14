import requests
import json

from dotenv import dotenv_values

from .certifcateUtils import CertificateUtils
from .systemUtils import SystemUtils
from .nginxUtils import NginxUtils
from .identification import Identification
from .config import logger


class Agent:
    def __init__(
        self,
        webServerNames=["nginx", "apache2", "apache", "httpd"],
    ):
        try:
            config = dotenv_values(".env")
        except Exception as e:
            logger.error("Couldn't get the necessary environment variables: {e}")
        try:
            self.apiEndpoint = config["SERVER_ADDRESS"]
        except KeyError:
            logger.error("Couldn't get the Agent Endpoint Address from .env file")
            exit(-1)
        self.webServerNames = webServerNames
        self.nginx = None

    def buildUpdateData(self):
        webServers = SystemUtils.getWebServersConfigPath("/etc", self.webServerNames)
        for webServerName in webServers:
            # Build the found Web Server with its virtual hosts and certificates
            if webServerName == "nginx":
                self.nginx = NginxUtils(webServers[webServerName]["configuration_path"])
                virtual_hosts = self.nginx.findServerBlocks(webServers[webServerName])
                if virtual_hosts:
                    webServers[webServerName]["virtual_hosts"] = virtual_hosts
            elif webServerName in ["apache2", "apache", "httpd"]:
                pass
        serverIp = SystemUtils.getIpAddress()
        serverName = f"Server-{serverIp}"
        operatingSystem = SystemUtils.getOperatingSystem()
        identification = Identification(self.apiEndpoint)
        return {
            "server": {
                "server_name": serverName,
                "server_ip": serverIp,
                "operating_system": operatingSystem,
                "web_servers": webServers,
                "agent_id": identification.agentId,
            },
        }

    def update(self):
        try:
            updateData = self.buildUpdateData()
        except Exception as e:
            logger.error(e)
            exit(-1)
        jsonData = json.dumps(updateData)
        res = requests.post(
            f"{self.apiEndpoint}/agents/update",
            data=jsonData,
            headers={"Content-Type": "application/json"},
        )
        if res.status_code != 200:
            raise Exception(f"Error: {res.status_code}")
        else:
            print("Update sent successfully")
            CertificateUtils.updateCertificates()
            print("Certificates updated successfully")
            return True
