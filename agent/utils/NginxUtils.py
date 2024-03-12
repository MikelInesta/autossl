import os
from .CertifcateUtils import CertificateUtils


class NginxUtils:
    def __init__(self, file_path):
        self.file_path = file_path

    def findServerBlocks(self, webServer):
        print(f"Scanning {webServer['configuration_path']}/sites-available")
        serverBlocks = {}
        for root, dirs, files in os.walk(
            f"{webServer['configuration_path']}/sites-available"
        ):
            # Loop through every file in the directory to find virtual hosts
            for file in files:
                with open(os.path.join(root, file), "r") as f:
                    serverBlocks[file] = self.parseSite(f, webServer, file)
        return serverBlocks

    def parseSite(self, file, webServer, fileName):
        print(f"parsing {fileName}")
        serverBlocks = []
        inServerBlock = False

        for line in file.readlines():

            if "#" in line.split(" ")[0] or line.split(" ")[0] == "#":
                continue

            if "server" in line.split(" ")[0] and "{" in line:
                listeningAddresses = []
                serverNames = None
                inServerBlock = True
                certificatePath = None
                level = 1
                continue

            if inServerBlock:

                if "{" in line:
                    level += 1

                if "}" in line:
                    level -= 1

                if level == 0 and inServerBlock:
                    completeServerBlock = self.parseServerBlock(
                        listeningAddresses,
                        serverNames,
                        webServer,
                        fileName,
                        certificatePath,
                    )
                    serverBlocks.append(completeServerBlock)
                    inServerBlock = False
                    continue

                if "listen" in line:
                    value = self.getDirectiveValues("listen", line)
                    listeningAddresses.append(value)

                if "server_name" in line:
                    value = self.getDirectiveValues("server_name", line)
                    serverNames = value

                if "ssl_certificate" in line and certificatePath is None:
                    value = self.getDirectiveValues("ssl_certificate", line)
                    certificatePath = value

        return serverBlocks

    def parseServerBlock(
        self, listeningAddresses, serverNames, webServer, fileName, certificatePath
    ):
        print(f"parsing server block {serverNames}")
        virtual_host = {}
        certificate = None

        if certificatePath:
            certificate = CertificateUtils.processCertificate(certificatePath)
        virtual_host = {
            "vh_ips": listeningAddresses,
            "domain_names": serverNames,
            "enabled": (
                fileName
                in os.listdir(f'{webServer["configuration_path"]}/sites-enabled')
            ),
            "certificate": certificate,
        }
        return virtual_host

    def getDirectiveValues(self, directive, line):
        lineSplit = line.split(" ")
        for j in range(len(lineSplit)):
            if directive in lineSplit[j]:
                return (
                    (" ".join(lineSplit[j + 1 :]).split("#")[0])
                    .strip(" ")
                    .strip("\n")
                    .strip(";")
                )
