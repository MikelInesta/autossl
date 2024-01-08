import json
import requests
from autossl import Agent
import os # To check for root privileges

# Check for root privileges, for netstat to show full process information (pid and name are exclusive to owner)
if os.geteuid() != 0:
  exit("Root privileges are required to access server information.\n\
Please try again as root or using 'sudo'. Exiting.")

agent = Agent()
agent.findActiveServers()

print(f'Found {agent.servers}')
# Convert the servers list to JSON
serversJson = json.dumps(agent.servers)

# Send the JSON to the node backend
url = "http://autossl.mikelinesta.com/node/sendStatus"
headers = {"Content-Type": "application/json"}
response = requests.post(url, data=serversJson, headers=headers)

if response.status_code == 200:
    print("Data sent")
else:
    print("Error sending data")

###coment
