import subprocess # To run shell commands.
import os # For file search

class FileExplorer:
    def __init__(self):
        self.servers = []

    # Method that uses netstat to find active internet services by name (apache or nginx) or common ports (80, 8080, 443, 8443)
    def findActiveServicesThroughNetstat(self):
        # Shell command to find all servers listening on ports 80, 8080, 443, 8443 or 
        # containing the names apache (or httpd) or nginx.
        command = "sudo netstat -tnlp  | grep 'apache\|nginx\|httpd\|:80\|:8080\|:443\|:8443' | awk '{print $4,$7}'"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        output = result.stdout.strip()

        lines = output.split('\n')
        for line in lines:
            parts = line.split(' ') #S plits the line into port and pid/name.
            port = parts[0].split(':')[1] #S plits the port from the ip.
            pid = parts[1].split('/')[0] #S plits the pid from the name.
            name = parts[1].split('/')[1].rstrip(':') #S plits the name from the pid and removes the final colon.
            print(f'Port:{port}, PID: {pid}, Name: {name}')
            # Check to find wether a server with the same name and pid is already considered.
            for server in self.servers:
                if server['name'] == name and server['pid'] == pid:
                    if port != '' and port not in server['ports']:
                        server['ports'].append(port)
                    break
            else:
                self.servers.append({'name': name, 'pid': pid, 'ports': [port]})

    # Method that uses the file system to find if apache or nginx configuration directories exist.
    # Uses walk to search entire depth
    def findDirWalk(self, dirName, searchPath):
        result = []
        for root, dirs, files in os.walk(searchPath):
            if dirName in dirs:
                result.append(os.path.join(root, dirName))
        if result:
            result.insert(0, dirName) # We add the server name as the first element
            self.servers.append(result)
        return result
    
    # Method that just searches a given directory for a specific directory in it
    def findDir(self, dirName, searchDir):
        for item in os.listdir(searchDir):
            if os.path.isdir(os.path.join(searchDir, item)) and item == dirName:
                self.servers.append(os.path.join(searchDir, item))
    
