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
    const { data } = await (
      await fetch(`http://localhost:8000/${params.symbol}?ohlc=false`)
    ).json()
    data.forEach((value) => {
      prices.push(value.price)
      time.push(new Date(value.time).toTimeString().split(' ')[0].toString())
    })
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
      console.log(socket.id)
    })
    this.$socket.on('newPrice', (values) => {
      const data = values.filter((value) => value.symbol === this.symbol)
      console.log('newdata')
      data.forEach((value) => {
        this.prices.push(value.price)
        this.time.push(
          new Date(value.time).toTimeString().split(' ')[0].toString()
        )
        this.prices.shift()
        this.time.shift()
      })
    // if (data.length) chart.updateOptions(this.options, false)
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