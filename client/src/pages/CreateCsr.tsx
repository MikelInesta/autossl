import { Box } from "@mui/system";
import CreateCsrForm from "../components/CreateCsrForm";
import { useParams } from "react-router-dom";
import React from "react";

const CreateCsr = () => {
  const { serverId, webServerId, domainId } = useParams();

  React.useEffect(() => {}, [domainId]);
  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <h1>Generate a Certificate Signing Request</h1>
      </Box>
      {serverId && webServerId && domainId && (
        <CreateCsrForm
          domainId={domainId}
          serverId={serverId}
          webServerId={webServerId}
        />
      )}
    </>
  );
};

export default CreateCsr;
