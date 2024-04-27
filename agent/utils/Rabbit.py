import queue
import pika, CertifcateUtils, base64, requests
from Identification import Identification
from config import AGENT_ENDPOINT_ADDRESS
import os

def queueCallback(ch, method, properties, body):
        try:
            # Get CSR and send it to the backend
            # csr = CertifcateUtils.getCsr()
            # with open(csr, "rb") as csr_file:
            #     csrData = csr_file.read()

            # csrEncoded = base64.b64encode(csrData).decode("utf-8")
            # csrJson = {"agentId": Identification().getAgentId(), "csr": csrEncoded}


            testingJson = {"test": "testdata"}

            response = requests.post(
                    f"{os.environ.get("SERVER_ADDRESS")}/csr",
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
    def __init__(self, host="localhost"):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))
        self.channel = self.connection.channel()

    def declareAndBind(self, queueName, exchangeName, routingKey):
        if not queueName:
            identif = Identification(AGENT_ENDPOINT_ADDRESS)
            queueName = identif.getAgentId()

        self.channel.queue_declare(queue=queueName)
        self.channel.queue_bind(
            exchange=exchangeName,
            queue=queueName,
            routing_key=routingKey,
        )

        self.channel.basic_consume(
            queue=queueName,
            on_message_callback=queueCallback,
            auto_ack=True
        )

    
