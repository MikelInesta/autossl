import os
import json
import requests


class Identification:
    def __init__(self, agentUrl, configPath=None):
        self.agentUrl = agentUrl
        if configPath is not None:
            self.configPath = configPath
        else:
            os.path.join(os.path.dirname(__file__), "..", "agentId.json")
        self.agentId = self.getAgentIdFromConfig()

    def authenticate(self):
        configData = self.readConfigFile()
        if not configData:
            self.agentId = self.createNew()  # Inside createNew call writeConfigFile
        else:
            valid = self.isValid(configData["agentId"])
            if valid:
                self.agentId = configData["agentId"]
            else:
                self.agentId = self.createNew()

    def readConfigFile(self):
        with open(self.configPath, "r") as file:
            configData = json.load(file)
        return configData

    def createNew(self):
        response = requests.get(self.agentUrl + "/new")
        if response.status_code == 200:
            agentId = response.json().get("agentId")
            self.writeConfigFile(agentId)
            return agentId
        else:
            raise Exception("Failed to create a new agent")

    def writeConfigFile(self, agentId):
        configData = {"agentId": agentId}
        with open(self.configPath, "w") as file:
            json.dump(configData, file)

    def isValid(self, id):
        response = requests.get(self.agentUrl + "/validate/" + id)
        if response.status_code == 200:
            return True
        else:
            return False

    def getAgentIdFromConfig(self):
        configData = self.readConfigFile()
        if configData:
            agentId = configData.get("agentId")
            if agentId:
                return agentId
        return None

    def getAgentId(self):
        return self.agentId
