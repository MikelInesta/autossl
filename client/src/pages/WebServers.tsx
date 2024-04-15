import * as React from 'react';
import Box from '@mui/material/Box';
import { useParams } from 'react-router-dom';
import WebServerTable from '../components/WebServerTable';
import { IWebServer } from '../types/models';

const WebServers: React.FC = () => {
	const { serverId } = useParams();
	const [webServers, setWebServers] = React.useState<IWebServer[]>([]);

	if (serverId)
		React.useEffect(() => {}, [serverId]); // Render on serverId change
	else {
		React.useEffect(() => {
			const fetchWebServers = async () => {
				try {
					const response = await fetch(
						`${import.meta.env.VITE_API_URL}/servers`
					);
					const data = await response.json();
					setWebServers(data);
				} catch (error) {
					console.error('Error fetching servers:', error);
				}
			};

			fetchWebServers();
		}, []);
	}
	return (
		<>
			<Box sx={{ display: 'flex', justifyContent: 'center' }}>
				<h1>Web Servers</h1>
			</Box>
			{serverId && <WebServerTable serverId={serverId} />}
			{!serverId &&
				webServers.map((webServer) => (
					<WebServerTable serverId={webServer._id} />
				))}
		</>
	);
};

export default WebServers;
