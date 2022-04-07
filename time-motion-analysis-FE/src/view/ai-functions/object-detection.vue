<template>
  <div>
    <Tabs type="card" value="name1" @on-click="pickupTab">
      <TabPane label="Image" icon="ios-image" name="imgTab"></TabPane>
      <TabPane label="Video" icon="logo-youtube" name="vidTab"></TabPane>
    </Tabs>

    <Collapse v-model="valueCollap">
        <Panel name="1" v-if="imageTab">
            Image Detection Instruction
            <p slot="content">Upload the image using "Upload Image" button, then click the "Send image" button to send it for processing, the processed image will be returned
              under the tab "output image", waitting time normally is a few seconds.</p>
        </Panel>
        <Panel name="2" v-if="videoTab">
            Video Detection Instruction
            <p slot="content">Upload the video using "Upload Video" button,  then click the "Send video" button to upload the video for processing, the processed image will be returned
              under the tab "server image", waitting time depends on the size of the video.</p>
        </Panel>
    </Collapse>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow style="margin-top: 10px;" type="flex">
          <p slot="title" class="card-title" v-if="videoTab">
            <Icon type="ios-cloud-upload-outline" :size="20" />
            Upload Video
          </p>
          <p slot="title" class="card-title" v-if="imageTab">
            <Icon type="ios-cloud-upload" :size="20" />
            Upload Image
          </p>

          <div class="btnWrap">
              <div>
                <Upload action="" :before-upload="handleBeforeUploadVideo" accept=".avi, .mp4" v-if="videoTab">
                  <Button icon="ios-cloud-upload-outline" type="info" @click="handleUploadFile">Upload Video</Button>
                </Upload>
                <Upload action="" :before-upload="handleBeforeUploadImage" accept=".png, .jpg" v-if="imageTab">
                  <Button icon="ios-cloud-upload-outline" type="info" @click="handleUploadFile">Upload Image</Button>
                </Upload>
              </div>
              <div v-if="videoTab" style="margin-left: 5px">
                <Button v-if="!videoProcessing" icon="ios-cloud-upload-outline" type="primary" @click="sendVideo" :disabled="!this.file">Send Video</Button>
                <Button v-else loading shape="circle" type="error" style="margin-left: 5px">Video Processing...</Button>
              </div>
              <div v-if="imageTab" style="margin-left: 5px">
                <Button v-if="!imageProcessing" icon="ios-cloud-upload-outline" type="primary" @click="sendImage" :disabled="!this.file">Send Image</Button>
                <Button v-else loading shape="circle" type="error" style="margin-left: 5px">Image Processing...</Button>
              </div>
          </div>

          <div v-if="using">
              <div class="ivu-upload-list-file" v-if="file !== null">
                <Icon type="ios-stats"></Icon>
                  {{ file.name }}
                <Icon v-show="showRemoveFile" type="ios-close" class="ivu-upload-list-remove" @click.native="handleRemove()"></Icon>
              </div>
              <transition name="fade">
                <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
                  <div v-if="progressPercent == 100">
                    <Icon type="ios-checkmark-circle"></Icon>
                    <span>OK!</span>
                  </div>
                </Progress>
              </transition>
          </div>
        </Card>
      </i-col>
    </Row>

    <div v-if="videoUploaded">
      <Row :gutter="20" style="margin-top: 10px;" type="flex">
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
          <Card shadow>
            <p slot="title" class="card-title" >
              <Icon type="md-desktop" size:="20"/>
              Input Video
            </p>
            <div v-if="hasVideo">
              <video-player class="vjs-custom-skin" id= "myVideo1" ref="videoPlayer1" :options="playerOptions1"></video-player>
            </div>
          </Card>
        </i-col>
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
          <Card shadow>
            <p slot="title" class="card-title" >
              <Icon type="md-desktop" size:="20"/>
              Output Video
            </p>
            <div v-if="hasVideo">
              <video-player class="vjs-custom-skin" id= "myVideo2" ref="videoPlayer2" :options="playerOptions2"></video-player>
            </div>
          </Card>
        </i-col>
      </Row>
    </div>


    <div v-if="imgUploaded" >
      <Row :gutter="20" style="margin-top: 10px;" type="flex">
          <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="ios-desktop-outline" :size="20" />
                Input Image
              </p>
              <div>
                <img id="img1" style="width: 100%; height: auto;" :src="previewImg1" alt="">
              </div>
            </Card>
          </i-col>
          <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="ios-easel-outline" :size="20"/>
                Output Image
              </p>
              <div>
                <img id="img2" style="width: 100%; height: auto;" :src="previewImg2" alt="">
              </div>
            </Card>
          </i-col>
      </Row>
    </div>

  </div>
</template>

