import pika, CertifcateUtils, base64
from requests import request
from agent.utils.Identification import Identification
import os

class Rabbit:
    def __init__(self, host="localhost"):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))
        self.channel = self.connection.channel()

    def declareAndBind(self, queueName, exchangeName, routingKey):
        if not agentId:
            identif = Identification()
            agentId = identif.agetAgentId()

        self.channel.queue_declare(queue=agentId)
        self.channel.queue_bind(
            exchange=exchangeName,
            queue=queueName,
            routing_key=routingKey,
        )

    def callback(ch, method, properties, body):
      try:
        # Get CSR and send it to the backend
        csr = CertifcateUtils.getCsr()
        with open(csr, "rb") as csr_file:
            csrData = csr_file.read()

        csrEncoded = base64.b64encode(csrData).decode("utf-8")
        csrJson = {"agentId": Identification().getAgentId(), "csr": csrEncoded}

        response = request.post(
            f"{os.environ.get("SERVER_ADDRESS")}/csr",
            data=csrJson,
            headers={"Content-Type": "application/json"},
        )
        if response.status_code != 200:
            raise Exception(f"Error: {response.status_code}")
        else:
          print("CSR sent successfully")
      except Exception as e:
        print(f"Error: {e}")
