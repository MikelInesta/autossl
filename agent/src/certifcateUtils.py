import json
import requests
import os

from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa

from x509Parser import x509Parser
from config import config, logger

apiEndpoint = config["SERVER_ADDRESS"]


class CertificateUtils:

    @staticmethod
    def updateCertificates():
        try:
            certificates = []
            # Walk through the application's certificates directory
            for root, dirs, files in os.walk("/etc/ssl/certs/autossl", topdown=False):
                for name in files:
                    try:
                        nameSplit = name.split(".")
                        last = nameSplit[-1]
                    except Exception as e:
                        logger.error(
                            f"Something went wrong while trying to extract the id from certificates: {e}"
                        )

                    if "crt" not in last:
                        try:
                            response = requests.get(
                                f"{apiEndpoint}/certificates/id/{last}"
                            )
                        except Exception as e:
                            logger.error(
                                f"Something went wrong trying to check wether a certificate is valid: {e}"
                            )
                        if response.ok:
                            certificates.append(last)
                        else:
                            logger.warning(
                                f"Found the following certificate which is not valid: {name}"
                            )
            certificatesJson = json.dumps(certificates)
            try:
                response = requests.post(
                    f"{apiEndpoint}/domains/update-certificates", data=certificatesJson
                )
                if not response.ok:
                    raise Exception(
                        f"Received a negative status in response when trying to update certificates: {response}"
                    )
            except Exception as e:
                logger.error(
                    f"Something wen't wrong trying to update the certificates: {e}"
                )
            logger.info("Successfully updated the certificates")
        except Exception as e:
            print(f"Something went wrong in updating the certificates: {e}")

    @staticmethod
    def processCertificate(certificatePath):
        try:
            with open(certificatePath, "rb") as file:
                caBuff = file.read()
        except Exception as e:
            logger.error(f"Something went wrong reading the certificate file: {e}")
            return None

        try:
            certificate = x509Parser.parse_x509(caBuff, ignore_extensions=True)
        except Exception as e:
            logger.error(f"Something went wrong parsing the certificate: {e}")
            return None

        return certificate

    """
        Writes (if it does not exist yet) a private key with the required
        domain name both for creating the csr and later using the ssl certificate.
        The key is saved as /etc/ssl/private/autossl/domain.key
    """

    @staticmethod
    def writePrivateKey(path):
        if os.path.exists(path):
            return

        try:
            key = rsa.generate_private_key(
                public_exponent=65537,
                key_size=2048,
            )
        except Exception as e:
            logger.error(f"Something went wrong generating the rsa key: {e}")

        try:
            with open(path, "wb") as f:
                pk = key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.TraditionalOpenSSL,
                    encryption_algorithm=serialization.NoEncryption(),
                )
                f.write(pk)
        except Exception as e:
            logger.error(f"Something went wrong writing the generated private key: {e}")

    """
        Reads the file in 'path' as a pem encoded private key with no password
        and returns the data
    """

    @staticmethod
    def readPrivateKey(path):
        try:
            with open(path, "rb") as f:
                keyData = f.read()
            return serialization.load_pem_private_key(data=keyData, password=None)
        except Exception as e:
            logger.error(f"Couldn't read the private key: {e}")
