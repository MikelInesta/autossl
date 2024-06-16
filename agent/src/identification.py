import json
import os
import requests

from systemUtils import SystemUtils
from config import logger


# A static function to authenticate and get the agent's id
def authenticate(apiEndpoint):
    try:
        identification = Identification(apiEndpoint)
    except Exception as e:
        logger.error(f"Couldn't instantiate the Identification object: {e}")

    try:
        identification.authenticate()
    except Exception as e:
        logger.error(f"Couldn't authenticate: {e}")

    try:
        return identification.getAgentId()
    except Exception as e:
        logger.error(f"Couldn't get the agent id from identification: {e}")


class Identification:
    def __init__(self, apiEndpoint):
        try:
            self.apiEndpoint = apiEndpoint
            self.configPath = "agentId.json"
            self.agentId = self.getAgentIdFromConfig()
            self.serverIp = SystemUtils.getIpAddress()
        except Exception as e:
            logger.error(f"Couldn't initialize the Identification object: {e}")

    def authenticate(self):
        try:
            configData = self.readConfigFile()
            if not configData:
                self.agentId = self.createNew()  # Inside createNew call writeConfigFile
            else:
                try:
                    agentId = configData["agentId"]
                except KeyError as e:
                    logger.error(f"Couldn't get the key {e} from configData")

                valid = self.isValid(agentId)
                logger.info(f"Is Agent id {agentId} valid? -> {valid}")
                if valid:
                    self.agentId = agentId
                else:
                    logger.info(
                        f"Agent id '{self.agentId}' is not valid, creating a new one"
                    )
                    self.agentId = self.createNew()
        except Exception as e:
            logger.error(f"Something wen't wrong while authenticating: {e}")

    def readConfigFile(self):
        try:
            with open(self.configPath, "r") as file:
                configData = json.load(file)
            return configData
        except FileNotFoundError:
            logger.info("Configuration file was not found, returning False")
            return False
        except Exception as e:
            logger.error(
                f"Something wen't wrong while trying to read the configuration file: {e}"
            )

    def createNew(self):
        # Remove the old config file
        try:
            os.remove(self.configPath)
        except FileNotFoundError:
            pass
        except Exception as e:
            logger.error(f"Couldn't remove the old configuration file: {e}")

        try:
            response = requests.get(self.apiEndpoint + "/agents/new/" + self.serverIp)
            try:
                if response.status_code == 200:
                    agentId = response.json().get("_id")
                    self.writeConfigFile(agentId)
                    return agentId
                else:
                    raise Exception(
                        f"Received a negative status response when requesting new agent: {response}"
                    )
            except Exception as e:
                logger.error(
                    f"Something went wrong while writing the received new agent: {e}"
                )
        except Exception as e:
            logger.error(f"Something wen't wrong while requesting a new agent: {e}")

    def writeConfigFile(self, agentId):
        try:
            configData = {"agentId": agentId}
            with open(self.configPath, "w") as file:
                json.dump(configData, file)
        except Exception as e:
            logger.error(
                f"Something went wrong trying to write agent id to config file: {e}"
            )

    def isValid(self, agentId):
        if not agentId:
            return False

        try:
            jsonId = json.dumps({"id": agentId})
            response = requests.post(
                self.apiEndpoint + "/agents/validate/" + agentId, json=jsonId
            )
            if response.status_code == 200:
                logger.info(f"Agent with id {agentId} validated succesfully")
                return True
            else:
                logger.info(f"Agent with id {agentId} not valid")
                return False
        except Exception as e:
            logger.error(f"Something went wrong trying to validate agent id: {e}")
            return False

    def getAgentIdFromConfig(self):
        try:
            configData = self.readConfigFile()
        except Exception as e:
            logger.error(f"Couldn't read config file: {e}")

        try:
            if configData:
                agentId = configData.get("agentId")
                if agentId:
                    return agentId
        except Exception as e:
            logger.error(f"Something went wrong getting the agent id from config: {e}")
        return None

    def getAgentId(self):
        return self.agentId
