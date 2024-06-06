import base64
import binascii
from .CertifcateUtils import CertificateUtils
from zipfile import ZipFile
import shutil, os, time


class InstallCertificate:
    @staticmethod
    def createCertificateFile(file, domainName):
        dir = CertificateUtils.createTempDir()
        CertificateUtils.writeDataIntoFile(file, f"{dir}/temp.zip")
        CertificateUtils.extractZip(f"{dir}/temp.zip", dir)

    @staticmethod
    def writeDataIntoFile(data, path):
        with open(path, "wb") as f:
            f.write(data)

    # Create a temporary directory
    @staticmethod
    def createTempDir():
        try:
            name = os.mkdir("temp")
        except FileExistsError:
            name = os.mkdir("temp" + str(time.time()))
        return name

    @staticmethod
    def removeDirectoryAndContents(dir):
        try:
            shutil.rmtree(dir)
        except OSError as e:
            print("Error: %s - %s." % (e.filename, e.strerror))

    @staticmethod
    def extractZip(zipPath, extractPath):
        dir = CertificateUtils.createTempDir()
        with ZipFile(zipPath) as zObject:
            zObject.extractall(path=extractPath)

    @staticmethod
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

    @staticmethod
    def installNewCertificate(data):
        if "fileExtension" not in data or "file" not in data:
            print("Error: Missing extension or file in the request")
            return False

        # If the fileExtension is .zip I'll need to extract the files
        if ".zip" in data["fileExtension"]:
            extractedFiles = CertificateUtils.extractZip(data["file"])

        encodedFile = data["file"]
        try:
            decodedFile = InstallCertificate.decodeBase64(encodedFile)
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
