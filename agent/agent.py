from agent import agent

searchRoot = "/etc"
names = ["nginx", "apache2", "apache", "httpd"]

# Initialize the agent
a = agent()

# Send the web servers to the backend
a.updateWebServers(names, searchRoot)





