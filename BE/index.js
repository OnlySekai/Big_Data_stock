// require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS,
  },
});

const { Client } = require("pg");
const client = new Client();
client
  .connect()
  .then(() => console.log("databse connect success"))
  .catch((err) => console.log(err.message));

const { Kafka, } = require("kafkajs");
const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER],
});

const  {subMinutes, subHours} = require('date-fns')

const kafkaData = async () => {
  const consumerVisualize = kafka.consumer({ groupId: "viz" });
  const consumerDb = kafka.consumer({ groupId: "db" });
  await Promise.all([consumerDb.connect(), consumerVisualize.connect()]);

  await Promise.all([
    consumerDb.subscribe({ topics: ["stock"] }),
    consumerVisualize.subscribe({ topics: ["stock"] }),
  ]);
  
  await Promise.all([
    consumerVisualize.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        const key = message.key.toString();
        try {
          const value = JSON.parse(message.value.toString());
          console.log({
            topic,
            type: "socket",
            partition,
            key,
            value,
            headers: message.headers,
          });
          if (key === "newPrice") {
            io.emit("newPrice", value);
          }
        } catch (err) {
          console.log("something wrong in socket");
        }
      },
    }),
    
    consumerDb.run({
      eachMessage: async ({ topic, partition, message, heartbeat, pause }) => {
        try {
          console.log({
            topic,
            type: "db",
            partition,
            key: message.key.toString(),
            value: message.value.toString(),
            headers: message.headers,
          });
          const newPrice = JSON.parse(message.value.toString());
          if (
            message.key.toString() != "newPrice" ||
            !newPrice.symbol ||
            !newPrice.price ||
            !newPrice.time
          )
            return;
          const { time, price, symbol } = newPrice;
          console.log(new Date(time).toISOString());
          await client.query(
            `insert into stocks_real_time(symbol, price, time)
        	values ('${symbol}', ${price}, '${new Date(time).toISOString()}')`
          );
        } catch (err) {
          console.log(err);
          console.log("something wrong in db");
        }
      },
    }),
  ]);
};




// client.query("LISTEN new_stock_data");
server.listen(8000, () => {
  console.log("listening on *:8000");
});
io.on("connection", (socket) => {
  console.log("a user connected id: ", socket.id);
});

kafkaData();
app.use("/:symbol", async (req, res) => {
  try {
    const { ohlc } = req.query;
    const queryRealTime = `select time, price from stocks_real_time where symbol = '${req.params.symbol.toUpperCase()}' order by time desc limit 20`
    if (ohlc && JSON.parse(ohlc)) {
      const MAX =12
      const timeNow = new Date()
      const upperTime = subMinutes(timeNow, timeNow.getMinutes()%5).valueOf()
      console.log(timeNow.getMinutes()%5)
      let lowerTime = subHours(timeNow, 1).valueOf()
      const queryOhlc = `select bucket AS time, open, high, low, close from ohlc where symbol = '${req.params.symbol.toUpperCase()}' and bucket >= '${new Date(lowerTime).toISOString()}' order by bucket desc limit ${MAX}`
      console.log(queryOhlc)
      const {rows} = await client.query(queryOhlc)
      console.log(rows)
      const lastTime = rows.at(-1)?.time? new Date(rows.at(-1).time).toISOString() : timeNow.toISOString()
      console.log(lastTime)
      const lastDataQuery = await client.query(`select bucket AS time, open, high, low, close from ohlc where symbol = '${req.params.symbol.toUpperCase()}' and bucket < '${lastTime}' order by bucket desc limit 1`)
      let lastQuery = lastDataQuery.rows.at(0)
      let idx = -1
      console.log(lastQuery.time)
      console.log(new Date(lowerTime))
      while (lowerTime<= upperTime) {
        console.log(idx)
        if (!rows.at(idx) || new Date(rows.at(idx).time).valueOf() > lowerTime) {
          console.log(lastQuery)
          const {close} = lastQuery
          const newData = {time: new Date(lowerTime), open: close, high: close, low: close, close: close}
          lastQuery =newData
          rows.push(newData)
        }
        else lastQuery = rows.at(idx)
        idx--
        lowerTime+= 5*60*1000
      }
      console.log(rows)
      return res.json({data: rows})
    }
    client.query(queryRealTime).then((rs) => {
      console.log(rs.rows);
      return res.status(200).json({ data: rs.rows });
    });
  } catch (err) {
    console.log(err);
    res.status(500).send();
  }
});
