import os
import shutil

from .certifcateUtils import CertificateUtils


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

        invalidCert = False  # When an invalidCert is found it's corresponding server block is removed...

        blockBuffer = (
            ""  # A buffer to save the server block in case it has a certificate
        )

        for line in file.readlines():

            if "#" in line.split(" ")[0] or line.split(" ")[0] == "#":
                continue

            if "server" in line.split(" ")[0] and "{" in line:
                blockBuffer += line
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
                    blockBuffer += line
                    """ print(
                        f"When building the server block: {certificatePath}, {certPrivateKeyPath}"
                    )"""
                    # print(f"Server block: {blockBuffer}")
                    # Currently: If the certificate is not considered valid the virtual host is not saved
                    # blockBuffer contains the entire server block, I could add it to replacements and remove it
                    # if invalid...
                    if invalidCert:
                        replacements[blockBuffer] = ""
                        invalidCert = False
                    else:
                        response = completeServerBlock = self.parseServerBlock(
                            listeningAddresses=listeningAddresses,
                            serverNames=serverNames,
                            webServer=webServer,
                            fileName=fileName,
                            certificatePath=certificatePath,
                            certPrivateKeyPath=certPrivateKeyPath,
                            root=root,
                            blockBuffer=blockBuffer,
                        )
                        if response == False:
                            replacements[blockBuffer] = ""
                        else:
                            serverBlocks.append(completeServerBlock)
                    inServerBlock = False
                    blockBuffer = ""
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
                            # print(f"found 'ssl_certificate' in line: {value}")
                            if certificatePath is not None:
                                print(
                                    "Warning: found multiple certificates in the same server block"
                                )
                                continue
                            certificatePath = value
                            # Move the certificate to /etc/ssl/certs/autossl/fileName
                            name = certificatePath.split("/")[-1]
                            try:
                                if certificatePath != f"/etc/ssl/certs/autossl/{name}":
                                    shutil.move(
                                        certificatePath,
                                        f"/etc/ssl/certs/autossl/{name}",
                                    )
                                    certificatePath = f"/etc/ssl/certs/autossl/{name}"
                                    # Replace the certificate path with the new path
                                    replacements[line] = line.replace(
                                        value, certificatePath
                                    )
                                    print(f"Moved {value} to {certificatePath}")
                                # This might be dumb but I open and close it just to try if it exists
                                else:
                                    f = open(certificatePath)
                                    f.close()
                            except FileNotFoundError or OSError:
                                invalidCert = True
                                print(
                                    f"{certificatePath} found in {fileName} config does not exist"
                                )
                        if "ssl_certificate_key" == lineSplit[j].strip():
                            value = (
                                (" ".join(lineSplit[j + 1 :]).split("#")[0])
                                .strip(" ")
                                .strip("\n")
                                .strip(";")
                            )
                            # print(f"found 'ssl_certificate_key' in line: {value}")
                            if certPrivateKeyPath is not None:
                                print(
                                    "Warning: found multiple certificate keys in the same server block"
                                )
                            certPrivateKeyPath = value
                            # Move the key to /etc/ssl/private/autossl/fileName
                            name = certPrivateKeyPath.split("/")[-1]
                            try:
                                if (
                                    certPrivateKeyPath
                                    != f"/etc/ssl/private/autossl/{name}"
                                ):
                                    shutil.move(
                                        certPrivateKeyPath,
                                        f"/etc/ssl/private/autossl/{name}",
                                    )
                                    certPrivateKeyPath = (
                                        f"/etc/ssl/private/autossl/{name}"
                                    )
                                    replacements[line] = line.replace(
                                        value, certPrivateKeyPath
                                    )
                                    print(f"Moved {value} to {certPrivateKeyPath}")
                                # This might be dumb but I open and close it just to try if it exists
                                else:
                                    f = open(certPrivateKeyPath)
                                    f.close()
                            except FileNotFoundError or OSError:
                                print(
                                    f"{certPrivateKeyPath} found in {fileName} config does not exist"
                                )
                                invalidCert = True
                                # certPrivateKeyPath = None
                        else:
                            continue
                if "root" in line:
                    # print("found 'root' in line")
                    value = self.getDirectiveValues("root", line)
                    root = value
                blockBuffer += line
        # print(f"Replacements: {replacements}")
        if len(replacements) == 0:
            print(f"No changes were made to {fileName} configuration")
        else:
            print(f"Made {len(replacements)} changes to {fileName} configuration")
        with open(
            f"{webServer['configuration_path']}/sites-available/{fileName}", "r"
        ) as f:
            data = f.read()
            for key in replacements.keys():
                data = data.replace(key, replacements[key])
        with open(
            f"{webServer['configuration_path']}/sites-available/{fileName}", "w"
        ) as f:
            f.write(data)
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
        blockBuffer,
    ):
        virtual_host = {}
        certificate = None

        if certificatePath:
            try:
                certificate = CertificateUtils.processCertificate(certificatePath)
                if certificate is not None:
                    certificate["server_block"] = blockBuffer
                    certificate["domain_names"] = serverNames
                # print(f"Added a server block: {certificate}")
            except Exception as e:
                print(f"Error: {e}")
                return False  # If certificate parsing fails straight up don't save the virtual host
                certificate = None
        # print(f"When creating the virtual host: {certificatePath} {certPrivateKeyPath}")
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
