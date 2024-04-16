import os
import json
import requests


class Identification:
    def __init__(self, agentUrl):
        self.id = self.findId()
        self.agentUrl = agentUrl

    def findId(self):
        # Search for the ../config.json file and its agentId field
        configPath = os.path.join(os.path.dirname(__file__), "..", "config.json")
        try:
            with open(configPath) as config:
                fields = json.load(config)
                agentId = fields.get("agentId")
                return agentId
        except (FileNotFoundError, KeyError):
            # Register the agent and create the config file
            newAgentId = Identification.registerAgent()
            return newAgentId

    def registerAgent(self):
        try:
            res = requests.post(
                f"{self.agentUrl}/update",
                data=jsonData,
                headers={"Content-Type": "application/json"},
            )
            if res.status_code != 200:
                raise Exception(f"Error: {res.status_code}")
            else:
                print("Update sent successfully")
                return True
        except Exception as e:
            print(f"Error: {e}")
            return False
