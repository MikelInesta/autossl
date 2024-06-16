import base64
import binascii
import requests
import shutil
import os
import time
import glob

from zipfile import ZipFile

from config import config, logger

try:
    apiEndpoint = config["SERVER_ADDRESS"]
    certificateFileExtensions = ["crt", "ca-bundle"]
except KeyError as e:
    logger.error(f"Couldn't get a necessary key {e}")

class InstallCertificate:
    @staticmethod
    def installNewCertificate(data):
        
        try:
            fileData = data["file"]
            fileExtension = data["fileExtension"]
        except KeyError as e:
            logger.error(f"Missing key {e} in install request data")
            return False

        # File currently must be .zip
        if "zip" not in fileExtension:
            logger.error("File extension is not zip")
            return False

        try:
            domainNames = data["domain_names"]
        except KeyError as e:
            logger.error(f"Missing 'domain_names' key in data: {e}")
            return False
        
        splitDomainNames = domainNames.split(" ")
        domainName = splitDomainNames[0]

        try:
            decodedFile = InstallCertificate.decodeBase64(fileData)
        except Exception as e:
            logger.error(f"Error decoding base64: {e}")
            return False

        try:
            # Create a temporary directory to extract the files
            tempDir = InstallCertificate.createTempDir()
        except Exception as e:
            logger.error(f"Error creating temporary directory: {e}")
            return False

        try:
            # Write the data to the filesystem as a .zip file
            InstallCertificate.writeDataIntoFile(decodedFile, f"{tempDir}/temp.zip")
        except Exception as e:
            logger.error(f"Error writing data to filesystem: {e}")
            return False

        try:
            # Extract the .zip file
            InstallCertificate.extractZip(f"{tempDir}/temp.zip", f"{tempDir}/extracted")
        except Exception as e:
            logger.error(f"Error extracting zip file: {e}")
            return False

        try:
            # Recursively search for certificate files in the extracted files
            crtFiles = InstallCertificate.findCrtFiles(f"{tempDir}/extracted")
        except Exception as e:
            logger.error(f"Something went wrong finding crt files: {e}")
            return False


        primaryCert = None
        intermediateCerts = []
        caBundle = None
        rootCert = None


        # Identify the type of files provided
        for file in crtFiles:
            if domainName in file:
                primaryCert = file
            elif "intermediate" in file or "chain" in file:
                intermediateCerts.append(file)
            if "root" in file:
                rootCert = file
            elif "bundle" in file:
                caBundle = file

        logger.info(f"Certificate files found: {crtFiles}")
        
        try:
            InstallCertificate.concatenateCerts(
                primaryCert, intermediateCerts, caBundle, rootCert, domainName, domainNames
            )
        except Exception as e:
            logger.error(f"Something went wrong concatenating the certificates: {e}")
        
        try:
            # Remove the temporary directory and its contents
            InstallCertificate.removeDirectoryAndContents(tempDir)
        except Exception as e:
            logger.error(f"Something went wrong removing the temporary directory: {e}")

        logger.info(f"Certificate placed in /etc/ssl/certs/autossl/{domainName}.crt")

        try:
            InstallCertificate.configureNginx(domainNames)
        except Exception as e:
            logger.error(f"Something went wrong configuring Nginx for the new certificate: {e}")
        
        # It's important to make sure everything the agent changed
        # is properly set up because nginx crashes in case it's not
        
        # Restart nginx
        try:
            os.system("systemctl restart nginx")
        except Exception as e:
            logger.error(f"Something went wrong restarting the Nginx service: {e}")

        return True
            
    @staticmethod
    def getDomain(domainNames):
        try:
            res = requests.get(f"{apiEndpoint}/virtual-hosts/get-domain/{domainNames}")
            if res.status_code != 200:
                raise Exception(f"Received bad response: {res}")
            else:
                data = res.json()
                return data
        except Exception as e:
            logger.error(f"Something went wrong getting the domain: {e}")
            return None
    
    @staticmethod
    def configureNginx(domainNames):
        try:
            domainData = InstallCertificate.getDomain(domainNames)
            certificateId = domainData.get("certificate_id", None)
            hasCertificate = False if certificateId is None else True  
            logger.info(f"Does {domainNames} have a certificate? -> {hasCertificate}")
        except Exception as e:
            logger.error(f"Something went wrong trying to access domain data: {e}")
            return False        
        try:
            root = f"\nroot {domainData["root"]};"
        except KeyError:
            root = ''
    
        domainName = domainNames.split(" ")[0]
        if hasCertificate is False:
            try:
                # Write the new ssl server block to the nginx configuration file
                with open(f"/etc/nginx/sites-available/{domainData["configuration_file"]}", "r") as f:
                    sslBlock = f"""server{{\nlisten 443 ssl;\nserver_name {domainNames};{root}\n ssl_certificate /etc/ssl/certs/autossl/{domainName}.crt;\n ssl_certificate_key /etc/ssl/private/autossl/{domainName}.key;\n}}"""
                    fileData = f.read()
                    newFileData = f"{sslBlock}\n{fileData}"
                with open(f"/etc/nginx/sites-available/{domainData["configuration_file"]}", "w") as f:
                    f.write(newFileData)
            except Exception as e:
                logger.error(f"Error writing the new ssl server block to the configuration file: {e}")
                
        

    @staticmethod
    def writeDataIntoFile(data, path):
        try:
            with open(path, "wb") as f:
                f.write(data)
        except Exception as e:
            logger.error(f"Something went wrong writing data into a file: {e}")

    @staticmethod
    def createTempDir():
        try:
            name = "temp"
            os.mkdir("temp")
        except FileExistsError:
            name = "temp" + str(time.time())
            os.mkdir(name)
        return name

    @staticmethod
    def removeDirectoryAndContents(dir):
        try:
            shutil.rmtree(dir)
        except OSError as e:
            logger.error("Something went wrong deleting  %s - %s." % (e.filename, e.strerror))

    @staticmethod
    def extractZip(zipPath, extractPath):
        try:
            with ZipFile(zipPath) as zObject:
                zObject.extractall(path=extractPath)
        except Exception as e:
            logger.error(f"Error extracting zip: {e}")

    @staticmethod
    def decodeBase64(data):
        try:
            # Remove (if exists) the metadata from the base64 string
            splitData = data.split(",")
            if len(splitData) > 1:
                cleanedData = splitData[1]
            else:
                cleanedData = splitData[0]
            return base64.b64decode(cleanedData)
        except binascii.Error as e:
            logger.error(f"Error decoding base64: {e}")
            return None

    @staticmethod
    def findCrtFiles(searchPath):
        files = []
        try:
            for f in glob.glob(f"{searchPath}/**/*", recursive=True):
                if f.split(".")[-1] in certificateFileExtensions:
                    files.append(f)
            return files
        except Exception as e:
            logger.error(f"Something went wrong finding crt files: {e}")

    @staticmethod
    def concatenateCerts(
        primaryCert, intermediateCerts, caBundle, rootCert, domainName, domainNames
    ):
        try:

            primaryCertData = intermediateCertsData = rootCertData = caBundleData = ""

            # Concatenate the primary certificate and intermediate certificates
            try:
                with open(primaryCert, "r") as f:
                    primaryCertData = f.read()
            except Exception as e:
                logger.error(f"Something went wrong opening the file {primaryCert}. : {e}")
                return

            if len(intermediateCerts) > 0:
                intermediateCertsData = ""
                for cert in intermediateCerts:
                    with open(cert, "r") as f:
                        intermediateCertsData += f.read()

            if rootCert is not None:
                with open(rootCert, "r") as f:
                    rootCertData = f.read()

            if caBundle is not None:
                with open(caBundle, "r") as f:
                    caBundleData = f.read()
                    
            try:
                domainData = InstallCertificate.getDomain(domainNames)
                certificateId = domainData.get("certificate_id", None)
                hasCertificate = False if certificateId is None else True  
                logger.info(f"Domain {domainNames} has certificate? -> {hasCertificate}")
            except Exception as e:
                logger.error(f"Something went wrong trying to access domain data: {e}")
                return False  
                    
            if hasCertificate:
                try:
                    certificatePath = domainData["certificate_path"]
                except Exception as e:
                    logger.error(f"Couldnt retrieve necessary certificate data: {e}")
                    return False
                try:
                    newPath = f"{certificatePath}.{certificateId}" # New name of the old certificate
                    shutil.move(certificatePath, newPath) # Move the current certificate to its dom.id
                    logger.info(f"Moved {certificatePath} to {certificatePath}.{certificateId}")
                except Exception as e:
                    logger.error(f"Error changing the name of the existing certificate: {e}")
            
            installPath = f"/etc/ssl/certs/autossl/{domainName}.crt"

            with open(installPath, "w") as f:
                f.write(
                    primaryCertData + "\n"
                    + caBundleData + "\n"
                    + intermediateCertsData + "\n"
                    + rootCertData
                )

            return True
        except Exception as e:
            logger.error(f"Error concatenating certificates: {e}")
            return False
