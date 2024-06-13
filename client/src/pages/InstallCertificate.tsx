import { Alert, Box, Button, Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IDomain, IVirtualHost } from "../types/models";

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
  const { domainId } = useParams();
  const [domain, setDomain] = useState<IDomain | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDomain = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/domains/${domainId}`
        );
        const data = await response.json();
        setDomain(data);
      } catch (error) {
        console.error("Error fetching domains:", error);
      }
    };

    fetchDomain();
  }, [domainId]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      const fileExtension = file.name.split(".").pop();
      const base64file = await getBase64(file);
      const data = { file: base64file, fileExtension: fileExtension };
      const jsonData = JSON.stringify(data);

      try {
        console.log(`Sending ${jsonData}`);
        await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/domains/install-certificate/${domainId}`,
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
          <h1>Install a new Certificate for {domain && domain.domain_names}</h1>
          {error && <Alert severity="error">{error}</Alert>}
        </div>
      </Box>
      <Paper elevation={5} sx={{ padding: 3, marginTop: 3 }}>
        <p>
          Please upload the .zip containing the certificate files you wish to be
          installed for this domain.
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
              accept=".zip"
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
