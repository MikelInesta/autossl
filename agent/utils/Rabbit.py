import queue
import pika,base64, requests
from .Identification import Identification
from config import AGENT_ENDPOINT_ADDRESS
import os
from .CertifcateUtils import CertificateUtils

def queueCallback(ch, method, properties, body):
        try:
            print("Inside callback function")
            # Get CSR and send it to the backend
            # csr = CertifcateUtils.getCsr()
            # with open(csr, "rb") as csr_file:
            #     csrData = csr_file.read()

            # csrEncoded = base64.b64encode(csrData).decode("utf-8")
            # csrJson = {"agentId": Identification().getAgentId(), "csr": csrEncoded}


            testingJson = {"test": "testdata"}

            response = requests.post(
                    f"{os.environ.get('SERVER_ADDRESS')}/csr",
                    data=testingJson,
                    headers={"Content-Type": "application/json"},
                )
            if response.status_code != 200:
                raise Exception(f"Error: {response.status_code}")
            else:
                print("CSR sent successfully")
        except Exception as e:
            print(f"Error: {e}")

class Rabbit:
    def __init__(self, host):
        print(f"host: {host}")
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))
        print("Created the connection")
        self.channel = self.connection.channel()
        print("Created the channel")

    # Just use the agent id for the name of both the queue and route I guess
    def declareAndBind(self, agentId):
        try:
            self.channel.queue_declare(queue=agentId)
            self.channel.queue_bind(
                exchange="csrExchange",
                queue=agentId,
                routing_key=agentId,
            )
            print("Declared and binded inside the Rabbit class")

            self.channel.basic_consume(
                queue=agentId,
                on_message_callback=queueCallback,
                auto_ack=True
            )
            print("Executed consume function")
        except Exception:
            print("Something went wrong while declaring and binding")

 
