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
        try:
            self.connection = pika.BlockingConnection(pika.ConnectionParameters(host))
            self.channel = self.connection.channel()
        except Exception:
            print("Could not establish a connection to the rabbitmq server:")
            exit(1)

    def declareAndBind(self, agentId):
        try:
            self.channel.queue_declare(queue="pipiritiflauticaQ")
            self.channel.queue_bind(
                exchange="testExchange",
                queue="pipiritiflauticaQ",
                routing_key="pipiritiflauticaKey",
            )
            print("Succesfully declared the agent's queue and binded it to the exchange")
        except Exception:
            print("Something went wrong while declaring and binding")

    def consumeMessages(self, agentId):
        # self.channel.basic_consume(
        #     queue=agentId, 
        #     on_message_callback=requestCallback, 
        #     auto_ack=True
        # )
        # self.channel.start_consuming()
        print(f"Cheking wether {agentId} queue has messages")
        method, properties, body = self.channel.basic_get(queue="pipiritiflauticaQ", auto_ack=True)
        if body is not None:
            print("Received the message: ", body)
        else:
            print("Nothing in the queue to consume")

