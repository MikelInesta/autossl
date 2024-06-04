import { Alert, Box, Button, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IVirtualHost } from "../types/models";

async function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
  });
}

const InstallCertificate = () => {
  const { virtualHostId } = useParams();
  const [virtualHost, setVirtualHost] = useState<IVirtualHost | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVirtualHost = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/virtual-hosts/${virtualHostId}`
        );
        const data = await response.json();
        setVirtualHost(data);
      } catch (error) {
        console.error("Error fetching virtual host:", error);
      }
    };

    fetchVirtualHost();
  }, [virtualHostId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const base64file = await getBase64(file);
      const data = { file: base64file };
      const jsonData = JSON.stringify(data);

      try {
        console.log(`Sending ${jsonData}`);
        await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/virtual-hosts/install-certificate/${virtualHostId}`,
          {
            method: "POST",
            body: jsonData,
            headers: {
              "content-type": "application/json",
            },
          }
        );
      } catch (error) {
        console.error(error);
        setError("An error occurred while uploading the certificate.");
      }
    }
  };

  return (
    <>
      <Box display={"flex"} alignItems={"center"}>
        <div>
          <h1>Install a new Certificate</h1>
          {error && <Alert severity="error">{error}</Alert>}
          <br />
          <strong>Virtual Host ID: </strong>
          {virtualHostId}
          <br />
          <strong>IP Addresses: </strong>
          {virtualHost && virtualHost.vh_ips.join(", ")}
          <br />
          <strong>Domain names: </strong>
          {virtualHost && virtualHost.domain_names}
          <br />
          <strong>Active: </strong>
          {virtualHost && virtualHost.enabled ? "Yes" : "No"}
        </div>
      </Box>
      <Paper elevation={5} sx={{ padding: 3, marginTop: 3 }}>
        <p>
          Please upload the certificate you wish to be installed for this
          domain.
        </p>
        <div>
          <Button
            variant="contained"
            color="secondary"
            component="label"
            sx={{ marginBottom: 2, marginRight: 2 }}
          >
            Choose File
            <input
              type="file"
              hidden
              accept=".pem, .crt, .cer, .der, .p7b, .p7s, .pfx, .p12"
              onChange={handleFileChange}
            />
          </Button>
          {(file && file.name) || "No file selected"}
        </div>

        {file && (
          <Button variant="contained" onClick={handleUpload}>
            Upload
          </Button>
        )}
      </Paper>
    </>
  );
};

export default InstallCertificate;

/**
<Button variant="contained" component="label">
          Upload File
          <input
            type="file"
            hidden
            accept=".pem, .crt, .cer, .der, .p7b, .p7s, .pfx, .p12"
            onChange={handleFileChange}
          />
        </Button>
 */
