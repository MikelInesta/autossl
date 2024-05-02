import { Alert, Box, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const DownloadCsr = () => {
  const { virtualHostId } = useParams();

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

    fetchCsr();
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 5,
      }}
    >
      <h1>Certificate Signing Request for {virtualHostId}</h1>
      {loading && <CircularProgress />}
      {err && (
        <Alert severity="error">
          Couldn't retrieve the Certificate Server Request, this could mean that
          the agent is still processing the request or a request for the
          creation of one has not yet been submitted. Please try again later.
          later.
        </Alert>
      )}
      {!err && !loading && csrData}
    </Box>
  );
};

export default DownloadCsr;
