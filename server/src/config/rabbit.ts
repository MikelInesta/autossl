import * as amqp from "amqplib";

const declareExchange = async (name: string, type: string) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertExchange(name, type, { durable: true });

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Something went wrong:", error);
    throw error;
  }
};

// const publishMessage = async (rabbitServerAddress:string)

async function publishMessage(exchangeName: string, key: string, message: any) {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    const message = "Message from the backend.";
    // Routing key should be the ip address of the server hosting the agent, maybe...
    await channel.publish(exchangeName, key, Buffer.from(message));

    console.log(`Message published to exchange ${exchangeName}`);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Something went wrong:", error);
    throw error;
  }
}

export { declareExchange, publishMessage };

