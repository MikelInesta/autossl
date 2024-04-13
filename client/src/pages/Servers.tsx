import * as React from "react";
import ServerTable from "../components/ServerTable";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

export default function Servers() {
  const [showServerTable, setShowServerTable] = React.useState(false);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <h1>Servers</h1>
      </Box>
      {showServerTable && <ServerTable />}
      {!showServerTable && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={() => setShowServerTable(!showServerTable)}
          >
            Display Servers
          </Button>
        </Box>
      )}
    </>
  );
}
