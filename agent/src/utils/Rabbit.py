import pika
import json

from .CertificateSigningRequest import CertificateSigningRequest
from .InstallCertificate import InstallCertificate
from .Rollback import Rollback


class Rabbit:
    def __init__(self, host, user, password):
        try:
            self.connection = pika.BlockingConnection(
                pika.ConnectionParameters(
                    host, 5672, "/", pika.PlainCredentials(user, password)
                )
            )
            self.channel = self.connection.channel()
        except Exception:
            print("Could not establish a connection to the rabbitmq server:")
            exit(1)

    def declareAndBind(self, queueName, routingKey, exchangeName):
        try:
            self.channel.queue_declare(queue=queueName)
            self.channel.queue_bind(
                exchange=exchangeName,
                queue=queueName,
                routing_key=routingKey,
            )
            """print(f"Succesfully declared {queueName} queue and binded it to the {exchangeName} with key {routingKey}")"""
        except Exception:
            print(
                f"Something went wrong while declaring {queueName} and binding it to {exchangeName} with key {routingKey}"
            )

    def consumeGet(self, queueName):
        # print(f"Cheking wether {queueName} queue has messages")
        method, properties, body = self.channel.basic_get(
            queue=queueName, auto_ack=True
        )
        if body is not None:
            print(f"Consumed the following message from queue '{queueName}': ", body)
        else:
            print(f"Nothing in queue '{queueName}' to consume")

    def consumeBasic(self, queueName, callbackFunction):
        self.channel.basic_consume(
            queue=queueName, on_message_callback=callbackFunction, auto_ack=True
        )
        # Maybe I should execute this function in a separate thread
        self.channel.start_consuming()

    @staticmethod
    def consumeCallback(ch, method, props, body):
        try:
            decodedBody = body.decode("utf-8")
        except UnicodeDecodeError as e:
            print(f"Error decoding body: {e}")
            return False

        try:
            parsedBody = json.loads(decodedBody)
        except json.JSONDecodeError as e:
            print(f"Error parsing JSON: {e}")
            return False

        try:
            typeOfRequest = parsedBody["request"]
        except KeyError as e:
            print(f"Key 'request' not found in parsed body: {e}")
            return False

        try:
            if "install" in typeOfRequest:
                InstallCertificate.installNewCertificate(parsedBody)
            elif "csr" in typeOfRequest:
                CertificateSigningRequest.sendNewCsr(parsedBody)
            elif "rollback" in typeOfRequest:
                Rollback.rollback()
            else:
                print(f"Unknown request type: {typeOfRequest}")
                return False
        except Exception as e:
            print(f"Error handling request type '{typeOfRequest}': {e}")
            return False

        return True


"""
# Unused polling function * In case it could be more efficient than just consuming basic
def queuePolling(rabbit):
    # Polling every minute to see if there are new messages
    schedule.every(1).minutes.do(rabbit.consumeGet, f"{agentId}Queue")
    while True:
        schedule.run_pending()
        time.sleep(1)
        
"""
