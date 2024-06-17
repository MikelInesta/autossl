import {
  Alert,
  Breadcrumbs,
  Button,
  Grid,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { IDomain, IServer, IWebServer } from "../types/models";
import {
  fetchDomain,
  fetchServer,
  fetchWebServer,
} from "../requests/FetchFunctions";

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
  const { serverId, webServerId, domainId } = useParams();

  const [domain, setDomain] = useState<IDomain | null>(null);
  const [server, setServer] = useState<IServer | null>(null);
  const [webServer, setWebServer] = useState<IWebServer | null>(null);

  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    domainId && fetchDomain(setDomain, setLoading, setError, domainId);
    serverId && fetchServer(setServer, setLoading, setError, serverId);
    webServerId &&
      fetchWebServer(setWebServer, setLoading, setError, webServerId);
  }, []);

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
      <Grid item xs={12} margin={3}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" href="/">
            Home
          </Link>
          <Link underline="hover" color="inherit" href="/servers">
            Servers
          </Link>
          <Link underline="hover" color="inherit" href={`/servers/${serverId}`}>
            {server?.server_name || ""}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href={`/servers/${serverId}/web-servers/${webServer?._id}`}
          >
            {webServer?.web_server_name || ""}
          </Link>
          <Link
            underline="hover"
            color="inherit"
            href={`/servers/${serverId}/web-servers/${webServer?._id}/domains/${domain?._id}`}
          >
            {domain?.domain_names || ""}
          </Link>
          <Typography color="text.primary">Install Certificate</Typography>
        </Breadcrumbs>
      </Grid>
      <Grid container>
        <Grid
          item
          container
          xs={12}
          alignContent={"center"}
          justifyContent={"center"}
        >
          <Grid item xs={12} sm={10} md={8} lg={6}>
            <h1>
              Install a new Certificate for {domain && domain.domain_names}
            </h1>
            {error && <Alert severity="error">{error}</Alert>}
          </Grid>
        </Grid>
        <Grid
          item
          container
          xs={12}
          alignContent={"center"}
          justifyContent={"center"}
        >
          <Grid
            item
            component={Paper}
            padding={3}
            elevation={3}
            xs={12}
            md={8}
            margin={3}
          >
            <p>
              Please upload the .zip containing the certificate files you wish
              to be installed for this domain.
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
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default InstallCertificate;
