<template>
  <div>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-desktop" :size="20" />
             TEST
          </p>
          <div style="height: 150px">
           <div class="file-upload">
              <input type="file" @change="onFileChange" />
              <!-- <div v-if="progress" class="progess-bar" :style="{'width': progress}">{{progress}}</div> -->
              <button @click="onUploadFile" class="upload-button" :disabled="!this.selectedFile">CLASSIFY</button>
            </div>
          </div>
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-desktop" :size="20" />
             CLIENT
          </p>
          <p>The image from client side</p>
          <img id="img1" style="width: 40%; height: auto;" :src="previewImg1" alt="">
        </Card>
      </i-col>
      <i-col :md="24" :lg="12" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-easel" :size="20"/>
            SERVER
          </p>
          <p>The image from Server side</p>
          <img id="img2" style="width: 40%; height: auto;" :src="previewImg2" alt="">
        </Card>
      </i-col>
    </Row>
    <Row :gutter="20" style="margin-top: 10px;" type="flex">
      <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
        <Card shadow>
          <p slot="title" class="card-title" >
            <Icon type="ios-desktop" :size="20" />
             TEST
          </p>
          <div>
            <Button id="btn_cat" type="dashed">Which Pet?</Button>
          </div>
        </Card>
      </i-col>
    </Row>
  </div>
</template>
<script>
import axios from "axios";
// import { dataRequest } from '../request/dataRequest'

export default {
  data() {
    return {
      selectedFile: "",
      previewImg1: '',
      previewImg2: '',
      url: '',
      serverUrl: '',
      imgInfo: '',
    };
  },
  methods: {
    onFileChange(e) {
      const selectedFile = e.target.files[0]; // accessing file
      this.selectedFile = selectedFile;
      this.url = URL.createObjectURL(selectedFile);
      this.previewImg1 = this.url;
      document.getElementById("img2").src='';
    },

    async readProcessInfo (info) {
      console.log("[INFO]The return value from the server: ", info)
      if (info.serverUrl) {
        this.previewImg2 = this.serverUrl;
      }
      if (info.imgInfo) {
        if (info.imgInfo.animal == 0)
        {
          document.getElementById('btn_cat').innerHTML = "This is a cat!!!"
          document.getElementById('btn_cat').style.backgroundColor = 'Green';  
        }
        else {
          document.getElementById('btn_cat').innerHTML = "This is a dog!!!"
          document.getElementById('btn_cat').style.backgroundColor = 'Red';  
        }
      }
    },

    async readImgInfo (info) {
      console.log("The return value from the server: ", info)
      if (info) {
        this.previewImg2 = info;
      }
    },
    
    async readInfo (info) {
      console.log("[INFO]raw data: ", info)
      console.log("[INFO]The return image url from the server: ", info.serverUrl)
      console.log("[INFO]The return processed DL info from the server: ", info.imgInfo)
      if (info.serverUrl) {
        this.previewImg2 = info.serverUrl;
        if (info.imgInfo) {
          if (info.imgInfo.animal == 0)
          {
            document.getElementById('btn_cat').innerHTML = "This is a cat!!!"
            document.getElementById('btn_cat').style.backgroundColor = 'Green';  
          }
          else {
            document.getElementById('btn_cat').innerHTML = "This is a dog!!!"
            document.getElementById('btn_cat').style.backgroundColor = 'Red';  
          }
        }
      }
    },

    onUploadFile() {
      const formData = new FormData();
      formData.append("file", this.selectedFile); // appending file
      axios
        .post("http://localhost:4000/uploadImg", formData,)
        .then(res => {
          // console.log("**************$$$$$$the Raw value return from server: ", res.data);
          this.readInfo(res.data);
          // this.readImgInfo(res.data);
          // this.readProcessInfo(res.data);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.file-upload {
  box-shadow: 2px 2px 2px 2px #ccc;
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
  box-shadow: 2px 2px 2px 2px #ccc;
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
