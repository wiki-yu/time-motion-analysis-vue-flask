<style lang="less">
  @import "./common.less";
</style>
<template>
  <div>
    <Card title="Upload Data">
      <Row>
        <Upload action="" :before-upload="handleBeforeUpload" accept="">
          <Button icon="ios-cloud-upload-outline" :loading="uploadLoading" @click="handleUploadFile">Upload File</Button>
        </Upload>
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
              <span>OK</span>
            </div>
          </Progress>
        </transition>
        <Button type="primary" @click="onUploadFile" class="upload-button" :disabled="!this.file">Sent  file</Button>
      </Row>
    </Card>
    <Row class="margin-top-10">
      <Table :columns="tableTitle" :data="tableData" :loading="tableLoading"></Table>
    </Row>
  </div>
</template>

<script>
import excel from '@/libs/excel'
import axios from 'axios'
export default {
  name: 'upload-excel',
  data () {
    return {
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      tableData: [],
      tableTitle: [],
      tableLoading: false
    }
  },
  methods: {
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
      if (fileExt === 'mp4' || fileExt === 'webm') {
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
      // sending file to backend
      axios
        .post('http://localhost:4000/uploadVideo', formData)
        .then(res => {
          console.log(res)
        })
        .catch(err => {
          console.log(err)
        })
      alert('Uploaded')
    },
    // 读取文件
    readFile (file) {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadstart = e => {
        this.uploadLoading = true
        this.tableLoading = true
        this.showProgress = true
      }
      reader.onprogress = e => {
        this.progressPercent = Math.round(e.loaded / e.total * 100)
      }
      reader.onerror = e => {
        this.$Message.error('文件读取出错')
      }
      reader.onload = e => {
        this.$Message.info('文件读取成功')
        const data = e.target.result
        const { header, results } = excel.read(data, 'array')
        const tableTitle = header.map(item => { return { title: item, key: item } })
        this.tableData = results
        this.tableTitle = tableTitle
        this.uploadLoading = false
        this.tableLoading = false
        this.showRemoveFile = true
      }
    }
  },
  created () {

  },
  mounted () {

  }
}
</script>
