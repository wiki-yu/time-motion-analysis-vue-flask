<template>
  <div>
    <Card title="Upload Data">
      <Row>
        <Upload type="drag" action="" :before-upload="handleBeforeUpload" accept="">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="52" style="color: #3399ff" :loading="uploadLoading" @click="handleUploadFile"></Icon>
                <p>Click or drag videos here to upload</p>
            </div>
        </Upload>
      </Row>

      <Row>
        <div class="ivu-upload-list-file" v-if="file !== null">
          <Icon type="md-barcode"></Icon>
            {{ file.name }}
          <Icon v-show="showRemoveFile" type="ios-close" class="ivu-upload-list-remove" @click.native="handleRemove()"></Icon>
        </div>
      </Row>
      <Row>
        <transition name="fade">
          <Progress v-if="showProgress" :percent="progressPercent" :stroke-width="2">
            <div v-if="progressPercent == 100">
              <Icon type="ios-checkmark-circle"></Icon>
              <span>OK</span>
            </div>
          </Progress>
        </transition>
        <Button type="primary" @click="onUploadFile" class="upload-button" :disabled="!this.file">Send  file</Button>
      </Row>
    </Card>
    <Card title="Video" style="margin-top: 10px;">  
        <Row :gutter="20" style="margin-top: 10px;" type="flex">
          <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
            <div class="videoShow">
                  <p>Current Type: <span class="badge badge-success">mp4</span></p>
                  <video id="myVideo" width="100%"></video>
            </div>
          </i-col>
        </Row>
      </Card>
  </div>
</template>

<script>
import excel from '@/libs/excel'
import axios from 'axios'
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
export default {
  name: 'upload-excel',
  data () {
    return {
      showVideo: false,
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
    }
  },

  computed: {
  },

  methods: {
    initUpload () {
      this.file = null
      this.showProgress = false
      this.loadingProgress = 0
    },
    handleUploadFile () {
      this.initUpload()
    },
    handleRemove () {
      this.initUpload()
      this.$Message.info('Uploaded file has been removed！')
    },
    handleBeforeUpload (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      if (fileExt === 'mp4' || fileExt === 'webm') {
        console.log("start to read file!!!")
        this.uploadLoading = false
        this.showRemoveFile = true
        this.file = file
      } else {
        this.$Notice.warning({
          title: 'Incorrect file type!',
          desc: 'File：'+ file.name+'is not the supported video type!'
        })
      }
      return false
    },

    onUploadFile () {
      const formData = new FormData()
      formData.append('file', this.file) // appending file
      // Ready to play the video after uploading
      var video = document.getElementById('myVideo');
      const source = URL.createObjectURL(this.file)
      video.src = source
      console.log("video.src: ", video.src)
      // this.$refs.video.src = source
      // sending file to backend
      axios
        .post('http://localhost:4000/uploadVideo', formData)
        .then(res => {
          console.log("res.status:..........", res.status)
          if (res.status === 200){
            this.$Message.info('File has been uploaded!')
          } else {
              this.$Message.info('File failed to upload!')
          }
        })
        .catch(err => {
          console.log(err)
        })
    },

    formData(time){
      var h = time.split(":")[0];
      var m = time.split(":")[1];
      var s = time.split(":")[2];
      var ms = time.split(".")[1];
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + "." + ms;
    }

  },
  created() {
    this.$nextTick(() => {
      var vedio = document.getElementById("myVideo");
      var that = this;
      vedio.oncanplay = function() {
        that.Event.$emit("allTime", vedio.duration);
        console.log(vedio.duration);
      };
    });
    this.Event.$on("paly", data => {
      var vedio = document.getElementById("myVideo");
      if (data) {
        vedio.play(); 
      } else {
        vedio.pause(); 
      }
    });
    this.Event.$on("currentTime", time => {
      var x = document.getElementById("myVideo");
      x.currentTime = String(this.formData(time))
    });
    // 分段播放
    this.Event.$on("subSectionPlay", value => {
      var x = document.getElementById("myVideo");
      x.currentTime = String(this.formData(value.startTime))
    });
  },
  mounted(){
  },
};
</script>

<style scoped>
.videoShow {
    position: relative;
}
</style>


