import base64
import binascii

import requests
from zipfile import ZipFile
import shutil, os, time
import glob
from agent.src.config import config
from .Validation import Validation

apiEndpoint = config["SERVER_ADDRESS"]
certificateFileExtensions = ["crt", "ca-bundle"] # Im only accepting basic stuff rn 

class InstallCertificate:
    # Main method
    @staticmethod
    def installNewCertificate(data):
        if "fileExtension" not in data or "file" not in data:
            print("Error: Missing extension or file in the request")
            return False

        # File currently must be .zip
        if "zip" not in data["fileExtension"]:
            print("Error: File extension is not zip")
            return False

        try:
            domainNames = data["domain_names"]
        except KeyError as e:
            print(f"Missing 'domain_names' key in data: {e}")
            return False
        splitDomainNames = domainNames.split(" ")
        domainName = splitDomainNames[0]

        # Decode the .zip file in data["file"]
        try:
            decodedFile = InstallCertificate.decodeBase64(data["file"])
        except Exception as e:
            print(f"Error decoding base64: {e}")
            return False

        try:
            # Create a temporary directory to extract the files
            tempDir = InstallCertificate.createTempDir()
        except Exception as e:
            print(f"Error creating temporary directory: {e}")
            return False

        try:
            # Write the data to the filesystem as a .zip file
            InstallCertificate.writeDataIntoFile(decodedFile, f"{tempDir}/temp.zip")
        except Exception as e:
            print(f"Error writing data to filesystem: {e}")
            return False

        try:
            # Extract the .zip file
            InstallCertificate.extractZip(f"{tempDir}/temp.zip", f"{tempDir}/extracted")
        except Exception as e:
            print(f"Error extracting zip file: {e}")
            return False

        # Recursively search for certificate files in the extracted files
        crtFiles = InstallCertificate.findCrtFiles(f"{tempDir}/extracted")

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

        print(f"Certificate files found: {crtFiles}")

        InstallCertificate.configureNginx(domainNames)
        
        InstallCertificate.concatenateCerts(
            primaryCert, intermediateCerts, caBundle, rootCert, domainName, domainNames
        )
        
        # Remove the temporary directory and its contents
        InstallCertificate.removeDirectoryAndContents(tempDir)

        print(f"Certificate placed in /etc/ssl/certs/autossl/{domainName}.crt")
        
        # It's important to make sure everything the agent changed
        # is properly set up because nginx crashes in case it's not
        
        # Restart nginx
        os.system("systemctl restart nginx")

        return True
            
    
    
    @staticmethod
    def getDomain(domainNames):
        try:
            res = requests.get(f"{apiEndpoint}/virtual-hosts/get-domain/{domainNames}")
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                data = res.json()
                return data
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def hasCertificate(domainNames):
        try:
            res = requests.get(f"{apiEndpoint}/virtual-hosts/has-certificate/{domainNames}")
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                data = res.json()
                return data
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    @staticmethod
    def configureNginx(domainNames):
        try:
            domainData = InstallCertificate.getDomain(domainNames)
            certificateId = domainData.get("certificate_id", None) # gotta be careful when accesing keys and error handling
            if certificateId is None:
                hasCertificate = False
            else:
                hasCertificate = True
        except Exception as e:
            print(f"Something went wrong trying to access domain data: {e}")
            return False        
        try:
            root = f"\nroot {domainData["root"]};"
        except Exception as e:
            root = ''
    
        domainName = domainNames.split(" ")[0]

        # Change the name of the current certificate either to the certificate_id or the current date
        if hasCertificate:
            try:
                certificatePath = domainData["certificate_path"]
                privateKeyPath = domainData["certificate_key_path"]
            except Exception as e:
                print(f"Couldnt retrieve necessary certificate data: {e}")
                return False
            try:
                newPath = f"{certificatePath}.{certificateId}" # New name of the old certificate
                shutil.move(certificatePath, newPath)
                print(f"Moved {certificatePath} to {certificatePath}.{certificateId}")
                # Maybe here make a copy of the private key with the name {pkeyPath}.{certificateId} in case different keys are used for different certs for rollback
                try:
                    shutil.copy2(privateKeyPath,f"{privateKeyPath}.{certificateId}")
                except Exception as e:
                    print(f"Error creating a copy of the private key: {e}")
            except Exception as e:
                print(f"Error changing the name of the existing certificate: {e}")
        else:
            try:
                # Write the new ssl server block to the nginx configuration file
                with open(f"/etc/nginx/sites-available/{domainData["configuration_file"]}", "r") as f:
                    sslBlock = f"""server{{\nlisten 443 ssl;\nserver_name {domainNames};{root}\n ssl_certificate /etc/ssl/certs/autossl/{domainName}.crt;\n ssl_certificate_key /etc/ssl/private/autossl/{domainName}.key;\n}}"""
                    fileData = f.read()
                    newFileData = f"{sslBlock}\n{fileData}"
                with open(f"/etc/nginx/sites-available/{domainData["configuration_file"]}", "w") as f:
                    f.write(newFileData)
            except Exception as e:
                print(f"Error writing the new ssl server block to the configuration file: {e}")
                
        

    @staticmethod
    def writeDataIntoFile(data, path):
        with open(path, "wb") as f:
            f.write(data)

    # Create a temporary directory
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
            print("Error: %s - %s." % (e.filename, e.strerror))

    @staticmethod
    def extractZip(zipPath, extractPath):
        try:
            with ZipFile(zipPath) as zObject:
                zObject.extractall(path=extractPath)
        except Exception as e:
            print(f"Error extracting zip: {e}")

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
            print(f"Error decoding base64")
            return None

    @staticmethod
    def findCrtFiles(searchPath):
        files = []
        for f in glob.glob(f"{searchPath}/**/*", recursive=True):
            if f.split(".")[-1] in certificateFileExtensions:
                files.append(f)
        return files

    @staticmethod
    def concatenateCerts(
        primaryCert, intermediateCerts, caBundle, rootCert, domainName, domainNames
    ):
        try:
            if primaryCert is None:
                print("Error: No primary certificate found")
                return False

            primaryCertData = intermediateCertsData = rootCertData = caBundleData = ""

            # Concatenate the primary certificate and intermediate certificates
            with open(primaryCert, "r") as f:
                primaryCertData = f.read()

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
            
            installPath = f"/etc/ssl/certs/autossl/{domainName}.crt"
            domain = InstallCertificate.hasCertificate(domainNames)
            if domain is not None:
                if domain["certificate_path"] is not None:
                    installPath = domain["certificate_path"]

            with open(installPath, "w") as f:
                f.write(
                    primaryCertData + "\n"
                    + caBundleData + "\n"
                    + intermediateCertsData + "\n"
                    + rootCertData
                )

            return True
        except Exception as e:
            print(f"Error concatenating certificates: {e}")
            return False
