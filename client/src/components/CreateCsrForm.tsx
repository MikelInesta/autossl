import React, { useState } from "react";
import { Box } from '@mui/system';
import { TextField, Button } from "@mui/material";


const CreateCsrForm: React.FC<{ virtualHostId: string }> = ({
  virtualHostId,
}: {
  virtualHostId: string;
}) => {
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [locality, setLocality] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [commonName, setCommonName] = useState("");
  let sent = false;


  const sendFormData = async () => {
    try {

      const formData = JSON.stringify({
        country: country,
        state: state,
        locality: locality,
        organizationName: organizationName,
        commonName: commonName
      });

      console.log(`Form data sent: ${formData}`)

      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formData
      };
      const response = await fetch(`${import.meta.env.VITE_API_URL}/virtual-hosts/getCsr/${virtualHostId}`, requestOptions);
      console.log(`getCsr responded: ${response.status}`)
      sent = true;
    } catch (error) {
      console.error("Error requesting csr from the backend:", error);
    }

  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <form
        style={{
          width: '100%',
          maxWidth: '500px', // Adjust max width as per your requirement
        }}
      >
        {sent && <p>Requested the Csr, waiting for it to be created...</p>}
        <h3>Please fill the following form to solicit a CSR for {virtualHostId}:</h3>
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
      <Button variant="contained" sx={{ m: 3 }} onClick={sendFormData}>Submit</Button>
    </Box>
  );
};

export default CreateCsrForm;
