import { Alert, Box, CircularProgress, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IDomain } from "../types/models";

const DownloadCsr = () => {
  const { domainId } = useParams();

  const [domain, setDomain] = useState<IDomain | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);
  const [csrData, setCsrData] = useState(null);

  useEffect(() => {
    const fetchCsr = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/domains/getCsr/${domainId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        if (result["csr"]) {
          console.log(result["csr"]);
        } else {
          throw new Error("Did not receive csr data");
        }
        setCsrData(result["csr"]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    const fetchDomain = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/domains/id/${domainId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        setDomain(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchDomain().then(fetchCsr);
  }, [domainId]);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 5,
        }}
      >
        <h2 style={{ alignSelf: "center" }}>
          Certificate Signing Request for {domain && domain.domain_names}
        </h2>
      </Box>
      <Paper
        sx={{
          padding: 2,
          margin: 2,
        }}
      >
        {loading && <CircularProgress />}
        {err && (
          <Alert severity="warning">
            Couldn't retrieve the Certificate Server Request, this could mean
            that the agent is still processing the request or a request for the
            creation of one has not yet been submitted. Please try again later.
            later.
          </Alert>
        )}
        {!err && !loading && <pre>{csrData}</pre>}
      </Paper>
    </>
  );
};

export default DownloadCsr;
