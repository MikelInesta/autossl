from .x509Parser import x509Parser
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import os


class CertificateUtils:

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
