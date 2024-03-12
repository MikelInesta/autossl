from Agent import Agent
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from utils.SystemUtils import SystemUtils


class UpdateHandler(FileSystemEventHandler):
    def __init__(self):
        self.agent = Agent()

    def on_modified(self, event):
        self.agent.update()


if __name__ == "__main__":
    if os.geteuid() != 0:
        exit("Root permissions are needed, please run as root or use sudo.")

    a = Agent()
    a.update()

    webServers = SystemUtils.getWebServersConfigPath(
        "/etc", ["nginx", "apache2", "apache", "httpd"]
    )

    observer = Observer()
    for webServerName in webServers:
        path = webServers[webServerName]["configuration_path"]
        event_handler = UpdateHandler()
        observer.schedule(event_handler, path, recursive=True)
    observer.start()
    observer.join()
