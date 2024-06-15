import json
import requests
import os

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from x509Parser import x509Parser
from config import config

apiEndpoint = config["SERVER_ADDRESS"]


class CertificateUtils:

    @staticmethod
    def updateCertificates():
        try:
            certificates = []
            # Walk through the application's certificates directory
            for root, dirs, files in os.walk("/etc/ssl/certs/autossl", topdown=False):
                for name in files:
                    # Name's gonna be either domain.crt or domain.crt.id
                    nameSplit = name.split(".")
                    last = nameSplit[-1]
                    # There is no need to update the current certificate, that one gets updated
                    # in the regular agent update :)
                    if "crt" not in last:
                        response = requests.get(f"{apiEndpoint}/certificates/id/{last}")
                        if response.ok:
                            certificates.append(last)
            certificatesJson = json.dumps(certificates)
            print(f"Sending certs: {certificatesJson}")
            response = requests.post(
                f"{apiEndpoint}/domains/update-certificates", data=certificatesJson
            )
            if not response.ok:
                raise Exception
        except Exception as e:
            print(f"Something went wrong trying to update certificates: {e}")

    @staticmethod
    def processCertificate(certificatePath):
        try:
            with open(certificatePath, "rb") as file:
                caBuff = file.read()
        except Exception as e:
            print(f"Error reading the certificate file: {e}")
            return None
        try:
            certificate = x509Parser.parse_x509(caBuff, ignore_extensions=True)
        except Exception as e:
            print(f"Error parsing the certificate: {e}")
            return None
        return certificate

    @staticmethod
    def writePrivateKey(path):
        # If the key already exists return
        if os.path.exists(path):
            return

        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        with open(path, "wb") as f:
            pk = key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.NoEncryption(),
            )
            f.write(pk)

    @staticmethod
    def readPrivateKey(path):
        with open(path, "rb") as f:
            keyData = f.read()
        return serialization.load_pem_private_key(data=keyData, password=None)
