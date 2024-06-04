import { Alert, Box, CircularProgress, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { IVirtualHost } from "../types/models";

const DownloadCsr = () => {
  const { virtualHostId } = useParams();

  const [virtualHost, setVirtualHost] = useState<IVirtualHost | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);
  const [csrData, setCsrData] = useState(null);

  useEffect(() => {
    const fetchCsr = async () => {
      try {
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/virtual-hosts/viewCsr/${virtualHostId}`
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

    const fetchVirtualHost = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/virtual-hosts/${virtualHostId}`
        );
        const data = await response.json();
        setVirtualHost(data);
      } catch (error) {
        console.error("Error fetching virtual host data:", error);
      }
    };

    fetchVirtualHost();
    fetchCsr();
  }, []);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          padding: 5,
        }}
      >
        <h2 style={{ alignSelf: "center" }}>Certificate Signing Request</h2>
        <p style={{ alignSelf: "left" }}>
          <strong>Domain names: </strong>
          {virtualHost && virtualHost.domain_names}
          <br />
          <strong>Virtual Host ID: </strong>
          {virtualHostId}
        </p>
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
        {!err && !loading && csrData}
      </Paper>
    </>
  );
};

export default DownloadCsr;
