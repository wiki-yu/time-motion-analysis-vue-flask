<template>
  <footer>
    <!-- Top level: menus -->
    <div class="menu">
      <div class="controlMenu">
        <div @click="onControl(1)" class="iconfont icon-dadian" :title="clickmsg">
          <span>{{clickmsg}}</span>
        </div>
        <div class="contorlBtn">
          <el-button class="el-icon-success" size="mini" @click="serveSubmit('00')">Sub Submmit</el-button>
          <el-button class="iconfont icon-tuisong" size="mini" @click="serveSubmit('01')">Merge Submmit</el-button>
        </div>
      </div>
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
      <div class="rule">
        <span class="iconfont icon-qingchu" title="Delete All Sections" @click="clearAllVideo"></span>
        <div class="block">
          <el-slider v-model="value2" :step="20" show-stops @change="stepChange"></el-slider>
        </div>
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
        <!-- background picture -->
        <div class="imgbackground" id="imgbackground" :style="`width:${imgWidth};`" @mousemove="faPKMove" @mouseup="faPKup">
          <div class="coverlist" v-for="(item,index) in cutCoverList" :key="index" :style="`width:${item.width};left:${item.left}`" @mouseup="pkLup">
            <el-button class="weitiaoL"> <span class="icon-zuo iconfont" @click="weitiao(index,1,1)"></span>Adjust<span class="icon-you iconfont" @click="weitiao(index,1,2)"></span></el-button>
            <span class="dragLeft icon-zuo iconfont" @mousedown="pkLdown(index,$event)"></span>
            <div>
              <span class="icon-bofang iconfont" @click="subSection(item)"></span>
              <!-- <span class="icon-qingchu iconfont" @click="clearCoverBox(index)"></span> -->
              <div>{{item.timeLong}}</div>
              <div class="icon-xiugai iconfont" @click="changeText(index)">{{item.text}}</div>
            </div>
            <span class="dragRight icon-you iconfont" @mousedown="pkRdown(index,$event)" @mouseup="pkRup"></span>
            <el-button class="weitiaoR"> <span class="icon-zuo iconfont" @click="weitiao(index,2,1)"></span>Adjust<span class="icon-you iconfont" @click="weitiao(index,2,2)"></span></el-button>
          </div>
        </div>
      </div>
    </div>
    <el-dialog :title="spliceMsg" :visible.sync="dialogVisible" width="600" append-to-body>
      <el-table :data="cutCoverList" style="width: 100%">
        <el-table-column label="Name" align="center" show-overflow-tooltip prop="text"></el-table-column>
        <el-table-column label="Start Time" align="center" show-overflow-tooltip prop="startTime"></el-table-column>
        <el-table-column label="End Time" align="center" show-overflow-tooltip prop="endTime"></el-table-column>
        <el-table-column label="Section Len" align="center" show-overflow-tooltip prop="timeLong"></el-table-column>
        <el-table-column label="Modify" align="center">
          <template slot-scope="scope">
            <el-button size="mini" @click="handleEdit(scope.$index, scope.row)">Edit</el-button>
            <el-button size="mini" @click="handleDelt(scope.$index, scope.row)">Delete</el-button>
          </template>
        </el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" @click="entureChaitiao">Confirm</el-button>
      </span>
    </el-dialog>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      // wenjianList: [], 
      turnFlag: "",
      index: null,
      tableData: [
        {
          timeLong: "3 Secs"
        },
        {
          timeLong: "4 Secs"
        }
      ],
      autoNum: 5,
      ctNum: 0, //剪辑的视频段落数量
      isCtData: false, //是否已剪辑了视频
      isVideoData: false, //是否已添加视频文件
      dialogVisible: false, //弹框显示隐藏

      // 自动拆条
      dialogVisibleAuto: false, //拆条flag
      radio: 1,

      videoList: null, //视频列表
      // dialogVisible: false,
      //   底部dyc
      topMoveBox: null, //移动的蓝色时间盒子
      number: 5, //刻度对应秒数
      maxTimeLong: 360000, //除以10 即为刻度尺 个 刻度
      videoLongTime: "00:00:00",
      value2: 80, //选择刻度尺刻度大小
      canvas: null,
      canvasWidth: 60000,
      cxt: null,
      clickmsg: "Point", //打入打出 START
      config: {},
      timeCurrentLeft: "00:00:00:00", //当前距离左侧时间
      clickCurrentTime: null, //点击距离

      timeId: null, //计算定时器
      clickIn: null, //打入定时器
      scrollId: null, //滚动定时器
      subTimeId: null, //分段播放移动计时器

      subPlayValue: null, //分段播放数据
      moveLeft: -40, //移动中bgleft坐标
      cutCoverList: [], //裁剪列表
      makeSignList: [], //标记列表
      coverBoxWidth: "0px",
      clickCurrentLeft: null, //点击打入时，距离左侧位置
      videoLong: 600,
      imgWidth: "0px", //图片的宽度
      pickeddeng: null,
      bofangFlag: true, //播放flag
      signFlag: false, //标记flag
      scrollFlag: false, //滚动标识
      target: 1400, //目标位置
      // 盒子拖拽部分
      downFlag: false, //按下的标志
      offsetStart: null,
      offsetEnd: null,
      currentRunMsg: "run",
      signIndex: null, //当前点击标记的index
      signLeft: "0px",
      signText: "Mark1",

      // 快速选段
      quickChoseTime: 6,

      mainImgUrl: "../../assets/videoCut/demo.jpg", //底部封面图
      mainFlag: false, //是否选择了视频
      numberFlag: "00", //00 拆分  01合并
      spliceMsg: "Sections Submit",
      countNumber: 1,
      firstCutVideo:{},//页面拆分相关数据
      blueBgFlag:false,
      timeMoveNumber:0,// 控制滚动数字
    };
  },

  created() {
    this.Event.$on("allTime", data => {
      console.log("Created() start!")
      console.log("video len: ", data); 
      this.videoLongTime = this.setTime(data);
      this.videoLong = data;
      this.maxTimeLong = Math.ceil(data) * 100;
      console.log("maxTimeLong: ", this.maxTimeLong)
      console.log("number: ", this.number)
      this.imgWidth = (this.videoLong / this.number) * 100 + "px"; //Thumbnail len matches with video length
      console.log("imgWidth: ", this.imgWidth)
      this.target = parseFloat(this.imgWidth) - 40;
      console.log("Created() over!")
    });
    this.setKeydown()
    console.log("setKeydown!")
  },

  mounted() {
    // 获取时间
    var canvas = document.getElementById("canvas");
    this.canvas = canvas;
    var cxt = canvas.getContext("2d");
    cxt.fillStyle = "#fff";
    this.cxt = cxt;
    var config = {
      height: 200,
      width: this.canvasWidth,
      // 刻度尺相关
      start: "00:00:00",
      end: "00:20:10",
      size: 300, // 刻度尺总刻度数
      // unit:10,
      x: 20, // 刻度尺x坐标位置
      y: 70, // 刻度尺y坐标位置
      w: 10, // 刻度线的间隔
      h: 10, // 刻度线基础长度
      // 事件相关
      mousedown: false
      // start: []
    };
    this.config = config;
    // this.config.width = this.canvasWidth
    this.showCanvas();
    // console.log(this.setTime(600));
    const timeMove = document.getElementsByClassName("blueBg")[0];
    this.topMoveBox = timeMove;
    // console.log(timeMove,timeMove.style.left)
    timeMove.style.left = "-40px";

    // 设置图片盒子宽度
    this.imgWidth = (this.videoLong / this.number) * 100 + "px";
    // this.pickeddeng = document.getElementById("pickeddeng");
    // this.pickeddeng.addEventListener("scroll", this.handleScroll, true);

    // 快速选段改变
    this.Event.$on("quickChooseTime", val => {
      this.quickChoseTime = val;
    });
    this.pickeddeng = document.getElementById("pickeddeng")
  },

  methods: {
    //微调
    weitiao(index,flag1,flag2){
      // flag1 1 为左边微调  2为右边微调
      // flag2 1 为向左微调  2为向右微调
      const currentCut = this.cutCoverList[index]
      // console.log(currentCut);
      const timeMove = document.getElementById("blueBg");
      // var movePX = (100 / this.number / 100) * 10;
      // var currentLeft = parseFloat(window.getComputedStyle(timeMove).left);
      var movePX = (100 / this.number / 100) * 10; //移动距离
      if(flag1 === 1){
        //移动时间轴  更新时间
        timeMove.style.left = (parseFloat(currentCut.left) - 40) + "px";
        var fininal = parseFloat(currentCut.left) - 40;
        this.timeCurrentLeft = this.getStartEndTime(fininal + 40);
        // this.Event.$emit("currentTime", this.timeCurrentLeft);
        
        //调整开始位置
        if(flag2===1){
          //开始位置向左调
          currentCut.left = (parseFloat(currentCut.left) - movePX) + "px";
          currentCut.width = (parseFloat(currentCut.width) + movePX) +"px";
          //修改拆条时长
          currentCut.startTime = this.getStartEndTime(
          parseFloat(currentCut.left)
          );
          currentCut.timeLong = this.getTimeBesides(
            currentCut.startTime,
            currentCut.endTime
          );
          this.prevPage()
        }else{
          //开始位置向右调
          currentCut.left = (parseFloat(currentCut.left) + movePX) + "px";
          currentCut.width = (parseFloat(currentCut.width) - movePX) +"px";
          currentCut.startTime = this.getStartEndTime(
          parseFloat(currentCut.left)
          );
          currentCut.timeLong = this.getTimeBesides(
            currentCut.startTime,
            currentCut.endTime
          );
          this.nextpage()
        }
      }else{
        // console.log(parseFloat(currentCut.left + currentCut.width - 40))
        // timeMove.style.left = parseFloat(currentCut.left + currentCut.width - 40) + "px";
        timeMove.style.left = (parseFloat(currentCut.left) + parseFloat(currentCut.width) - 40) + "px";
        var fininal = (parseFloat(currentCut.left) + parseFloat(currentCut.width) - 40);
        this.timeCurrentLeft = this.getStartEndTime(fininal + 40);
        this.Event.$emit("currentTime", this.timeCurrentLeft);
        //调整结束位置
        if(flag2===1){
          //结束位置向左调
          currentCut.width = (parseFloat(currentCut.width) - movePX) +"px";
          currentCut.endTime = this.getStartEndTime(
          parseFloat(currentCut.left) + parseFloat(currentCut.width)
          );
          currentCut.timeLong = this.getTimeBesides(
            currentCut.startTime,
            currentCut.endTime
          );
          this.prevPage()
        }else{
          //结束位置向右调
          currentCut.width = (parseFloat(currentCut.width) + movePX) +"px";
          currentCut.endTime = this.getStartEndTime(
          parseFloat(currentCut.left) + parseFloat(currentCut.width)
          );
          currentCut.timeLong = this.getTimeBesides(
            currentCut.startTime,
            currentCut.endTime
          );
          this.nextpage()
        }
      }
      
    },

    setKeydown() {
      document.addEventListener("keydown", this.keyboardEvent);
    },
    removerKeydown() {
      document.removeEventListener("keydown", this.keyboardEvent);
    },
    
    //时间进度条移动
    blueBgDown(){
      this.stop();
      this.blueBgFlag = true;
    },

    blueBgMove(e){
      if(!this.blueBgFlag){
        return;
      }
      var pickeddeng = document.getElementById("pickeddeng");
      var finleft = pickeddeng.scrollLeft + e.pageX - 40;
      // console.log(finleft)
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
    },
    handleNodeClick(data) {
      this.$store.commit("setparentId", data.id);
      this.$store.commit("setfileFirstDir", data.firstDir);
      this.$store.commit("setfileFL", data.fileFL);
      // console.log(this.$store.state.curVideo)
    },
    // pk
    faPKMove($event) {
      if (!this.downFlag) {
        return;
      }
      var pickeddeng = document.getElementById("pickeddeng");
      var currentBox = this.cutCoverList[this.index];
      var curWidth = parseFloat(currentBox.width);
      var curLeft = parseFloat(currentBox.left);
      var finleft = pickeddeng.scrollLeft + $event.pageX - 30;
      if(this.turnFlag == "left"){
        var finright = curLeft + curWidth;
        var finwidth = finright - finleft;
        currentBox.width = finwidth + "px";
        currentBox.left = finleft + "px";

        currentBox.startTime = this.getStartEndTime(
          parseFloat(currentBox.left)
        );
        currentBox.timeLong = this.getTimeBesides(
          currentBox.startTime,
          currentBox.endTime
        );
        this.topMoveBox.style.left = finleft - 40 + "px";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor(
              (this.number / 100) * (this.topMoveBox.offsetLeft + 40) * 100
            ) / 100
          ).toFixed(2)
        );
        this.Event.$emit("currentTime", this.timeCurrentLeft);

      }
      else if (this.turnFlag == "center") {
        // 设置左侧位置

        currentBox.left = finleft - 30 + "px";
        currentBox.startTime = this.getStartEndTime(
          parseFloat(currentBox.left)
        );
        currentBox.endTime = this.getStartEndTime(
          parseFloat(currentBox.left) + parseFloat(currentBox.width)
        );
        currentBox.timeLong = this.getTimeBesides(
          currentBox.startTime,
          currentBox.endTime
        );

        this.topMoveBox.style.left = finleft - 70 + "px";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor(
              (this.number / 100) * (this.topMoveBox.offsetLeft + 40) * 100
            ) / 100
          ).toFixed(2)
        );
        this.Event.$emit("currentTime", this.timeCurrentLeft);
      } else if (this.turnFlag == "right") {
        // 设置宽度
        var finwidth = finleft - curLeft + 30;
        // console.log(finwidth);
        currentBox.width = finwidth + "px";
        currentBox.endTime = this.getStartEndTime(
          parseFloat(currentBox.left) + parseFloat(currentBox.width)
        );
        currentBox.timeLong = this.getTimeBesides(
          currentBox.startTime,
          currentBox.endTime
        );
        this.topMoveBox.style.left =
          finwidth - 40 + parseFloat(currentBox.left) + "px";
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor(
              (this.number / 100) * (this.topMoveBox.offsetLeft + 40) * 100
            ) / 100
          ).toFixed(2)
        );
        this.Event.$emit("currentTime", this.timeCurrentLeft);
      }
    },

    faPKup() {
      this.downFlag = false;
    },

    pkLdown(index, $event) {
      this.index = index;
      this.turnFlag = "left";
      this.downFlag = true;
      this.stop();
    },

    pkCdown(index, $event) {
      this.index = index;
      this.turnFlag = "center";
      this.downFlag = true;
      this.stop();
    },

    pkRdown(index, $event) {
      this.index = index;
      this.turnFlag = "right";
      this.downFlag = true;
      this.stop()
    },

    pkLup() {
      this.downFlag = false;
    },

    pkRup() {
      this.downFlag = false;
    },

    // pk
    handleScroll() {
      // this.countNumber = this.pickeddeng.scrollLeft/1400 + 1;
    },

    //鼠标悬浮显示当前图片
    showMoveImg($event) {
      var currentTime = this.setDetailTime(
        ($event.offsetX - 20) * (this.number / 100)
      );
      this.Event.$emit("currentImg", currentTime);
      // console.log($event)
    },

    //Clease all the sections
    clearAllVideo() {
      this.$confirm("Delected all sections?", "INFO", {
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        type: "warning"
      })
        .then(() => {
          this.cutCoverList = [];
          this.$message({
            type: "success",
            message: "Deleted!"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Cancelled"
          });
        });
    },
    
    //delete rows in the table
    deleteRow(index, rows) {
      rows.splice(index, 1);
    },

    //add rows in the table
    addRow(index, rows) {
      this.$prompt("Set Section Time", "INFO", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        inputPattern: /^[0-9]*$/,
        inputErrorMessage: "Please Input Numbers"
      })
        .then(({ value }) => {
          rows.splice(index + 1, 0, {
            timeLong: value + "Sec"
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Cancel Input"
          });
        });
    },

    // edit section title
    handleEdit(index, row) {
      if(this.clickmsg === "END"){
          this.$message.error("Please set end point and then delete")
          return;
      }
      this.changeText(index);
    },

    handleDelt(index, row) {
      this.cutCoverList.splice(index, 1);
    },

    // play section
    subSection(value) {
      if(this.clickmsg === "END"){
          this.$message.error("Please set end point and then delete")
          return;
      }
      this.subPlayValue = value;
      this.Event.$emit("subSectionPlay", value);
      this.topMoveBox.style.left = parseFloat(value.left) - 40 + "px";
      this.subrunning(parseFloat(value.left) + parseFloat(value.width));
    },

    //modify section name
    changeText(index) {
      this.$prompt("Please input Section Title", "INFO", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel"
      })
        .then(({ value }) => {
          this.cutCoverList[index].text = value;
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Cancel Input"
          });
        });
    },

    // 删除单个覆盖盒子
    // clearCoverBox(index) {
    //   if(this.clickmsg === "END"){
    //       this.$message.error("Please set end point and then delete")
    //       return;
    //   }
    //   this.cutCoverList.splice(index, 1);
    // },

    // Play
    play() {
      if (this.currentRunMsg == "clickIn") {
        this.running();
        return;
      } else if (this.currentRunMsg == "subrunning") {
        this.running();
        return;
      }
      this.currentRunMsg = "run";
      this.running();
    },

    running() {
      // clearInterval(this.clickIn);
      // if (!this.mainFlag) {
      //   this.$message.error("No video selected~");
      //   return;
      // }
      this.bofangFlag = false;
      this.Event.$emit("paly", true); //播放视频
      if (this.currentRunMsg == "clickIn") {
        this.clickIninterval();
        return;
      } else if (this.currentRunMsg == "subrunning") {
        this.subrunning(
          parseFloat(this.subPlayValue.left) +
            parseFloat(this.subPlayValue.width)
        );
        return;
      }
      const timeMove = document.getElementsByClassName("blueBg")[0];
      // var target = this.target;
      timeMove.style.left = this.target + "px";

      this.timeId = setInterval(() => {
        this.moveLeft = window.getComputedStyle(timeMove).left;
        // console.log(this.moveLeft);
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
        // if (parseInt(this.moveLeft) >= this.target) {
        //   // this.scrollInterval();
        //   // this.target+=1400;
        //   // this.scrollFlag = true;
        // }
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
      }, 20);
      var pxecachS = this.number / 100; // 对应的每px所需要的秒
      // console.log(parseInt(target), parseInt(this.moveLeft), pxecachS);
      var timeCount =
        (parseInt(this.target) - parseInt(this.moveLeft)) * pxecachS;
      // console.log(timeCount);
      timeMove.style.transition = `all ${timeCount}s linear`;
    },

    subrunning(target) {
      this.stop();
      this.currentRunMsg = "subrunning";
      this.bofangFlag = false;
      const timeMove = document.getElementsByClassName("blueBg")[0];
      timeMove.style.left = target + "px";
      this.Event.$emit("paly", true); //播放视频
      this.subTimeId = setInterval(() => {
        console.log("subrunning");
        this.moveLeft = window.getComputedStyle(timeMove).left;
        this.timeMoveNumber = parseInt(parseInt(this.moveLeft)/1600)
        if (parseFloat(this.moveLeft) / 1400 > this.countNumber) {
          this.countNumber = parseInt(parseFloat(this.moveLeft) / 1400) + 1;
        }
        if (parseFloat(this.moveLeft) + 40 > target) {
          clearInterval(this.subTimeId);
          timeMove.style.left = this.moveLeft;
          this.stop();
          timeMove.style.transition = "none";
          clearInterval(this.subTimeId);
          this.currentRunMsg = "run";
        }
        if (parseInt(this.moveLeft) >= target) {
          // this.resetTarget();
        }
        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
      }, 20);
      var pxecachS = this.number / 100; // 对应的每px所需要的秒
      // console.log(parseInt(target), parseInt(this.moveLeft), pxecachS);
      var timeCount = (parseInt(target) - parseInt(this.moveLeft)) * pxecachS;
      // console.log(timeCount);
      timeMove.style.transition = `all ${timeCount}s linear`;
    },

    //pause
    stop() {
      this.Event.$emit("paly", false); //暂停视频
      this.bofangFlag = true;
      // this.zanting();
      const timeMove = document.getElementsByClassName("blueBg")[0];
      this.moveLeft = window.getComputedStyle(timeMove).left;
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
      this.Event.$emit("currentTime", this.timeCurrentLeft); //触发上一帧下一帧
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
    
    // 改变覆盖盒子大小
    changeCoverSize(index) {},
    // 打入计时器
    clickIninterval() {
    //   if (!this.mainFlag) {
    //     this.$message.error("您还没有选择视频~");
    //     return;
    //   }
      if (this.currentRunMsg == "run") {
        clearInterval(this.timeId);
      }
      this.currentRunMsg = "clickIn";
      const timeMove = document.getElementsByClassName("blueBg")[0];
      var target = this.target;
      this.clickIn = setInterval(() => {
        // console.log("clickIn");
        this.moveLeft = window.getComputedStyle(timeMove).left;

        this.timeMoveNumber = parseInt(parseInt(this.moveLeft)/1600)//赋值让底部滚动
        if (parseFloat(this.moveLeft) / 1400 > this.countNumber) {
          this.countNumber = parseInt(parseFloat(this.moveLeft) / 1400) + 1;
        }
        // console.log(this.moveLeft, this.imgWidth);
        if (parseFloat(this.moveLeft) + 40 >= parseFloat(this.imgWidth)) {
          clearInterval(this.clickIn);
          this.timeMove();
          this.clickmsg = "START";
          timeMove.style.left = this.moveLeft;
          timeMove.style.transition = "none";
          this.stop();
        }
        if (this.cutCoverList.length > 0) {
          var current = this.cutCoverList[this.cutCoverList.length - 1];
          var coverBoxWidth =
            parseFloat(this.moveLeft) - parseFloat(this.clickCurrentLeft + 40);

          current.width = coverBoxWidth + "px";
          current.timeLong = this.getStartEndTime(coverBoxWidth);
        }

        this.timeCurrentLeft = this.setDetailTime(
          parseFloat(
            Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );
      }, 10);
      var pxecachS = this.number / 100; // 对应的每px所需要的秒
      // console.log(parseInt(target), parseInt(this.moveLeft), pxecachS);
      var timeCount = (parseInt(target) - parseInt(this.moveLeft)) * pxecachS;
      // console.log(timeCount);
      timeMove.style.left = target + "px";
      timeMove.style.transition = `all ${timeCount}s linear`;
    },

    //改变刻度
    stepChange() {
      // 鼠标松开时触发
      // console.log(this.value2);
      var number = this.number;
      // var moveLeft = parseFloat(document.getElementById("blueBg").style.left);
      switch (this.value2) {
        case 0:
          this.number = 600;
          break;
        case 20:
          this.number = 120;
          break;
        case 40:
          this.number = 30;
          break;
        case 60:
          this.number = 10;
          break;
        case 80:
          this.number = 5;
          break;
        case 100:
          this.number = 1;
          break;
        default:
          break;
      }
      // 修改拆条宽度
      for (var i = 0; i < this.cutCoverList.length; i++) {
        this.cutCoverList[i].left =
          parseFloat(
            (number * parseFloat(this.cutCoverList[i].left)) / this.number
          ) + "px";
        this.cutCoverList[i].width =
          parseFloat(
            (number * parseFloat(this.cutCoverList[i].width)) / this.number
          ) + "px";
      }
      var moveBox = document.getElementById("blueBg");
      var moveBoxLeft = document.getElementById("blueBg").style.left
      moveBox.style.left =
        parseFloat(
          (number * parseFloat(moveBoxLeft)) / this.number
        ) + "px";
      this.timeCurrentLeft = this.setDetailTime(
        parseFloat(
          Math.floor(
            (this.number / 100) * (this.topMoveBox.offsetLeft + 40) * 100
          ) / 100
        ).toFixed(2)
      );
      this.showCanvas();
      this.imgWidth = (this.videoLong / this.number) * 100 + "px";
      this.stop();
    },

    // 获取总秒树
    getCountS(time) {
      var hour = time.split(":")[0];
      var min = time.split(":")[1];
      var s = time.split(".")[0].split(":")[2];
      var ms = time.split(".")[1];
      return parseFloat(
        parseInt(hour) * 3600 + parseInt(min * 60) + s + "." + ms
      );
    },

    showCanvas() {
      var that = this;
      this.drawCan(this.cxt, this.config, that.number);
      // 鼠标按下时 记录状态及位置
      this.canvas.addEventListener("dblclick", function(e) {
        var scrollpd = document.getElementById("pickeddeng");
        var scrollLeft = scrollpd.scrollLeft;

        if (e.offsetX > parseInt(scrollLeft) + 1400) {
          that.$message.error("Exceed maximum, please select the left postion~");
          return;
        }
        that.stop();
        that.clickCurrentTime = e.offsetX;
        var timeMove = document.getElementById("blueBg");
        timeMove.style.left = e.offsetX - 60 + "px";

        that.timeCurrentLeft = that.setDetailTime(
          parseFloat(
            Math.floor((that.number / 100) * (timeMove.offsetLeft + 40) * 100) /
              100
          ).toFixed(2)
        );

        that.config.mousedown = true;
        that.config.start = [e.offsetX, e.offsetY];
        that.bofangFlag = true;
        that.Event.$emit("currentTime", that.timeCurrentLeft);
        // console.log(e.offsetX, e.offsetY)
      });
      // 鼠标放开时 重置状态
      this.canvas.addEventListener("mouseup", function(e) {
        that.config.mousedown = false;
        that.config.x += e.offsetX - that.config.start[0];
        // console.log(that.config.x);
        if (that.config.x > 10) {
          that.config.x = 20;
          that.drawCan(that.cxt, that.config, that.number);
        }
      });
      // 鼠标划出canvas时 重置状态
      this.canvas.addEventListener("mouseout", function(e) {
        that.config.mousedown = false;
      });
      // 鼠标移动时 改变位置
      // this.canvas.addEventListener("mousemove", function(e) {
      //   // 如果鼠标左键被按下 可以拖动
      //   if (that.config.mousedown) {
      //     that.config.x += e.offsetX - that.config.start[0];
      //     console.log(e.offsetY);
      //     that.config.start = [e.offsetX, e.offsetY];
      //     that.drawCan(that.cxt, that.config, that.number);
      //   }
      // });
    },

    drawCan(cxt, config, number) {
      var size = 36000; //size/10则生成多少个刻度
      var x = config.x || 0;
      var y = config.y || 0;
      var w = config.w || 5;
      var h = config.h || 10;
      var offset = 3; // 上面数字的偏移量
      // 画之前清空画布
      cxt.clearRect(0, 0, config.width, config.height);
      // 设置画笔属性
      cxt.strokeStyle = "#fff";
      cxt.lineWidth = 1;
      cxt.font = 12;
      // console.log(size);
      for (var i = 0; i <= size; i++) {
        // 开始一条路径
        cxt.beginPath();
        // 移动到指定位置
        cxt.moveTo(x + i * w, y);
        // 满10刻度时刻度线长一些 并且在上方表明刻度
        if (i % 10 == 0 && this.number == 1) {
          // 区间为 1 s
          offset = 20;
          cxt.fillText(this.setTime(i / 10), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }

        if (i % 10 == 0 && this.number == 5) {
          // 区间为 5 s
          offset = 20;
          cxt.fillText(this.setTime(i / 2), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }
        if (i % 10 == 0 && this.number == 10) {
          // 区间为 10 s
          offset = 20;
          // console.log(i * number, x + i * w - offset, y - h * 2.5)
          // 按照第一个参数递增
          cxt.fillText(this.setTime(i), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }
        if (i % 10 == 0 && this.number == 30) {
          // 区间为 30 s
          offset = 20;
          cxt.fillText(this.setTime(i * 3), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }
        if (i % 10 == 0 && this.number == 120) {
          // 区间为 120 s
          offset = 20;
          cxt.fillText(this.setTime(i * 12), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        }
        if (i % 10 == 0 && this.number == 600) {
          // 区间为 600 s
          offset = 20;
          cxt.fillText(this.setTime(i * 60), x + i * w - offset, y - h * 2.5);
          cxt.lineTo(x + i * w, y - h * 2);
        } else {
          // 满5刻度时的刻度线略长于1刻度的
          cxt.lineTo(x + i * w, y - (i % 5 === 0 ? 1.5 : 1) * h);
        }

        // 画出路径
        cxt.stroke();
      }
    },

    //set video length
    setTime(time) {
      var secondTime = parseInt(time); // seconds
      var minuteTime = 0; // mins
      var hourTime = 0; // hours
      if (secondTime > 60) {
        //如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime > 60) {
          //获取小时，获取分钟除以60，得到整数小时
          hourTime = parseInt(minuteTime / 60);
          //获取小时后取佘的分，获取分钟除以60取佘的分
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
      var secondTime = parseInt(time); // 秒
      var minuteTime = 0; // 分
      var hourTime = 0; // 小时
      if (secondTime >= 60) {
        //如果秒数大于60，将秒数转换成整数
        //获取分钟，除以60取整数，得到整数分钟
        minuteTime = parseInt(secondTime / 60);
        //获取秒数，秒数取佘，得到整数秒数
        secondTime = parseInt(secondTime % 60);
        //如果分钟大于60，将分钟转换成小时
        if (minuteTime >= 60) {
          //获取小时，获取分钟除以60，得到整数小时
          hourTime = parseInt(minuteTime / 60);
          //获取小时后取佘的分，获取分钟除以60取佘的分
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
        // 添加结束时间
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
        // console.log(this.clickCurrentLeft)
        // 添加覆盖盒子
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
    // 点击控制线控件
    onControl(index) {
      switch (index) {
        case 1: //START
        //   if (!this.mainFlag) {
        //     this.$message.error("您还没有选择视频~");
        //     return;
        //   }
          this.timeMove();
          this.clickmsg = this.clickmsg == "START" ? "END" : "START";
          break;
        case 3: //快速选段
          const moveLeft = document.getElementById("blueBg");
          this.moveLeft = window.getComputedStyle(moveLeft).left;
          console.log(this.moveLeft);
          var width = (this.quickChoseTime / this.number) * 100 + "px";
          this.$set(this.cutCoverList, this.cutCoverList.length, {
            clickFlag: true,
            text: "Section" + parseInt(parseInt(this.cutCoverList.length) + 1),
            left: parseFloat(this.moveLeft) + 40 + "px",
            width: width,
            startTime: this.getStartEndTime(parseFloat(this.moveLeft) + 40),
            endTime: this.getStartEndTime(
              parseFloat(this.moveLeft) + 40 + parseFloat(width)
            ),
            timeLong: this.getStartEndTime(parseFloat(width))
          });
          moveLeft.style.left =
            parseFloat(this.moveLeft) + parseFloat(width) + "px";
          // 设置当前时间
          this.timeCurrentLeft = this.setDetailTime(
            parseFloat(
              Math.floor(
                (this.number / 100) * (moveLeft.offsetLeft + 40) * 100
              ) / 100
            ).toFixed(2)
          );
          break;
        case 4: //自动选段
          this.dialogVisibleAuto = true;
          break;
      }
    },

    getStartEndTime(leftPX) {
      return this.setDetailTime(
        parseFloat(
          Math.floor((this.number / 100) * leftPX * 100) / 100
        ).toFixed(2)
      );
    },

    entureChaitiao() {
      console.log("conform 111111")
      var curVideo = this.$store.state.curVideo;
      // console.log(this.$store.state.curVideo);
      var optionTimes = [];
      console.log("conform 22222222")
        for (var i = 0; i < this.cutCoverList.length; i++) {
          var Lstart = this.cutCoverList[i].startTime.split(".")[0];
          var Rstart = String(
            (parseInt(this.cutCoverList[i].startTime.split(".")[1]) / 100) *
              1000
          );
          var timeLone = null;
          var Lend = null;
          var Rend = null;
          if (this.cutCoverList[i].timeLong.length > 8) {
            Lend = this.cutCoverList[i].timeLong.split(".")[0];
            Rend = String(
              (parseInt(this.cutCoverList[i].timeLong.split(".")[1]) / 100) *
                1000
            );
            timeLone = Lend + "." + Rend;
          } else {
            Rend = this.cutCoverList[i].timeLong;
            timeLone = Rend;
          }

          optionTimes.push({
            fileName: this.cutCoverList[i].text,
            startTime: Lstart + "." + Rstart,
            endTime: timeLone
          });
        }
      console.log("conform 333333333333")
      // }
      // var curVideo = this.$store.state.curVideo;
      var data = {
        id: curVideo.id,
        fileMD5: curVideo.fileId,
        optionTimes: optionTimes, //起止时间
        optionType: this.numberFlag, //00拆分  01合并,
        fileFirstDir: curVideo.fileFirstDir,
        fileFL: curVideo.fileFL,
        parentId: curVideo.parentId,
        isSrcVideo: false,
        fileName: "Section1"
      };
      console.log(data);
      // return
    },

    serveSubmit(number) {
        this.dialogVisible = true;
    },

    submitOne() {
      if (this.cutCoverList.length == 0) {
        this.$message.error("Have not splited");
        return;
      }
      this.$confirm("Merge the videos to Submmit?", "INFO", {
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        type: "info"
      })
        .then(() => {
          this.entureChaitiao("01");
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "Cancelled"
          });
        });
    },

    // 获取时间间隔
    getTimeBesides(str1, str2) {
      var time1 = str1.split(".")[0].split(":");
      var time2 = str2.split(".")[0].split(":");
      var hour1 = parseInt(time1[0]) * 3600;
      var min1 = parseInt(time1[1]) * 60;
      var second1 = parseInt(time1[2]);

      var hour2 = parseInt(time2[0]) * 3600;
      var min2 = parseInt(time2[1]) * 60;
      var second2 = parseInt(time2[2]);

      var timeall1 = hour1 + min1 + second1;
      var timeall2 = hour2 + min2 + second2;

      var between = timeall2 - timeall1;
      var lessHour =
        parseInt(between / 3600) >= 10
          ? parseInt(between / 3600)
          : "0" + parseInt(between / 3600);
      var lessMin =
        parseInt((between % 3600) / 60) >= 10
          ? parseInt((between % 3600) / 60)
          : "0" + parseInt((between % 3600) / 60);
      var lessSecond =
        parseInt(between % 60) >= 10
          ? parseInt(between % 60)
          : "0" + parseInt(between % 60);
          // console.log(str1)
          // console.log(str2)
      var msStart =  parseInt(str1.split(".")[1]);
      var msEnd =  parseInt(str2.split( ".")[1]);
      // console.log(msStart,msEnd)

      var ms = msEnd-msStart;
      if(msStart > msEnd){
        if(parseInt(lessSecond)<10){
          lessSecond = "0"+String(parseInt(lessSecond)-1)
        }else{
          lessSecond = String(parseInt(lessSecond)-1)
        }
      }
      if(ms<0){
        ms = ms+100
      }
      if(ms<10){
        ms = "0" + ms
      }
      return `${lessHour}:${lessMin}:${lessSecond}.${ms}`;
    },

    // 回到起点
    backTostart() {
      this.stop();
      this.Event.$emit("currentTime", this.timeCurrentLeft);
      const timeMove = document.getElementById("blueBg");
      const scrollpd = document.getElementById("pickeddeng");
      scrollpd.scrollLeft = 0;
      timeMove.style.left = "-40px";
      timeMove.style.transition = "none";
      this.timeCurrentLeft = this.setDetailTime(
        parseFloat(
          Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
            100
        ).toFixed(2)
      );
    },

    //回到尾部
    backToend() {
      this.stop();
      this.Event.$emit("currentTime", this.timeCurrentLeft);
      const timeMove = document.getElementById("blueBg");
      const scrollpd = document.getElementById("pickeddeng");
      if (parseInt(this.imgWidth) > 1400) {
        scrollpd.scrollLeft = parseInt(this.imgWidth) - 1400;
      } else {
        scrollpd.scrollLeft = 0;
      }
      timeMove.style.left = parseFloat(this.imgWidth) - 40 + "px";
      timeMove.style.transition = "none";
      this.timeCurrentLeft = this.setDetailTime(
        parseFloat(
          Math.floor((this.number / 100) * (timeMove.offsetLeft + 40) * 100) /
            100
        ).toFixed(2)
      );
    }
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
};
</script>

<style lang="less">
.weitiaoL,.weitiaoR{
    line-height: 0 !important;
    text-align: center;
    position: absolute;
    width: 70px;
    top: 0px;
    height: 20px;
    cursor: pointer;
    padding: 0;
    border: 0;
    z-index: 999;
    color: #666;
    >span{
        margin-left: -13px;
    }
  }
  .weitiaoL{
    
    left: 0;
  }
  .weitiaoR{
    right: 0;
  }
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

