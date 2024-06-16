# Author : Sean Wright
# Github: https://github.com/SeanWrightSec/x509-parser
# Licence: Apache-2.0
import json

from OpenSSL import crypto
from datetime import datetime

from config import logger


def bytes_to_string(bytes):
    return str(bytes, "utf-8")


def x509_name_to_json(x509_name):
    json = {}

    for key, value in x509_name.get_components():
        json.update({bytes_to_string(key): bytes_to_string(value)})

    return json


def x509_extensions_to_json(x509_cert):
    json = {}
    for ext_index in range(0, x509_cert.get_extension_count(), 1):
        extension = x509_cert.get_extension(ext_index)
        json.update({bytes_to_string(extension.get_short_name()): str(extension)})

    return json


class x509Parser:

    @staticmethod
    def x509_to_str(x509_cert):
        try:
            cert_str = x509Parser.parse_x509(x509_cert)

            return json.dumps(cert_str, indent=4)
        except Exception as e:
            logger.error(f"Something went wrong parsing the x509 certificate: {e}")

    @staticmethod
    def parse_x509(cert, ignore_extensions=False):

        try:
            x509_cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert)
        except Exception as e:
            logger.error(f"Couldn't load the x509 certificate as PEM: {e}")

        # Parse the subject and issuer
        try:
            subjectObj = x509_name_to_json(x509_cert.get_subject())
        except Exception as e:
            logger.error(
                f"Something went wrong extracting the subject object from the certificate: {e}"
            )

        try:
            subject = {
                "common_name": subjectObj.get("CN"),
                "organization": subjectObj.get("O"),
                "organizational_unit": subjectObj.get("OU"),
                "country": subjectObj.get("C"),
                "state": subjectObj.get("ST"),
                "locality": subjectObj.get("L"),
            }
        except Exception as e:
            logger.error(
                f"Something went wrong extracting subject fields from the subject object: {e}"
            )

        try:
            issuerObj = x509_name_to_json(x509_cert.get_issuer())
        except Exception as e:
            logger.error(
                f"Something went wrong extracting the issuer object from the certificate: {e}"
            )

        try:
            issuer = {
                "common_name": issuerObj.get("CN"),
                "organization": issuerObj.get("O"),
                "organizational_unit": issuerObj.get("OU"),
                "country": issuerObj.get("C"),
                "state": issuerObj.get("ST"),
                "locality": issuerObj.get("L"),
            }
        except Exception as e:
            logger.error(
                f"Something went wrong extracting the fields from the issuer object: {e}"
            )

        try:
            cert = {
                "subject": subject,
                "issuer": issuer,
                "has_expired": x509_cert.has_expired(),
                "not_after": str(
                    datetime.strptime(
                        bytes_to_string(x509_cert.get_notAfter()), "%Y%m%d%H%M%SZ"
                    )
                ),
                "not_before": str(
                    datetime.strptime(
                        bytes_to_string(x509_cert.get_notBefore()), "%Y%m%d%H%M%SZ"
                    )
                ),
                "serial_number": str(x509_cert.get_serial_number()),
                "serial_number_hex": hex(x509_cert.get_serial_number()),
                "signature_algorithm": bytes_to_string(
                    x509_cert.get_signature_algorithm()
                ),
                "version": x509_cert.get_version(),
                "pulic_key_length": x509_cert.get_pubkey().bits(),
            }
        except Exception as e:
            logger.error(
                f"Something went wrong while building the extracted x509 certificate data: {e}"
            )

        if not ignore_extensions:
            try:
                cert.update({"extensions": x509_extensions_to_json(x509_cert)})
            except Exception as e:
                logger.error(
                    f"Something went wrong trying to update the certificates extensions: {e}"
                )

        return cert
