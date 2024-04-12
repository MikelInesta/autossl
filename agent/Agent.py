import requests, json
from utils.SystemUtils import SystemUtils
from utils.NginxUtils import NginxUtils
from utils.CertifcateUtils import CertificateUtils
import os

serverAddress = os.getenv("SERVER_ADDRESS")

class Agent:
    def __init__(
        self,
        agentUrl=serverAddress+"/api/agents/",
        webServerNames=["nginx", "apache2", "apache", "httpd"],
    ):
        self.agentUrl = agentUrl
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
        return {
            "server": {
                "server_name": serverName,
                "server_ip": serverIp,
                "operating_system": operatingSystem,
                "web_servers": webServers,
            },
        }

    def update(self):
        try:
            data = self.buildUpdateData()
            jsonData = json.dumps(data)
            res = requests.post(
                f"{self.agentUrl}/update",
                data=jsonData,
                headers={"Content-Type": "application/json"},
            )
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                print("Update sent successfully")
                return True
        except Exception as e:
            print(f"Error: {e}")
            return False
