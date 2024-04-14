interface IWebServer {
	_id: string;
	web_server_name: string;
	configuration_path: string;
	server_id: string;
	old: boolean;
}

export type { IWebServer };
