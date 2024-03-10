# Author : Sean Wright
import json

from OpenSSL import crypto
from datetime import datetime

def bytes_to_string(bytes):
    return str(bytes, 'utf-8')

def x509_name_to_json(x509_name):
    json = { }

    for key, value in x509_name.get_components():
        json.update({ bytes_to_string(key): bytes_to_string(value) })

    return json

def x509_extensions_to_json(x509_cert):
    json = { }
    for ext_index in range(0, x509_cert.get_extension_count(), 1):
        extension = x509_cert.get_extension(ext_index)
        json.update({ bytes_to_string(extension.get_short_name()): str(extension) })

    return json

class x509Parser:

    def x509_to_str(x509_cert):
        cert_str = x509Parser.parse_x509(x509_cert)

        return json.dumps(cert_str, indent=4)

    def parse_x509(cert,ignore_extensions=False):
        x509_cert = crypto.load_certificate(crypto.FILETYPE_PEM, cert)
        
        # Coding the key as PEM and decoding it to string
        # public_key_obj = x509_cert.get_pubkey()
        # public_key_pem = crypto.dump_publickey(crypto.FILETYPE_PEM, public_key_obj)
        # public_key_str = public_key_pem.decode('utf-8')
        # Pending parsing of the public key
        
        # Parse the subject and issuer
        subjectObj = x509_name_to_json(x509_cert.get_subject())
        subject = {
            "common_name": subjectObj.get("CN"),
            "organization": subjectObj.get("O"),
            "organizational_unit": subjectObj.get("OU"),
            "country": subjectObj.get("C"),
            "state": subjectObj.get("ST"),
            "locality": subjectObj.get("L")
        }
        issuerObj = x509_name_to_json(x509_cert.get_issuer())
        issuer = {
            "common_name": issuerObj.get("CN"),
            "organization": issuerObj.get("O"),
            "organizational_unit": issuerObj.get("OU"),
            "country": issuerObj.get("C"),
            "state": issuerObj.get("ST"),
            "locality": issuerObj.get("L")
        }

        cert = {
                "subject": subject,
                "issuer": issuer,
                "has_expired": x509_cert.has_expired(),
                "not_after": str(datetime.strptime(bytes_to_string(x509_cert.get_notAfter()), '%Y%m%d%H%M%SZ')),
                "not_before": str(datetime.strptime(bytes_to_string(x509_cert.get_notBefore()), '%Y%m%d%H%M%SZ')),
                "serial_number": str(x509_cert.get_serial_number()),
                "serial_number_hex": hex(x509_cert.get_serial_number()),
                "signature_algorithm": bytes_to_string(x509_cert.get_signature_algorithm()),
                "version": x509_cert.get_version(),
                "pulic_key_length": x509_cert.get_pubkey().bits()
            }

        if (not ignore_extensions):
            cert.update({"extensions": x509_extensions_to_json(x509_cert)})

        return cert