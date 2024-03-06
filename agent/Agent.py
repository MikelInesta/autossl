import os, requests, json, subprocess
from utilities.x509Parser import x509Parser

# The purpose of this class is obtaining and building the necessary data to send updates to the backend
class Agent:
    def __init__(self, agentUrl="https://autossl.mikelinesta.com/api/agents/"):
        self.ip = requests.get('https://api.ipify.org').content.decode('utf8')
        # Web servers will be a list of {name: "name", path: "path"}
        self.webServers = {}
        # List of names for possible web servers
        self.names = ["nginx", "apache2", "apache", "httpd"]
        # Root url for the api endpoint
        self.agentUrl = agentUrl
        # Operating system
        self.os = f'OS {os.uname().sysname}, Release {os.uname().release}'
    
    # Searches for every name in the names list in the /etc directory and appends the path to the webServers list
    def findWebServers(self):
        rootDirectory = "/etc"
        for name in self.names:
            for item in os.listdir(rootDirectory):
                if os.path.isdir(os.path.join(rootDirectory, item)) and item == name:
                    configRoot = os.path.join(rootDirectory, item)
                    webServer = {
                        "configuration_path": configRoot,
                    }
                    # Build the found Web Server with its virtual hosts and certificates
                    if name == "nginx":
                        result = subprocess.run("nginx -v", shell=True, capture_output=True, text=True)
                        #version = result.stdout.strip()
                        #print(f'version = {version}')
                        #webServer["version"]=version
                        virtual_hosts = self.findNginxHosts(webServer)
                        if virtual_hosts:
                            webServer["virtual_hosts"] = virtual_hosts
                    #elif name == "apache2":
                        #virtual_hosts = self.findApacheHosts(webServer)
                        #if virtual_hosts:
                        #    webServer["virtual_hosts"] = virtual_hosts
                    self.webServers[name] = webServer
    
    # Method that given the root of a directory, reads every file and searches for virtual hosts and certificates
    def findNginxHosts(self, webServer):
        virtual_hosts = {}
        ipDir = serverName = certificatePath = certificate = None
        for root, dirs, files in os.walk(f"{webServer['configuration_path']}/sites-available"):
            #Loop through every file in the directory to find virtual hosts
            for file in files:
                with open(os.path.join(root, file), 'r') as f:
                    virtual_hosts[file]=self.processVirtualHosts(f, webServer, file)
        return virtual_hosts
    
    def processVirtualHosts(self, file, webServer, fileName):
        virtual_hosts = []
        server = False
        certificatePath = None
        lines = file.readlines()
        
        for i in range(len(lines)):
            
            # If the line is commented out skip it
            if '#' in lines[i].split(' ')[0] or lines[i].split(' ')[0] == '#':
                continue
            
            # When finding the server block directive, process the entire server block
            if 'server' in lines[i].split(' ')[0] and '{' in lines[i]:
                listening = [] # In case there are multiple ips for a single virtual host
                serverNames = [] # ""      ""
                server = True
                level = 1; # Mark the opening bracket of a server block
                continue
            
            if server:
                # If an opening bracket is found but no server directive nor on the same line or the one before increase the level
                if '{' in lines[i]:
                    level+=1
                
                # If a closing bracket is found decrease the level
                if '}' in lines[i]:
                    level-=1
                
                # If the level is zero and a server block was found we add the host to de virtual_hosts list
                if level == 0 and server:
                    virtual_hosts.append(self.processServerBlock(listening, serverNames, webServer, fileName, certificatePath))
                    certificatePath = None
                    server = False
                
                if 'listen' in lines[i]:
                    lineSplit = lines[i].split(' ')
                    for j in range(len(lineSplit)):
                        if 'listen' in lineSplit[j]:
                            # Save the entire line after the listen directive until the end of the line or the # character
                            listening.append((' '.join(lineSplit[j+1:]).split('#')[0]).strip(' ').strip('\n').strip(';'))
                
                # Find the server_name directive and save the following word (the server name)
                if 'server_name' in lines[i]:
                    lineSplit = lines[i].split(' ')
                    for j in range(len(lineSplit)):
                        if 'server_name' in lineSplit[j]:
                            serverNames.append(lineSplit[j+1].strip('\n').strip(';'))
                
                # Find the ssl_certificate directive, get the directory for the certificate and process it
                if 'ssl_certificate' in lines[i]:
                    lineSplit = lines[i].split(' ')
                    for j in range(len(lineSplit)):
                        if 'ssl_certificate' in lineSplit[j]:
                            fullChainPath = lineSplit[j+1].strip('\n').strip(';')
                            certificatePathArray = fullChainPath.split("/").pop()
                            certificatePath = ''.join(certificatePathArray)
                            print(f'certificatePath = {certificatePath}')
                            certificate = processCertificate(certificatePath)
        return virtual_hosts
    
    def processCertificate(self, certificatePath):
        certificate = {
            "directory_path": certificatePath
        }
        # ---- Subject Information ----
        result = subprocess.run(f"openssl x509 -in {certificatePath} -noout -subject", shell=True, capture_output=True, text=True)
        subjectResult = result.stdout.strip().split(' ')
        subject = {}
        for line in subjectResult:
            if 'CN' in line:
                subject["common_name"] = line.split('=')[1].strip()
            if 'O' in line:
                subject["organization"] = line.split('=')[1].strip()
            if 'OU' in line:
                subject["organizational_unit"] = line.split('=')[1].strip()
        certificate["subject"] = subject
        
        # ---- Issuer Information ----
        result = subprocess.run(f"openssl x509 -in {certificatePath} -noout -issuer", shell=True, capture_output=True, text=True)
        issuerResult = result.stdout.strip().split(' ')
        issuer = {}
        for line in issuerResult:
            if 'CN' in line:
                issuer["common_name"] = line.split('=')[1].strip()
            if 'O' in line:
                issuer["organization"] = line.split('=')[1].strip()
            if 'OU' in line:
                issuer["organizational_unit"] = line.split('=')[1].strip()
        
        # ---- Validity Information ----
        result = subprocess.run(f"openssl x509 -in {certificatePath} -noout -dates", shell=True, capture_output=True, text=True)
        validityResult = result.stdout.strip().split(' ')
        validity = {}
        for line in validityResult:
            if 'notBefore' in line:
                validity["not_before"] = line.split('=')[1].strip()
            if 'notAfter' in line:
                validity["not_after"] = line.split('=')[1].strip()
        return certificate
    
        # ---- Public Key Information ----
        result = subprocess.run(f"openssl x509 -in {certificatePath} -noout -pubkey", shell=True, capture_output=True, text=True)
    
    def processServerBlock(self, listening, serverNames, webServer, fileName, certificatePath):
        virtual_host = {}
        certificate = None
        if certificatePath:
            # I could add a function here to build the certificate object and append it to the vh/domain
            with open(certificatePath, 'r') as file:
                caChain = file.read()
            certificate = {
                "ca_chain": certificatePath #Temporary, building certificates pending!!!
            }
        virtual_host = {
            "vh_ips": listening,
            "domain_names": serverNames,
            "enabled": (fileName in os.listdir(f'{webServer["configuration_path"]}/sites-enabled')),
            "certificate": certificate
        }
        return virtual_host
        
    
    # Builds the necesary data structure to update everything in the backend
    # Maybe I should fragment the updates, but im currently building and sending the entire object in every change
    def update(self):
        self.findWebServers()
        data = {
            "server":{
                "server_name": f'Server-{self.ip}',
                "server_ip": self.ip,
                "operating_system": self.os,
                "web_servers": self.webServers, # Virtual Hosts and Certificates are currently contained in webServers
            },
        }
        jsonData = json.dumps(data)
        
        try:
            requests.post(f'{self.agentUrl}/update', data=jsonData, headers={'Content-Type': 'application/json'})
            print(f'sent: {jsonData}')
            return True
        except requests.exceptions.RequestException as e:
            print(e)
            return False
        

