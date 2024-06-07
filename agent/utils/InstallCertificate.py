import base64
import binascii
from .CertifcateUtils import CertificateUtils
from zipfile import ZipFile
import shutil, os, time
import glob

certificateFileExtensions = ["crt", "ca-bundle"]


class InstallCertificate:
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
        decodedFile = InstallCertificate.decodeBase64(data["file"])

        # Create a temporary directory to extract the files
        tempDir = InstallCertificate.createTempDir()

        # Write the data to the filesystem as a .zip file
        InstallCertificate.writeDataIntoFile(decodedFile, f"{tempDir}/temp.zip")

        # Extract the .zip file
        InstallCertificate.extractZip(f"{tempDir}/temp.zip", f"{tempDir}/extracted")

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

        InstallCertificate.concatenateCerts(
            primaryCert, intermediateCerts, caBundle, rootCert, domainName
        )

        print(f"Certificate placed in /etc/ssl/certs/{domainName}.crt")

        # Remove the temporary directory and its contents
        InstallCertificate.removeDirectoryAndContents(tempDir)

        InstallCertificate.configureNginx(domainNames)

        return True

    @staticmethod
    def concatenateCerts(
        primaryCert, intermediateCerts, caBundle, rootCert, domainName
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

            with open(f"/etc/ssl/certs/{domainName}.crt", "w") as f:
                f.write(
                    primaryCertData
                    + caBundleData
                    + intermediateCertsData
                    + rootCertData
                )

            return True
        except Exception as e:
            print(f"Error concatenating certificates: {e}")
            return False
