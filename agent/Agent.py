import requests, json
from utils.SystemUtils import SystemUtils
from utils.NginxUtils import NginxUtils
from dotenv import load_dotenv
from utils.Identification import Identification
import os


class Agent:
    def __init__(
        self,
        webServerNames=["nginx", "apache2", "apache", "httpd"],
    ):
        load_dotenv()
        self.agentUrl = os.environ.get("SERVER_ADDRESS")
        self.webServerNames = webServerNames
        self.nginx = None
        self.identificator = Identification(
            self.agentUrl, os.path.join(os.path.dirname(__file__), "..", "agentId.json")
        )
        self.identificator.authenticate()  # Reads or assigns a unique Id for the agent

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
