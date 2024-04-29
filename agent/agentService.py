from Agent import Agent
import os, schedule, time
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from utils.SystemUtils import SystemUtils
from config import RABBIT_ADDRESS, AGENT_ENDPOINT_ADDRESS
from utils.Rabbit import Rabbit
from utils.Identification import Identification


def queuePolling(rabbit):
    # Polling every minute to see if there are new messages
    schedule.every(1).minutes.do(rabbit.consumeGet, f"{agentId}Queue")
    while True:
        schedule.run_pending()
        time.sleep(1)

class UpdateHandler(FileSystemEventHandler):
    def __init__(self):
        self.agent = Agent()
        print("instantiating an agent")

    def on_modified(self, event):
        self.agent.update()

if __name__ == "__main__":
    if os.geteuid() != 0:
        exit("Root permissions are needed, please run as root or use sudo.")

    print("instantiating an agent")
    a = Agent()
    a.update()

    webServers = SystemUtils.getWebServersConfigPath(
        "/etc", ["nginx", "apache2", "apache", "httpd"]
    )

    # Identify the agent
    if AGENT_ENDPOINT_ADDRESS:
        agentUrl = AGENT_ENDPOINT_ADDRESS
    else:
        print("Could not get the Agent's endpoint address from .env")
        exit(1)
    identificator = Identification(agentUrl)
    agentId = identificator.getAgentId()
    if not agentId:
        identificator.authenticate()
        agentId = identificator.getAgentId()
        if not agentId:
            print("Can't get the agent id ")
            exit(1)

    # Create a queue, bind it to the csr exchange and start polling
    if RABBIT_ADDRESS:
        rabbit = Rabbit(RABBIT_ADDRESS)
    else:
        print("Could not get the rabbit server address from .env")
        exit(1)
    rabbit.declareAndBind(f"{agentId}Queue", agentId, "csrExchange")
    SystemUtils.openThread(queuePolling, [rabbit])
    
    observer = Observer()
    for webServerName in webServers:
        path = webServers[webServerName]["configuration_path"]
        event_handler = UpdateHandler()
        observer.schedule(event_handler, path, recursive=True)
    observer.start()
    observer.join()
