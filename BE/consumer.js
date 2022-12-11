const {Kafka} = require('kafkajs')


const kafka = new Kafka({
  brokers: ['localhost:29092'],
})

const consumer = async() => {
  const consumer = kafka.consumer({ groupId: 'my-group' })
  await consumer.connect()
  await consumer.subscribe({topics: ['test'], fromBeginning: true})
  await consumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        console.log({
            topic,
            partition,
            key: message.key.toString(),
            value: message.value.toString(),
            headers: message.headers,
        })
    },
})
}
consumer()