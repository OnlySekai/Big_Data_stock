import ApexCharts from 'apexcharts'

export default function (context, inject) {
  inject('createChart', (el, opts = {}) => new ApexCharts(el, opts))
}
