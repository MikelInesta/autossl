import * as amqp from "amqplib";

const getConnection = async (): Promise<amqp.Connection | false> => {
  try {
    const connection = await amqp.connect("aqmp://localhost");
    return connection;
  } catch (e: any) {
    return false;
    console.log("Something went wrong when creating the rabbitmq connection");
  }
};

const getChannel = async (
  connection: amqp.Connection,
): Promise<amqp.Channel | false> => {
  try {
    const channel = await connection.createChannel();
    return channel;
  } catch (e: any) {
    console.log("Something went wrong creating the rabbitmq channel");
    return false;
  }
};

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
