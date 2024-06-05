from CertifcateUtils import CertificateUtils
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
