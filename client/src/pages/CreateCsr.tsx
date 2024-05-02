import { Box } from "@mui/system";
import CreateCsrForm from "../components/CreateCsrForm";
import { useParams } from "react-router-dom";
import React from "react";

const CreateCsr = () => {
  const { serverId, webServerId, virtualHostId } = useParams();

  React.useEffect(() => {}, [virtualHostId]);
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
      {serverId && webServerId && virtualHostId && (
        <CreateCsrForm
          virtualHostId={virtualHostId}
          serverId={serverId}
          webServerId={webServerId}
        />
      )}
    </>
  );
};

export default CreateCsr;
