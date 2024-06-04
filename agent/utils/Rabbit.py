import pika


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
            """print(
                f"Succesfully declared {queueName} queue and binded it to the {exchangeName} with key {routingKey}"
            )"""
        except Exception:
            """print(
                f"Something went wrong while declaring {queueName} and binding it to {exchangeName} with key {routingKey}"
            )"""

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
