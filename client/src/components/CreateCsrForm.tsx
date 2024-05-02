import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { Link, redirect } from "react-router-dom";

const CreateCsrForm = ({
  serverId,
  webServerId,
  virtualHostId,
}: {
  serverId: string;
  webServerId: string;
  virtualHostId: string;
}) => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [commonName, setCommonName] = useState("");

  const [download, setDownload] = useState(false);

  const sendFormData = async () => {
    try {
      const formData = JSON.stringify({
        country: country,
        state: state,
        locality: locality,
        organizationName: organizationName,
        commonName: commonName,
      });

      console.log(`Form data sent: ${formData}`);

      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: formData,
      };
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/virtual-hosts/getCsr/${virtualHostId}`,
        requestOptions
      );
      console.log(`getCsr responded: ${response.status}`);
      setDownload(true);
    } catch (error) {
      console.error("Error requesting csr from the backend:", error);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 5,
      }}
    >
      {!download && (
        <>
          <form
            style={{
              width: "100%",
              maxWidth: "500px",
            }}
          >
            <h3>
              Please fill the following form to solicit a CSR for{" "}
              {virtualHostId}:
            </h3>
            <TextField
              label="Country"
              variant="outlined"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              sx={{ width: "100%", marginBottom: 2 }}
            />
            <TextField
              label="State"
              variant="outlined"
              value={state}
              onChange={(e) => setState(e.target.value)}
              sx={{ width: "100%", marginBottom: 2 }}
            />
            <TextField
              label="Locality"
              variant="outlined"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              sx={{ width: "100%", marginBottom: 2 }}
            />

            <TextField
              label="Organization Name"
              variant="outlined"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              sx={{ width: "100%", marginBottom: 2 }}
            />
            <TextField
              label="Common Name"
              variant="outlined"
              value={commonName}
              onChange={(e) => setCommonName(e.target.value)}
              sx={{ width: "100%", marginBottom: 2 }}
            />
          </form>
          <Button variant="contained" sx={{ m: 3 }} onClick={sendFormData}>
            Submit
          </Button>
        </>
      )}
      {download && (
        <Link
          to={`/servers/${serverId}/web-servers/${webServerId}/domains/${virtualHostId}/downloadCsr`}
        >
          Download CSR
        </Link>
      )}
    </Box>
  );
};

export default CreateCsrForm;
