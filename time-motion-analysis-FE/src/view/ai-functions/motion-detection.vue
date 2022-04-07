<template>
  <div>
    <!-- <Card title="Insturction"> -->
    <Card shadow style="margin-top: 10px;">
      <p slot="title" class="card-title" >
        <Icon type="ios-cloud-upload-outline" :size="20" />
        Upload Video
      </p>
      <el-steps :active="active">
        <el-step title="Step1" icon="el-icon-upload" description="Upload Video"></el-step>
        <el-step title="Step2" icon="el-icon-s-promotion" description="Send Video"></el-step>
        <el-step title="Step3" icon="el-icon-success" description="Detect Video"></el-step>
      </el-steps>
    </Card>

    <Card shadow style="margin-top: 10px;">
      <p slot="title" class="card-title" >
        <Icon type="ios-cloud-upload-outline" :size="20" />
        Upload Video
      </p>

      <Row>
        <div class="btnWrap">
            <div>
              <Upload action="" :before-upload="handleBeforeUpload" accept=".avi, .mp4">
                <Button icon="ios-cloud-upload-outline" type="info" :loading="uploadLoading" @click="handleUploadFile">Upload File</Button>
              </Upload>
            </div>
            <div style="margin-left: 5px">
              <Button v-if="!videoProcessing" icon="ios-cloud-upload-outline" type="primary" @click="sendFile" :disabled="!this.file">Send file</Button>
              <Button v-else loading shape="circle" type="error" style="margin-left: 5px">Video Processing...</Button>
            </div>
        </div>
      </Row>

      <Row>
        <div class="ivu-upload-list-file" v-if="file !== null">
          <Icon type="ios-stats"></Icon>
            {{ file.name }}
          <Icon v-show="showRemoveFile" type="ios-close" class="ivu-upload-list-remove" @click.native="handleRemove()"></Icon>
        </div>
      </Row>
      <Row>
        <transition name="fade">
          <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
            <div v-if="progressPercent == 100">
              <Icon type="ios-checkmark-circle"></Icon>
              <span>OK!</span>
            </div>
          </Progress>
        </transition>
      </Row>
    </Card>

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
    <Row style="margin-top: 10px;">
      <Table :columns="tableTitle" :data="tableData" :loading="tableLoading"></Table>
    </Row>
    <!-- <img src="http://localhost:5000/motionDetection"/> -->
  </div>
</template>

<script>
import excel from '@/libs/excel'
import axios from 'axios'
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
import videoPoster from '@/assets/images/loading.gif'
export default {
   components: {
    videoPlayer,
  },
  data() {
    return {
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,

      tableData: [],
      tableTitle: [],
      tableLoading: false,

      active: 0,
      videoProcessing: false,

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
        poster: videoPoster,
        sources: [{
          type: 'video/mp4',
          src: '',
        }],
      }
    };
  },
  computed: {
    player () {
      return this.$refs.videoPlayer.player
    },
    hasVideo() {
      return !!this.playerOptions1.sources[0].src;
    }
  },

  methods: {
    initUpload () {
      this.file = null
      this.showProgress = false
      this.tableData = []
      this.tableTitle = []
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

    handleBeforeUpload (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      if (fileExt === 'mp4' || fileExt === 'avi') {
        this.file = file
        this.url = URL.createObjectURL(file);
        console.log("url", this.url)
        if (this.url !== null) {
          this.showProgress = true
          this.progressPercent = 100
          this.showRemoveFile = true
          // this.previewImg1 = this.url;
          // document.getElementById("myVideo2").src='';
          this.$Message.info('Read Video successfully!')
          this.active = 1
        }
     
      } else {
        this.$Notice.warning({
          title: 'Wrong file type!',
          desc: 'File：' + file.name + 'not jpg or png file'
        })
      }
      return false
    },

    sendFile () {
      console.log("start to send file!!!!!!!")
      const formData = new FormData()
      formData.append('file', this.file) // appending file
      // Ready to play the video after uploading
      this.videoUploaded = true
      var video = document.getElementById('myVideo1');
      const source = URL.createObjectURL(this.file)
      this.playerOptions1.sources[0].src = source
      this.active = 2
      this.videoProcessing = true
      console.log("start to send through axios!!!!!!!")
      axios
        .get('http://localhost:5000/motionDetection')
        .then(res => {
          console.log("Receiving data from server after uploading VIDEO! ");
          console.log(res.data)
          // this.playerOptions2.poster = '',
          // this.showServerVideo(res.data)
          // this.detectVideoLoading = false
          // this.active = 3
          // this.videoProcessing = false
        })
        .catch(err => {
          console.log('error', err)
        })
    },

    async showServerVideo (info) {
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
