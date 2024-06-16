import os
import requests
import threading

from config import logger


class SystemUtils:
    @staticmethod
    def getWebServersConfigPath(root, fileNames):
        webServers = {}
        try:
            for fileName in fileNames:
                for item in os.listdir(root):
                    if os.path.isdir(os.path.join(root, item)) and item == fileName:
                        configRoot = os.path.join(root, item)
                        webServers[fileName] = {"configuration_path": configRoot}
            return webServers
        except Exception as e:
            logger.error(f"Couldn't get the web servers configuration path: {e}")

    @staticmethod
    def getOperatingSystem():
        try:
            return f"OS {os.uname().sysname}, Release {os.uname().release}"
        except Exception as e:
            logger.error(f"Couldn't get the operating system: {e}")

    @staticmethod
    def getIpAddress():
        try:
            return requests.get("https://api.ipify.org").content.decode("utf8")
        except Exception as e:
            logger.error(f"Couldn't get the IP address: {e}")

    @staticmethod
    def openThread(func, arguments):
        try:
            # Start the queue polling in a separate thread so this thread can be used for the observer
            rabbit_thread = threading.Thread(target=func, args=arguments)
            rabbit_thread.daemon = True
            rabbit_thread.start()
        except Exception as e:
            logger.error(f"Couldn't starta separate thread for rabbitmq polling: {e}")
