import json
import requests

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.x509.oid import NameOID

from certifcateUtils import CertificateUtils
from config import config
from installCertificate import InstallCertificate

apiEndpoint = config["SERVER_ADDRESS"]


class CertificateSigningRequest:
    # Main called method
    @staticmethod
    def sendNewCsr(data):
        domainNames = data["domain_names"]
        if not domainNames or domainNames == "":
            print("Error: No domain names in the request")
            return False
        domainName = domainNames.split(" ")[0]
        pkPath = f"/etc/ssl/private/autossl/{domainName}.key"

        # If the domain has a certificate and a csr already exists
        # I'll associate it to the certificate before overwriting
        """
        try:
            CertificateSigningRequest.associateToCertificate(domainNames)
        except Exception as e:
            print(f"Something went wrong associating the csr to a certificate: {e}")
        """

        # I'm not encrypting the private key anymore
        try:
            CertificateUtils.writePrivateKey(pkPath)
        except Exception:
            print("Error writing the private key")
        try:
            pk = CertificateUtils.readPrivateKey(pkPath)
        except Exception:
            print("Error reading the private key")
        try:
            csr = CertificateSigningRequest.buildCsr(pk, data)
        except Exception:
            print("Error building the CSR")

        try:
            csrPem = csr.public_bytes(serialization.Encoding.PEM)
        except Exception:
            print("Error encoding the csr")
        csrJson = json.dumps(
            {"virtual_host_id": data["_id"], "csr": csrPem.decode("utf-8")}
        )
        if config["SERVER_ADDRESS"]:
            res = requests.post(
                f"{config['SERVER_ADDRESS']}/agents/csr",
                data=csrJson,
                headers={"Content-Type": "application/json"},
            )
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                print("CSR sent successfully")
                return True
        else:
            raise Exception("Could not get the SERVER_ADDRESS constant from config")

    @staticmethod
    def associateToCertificate(domainNames):
        hasCertData = InstallCertificate.hasCertificate(domainNames)
        if hasCertData is None:
            return
        vhid = hasCertData["_id"]
        res = requests.get(f"{apiEndpoint}/virtual-hosts/associate-csr-cert/{vhid}")
        if res.status_code != 200:
            raise Exception(
                f"Something went wrong requesting csr association: {res.status_code}"
            )

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
