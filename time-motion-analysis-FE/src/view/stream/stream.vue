<template>
  <div>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
        <div class="add-cam" v-if="!pressAddCamBtn">
          <Button type="info" shape="circle" icon="ios-add-circle-outline" @click="getCamInput"></Button>
          <p class="item">Add an IP Camera</p>
        </div>
        <div class="cam-form" v-if="pressAddCamBtn">
          <Form ref="formInline" :model="formInline" :rules="ruleInline" inline>
            <FormItem prop="user">
                <Input type="text" v-model="formInline.user" placeholder="Camera IP">
                    <Icon type="md-camera" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem prop="password">
                <Input type="text" v-model="formInline.password" placeholder="Port">
                    <Icon type="md-arrow-dropright-circle" slot="prepend"></Icon>
                </Input>
            </FormItem>
            <FormItem>
                <Button type="primary" @click="handleSubmit('formInline')">Signin</Button>
                <Button @click="goBackAddIp" style="margin-left: 8px">Reset</Button>
            </FormItem>
          </Form>
        </div>
        </Card>
      </i-col>
    </Row>
    <div v-if="camAdded">
      <Row :gutter="20" style="margin-top: 10px;" type="flex">
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="md-desktop" size:="20"/>
                IP Camera
              </p>
              <div>
                <video-player class="vjs-custom-skin" ref="videoPlayer" :options="playerOptions"
                @loadeddata="onPlayerLoadeddata()"></video-player>
              </div>
            </Card>
        </i-col>
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="md-desktop" size:="20"/>
                Frame Canvas
              </p>
              <div>
                <canvas id="myCanvas" ref="myCanvas" style="width: 100%" @mousedown="mousedown" @mouseup="mouseup" @mousemove="mousemove"></canvas>
              </div>
            </Card>
        </i-col>
      </Row>

      <Card shadow>
        <Row :gutter="20" style="margin-top: 10px;" type="flex">
          <i-col :md="24" :lg="24" style="margin-bottom: 20px; display: inline-block;">
            <div class="btnGrp" style="margin-top: 20px;">
              <Button type="primary" size="large" icon="ios-power" @click="startStudy">Start</Button>
              <ButtonGroup size="large" style="margin-left: 8px">
                  <Button type="primary" icon="md-arrow-back" @click="previousSec">-1s</Button>
                  <Button type="primary" icon="ios-skip-backward" @click="previousFrame">last frame</Button>
                  <!-- <Button type="primary" icon="md-arrow-dropright-circle" @click="getVideoPic"></Button> -->
                  <Button type="primary" icon="ios-skip-forward" @click="nextFrame">next frame</Button>
                  <Button type="primary" icon="md-arrow-forward" @click="nextSec">+1s</Button>
              </ButtonGroup>
              <ButtonGroup size="large" style="margin-left: 8px">
                  <Button icon="ios-color-wand-outline"></Button>
                  <Button icon="ios-sunny-outline"></Button>
                  <Button icon="ios-crop"></Button>
                  <Button icon="ios-color-filter-outline"></Button>
              </ButtonGroup>
            </div>
          </i-col>
        </Row>
        <div>
          <Row :gutter="20" style="margin-top: 10px;" type="flex">
            <i-col :md="4" :lg="2" style="margin-bottom: 20px; display: inline-block;">
              <el-button round>Start Time</el-button>
            </i-col>
            <i-col :md="20" :lg="22" style="margin-bottom: 20px; display: inline-block;">
              <el-slider v-model="sliderValStart" @input="SliderInput1" show-input :max="sliderMax" :step="sliderStep"></el-slider > 
            </i-col>
          </Row>
          <Row :gutter="20" style="margin-top: 10px;" type="flex">
            <i-col :md="4" :lg="2" style="margin-bottom: 20px; display: inline-block;">
                <el-button round>End Time</el-button>
            </i-col>
            <i-col :md="20" :lg="22" style="margin-bottom: 20px; display: inline-block;">
              <el-slider  v-model="sliderValEnd" @input="SliderInput2" show-input :max="sliderMax" :step="sliderStep"></el-slider > 
            </i-col>
          </Row>
        </div>
      </Card>
    
      <Row :gutter="20" style="margin-top: 10px;" type="flex">
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
          <Card shadow>
            <p slot="title" class="card-title" >
              <Icon type="ios-settings" :size="20" />
              ANNOTATION
            </p>
            <div>
              <b-form @submit="onSubmit" @reset="onReset" v-if="show">
                <b-form-group id="input-group-1" label="Start Time:" label-for="input-1">
                  <b-form-input
                    id="input-1"
                    v-model="form.start"
                    required
                    placeholder="Enter start time"
                  ></b-form-input>
                </b-form-group>

                <b-form-group id="input-group-2" label="End Time:" label-for="input-2">
                  <b-form-input
                    id="input-2"
                    v-model="form.end"
                    required
                    placeholder="Enter end time"
                  ></b-form-input>
                </b-form-group>

                <b-form-group id="input-group-3" label="Coordinates:" label-for="input-3">
                  <b-form-input
                    id="input-3"
                    v-model="form.coord"
                    required
                    placeholder="Coorinates"
                  ></b-form-input>
                </b-form-group>

                <b-form-group id="input-group-4" label="Label:" label-for="input-4">
                  <b-form-input
                    id="input-4"
                    v-model="form.label"
                    required
                    placeholder="Enter the label"
                  ></b-form-input>
                </b-form-group>

                <b-button type="submit" variant="primary">Add</b-button>
                <b-button type="reset" variant="danger">Reset</b-button>
              </b-form>
            </div>
          </Card>
        </i-col>
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
          <Card shadow>
            <p slot="title" class="card-title" >
              <Icon type="android-wifi"></Icon>
              ANNOTATION TABLE
            </p>
            <div>
              <!-- <b-table v-if="showTable" striped hover :items="items" sticky-header="100%"></b-table> -->
              <Table v-if="showTable" :columns="Tablecolumns" :data="tableData" :loading="tableLoading"></Table>
            </div>
            <Button icon="md-download" :loading="exportLoading" @click="exportExcel" style="margin-top: 10px;">Export File</Button>
          </Card>
        </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
