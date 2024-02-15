import React, { useState } from "react";
//import React, { FC } from "react"; // For declaring component type

/*Input for server name, logic for requesting the backend and display of returned list*/
export default function WebServersPage() {
  const [serverName, setServerName] = useState("");
  const [webServers, setWebServers] = useState([]);
  const [error, setError] = useState("");

  // Backend query for the web_server list
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://autossl.mikelinesta.com/api/front-end/web-servers/" +
          serverName,
        {
          method: "GET",
          headers: new Headers({ "Content-type": "application/json" }), // Not really sending json but it gives me cors error if i dont
          mode: "cors",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error);
      } else {
        const data = await response.json();
        console.log(data);
        setWebServers(data);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  // Event handler for the server name input.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerName(e.target.value);
  };

  // Event handler for the button.
  const handleButtonClick = () => {
    setWebServers([]); // Clean the previous result
    fetchData();
  };

  return (
    <div className="container text-center">
      <input
        className="form-control mb-3 w-25 mx-auto"
        type="text"
        id="serverName"
        value={serverName}
        onChange={handleInputChange}
        placeholder="Server Name"
      />
      <button onClick={handleButtonClick} className="btn btn-primary">
        Get Web Servers {serverName && " for server: " + serverName}
      </button>

      {error && <div className="text-danger mt-3">{error}</div>}

      <ul className="list-group mt-3">
        {webServers.map((server: any) => (
          <li key={server.id} className="list-group-item">
            <h5>{server.name}</h5>
            <p>{server.path}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
