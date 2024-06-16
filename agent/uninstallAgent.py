import os
import shutil

from subprocess import run


def uninstall():
    # Check for sudo
    if os.geteuid() != 0:
        exit(
            "You need to have root privileges to run this script.\nPlease try again, this time using 'sudo'. Exiting."
        )

    # Remove the service file
    try:
        os.remove("/lib/systemd/system/autossl.service")
        print("Removed the service file")
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"Something went wrong trying to remove the service file: {e}")
        exit(-1)

    # Remove the app
    try:
        shutil.rmtree("/opt/autossl")
        print("Removed the application files")
    except FileNotFoundError:
        pass
    except Exception as e:
        print(f"Something went wrong trying to remove the application files: {e}")
        exit(-1)

    # Restart the daemons
    try:
        run(["systemctl", "daemon-reload"])
        print("Succesfully removed the autossl agent")
    except Exception as e:
        print(f"Something went wrong reloading the daemons: {e}")
        exit(-1)


uninstall()
