import subprocess, os, requests, json 

agentUrl = "https://autossl.mikelinesta.com/api/agents/"

class Agent:
    def __init__(self):
        self.ip = requests.get('https://api.ipify.org').content.decode('utf8')
        self.webServers = []
        self.hosts = []
        self.certificates = []

    # Method that given a directory, reads every file and searches for the listening and server_name directives.
    def findNginxHosts(self, nginxRoot):
        for root, dirs, files in os.walk(nginxRoot):
            for file in files:
                with open(os.path.join(root, file), 'r') as f:
                    lines = f.readlines()
                    for line in lines:
                        if 'listen' in line:
                            ipDir = line.split(' ')[1].strip(';')
                        if 'server_name' in line:
                            serverName = line.split(' ')[1].strip(';')
                            if ipDir and serverName:
                                self.servers.append({"ip":ipDir, "serverName":serverName})
                                ipDir = None
                                serverName = None

    # Method that just searches a given directory for a specific directory in it and adds it to the webServers list
    def addDirName(dirName, searchDir, list):
        for item in os.listdir(searchDir):
            if os.path.isdir(os.path.join(searchDir, item)) and item == dirName:
                list.append(os.path.join(searchDir, item))

    # Method that updates the web servers list and sends it to the backend
    def updateWebServers(self, names, root):
        for name in names:
            self.addDirName(name, root, self.webServers)
        self.sendJsonData(self.webServers, "update/web-servers")
    
    # Method that takes 
    def sendJsonData(self, data, endpoint):
        # Convert the data to JSON
        dataJson = json.dumps(data)
        # Send the data to the backend
        jsonDict = {"ip":self.ip, "data": dataJson}
        headers = {"Content-Type": "application/json"}
        try:
            response = requests.post(agentUrl+endpoint, data=json.dumps(jsonDict), headers=headers)
        except:
            print('Error sending data')
