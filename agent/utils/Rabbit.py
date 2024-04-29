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

    def declareAndBind(self, queueName, routingKey, exchangeName):
        try:
            queue = self.channel.queue_declare(queue=queueName)
            self.channel.queue_bind(
                exchange=exchangeName,
                queue=queueName,
                routing_key=routingKey,
            )
            print(f"Succesfully declared {queueName} queue and binded it to the {exchangeName} with key {routingKey}")
        except Exception:
            print(f"Something went wrong while declaring {queueName} and binding it to {exchangeName} with key {routingKey}")

    def consumeGet(self, queueName):
        print(f"Cheking wether {queueName} queue has messages")
        method, properties, body = self.channel.basic_get(queue=queueName, auto_ack=True)
        if body is not None:
            print(f"Consumed the following message from queue '{queueName}': ", body)
        else:
            print(f"Nothing in queue '{queueName}' to consume")

    def consumeBasic(self, agentId):
        self.channel.basic_consume(
            queue=agentId, 
            on_message_callback=requestCallback, 
            auto_ack=True
        )
        # Maybe I should execute this function in a separate thread
        self.channel.start_consuming()
        
