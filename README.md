# Abstract

Creation of a secure channel is an essential part in any communication conducted over the 
internet today. Web servers use TLS certificates to authenticate themselves to clients and 
implement the necessary encryption mechanisms to cypher information in transit. This is an attempt on
the development of a system for the installation and management of TLS 
certificates on Nginx web servers and Linux systems through a web application. The 
processing of TLS certificates, the configuration of web servers, and the data modeling aimed 
at scalability present a challenge in developing a differentiated tool within the market of digital 
certificate management applications and public key infrastructure components, while also 
providing a detailed view of the impact of design and architecture on the functioning of 
complex software systems.

# Installation
## Web Application

Within the project folder, there are three main directories (agent, server, and client). For deploying the server or client environment of the web application, a prior installation of Node.js and npm is necessary. There are multiple ways to install Node, with the use of nvm being the most recommended.

Once npm is installed, the necessary dependencies for the development and deployment of the project can be installed by entering the respective server and client folders and executing the command `npm install`. Since a `package.json` file is included with the project, the previous command will automatically install all necessary dependencies.

Before running the web application, it is necessary to create `.env` files with the required configuration variables and place them within the server and client folders, unlike the agent where these should be placed outside the `src` directory.

The command `npm run dev` in both the server and the client starts the respective development server, while using `npm run build` allows compiling a static version of the application's frontend.

If you wish to change the TypeScript compiler configuration, the `tsconfig.json` file is included within the respective folders.

##  Agent

Within the `agent/src/` folder, it is necessary to create a `.env` file with the specified variables. A script `installAgent.py` is included for the installation of the agent, and `uninstallAgent.py` to remove it from the system. Tests during development were done using Python version 3.10.12, so it is recommended to use a similar or higher version. Additionally, the system must have pip installed; if not, it can be installed with the following command:

`sudo apt install python3-pip`

Once the agent environment is correctly configured, simply execute the installation script available at `agent/src/installAgent.py`:

`sudo python3 installAgent.py`


After installation, a agent.log file is available within `/opt/autossl` with information and error messages regarding the agent's execution. The agent is deployed as a service, so systemctl commands can be used to control its execution.
