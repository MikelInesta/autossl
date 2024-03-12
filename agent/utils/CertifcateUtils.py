from .x509Parser import x509Parser


class CertificateUtils:

    def processCertificate(certificatePath):
        with open(certificatePath, "r") as file:
            caBuff = file.read()
        certificate = x509Parser.parse_x509(caBuff, ignore_extensions=True)
        return certificate
