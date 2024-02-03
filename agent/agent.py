import json
import requests
from autossl import Agent
import os # To check for root privileges

""""" This lines are commented out because for now we are using file search instead of service search using netstat
# Check for root privileges, for netstat to show full process information (pid and name are exclusive to owner)
if os.geteuid() != 0:
  exit("Root privileges are required to access server information.\n\
Please try again as root or using 'sudo'. Exiting.")

agent = Agent()
agent.findActiveServers()


"""""

# Initialize the agent
agent = Agent()

searchRoot = "/etc"

# Search the directory /etc for configuration files related to nginx and apache
agent.findDir("nginx", searchRoot)
agent.findDir("apache2", searchRoot)
agent.findDir("apache", searchRoot)
agent.findDir("httpd", searchRoot)

print(f'Found {agent.servers}')

# Add the current server IP for identification
ip = requests.get('https://api.ipify.org').content.decode('utf8')
jsonDict = {"ip":ip, "servers": agent.servers}

# Convert the servers list to JSON
serversJson = json.dumps(jsonDict)

# Send the JSON to the node backend


url = "https://autossl.mikelinesta.com/backend/update"
headers = {"Content-Type": "application/json"}

try:
  response = requests.post(url, data=serversJson, headers=headers)
  if response.status_code == 200:
    print("Data sent")
  else:
      print("Error updating data:", response)
except Exception:
  print(f'Error establishing a connection with {url}')

