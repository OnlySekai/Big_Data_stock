<template>
  <div id="chartComponent">
    <h1 id="symbol">{{ symbol }}</h1>
    <div ref="chart"></div>
  </div>
</template>

<script>
export default {
  async asyncData({ params, $http }) {
    const time = []
    const prices = []
    try {
      const { data } = await (
        await fetch(`http://172.16.10.100:31008/${params.symbol}?ohlc=false`)
      ).json()
      console.log({data})
      data.forEach((value) => {
        prices.push(value.price)
        time.push(new Date(value.time).toTimeString().split(' ')[0].toString())
      })
    } catch (err) {
      console.log(err)
    }
    console.log(time, prices)
    const options = {
      chart: {
        type: 'line',
      },
      series: [
        {
          name: 'sales',
          data: prices,
        },
      ],
      xaxis: {
        categories: time,
      },
    }
    return { options, time, prices }
  },
  data() {
    return {
      symbol: String(this.$route.params.symbol).toUpperCase(),
    }
  },
  mounted() {
    const chart = this.$createChart(this.$refs.chart, this.options)
    chart.render()
    this.$socket.on('connect', (socket) => {
      console.log(socket)
    })
    this.$socket.on('newPrice', (values) => {
      console.log(values)
      const data = values.symbol === this.symbol? [values]:[]
      console.log('newdata')
      data.forEach((value) => {
        this.prices.push(value.price)
        this.time.push(
          new Date(value.time).toTimeString().split(' ')[0].toString()
        )
        this.prices.shift()
        this.time.shift()
      })
      if (data.length) chart.updateOptions(this.options, false)
    })
    this.$socket.on('disconnect', () => this.$socket.disconnect())
  },
  beforeDestroy() {
    this.$socket.disconnect()
  },
}
</script>

<style>

</style>