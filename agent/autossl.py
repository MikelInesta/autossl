import subprocess # To run shell commands
#import re # Regex parsing 

class Agent:
    def __init__(self):
        self.servers = []

    def findActiveServers(self):
        # Shell command to find all servers listening on ports 80, 8080, 443, 8443 or 
        # containing the names apache (or httpd) or nginx
        command = "sudo netstat -tnlp  | grep 'apache\|nginx\|httpd\|:80\|:8080\|:443\|:8443' | awk '{print $4,$7}'"
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        output = result.stdout.strip()

        lines = output.split('\n')
        for line in lines:
            parts = line.split(' ') #Splits the line into port and pid/name
            port = parts[0].split(':')[1] #Splits the port from the ip
            pid = parts[1].split('/')[0] #Splits the pid from the name
            name = parts[1].split('/')[1].rstrip(':') #Splits the name from the pid and removes the final colon
            print(f'Port:{port}, PID: {pid}, Name: {name}')
            # Check to find wether a server with the same name and pid is already considered
            for server in self.servers:
                if server['name'] == name and server['pid'] == pid:
                    if port != '' and port not in server['ports']:
                        server['ports'].append(port)
                    break
            else:
                self.servers.append({'name': name, 'pid': pid, 'ports': [port]})

