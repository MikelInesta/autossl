import { Box } from '@mui/system';
import CreateCsrForm from "../components/CreateCsrForm"
import { useParams } from 'react-router-dom';
import React from "react";

const CreateCsr = () => {
  const { virtualHostId } = useParams();
  React.useEffect(() => { }, [virtualHostId]);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <h1>Generate a Certificate Signing Request</h1>

      </Box>
      {virtualHostId && <CreateCsrForm virtualHostId={virtualHostId} />}
    </>
  );
};

export default CreateCsr;
