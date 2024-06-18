import { Box, Button, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import { IDomain } from "../types/models";
import { updateCsrStatus } from "../requests/Status";

const CreateCsrForm = ({
  serverId,
  webServerId,
  domainId,
}: {
  serverId: string;
  webServerId: string;
  domainId: string;
}) => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [commonName, setCommonName] = useState("");

  const [download, setDownload] = useState(false);

  const [domain, setDomain] = useState<IDomain | null>(null);

  const [validationError, setValidationError] = useState("");

  const validateCountryInput = (input: string) => {
    const isValid = /^[A-Z]{2}$/.test(input);
    setValidationError(
      isValid ? "" : "Country must be a two letter country code."
    );
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setCountry(input);
    validateCountryInput(input);
  };

  useEffect(() => {
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

    fetchDomain();
  }, []);

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
        `${import.meta.env.VITE_API_URL}/virtual-hosts/getCsr/${
          domain &&
          domain.virtual_host_ids.length > 0 &&
          domain.virtual_host_ids[0]
        }`,
        requestOptions
      );
      console.log(`getCsr responded: ${response.status}`);
      setDownload(true);
    } catch (error) {
      console.error("Error requesting csr from the backend:", error);
    } finally {
      updateCsrStatus(domainId, "CSR has been requested...");
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
            <h3 style={{ marginBottom: "20px" }}>
              Please fill the following form to solicit a CSR for{" "}
              {domain && domain.domain_names}:
            </h3>
            <TextField
              label="Country"
              variant="outlined"
              value={country}
              onChange={handleCountryChange}
              error={!!validationError}
              helperText={validationError}
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
          {!validationError && (
            <Button variant="contained" sx={{ m: 3 }} onClick={sendFormData}>
              Submit
            </Button>
          )}
        </>
      )}
      {download && (
        <>
          <Alert severity="success">
            CSR requested successfully! Click the button below to download it:
          </Alert>
          <Button
            variant="contained"
            sx={{
              marginTop: "20px",
              marginBottom: "20px",
              //marginLeft: "auto",
              backgroundColor: "#009933",
              "&:hover": {
                backgroundColor: "#006600",
              },
            }}
            component={Link}
            to={`/servers/${serverId}/web-servers/${webServerId}/domains/${domainId}/downloadCsr`}
          >
            Show CSR
          </Button>
        </>
      )}
    </Box>
  );
};

export default CreateCsrForm;
