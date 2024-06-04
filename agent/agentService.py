import json
import os
import time

import schedule
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from Agent import Agent
from config import config
from utils.CertifcateUtils import CertificateUtils
from utils.Identification import Identification
from utils.Rabbit import Rabbit
from utils.SystemUtils import SystemUtils
from cryptography.hazmat.primitives import serialization

import requests

import base64


def installNewCertificate(data):
    print(f"Recieved install request, Json data to install: {data}")
    # Time to decode the file and write it to the filesystem on /etc/ssl/certs


def queuePolling(rabbit):
    # Polling every minute to see if there are new messages
    schedule.every(1).minutes.do(rabbit.consumeGet, f"{agentId}Queue")
    while True:
        schedule.run_pending()
        time.sleep(1)


def consumeCallback(ch, method, props, body):
    # Time to actually generate the csr
    # I receive the following data:
    try:
        decodedBody = body.decode("utf-8")
        parsedBody = json.loads(decodedBody)
        print(f"Parsed data consumed: {parsedBody}")
        typeOfRequest = parsedBody["request"]
        if typeOfRequest == "install":
            installNewCertificate(parsedBody)
        else:
            pkPath = f"/etc/ssl/private/{parsedBody['_id']}"
            password = parsedBody[
                "_id"
            ]  # I'm using the domain id as the decryption password for the pk
            print(f"password: {password}")
            CertificateUtils.writePrivateKey(pkPath, password)
            pk = CertificateUtils.readPrivateKey(pkPath, password)
            csr = CertificateUtils.buildCsr(pk, parsedBody)
            csrPem = csr.public_bytes(serialization.Encoding.PEM)
            csrJson = json.dumps(
                {"virtual_host_id": parsedBody["_id"], "csr": csrPem.decode("utf-8")}
            )
            if config["SERVER_ADDRESS"]:
                res = requests.post(
                    f"{config['SERVER_ADDRESS']}csr",
                    data=csrJson,
                    headers={"Content-Type": "application/json"},
                )
                if res.status_code != 200:
                    raise Exception(f"Error: {res.status_code}")
                else:
                    print("CSR sent successfully")
                    return True
            else:
                raise Exception("Could not get the SERVER_ADDRESS constant from config")
    except Exception as e:
        print(f"Something went wrong creating the csr: {e}")


class UpdateHandler(FileSystemEventHandler):
    def __init__(self):
        self.agent = Agent()

    def on_modified(self, event):
        self.agent.update()


if __name__ == "__main__":
    if os.geteuid() != 0:
        exit("Root permissions are needed, please run as root or use sudo.")

    a = Agent()
    a.update()

    webServers = SystemUtils.getWebServersConfigPath(
        "/etc", ["nginx", "apache2", "apache", "httpd"]
    )

    # Identify the agent
    if config["SERVER_ADDRESS"]:
        agentUrl = config["SERVER_ADDRESS"]
    else:
        print("Could not get the Agent's endpoint address from .env")
        exit(1)
    identificator = Identification(agentUrl)
    identificator.authenticate()
    agentId = identificator.getAgentId()
    if not agentId:
        print("Can't get the agent id ")
        exit(1)

    # Create a queue, bind it to the csr exchange and start polling
    if config["RABBIT_ADDRESS"]:
        rabbit = Rabbit(
            config["RABBIT_ADDRESS"], config["RABBIT_USER"], config["RABBIT_PASSWORD"]
        )
    else:
        print("Could not get the rabbit server address from .env")
        exit(1)
    rabbit.declareAndBind(f"{agentId}Queue", agentId, "csrExchange")
    SystemUtils.openThread(rabbit.consumeBasic, [f"{agentId}Queue", consumeCallback])

    observer = Observer()
    for webServerName in webServers:
        path = webServers[webServerName]["configuration_path"]
        event_handler = UpdateHandler()
        observer.schedule(event_handler, path, recursive=True)
    observer.start()
    observer.join()