import excel from '@/libs/excel'

export default {
  components: {
    videoPlayer,
  },
  data () {
    return {
      pressAddCamBtn: false,
      camAdded: false,
      tableLoading: false, 

      formInline: {
        user: '',
        password: ''
      },

      ruleInline: {
          user: [
              { required: true, message: 'Please fill in the Camera IP', trigger: 'blur' }
          ],
          password: [
              { required: true, message: 'Please fill in the Port Number.', trigger: 'blur' },
          ]
      },

      Tablecolumns: [
        {
          title: 'Start Time',
          key: 'Start',
        },
        {
          title: 'End Time',
          key: 'End'
        },
        {
          title: 'Coordinates',
          key: 'Coord'
        },
        {
          title: 'Label',
          key: 'Label'
        },
        {
          title: 'Action',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
              return h('div', [
                  h('Button', {
                      props: {
                          type: 'primary',
                          size: 'small'
                      },
                      style: {
                          marginRight: '5px'
                      },
                      on: {
                          click: () => {
                              this.viewItem(params.index)
                          }
                      }
                  }, 'View'),
                  h('Button', {
                      props: {
                          type: 'error',
                          size: 'small'
                      },
                      on: {
                          click: () => {
                              this.remove(params.index)
                          }
                      }
                  }, 'Delete')
              ]);
          }
        }
      ],

      playerOptions: {
      autoplay: false,
      controls: true,
      fluid: true,
      sources: [{
        type: 'video/mp4',
        src: require('../../assets/videoCut/demo.mp4')
        }],
      },
      sliderMax: 100,
      sliderStep: 1,
      url: '',
      previewImg: '',
      dataurl: '',
      exportLoading: false,
      items: [],
      tableData: [],
      col1: [],
      col2: [],
      col3: [],
      col4: [],
      showTable: true,
      form: {
        start: '',
        end: '',
        coord: '',
        label: ''
      },
      sliderValStart: 0, // the slider
      sliderValEnd: 0,
      show: true,
      flag: false,
      x: 0,
      y: 0,
      x_leftUpper: 0,
      y_leftUpper: 0,
      x_lowerRight: 0,
      y_lowerRight: 0,
    }
  },

  created: function () {
    console.log("stream page created &&&&&&&&&&&&")
    this.setSliderStep((1 / 30).toFixed(2))
  },

  computed: {
    player () {
      return this.$refs.videoPlayer.player
    },
  },

  methods: {
    getCamInput () {
      this.pressAddCamBtn = true
    },

    goBackAddIp () {
      this.pressAddCamBtn = false
      this.camAdded = false
    },

    startStudy () {
      console.log("&&&&&&&&&&&&")
      this.player.currentTime(this.sliderValStart)
      this.getVideoPic() 
    },

    handleSubmit(name) {
      this.camAdded = true;
      this.$refs[name].validate((valid) => {
        if (valid) {
            this.$Message.success('Success!');
        } else {
            this.$Message.error('Fail!');
        }
      })
    },

    getVideoPic () {
      let video = document.getElementsByClassName('vjs-tech')[0]
      var canvas = document.getElementById('myCanvas')
  
      let w = video.videoWidth
      let h = video.videoHeight
      canvas.width = w
      canvas.height = h

      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0, w, h)
  
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 8
      ctx.strokeRect(this.x_leftUpper, this.y_leftUpper, this.x_lowerRight, this.y_lowerRight)
    },

    drawRect (e) {
      if (this.flag) {
        console.log('Drawing!!')
        const canvas = this.$refs.myCanvas
        let video = document.getElementsByClassName('vjs-tech')[0]
        var ctx = canvas.getContext('2d')

        let x = this.x
        let y = this.y
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        console.log("canvas width, height: ", canvas.width, canvas.height)
        console.log("client width, height: ", canvas.clientWidth, canvas.clientHeight)

        let widthRatio = canvas.width / canvas.clientWidth
        let heightRatio = canvas.height / canvas.clientHeight
        console.log("widhtRatio, heightRatio: ", widthRatio, heightRatio)

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        ctx.beginPath()
        ctx.strokeStyle = '#00ff00' // set up the rectangle line color
        ctx.lineWidth = 8 // set up the rectangle line width
        
        let x1 = x * widthRatio
        let y1 = y * heightRatio
        let x2 = e.offsetX * widthRatio
        let y2 = e.offsetY * heightRatio
        // ctx.strokeRect(x, y, e.offsetX - x, e.offsetY - y)
        ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

        this.x_leftUpper = x1.toFixed()
        this.y_leftUpper = y1.toFixed()
        this.x_lowerRight = (x2 - x1).toFixed()
        this.y_lowerRight = (y2 - y1).toFixed()
        let coordinates = this.x_leftUpper.toString() + ' ' + this.y_leftUpper.toString() + ' ; ' + this.x_lowerRight.toString() + ' ' + this.y_lowerRight.toString() + ';' 
        console.log("coordnates!!!!", this.x_leftUpper, this.y_leftUpper, this.x_lowerRight, this.y_lowerRight)
        this.form.coord = coordinates
      }
    },

    mousedown (e) {
      console.log('mouse down')
      this.flag = true
      this.x = e.offsetX // the X coordinate when mouse down
      this.y = e.offsetY // the Y coordinate when mouse down
      // console.log("canvas width, height <<<<<<<<: ", canvas.width, canvas.height)
      // console.log("Client width height ", canvas.clientWidth, canvas.clientHeight)
      // console.log("mouse position <<<<<<<< x, y: ", this.x, this.y)
    },

    mouseup (e) {
      // console.log('mouse up')
      this.flag = false
      // console.log("mouse up x, y: ", this.x, this.y)
    },

    mousemove (e) {
      this.drawRect(e)
    },

    previousFrame () {
      const currentTime = this.player.currentTime()
      this.player.currentTime(currentTime - 1 / 30)
      this.player.pause()
      this.getVideoPic()
    },

    nextFrame () {
      const currentTime = this.player.currentTime()
      this.player.currentTime(currentTime + 1 / 30)
      this.player.pause()
      this.getVideoPic()
    },

    previousSec () {
      const currentTime = this.player.currentTime()
      this.player.currentTime(currentTime - 1)
      this.player.pause()
      this.getVideoPic()
    },

    nextSec () {
      const currentTime = this.player.currentTime()
      this.player.currentTime(currentTime + 1)
      this.player.pause()
      this.getVideoPic()
    },

    SliderInput1 () {
      console.log(this.sliderValStart)
      this.player.currentTime(this.sliderValStart)
      this.getVideoPic() 
      this.form.start = this.sliderValStart
    },

    SliderInput2 () {
      console.log(this.sliderValEnd)
      this.player.currentTime(this.sliderValEnd)
      this.getVideoPic() 
      this.form.end = this.sliderValEnd
    },

    onSubmit (evt) {
      evt.preventDefault()
      // alert(JSON.stringify(this.form))
      // const resp = await dataRequest();
      this.col1 = this.form.start
      this.col2 = this.form.end
      this.col3 = this.form.coord
      this.col4 = this.form.label
      this.fillTable()
    },

    onReset (evt) {
      evt.preventDefault()
      // Reset our form values
      this.form.start = ''
      this.form.end = ''
      this.form.coord = ''
      this.form.label = ''
      // Trick to reset/clear native browser form validation state
      this.show = false
      this.$nextTick(() => {
        this.show = true
      })
    },

    onPlayerLoadeddata (e) {
      this.setSliderMax(this.player.duration())
    },
    
    setSliderMax (max) {
      this.sliderMax = max
    },

    setSliderStep (step) {
      if (!step) {
        return
      }
      this.sliderStep = Number(step)
    },

    fillTable: function () {
      // this.items = [];
      // this.items.push({ Start: this.col1, End: this.col2, Coord: this.col3, Lable: this.col4 })
      this.tableData.push({Start: this.col1, End: this.col2, Coord: this.col3, Label: this.col4})
    },

    viewItem (index) {
      this.$Modal.info({
          title: 'Annotation Info',
          content: `Start: ${this.tableData[index].Start}<br>End：${this.tableData[index].End}<br>Coord：${this.tableData[index].Coord}`
      })
    },
    remove (index) {
      this.tableData.splice(index, 1);
    },


    exportExcel () {
      if (this.tableData.length) {
        this.exportLoading = true
        const params = {
          title: ['Start Time', 'End Time', 'Coordinates', 'Label'],
          key: ['Start', 'End', 'Coord', 'Label'],
          data: this.tableData,
          autoWidth: true,
          filename: 'Annotation Table'
        }
        excel.export_array_to_excel(params)
        this.exportLoading = false
      } else {
        this.$Message.info('Excel table cannot be empty!')
      }
    }

  },
}
</script>

