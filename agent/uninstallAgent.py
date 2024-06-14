from subprocess import run

# Remove the service file
try:
    run(["rm", "/lib/systemd/system/autossl.service"])
    print("Removed the service file")
except Exception as e:
    print(f"Something went wrong trying to remove the service file: {e}")

# Remove the app
try:
    run(["rm", "-rf" "/opt/autossl"])
    print("Removed the application files")
except Exception as e:
    print(f"Something went wrong trying to remove the application files: {e}")

# Restart the daemons
try:
    run(["sudo", "systemctl", "daemon-reload"])
    print(f"Succesfully removed the autossl agent")
except Exception as e:
    print(f"Something went wrong enabling the autossl service: {e}")
    exit(-1)
