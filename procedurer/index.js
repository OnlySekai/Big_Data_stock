const {io} =require('socket.io-client')
const stock = io('wss://ws.twelvedata.com?apikey=adc2ab1f026042468564d91aa31dc1fd?symbol=AMZN').connect()
stock.on('price',(price)=> {
    console.log(price)
})
