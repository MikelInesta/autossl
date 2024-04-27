from .x509Parser import x509Parser
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
import os


class CertificateUtils:

    @staticmethod
    def processCertificate(certificatePath):
        with open(certificatePath, "rb") as file:
            caBuff = file.read()
        certificate = x509Parser.parse_x509(caBuff, ignore_extensions=True)
        return certificate

    @staticmethod
    def getCsr(domain):
        # Here I should use pulumi or something to actually generate the csr
        # but for now im just testing communication
        return "csr"

    @staticmethod
    def writePrivateKey(path):
        key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        with open(path, "wb") as f:
            pk = key.private_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PrivateFormat.TraditionalOpenSSL,
                encryption_algorithm=serialization.BestAvailableEncryption(
                    os.urandom(32)
                ),
            )
            f.write(pk)
