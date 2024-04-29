import json
import requests
from .SystemUtils import SystemUtils


class Identification:
    def __init__(self, agentUrl):
        self.agentUrl = agentUrl
        self.configPath = "agentId.json"
        self.agentId = self.getAgentIdFromConfig()
        self.serverIp = SystemUtils.getIpAddress()

    def authenticate(self):
        configData = self.readConfigFile()
        if not configData:
            self.agentId = self.createNew()  # Inside createNew call writeConfigFile
        else:
            valid = self.isValid(configData["agentId"])
            print("Agent id is valid: ", valid)
            if valid:
                self.agentId = configData["agentId"]
            else:
                self.agentId = self.createNew()

    def readConfigFile(self):
        try:
            with open(self.configPath, "r") as file:
                configData = json.load(file)
            print("Read config data: ", configData)
            return configData
        except FileNotFoundError:
            print("Configuration file was not found, returning False")
            return False

    def createNew(self):
        response = requests.get(self.agentUrl + "new/" + self.serverIp)
        print("Getting agent id from backend: ", response)
        print("Data obtained: ", response.json())
        if response.status_code == 200:
            agentId = response.json().get("_id")
            self.writeConfigFile(agentId)
            return agentId
        else:
            raise Exception("Failed to create a new agent")

    def writeConfigFile(self, agentId):
        configData = {"agentId": agentId}
        print("Writing config file with agentId:", agentId)
        with open(self.configPath, "w") as file:
            json.dump(configData, file)

    def isValid(self, id):
        print("Id passed for validation: ", id)
        if not id:
            return False

        validationUrl = self.agentUrl + "validate/" + id
        print("Validation url: ", validationUrl)
        response = requests.get(self.agentUrl + "validate/" + id)
        print("Backend returned valitation: ", response)
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
