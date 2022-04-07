<template>
  <div>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-cloud-upload-outline" :size="20" />
             UPLOAD IMAGE
          </p>
          <!-- <div style="height: 150px"> -->
          <div>
           <div class="file-upload">
              <input type="file" @change="onFileChangeImg" />
              <!-- <div v-if="progress" class="progess-bar" :style="{'width': progress}">{{progress}}</div> -->
              <button v-if="!detectImgLoading" @click="onUploadImage" class="upload-button" :disabled="!this.selectedImage">DETECT</button>
              <Button v-else type="primary" loading>Image Processing...</Button>
            </div>
          </div>
        </Card>
      </i-col>
    </Row>

    <div v-if="imgUploaded">
      <Row :gutter="20" style="margin-top: 10px;" type="flex">
          <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="ios-desktop-outline" :size="20" />
                CLIENT IMAGE
              </p>
              <img id="img1" style="width: 100%; height: auto;" :src="previewImg1" alt="">
            </Card>
          </i-col>
          <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
            <Card shadow>
              <p slot="title" class="card-title" >
                <Icon type="ios-easel-outline" :size="20"/>
                SERVER IMAGE
              </p>
              <img id="img2" style="width: 100%; height: auto;" :src="previewImg2" alt="">
            </Card>
          </i-col>
      </Row>
    </div>

    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-cloud-upload" :size="20" />
            UPLOAD VIDEO
          </p>
          <!-- <div style="height: 150px"> -->
          <div>
           <div class="file-upload">
              <input type="file" @change="onFileChangeVideo" />
              <!-- <div v-if="progress" class="progess-bar" :style="{'width': progress}">{{progress}}</div> -->
              <button v-if="!detectVideoLoading" @click="onUploadVideo" class="upload-button" :disabled="!this.selectedVideo">DETECT</button>
              <Button v-else type="primary" loading>Video Processing...</Button>
            </div>
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
              CLIENT VIDEO
            </p>
            <div v-if="hasVideo">
              <video-player class="vjs-custom-skin" ref="videoPlayer" :options="playerOptions1"></video-player>
            </div>
          </Card>
        </i-col>
        <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
          <Card shadow>
            <p slot="title" class="card-title" >
              <Icon type="md-desktop" size:="20"/>
              SERVER VIDEO
            </p>
            <div v-if="hasVideo">
              <video-player class="vjs-custom-skin" ref="videoPlayer" :options="playerOptions2"></video-player>
            </div>
          </Card>
        </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import 'video.js/dist/video-js.css'
import { videoPlayer } from 'vue-video-player'
import { dataRequest } from '../../request/dataRequest'
import axios from 'axios'
 
export default {
  components: {
    videoPlayer,
  },
  data() {
    return {
      videoUploaded: false,
      selectedImage: "",
      selectedVideo: "",
      previewImg1: '',
      previewImg2: '',
      url: '',
      serverUrl: '',
      imgInfo: '',
      detectImgLoading: false,
      detectVideoLoading: false,
      imgUploaded: false,
      videoUpload: false,
      serverRtn: false,
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
    // player () {
    //   return this.$refs.videoPlayer.player
    // },
    hasVideo() {
      return !!this.playerOptions1.sources[0].src;
    }
  },
  methods: {
    onFileChangeImg(e) {
      const selectedImage = e.target.files[0]; // accessing file
      this.selectedImage = selectedImage;
      this.url = URL.createObjectURL(selectedImage);
      this.previewImg1 = this.url;
      // document.getElementById("img2").src='';
    },
    onFileChangeVideo(e) {
      console.log("haaaaaaaaaaaaaaaaaaaaaa")
      const selectedVideo = e.target.files[0]; // accessing file
      this.selectedVideo = selectedVideo;
      this.url = URL.createObjectURL(selectedVideo);
      console.log("testurlhahahaha")
      console.log(this.url)
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
    
    onUploadImage() {
      this.imgUploaded = true
      const formData = new FormData();
      formData.append("file", this.selectedImage); // appending file
      this.detectImgLoading = true;
      axios
        .post("http://localhost:5500/imgDetect", formData,)
        .then(res => {
          console.log("Receiving data from server after uploading IMAGE! ");
          console.log(res)
          this.serverRtn = true
          this.showServerImage(res.data);
          this.detectImgLoading = false;
        })
        .catch(err => {
          console.log(err);
        });
    },
    b64toBlob (b64Data, contentType='', sliceSize=512) {
      const byteCharacters = atob(b64Data);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      const blob = new Blob(byteArrays, {type: contentType});
      return blob;
    },
    onUploadVideo () {
      this.videoUploaded = true
      const formData = new FormData()
      formData.append('file', this.selectedVideo) // appending file
      this.detectVideoLoading = true, 
      axios
        .post('http://localhost:5500/videoDetect', formData)
        .then(res => {
          console.log("Receiving data from server after uploading VIDEO! ");
          console.log(res.data)
          this.showServerVideo(res.data)
          this.detectVideoLoading = false
        })
        .catch(err => {
          console.log(err)
        })
      alert('Uploaded')
      // Ready to play the video after uploading
      console.log("Getting started to play video!")
      const source = URL.createObjectURL(this.selectedVideo)
      this.playerOptions1.sources[0].src = source
    },
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.file-upload {
  /* box-shadow: 2px 2px 2px 2px #ccc; */
  border-radius: 0rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 1rem;
  width: 100%;
  margin: 100 auto;
}
.col {
  /* box-shadow: 2px 2px 2px 2px #ccc; */
  border-radius: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 1rem;
  width: 100%;
  margin: 0 auto;
}
input {
  font-size: 0.9rem;
}
button {
  margin-top: 2rem;
}
.progess-bar {
  height: 1rem;
  width: 0%;
  background-color: #151618;
  color: rgb(109, 99, 99);
  padding: 2px;
  font-weight: bold;
}
.upload-button {
  width: 7rem;
  padding: 0.5rem;
  background-color: #278be9;
  color: #fff;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  border-radius: 1rem;
}
.upload-button:disabled {
  background-color: #b3bcc4;
  cursor: no-drop;
}
.control-label {
    display: flex;
}
.ivu-card {
  height: 100%;
}
</style>
