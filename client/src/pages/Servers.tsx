import * as React from "react";
import ServerTable from "../components/ServerTable";
import Box from "@mui/material/Box";

const Servers = () => {
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
      <ServerTable />
    </>
  );
};

export default Servers;
