import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import WebServerTable from '../components/WebServerTable';

const WebServers: React.FC = () => {
	const { serverId } = useParams();

	React.useEffect(() => {}, [serverId]);
	return (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<h1>Web Servers</h1>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 0 }}>
				<h2>Server ID: {serverId}</h2>
			</Box>
			{serverId && <WebServerTable serverId={serverId} />}
		</>
	);
};

export default WebServers;
