const {Kafka} = require('kafkajs')


const kafka = new Kafka({
  brokers: ['localhost:29092'],
})

const fakeData = {
  symbol: "AMZN",
  price: 50,
  time: Date.now(),
}

const producer = async() => {
  const producer = kafka.producer()

  await producer.connect().then((a) => console.log('connet',a))
  await producer.send({
    topic: 'stock',
    messages: [
      {key:'newPrice', value: JSON.stringify(fakeData)}
    ]
  })
  await producer.disconnect()
}


const admin =async() => {
  const admin = kafka.admin()

  await admin.connect()
  await admin.createTopics({topics: [
    {
      topic: 'test',
    }
  ]})
  console.log(await admin.listTopics())
  await admin.disconnect()
}

producer()
