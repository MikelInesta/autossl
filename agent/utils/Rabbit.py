import queue
import pika,base64, requests
from .Identification import Identification
from config import AGENT_ENDPOINT_ADDRESS
import os
from .CertifcateUtils import CertificateUtils

# This function is executed when a messsage is received (request for a csr) 
def requestCallback(ch, method, properties, body):
    print(f"Received a message, I believe: {body.decode('utf-8')}")

class Rabbit:
    def __init__(self, host):
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))
        print("Created the connection")
        self.channel = self.connection.channel()
        print("Created the channel")

    def declareAndBind(self, agentId):
        try:
            queue = self.channel.queue_declare(queue=agentId)
            self.channel.queue_bind(
                exchange="csrExchange",
                queue=queue.method.queue,
                routing_key=agentId,
            )
            print("Succesfully declared the agent's queue and binded it to the exchange")
        except Exception:
            print("Something went wrong while declaring and binding")

    def consumeMessages(self, agentId):
        message = self.channel.basic_get(queue=agentId, auto_ack=True)
        if message:
            print("Consumed a mesage")
        else:
            print("Nothing in the queue to consume")

