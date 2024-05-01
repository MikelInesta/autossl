import { Box } from '@mui/system';
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"

const Home = () => {
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <h1>Home</h1>

      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <p>Pending implementation:</p>
        <List>
          <ListItem>Agent security identification and encryption with the backend</ListItem>
          <ListItem>User management (log-in, owned servers, etc)</ListItem>
          <ListItem>Encryption of the CSR</ListItem>
        </List>
      </Box>
    </>
  );
};

export default Home;
