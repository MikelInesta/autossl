import pika
import json

from certificateSigningRequest import CertificateSigningRequest
from installCertificate import InstallCertificate
from rollback import Rollback
from config import logger, config
from identification import authenticate
from systemUtils import SystemUtils


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
        Connects to the rabbitmq server, declares and binds a queue
        and starts the consumer thread
    """

    @staticmethod
    def start():
        # Create a queue, bind it to the csr exchange and start polling
        try:
            rabbitAddress = config["RABBIT_ADDRESS"]
            rabbitUser = config["RABBIT_USER"]
            rabbitPassword = config["RABBIT_PASSWORD"]
        except KeyError as e:
            logger.error(f"Couldn't get rabbit configuration info: {e}")
            exit(-1)

        rabbit = Rabbit(
            rabbitAddress,
            rabbitUser,
            rabbitPassword,
        )

        try:
            agentId = authenticate()
        except Exception as e:
            logger.error(f"Couldn't authenticate: {e}")
            exit(-1)

        try:
            rabbit.declareAndBind(f"{agentId}Queue", agentId, "csrExchange")
        except Exception as e:
            logger.error(
                f"Something went wrong trying to declare and bind a queue: {e}"
            )
            exit(-1)

        try:
            SystemUtils.openThread(
                rabbit.consumeBasic, [f"{agentId}Queue", Rabbit.consumeCallback]
            )
        except Exception as e:
            logger.error(
                f"Something went wrong trying to open a thread for rabbit message consumption: {e}"
            )
            exit(-1)


"""
# Unused polling function * In case it could be more efficient than just consuming basic
def queuePolling(rabbit):
    # Polling every minute to see if there are new messages
    schedule.every(1).minutes.do(rabbit.consumeGet, f"{agentId}Queue")
    while True:
        schedule.run_pending()
        time.sleep(1)
        
def consumeGet(self, queueName):
    # print(f"Cheking wether {queueName} queue has messages")
    method, properties, body = self.channel.basic_get(
        queue=queueName, auto_ack=True
    )
    if body is not None:
        print(f"Consumed the following message from queue '{queueName}': ", body)
    else:
        print(f"Nothing in queue '{queueName}' to consume")
        
"""
