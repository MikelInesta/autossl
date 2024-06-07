import os
import shutil
from .CertifcateUtils import CertificateUtils


class NginxUtils:
    def __init__(self, file_path):
        self.createCertDirs()
        self.file_path = file_path
        
    def createCertDirs(self):
        if not os.path.exists("/etc/ssl/certs/autossl"):
            os.makedirs("/etc/ssl/certs/autossl")
        if not os.path.exists("/etc/ssl/private/autossl"):
            os.makedirs("/etc/ssl/private/autossl")

    def findServerBlocks(self, webServer):
        serverBlocks = {}
        for root, dirs, files in os.walk(
            f"{webServer['configuration_path']}/sites-available"
        ):
            # Loop through every file in the directory to find virtual hosts
            for file in files:
                with open(os.path.join(root, file), "r+") as f:
                    serverBlocks[file] = self.parseSite(f, webServer, file)
        return serverBlocks

    def parseSite(self, file, webServer, fileName):
        serverBlocks = []
        inServerBlock = False
        
        # A dictionary to save changes to write back to the file
        replacements = {}

        for line in file.readlines():

            if "#" in line.split(" ")[0] or line.split(" ")[0] == "#":
                continue

            if "server" in line.split(" ")[0] and "{" in line:
                listeningAddresses = []
                serverNames = None
                inServerBlock = True
                certificatePath = None
                root = None
                certPrivateKeyPath = None
                level = 1
                continue

            if inServerBlock:

                if "{" in line:
                    level += 1

                if "}" in line:
                    level -= 1

                if level == 0 and inServerBlock:
                    """ print(
                        f"When building the server block: {certificatePath}, {certPrivateKeyPath}"
                    )"""
                    completeServerBlock = self.parseServerBlock(
                        listeningAddresses=listeningAddresses,
                        serverNames=serverNames,
                        webServer=webServer,
                        fileName=fileName,
                        certificatePath=certificatePath,
                        certPrivateKeyPath=certPrivateKeyPath,
                        root=root,
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

                if "ssl_certificate" in line:
                    # print("Found something including ssl_certificate")
                    lineSplit = line.split(" ")
                    for j in range(len(lineSplit)):
                        if "ssl_certificate" == lineSplit[j].strip():
                            value = (
                                (" ".join(lineSplit[j + 1 :]).split("#")[0])
                                .strip(" ")
                                .strip("\n")
                                .strip(";")
                            )
                            print(f"found 'ssl_certificate' in line: {value}")
                            if certificatePath is not None:
                                print(
                                    "Warning: found multiple certificates in the same server block"
                                )
                                continue
                            certificatePath = value
                            # Move the certificate to /etc/ssl/certs/autossl/fileName
                            name = certificatePath.split("/")[-1]
                            try:
                                shutil.move(certificatePath, f"/etc/ssl/certs/autossl/{name}")
                                certificatePath = f"/etc/ssl/certs/autossl/{name}"
                                # Replace the certificate path with the new path
                                replacements[line] = line.replace(value, certificatePath)
                                print(f"Moved {value} to {certificatePath}")
                            except FileNotFoundError:
                                print(f"Error: {certificatePath} not found")
                        if "ssl_certificate_key" == lineSplit[j].strip():
                            value = (
                                (" ".join(lineSplit[j + 1 :]).split("#")[0])
                                .strip(" ")
                                .strip("\n")
                                .strip(";")
                            )
                            print(f"found 'ssl_certificate_key' in line: {value}")
                            if certPrivateKeyPath is not None:
                                print(
                                    "Warning: found multiple certificate keys in the same server block"
                                )
                            certPrivateKeyPath = value
                            # Move the key to /etc/ssl/private/autossl/fileName
                            name = certPrivateKeyPath.split("/")[-1]
                            try:
                                shutil.move(certPrivateKeyPath, f"/etc/ssl/private/autossl/{name}")
                                certPrivateKeyPath = f"/etc/ssl/private/autossl/{name}"
                                replacements[line] = line.replace(value, certPrivateKeyPath)
                                print(f"Moved {value} to {certPrivateKeyPath}")
                            except FileNotFoundError:
                                print(f"Error: {certPrivateKeyPath} not found")
                        else:
                            continue
                if "root" in line:
                    # print("found 'root' in line")
                    value = self.getDirectiveValues("root", line)
                    root = value
        print(f"Replacements: {replacements}")
        with open(f"{webServer['configuration_path']}/sites-available/{fileName}", "r") as f:
            data = f.read()
            for key in replacements.keys():
                data = data.replace(key, replacements[key])
        with open(f"{webServer['configuration_path']}/sites-available/{fileName}", "w") as f:
            f.write(data)
        print("Updated the certificate paths in the configuration file")
        return serverBlocks

    def parseServerBlock(
        self,
        listeningAddresses,
        serverNames,
        webServer,
        fileName,
        certificatePath,
        certPrivateKeyPath,
        root,
    ):
        virtual_host = {}
        certificate = None

        if certificatePath:
            try:
                certificate = CertificateUtils.processCertificate(certificatePath)
            except Exception as e:
                print(f"Error: {e}")
                certificate = None
        print(f"When creating the virtual host: {certificatePath} {certPrivateKeyPath}")
        virtual_host = {
            "vh_ips": listeningAddresses,
            "domain_names": serverNames,
            "enabled": (
                fileName
                in os.listdir(f'{webServer["configuration_path"]}/sites-enabled')
            ),
            "certificate": certificate,
            "certificate_path": certificatePath,
            "certificate_key_path": certPrivateKeyPath,
            "root": root,
            "configuration_file": fileName,
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
