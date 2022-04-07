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
        <!-- <Button type="primary" @click="onUploadFile" class="upload-button" :disabled="!this.file">Send  file</Button> -->
      </Row>
    </Card>
    <Card title="Video" style="margin-top: 10px;">  
        <Row :gutter="20" style="margin-top: 10px;" type="flex">
          <i-col :md="24" :lg="24" style="margin-bottom: 20px;">
            <div class="videoShow">
                  <p>Current Type: <span class="badge badge-success">mp4</span></p>
                  <video id="myVideo" ref="myVideo" width=100% style="display: none"></video>
                  <canvas id="myCanvas" ref="myCanvas" style="width: 100%" @mousemove="canvasHover" @mousedown="canvasDown" @mouseup="canvasUp"> </canvas>
            </div>
          </i-col>
        </Row>
      </Card>
    <footer>
      <div class="menu">
        <div class="videoContorl">
          <div class="timeLong">
            <em>Duration: </em>
            <span>{{videoLongTime}}</span>
          </div>
          <i class="iconfont icon-kuaijin-1" @click="prevPage"></i>
          <i class="iconfont icon-bofang" @click="play" v-if="bofangFlag"></i>
          <i class="icon-bofang1 iconfont" @click="stop" v-else></i>
          <i class="iconfont icon-kuaijin-" @click="nextpage"></i>
        </div>
      </div>
      <!-- Bottom level: display -->
      <div class="controlLine">
        <!-- 刻度 display -->
        <div class="dyc" id="pickeddeng">
          <div class="canFa" @mouseup="blueBgUp">
            <canvas id="canvas" :width="canvasWidth" height="80" @mousemove="showMoveImg"></canvas>
            <div class="signcircle" v-for="(item,index) in makeSignList" :key="index" :style="`left:${item.left}`" @click="signClick(item,index)"></div>
            <div class="blueBg" id="blueBg" ref="timeMove" @mousedown="blueBgDown" @mousemove="blueBgMove" @mouseup="blueBgUp">
              {{timeCurrentLeft}}
              <span class="turnDowm"></span>
            </div>
          </div>
            <table class="table table-striped" id="table" ref="table">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Object </th>
                  <th scope="col">Bounds </th>
                  <th scope="col">Start </th>
                  <th scope="col">End </th>
                  <th scope="col"> </th>
                </tr>
              </thead>
              <tbody id=table-body v-for="boundingBox in boundingBoxes" :key="boundingBox.row" :row="boundingBox.row">
                <tr ref="row-key" class="row-unsaved">
                  <th scope='row'>{{ boundingBox.row }}</th>
                  <td ref="activity-key">
                    <input ref="text-input-key" class="activity" type="text" :value="`Object ${boundingBox.row}`">
                  </td>
                  <td class="bounds">
                    ({{ boundingBox.x1 }},{{ boundingBox.y1 }}),
                    ({{ parseFloat(boundingBox.x2)+parseFloat(boundingBox.x1) }},{{ parseFloat(boundingBox.y2)+parseFloat(boundingBox.y1) }})
                  </td>
                  <td ref="starttime-key">{{ boundingBox.start }}</td>
                  <td ref="endtime-key">{{ boundingBox.end }}</td>
                  <td ref="button-key">
                    <button class="btn btn-dark btn-sm" @click="updateButton(`${boundingBox.row}`, $event)">
                      Save
                    </button>
                    <br><br>
                    <button class="btn btn-dark btn-sm" @click="deleteButton(`${boundingBox.row}`, $event)">
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>
    </footer>

  </div>
</template>

<script>
import excel from '@/libs/excel'
import axios from 'axios'
let videoWidth = 0;
let videoHeight = 0;


