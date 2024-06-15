import json
import requests

from cryptography import x509
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.x509.oid import NameOID

from certifcateUtils import CertificateUtils
from config import config, logger

try:
    apiEndpoint = config["SERVER_ADDRESS"]
except KeyError as e:
    logger.error(f"Couldn't get {e} from config")
    exit(-1)


class CertificateSigningRequest:
    @staticmethod
    def sendNewCsr(data):
        try:
            domainNames = data["domain_names"]
        except KeyError as e:
            logger.error(f"Key {e} not in received data")
            return

        if domainNames == "":
            logger.error(f"Domain names data received is empty: {domainNames}")
            return

        domainName = domainNames.split(" ")[0]
        pkPath = f"/etc/ssl/private/autossl/{domainName}.key"

        try:
            CertificateUtils.writePrivateKey(pkPath)
        except Exception as e:
            logger.error(f"Something went wrong writing the private key for csr: {e}")
            return

        try:
            pk = CertificateUtils.readPrivateKey(pkPath)
        except Exception as e:
            logger.error(f"Something went wrong reading the private key for csr: {e}")
            return

        try:
            csr = CertificateSigningRequest.buildCsr(pk, data)
        except Exception as e:
            logger.error(f"Something went wrong building the csr data: {e}")
            return

        try:
            csrPem = csr.public_bytes(serialization.Encoding.PEM)
        except Exception as e:
            logger.error(f"Something went wrong PEM encoding the csr data: {e}")
            return

        try:
            virtualHostId = data["_id"]
        except KeyError as e:
            logger.error(f"Couldn't get the virtual host id {e} from the received data")
            return

        try:
            csrJson = json.dumps(
                {"virtual_host_id": virtualHostId, "csr": csrPem.decode("utf-8")}
            )
        except Exception as e:
            logger.error(f"Something went wrong dumping the csr data into json: {e}")
            return

        try:
            res = requests.post(
                f"{apiEndpoint}/agents/csr",
                data=csrJson,
                headers={"Content-Type": "application/json"},
            )
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                logger.info("CSR sent succesfully")
        except Exception as e:
            logger.error(f"Something went wrong trying to send the CSR: {e}")
            return

    @staticmethod
    def buildCsr(key, data):
        domains = data["domain_names"].split(" ")
        dnsNames = []
        # Create the DNSName elem for every domain name in the data into an array
        for domain in domains:
            dnsNames.insert(len(dnsNames) - 1, x509.DNSName(domain))

        try:
            country = data["country"]
        except KeyError as e:
            logger.error(f"Couldn't get the {e} from data, can't create the csr")
            return

        try:
            state = data["state"]
        except KeyError:
            state = ""

        try:
            locality = data["locality"]
        except KeyError:
            locality = ""

        try:
            organizationName = data["organizationName"]
        except KeyError:
            organizationName = ""

        try:
            commonName = data["commonName"]
        except KeyError:
            commonName = ""

        try:
            csr = (
                x509.CertificateSigningRequestBuilder()
                .subject_name(
                    x509.Name(
                        [
                            x509.NameAttribute(NameOID.COUNTRY_NAME, country),
                            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, state),
                            x509.NameAttribute(NameOID.LOCALITY_NAME, locality),
                            x509.NameAttribute(
                                NameOID.ORGANIZATION_NAME, organizationName
                            ),
                            x509.NameAttribute(NameOID.COMMON_NAME, commonName),
                        ]
                    )
                )
                .add_extension(
                    x509.SubjectAlternativeName(dnsNames),
                    critical=False,
                )
                .sign(key, hashes.SHA256())
            )
            return csr
        except Exception as e:
            logger.error(f"Something wen't wrong building the x509 CSR: {e}")
            return


"""

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

"""
