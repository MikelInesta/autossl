import binascii
import json
import os
import time

import schedule
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from Agent import Agent
from config import config
from utils.CertifcateUtils import CertificateUtils
from utils.Identification import authenticate
from utils.Rabbit import Rabbit
from utils.SystemUtils import SystemUtils
from cryptography.hazmat.primitives import serialization

import requests

import base64


def consumeCallback(ch, method, props, body):
    try:
        decodedBody = body.decode("utf-8")
    except UnicodeDecodeError as e:
        print(f"Error decoding body: {e}")
        return False

    try:
        parsedBody = json.loads(decodedBody)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return False

    try:
        typeOfRequest = parsedBody["request"]
    except KeyError as e:
        print(f"Key 'request' not found in parsed body: {e}")
        return False

    try:
        if "install" in typeOfRequest:
            installNewCertificate(parsedBody)
        elif "csr" in typeOfRequest:
            sendNewCsr(parsedBody)
        else:
            print(f"Unknown request type: {typeOfRequest}")
            return False
    except Exception as e:
        print(f"Error handling request type '{typeOfRequest}': {e}")
        return False

    return True


class UpdateHandler(FileSystemEventHandler):
    def __init__(self):
        self.agent = Agent()

    def on_modified(self, event):
        self.agent.update()


if "__main__" in __name__:
    if os.geteuid() != 0:
        exit("Root permissions are needed, please run as root or use sudo.")

    webServers = SystemUtils.getWebServersConfigPath(
        "/etc", ["nginx", "apache2", "apache", "httpd"]
    )

    # Identify the agent
    if config["SERVER_ADDRESS"]:
        agentUrl = config["SERVER_ADDRESS"]
    else:
        print("Could not get the Agent's endpoint address from .env")
        exit(1)
    agentId = authenticate(agentUrl)
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
    SystemUtils.openThread(rabbit.consumeBasic, [f"{agentId}Queue", consumeCallback])

    observer = Observer()
    for webServerName in webServers:
        path = webServers[webServerName]["configuration_path"]
        event_handler = UpdateHandler()
        observer.schedule(event_handler, path, recursive=True)
    observer.start()
    observer.join()

"""
    Below is code I need to move to another file and refactor        
"""


def decodeBase64(data):
    try:
        splitData = data.split(",")
        if len(splitData) > 1:
            cleanedData = splitData[1]
        else:
            cleanedData = splitData[0]
        return base64.b64decode(cleanedData)
    except binascii.Error as e:
        print(f"Error decoding base64")
        return None


def installNewCertificate(data):
    if "fileExtension" not in data or "file" not in data:
        print("Error: Missing extension or file in the request")
        return False

    # If the fileExtension is .zip I'll need to extract the files
    if ".zip" in data["fileExtension"]:
        extractedFiles = CertificateUtils.extractZip(data["file"])

    encodedFile = data["file"]
    try:
        decodedFile = decodeBase64(encodedFile)
    except Exception as e:
        print(f"Error decoding cert: {e}")
        return False
    print(f"Decoded cert: {decodedFile}")

    try:
        domainNames = data["domain_names"]
    except KeyError as e:
        print(f"Missing 'domain_names' key in data: {e}")
        return False
    try:
        domainName = domainNames[0]
    except IndexError as e:
        print(f"Empty 'domain_names' list: {e}")
        return False

    # Time to decode the file and write it to the filesystem on /etc/ssl/certs
    filePath = f"/etc/ssl/certs/{domainName}/{domainName}.crt"
    with open("/etc/ssl/certs", "w") as file:
        file.write(decodedFile)


def queuePolling(rabbit):
    # Polling every minute to see if there are new messages
    schedule.every(1).minutes.do(rabbit.consumeGet, f"{agentId}Queue")
    while True:
        schedule.run_pending()
        time.sleep(1)


def sendNewCsr(data):
    domainNames = data["domain_names"]
    if not domainNames or domainNames == "":
        print("Error: No domain names in the request")
        return False
    domainName = domainNames.split(",")[0]
    pkPath = f"/etc/ssl/private/{domainName}"
    password = data[
        "_id"
    ]  # I'm using the domain id as the decryption password for the pk
    print(f"password: {password}")
    CertificateUtils.writePrivateKey(pkPath, password)
    pk = CertificateUtils.readPrivateKey(pkPath, password)
    csr = CertificateUtils.buildCsr(pk, data)
    csrPem = csr.public_bytes(serialization.Encoding.PEM)
    csrJson = json.dumps(
        {"virtual_host_id": data["_id"], "csr": csrPem.decode("utf-8")}
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


def consumeCallback(ch, method, props, body):
    try:
        decodedBody = body.decode("utf-8")
    except UnicodeDecodeError as e:
        print(f"Error decoding body: {e}")
        return False

    try:
        parsedBody = json.loads(decodedBody)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return False

    try:
        typeOfRequest = parsedBody["request"]
    except KeyError as e:
        print(f"Key 'request' not found in parsed body: {e}")
        return False

    try:
        if "install" in typeOfRequest:
            installNewCertificate(parsedBody)
        elif "csr" in typeOfRequest:
            sendNewCsr(parsedBody)
        else:
            print(f"Unknown request type: {typeOfRequest}")
            return False
    except Exception as e:
        print(f"Error handling request type '{typeOfRequest}': {e}")
        return False

    return True
