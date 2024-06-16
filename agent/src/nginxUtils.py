import os
import shutil

from certifcateUtils import CertificateUtils
from config import logger


class NginxUtils:
    def __init__(self):
        try:
            self.createCertDirs()
        except Exception as e:
            logger.error(
                f"Something went wrong creating the certificates directory: {e}"
            )

    def createCertDirs(self):
        try:
            if not os.path.exists("/etc/ssl/certs/autossl"):
                os.makedirs("/etc/ssl/certs/autossl")
            if not os.path.exists("/etc/ssl/private/autossl"):
                os.makedirs("/etc/ssl/private/autossl")
        except Exception as e:
            logger.error(f"Couldn't create the cert and private key directories: {e}")

    def findServerBlocks(self, webServer):
        serverBlocks = {}

        try:
            for root, dirs, files in os.walk(
                f"{webServer['configuration_path']}/sites-available"
            ):

                for file in files:
                    try:
                        with open(os.path.join(root, file), "r+") as f:
                            serverBlocks[file] = self.parseSite(f, webServer, file)
                    except Exception as e:
                        logger.error(
                            f"Something wen't wrong trying to parse {file}: {e}"
                        )
            return serverBlocks
        except Exception as e:
            logger.error(
                f"Something wen't wrong while walking through Nginx files: {e}"
            )

    def parseSite(self, file, webServer, fileName):
        try:
            serverBlocks = []
            inServerBlock = False

            replacements = {}
            invalidCert = False  # When an invalidCert is found it's corresponding server block is removed...

            blockBuffer = ""

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
                        # Currently: If the certificate is not considered valid the virtual host is not saved
                        # blockBuffer contains the entire server block, I could add it to replacements and remove it
                        # if invalid...
                        if invalidCert:
                            replacements[blockBuffer] = ""
                            invalidCert = False
                        else:
                            try:
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
                                if not response:
                                    replacements[blockBuffer] = ""
                                else:
                                    serverBlocks.append(completeServerBlock)
                            except Exception as e:
                                logger.error(
                                    f"Something wen't wrong while building the server block for {serverNames}: {e}"
                                )
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
                                    logger.warning(
                                        f"Warning: found multiple certificates in the same server block for {fileName}"
                                    )
                                    continue
                                certificatePath = value
                                # Move the certificate to /etc/ssl/certs/autossl/fileName
                                name = certificatePath.split("/")[-1]
                                try:
                                    if (
                                        certificatePath
                                        != f"/etc/ssl/certs/autossl/{name}"
                                    ):
                                        shutil.move(
                                            certificatePath,
                                            f"/etc/ssl/certs/autossl/{name}",
                                        )
                                        certificatePath = (
                                            f"/etc/ssl/certs/autossl/{name}"
                                        )
                                        # Replace the certificate path with the new path
                                        replacements[line] = line.replace(
                                            value, certificatePath
                                        )
                                        logger.info(
                                            f"Moved {value} to {certificatePath}"
                                        )
                                    # This might be dumb but I open and close it just to try if it exists
                                    else:
                                        f = open(certificatePath)
                                        f.close()
                                except FileNotFoundError or OSError:
                                    invalidCert = True
                                    logger.warning(
                                        f"{certificatePath} found in {fileName} config does not exist"
                                    )
                            if "ssl_certificate_key" == lineSplit[j].strip():
                                value = (
                                    (" ".join(lineSplit[j + 1 :]).split("#")[0])
                                    .strip(" ")
                                    .strip("\n")
                                    .strip(";")
                                )

                                if certPrivateKeyPath is not None:
                                    logger.warning(
                                        f"Found multiple certificate keys in the same server block for {fileName}"
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
                                        logger.info(
                                            f"Moved {value} to {certPrivateKeyPath}"
                                        )
                                    # This might be dumb but I open and close it just to force the exception
                                    else:
                                        f = open(certPrivateKeyPath)
                                        f.close()
                                except FileNotFoundError or OSError:
                                    logger.warning(
                                        f"{certPrivateKeyPath} found in {fileName} config does not exist"
                                    )
                                    invalidCert = True
                            else:
                                continue
                    if "root" in line:
                        value = self.getDirectiveValues("root", line)
                        root = value
                    blockBuffer += line
            if len(replacements) == 0:
                logger.info(f"No changes were made to {fileName} configuration")
            else:
                logger.info(
                    f"Made {len(replacements)} changes to {fileName} configuration"
                )

            try:
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
            except Exception as e:
                logger.error(
                    f"Something went wrong while trying to write the replacements in {fileName}: {e}"
                )
            return serverBlocks
        except Exception as e:
            logger.error(f"Something went wrong while parsing {fileName}: {e}")

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
            except Exception as e:
                logger.error(
                    f"Something went wrong while trying to parse the certificate in '{certificatePath}': {e}"
                )
                certificate = None
                return False  # If certificate parsing fails straight up don't save the virtual host
        try:
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
        except Exception as e:
            logger.error(
                f"Something went wrong trying to build the virtual host dictionary of update data: {e}"
            )

    """
        This function summarizes the parsing of a line to extract the value for the directive
    """

    def getDirectiveValues(self, directive, line):
        try:
            lineSplit = line.split(" ")
            for j in range(len(lineSplit)):
                if directive in lineSplit[j]:
                    return (
                        (" ".join(lineSplit[j + 1 :]).split("#")[0])
                        .strip(" ")
                        .strip("\n")
                        .strip(";")
                    )
        except Exception as e:
            logger.error(
                f"Something went wrong while trying to extract the value of a directive: {e}"
            )
