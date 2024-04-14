import * as amqp from 'amqplib';

const declareExchange = async () => {
    try {
        const connection = await amqp.connect('amqp://localhost');
        const channel = await connection.createChannel();

        await channel.assertExchange("csrExchange", "direct", { durable: true });

        await channel.close();
        await connection.close();
    } catch (error) {
        console.error('Something went wrong:', error);
        throw error;
    }
}

export {declareExchange};