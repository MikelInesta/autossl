from venv import create
from os.path import join, expanduser, abspath
from subprocess import run
import shutil

try:
    # Move the actual application to its working directory
    shutil.move("agent", "/opt/autossl/")
    print("Moved agent to /opt/autossl/")

    # Move the service file
    shutil.move("autossl.service", "/lib/systemd/system/autossl.service")
    print("Moved autossl.service to /lib/systemd/system/autossl.service")
except Exception as e:
    print(f"Something went wrong installing the agent: {e}")

try:
    # Create the venv and install the requirements
    create("/opt/autossl/.venv", with_pip=True)
    print("Created /opt/autossl/.venv")

    # where requirements.txt is in same dir as this script
    run(
        ["bin/pip", "install", "-r", abspath("/opt/autossl/agent/requirements.txt")],
        cwd=dir,
    )
    print("Installed the necessary python dependencies")
except Exception as e:
    print(f"Something went wrong installing the necessary python dependencies")

try:
    # Enable the service
    run(["sudo", "systemctl", "daemon-reload"])
    run(["sudo", "systemctl", "enable", "autossl.service"])
    run(["sudo", "systemctl", "start", "autossl.service"])
    print(f"Succesfully deployed the autossl agent")
except Exception as e:
    print(f"Something went wrong enabling the autossl service")
