from .x509Parser import x509Parser
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa


class CertificateUtils:

    @staticmethod
    def processCertificate(certificatePath):
        with open(certificatePath, "rb") as file:
            caBuff = file.read()
        certificate = x509Parser.parse_x509(caBuff, ignore_extensions=True)
        return certificate

    @staticmethod
    def writePrivateKey(path, passwd):
        try:
            key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
            )
            bytePasswd = passwd.encode("UTF-8")
            with open(path, "wb") as f:
                pk = key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.BestAvailableEncryption(
                        bytePasswd
                    ),
                )
                f.write(pk)
        except Exception as e:
            print(f"Something went wrog with writePrivateKey: {e}")

    @staticmethod
    def readPrivateKey(path, passwd):
        with open(path, "rb") as f:
            keyData = f.read()
        bytePasswd = passwd.encode("UTF-8")
        return serialization.load_pem_private_key(data=keyData, password=bytePasswd)
