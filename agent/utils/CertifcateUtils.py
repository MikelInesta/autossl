from .x509Parser import x509Parser
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes


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

    @staticmethod
    def buildCsr(key, data):
        domains = data["domain_names"].split()
        dnsNames = []
        # Create the DNSName elem for every domain name in the data into an array
        for domain in domains:
            dnsNames.insert(len(dnsNames) - 1, x509.DNSName(domain))

        csr = (
            x509.CertificateSigningRequestBuilder()
            .subject_name(
                x509.Name(
                    [
                        # Provide various details about who we are.
                        x509.NameAttribute(NameOID.COUNTRY_NAME, data["country"]),
                        x509.NameAttribute(
                            NameOID.STATE_OR_PROVINCE_NAME, data["state"]
                        ),
                        x509.NameAttribute(NameOID.LOCALITY_NAME, data["locality"]),
                        x509.NameAttribute(
                            NameOID.ORGANIZATION_NAME, data["organizationName"]
                        ),
                        x509.NameAttribute(NameOID.COMMON_NAME, data["commonName"]),
                    ]
                )
            )
            .add_extension(
                x509.SubjectAlternativeName(dnsNames),
                critical=False,  # I believe nothing here is critical but i might need to change this
            )
            .sign(key, hashes.SHA256())
        )
        return csr
