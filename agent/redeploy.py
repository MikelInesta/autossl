import os
import shutil

from installAgent import install
from uninstallAgent import uninstall


if os.geteuid() != 0:
    exit(
        "You need to have root privileges to run this script.\nPlease try again, this time using 'sudo'. Exiting."
    )

try:

    # Remove certificates
    shutil.rmtree("/etc/ssl/certs/autossl", ignore_errors=True)

    # Uninstall
    uninstall()

    # Install
    install()

except Exception as e:
    print(f"Couldn't redeploy: {e}")
