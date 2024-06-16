import shutil
import os

from venv import create
from os.path import abspath
from subprocess import run


def install():
    # Check for sudo
    if os.geteuid() != 0:
        exit(
            "You need to have root privileges to run this script.\nPlease try again, this time using 'sudo'. Exiting."
        )

    try:
        # Move the actual application to its working directory
        shutil.copytree("src", "/opt/autossl/")
        print("Moved src to /opt/autossl/")

        # Move the service file
        shutil.copy("autossl.service", "/lib/systemd/system/autossl.service")
        print("Moved autossl.service to /lib/systemd/system/autossl.service")
    except Exception as e:
        print(f"Something went wrong installing the agent: {e}")
        exit(-1)

    try:
        # Create the venv and install the requirements
        create("/opt/autossl/.venv", with_pip=True)
        print("Created /opt/autossl/.venv")

        # where requirements.txt is in same dir as this script
        run(
            [
                "bin/pip",
                "install",
                "-r",
                abspath("/opt/autossl/requirements.txt"),
            ],
            cwd="/opt/autossl/.venv",
        )
        print("Installed the necessary python dependencies")
    except Exception as e:
        print(f"Something went wrong installing the necessary python dependencies: {e}")
        exit(-1)

    try:
        # Enable the service
        run(["sudo", "systemctl", "daemon-reload"])
        run(["sudo", "systemctl", "enable", "autossl.service"])
        run(["sudo", "systemctl", "start", "autossl.service"])
        print("Succesfully deployed the autossl agent")
    except Exception as e:
        print(f"Something went wrong enabling the autossl service: {e}")
        exit(-1)


install()
