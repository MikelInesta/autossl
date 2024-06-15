import time
import signal

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from config import logger
from agent import Agent


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

    # This goes for modified, deleted, created, moved and closed
    def on_any_event(self, event):
        # I'm not really interested in file closed nor opened
        if event.event_type == "opened" or event.event_type == "closed":
            return
        # I need to ignore directories and temporary files
        if event.is_directory:
            return
        fileName = event.src_path.split("/")[-1]
        if fileName.startswith(".") or fileName.endswith("~"):
            return
        # Ignore numeric file names
        fileNameWithoutExtension = fileName.split(".")[0]
        if fileNameWithoutExtension.isdigit():
            return
        logger.info(event)
        # Run the update
        a = Agent()
        a.update()


if __name__ == "__main__":
    w = Watcher("/etc/nginx/sites-available", FileChangeHandler())

    signal.signal(signal.SIGINT, w.signalHandler)
    signal.signal(signal.SIGTERM, w.signalHandler)

    w.run()