export default {
  name: 'upload-excel',
  data () {
    return {
      uploadLoading: false,
      progressPercent: 0,
      showProgress: false,
      showRemoveFile: false,
      file: null,
      index: null,
      dialogVisible: false, 
  
      topMoveBox: null, 
      number: 5, 
      maxTimeLong: 360000, 
      videoLongTime: "00:00:00",
      canvas: null,
      canvasWidth: 60000,
      cxt: null,
      clickmsg: "Point", 
      config: {},
      timeCurrentLeft: "00:00:00:00", 

      timeId: null, 
      clickIn: null, 
      scrollId: null, 
      subTimeId: null, 

      subPlayValue: null, 
      moveLeft: -40, 
      cutCoverList: [], 
      makeSignList: [], 
      coverBoxWidth: "0px",
      clickCurrentLeft: null, 
      videoLong: 600,
      imgWidth: "0px", 
      pickeddeng: null,
      bofangFlag: true, 
      signFlag: false, 
      scrollFlag: false, 
      target: 1400, 

      currentRunMsg: "run",

      blueBgFlag:false,
      timeMoveNumber:0,
      
      //TEST
      isClicked: false,
      boundingBoxes: [],
      bounds: {
        'row': 0,
        'bounds': '',
        'start': '',
        'end': '',
        'x1': 0,
        'y1': 0,
        'x2': 0,
        'y2': 0
      },
      canvasMouseDown: false,
      currentX: 0,
      currentY: 0,
      index: 0
    }
  },

  created() {
    this.Event.$on("allTime", data => {
      this.videoLongTime = this.setTime(data);
      console.log("original time len:, transfered time len: ", data, this.videoLongTime)
      this.videoLong = data;

      this.maxTimeLong = Math.ceil(data) * 100;
      this.imgWidth = (this.videoLong / this.number) * 100 + "px"; //Thumbnail len matches with video length
      this.target = parseFloat(this.imgWidth) - 40;  //parses a string and returns a floating point number.
      console.log("imgWidth, target: ", this.imgWidth, this.target)
    });
    this.setKeydown()
    
    //show the vido time length on canvas
    this.$nextTick(() => {
      var vedio = document.getElementById("myVideo");
      var that = this;
      vedio.oncanplay = function() {
        that.Event.$emit("allTime", vedio.duration);
      };
    });
    
    // next frame, previous frame button would trigger
    this.Event.$on("currentTime", time => {
      var x = document.getElementById("myVideo");
      x.currentTime = String(this.formDataTime(time))
      console.log("created time: ", x.currentTime)
    });
  },

  mounted () {
    var canvas = document.getElementById("canvas");
    this.canvas = canvas;
    var cxt = canvas.getContext("2d");
    cxt.fillStyle = "#fff";
    this.cxt = cxt;
    var config = {
      height: 200,
      width: this.canvasWidth,
      size: 300, // 刻度尺总刻度数
      x: 20, // 刻度尺x坐标位置
      y: 70, // 刻度尺y坐标位置
      w: 10, // 刻度线的间隔
      h: 10, // 刻度线基础长度
      // 事件相关
      mousedown: false
    };
    this.config = config;
    this.showCanvas();
    //cause problem after running through the current bar length if deleted
    const timeMove = document.getElementsByClassName("blueBg")[0];
    this.topMoveBox = timeMove;
    timeMove.style.left = "-40px";
    this.pickeddeng = document.getElementById("pickeddeng")
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
    
    // Draw the control bar
    showCanvas() {
      var that = this;
      this.drawCan(this.cxt, this.config, that.number);
    },

    drawCan(cxt, config, number) {
      var size = 36000; //size/10则生成多少个刻度
      var x = config.x || 0;
      var y = config.y || 0;
      var w = config.w || 5;
      var h = config.h || 10;
      var offset = 3; // 上面数字的偏移量
      cxt.clearRect(0, 0, config.width, config.height);
  
      cxt.strokeStyle = "#fff";
      cxt.lineWidth = 1;
      cxt.font = 12;

      for (var i = 0; i <= size; i++) {
        cxt.beginPath(); 
        cxt.moveTo(x + i * w, y); 
    
        if (i % 10 == 0 && this.number == 5) {
          offset = 20;
          cxt.fillText(this.setTime(i / 2), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }
        else {
          cxt.lineTo(x + i * w, y - (i % 5 === 0 ? 1.5 : 1) * h);
        }
        cxt.stroke();
      }
    },

    //draw the video on the canvas
    drawCanvas: function (v, c) {
      c.drawImage(v, 0, 0, videoWidth, videoHeight);
      if (1) {
        c.beginPath();
        c.lineWidth = "4";
        c.strokeStyle = "red";
        c.rect(parseFloat(this.bounds['x1']),
               parseFloat(this.bounds['y1']),
               parseFloat(this.bounds['x2']),
               parseFloat(this.bounds['y2']));
        c.stroke();
      }
      setTimeout(this.drawCanvas, 30, v, c);
    },

    setupCanvas: function (video) {
      var canvas = this.$refs.myCanvas;
      var context = canvas.getContext('2d');
      let setWidthHeight = function () {
        videoWidth = parseFloat(video.videoWidth);
        videoHeight = parseFloat(video.videoHeight);
        canvas.width = Math.floor(videoWidth);
        canvas.height = Math.floor(videoHeight);
      }
      video.onloadedmetadata = function() {
        setWidthHeight();
      }
      this.drawCanvas(video,context);
    },

    handleBeforeUpload (file) {
      const fileExt = file.name.split('.').pop().toLocaleLowerCase()
      if (fileExt === 'mp4' || fileExt === 'webm') {
        console.log("start to read file!!!")
        this.uploadLoading = false
        this.showRemoveFile = true
        this.file = file
        // Ready to play the video after uploading
        var video = document.getElementById('myVideo');
        const source = URL.createObjectURL(this.file)
        video.src = source
        console.log(video.src)
        this.setupCanvas(video);

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
      this.$Message.info('File has been uploaded!')
    },
    
    //the blue triangle dictator mouse control
    blueBgDown(){
      this.stop();
      this.blueBgFlag = true;
      console.log("blue dictator mouse down**************")
    },

    blueBgMove(e){
      if(!this.blueBgFlag){
        return;
      }
      var pickeddeng = document.getElementById("pickeddeng");
      var finleft = pickeddeng.scrollLeft + e.pageX - 40;
  
      if(finleft>(parseFloat(this.imgWidth)-40) || finleft < -40){
        this.stop();
        this.$message.error("Exceed Limitation")
        return
      }
      document.getElementById("blueBg").style.left = finleft +  "px";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor(
              (this.number / 100) * (this.topMoveBox.offsetLeft + 40) * 100
            ) / 100
          ).toFixed(2)
        );
        this.Event.$emit("currentTime", this.timeCurrentLeft);
    },
    
    blueBgUp(){
      this.blueBgFlag = false;
       console.log("blue dictator mouse up@@@@@@@@@@@@@@@@@@@@")
    },

    //set the current time 
    showMoveImg($event) {
      var currentTime = this.setDetailTime(
        ($event.offsetX - 20) * (this.number / 100)
      );
    },
    
    //canvas mouse movement 
    canvasHover: function (e) {
      this.evaluateBounds(e);
    },

    canvasDown: function (e) {
      this.canvasMouseDown = true;
      this.evaluateBounds(e);
      this.bounds['x1'] = this.currentX;
      this.bounds['y1'] = this.currentY;
      this.evaluateBounds(e);
      this.updateBounds();
    },

    canvasUp: async function (e) {
      this.canvasMouseDown = false;
      this.bounds['x2'] = (this.currentX - this.bounds['x1']).toFixed(4);
      this.bounds['y2'] = (this.currentY - this.bounds['y1']).toFixed(4);
      this.bounds['x1'] = this.bounds['x1'].toFixed(4);
      this.bounds['y1'] = this.bounds['y1'].toFixed(4);

      var time = this.$refs.myVideo.currentTime;

      // time = this.roundToNearest(time, this.currentSPF).toFixed(4);
      time = this.roundToNearest(time, 1/30).toFixed(4);
      this.bounds['start'] = time

      var nrows = table.rows.length;
      this.bounds['row'] = nrows

      this.boundingBoxes.push(Object.assign({}, this.bounds));
    },

    evaluateBounds: function (e) {
      if (this.canvasMouseDown) {
        var pos = this.getMousePosition(e);
        this.currentX = pos.x;
        this.currentY = pos.y;
        //setTimeout(this.updateBounds,50,e);
      }
    },

    updateBounds: function () {
      this.bounds['x2'] = this.currentX - this.bounds['x1'];
      this.bounds['y2'] = this.currentY - this.bounds['y1'];
      if (this.canvasMouseDown) {
        setTimeout(this.updateBounds, 10)
      }
    },

    roundToNearest: function (value, interval) {
      return Math.round(value/interval) * interval;
    },

    getMousePosition: function (e) {
      var canvasBounds = this.$refs.myCanvas.getBoundingClientRect();
      var rect = myCanvas.getBoundingClientRect(), 
      scaleX = myCanvas.width / rect.width,    
      scaleY = myCanvas.height / rect.height;  
      return {
        x: (e.clientX - rect.left) * scaleX,   
        y: (e.clientY - rect.top) * scaleY    
      }
    },
    
    // play the video on the canvas
    play () {
      this.bofangFlag = false;
      var vedio = document.getElementById("myVideo");
      var canvas = document.getElementById('myCanvas');
      var ctx = canvas.getContext('2d');
      vedio.play(); 

      const timeMove = document.getElementsByClassName("blueBg")[0];
      timeMove.style.left = this.target + "px";

      this.timeId = setInterval(() => {
        this.moveLeft = window.getComputedStyle(timeMove).left;
        this.timeMoveNumber = parseInt(parseInt(this.moveLeft)/1600)
        if (parseFloat(this.moveLeft) / 1400 > this.countNumber) {
          this.countNumber = parseInt(parseFloat(this.moveLeft) / 1400) + 1;
        }
        if (parseFloat(this.moveLeft) + 40 > parseFloat(this.imgWidth)) {
          clearInterval(this.timeId);
          timeMove.style.left = this.moveLeft;
          this.stop();
          timeMove.style.transition = "none";
        }
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
      }, 20);
      var pxecachS = this.number / 100; // 对应的每px所需要的秒
      var timeCount =
        (parseInt(this.target) - parseInt(this.moveLeft)) * pxecachS;
      timeMove.style.transition = `all ${timeCount}s linear`;
    },

    //pause
    stop() {
      // this.Event.$emit("paly", false); 
      var vedio = document.getElementById("myVideo");
      vedio.pause(); //pause
      this.bofangFlag = true; //play or pause mark
      const timeMove = document.getElementsByClassName("blueBg")[0];
      this.moveLeft = window.getComputedStyle(timeMove).left;
      console.log("timeMove ", timeMove)
      console.log("this.moveleft: ", this.moveLeft)
      timeMove.style.left = this.moveLeft;
      timeMove.style.transition = `none`;
      clearInterval(this.timeId);
      clearInterval(this.clickIn);
      clearInterval(this.subTimeId);
      clearInterval(this.scrollId);
    },

    //previous frame
    prevPage() {
      this.stop();
      const timeMove = document.getElementById("blueBg");
      var movePX = (100 / this.number / 100) * 10;
      var currentLeft = parseFloat(window.getComputedStyle(timeMove).left);
      if (currentLeft <= -40) {
        timeMove.style.left = "-40px";
        timeMove.style.transition = "none";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
        return;
      }
      var fininal = currentLeft - movePX;
      timeMove.style.left = fininal + "px";
      this.timeCurrentLeft = this.getStartEndTime(fininal + 40);
      this.Event.$emit("currentTime", this.timeCurrentLeft); 
    },

    // next frame
    nextpage() {
      this.stop();
      const timeMove = document.getElementById("blueBg");
      var movePX = (100 / this.number / 100) * 10;
      var currentLeft = parseFloat(window.getComputedStyle(timeMove).left);
      if (currentLeft >= parseFloat(this.imgWidth) - 40) {
        timeMove.style.left = parseFloat(this.imgWidth) - 40 + "px";
        timeMove.style.transition = "none";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
        return;
      }
      var fininal = currentLeft + movePX;
      timeMove.style.left = fininal + "px";
      this.timeCurrentLeft = this.getStartEndTime(fininal + 40);
      this.Event.$emit("currentTime", this.timeCurrentLeft);
    },

    // Get total secs
    getCountS(time) {
      var hour = time.split(":")[0];
      var min = time.split(":")[1];
      var s = time.split(".")[0].split(":")[2];
      var ms = time.split(".")[1];
      return parseFloat(
        parseInt(hour) * 3600 + parseInt(min * 60) + s + "." + ms
      );
    },

    setTime(time) {
      var secondTime = parseInt(time); // seconds
      var minuteTime = 0; // mins
      var hourTime = 0; // hours
      if (secondTime > 60) {
        minuteTime = parseInt(secondTime / 60);
        secondTime = parseInt(secondTime % 60);
        if (minuteTime > 60) {
          hourTime = parseInt(minuteTime / 60);
          minuteTime = parseInt(minuteTime % 60);
        }
      }
      hourTime = hourTime < 10 ? String("0" + hourTime) : hourTime;
      minuteTime = minuteTime < 10 ? String("0" + minuteTime) : minuteTime;
      secondTime = secondTime < 10 ? String("0" + secondTime) : secondTime;
      return hourTime + ":" + minuteTime + ":" + secondTime;
    },

    setDetailTime(time) {
      // console.log(time)
      var detail = null;
      if (time % 1 == 0) {
        detail = "00";
      } else {
        detail = String(parseFloat(parseInt(time * 100) / 100)).split(".")[1]; // 秒
      }
      if (String(detail).length == 1) {
        detail = String(detail + "0");
      }
      var secondTime = parseInt(time);
      var minuteTime = 0; 
      var hourTime = 0; 
      if (secondTime >= 60) {
        minuteTime = parseInt(secondTime / 60);
        secondTime = parseInt(secondTime % 60);
        if (minuteTime >= 60) {
          hourTime = parseInt(minuteTime / 60);
          minuteTime = parseInt(minuteTime % 60);
        }
      }
      hourTime = hourTime < 10 ? String("0" + hourTime) : hourTime;
      minuteTime = minuteTime < 10 ? String("0" + minuteTime) : minuteTime;
      secondTime = secondTime < 10 ? String("0" + secondTime) : secondTime;
      return hourTime + ":" + minuteTime + ":" + secondTime + "." + detail;
    },

    timeMove() {
      const timeMove = document.getElementsByClassName("blueBg")[0];
      if (this.clickmsg == "END") {
        var currentBox = this.cutCoverList[this.cutCoverList.length - 1];
        var start = this.getCountS(currentBox.startTime);
        var end = this.getCountS(
          this.getStartEndTime(
            parseFloat(currentBox.left) + parseFloat(currentBox.width)
          )
        );
        if (end - start < 3) {
          this.$message.error("Cut at least 3 secs");
          this.clickmsg = "START";
          return;
        }
        currentBox.endTime = this.getStartEndTime(
          parseFloat(currentBox.left) + parseFloat(currentBox.width)
        );

        clearInterval(this.clickIn);
        this.currentRunMsg = "run";
        this.running();
      } else if (this.clickmsg == "START") {
        // this.bofangFlag = false;
        clearInterval(this.timeId);
        this.currentRunMsg = "clickIn";
        this.running();
        // return;
        var target = this.target;
        this.clickCurrentLeft = window.getComputedStyle(timeMove).left;
        this.$set(this.cutCoverList, this.cutCoverList.length, {
          clickFlag: true,
          text: "Section" + parseInt(parseInt(this.cutCoverList.length) + 1),
          left: parseFloat(this.clickCurrentLeft) + 40 + "px",
          width: "0px",
          startTime: this.getStartEndTime(
            parseFloat(this.clickCurrentLeft) + 40
          )
        });
      }
    },

    formDataTime(time){
      var h = time.split(":")[0];
      var m = time.split(":")[1];
      var s = time.split(":")[2];
      var ms = time.split(".")[1];
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + "." + ms;
    },

    getStartEndTime(leftPX) {
      return this.setDetailTime(
        parseFloat(
          Math.floor((this.number / 100) * leftPX * 100) / 100
        ).toFixed(2)
      );
    },

    setKeydown() {
      document.addEventListener("keydown", this.keyboardEvent);
    },
    removerKeydown() {
      document.removeEventListener("keydown", this.keyboardEvent);
    },
  },

  beforeDestroy() {
    this.pickeddeng.removeEventListener("scroll", this.handleScroll);
  },

  destroyed() {
    this.removerKeydown();
    // document.removeEventListener("keydown", this.keyboardEvent);
  },

  watch: {
    timeMoveNumber(val, old) {
      this.pickeddeng.scrollLeft = val * 1600
    },
    videoLong(val, old) {
      this.maxTimeLong = (Math.floor(val / this.number) + 1) * 10;
    },
    maxTimeLong(val, old) {
      this.showCanvas();
    },
    imgWidth(val, old) {
      this.target = parseFloat(val) - 40;
    },
    scrollFlag(val, old) {
      if (val) {
        // this.scrollInterval()
        // this.resetTarget()
      }
    }
  }

}
</script>