<style scoped>
.add-cam {
  /* box-shadow: 2px 2px 4px 2px #ccc; */
  border-radius: 0rem;
  padding: 2rem;
  display: flex;
  justify-content: center;
  font-size: 1rem;
  width: 100%;
  margin: 100 auto;
  flex-direction: column;/*容器内项目的排列方向(默认横向排列 row)*/
  flex-wrap: nowrap;/*容器内项目换行方式*/
  justify-content: center;/*项目在主轴上的对齐方式*/
  align-items: center;/*项目在交叉轴上如何对齐*/
  align-content: center;
}

.cam-form {
  /* box-shadow: 2px 2px 4px 2px #ccc; */
  border-radius: 0rem;
  padding: 2rem;
  display: flex;
  justify-content: center;
  font-size: 1rem;
  width: 100%;
  margin: 100 auto;
  flex-direction: column;/*容器内项目的排列方向(默认横向排列 row)*/
  flex-wrap: nowrap;/*容器内项目换行方式*/
  justify-content: center;/*项目在主轴上的对齐方式*/
  align-items: center;/*项目在交叉轴上如何对齐*/
  align-content: center;
}

.btnGrp {
  display: block;
  width: 100%;
  clear: both;
  margin: 0 auto;
}

.item{
  /* width: 80px;
  height: 50px; */
  margin: 5px;
}

.ivu-card {
  height: 100%;
}
</style>
