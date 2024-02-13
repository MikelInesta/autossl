import json
import requests #external (pip install requests)
from helper import FileExplorer

def updateWebServers():

  # Initialize the agent
  fe = FileExplorer()

  searchRoot = "/etc"

  # Search the directory /etc for configuration files related to nginx and apache
  fe.findDir("nginx", searchRoot)
  fe.findDir("apache2", searchRoot)
  fe.findDir("apache", searchRoot)
  fe.findDir("httpd", searchRoot)

  print(f'Found {fe.servers}')

  # Add the current server IP for identification
  ip = requests.get('https://api.ipify.org').content.decode('utf8')
  jsonDict = {"ip":ip, "servers": fe.servers}

  # Convert the servers list to JSON
  serversJson = json.dumps(jsonDict)

  # Send the JSON to the node backend


  url = "https://autossl.mikelinesta.com/api/agents/update/web-servers"
  headers = {"Content-Type": "application/json"}

  try:
    response = requests.post(url, data=serversJson, headers=headers)
    if response.status_code == 200:
      print(response);
    else:
        print("Error updating data:", response)
  except Exception:
    print(f'Error establishing a connection with {url}')

