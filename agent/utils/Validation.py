import hashlib, os, subprocess
from OpenSSL import crypto

"""
  Purpose of this class is to group static methods used to validate
  wether the certificate installation processes are properly done
"""


class Validation:
    """
    Funtion to validate if a certain domain has everything it needs for the ssl certificate
    to be used in the web server
    """

    @staticmethod
    def validateDomain(domainName):

        keyPath = f"/etc/ssl/private/autossl/{domainName}.key"
        certPath = f"/etc/ssl/certs/autossl/{domainName}.crt"

        # Check if they exist
        if os.path.isfile(keyPath) is False:
            print(f"The required private key '{keyPath}' was not found.")
            return False
        if os.path.isfile(certPath) is False:
            print(f"The required private key '{certPath}' was not found.")
            return False

        # Check if they are in pem format
        res = Validation.shellCommand(
            ["openssl", "rsa", "-inform", "PEM", "-in", "/tmp/ssl.key"]
        )

    """
        Execute shell command and return the result
        Using this might be risky but I'm in a hurry and there is no ready
        alternative yet in pyopenssl
    """

    def shellCommand(command):
        try:
            proc = subprocess.Popen(
                command, stdout=subprocess.PIPE, stderr=subprocess.PIPE
            )

            o, e = proc.communicate()

            return o.decode("ascii")
        except e:
            print(f"Something went wrong executing a shell command: {e}")
            return e.decode("ascii")


"""

@staticmethod
    def validateKeyCert(domainName):
        with open(f"/etc/ssl/private/autossl/{domainName}.key", "rb") as f:
            privKeyData = f.read()
        privKey = crypto.load_privatekey(crypto.FILETYPE_PEM, privKeyData)

        with open(f"/etc/ssl/certs/autossl/{domainName}.key", "rb") as f:
            certData = f.read()
        cert = crypto.load_privatekey(crypto.FILETYPE_PEM, certData)

    @staticmethod
    def getCertModulus(cert):
        pubKeyData = cert.get_pubKey()
        asn1Data = crypto.dump_publickey(crypto.FILETYPE_ASN1, pubKeyData)
        pubKeyAsn1 = crypto.load_publickey(crypto.FILETYPE_ASN1, asn1Data)
        return pubKeyAsn1.to_cryptography_key().public_numbers().n

    @staticmethod
    def getKeyModulus(privKey):
        asn1Data = crypto.dump_privatekey(crypto.FILETYPE_ASN1, privKey)
        privKeyAsn1 = crypto.load_privatekey(crypto.FILETYPE_ASN1, asn1Data)
        return privKeyAsn1.to_cryptography_key().private_numbers().public_numbers.n

    @staticmethod
    def md5Hex(data):
        hash = hashlib.md5()
        hash.update(data)
        return hash.hexdigest()

"""
