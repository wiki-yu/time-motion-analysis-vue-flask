<template>
  <div>
    <Row :gutter="20">
      <i-col :xs="12" :md="8" :lg="6" v-for="(infor, i) in inforCardData" :key="`infor-${i}`" style="height: 120px;padding-bottom: 10px;">
        <infor-card shadow :color="infor.color" :icon="infor.icon" :icon-size="36">
          <count-to :end="infor.count" count-class="count-style"/>
          <p>{{ infor.title }}</p>
        </infor-card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;">
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <h3>Classification</h3>
          <reactive-bar-chart :chartData="barData" :options="barOptions"></reactive-bar-chart>
          <!--chart-bar style="height: 300px;" :value="barData" text="Classification Distribution"/-->
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <h3>Lean Classification</h3>
          <!--chart-pie style="height: 300px;" :value="pieData" text="Lean Classification"></chart-pie-->
          <reactive-pie-chart :chartData="pieData" :options="pieOptions"></reactive-pie-chart>
        </Card>
      </i-col>
    </Row>
    <Row>
      <Card shadow>
        <example style="height: 310px;"/>
      </Card>
    </Row>
  </div>
</template>

<script>
import InforCard from '_c/info-card'
import CountTo from '_c/count-to'
import reactivePieChart from '../../../components/charts/reactivePieChart'
import reactiveBarChart from '../../../components/charts/reactiveBarChart'
import Example from './example.vue'
import axios from 'axios'
export default {
  name: 'home',
  components: {
    InforCard,
    CountTo,
    Example,
    reactiveBarChart,
    reactivePieChart
  },
  data () {
    return {
      inforCardData: [{
        title: 'Workers',
        icon: 'md-person-add',
        count: 21,
        color: '#2d8cf0'
      },
      {
        title: 'Annotations',
        icon: 'md-locate',
        count: 232,
        color: '#19be6b'
      },
      {
        title: 'Total Time',
        icon: 'md-help-circle',
        count: 122,
        color: '#ff9900'
      },
      {
        title: 'Seconds per Task',
        icon: 'md-share',
        count: 7,
        color: '#ed3f14'
      }
      ],
      pieData: {
        labels: ['VA', 'NVA', 'RNVA'],
        datasets: [
          // {
          //   label: 'All Workers',
          //   backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
          //   data: [4, 5, 6]
          // },
          // {
          //   label: 'Worker 1',
          //   backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
          //   data: [5, 8, 9]
          // },
          // {
          //   label: 'Worker 2',
          //   backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
          //   data: [6, 9, 4]
          // }
        ]
      },
      barDatasets: [],
      pieDatasets: [],
      barData: {
        labels: [
          'Unit Pick-Up/Transfer',
          'Operation',
          'Material Setup/Handling',
          'Fixture Setup/Handling',
          'Inspection',
          'Tool Setup/Handling',
          'Operation Trash',
          'Scanning',
          'Cleaning'
        ],
        datasets: [
          // {
          //   label: 'All Workers',
          //   backgroundColor: '#a3c7c9',
          //   data: [3,6,4,5,6,2,6,7,4]
          // },
          // {
          //   label: 'Worker 1',
          //   backgroundColor: '#889d9e',
          //   data: [3.4,7,3,5.5,7,4,6,3,2]
          // },
          // {
          //   label: 'Worker 2',
          //   backgroundColor: '#647678',
          //   data: [3,2,5,6,4,5,3,5,2]
          // },
        ]
      },
      barLabels: [
        'Unit Pick-Up/Transfer',
        'Operation',
        'Material Setup/Handling',
        'Fixture Setup/Handling',
        'Inspection',
        'Tool Setup/Handling',
        'Operation Trash',
        'Scanning',
        'Cleaning'
      ],
      barOptions: {
        options: {
          scales: {
            yAxes: [{
              display: true,
              ticks: {
                suggestedMin: 0 // minimum will be 0, unless there is a lower value.
              }
            }]
          }
        }
      },
      pieOptions: {
        responsive: true,
        legend: {
          position: 'top'
        },
        animation: {
          animateScale: true,
          animateRotate: true
        },
        tooltips: {
          callbacks: {
            label: function (item, data) {
              console.log(data.labels, item)
              return data.datasets[item.datasetIndex].label + ': ' + data.labels[item.index] + ': ' + data.datasets[item.datasetIndex].data[item.index]
            }
          }
        }
      }
    }
  },
  mounted () {
    const getClassificationData = async () => {
      const baseURI = 'http://localhost:3000/classification-count?userid=3'
      try {
        const response = await axios.get(baseURI)
        var rows = response['data']['response']
        var dataset = []
        var workers = []
        var labels = this.barData.labels
        console.log(labels)
        console.log(rows)
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i]

          console.log(row['worker'])
          if (dataset.length <= 0) {
            dataset.push({
              label: 'All Workers',
              backgroundColor: '#647678',
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
            })
            dataset.push({
              label: row['worker'],
              backgroundColor: '#647678',
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
            })
            workers.push('All Workers')
            workers.push(row['worker'])
          } else if (!workers.includes(row['worker'])) {
            dataset.push({
              label: row['worker'],
              backgroundColor: '#647678',
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0]
            })
            workers.push(row['worker'])
          }

          var index = workers.indexOf(row['worker'])
          var group = String(row['classification'])
          console.log(group)
          console.log(labels)
          for (var j = 0; j < labels.length; j++) {
            if (group === String(labels[j])) {
              dataset[index].data[j] = row['time']
              dataset[0].data[j] += row['time']
            }
          }
        }

        var sumCount = 0
        var sum = 0
        for (var k = 0; k < labels.length; k++) {
          dataset[0].data[k] = dataset[0].data[k] / (workers.length - 1)
          sum += dataset[0].data[k]
          if (dataset[0].data[k] > 0) {
            sumCount += 1
          }
        }

        this.inforCardData[0].count = workers.length
        this.inforCardData[1].count = workers.length
        this.inforCardData[2].count = sum
        this.inforCardData[3].count = sum / sumCount
        this.barData.datasets = dataset
        console.log(this.barData)
      } catch (err) {
        console.error(err)
      }
    }

    const getLeanClassificationData = async () => {
      const baseURI = 'http://localhost:3000/lean-classification-count?userid=3'
      try {
        const response = await axios.get(baseURI)
        var rows = response['data']['response']
        var dataset = []
        var workers = []
        var labels = this.pieData.labels
        for (var i = 0; i < rows.length; i++) {
          var row = rows[i]

          if (dataset.length <= 0) {
            dataset.push({
              label: 'All Workers',
              backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
              data: [0, 0, 0]
            })
            dataset.push({
              label: row['worker'],
              backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
              data: [0, 0, 0]
            })
            workers.push('All Workers')
            workers.push(row['worker'])
          } else if (!workers.includes(row['worker'])) {
            dataset.push({
              label: row['worker'],
              backgroundColor: ['#a3c7c9', '#889d9e', '#647678'],
              data: [0, 0, 0]
            })
            workers.push(row['worker'])
          }

          var index = workers.indexOf(row['worker'])
          var group = String(row['leanClassification'])
          console.log(group)
          for (var j = 0; j < labels.length; j++) {
            if (group === String(labels[j])) {
              console.log(labels[j])
              dataset[index].data[j] = row['time']
              dataset[0].data[j] += row['time']
            }
          }

          for (var k = 0; k < labels.length; k++) {
            dataset[0].data[k] = dataset[0].data[k] / (workers.length - 1)
          }
        }

        this.pieData.datasets = dataset
        console.log(this.pieData)
      } catch (err) {
        console.error(err)
      }
    }

    console.log(this.barData)
    console.log(this.pieData)

    getClassificationData()
    getLeanClassificationData()
  },
  methods: {

  }
}
</script>

<style lang="less">
.count-style{
  font-size: 50px;
}
</style>
