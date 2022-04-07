<template>
  <div>
    <Tabs type="card" value="name1" @on-click="pickupTab">
        <TabPane label="Train" icon="ios-list-box" name="train"></TabPane>
        <TabPane label="Code" icon="md-cloud-upload" name="data"></TabPane>
    </Tabs>
    <div class="menuBox" v-if="trainDropdown">
      <Dropdown @on-click="handleClick">
          <Button type="primary">
              Training Page
              <Icon type="ios-arrow-down"></Icon>
          </Button>
          <DropdownMenu slot="list">
              <DropdownItem name="goJupyter">Jupyter Notebook</DropdownItem>
              <DropdownItem name="goHaihub">HaiHub</DropdownItem>
          </DropdownMenu>
      </Dropdown>
      <p style="padding-top: 5px">Select your training page: Jupter notebook or Haihub</p>
    </div>
    <div v-if="dataDrop">
        <Row>
          <Upload type="drag" action="" :before-upload="handleBeforeUpload" accept="">
            <div style="padding: 20px 0">
                <Icon type="ios-cloud-upload" size="50" style="color: #3399ff" :loading="uploadLoading" @click="handleUploadFile"></Icon>
                <p>Click or drag code here to jupyter notebook</p>
            </div>
          </Upload>
        </Row>
    </div>
    <div style="padding-top: 15px">
      <div v-if="selectJupter">
        <iframe src="http://localhost:8888/tree"  width="100%" height="1000" frameborder="0" style="position:relative;" ></iframe>
      </div>
      <!-- <div v-if="selectHaihub"> -->
        <!-- <iframe src="https://10.20.216.166:30000"  width="100%" height="1000" frameborder="0" style="position:relative;" ></iframe> -->
      <!-- </div> -->
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data(){
      return {
        selectJupter: true,
        selectHaihub: false,
        trainDropdown: true,
        dataDrop: false,
        uploadLoading: false,
        showRemoveFile: false,
        file: null,
      }
  },
  methods:{   
    handleClick (val) {
      console.log(val)
      if (val == "goJupyter"){
        this.selectJupter= true
        this.selectHaihub= false
      }
      else {
        this.selectHaihub = true
        this.selectJupter= false
        window.open("https://10.20.216.186:30000", "_blank"); 
      }
    },
    pickupTab (val) {
      if (val == "train"){
        console.log("pick up train tab")
        this.trainDropdown = true
        this.dataDrop = false
      }
      else {
        console.log("pick up upload code tab")
        this.dataDrop = true
        this.trainDropdown = false
      }
    },
    initUpload () {
      this.file = null
      this.showProgress = false
      this.loadingProgress = 0
      this.tableData = []
      this.tableTitle = []
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
      if (fileExt === 'py' || fileExt === 'ipynb') {
        this.file = file
        this.onUploadFile()
      } else {
        // this.$Message.info('Uploaded file type incorrect!')
        this.$Notice.warning({
          title: 'Incorrect file type!',
          desc: 'File：'+ file.name+'is not the supported ipynb type!'
        })
      }
      return false
    },

    onUploadFile () {
      const formData = new FormData()
      formData.append('file', this.file) // appending file
      // sending file to backend
      axios
        .post('http://localhost:4000/uploadVideo', formData)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
      this.$Message.info('Code uploaded to Jupyter notebook!')
    },
  }
}
</script>

<style scoped>
.menuBox {
  background-color: #FFFFFF;
  /* box-shadow: 2px 2px 2px 2px #ccc; */
  border-radius: 0rem;
  border-style:dashed;
  border-width:1px;
  border-color: #dbd9d9;
  padding: 1.6rem;
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
</style>


