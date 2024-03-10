import React, { useState, useEffect } from "react";

interface Certificate {
  _id: string;
  subject: {
    common_name: string;
    organization: string;
    organizational_unit: string;
    country: string;
    state: string;
    locality: string;
  };
  issuer: {
    common_name: string;
    organization: string;
    organizational_unit: string;
    country: string;
    state: string;
    locality: string;
  };
  has_expired: boolean;
  not_after: Date;
  not_before: Date;
  serial_number: string;
  serial_number_hex: string;
  signature_algorithm: string;
  version: number;
  public_key_length: number;
}

interface CertificateDetailProps {
  certificateId: string;
}

const CertificateDetail: React.FC<CertificateDetailProps> = ({
  certificateId,
}) => {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(
      `https://autossl.mikelinesta.com/api/certificates/id/${certificateId}`,
      {
        method: "GET",
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend returned an error");
        }
        return response.json();
      })
      .then((data) => {
        setCertificate(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching certificate details:", error);
        setError("Failed to fetch certificate details");
        setIsLoading(false);
      });
  }, [certificateId]);

  if (isLoading) return <div>Loading certificate...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {certificate && (
        <div>
          <h4>Certificate Details</h4>
          <p>
            <strong>Subject Common Name:</strong>{" "}
            {certificate.subject.common_name}
          </p>
          <p>
            <strong>Subject Organization:</strong>{" "}
            {certificate.subject.organization}
          </p>
          <p>
            <strong>Subject Organizational Unit:</strong>{" "}
            {certificate.subject.organizational_unit}
          </p>
          <p>
            <strong>Subject Country:</strong> {certificate.subject.country}
          </p>
          <p>
            <strong>Subject State:</strong> {certificate.subject.state}
          </p>
          <p>
            <strong>Subject Locality:</strong> {certificate.subject.locality}
          </p>

          <p>
            <strong>Issuer Common Name:</strong>{" "}
            {certificate.issuer.common_name}
          </p>
          <p>
            <strong>Issuer Organization:</strong>{" "}
            {certificate.issuer.organization}
          </p>
          <p>
            <strong>Issuer Organizational Unit:</strong>{" "}
            {certificate.issuer.organizational_unit}
          </p>
          <p>
            <strong>Issuer Country:</strong> {certificate.issuer.country}
          </p>
          <p>
            <strong>Issuer State:</strong> {certificate.issuer.state}
          </p>
          <p>
            <strong>Issuer Locality:</strong> {certificate.issuer.locality}
          </p>

          <p>
            <strong>Has Expired:</strong>{" "}
            {certificate.has_expired ? "Yes" : "No"}
          </p>
          <p>
            <strong>Valid From:</strong> {certificate.not_before.toString()}
          </p>
          <p>
            <strong>Valid To:</strong> {certificate.not_after.toString()}
          </p>
          <p>
            <strong>Serial Number:</strong> {certificate.serial_number}
          </p>
          <p>
            <strong>Serial Number (Hex):</strong>{" "}
            {certificate.serial_number_hex}
          </p>
          <p>
            <strong>Signature Algorithm:</strong>{" "}
            {certificate.signature_algorithm}
          </p>
          <p>
            <strong>Version:</strong> {certificate.version}
          </p>
          <p>
            <strong>Public Key Length:</strong> {certificate.public_key_length}
          </p>
        </div>
      )}
    </div>
  );
};

export default CertificateDetail;
