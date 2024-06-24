import * as amqp from "amqplib";

// This attempt at reusing connection and channel might be dangerous

let connection: amqp.Connection | null = null;
let channel: amqp.Channel | null = null;

const rabbitConnect = async () => {
  if (!connection) {
    const connectionParameters = {
      protocol: "amqp",
      hostname: process.env.RABBIT_ADDRESS || "autossl.mikelinesta.com",
      port: 5672,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASSWORD,
    };
    connection = await amqp.connect(connectionParameters);
  }
  return connection;
};

const rabbitChannel = async () => {
  if (!channel && connection) {
    channel = await connection.createChannel();
  }
  return channel;
};

const declareExchange = async (name: string, type: string) => {
  try {
    const connection = await rabbitConnect();
    const channel = await rabbitChannel();
    if (!connection || !channel) return;
    await channel.assertExchange(name, type, { durable: true });
  } catch (error) {
    console.log("Something went wrong:", error);
    throw error;
  }
};

const publishMessage = async (
  exchangeName: string,
  routingKey: string,
  message: any
) => {
  try {
    const connection = await rabbitConnect();
    const channel = await rabbitChannel();
    // If exchange is '' the message will be published to the queue named routingKey
    if (!connection || !channel) return;
    const publishRet = channel.publish(
      exchangeName,
      routingKey,
      Buffer.from(message)
    );
    if (publishRet) {
      console.log(publishRet);
    }
    console.log(
      `Message published to exchange:${exchangeName} key:${routingKey}`
    );
    //console.log(`Message: ${message}`);
  } catch (error) {
    console.log("Something went wrong:", error);
    throw error;
  }
};

export { declareExchange, publishMessage };
