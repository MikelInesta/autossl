import * as amqp from "amqplib";

const declareExchange = async (name: string, type: string) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    const channel = await connection.createChannel();

    await channel.assertExchange(name, type, { durable: true });
    await connection.close();
  } catch (error) {
    console.log("Something went wrong:", error);
    throw error;
  }
};

const publishMessage = async (
  exchangeName: string,
  key: string,
  message: any,
) => {
  try {
    const connection = await amqp.connect("amqp://localhost");
    console.log("rabbit connection made");
    const channel = await connection.createChannel();
    console.log("channel created");
    channel.publish(
      "testExchange",
      "pipiritiflauticaKey",
      Buffer.from("alo from backend"),
    );
    console.log(`Message published to testExchange rk: pipiritiflauticaKey`);
    await connection.close();
  } catch (error) {
    console.log("Something went wrong:", error);
    throw error;
  }
};

export { declareExchange, publishMessage };
