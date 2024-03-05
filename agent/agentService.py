from Agent import Agent
import os
from watchdog.observers import Observer

# This file is intended to be run as a system service
# It will track for file changes

if os.geteuid() != 0:
  exit("Root permissions are needed to read the certificate chain, please run again as root or using sudo.")

"""
path = self.webServer['configuration_path']
event_handler = udpate()
observer = Observer()
observer.schedule(event_handler, path, recursive=True)
observer.start()
"""

# Initialize the agent
a = Agent()

# Find every change and send the update to the backend
if a.update():
  print("Succesfully sent the updated data to the backend")
else:
  print("Something went wrong sending the data to the backend")


