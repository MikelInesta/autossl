import React, { useEffect, useState } from 'react';
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
} from '@mui/material';
import WebServerOptionsMenu from './WebServerOptionsMenu';
import { IWebServer } from '../types/models';

const WebServerTable: React.FC<{ serverId: string }> = ({
	serverId,
}: {
	serverId: string;
}) => {
	const [webServers, setWebServers] = useState<IWebServer[]>([]);

	useEffect(() => {
		const fetchWebServers = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/web-servers/serverid/${serverId}`
				);
				const data = await response.json();
				setWebServers(data);
			} catch (error) {
				console.error('Error fetching web servers:', error);
			}
		};

		fetchWebServers();
	}, []);

	return (
		<TableContainer component={Paper}>
			<Table>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Name</TableCell>
						<TableCell>IP Address</TableCell>
						<TableCell>Operating System</TableCell>
						<TableCell>Archived (Old)</TableCell>
						<TableCell>Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{webServers.map((webServer) => (
						<TableRow key={webServer._id}>
							<TableCell>{webServer._id}</TableCell>
							<TableCell>{webServer.web_server_name}</TableCell>
							<TableCell>{webServer.configuration_path}</TableCell>
							<TableCell>{webServer.server_id}</TableCell>
							<TableCell>{webServer.old ? 'Yes' : 'No'}</TableCell>
							<TableCell>
								<WebServerOptionsMenu
									serverId={serverId}
									webServerId={webServer._id}
								/>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default WebServerTable;
