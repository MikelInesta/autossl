import { IDomain, IServer, IVirtualHost, IWebServer } from "../types/models";

/*
    I was using the same fetch functions many times, probably due to my
    poor javascript and react skills... anyway I figured I should just put them here
    for reusability purposes.
*/

const fetchWebServer = async (
  setWebServer: (arg0: IWebServer) => void,
  setLoading: (arg0: boolean) => void,
  setError: (arg0: string) => void,
  webServerId: string
) => {
  console.log("Fetching web server data");
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/web-servers/${webServerId}`
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    } else {
      const result = await response.json();
      setWebServer(result);
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Couldn't get teh web server data from the backend.");
  } finally {
    setLoading(false);
  }
};

const fetchServers = async (
  setServers: (arg0: [IServer]) => void,
  setLoading: (arg0: boolean) => void,
  setError: (arg0: string) => void
) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/servers`);
    if (!response.ok) {
      throw new Error(`Response: ${response}`);
    }
    const data = await response.json();
    setServers(data);
  } catch (error) {
    console.error("Error fetching servers:", error);
    setError("Something went wrong fetching the servers.");
  } finally {
    setLoading(false);
  }
};

const fetchServer = async (
  setServer: (arg0: IServer) => void,
  setLoading: (arg0: boolean) => void,
  setError: (arg0: string) => void,
  serverId: string
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/servers/${serverId}`
    );
    if (!response.ok) {
      throw new Error(`Response: ${response}`);
    }
    const data = await response.json();
    setServer(data);
  } catch (error) {
    console.error("Error fetching server:", error);
    setError("Something went wrong fetching the server data.");
  } finally {
    setLoading(false);
  }
};

const fetchDomain = async (
  setDomain: (arg0: IDomain) => void,
  setLoading: (arg0: boolean) => void,
  setError: (arg0: string) => void,
  domainId: string
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/domains/id/${domainId}`
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
    const result = await response.json();
    setDomain(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Error fetching domain data");
  } finally {
    setLoading(false);
  }
};

const fetchSslVirtualHost = async (
  setSslVirtualHost: (arg0: IVirtualHost) => void,
  setLoading: (arg0: boolean) => void,
  setError: (arg0: string) => void,
  domainId: string
) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/domains/ssl-virtual-host/${domainId}`
    );
    if (response.status != 200) {
      throw new Error(response.statusText);
    }
    const result = await response.json();
    setSslVirtualHost(result);
  } catch (error) {
    console.error("Error fetching data:", error);
    setError("Something went wrong trying to fetch the virtual host data.");
  } finally {
    setLoading(false);
  }
};

export {
  fetchServers,
  fetchServer,
  fetchDomain,
  fetchSslVirtualHost,
  fetchWebServer,
};
