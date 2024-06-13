import { Alert, CircularProgress, Grid } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ICertificate } from "../types/models";
import CertificateInfo from "../components/CertificateInfo";

const Certificate = () => {
  const { certificateId, serverId, webServerId } = useParams();
  const [certificate, setCertificate] = useState<ICertificate | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<boolean>(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/certificates/id/${certificateId}`
        );
        if (response.status != 200) {
          throw new Error(response.statusText);
        }
        const result = await response.json();
        setCertificate(result);
      } catch (error) {
        console.error("Error fetching data:", error);
        setErr(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificate();
  }, [certificateId]);

  return (
    <>
      {loading && <CircularProgress />}
      {err && (
        <Alert severity="warning">
          Couldn't retrieve this certificates information from the backend.
        </Alert>
      )}
      {!err && !loading && (
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
