import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import VirtualHostTable from '../components/VirtualHostTable';

const VirtualHosts: React.FC = () => {
	const { serverId, webServerId } = useParams();

	React.useEffect(() => {}, [serverId]);
	return (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<h1>Web Servers</h1>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 0 }}>
				<h2>Server ID: {serverId}</h2>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 0 }}>
				<h3>Web Server ID: {webServerId}</h3>
			</Box>
			{serverId && webServerId && (
				<VirtualHostTable serverId={serverId} webServerId={webServerId} />
			)}
		</>
	);
};

export default VirtualHosts;