<style lang="less">
.autuSplice {
  .el-dialog {
    > div:nth-of-type(2) {
      text-align: center;
    }
    .el-radio-group {
      margin: 20px 0;
    }
  }
  .round {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -ms-flex-pack: distribute;
    justify-content: left;
    -ms-flex-wrap: nowrap;
    flex-wrap: nowrap;
    line-height: 40px;
    width: 300px;
    margin: 30px auto;
  }
}

footer {
  width: 100%;
  height: 250px;
  border-top: 2px solid #1d1e22;

  .menu {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: space-between;
    background: #1d1e22;
    .controlMenu {
      width: 670px;
      padding: 0 20px;
      display: flex;
      box-sizing: border-box;
      align-items: center;
      > div {
        height: 30px;
        margin-right: 20px;
        position: relative;
        font-size: 30px;
        color: #707070;
        cursor: pointer;
        white-space: nowrap;
        display: flex;
        align-items: center;
        &::after {
          content: "";
          display: block;
          width: 1px;
          height: 20px;
          position: absolute;
          top: 5px;
          right: -10px;
          background-color: #ccc;
        }
        &:hover {
          color: #fff;
        }
        span {
          font-size: 14px;
        }
      }
      .contorlBtn {
        margin: 0 0 0 20px;
        display: flex;
        &::after {
          width: 0;
        }
        button {
          color: #fff;
          border: 0;
        }
        button:nth-child(1) {
          background: -webkit-linear-gradient(
            #8164d0,
            #3d67cd
          ); /* Safari 5.1 - 6.0 */
          background: -o-linear-gradient(
            #8164d0,
            #3d67cd
          ); /* Opera 11.1 - 12.0 */
          background: -moz-linear-gradient(
            #8164d0,
            #3d67cd
          ); /* Firefox 3.6 - 15 */
          background: linear-gradient(#8164d0, #3d67cd); /* 标准的语法 */
          &:hover {
            background: -webkit-linear-gradient(
              #967fd7,
              #6282d5
            ); /* Safari 5.1 - 6.0 */
            background: -o-linear-gradient(
              #967fd7,
              #6282d5
            ); /* Opera 11.1 - 12.0 */
            background: -moz-linear-gradient(
              #967fd7,
              #6282d5
            ); /* Firefox 3.6 - 15 */
            background: linear-gradient(#967fd7, #6282d5); /* 标准的语法 */
          }
        }
        button:nth-child(2) {
          background: -webkit-linear-gradient(
            #fa9710,
            #ff5f1e
          ); /* Safari 5.1 - 6.0 */
          background: -o-linear-gradient(
            #fa9710,
            #ff5f1e
          ); /* Opera 11.1 - 12.0 */
          background: -moz-linear-gradient(
            #fa9710,
            #ff5f1e
          ); /* Firefox 3.6 - 15 */
          background: linear-gradient(#fa9710, #ff5f1e); /* 标准的语法 */
          &:hover {
            background: -webkit-linear-gradient(
              #fba83a,
              #ff7d45
            ); /* Safari 5.1 - 6.0 */
            background: -o-linear-gradient(
              #fba83a,
              #ff7d45
            ); /* Opera 11.1 - 12.0 */
            background: -moz-linear-gradient(
              #fba83a,
              #ff7d45
            ); /* Firefox 3.6 - 15 */
            background: linear-gradient(#fba83a, #ff7d45); /* 标准的语法 */
          }
        }
      }
    }
    .videoContorl {
      display: flex;
      color: #8c97b1;
      align-items: center;
      .timeLong {
        display: flex;
        justify-content: space-between;
        height: 30px;
        margin-right: 20px;
        em {
          font-style: normal;
          font-size: 16px;
          line-height: 30px;
          white-space: nowrap;
        }
        span {
          width: 100px;
          font-size: 18px;
          line-height: 30px;
          border: 1px solid #515257;
          border-radius: 10px;
          text-align: center;
        }
      }
      i {
        font-size: 25px;
        cursor: pointer;
        margin: 0 15px;
        &:hover {
          color: #f25915;
        }
      }
    }
    .rule {
      width: 390px;
      padding: 0 20px;
      display: flex;
      box-sizing: border-box;
      align-items: center;
      .el-slider {
        width: 150px;
      }
      > span {
        height: 30px;
        margin-right: 20px;
        position: relative;
        font-size: 22px;
        color: #707070;
        cursor: pointer;
        white-space: nowrap;
        display: flex;
        align-items: center;
        &:hover {
          color: #fff;
        }
        span {
          font-size: 14px;
        }
      }
    }
  }
  .controlLine {
    position: relative;
    width: 100%;
    height: calc(100% - 40px);
    background: #1d1e22;
    .signshowImg {
      width: 150px;
      height: 100px;
      background: #fff;
      position: absolute;
      top: -121px;
      z-index: 30;
      text-align: center;
      padding: 10px;
      transform: translateX(-50%);
      .text {
        font-size: 13px;
        color: #666;
      }
      > img {
        height: 80px;
        width: 100%;
      }
      .signDetail {
        width: 15px;
        height: 15px;
        color: #fff;
        background-color: #e92322;
        position: absolute;
        right: 10px;
        top: 10px;
        font-size: 13px;
        text-align: center;
        line-height: 15px;
        cursor: pointer;
      }
      .signClose {
        width: 15px;
        height: 15px;
        color: #fff;
        background-color: #e92322;
        position: absolute;
        right: 10px;
        top: 26px;
        font-size: 13px;
        text-align: center;
        line-height: 15px;
        cursor: pointer;
      }
    }
    .dyc {
      position: relative;
      overflow: auto;
      &::-webkit-scrollbar {
        height: 10px;
      }
      /*滚动条滑块*/
      &::-webkit-scrollbar-thumb {
        border-radius: 4px;
        box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.2);
        background: #535353;
        width: 30px;
      }
      /*滚动条轨道*/
      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 1px rgba(0, 0, 0, 0);
        border-radius: 10px;
        background: #ccc;
      }
      .canFa {
        position: relative;
        .signcircle {
          width: 8px;
          height: 8px;
          background: orange;
          border-radius: 50%;
          position: absolute;
          top: 60px;
          cursor: pointer;
        }
        // overflow: hidden;
      }
      .imgbackground {
        left: 20px;
        height: 100px;
        background-repeat: repeat !important;
        background-size: contain !important;
        background: url("../../assets/videoCut/demo.jpg");
        position: relative;
        // .coverlistActive {
        //   // border-left: 3px solid #
        // }
        .coverlist {
          background: rgba(23, 149, 255, 0.3);
          position: absolute;
          top: 0;
          height: 100px;
          display: flex;
          flex-wrap: nowrap;
          box-sizing: border-box;
          overflow: hidden;
          border: 1px solid;
          &:hover {
            border: 1px solid #ccc;
          }
          .dragLeft {
            width: 16px;
            height: 100px;
            line-height: 100px;
            color: #fff;
            font-size: 14px;
            position: absolute;
            left: 0px;
            cursor: e-resize;
            text-align: center;
          }
          .dragRight {
            text-align: center;
            width: 16px;
            height: 100px;
            line-height: 100px;
            color: #fff;
            font-size: 14px;
            position: absolute;
            right: 0px;
            cursor: w-resize;
          }

          > div {
            > div {
              font-size: 13px;
              color: #fff;
              cursor: pointer;
              width: 60px;
              margin: auto;
            }
            width: 100%;
            height: 100%;
            margin: 0 auto 0;
            padding:20px;
            box-sizing: border-box;
            text-align: center;
            // line-height: 50px;
            // display: flex;
            // flex-wrap: nowrap;
            // justify-content: center;
            overflow: hidden;
            span {
              color: #fff;
              font-size: 14px;
              cursor: pointer;
            }
          }
        }
      }
    }
    .blueBg {
      position: absolute;
      // height: 40px;
      cursor:move;
      box-sizing: content-box;
      text-align: center;
      line-height: 30px;
      width: 104.53px;
      padding: 0px 10px;
      border-radius: 5px;
      top: 0;
      left: -32px;
      // background: rgba(23, 149, 255);
      color: #fff;
    }
    .turnDowm {
      position: absolute;
      width: 0;
      height: 0;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      border-style: solid;
      border-width: 10px 5px 0 5px;
      border-color: #007bff transparent transparent transparent;
    }
    .block {
      width: 150px;
      margin: auto;
    }
  }
}
</style>



