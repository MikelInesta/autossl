interface IWebServer {
  _id: string;
  web_server_name: string;
  configuration_path: string;
  server_id: string;
  //old: boolean;
}

interface IServer {
  _id: string;
  server_name: string;
  server_ip: string;
  operating_system: string;
  //old: boolean;
}

interface IVirtualHost {
  _id: string;
  vh_ips: Array<string>;
  domain_names: string;
  enabled: boolean;
  web_server_id: string;
  certificate_id: string;
  //old: boolean;
  csr: string;
  certificate_path: string;
  certificate_key_path: string;
}

export type { IWebServer, IServer, IVirtualHost };
