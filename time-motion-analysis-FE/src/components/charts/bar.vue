<template>
  <div ref="dom" class="charts chart-bar"></div>
</template>

<script>
import echarts from 'echarts'
import tdTheme from './theme.json'
import { on, off } from '@/libs/tools'
echarts.registerTheme('tdTheme', tdTheme)
export default {
  name: 'ChartBar',
  props: {
    value: Object,
    text: String,
    subtext: String
  },
  data () {
    return {
      dom: null
    }
  },
  methods: {
    resize () {
      if (this.dom) {
        this.dom.resize()
      }
    }
  },
  mounted () {
    this.renderChart();
    on(window, 'resize', this.resize);
  },
  beforeDestroy () {
    off(window, 'resize', this.resize)
  },
  methods:{
    renderChart(){
      this.$nextTick(() => {
        let xAxisData = Object.keys(this.value)
        let seriesData = Object.values(this.value)
        let option = {
          title: {
            text: this.text,
            subtext: this.subtext,
            x: 'center'
          },
          xAxis: {
            type: 'category',
            data: xAxisData
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: seriesData,
            type: 'bar'
          }]
        }
        this.dom = echarts.init(this.$refs.dom, 'tdTheme')
        this.dom.setOption(option) //only triger here it will change
      })
    }
  },
  watch: {
    value: {
      // This will let Vue know to look inside the array
      deep: true,

      // We have to move our method to a handler field
      handler() {
        console.log('change')
        this.renderChart()
      }
    },
  }
}
</script>
