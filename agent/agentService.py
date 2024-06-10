import os
import time
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from Agent import Agent
from config import config
from utils.CertifcateUtils import CertificateUtils
from utils.Identification import authenticate
from utils.Rabbit import Rabbit
from utils.SystemUtils import SystemUtils
from cryptography.hazmat.primitives import serialization


class UpdateHandler(FileSystemEventHandler):
    def __init__(self):
        self.agent = Agent()

    def on_modified(self, event):
        # Wait for the file to be written
        time.sleep(30)
        self.agent.update()


if "__main__" in __name__:
    if os.geteuid() != 0:
        exit("Root permissions are needed, please run as root or use sudo.")

    webServers = SystemUtils.getWebServersConfigPath(
        "/etc", ["nginx", "apache2", "apache", "httpd"]
    )

    # Identify the agent
    if config["SERVER_ADDRESS"]:
        apiEndpoint = config["SERVER_ADDRESS"]
    else:
        print("Could not get the Agent's endpoint address from .env")
        exit(1)
    agentId = authenticate(apiEndpoint)
    if not agentId:
        print("Can't get the agent id ")
        exit(1)

    # Send the initial update
    a = Agent()
    a.update()

    # Create a queue, bind it to the csr exchange and start polling
    if config["RABBIT_ADDRESS"]:
        rabbit = Rabbit(
            config["RABBIT_ADDRESS"], config["RABBIT_USER"], config["RABBIT_PASSWORD"]
        )
    else:
        print("Could not get the rabbit server address from .env")
        exit(1)
    rabbit.declareAndBind(f"{agentId}Queue", agentId, "csrExchange")
    SystemUtils.openThread(
        rabbit.consumeBasic, [f"{agentId}Queue", Rabbit.consumeCallback]
    )

    # I need to fix this executing many times when changes are detected
    observer = Observer()
    for webServerName in webServers:
        path = webServers[webServerName]["configuration_path"]
        event_handler = UpdateHandler()
        observer.schedule(event_handler, path, recursive=True)
    observer.start()
    try:
        while True:
            time.sleep(300)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

"""
    Below is code I need to move to another file and refactor        
"""
