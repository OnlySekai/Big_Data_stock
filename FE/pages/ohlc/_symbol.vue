<template>
  <div>
    <h1>{{ symbol }}</h1>
    <div ref="chart"></div>
  </div>
</template>

<script>
export default {
  async asyncData({ params }) {
    let { data } = await (
      await fetch(`http://172.16.10.100:31008/${params.symbol}?ohlc=true`)
    ).json()
    data = data.map((value) => {
      const { time, open, high, low, close } = value
      return [new Date(time).valueOf(), open, high, low, close]
    })
    console.log(data)
    const options = {
      chart: {
        type: 'candlestick',
      },
      series: [{data}],
    }
    return { data, options, symbol: params.symbol }
  },
  data() {
    return {}
  },
  mounted() {
    const chart = this.$createChart(this.$refs.chart, this.options)
    chart.render()
    this.interval = setInterval(async ()=> {
      let { data } = await (
      await fetch(`backend/${this.symbol}?ohlc=true`)
    ).json()
    data = data.map((value) => {
      const { time, open, high, low, close } = value
      return [new Date(time).valueOf(), open, high, low, close]
    })
    this.data = data
    this.options.series = [{data: this.data}]
    chart.updateOptions(this.options, false)
    }, 300000)
  },
  beforeDestroy() {
    clearInterval(this.interval)
  }
}
</script>

<style>
</style>