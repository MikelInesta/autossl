import requests, json
from utils.Rabbit import Rabbit
from utils.SystemUtils import SystemUtils
from utils.NginxUtils import NginxUtils
from dotenv import load_dotenv
from utils.Identification import Identification
import os
from config import RABBIT_ADDRESS

class Agent:
    def __init__(
        self,
        webServerNames=["nginx", "apache2", "apache", "httpd"],
        ):
        load_dotenv()
        self.agentUrl = os.environ.get("SERVER_ADDRESS")
        self.webServerNames = webServerNames
        self.nginx = None
        self.identificator = Identification(self.agentUrl)
        if RABBIT_ADDRESS:
            self.rabbit = Rabbit(RABBIT_ADDRESS)
        else:
            self.rabbit = Rabbit('amqp://localhost')
        agentId = self.identificator.getAgentId()
        self.rabbit.declareAndBind(agentId)
        print("Declared and binded?")

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
            self.identificator.authenticate()
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
