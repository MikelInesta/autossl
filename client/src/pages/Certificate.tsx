import { Alert, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ICertificate } from "../types/models";
import CertificateInfo from "../components/CertificateInfo";

const Certificate = () => {
  const { certificateId, serverId, webServerId } = useParams();
  const [certificate, setCertificate] = useState<ICertificate | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/certificates/id/${certificateId}`
        );
        if (response.status != 200) {
          throw new Error(`Response: ${response}`);
        }
        const result = await response.json();
        setCertificate(result);
      } catch (error) {
        console.error("Error fetching certificate data:", error);
        setError(
          "Something went wrong while trying to fetch the certificates data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, []);

  return (
    <>
      {loading && <CircularProgress />}
      {error && <Alert severity="warning">{error}</Alert>}
      {!error && !loading && (
        <Grid container spacing={2} padding={5}>
          {certificateId && serverId && webServerId && (
            <>
              <Grid item md={12}>
                {/* Here goes the 'Enable' button */}
              </Grid>
              <Grid item md={12}>
                <Grid container spacing={2} direction={"row"}>
                  <Grid item xs={12} lg={12}>
                    <CertificateInfo certificate={certificate} />
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      )}
    </>
  );
};

export default Certificate;