<script>
import excel from '@/libs/excel'
import axios from 'axios'
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
export default {
   components: {
    videoPlayer,
  },
  data() {
    return {
      valueCollap: '0',
      imageTab: true,
      videoTab: false, 

      imgUploaded: false, 
      detectImgLoading: false,
      imageProcessing: false,
      videoProcessing: false,
      using: false,

      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,

      tableData: [],
      tableTitle: [],
      tableLoading: false,

      previewImg1: '',
      previewImg2: '',
      url: '',
      serverUrl: '',

      selectedVideo: "",
      videoUploaded: false,
  
      detectVideoLoading: false,

      playerOptions1: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: [{
          type: 'video/mp4',
          src: '',
        }],
      },
      playerOptions2: {
        autoplay: false,
        controls: true,
        fluid: true,
        sources: [{
          type: 'video/mp4',
          src: '',
        }],
      }
    };
  },
  computed: {
    hasVideo() {
      return !!this.playerOptions1.sources[0].src;
    }
  },

  methods: {
    pickupTab (val) {
      if (val == "imgTab"){
        console.log("test111111111111")
        this.imageTab = true
        this.videoTab = false
        this.videoUploaded = false
        this.using = false
        this.file = null
      }
      else {
        console.log("test22222222222")
        this.imageTab = false
        this.videoTab = true
        this.imgUploaded = false
        this.using = false
        this.file = null
      }
    },

    initUpload () {
      this.file = null
      this.showProgress = false
    },
    handleUploadFile () {
      this.initUpload()
    },
    handleRemove () {
      this.initUpload()
      this.playerOptions1.sources[0].src = '',
      this.playerOptions2.sources[0].src = '',
      this.$Message.info('Uploaded file has been deleted!')
    },

    handleBeforeUploadVideo (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      this.using = true
      if (fileExt === 'mp4' || fileExt === 'avi') {
        this.file = file
        this.url = URL.createObjectURL(file);
        console.log("url", this.url)
        if (this.url !== null) {
          this.showProgress = true
          this.progressPercent = 100
          this.showRemoveFile = true
          this.$Message.info('Read Video successfully!')
        }
     
      } else {
        this.$Notice.warning({
          title: 'Wrong file type!',
          desc: 'File：' + file.name + 'not jpg or png file'
        })
      }
      return false
    },

    handleBeforeUploadImage (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      this.using = true
      if (fileExt === 'jpg' || fileExt === 'png') {
        this.file = file
        this.url = URL.createObjectURL(file);
        console.log("url", this.url)
        if (this.url !== null) {
          this.showProgress = true
          this.progressPercent = 100
          this.showRemoveFile = true
          this.$Message.info('Read Image successfully!')
        }
     
      } else {
        this.$Notice.warning({
          title: 'Wrong file type!',
          desc: 'File：' + file.name + 'not jpg or png file'
        })
      }
      return false
    },

    sendVideo () {
      console.log("start to send Video!!!!!!!")
      const formData = new FormData()
      formData.append('file', this.file) // appending file

      this.videoUploaded = true
      var video = document.getElementById('myVideo1');
      const source = URL.createObjectURL(this.file)
      this.playerOptions1.sources[0].src = source
      console.log("start to send through axios!!!!!!!")
      this.videoProcessing = true
      axios
        .post('http://localhost:5000/videoDetect', formData)
        .then(res => {
          console.log("Receiving data from server after uploading VIDEO! ");
          console.log(res.data)
          this.showServerVideo(res.data)
          this.videoProcessing = false
        })
        .catch(err => {
          console.log(err)
        })
    },

    sendImage () {
      console.log("start to send Image!!!!!!!")
      const formData = new FormData()
      formData.append('file', this.file) // appending file

      this.imgUploaded = true
      const source = URL.createObjectURL(this.file)
      this.previewImg1 = source;
      this.imageProcessing = true

      console.log("start to send through axios!!!!!!!")
      axios
        .post('http://localhost:5000/imgDetect', formData)
        .then(res => {
          console.log("Receiving data from server after uploading VIDEO! ");
          console.log(res.data)
          this.showServerImage(res.data);
          this.imageProcessing = false;
        })
        .catch(err => {
          console.log(err);
        });
    },

    async showServerImage (info) {
      console.log("The return Base64 image url from the server: ", info)
      if (info) {
        this.previewImg2 = info;
      }
    },

    async showServerVideo (info) {
      console.log("The return Base64 video url from the server: ", info)
      if (info) {
        this.playerOptions2.sources[0].src = info
      }
    },

  },
  created () {

  },
  mounted () {

  }
}
</script>

<style scoped>
.btnWrap {
  /* display: inline-block; */
  display: flex;
  justify-content: flex-start;
}
</style>
