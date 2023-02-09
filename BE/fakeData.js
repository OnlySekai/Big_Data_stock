const { Client } = require('pg')
const client = new Client({
    user:'postgres',
    password:'12345678',
    host:'172.16.10.100',
    port: 31001,
    database: 'postgres'
})
const {Kafka} = require('kafkajs')
const kafka = new Kafka({
  brokers: ['localhost:29092'],
})
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
const execute = async () =>{
    while (true){
        let price =(Math.random()*20 + 80).toFixed(2)
        let time = Date.now()
        await delay(3000).then(async ()=>{
            await client.query(
                `insert into stocks_real_time(symbol, price)
                values ('AMZN', ${price})`
            )
            console.log(price)
        })
    }
}
console.log(client.password)
client.connect().then(()=> execute())