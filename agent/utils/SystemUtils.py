import os, requests


class SystemUtils:
    @staticmethod
    def getWebServersConfigPath(root, fileNames):
        webServers = {}
        for fileName in fileNames:
            for item in os.listdir(root):
                if os.path.isdir(os.path.join(root, item)) and item == fileName:
                    configRoot = os.path.join(root, item)
                    webServers[fileName] = {"configuration_path": configRoot}
        return webServers

    @staticmethod
    def getOperatingSystem():
        return f"OS {os.uname().sysname}, Release {os.uname().release}"

    @staticmethod
    def getIpAddress():
        return requests.get("https://api.ipify.org").content.decode("utf8")
