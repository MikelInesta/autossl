import time
import signal
import threading

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from config import logger, config
from agent import Agent
from rabbit import Rabbit
from identification import authenticate


class Watcher:

    def __init__(self, directory=".", handler=FileSystemEventHandler()):
        self.observer = Observer()
        self.handler = handler
        self.directory = directory

    def run(self):
        self.observer.schedule(self.handler, self.directory, recursive=True)
        self.observer.start()
        logger.info(f"Watcher Running in {self.directory}/")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("Watcher Stopped by KeyboardInterrupt")
        except Exception as e:
            logger.error(e)
        finally:
            self.stop()

    def stop(self):
        self.observer.stop()
        self.observer.join()
        logger.info("Watcher Terminated")

    def signalHandler(self):
        logger.info(f"{signal} received, stopping watcher...")
        self.stop()


""" 
    Handler class to run on file changes,
    It does some gymnastics to avoid temporary files created by editors like vim
"""


class FileChangeHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.updateScheduled = False

    def schedule_update(self):
        self.updateScheduled = False
        a = Agent()
        a.update()

    def on_any_event(self, event):
        if event.event_type in ["opened", "closed"] or event.is_directory:
            return
        fileName = event.src_path.split("/")[-1]
        if (
            fileName.startswith(".")
            or fileName.endswith("~")
            or fileName.split(".")[0].isdigit()
        ):
            return

        if not self.updateScheduled:
            self.updateScheduled = True
            threading.Timer(25, self.schedule_update).start()


if __name__ == "__main__":

    try:
        url = config["SERVER_ADDRESS"]
    except KeyError as e:
        logger.error(f"Couldn't retrieve the server address from the backend: {e}")

    try:
        # Force authentication
        authenticate(url)
    except Exception as e:
        logger.error(f"Something went wrong authenticating: {e}")

    try:
        logger.info("Application started")
        a = Agent()
        logger.info("Agent instantiated")
        a.update()
        logger.info("Agent update sent")
    except Exception as e:
        logger.error(f"Something went wrong starting the agent: {e}")

    try:
        Rabbit.start()
        logger.info("Started rabbitmq listener")
    except Exception as e:
        logger.error(f"Something went wrong starting the rabbitmq listener: {e}")

    try:
        w = Watcher("/etc/nginx/sites-available", FileChangeHandler())
    except Exception as e:
        logger.error(f"Something went wrong starting the watcher: {e}")

    try:
        signal.signal(signal.SIGINT, w.signalHandler)
        signal.signal(signal.SIGTERM, w.signalHandler)
    except Exception as e:
        logger.error(f"Something went wrong setting up the signal handlers: {e}")

    try:
        w.run()
    except Exception as e:
        logger.error(f"Something went wrong while running the watcher: {e}")
